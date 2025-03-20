// src/hooks/useFirestore.ts
import { useState, useCallback } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Firestore,
  DocumentData,
  QueryConstraint,
  DocumentReference,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

interface FirestoreOptions {
  collectionName: string;
  idField?: string;
}

export function useFirestore<T extends DocumentData>({ collectionName, idField = 'id' }: FirestoreOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpiar mensaje de error
  const clearError = useCallback(() => setError(null), []);

  // Obtener colección
  const getCollection = useCallback(async (
    constraints: QueryConstraint[] = [],
    limitCount?: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const collectionRef = collection(db, collectionName);
      
      // Aplicar constraints y límite
      let queryRef = query(collectionRef, ...constraints);
      if (limitCount) {
        queryRef = query(queryRef, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(queryRef);
      
      // Mapear datos incluyendo ID
      const data = querySnapshot.docs.map(doc => ({
        [idField]: doc.id,
        ...doc.data()
      })) as T[];
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al obtener datos: ${message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, [collectionName, idField]);

  // Obtener documento por ID
  const getDocument = useCallback(async (documentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          [idField]: docSnap.id,
          ...docSnap.data()
        } as T;
      } else {
        setError(`Documento con ID ${documentId} no encontrado`);
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al obtener documento: ${message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [collectionName, idField]);

  // Agregar documento
  const addDocument = useCallback(async (data: Omit<T, typeof idField>) => {
    setLoading(true);
    setError(null);
    
    try {
      const collectionRef = collection(db, collectionName);
      
      // Agregar timestamp automático
      const dataWithTimestamp = {
        ...data,
        fecha_creacion: serverTimestamp(),
        fecha_actualizacion: serverTimestamp()
      };
      
      const docRef = await addDoc(collectionRef, dataWithTimestamp);
      
      return {
        [idField]: docRef.id,
        ...data
      } as T;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al agregar documento: ${message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [collectionName, idField]);

  // Actualizar documento
  const updateDocument = useCallback(async (documentId: string, data: Partial<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, documentId);
      
      // Agregar timestamp de actualización
      const dataWithTimestamp = {
        ...data,
        fecha_actualizacion: serverTimestamp()
      };
      
      await updateDoc(docRef, dataWithTimestamp);
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al actualizar documento: ${message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  // Eliminar documento
  const deleteDocument = useCallback(async (documentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al eliminar documento: ${message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  // Función de utilidad para sanitizar datos antes de enviar a Firestore
  const sanitizeForFirestore = useCallback((data: any): any => {
    // Eliminar campos undefined que Firestore no acepta
    if (!data) return data;
    
    if (Array.isArray(data)) {
      return data.map(item => sanitizeForFirestore(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: Record<string, any> = {};
      
      Object.entries(data).forEach(([key, value]) => {
        // Omitir valores undefined
        if (value !== undefined) {
          sanitized[key] = sanitizeForFirestore(value);
        }
      });
      
      return sanitized;
    }
    
    return data;
  }, []);

  return {
    loading,
    error,
    clearError,
    getCollection,
    getDocument,
    addDocument,
    updateDocument,
    deleteDocument,
    sanitizeForFirestore
  };
}

export default useFirestore;