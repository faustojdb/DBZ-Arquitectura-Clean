// src/hooks/usePresupuesto.ts
import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  setDoc  // Añadir esta importación
} from 'firebase/firestore';

/**
 * Hook para manejo de presupuestos
 */
const usePresupuesto = (presupuestoId = null) => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [presupuesto, setPresupuesto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);

  /**
   * Obtiene la lista de presupuestos desde Firestore
   */
  const fetchPresupuestos = useCallback(async () => {
    try {
      console.log("Iniciando fetchPresupuestos()");
      setLoading(true);
      setError(null);
      
      // Referencia a la colección
      const colRef = collection(db, 'presupuestos');
      console.log("Colección de referencia:", colRef.path);
      
      // Crear consulta
      const q = query(colRef);
      console.log("Consulta creada sin ordenamiento, obteniendo documentos...");
      
      // Ejecutar consulta
      const snapshot = await getDocs(q);
      console.log("Documentos recuperados:", snapshot.size);
      
      const docs = [];
      snapshot.forEach(doc => {
        console.log("Procesando documento:", doc.id);
        const data = doc.data();
        console.log("Datos raw:", data);
        
        // Procesar presupuesto
        const presupuestoProcesado = procesarPresupuesto(doc.id, data);
        docs.push(presupuestoProcesado);
      });
      
      console.log("Total de presupuestos procesados:", docs.length);
      
      // Actualizar estados
      setPresupuestos(docs);
      setCount(docs.length);
      
      console.log("fetchPresupuestos() completado");
      return docs;
    } catch (err) {
      console.error("Error en fetchPresupuestos():", err);
      setError(`Error al cargar presupuestos: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene un presupuesto específico por ID
   */
  const fetchPresupuesto = useCallback(async (id) => {
    try {
      console.log("Iniciando fetchPresupuesto(" + id + ")");
      setLoading(true);
      setError(null);
      
      // Referencia al documento
      const docRef = doc(db, 'presupuestos', id);
      console.log("Referencia al documento:", docRef.path);
      
      // Obtener documento
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log("Documento no encontrado");
        setError(`No se encontró el presupuesto con ID ${id}`);
        setPresupuesto(null);
        return null;
      }
      
      console.log("Documento recuperado, existe:", docSnap.exists());
      
      // Extraer datos
      const docData = docSnap.data();
      console.log("Datos raw del presupuesto:", docData);
      
      // Procesar presupuesto
      const presupuestoProcesado = procesarPresupuesto(id, docData);
      
      // Importante: Preservar datos_generales originales
      presupuestoProcesado.datos_generales = docData.datos_generales || {};
      
      // Actualizar estado
      setPresupuesto(presupuestoProcesado);
      
      console.log("fetchPresupuesto() completado");
      return presupuestoProcesado;
    } catch (err) {
      console.error("Error en fetchPresupuesto():", err);
      setError(`Error al cargar presupuesto: ${err.message}`);
      setPresupuesto(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Procesa los datos crudos de Firestore a un formato más usable
   */
  const procesarPresupuesto = (id, data) => {
    // Extraer datos_generales (puede ser null o undefined)
    const datosGenerales = data.datos_generales || {};
    
    // Procesar presupuesto
    return {
      id,
      titulo: id,
      comitente: datosGenerales.comitente || '',
      obra: datosGenerales.obra || '',
      lugar: datosGenerales.lugar || 'Lugar', // Usar el lugar de datos_generales
      fecha: datosGenerales.fecha || null,
      tipoEncomenda: datosGenerales.tipo_encomienda || 'Obra - Construcción',
      beneficioExplicito: datosGenerales.beneficio_explicito || 20,
      beneficioImplicito: datosGenerales.beneficio_implicito || 0,
      totalGeneral: data.total_general || 0,
      subtotales: data.subtotales || {},
      items: data.items || {}
    };
  };

  /**
   * Crea un nuevo presupuesto en Firestore
   */
  /**
 * Crea un nuevo presupuesto en Firestore con ID personalizado
 */
const createPresupuesto = useCallback(async (data) => {
  try {
    setLoading(true);
    setError(null);
    
    // Obtener lista de presupuestos para generar ID secuencial
    const allPresupuestos = await fetchPresupuestos();
    
    // Generar ID tipo PRES0001
    const maxId = allPresupuestos
      .filter(p => p.id.startsWith('PRES'))
      .map(p => parseInt(p.id.substring(4), 10) || 0)
      .reduce((max, num) => num > max ? num : max, 0);
    
    const newId = `PRES${(maxId + 1).toString().padStart(4, '0')}`;
    
    // Referencia al documento con ID personalizado
    const docRef = doc(db, 'presupuestos', newId);
    
    // Asegurarse de que lugar esté presente
    if (data.datos_generales && !data.datos_generales.lugar) {
      data.datos_generales.lugar = 'Lugar';
    }
    
    // Añadir documento con ID personalizado
    await setDoc(docRef, data);
    console.log("Presupuesto creado con ID:", newId);
    
    // Refrescar lista
    await fetchPresupuestos();
    
    return newId;
  } catch (err) {
    console.error("Error al crear presupuesto:", err);
    setError(`Error al crear presupuesto: ${err.message}`);
    throw err;
  } finally {
    setLoading(false);
  }
}, [fetchPresupuestos]);


  /**
   * Actualiza un presupuesto existente en Firestore
   */
  const updatePresupuesto = useCallback(async (presupuestoId, datosActualizados) => {
    try {
      console.log("Iniciando updatePresupuesto(" + presupuestoId + ")");
      console.log("Datos de actualización:", datosActualizados);
      
      setLoading(true);
      setError(null);
      
      // Obtener datos actuales
      const docRef = doc(db, 'presupuestos', presupuestoId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`No se encontró el presupuesto con ID ${presupuestoId}`);
      }
      
      // Datos actuales
      const datosActuales = docSnap.data();
      console.log("Datos actuales:", datosActuales);
      
      // Asegurarse de que datos_generales.lugar se preserve correctamente
      if (datosActualizados.datos_generales) {
        if (!datosActualizados.datos_generales.lugar) {
          // Si no se proporciona lugar en la actualización, usar el existente
          if (datosActuales.datos_generales && datosActuales.datos_generales.lugar) {
            datosActualizados.datos_generales.lugar = datosActuales.datos_generales.lugar;
          } else {
            datosActualizados.datos_generales.lugar = 'Lugar';
          }
        }
      }
      
      // Datos a actualizar
      console.log("Datos a actualizar:", datosActualizados);
      
      // Actualizar documento
      await updateDoc(docRef, datosActualizados);
      console.log(`Presupuesto ${presupuestoId} actualizado correctamente`);
      
      // Actualizar estado local
      console.log("Actualizando estado local del presupuesto");
      
      // Refrescar datos
      await fetchPresupuesto(presupuestoId);
      
      console.log("updatePresupuesto() completado");
      return presupuestoId;
    } catch (err) {
      console.error("Error al actualizar presupuesto:", err);
      setError(`Error al actualizar presupuesto: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPresupuesto]);

  /**
   * Elimina un presupuesto de Firestore
   */
  const deletePresupuesto = useCallback(async (presupuestoId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Referencia al documento
      const docRef = doc(db, 'presupuestos', presupuestoId);
      
      // Eliminar documento
      await deleteDoc(docRef);
      console.log(`Presupuesto ${presupuestoId} eliminado correctamente`);
      
      // Refrescar lista
      await fetchPresupuestos();
      
      return true;
    } catch (err) {
      console.error("Error al eliminar presupuesto:", err);
      setError(`Error al eliminar presupuesto: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPresupuestos]);

  // Efecto para cargar presupuesto individual o lista según el ID
  useEffect(() => {
    console.log("useEffect en usePresupuesto - ID:", presupuestoId || "ninguno");
    
    if (presupuestoId) {
      console.log("Cargando presupuesto individual:", presupuestoId);
      fetchPresupuesto(presupuestoId);
    } else {
      console.log("Cargando lista de presupuestos");
      fetchPresupuestos();
    }
  }, [presupuestoId, fetchPresupuesto, fetchPresupuestos]);

  return {
    presupuestos,
    presupuesto,
    loading,
    error,
    count,
    fetchPresupuestos,
    fetchPresupuesto,
    createPresupuesto,
    updatePresupuesto,
    deletePresupuesto
  };
};

export default usePresupuesto;