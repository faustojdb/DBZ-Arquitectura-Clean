import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  deleteDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { CATEGORIES } from '../constants/categories';

const useAnalysisData = () => {
  const [analyses, setAnalyses] = useState([]);
  const [groupedAnalyses, setGroupedAnalyses] = useState({});
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState({});
  const [loadingAnalyses, setLoadingAnalyses] = useState({});
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedAnalyses, setExpandedAnalyses] = useState({});
  const [editingAnalysis, setEditingAnalysis] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const loadAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const analysesRef = collection(db, 'analisis');
      const q = query(analysesRef, orderBy('codigoDisplay'));
      const querySnapshot = await getDocs(q);
      
      const analysesList = [];
      querySnapshot.forEach((doc) => {
        analysesList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setAnalyses(analysesList);
      
      const grouped = {};
      Object.keys(CATEGORIES).forEach(category => {
        grouped[category] = [];
      });
      
      analysesList.forEach(analysis => {
        if (!analysis.codigoDisplay) return;
        
        const categoryCode = analysis.codigoDisplay.split('.')[0];
        let matchingCategory = 'CATEGORY_37';
        
        Object.entries(CATEGORIES).forEach(([category, name]) => {
          if (category === `CATEGORY_${categoryCode}`) {
            matchingCategory = category;
          }
        });
        
        if (!grouped[matchingCategory]) {
          grouped[matchingCategory] = [];
        }
        
        grouped[matchingCategory].push(analysis);
      });
      
      setGroupedAnalyses(grouped);
    } catch (err) {
      console.error("Error al cargar análisis:", err);
      setError(`Error al cargar análisis: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const loadMaterials = useCallback(async () => {
    try {
      const materialsRef = collection(db, 'items');
      const q = query(materialsRef, where('activo', '==', true));
      const querySnapshot = await getDocs(q);
      
      const materialsList = [];
      querySnapshot.forEach((doc) => {
        materialsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setMaterials(materialsList);
    } catch (err) {
      console.error("Error al cargar materiales:", err);
      setError(`Error al cargar materiales: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  }, []);
  
  const toggleCategory = useCallback((category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
    
    if (!expandedCategories[category]) {
      setLoadingCategories(prev => ({ ...prev, [category]: true }));
      setTimeout(() => {
        setLoadingCategories(prev => ({ ...prev, [category]: false }));
      }, 300);
    }
  }, [expandedCategories]);
  
  const toggleAnalysis = useCallback((analysisId) => {
    setExpandedAnalyses(prev => ({
      ...prev,
      [analysisId]: !prev[analysisId]
    }));
    
    if (!expandedAnalyses[analysisId]) {
      loadAnalysisDetails(analysisId);
    }
  }, [expandedAnalyses]);
  
  const loadAnalysisDetails = useCallback(async (analysisId) => {
    try {
      setLoadingAnalyses(prev => ({ ...prev, [analysisId]: true }));
      
      const analysisRef = doc(db, 'analisis', analysisId);
      const docSnap = await getDoc(analysisRef);
      
      if (docSnap.exists()) {
        const updatedAnalysis = {
          id: docSnap.id,
          ...docSnap.data()
        };
        
        setAnalyses(prev => 
          prev.map(a => a.id === analysisId ? updatedAnalysis : a)
        );
        
        setGroupedAnalyses(prev => {
          const newGrouped = { ...prev };
          
          Object.keys(newGrouped).forEach(category => {
            const index = newGrouped[category].findIndex(a => a.id === analysisId);
            if (index !== -1) {
              newGrouped[category][index] = updatedAnalysis;
            }
          });
          
          return newGrouped;
        });
      }
    } catch (err) {
      console.error("Error al cargar detalles del análisis:", err);
      setError(`Error al cargar detalles: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoadingAnalyses(prev => ({ ...prev, [analysisId]: false }));
    }
  }, []);
  
  const saveAnalysis = useCallback(async (data) => {
    try {
      setLoading(true);
      
      const sanitizedData = sanitizeForFirestore(data);
      
      if (data.id) {
        const { id, ...updateData } = sanitizedData;
        const analysisRef = doc(db, 'analisis', id);
        
        updateData.fecha_actualizacion = serverTimestamp();
        
        await updateDoc(analysisRef, updateData);
      } else {
        const newData = {
          ...sanitizedData,
          fecha_actualizacion: serverTimestamp()
        };
        
        if (newData.id) {
          const docRef = doc(db, 'analisis', newData.id);
          await setDoc(docRef, newData);
        } else {
          const analysesRef = collection(db, 'analisis');
          await addDoc(analysesRef, newData);
        }
      }
      
      await loadAnalyses();
      setShowCreateForm(false);
      setEditingAnalysis(null);
      
      return true;
    } catch (err) {
      console.error("Error al guardar análisis:", err);
      setError(`Error al guardar análisis: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAnalyses]);
  
  const deleteAnalysis = useCallback(async (analysisId) => {
    try {
      setLoading(true);
      
      if (!window.confirm('¿Está seguro de que desea eliminar este análisis? Esta acción no se puede deshacer.')) {
        setLoading(false);
        return false;
      }
      
      const analysisRef = doc(db, 'analisis', analysisId);
      await deleteDoc(analysisRef);
      
      setAnalyses(prev => prev.filter(a => a.id !== analysisId));
      
      setGroupedAnalyses(prev => {
        const newGrouped = { ...prev };
        
        Object.keys(newGrouped).forEach(category => {
          newGrouped[category] = newGrouped[category].filter(a => a.id !== analysisId);
        });
        
        return newGrouped;
      });
      
      return true;
    } catch (err) {
      console.error("Error al eliminar análisis:", err);
      setError(`Error al eliminar análisis: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const addAnalysisItem = useCallback(async (analysisId, item) => {
    // [Resto de la función se mantiene igual]
  }, [loadAnalysisDetails]);
  
  const updateAnalysisItem = useCallback(async (analysisId, itemKey, updatedItem) => {
    // [Resto de la función se mantiene igual]
  }, [loadAnalysisDetails]);
  
  const deleteAnalysisItem = useCallback(async (analysisId, itemKey) => {
    // [Resto de la función se mantiene igual]
  }, [loadAnalysisDetails]);
  
  const calcularCostoTotal = (analysis) => {
    if (!analysis.insumos) return 0;
    
    return Object.values(analysis.insumos).reduce((sum, insumo) => {
      return sum + (insumo.subtotal || 0);
    }, 0);
  };
  
  const sanitizeForFirestore = (data) => {
    if (!data) return data;
    
    if (Array.isArray(data)) {
      return data.map(item => sanitizeForFirestore(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          sanitized[key] = sanitizeForFirestore(value);
        }
      });
      
      return sanitized;
    }
    
    return data;
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : 
                  (timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp));
      
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "-";
    }
  };
  
  useEffect(() => {
    loadAnalyses();
    loadMaterials();
  }, [loadAnalyses, loadMaterials]);
  
  return {
    analyses,
    groupedAnalyses,
    materials,
    loading,
    loadingCategories,
    loadingAnalyses,
    error,
    searchTerm,
    expandedCategories,
    expandedAnalyses,
    editingAnalysis,
    editingItem,
    showCreateForm,
    setError,
    setSearchTerm,
    setEditingAnalysis,
    setEditingItem,
    setShowCreateForm,
    toggleCategory,
    toggleAnalysis,
    loadAnalysisDetails,
    saveAnalysis,
    deleteAnalysis,
    addAnalysisItem,
    updateAnalysisItem,
    deleteAnalysisItem,
    formatDate
  };
};

export default useAnalysisData;