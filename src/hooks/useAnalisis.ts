// src/hooks/useAnalisis.ts
import { useState, useCallback } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

/**
 * Hook para manejar operaciones con análisis de costos
 */
const useAnalisis = () => {
  const [analisis, setAnalisis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Obtiene todos los análisis de un rubro específico
   */
  const fetchAllRubros = useCallback(async (rubroId) => {
    try {
      setLoading(true);
      console.log(`Cargando análisis para rubro ${rubroId}...`);
      
      // Construir la consulta para obtener análisis por rubro
      // Simplificamos la consulta para evitar problemas de índice
      const q = query(
        collection(db, 'analisis'),
        where('rubro_id', '==', rubroId)
      );
      
      // Ejecutar la consulta
      const querySnapshot = await getDocs(q);
      const resultados = [];
      
      // Procesar resultados
      querySnapshot.forEach((doc) => {
        resultados.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Ordenar los resultados manualmente en lugar de usar orderBy
      resultados.sort((a, b) => {
        // Ordenar por código o nombre si no hay código_sort
        const aSort = a.codigo_sort || a.codigo || a.nombre || '';
        const bSort = b.codigo_sort || b.codigo || b.nombre || '';
        return aSort.localeCompare(bSort);
      });
      
      console.log(`Se encontraron ${resultados.length} análisis para rubro ${rubroId}`);
      
      // Actualizar estado solo si hay resultados para mantener análisis previos
      if (resultados.length > 0) {
        setAnalisis(prevAnalisis => {
          // Filtrar análisis existentes para evitar duplicados
          const idsExistentes = new Set(prevAnalisis.map(a => a.id));
          const nuevosAnalisis = resultados.filter(a => !idsExistentes.has(a.id));
          return [...prevAnalisis, ...nuevosAnalisis];
        });
      }
      
      return resultados;
    } catch (err) {
      console.error(`Error al cargar análisis para rubro ${rubroId}:`, err);
      setError(`Error al cargar análisis: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Busca análisis por término en nombre o código
   */
  const searchAnalisis = useCallback(async (termino) => {
    try {
      setLoading(true);
      console.log(`Buscando análisis con término: "${termino}"`);
      
      // Convertir término a minúsculas para búsqueda case-insensitive
      const terminoLower = termino.toLowerCase();
      
      // Simplificamos la consulta para evitar problemas de índice
      // Para búsqueda por texto, haremos una consulta general y filtraremos en el cliente
      const q = query(
        collection(db, 'analisis')
      );
      
      // Ejecutar consulta
      const querySnapshot = await getDocs(q);
      let resultados = [];
      
      // Procesar resultados y filtrar manualmente
      querySnapshot.forEach((doc) => {
        const analisis = {
          id: doc.id,
          ...doc.data()
        };
        
        // Filtrar por nombre o código (case-insensitive)
        const nombre = (analisis.nombre || '').toLowerCase();
        const codigo = (analisis.codigo || '').toLowerCase();
        const codigoDisplay = (analisis.codigo_display || '').toLowerCase();
        
        if (
          nombre.includes(terminoLower) ||
          codigo.includes(terminoLower) ||
          codigoDisplay.includes(terminoLower)
        ) {
          resultados.push(analisis);
        }
      });
      
      // Ordenar los resultados por relevancia
      resultados.sort((a, b) => {
        const aName = (a.nombre || '').toLowerCase();
        const bName = (b.nombre || '').toLowerCase();
        
        // Si uno comienza con el término y el otro no, el que comienza va primero
        if (aName.startsWith(terminoLower) && !bName.startsWith(terminoLower)) return -1;
        if (!aName.startsWith(terminoLower) && bName.startsWith(terminoLower)) return 1;
        
        // Si ambos comienzan o ninguno comienza, ordenar alfabéticamente
        return aName.localeCompare(bName);
      });
      
      // Limitar resultados para mejor rendimiento en el cliente
      resultados = resultados.slice(0, 50);
      
      console.log(`Se encontraron ${resultados.length} resultados para la búsqueda "${termino}"`);
      
      // Actualizar estado
      setAnalisis(resultados);
      setError(null);
      return resultados;
    } catch (err) {
      console.error(`Error al buscar análisis:`, err);
      setError(`Error en la búsqueda: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Obtiene un análisis específico por ID
   */
  const getAnalisisById = useCallback(async (analisisId) => {
    if (!analisisId) return null;
    
    try {
      setLoading(true);
      
      // Forma simple y robusta: obtener el documento directamente por ID
      const docRef = doc(db, 'analisis', analisisId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log(`No se encontró análisis con ID ${analisisId}`);
        return null;
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (err) {
      console.error(`Error al obtener análisis por ID ${analisisId}:`, err);
      setError(`Error al obtener análisis: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Resetear resultados de búsqueda
  const resetResults = useCallback(() => {
    setAnalisis([]);
    setError(null);
  }, []);
  
  return {
    analisis,
    loading,
    error,
    searchAnalisis,
    fetchAllRubros,
    getAnalisisById,
    resetResults
  };
};

export default useAnalisis;