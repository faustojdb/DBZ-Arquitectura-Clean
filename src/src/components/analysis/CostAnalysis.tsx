// src/components/analysis/CostAnalysis.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy, where, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { toast } from 'react-toastify';
import CategoryRow from './components/CategoryRow';
import AnalysisRow from './components/AnalysisRow';
import AnalysisContent from './components/AnalysisContent';
import CreateAnalysisForm from './components/CreateAnalysisForm';
import { AnalysisEditModal } from './components/AnalysisEditModal';
import RUBROS from './constants/rubros'; // Importar los 37 rubros
import './CostAnalysis.css';
import { compareAnalysisItems, compareAnalysisCodes } from './utils/sorting';

const CostAnalysis = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState(null);
  const [materials, setMaterials] = useState([]);
  
  // Estados para gestionar categorías expandidas
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loadingCategories, setLoadingCategories] = useState({});
  const [loadingAnalyses, setLoadingAnalyses] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [groupedAnalyses, setGroupedAnalyses] = useState({});
  
  // Estados para el modal de edición
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [analysisToEdit, setAnalysisToEdit] = useState(null);
  
  // Transformar RUBROS en un array para iterar
  const rubrosArray = Object.values(RUBROS).map(rubro => ({
    id: String(rubro.id),
    rubroId: rubro.id,
    name: rubro.nombre,
    minCode: String(rubro.id).padStart(2, '0'),
    maxCode: String(rubro.id + 1).padStart(2, '0'),
    color: getColorForRubro(rubro.id)
  }));
  
  // Función auxiliar para asignar colores a los rubros
  function getColorForRubro(id) {
    // Colores alternados para los rubros para mejor distinción visual
    const colors = [
      '#4CAF50', '#2196F3', '#F44336', '#FF9800', '#9C27B0', 
      '#00BCD4', '#795548', '#607D8B', '#E91E63', '#CDDC39'
    ];
    
    return colors[id % colors.length];
  }
  
  // Cargar todos los materiales al inicio
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        console.log("Cargando materiales para análisis...");
        setLoading(true);
        
        const materialsRef = collection(db, 'items');
        const querySnapshot = await getDocs(materialsRef);
        
        const materialsList = [];
        querySnapshot.forEach((doc) => {
          materialsList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`Se cargaron ${materialsList.length} materiales exitosamente.`);
        setMaterials(materialsList);
      } catch (err) {
        console.error("Error al cargar materiales:", err);
        toast.error(`Error al cargar materiales: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);
  
  // Cargar todos los análisis
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        setLoading(true);
        
        const analysesRef = collection(db, 'analisis');
        const querySnapshot = await getDocs(analysesRef);
        
        const analysesList = [];
        querySnapshot.forEach((doc) => {
          analysesList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Ordenar usando la función de comparación mejorada
        analysesList.sort(compareAnalysisItems);
        
        setAnalyses(analysesList);
        
        // Agrupar por rubro usando el campo indice.mayor
        const grouped = {};
        
        // Inicializar todos los rubros (incluso los vacíos)
        rubrosArray.forEach(rubro => {
          grouped[rubro.id] = [];
        });
        
        // Asignar análisis a cada rubro
        analysesList.forEach(analysis => {
          // Usar el mayor directamente desde el objeto indice si existe
          const rubroId = analysis.indice?.mayor || 
                          // Fallback: extraer del codigoDisplay
                          parseInt(analysis.codigoDisplay?.split('.')[0] || "0", 10);
          
          // Convertir a string para usar como clave en el objeto grouped
          const rubroIdStr = String(rubroId);
          
          // Si el rubro existe en nuestro array de rubros
          if (grouped[rubroIdStr]) {
            grouped[rubroIdStr].push(analysis);
          } else {
            // Si no existe, poner en "Otros" (37)
            if (!grouped["37"]) {
              grouped["37"] = [];
            }
            grouped["37"].push(analysis);
          }
        });
        
        // Ordenar los análisis dentro de cada grupo
        Object.keys(grouped).forEach(rubroId => {
          grouped[rubroId].sort(compareAnalysisItems);
        });
        
        setGroupedAnalyses(grouped);
      } catch (err) {
        console.error("Error al cargar análisis:", err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  // Función para alternar la expansión de una categoría
  const toggleCategory = useCallback((categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);

  // Función mejorada para expandir un análisis y cargar sus detalles incluyendo materiales
  const toggleAnalysis = useCallback(async (id) => {
    if (expandedAnalysis === id) {
      setExpandedAnalysis(null);
      return;
    }
    
    try {
      setLoadingAnalyses(prev => ({ ...prev, [id]: true }));
      
      // Obtener análisis completo con insumos
      const analysisRef = doc(db, 'analisis', id);
      const docSnap = await getDoc(analysisRef);
      
      if (docSnap.exists()) {
        const analysisData = docSnap.data();
        const insumos = analysisData.insumos || {};
        
        // Cargar materiales para cada insumo
        const insumosProcessed = { ...insumos };
        
        // Para cada insumo, carga el material si es necesario
        for (const key in insumosProcessed) {
          const insumo = insumosProcessed[key];
          const materialId = insumo.item_id || insumo.materialId;
          
          if (materialId) {
            // Buscar en los materiales ya cargados
            const matchingMaterial = materials.find(mat => mat.id === materialId);
            
            if (matchingMaterial) {
              // Asocia el material directamente al insumo
              insumosProcessed[key].item = matchingMaterial;
              console.log(`Material encontrado en caché: ${materialId}`, matchingMaterial.descripcion);
            } else {
              // Si no lo encontramos en memoria, intentar cargarlo de la base de datos
              console.log(`Material no encontrado en caché: ${materialId}, intentando cargar...`);
              try {
                const materialRef = doc(db, 'items', materialId);
                const materialSnap = await getDoc(materialRef);
                
                if (materialSnap.exists()) {
                  const materialData = materialSnap.data();
                  insumosProcessed[key].item = {
                    id: materialSnap.id,
                    ...materialData
                  };
                  console.log(`Material cargado desde Firestore: ${materialId}`, materialData.descripcion);
                } else {
                  // Crear un objeto placeholder para evitar errores
                  insumosProcessed[key].item = {
                    id: materialId,
                    descripcion: `Material ID: ${materialId} (no encontrado)`,
                    precio_unitario: insumo.precio_unitario || 0,
                    unidad: insumo.unidad || '-'
                  };
                  console.warn(`Material no encontrado en Firestore: ${materialId}`);
                }
              } catch (error) {
                console.error(`Error al cargar material: ${materialId}`, error);
                insumosProcessed[key].item = {
                  id: materialId,
                  descripcion: `Error al cargar material: ${materialId}`,
                  precio_unitario: insumo.precio_unitario || 0,
                  unidad: insumo.unidad || '-'
                };
              }
            }
          } else {
            console.warn(`Insumo sin ID de material: ${key}`);
            insumosProcessed[key].item = {
              id: 'unknown',
              descripcion: 'Material sin ID',
              precio_unitario: insumo.precio_unitario || 0,
              unidad: insumo.unidad || '-'
            };
          }
        }
        
        // Actualizar el análisis con los insumos procesados
        const updatedAnalysis = {
          id: docSnap.id,
          ...analysisData,
          insumos: insumosProcessed
        };
        
        setExpandedAnalysis(id);
        
        // Actualizar el análisis en la lista local con datos completos
        const updatedAnalyses = analyses.map(a => 
          a.id === id ? updatedAnalysis : a
        );
        
        setAnalyses(updatedAnalyses);
        
        // También actualizar en el agrupado
        const updatedGrouped = { ...groupedAnalyses };
        for (const categoryId in updatedGrouped) {
          updatedGrouped[categoryId] = updatedGrouped[categoryId].map(a => 
            a.id === id ? updatedAnalysis : a
          );
        }
        setGroupedAnalyses(updatedGrouped);

        console.log(`Análisis ${id} expandido con éxito. Insumos procesados:`, Object.keys(insumosProcessed).length);
      } else {
        console.error(`No se encontró el análisis con ID: ${id}`);
        toast.error(`No se encontró el análisis con ID: ${id}`);
      }
    } catch (err) {
      console.error("Error al expandir análisis:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoadingAnalyses(prev => ({ ...prev, [id]: false }));
    }
  }, [expandedAnalysis, analyses, groupedAnalyses, materials, db]);

  // Formatear fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return '-';
    }
  };

  // Función para abrir el modal de edición
  const handleOpenEditModal = (analysisId) => {
    // Encontrar el análisis en la lista
    const analysis = analyses.find(a => a.id === analysisId);
    if (analysis) {
      setAnalysisToEdit(analysis);
      setEditModalVisible(true);
    } else {
      toast.error("No se encontró el análisis para editar");
    }
  };

  // Función para guardar los cambios del análisis editado
  const handleSaveEditedAnalysis = async (updatedData) => {
    if (!analysisToEdit) return;
    
    try {
      setLoading(true);
      
      // Crear referencia al documento en Firestore
      const analysisRef = doc(db, 'analisis', analysisToEdit.id);
      
      // Actualizar los campos básicos
      await updateDoc(analysisRef, {
        ...updatedData,
        fecha_actualizacion: serverTimestamp()
      });
      
      // Actualizar en el estado local
      const updatedAnalyses = analyses.map(a => 
        a.id === analysisToEdit.id ? { ...a, ...updatedData } : a
      );
      setAnalyses(updatedAnalyses);
      
      // Actualizar en el agrupado
      const updatedGrouped = { ...groupedAnalyses };
      for (const categoryId in updatedGrouped) {
        updatedGrouped[categoryId] = updatedGrouped[categoryId].map(a => 
          a.id === analysisToEdit.id ? { ...a, ...updatedData } : a
        );
      }
      setGroupedAnalyses(updatedGrouped);
      
      toast.success("Análisis actualizado correctamente");
      
      // Cerrar modal
      setEditModalVisible(false);
      setAnalysisToEdit(null);
    } catch (err) {
      console.error("Error al actualizar análisis:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Editar un análisis
  const handleUpdateAnalysis = async (id, updatedData) => {
    try {
      setLoading(true);
      
      const analysisRef = doc(db, 'analisis', id);
      await updateDoc(analysisRef, updatedData);
      
      // Actualizar en estado local
      const updatedAnalyses = analyses.map(a => 
        a.id === id ? { ...a, ...updatedData } : a
      );
      setAnalyses(updatedAnalyses);
      
      // Actualizar en agrupado
      const updatedGrouped = { ...groupedAnalyses };
      for (const categoryId in updatedGrouped) {
        updatedGrouped[categoryId] = updatedGrouped[categoryId].map(a => 
          a.id === id ? { ...a, ...updatedData } : a
        );
      }
      setGroupedAnalyses(updatedGrouped);
      
      toast.success(`Análisis actualizado correctamente`);
    } catch (err) {
      console.error("Error al actualizar análisis:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setEditingAnalysis(null);
    }
  };

  // Eliminar un análisis
  const handleDeleteAnalysis = async (id) => {
    if (window.confirm(`¿Está seguro de que desea eliminar este análisis? Esta acción no se puede deshacer.`)) {
      try {
        setLoading(true);
        
        const analysisRef = doc(db, 'analisis', id);
        await deleteDoc(analysisRef);
        
        // Actualizar la lista local
        setAnalyses(analyses.filter(a => a.id !== id));
        
        // Actualizar agrupado
        const updatedGrouped = { ...groupedAnalyses };
        for (const categoryId in updatedGrouped) {
          updatedGrouped[categoryId] = updatedGrouped[categoryId].filter(a => a.id !== id);
        }
        setGroupedAnalyses(updatedGrouped);
        
        toast.success(`Análisis eliminado correctamente`);
      } catch (err) {
        console.error("Error al eliminar análisis:", err);
        toast.error(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Añadir un item a un análisis
  // Función para añadir un material a un análisis
const handleAddItem = async (analysisId, newItem) => {
  try {
    console.log(`Añadiendo item a análisis ${analysisId}`, newItem);
    
    // Obtener el análisis actual
    const analysisRef = doc(db, 'analisis', analysisId);
    const docSnap = await getDoc(analysisRef);
    
    if (!docSnap.exists()) {
      throw new Error(`No se encontró el análisis con ID ${analysisId}`);
    }
    
    const analysisData = docSnap.data();
    
    // Crear una copia de los insumos existentes o inicializar si no existen
    const insumos = { ...(analysisData.insumos || {}) };
    
    // Generar una nueva clave para el insumo
    const newKey = `INS${String(Object.keys(insumos).length + 1).padStart(3, '0')}`;
    
    // Asegurarse de que todos los campos estén correctamente definidos
    const itemToAdd = {
      item_id: newItem.item_id,
      cantidad: parseFloat(newItem.cantidad) || 1,
      coeficiente: parseFloat(newItem.coeficiente) || 1,
      unidad: newItem.unidad || "",
      precio_unitario: parseFloat(newItem.precio_unitario) || 0,
      subtotal: (parseFloat(newItem.cantidad) || 1) * 
                (parseFloat(newItem.coeficiente) || 1) * 
                (parseFloat(newItem.precio_unitario) || 0)
    };
    
    // Añadir el nuevo insumo
    insumos[newKey] = itemToAdd;
    
    // Calcular el nuevo costo total
    const costo_total = Object.values(insumos).reduce((sum, insumo) => 
      sum + (insumo.subtotal || 0), 0
    );
    
    // Crear el objeto de actualización
    const updateData = {
      insumos,
      costo_total,
      fecha_actualizacion: serverTimestamp()
    };
    
    // Mostrar datos antes de actualizar
    console.log("Actualizando análisis con datos:", updateData);
    
    // Actualizar en Firestore
    await updateDoc(analysisRef, updateData);
    
    // Actualizar el estado local
    const updatedAnalysis = {
      ...analysisData,
      id: analysisId,
      insumos,
      costo_total
    };
    
    // Actualizar análisis en la lista local
    setAnalyses(prevAnalyses => 
      prevAnalyses.map(a => a.id === analysisId ? updatedAnalysis : a)
    );
    
    // También actualizar en el estado agrupado
    setGroupedAnalyses(prevGrouped => {
      const newGrouped = { ...prevGrouped };
      
      // Recorrer todas las categorías y actualizar donde corresponda
      Object.keys(newGrouped).forEach(categoryId => {
        newGrouped[categoryId] = newGrouped[categoryId].map(a => 
          a.id === analysisId ? updatedAnalysis : a
        );
      });
      
      return newGrouped;
    });
    
    toast.success("Material agregado correctamente");
    console.log("Material agregado con éxito:", newItem.item_id);
    
    return true;
  } catch (err) {
    console.error("Error al añadir item:", err);
    toast.error(`Error: ${err.message}`);
    return false;
  }
};
  // Actualizar un item en un análisis
  const handleUpdateItem = async (analysisId, itemKey, updatedItem) => {
    try {
      setLoading(true);
      
      // Obtener el análisis actual
      const analysisRef = doc(db, 'analisis', analysisId);
      const docSnap = await getDoc(analysisRef);
      
      if (!docSnap.exists()) {
        throw new Error(`No se encontró el análisis con ID ${analysisId}`);
      }
      
      const analysisData = docSnap.data();
      const insumos = { ...analysisData.insumos } || {};
      
      // Actualizar el insumo específico
      insumos[itemKey] = {
        ...insumos[itemKey],
        ...updatedItem,
        // Asegurar que subtotal se calcule correctamente
        subtotal: updatedItem.cantidad * updatedItem.coeficiente * updatedItem.precio_unitario
      };
      
      // Calcular el nuevo costo total
      const costo_total = Object.values(insumos).reduce((sum, insumo) => 
        sum + (insumo.subtotal || 0), 0
      );
      
      // Actualizar en Firestore
      await updateDoc(analysisRef, {
        insumos,
        costo_total,
        fecha_actualizacion: serverTimestamp()
      });
      
      // Actualizar el estado local
      const updatedAnalysis = {
        ...analysisData,
        id: analysisId,
        insumos,
        costo_total
      };
      
      // Actualizar análisis en la lista
      const updatedAnalyses = analyses.map(a => 
        a.id === analysisId ? updatedAnalysis : a
      );
      setAnalyses(updatedAnalyses);
      
      // Actualizar en el agrupado
      const updatedGrouped = { ...groupedAnalyses };
      for (const categoryId in updatedGrouped) {
        updatedGrouped[categoryId] = updatedGrouped[categoryId].map(a => 
          a.id === analysisId ? updatedAnalysis : a
        );
      }
      setGroupedAnalyses(updatedGrouped);
      
      toast.success("Insumo actualizado correctamente");
    } catch (err) {
      console.error("Error al actualizar item:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setEditingItem(null);
    }
  };

  // Eliminar un item de un análisis
  const handleDeleteItem = async (analysisId, itemKey) => {
    try {
      if (!window.confirm("¿Está seguro de eliminar este insumo?")) {
        return;
      }
      
      setLoading(true);
      
      // Obtener el análisis actual
      const analysisRef = doc(db, 'analisis', analysisId);
      const docSnap = await getDoc(analysisRef);
      
      if (!docSnap.exists()) {
        throw new Error(`No se encontró el análisis con ID ${analysisId}`);
      }
      
      const analysisData = docSnap.data();
      const insumos = { ...analysisData.insumos } || {};
      
      // Si el insumo no existe, lanzar error
      if (!insumos[itemKey]) {
        throw new Error(`No se encontró el insumo ${itemKey}`);
      }
      
      // Guardar valor del subtotal antes de eliminar
      const subtotalEliminado = insumos[itemKey].subtotal || 0;
      
      // Eliminar el insumo
      delete insumos[itemKey];
      
      // Actualizar costo total
      const costo_total = (analysisData.costo_total || 0) - subtotalEliminado;
      
      // Actualizar en Firestore
      await updateDoc(analysisRef, {
        insumos,
        costo_total,
        fecha_actualizacion: serverTimestamp()
      });
      
      // Actualizar el estado local
      const updatedAnalysis = {
        ...analysisData,
        id: analysisId,
        insumos,
        costo_total
      };
      
      // Actualizar análisis en la lista
      const updatedAnalyses = analyses.map(a => 
        a.id === analysisId ? updatedAnalysis : a
      );
      setAnalyses(updatedAnalyses);
      
      // Actualizar en el agrupado
      const updatedGrouped = { ...groupedAnalyses };
      for (const categoryId in updatedGrouped) {
        updatedGrouped[categoryId] = updatedGrouped[categoryId].map(a => 
          a.id === analysisId ? updatedAnalysis : a
        );
      }
      setGroupedAnalyses(updatedGrouped);
      
      toast.success("Insumo eliminado correctamente");
    } catch (err) {
      console.error("Error al eliminar item:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo análisis
  const handleCreateAnalysis = () => {
    setShowCreateForm(true);
  };

  // Guardar nuevo análisis con estructura correcta
  const handleSaveAnalysis = async (analysisData) => {
    try {
      setLoading(true);
      
      // Crear una copia para modificar sin afectar el original
      const cleanData = { ...analysisData };
      
      // Limpiar los insumos para que tengan la estructura correcta
      if (cleanData.insumos) {
        Object.keys(cleanData.insumos).forEach(key => {
          const insumo = cleanData.insumos[key];
          
          // Guarda el item_id del material
          const materialId = insumo.item_id;
          
          // Crea un objeto limpio con sólo los campos necesarios
          cleanData.insumos[key] = {
            cantidad: insumo.cantidad || 0,
            codigo_original: insumo.codigo_original || "", // Mantener para compatibilidad
            coeficiente: insumo.coeficiente || 1,
            item_id: materialId,
            precio_unitario: insumo.precio_unitario || 0,
            subtotal: insumo.subtotal || 0,
            unidad: insumo.unidad || ""
          };
          
          // Eliminar el objeto item si existe
          delete cleanData.insumos[key].item;
        });
      }
      
      // Obtener todos los análisis para determinar el último número
      const analysesRef = collection(db, 'analisis');
      const querySnapshot = await getDocs(analysesRef);
      
      // Extraer todos los IDs y encontrar el número más alto
      let maxNumber = 0;
      querySnapshot.forEach((doc) => {
        const docId = doc.id;
        // Verificar si el ID sigue el patrón ACxxx
        if (docId.startsWith('AC')) {
          // Extraer el número
          const numberStr = docId.substring(2);
          const number = parseInt(numberStr);
          if (!isNaN(number) && number > maxNumber) {
            maxNumber = number;
          }
        }
      });
      
      // Generar el nuevo ID incrementando el número más alto
      const newNumber = maxNumber + 1;
      const newId = `AC${newNumber}`;
      
      console.log(`Último análisis encontrado: AC${maxNumber}, generando nuevo ID: ${newId}`);
      
      // Asignar nuevo ID y guardar en Firestore
      const finalData = {
        ...cleanData,
        id: newId,
        fecha_actualizacion: serverTimestamp()
      };
      
      // Crear nuevo documento con el ID generado
      const docRef = doc(db, 'analisis', newId);
      await setDoc(docRef, finalData);
      
      // Para la UI, podemos mantener el objeto item para mostrar detalles
      // pero en la base de datos guardamos la versión limpia
      const uiAnalysis = { ...analysisData, id: newId };
      
      // Actualizar estado local
      setAnalyses([...analyses, uiAnalysis]);
      
      // Determinar rubro basado en el código
      let rubroId;
      if (uiAnalysis.indice && uiAnalysis.indice.mayor) {
        rubroId = String(uiAnalysis.indice.mayor);
      } else {
        const analysisCode = uiAnalysis.codigoDisplay?.split('.')[0] || '0';
        const rubro = rubrosArray.find(r => r.minCode === analysisCode);
        rubroId = rubro ? rubro.id : '37'; // Categoría 37 (Otros) por defecto
      }
      
      // Actualizar agrupado
      const updatedGrouped = { ...groupedAnalyses };
      if (!updatedGrouped[rubroId]) {
        updatedGrouped[rubroId] = [];
      }
      updatedGrouped[rubroId].push(uiAnalysis);
      // Ordenar por código
      updatedGrouped[rubroId].sort(compareAnalysisItems);
      setGroupedAnalyses(updatedGrouped);
      
      toast.success(`Análisis "${analysisData.nombre}" creado correctamente con ID ${newId}`);
      setShowCreateForm(false);
    } catch (err) {
      console.error("Error al crear análisis:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para actualizar un análisis completo
   * @param {Object} updatedAnalysis - El análisis actualizado completo
   */
  const handleUpdateCompleteAnalysis = async (updatedAnalysis) => {
    try {
      setLoading(true);
      
      if (!updatedAnalysis || !updatedAnalysis.id) {
        throw new Error("No se proporcionó un análisis válido para actualizar");
      }
      
      console.log("Actualizando análisis completo:", updatedAnalysis.id);
      
      // Guardar en Firestore
      const analysisRef = doc(db, 'analisis', updatedAnalysis.id);
      
      // Extraer solo los campos que necesitamos actualizar
      const { insumos, costo_total } = updatedAnalysis;
      
      await updateDoc(analysisRef, {
        insumos,
        costo_total,
        fecha_actualizacion: serverTimestamp()
      });
      
      // Actualizar el análisis en nuestra lista local
      const updatedAnalyses = analyses.map(a => 
        a.id === updatedAnalysis.id ? updatedAnalysis : a
      );
      setAnalyses(updatedAnalyses);
      
      // Actualizar también en el estado agrupado
      const updatedGrouped = { ...groupedAnalyses };
      for (const categoryId in updatedGrouped) {
        updatedGrouped[categoryId] = updatedGrouped[categoryId].map(a => 
          a.id === updatedAnalysis.id ? updatedAnalysis : a
        );
      }
      setGroupedAnalyses(updatedGrouped);
      
      toast.success("Análisis actualizado correctamente");
    } catch (err) {
      console.error("Error al actualizar análisis completo:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && analyses.length === 0) {
    return <div className="loading-container">Cargando análisis de costos...</div>;
  }

  // Renderizar la vista principal
  return (
    <div className="cost-analysis-container">
      <div className="cost-analysis-header">
        <h1>Análisis de Costos</h1>
        
        <button 
          className="create-analysis-button"
          onClick={handleCreateAnalysis}
        >
          Crear Nuevo Análisis
        </button>
      </div>
      
      {showCreateForm && (
        <CreateAnalysisForm 
          onSave={handleSaveAnalysis}
          onCancel={() => setShowCreateForm(false)}
          availableItems={materials}
        />
      )}
      
      {/* Barra de búsqueda */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Contenido principal */}
      <div className="categories-container">
        {rubrosArray.map(rubro => {
          const categoryAnalyses = groupedAnalyses[rubro.id] || [];
          
          // Filtrar análisis basados en búsqueda
          const filteredAnalyses = categoryAnalyses.filter(analysis =>
            !searchTerm || 
            analysis.codigoDisplay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            analysis.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          // Si hay término de búsqueda y no hay resultados, omitir esta categoría
          if (searchTerm && filteredAnalyses.length === 0) {
            return null;
          }
          
          return (
            <div key={rubro.id} className="category-section">
              <CategoryRow 
                category={{
                  id: rubro.id,
                  rubroId: rubro.rubroId,
                  name: rubro.name,
                  minCode: rubro.minCode
                }}
                isExpanded={expandedCategories[rubro.id] || false}
                isLoading={loadingCategories[rubro.id] || false}
                toggleCategory={() => toggleCategory(rubro.id)}
              />
              
              {(expandedCategories[rubro.id] || false) && (
                <div className="analysis-list">
                  {filteredAnalyses.length > 0 ? (
                    <table className="analysis-table">
                      <thead>
                        <tr>
                          <th className="text-left" style={{width: '30px'}}></th>
                          <th className="text-left" style={{width: '80px'}}>Código</th>
                          <th className="text-left">Nombre</th>
                          <th className="text-center" style={{width: '80px'}}>Unidad</th>
                          <th className="text-right" style={{width: '120px'}}>Costo Total</th>
                          <th className="text-center" style={{width: '120px'}}>Actualizado</th>
                          <th className="text-right" style={{width: '80px'}}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAnalyses.map(analysis => (
                          <React.Fragment key={analysis.id}>
                            <tr className={`analysis-row ${expandedAnalysis === analysis.id ? 'expanded' : ''}`}>
                              <td className="text-center">
                                <div 
                                  className="expand-button"
                                  onClick={() => toggleAnalysis(analysis.id)}
                                >
                                  {expandedAnalysis === analysis.id ? '▼' : '▶'}
                                </div>
                              </td>
                              <td className="code-cell">{analysis.codigoDisplay}</td>
                              <td>{analysis.nombre}</td>
                              <td className="text-center">{analysis.unidad || '-'}</td>
                              <td className="text-right price-cell">
                                {typeof analysis.costo_total === 'number' 
                                  ? `$${analysis.costo_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` 
                                  : '-'
                                }
                              </td>
                              <td className="text-center date-cell">
                                {analysis.fecha_actualizacion ? formatDate(analysis.fecha_actualizacion) : '-'}
                              </td>
                              <td className="text-right">
                                <div className="action-buttons">
                                  <button
                                    onClick={() => handleOpenEditModal(analysis.id)}
                                    title="Editar análisis"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: '4px',
                                      fontSize: '16px',
                                    }}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAnalysis(analysis.id)}
                                    title="Eliminar análisis"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: '4px',
                                      fontSize: '16px',
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {expandedAnalysis === analysis.id && (
  <tr className="expanded-content-row">
    <td colSpan={7} className="expanded-content-cell">
      <AnalysisContent
        analysis={analysis}
        availableItems={materials}
        handleAddItem={(newItem) => {
          // Asegurarse de que newItem no es undefined
          if (!newItem) {
            console.error("newItem es undefined");
            return;
          }
          console.log("Enviando a handleAddItem:", newItem);
          return handleAddItem(analysis.id, newItem);
        }}
        handleUpdateItem={(itemKey, updatedItem) => 
          handleUpdateItem(analysis.id, itemKey, updatedItem)
        }
        handleDeleteItem={(itemKey) => 
          handleDeleteItem(analysis.id, itemKey)
        }
        handleUpdateAnalysis={handleUpdateCompleteAnalysis}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
      />
    </td>
  </tr>
)}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-analyses">
                      No hay análisis en este rubro
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Modal de edición de análisis */}
      {editModalVisible && analysisToEdit && (
        <AnalysisEditModal
          analysis={analysisToEdit}
          onSave={handleSaveEditedAnalysis}
          onClose={() => {
            setEditModalVisible(false);
            setAnalysisToEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default CostAnalysis;