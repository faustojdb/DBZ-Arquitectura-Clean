// src/components/prices/useMaterialsData.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  where 
} from 'firebase/firestore';
import { db } from '@/firebase/config';

// Constantes
const ITEMS_PER_PAGE = 100;
const COLLECTION_NAME = 'items';
const LOCAL_STORAGE_KEY = 'materialItemsCache';
const CACHE_TIMEOUT = 60 * 60 * 1000; // 1 hora

const useMaterialsData = () => {
  // Estados para datos y UI
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState(['all']);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisibleItem, setLastVisibleItem] = useState(null);
  
  // Estado para nuevo material
  const [newMaterial, setNewMaterial] = useState({
    descripcion: '',
    categoria: '',
    unidad: '',
    precio_unitario: 0
  });

  // Función para ordenar - DEFINIDA ANTES DE SU USO
  const handleSort = useCallback((key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    
    // Recargar los datos con el nuevo orden
    setTimeout(() => loadItems(true), 0);
  }, [sortConfig]); // Incluye sortConfig en las dependencias

  // Función para cargar items desde Firestore
 const loadAllMaterials = async () => {
  if (loading) return;
  
  try {
    setLoading(true);
    setError(null);
    
    const materialsRef = collection(db, COLLECTION_NAME);
    
    // Importante: Esto podría ser intensivo si hay miles de documentos
    const querySnapshot = await getDocs(query(materialsRef));
    
    const allItems = [];
    const uniqueCategories = new Set();
    
    querySnapshot.forEach((doc) => {
      const item = { id: doc.id, ...doc.data() };
      allItems.push(item);
      
      if (item.categoria) {
        uniqueCategories.add(item.categoria);
      } else {
        uniqueCategories.add('Sin categoría');
      }
    });
    
    // Ordenar alfabéticamente
    allItems.sort((a, b) => {
      if (sortConfig.key === 'id') {
        return a.id.localeCompare(b.id) * (sortConfig.direction === 'asc' ? 1 : -1);
      }
      // Otras ordenaciones...
      return 0;
    });
    
    // Actualizar estado
    setItems(allItems);
    setCategories(['all', ...Array.from(uniqueCategories).sort()]);
    setTotalCount(allItems.length);
    setHasMore(false); // Ya no hay más que cargar
    
    // Actualizar caché
    const cacheData = {
      items: allItems,
      timestamp: Date.now(),
      categories: Array.from(uniqueCategories).sort(),
      totalCount: allItems.length
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cacheData));
    
    console.log(`Cargados todos los ${allItems.length} materiales.`);
    toast.success(`¡Cargados todos los ${allItems.length} materiales!`);
    
    return true;
  } catch (err) {
    console.error("Error al cargar todos los materiales:", err);
    setError(`Error: ${err.message}`);
    return false;
  } finally {
    setLoading(false);
  }
};
	  const loadAllMaterials = async () => {
  if (loading) return;
  
  try {
    setLoading(true);
    setError(null);
    
    const materialsRef = collection(db, COLLECTION_NAME);
    
    // Importante: Esto podría ser intensivo si hay miles de documentos
    const querySnapshot = await getDocs(query(materialsRef));
    
    const allItems = [];
    const uniqueCategories = new Set();
    
    querySnapshot.forEach((doc) => {
      const item = { id: doc.id, ...doc.data() };
      allItems.push(item);
      
      if (item.categoria) {
        uniqueCategories.add(item.categoria);
      } else {
        uniqueCategories.add('Sin categoría');
      }
    });
      
      // Si no hay caché o se solicita actualización, cargar de Firebase
      console.log('Cargando desde Firebase');
      
      // Consulta inicial limitada a ITEMS_PER_PAGE
      const materialsRef = collection(db, COLLECTION_NAME);
      const q = query(
        materialsRef,
        orderBy(sortConfig.key, sortConfig.direction),
        limit(ITEMS_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedItems = [];
      const uniqueCategories = new Set();
      
      // Procesar los resultados
      querySnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        fetchedItems.push(item);
        
        if (item.categoria) {
          uniqueCategories.add(item.categoria);
        }
      });
      
      // Guardar el último item visible para paginación
      if (querySnapshot.docs.length > 0) {
        setLastVisibleItem(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
      
      // Obtener recuento total para mostrar feedback al usuario
      const countSnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const totalItems = countSnapshot.size;
      
      // Guardar categorías únicas (ordenadas alfabéticamente)
      const categoriesArray = Array.from(uniqueCategories).sort();
      
      // Guardar en caché
      const cacheData = {
        items: fetchedItems,
        timestamp: Date.now(),
        categories: categoriesArray,
        totalCount: totalItems
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cacheData));
      
      // Actualizar estado
      setItems(fetchedItems);
      setTotalCount(totalItems);
      setCategories(['all', ...categoriesArray]);
      setHasMore(fetchedItems.length < totalItems);
      setCurrentPage(1);
      
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(`Error al cargar datos: ${err.message}`);
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  }, [sortConfig]);

  // Cargar más items (paginación)
  const loadMoreItems = async () => {
    if (!hasMore || loading) return;
    
    try {
      setLoading(true);
      
      // Si no hay último elemento visible, no se puede paginar
      if (!lastVisibleItem) {
        setHasMore(false);
        return;
      }
      
      // Consulta para la siguiente página
      const materialsRef = collection(db, COLLECTION_NAME);
      const q = query(
        materialsRef,
        orderBy(sortConfig.key, sortConfig.direction),
        startAfter(lastVisibleItem),
        limit(ITEMS_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Si no hay más resultados, deshabilitar "cargar más"
      if (querySnapshot.empty) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      const newItems = [];
      querySnapshot.forEach((doc) => {
        newItems.push({ id: doc.id, ...doc.data() });
      });
      
      // Actualizar último elemento visible
      if (querySnapshot.docs.length > 0) {
        setLastVisibleItem(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
      
      // Combinar con items existentes
      const updatedItems = [...items, ...newItems];
      
      // Actualizar estado
      setItems(updatedItems);
      setCurrentPage(prev => prev + 1);
      setHasMore(updatedItems.length < totalCount);
      
      // Actualizar caché con los nuevos items
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        parsedCache.items = updatedItems;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedCache));
      }
      
    } catch (err) {
      console.error("Error al cargar más items:", err);
      setError(`Error al cargar más items: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Implementar búsqueda y filtrado
 useEffect(() => {
  const fetchMaterials = async () => {
    try {
      const materialsRef = collection(db, 'items');
      // Eliminar cualquier filtro que limite los resultados
      const q = query(materialsRef);
      const querySnapshot = await getDocs(q);
      
      const materialsList = [];
      const uniqueCategories = new Set();
      
      console.log(`Total documentos encontrados: ${querySnapshot.size}`);
      
      querySnapshot.forEach((doc) => {
        const material = {
          id: doc.id,
          ...doc.data()
        };
        
        materialsList.push(material);
        
        // Guardar cada categoría única
        if (material.categoria) {
          uniqueCategories.add(material.categoria);
        } else {
          // Para materiales sin categoría asignada
          uniqueCategories.add('Sin categoría');
        }
      });
      
      console.log(`Total materiales procesados: ${materialsList.length}`);
      console.log(`Categorías encontradas: ${Array.from(uniqueCategories).join(', ')}`);
      
      // Convertir Set a Array y ordenar alfabéticamente
      const categoriesArray = Array.from(uniqueCategories).sort();
      
      // Actualizar estado con todas las categorías encontradas
      setCategories(['all', ...categoriesArray]);
      
      // Guardar en caché
      const cacheData = {
        items: materialsList,
        timestamp: Date.now(),
        categories: categoriesArray,
        totalCount: querySnapshot.size
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cacheData));
      
      // Actualizar el estado
      setItems(materialsList);
      setTotalCount(querySnapshot.size);
      
    } catch (err) {
      console.error("Error al cargar materiales:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  fetchMaterials();
}, []);
  // Cargar datos iniciales
  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CRUD: Añadir material
  const handleAddMaterial = async () => {
    try {
      // Validar campos requeridos
      if (!newMaterial.descripcion || !newMaterial.unidad) {
        setError("La descripción y unidad son campos obligatorios");
        return;
      }
      
      setLoading(true);
      
      // Crear nuevo documento en Firestore
      const materialsRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(materialsRef, {
        ...newMaterial,
        precio_unitario: parseFloat(newMaterial.precio_unitario) || 0,
        fecha_actualizacion: new Date(),
        activo: true
      });
      
      // Añadir el nuevo item al estado local
      const newItem = {
        id: docRef.id,
        ...newMaterial,
        precio_unitario: parseFloat(newMaterial.precio_unitario) || 0,
        fecha_actualizacion: new Date(),
        activo: true
      };
      
      // Actualizar estado
      setItems([newItem, ...items]);
      setTotalCount(prev => prev + 1);
      
      // Actualizar caché
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        parsedCache.items = [newItem, ...parsedCache.items];
        parsedCache.totalCount += 1;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedCache));
      }
      
      // Actualizar categorías si es nueva
      if (newMaterial.categoria && !categories.includes(newMaterial.categoria)) {
        const newCategories = [...categories, newMaterial.categoria].sort();
        setCategories(newCategories);
        
        // Actualizar categorías en caché
        if (cachedData) {
          const parsedCache = JSON.parse(cachedData);
          parsedCache.categories = newCategories.filter(cat => cat !== 'all');
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedCache));
        }
      }
      
      // Resetear formulario
      setNewMaterial({
        descripcion: '',
        categoria: '',
        unidad: '',
        precio_unitario: 0
      });
      
    } catch (err) {
      console.error("Error al añadir material:", err);
      setError(`Error al añadir material: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // CRUD: Actualizar material
  const handleUpdateMaterial = async (id, updatedData) => {
    try {
      setLoading(true);
      
      // Preparar datos para Firebase
      const dataToUpdate = {
        ...updatedData,
        precio_unitario: parseFloat(updatedData.precio_unitario) || 0,
        fecha_actualizacion: new Date()
      };
      
      // Actualizar en Firestore
      const itemRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(itemRef, dataToUpdate);
      
      // Actualizar estado local
      const updatedItems = items.map(item => 
        item.id === id ? { ...item, ...dataToUpdate } : item
      );
      
      setItems(updatedItems);
      setEditingItem(null);
      
      // Actualizar caché
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        parsedCache.items = updatedItems;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedCache));
      }
      
      // Actualizar categorías si es nueva
      if (dataToUpdate.categoria && !categories.includes(dataToUpdate.categoria)) {
        const newCategories = [...categories, dataToUpdate.categoria].filter(cat => cat !== 'all').sort();
        setCategories(['all', ...newCategories]);
        
        // Actualizar categorías en caché
        if (cachedData) {
          const parsedCache = JSON.parse(cachedData);
          parsedCache.categories = newCategories;
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedCache));
        }
      }
      
    } catch (err) {
      console.error("Error al actualizar material:", err);
      setError(`Error al actualizar material: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // CRUD: Eliminar material
  const handleDeleteMaterial = async (id) => {
    // Confirmación antes de eliminar
    if (!window.confirm('¿Está seguro de que desea eliminar este material? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Eliminar de Firestore
      const itemRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(itemRef);
      
      // Actualizar estado local
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      setTotalCount(prev => prev - 1);
      
      // Actualizar caché
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        parsedCache.items = updatedItems;
        parsedCache.totalCount -= 1;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedCache));
      }
    } catch (err) {
      console.error("Error al eliminar material:", err);
      setError(`Error al eliminar material: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Limpiar caché
  const cleanLocalStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };
  
  // Formatear fecha para mostrar
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "-";
    }
  };
  const handleForceRefresh = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  setLoading(true);
  loadItems(true); // Cargar directamente desde Firestore
  toast.info("Forzando actualización completa de datos...");
};

  
  return {
    items,
    filteredItems,
    searchTerm,
    loading,
    initialLoading,
    error,
    selectedCategory,
    sortConfig,
    editingItem,
    totalCount,
    categories,
    newMaterial,
    hasMore,
    currentPage,
    setError,
    setSearchTerm,
    setSelectedCategory,
    setSortConfig,
    setEditingItem,
    setNewMaterial,
    handleSort,
    handleAddMaterial,
    handleUpdateMaterial,
    handleDeleteMaterial,
    loadItems,
    loadMoreItems,
    cleanLocalStorage,
    formatDate
  };
};

export default useMaterialsData;