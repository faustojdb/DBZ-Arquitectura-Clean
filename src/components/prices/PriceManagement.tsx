// src/components/prices/PriceManagement.tsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { ArrowUpDown, Pencil, Trash2, Plus, Save, X, RefreshCw, RotateCcw, Filter, ChevronDown, Database } from 'lucide-react';
import { toast } from 'react-toastify';
import { db } from '@/firebase/config'; // Importar directamente
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
  serverTimestamp
} from 'firebase/firestore'; // Importar directamente
import NumericInput from '@/components/shared/inputs/NumericInput';
import DebouncedSearchInput from '@/components/shared/inputs/DebouncedSearchInput';
import { styles } from './materialsStyles';

// Constantes para la gestión de caché
const LOCAL_STORAGE_KEY = 'materialItemsCache';
const CACHE_TIMEOUT = 10 * 60 * 1000; // 10 minutos
const ITEMS_PER_PAGE = 100;
const COLLECTION_NAME = 'items';

// Sistema de sincronización con debounce para Firebase
const SYNC_INTERVAL = 5000; // 5 segundos entre sincronizaciones
let pendingChanges = {};
let syncTimeout = null;

const scheduleSync = (changes, entityId, entityType = 'item') => {
  // Acumular cambios para esta entidad
  if (!pendingChanges[entityType]) {
    pendingChanges[entityType] = {};
  }
  
  if (!pendingChanges[entityType][entityId]) {
    pendingChanges[entityType][entityId] = {};
  }
  
  // Combinar con cambios anteriores
  pendingChanges[entityType][entityId] = {
    ...pendingChanges[entityType][entityId],
    ...changes
  };
  
  // Si ya hay un timeout, no crear otro
  if (syncTimeout) return;
  
  // Programar sincronización
  syncTimeout = setTimeout(() => {
    syncWithFirebase();
  }, SYNC_INTERVAL);
};

const syncWithFirebase = async () => {
  // Limpiar timeout
  syncTimeout = null;
  
  // Copiar los cambios pendientes y resetear para la próxima ronda
  const changesSnapshot = {...pendingChanges};
  pendingChanges = {};
  
  // Procesar cada tipo de entidad
  for (const entityType in changesSnapshot) {
    for (const entityId in changesSnapshot[entityType]) {
      try {
        const changes = changesSnapshot[entityType][entityId];
        
        // Solo sincronizar si hay cambios
        if (Object.keys(changes).length === 0) continue;
        
        console.log(`Sincronizando ${entityType} ${entityId} con Firebase:`, changes);
        
        // Sincronizar con Firebase
        const entityRef = doc(db, `${entityType}s`, entityId);
        await updateDoc(entityRef, sanitizeForFirebase(changes));
        
        console.log(`Sincronización completada para ${entityType} ${entityId}`);
      } catch (error) {
        console.error(`Error al sincronizar ${entityType} ${entityId}:`, error);
        // Volver a poner en pendientes para reintentar
        if (!pendingChanges[entityType]) {
          pendingChanges[entityType] = {};
        }
        pendingChanges[entityType][entityId] = {
          ...pendingChanges[entityType][entityId] || {},
          ...changesSnapshot[entityType][entityId]
        };
        
        // Programar un reintento
        if (!syncTimeout) {
          syncTimeout = setTimeout(syncWithFirebase, SYNC_INTERVAL * 2);
        }
      }
    }
  }
};

// Función para sanitizar datos para Firebase
const sanitizeForFirebase = (data) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirebase(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    
    Object.entries(data).forEach(([key, value]) => {
      // Omitir valores undefined
      if (value !== undefined) {
        sanitized[key] = sanitizeForFirebase(value);
      }
    });
    
    return sanitized;
  }
  
  return data;
};

// Componentes memorizados para evitar re-renders innecesarios
const TableHeader = memo(({ sortConfig, handleSort }) => (
  <thead>
    <tr style={{ backgroundColor: styles.colors.headerBg, color: 'white' }}>
      <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort('id')}>
        <div className="flex items-center gap-2">
          Código
          {sortConfig.key === 'id' && (
            <ArrowUpDown className="h-4 w-4" />
          )}
        </div>
      </th>
      <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort('descripcion')}>
        <div className="flex items-center gap-2">
          Descripción
          {sortConfig.key === 'descripcion' && (
            <ArrowUpDown className="h-4 w-4" />
          )}
        </div>
      </th>
      <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort('categoria')}>
        <div className="flex items-center gap-2">
          Categoría
          {sortConfig.key === 'categoria' && (
            <ArrowUpDown className="h-4 w-4" />
          )}
        </div>
      </th>
      <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort('unidad')}>
        <div className="flex items-center gap-2">
          Unidad
          {sortConfig.key === 'unidad' && (
            <ArrowUpDown className="h-4 w-4" />
          )}
        </div>
      </th>
      <th className="px-4 py-3 text-right cursor-pointer" onClick={() => handleSort('precio_unitario')}>
        <div className="flex items-center justify-end gap-2">
          Precio Unitario
          {sortConfig.key === 'precio_unitario' && (
            <ArrowUpDown className="h-4 w-4" />
          )}
        </div>
      </th>
      <th className="px-4 py-3 text-center cursor-pointer" onClick={() => handleSort('fecha_actualizacion')}>
        <div className="flex items-center justify-center gap-2">
          Última Actualización
          {sortConfig.key === 'fecha_actualizacion' && (
            <ArrowUpDown className="h-4 w-4" />
          )}
        </div>
      </th>
      <th className="px-4 py-3 text-center">Acciones</th>
    </tr>
  </thead>
));

// Row separado como componente para mejorar rendimiento
const ItemRow = memo(({ 
  item, 
  editingItem, 
  setEditingItem, 
  categories, 
  handleUpdateMaterial,
  updateFieldWithDebounce, 
  handleDeleteMaterial, 
  formatDate,
  loading
}) => {
  // Prevenir re-renders con una referencia local
  const [localItem, setLocalItem] = useState({...item});
  
  // Actualizar referencia local cuando cambia el item externo
  useEffect(() => {
    if (item.id !== localItem.id) {
      setLocalItem({...item});
    }
  }, [item, localItem.id]);
  
  const isEditing = editingItem === item.id;
  
  // Funciones locales para manejar cambios
  const handleInputChange = (field, value) => {
    setLocalItem(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Actualizar en tiempo real campos sencillos
    if (['descripcion', 'categoria', 'unidad'].includes(field)) {
      updateFieldWithDebounce(item.id, field, value);
    }
  };
  
  const handlePriceChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setLocalItem(prev => ({
      ...prev,
      precio_unitario: numValue
    }));
    
    // Precios se sincronizan con debounce también
    updateFieldWithDebounce(item.id, 'precio_unitario', numValue);
  };
  
  const handleSave = () => {
    handleUpdateMaterial(item.id, localItem);
  };
  
  // Renderizado condicional para modo edición/visualización
  if (isEditing) {
    return (
      <tr className="border-b hover:bg-gray-50">
        <td className="px-4 py-2">{item.id}</td>
        <td className="px-4 py-2">
          <input
            type="text"
            className="w-full rounded border px-2 py-1"
            value={localItem.descripcion || ''}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
          />
        </td>
        <td className="px-4 py-2">
          <input
            type="text"
            className="w-full rounded border px-2 py-1"
            value={localItem.categoria || ''}
            list="categories-list-edit"
            onChange={(e) => handleInputChange('categoria', e.target.value)}
          />
          <datalist id="categories-list-edit">
            {categories.filter(cat => cat !== 'all').map(category => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </td>
        <td className="px-4 py-2">
          <input
            type="text"
            className="w-full rounded border px-2 py-1"
            value={localItem.unidad || ''}
            onChange={(e) => handleInputChange('unidad', e.target.value)}
          />
        </td>
        <td className="px-4 py-2">
          <NumericInput
            value={localItem.precio_unitario?.toString() || '0'}
            onChange={handlePriceChange}
            min={0}
            step="0.01"
            className="w-full rounded border px-2 py-1 text-right"
          />
        </td>
        <td className="px-4 py-2 text-center">
          {formatDate(item.fecha_actualizacion)}
        </td>
        <td className="px-4 py-2">
          <div className="flex justify-center gap-2">
            <button
              onClick={handleSave}
              className="p-1 rounded hover:bg-green-100"
              title="Guardar cambios"
              disabled={loading}
            >
              <Save className="h-5 w-5 text-green-600" />
            </button>
            <button
              onClick={() => setEditingItem(null)}
              className="p-1 rounded hover:bg-red-100"
              title="Cancelar edición"
            >
              <X className="h-5 w-5 text-red-600" />
            </button>
          </div>
        </td>
      </tr>
    );
  }
  
  // Modo visualización
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-2">{item.id}</td>
      <td className="px-4 py-2">{item.descripcion}</td>
      <td className="px-4 py-2">{item.categoria}</td>
      <td className="px-4 py-2">{item.unidad}</td>
      <td className="px-4 py-2 text-right">
        {typeof item.precio_unitario === 'number' 
          ? item.precio_unitario.toLocaleString('es-AR', { 
              style: 'currency', 
              currency: 'ARS' 
            })
          : '-'
        }
      </td>
      <td className="px-4 py-2 text-center">
        {formatDate(item.fecha_actualizacion)}
      </td>
      <td className="px-4 py-2">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setEditingItem(item.id)}
            className="p-1 rounded hover:bg-blue-100"
            title="Editar material"
          >
            <Pencil className="h-5 w-5 text-blue-600" />
          </button>
          <button
            onClick={() => handleDeleteMaterial(item.id)}
            className="p-1 rounded hover:bg-red-100"
            title="Eliminar material"
            disabled={loading}
          >
            <Trash2 className="h-5 w-5 text-red-600" />
          </button>
        </div>
      </td>
    </tr>
  );
});

// Componente nuevos materiales separado
const NewItemRow = memo(({ 
  newMaterial, 
  setNewMaterial, 
  handleAddMaterial, 
  categories, 
  loading 
}) => {
  const handleChange = (field, value) => {
    setNewMaterial(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <tr className="border-b bg-gray-50">
      <td className="px-4 py-2">
        <span className="text-gray-500">Autogenerado</span>
      </td>
      <td className="px-4 py-2">
        <input
          type="text"
          className="w-full rounded border px-2 py-1"
          placeholder="Descripción"
          value={newMaterial.descripcion}
          onChange={(e) => handleChange('descripcion', e.target.value)}
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="text"
          className="w-full rounded border px-2 py-1"
          placeholder="Categoría"
          list="categories-list"
          value={newMaterial.categoria}
          onChange={(e) => handleChange('categoria', e.target.value)}
        />
        <datalist id="categories-list">
          {categories.filter(cat => cat !== 'all').map(category => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </td>
      <td className="px-4 py-2">
        <input
          type="text"
          className="w-full rounded border px-2 py-1"
          placeholder="Unidad"
          value={newMaterial.unidad}
          onChange={(e) => handleChange('unidad', e.target.value)}
        />
      </td>
      <td className="px-4 py-2">
        <NumericInput
          value={newMaterial.precio_unitario.toString()}
          onChange={(value) => handleChange('precio_unitario', value)}
          min={0}
          step="0.01"
          className="w-full rounded border px-2 py-1 text-right"
          placeholder="0.00"
        />
      </td>
      <td className="px-4 py-2 text-center">-</td>
      <td className="px-4 py-2">
        <div className="flex justify-center">
          <button
            onClick={handleAddMaterial}
            className="p-1 rounded hover:bg-green-100"
            title="Agregar material"
            disabled={loading}
          >
            <Plus className="h-5 w-5 text-green-600" />
          </button>
        </div>
      </td>
    </tr>
  );
});

// Componente principal optimizado
const PriceManagement = () => {
  // Estados para los datos
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState(['all']);
  const [newMaterial, setNewMaterial] = useState({
    descripcion: '',
    categoria: '',
    unidad: '',
    precio_unitario: 0
  });

  // Estados para UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingAllMaterials, setLoadingAllMaterials] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estado para paginación
  const [lastVisibleItem, setLastVisibleItem] = useState(null);

  // Aplicar filtros cuando cambien los criterios
  useEffect(() => {
    if (!items || items.length === 0) return;
    
    let result = [...items];
    
    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.id && item.id.toLowerCase().includes(term)) || 
        (item.descripcion && item.descripcion.toLowerCase().includes(term))
      );
    }
    
    // Filtro por categoría - SOLO si no es 'all'
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(item => item.categoria === selectedCategory);
    }
    
    // Ordenar resultados
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === bValue) return 0;
      
      // Manejar valores nulos
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      // Para fechas, comparar timestamps
      if (sortConfig.key === 'fecha_actualizacion') {
        const dateA = aValue?.seconds ? aValue.seconds : 0;
        const dateB = bValue?.seconds ? bValue.seconds : 0;
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Para strings, usar localeCompare
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Para números, comparación directa
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    setFilteredItems(result);
  }, [items, searchTerm, selectedCategory, sortConfig]);

  // Función para ordenar
  const handleSort = useCallback((key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  }, [sortConfig]);

  // Cargar más items
  const loadMoreItems = useCallback(async (itemsToLoad = ITEMS_PER_PAGE) => {
    if (!hasMore || loading) return;
    
    try {
      setLoadingMore(true);
      
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
        limit(itemsToLoad)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Si no hay más resultados, deshabilitar "cargar más"
      if (querySnapshot.empty) {
        setHasMore(false);
        setLoadingMore(false);
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
      toast.error(`Error al cargar más items: ${err.message}`);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, items, lastVisibleItem, loading, sortConfig, totalCount]);

  // Cargar datos iniciales
  const loadItems = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Si no es forceRefresh, verificar caché primero
      if (!forceRefresh) {
        const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        
        if (cachedData) {
          const { items: cachedItems, timestamp, categories: cachedCategories, totalCount: cachedTotal } = JSON.parse(cachedData);
          
          // Si el caché es reciente, usarlo
          const cacheAge = Date.now() - timestamp;
          if (cacheAge < CACHE_TIMEOUT) {
            console.log('Usando datos en caché (< 10 min)');
            setItems(cachedItems);
            setFilteredItems(cachedItems);
            setTotalCount(cachedTotal);
            setCategories(['all', ...cachedCategories]);
            
            setInitialLoading(false);
            setLoading(false);
            return;
          }
        }
      }
      
      // CORRECCIÓN: Obtener TODOS los documentos sin limitar
      const materialsRef = collection(db, COLLECTION_NAME);
      const querySnapshot = await getDocs(materialsRef);
      
      const fetchedItems = [];
      const uniqueCategories = new Set();
      
      console.log(`Número total de documentos: ${querySnapshot.size}`);
      
      // Procesar los resultados
      querySnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        fetchedItems.push(item);
        
        // CORRECCIÓN: Añadir TODAS las categorías encontradas
        if (item.categoria) {
          uniqueCategories.add(item.categoria);
        } else {
          uniqueCategories.add('Sin categoría');
        }
      });
      
      // Categorías encontradas para diagnóstico
      console.log(`Categorías encontradas (${uniqueCategories.size}): ${Array.from(uniqueCategories).join(', ')}`);
      
      // Guardar categorías únicas (ordenadas alfabéticamente)
      const categoriesArray = Array.from(uniqueCategories).sort();
      
      // Guardar en caché
      const cacheData = {
        items: fetchedItems,
        timestamp: Date.now(),
        categories: categoriesArray,
        totalCount: fetchedItems.length
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cacheData));
      
      // Actualizar estado
      setItems(fetchedItems);
      setFilteredItems(fetchedItems); // Mostrar todos inicialmente
      setCategories(['all', ...categoriesArray]);
      setTotalCount(fetchedItems.length);
      setHasMore(false); // Ya cargamos todos
      
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(`Error al cargar datos: ${err.message}`);
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  }, []);
  
  // Cargar todos los materiales sin restricciones
  const loadAllMaterials = useCallback(async () => {
    if (loading || loadingAllMaterials) return;
    
    try {
      setLoadingAllMaterials(true);
      toast.info("Cargando todos los materiales...");
      
      // CORRECCIÓN: Cargar sin filtros ni límites
      const materialsRef = collection(db, COLLECTION_NAME);
      const querySnapshot = await getDocs(materialsRef);
      
      const allItems = [];
      const uniqueCategories = new Set();
      
      console.log(`Número total de documentos encontrados: ${querySnapshot.size}`);
      
      querySnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        allItems.push(item);
        
        // Recopilar todas las categorías únicas
        if (item.categoria) {
          uniqueCategories.add(item.categoria);
        } else {
          uniqueCategories.add('Sin categoría');
        }
      });
      
      console.log(`Total de materiales procesados: ${allItems.length}`);
      console.log(`Categorías encontradas (${uniqueCategories.size}): ${Array.from(uniqueCategories).join(', ')}`);
      
      // Ordenar según criterio actual
      allItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;
        
        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        return sortConfig.direction === 'asc' 
          ? (aValue - bValue) 
          : (bValue - aValue);
      });
      
      // Actualizar estado con TODOS los materiales
      setItems(allItems);
      
      // CORRECCIÓN: No aplicar filtros iniciales
      setFilteredItems(allItems);
      
      // CORRECCIÓN: Asegurar que tenemos todas las categorías
      setCategories(['all', ...Array.from(uniqueCategories).sort()]);
      setTotalCount(allItems.length);
      setHasMore(false);
      
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
      
    } catch (err) {
      console.error("Error al cargar todos los materiales:", err);
      setError(`Error: ${err.message}`);
      toast.error(`Error al cargar todos los materiales: ${err.message}`);
    } finally {
      setLoadingAllMaterials(false);
    }
  }, [loading, loadingAllMaterials, sortConfig]);
  
  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Actualizar campo individual con debounce (sistema de sincronización)
  const updateFieldWithDebounce = useCallback((itemId, field, value) => {
    // Actualizar localmente para UI responsiva
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          return { ...item, [field]: value };
        }
        return item;
      });
    });
    
    // Programar sincronización con Firebase
    scheduleSync({ [field]: value }, itemId, 'item');
  }, []);
  
  // CRUD: Añadir material
  const handleAddMaterial = async () => {
    try {
      // Validar campos requeridos
      if (!newMaterial.descripcion || !newMaterial.unidad) {
        setError("La descripción y unidad son campos obligatorios");
        toast.error("La descripción y unidad son campos obligatorios");
        return;
      }
      
      setLoading(true);
      
      // Crear nuevo documento en Firestore
      const materialsRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(materialsRef, {
        ...newMaterial,
        precio_unitario: parseFloat(newMaterial.precio_unitario) || 0,
        fecha_actualizacion: serverTimestamp(),
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
      setItems(prevItems => [newItem, ...prevItems]);
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
      
      toast.success("Material añadido correctamente");
    } catch (err) {
      console.error("Error al añadir material:", err);
      setError(`Error al añadir material: ${err.message}`);
      toast.error(`Error al añadir material: ${err.message}`);
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
        fecha_actualizacion: serverTimestamp()
      };
      
      // Actualizar en Firestore
      const itemRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(itemRef, dataToUpdate);
      
      // Actualizar estado local con timestamp simulado para la UI
      const localUpdateData = {
        ...dataToUpdate,
        fecha_actualizacion: new Date() // Usar Date actual para UI inmediata
      };
      
      // Actualizar estado local
      const updatedItems = items.map(item => 
        item.id === id ? { ...item, ...localUpdateData } : item
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
      if (updatedData.categoria && !categories.includes(updatedData.categoria)) {
        const newCategories = [...categories, updatedData.categoria].filter(cat => cat !== 'all').sort();
        setCategories(['all', ...newCategories]);
        
        // Actualizar categorías en caché
        if (cachedData) {
          const parsedCache = JSON.parse(cachedData);
          parsedCache.categories = newCategories;
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedCache));
        }
      }
      
      toast.success("Material actualizado correctamente");
    } catch (err) {
      console.error("Error al actualizar material:", err);
      setError(`Error al actualizar material: ${err.message}`);
      toast.error(`Error al actualizar material: ${err.message}`);
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
      
      toast.success("Material eliminado correctamente");
    } catch (err) {
      console.error("Error al eliminar material:", err);
      setError(`Error al eliminar material: ${err.message}`);
      toast.error(`Error al eliminar material: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Forzar actualización completa desde el servidor
  const handleForceRefresh = () => {
    if (window.confirm('Esta acción limpiará la caché y recargará todos los datos desde el servidor. ¿Desea continuar?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setLoading(true);
      loadItems(true); // Cargar directamente desde Firestore
      toast.info("Forzando actualización completa de datos...");
    }
  };
  
  // Limpiar caché
  const cleanLocalStorage = () => {
    if (window.confirm('Esta acción limpiará la caché local. Los datos volverán a cargarse al recargar la página. ¿Desea continuar?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      toast.success("Caché limpiada correctamente");
      
      // Opcional: recargar la página
      if (window.confirm('¿Desea recargar la página para obtener datos frescos?')) {
        window.location.reload();
      }
    }
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
  
  // Función para cargar más elementos
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    loadMoreItems(100); // Cargar 100 a la vez
  };
  
  // Uso de React.memo para prevenir renderizado innecesario
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setSelectedCategory(e.target.value);
  }, []);
  
  // Mensaje de error
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4" style={{ backgroundColor: styles.colors.background }}>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <div className="flex items-center">
            <span className="text-red-700">{error}</span>
            <button 
              className="ml-auto p-1 rounded hover:bg-red-100" 
              onClick={() => setError(null)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="mt-4">
            <button
              className="flex items-center gap-2 px-3 py-2 rounded text-red-600 hover:bg-red-50 border border-red-300"
              onClick={cleanLocalStorage}
            >
              <RotateCcw size={16} />
              Limpiar caché y reiniciar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6" style={{ backgroundColor: styles.colors.background, color: styles.colors.text }}>
      {/* Cabecera con contador y botones */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl flex items-center" style={{ 
          color: styles.colors.text,
          fontFamily: 'Kanit'
        }}>
          Gestión de Precios 
          <span className="ml-2 text-sm text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
            <span className="font-semibold">{filteredItems.length}</span> de <span className="font-semibold">{totalCount}</span> materiales
            {loading && <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin ml-1"></div>}
          </span>
        </h1>
        
        <div className="flex space-x-2">
          <button 
            className="flex items-center gap-2 px-3 py-2 rounded text-indigo-600 hover:bg-indigo-50 h-12 border border-indigo-300"
            onClick={loadAllMaterials}
            disabled={initialLoading || loading || loadingAllMaterials}
            title="Cargar todos los materiales"
          >
            <Database size={16} className={loadingAllMaterials ? "animate-pulse" : ""} />
            {loadingAllMaterials ? 'Cargando todos...' : 'Cargar todos'}
          </button>
          
          <button 
            className="flex items-center gap-2 px-3 py-2 rounded text-gray-600 hover:bg-gray-100 h-12 border border-gray-300"
            onClick={cleanLocalStorage}
            title="Limpiar caché y recargar"
          >
            <RotateCcw size={16} />
            Reiniciar
          </button>
          
          <button 
            className="flex items-center gap-2 px-3 py-2 rounded text-orange-600 hover:bg-orange-50 h-12 border border-orange-300"
            onClick={handleForceRefresh}
            title="Forzar actualización completa"
          >
            <RefreshCw size={16} />
            Forzar actualización
          </button>
          
          <button 
            className="flex items-center gap-2 px-3 py-2 rounded text-blue-600 hover:bg-blue-50 h-12 border border-blue-300"
            onClick={() => loadItems(true)}
            disabled={initialLoading || loading}
            title="Recargar todos los materiales"
          >
            <RefreshCw size={16} className={initialLoading || loading ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Búsqueda y Filtros con debounce */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-medium">Buscar y Filtrar</h2>
          <button 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Buscar por código o descripción</label>
            <DebouncedSearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar..."
              delay={300}
              className="h-12 text-lg focus:ring-2 focus:ring-blue-300"
              style={{ 
                borderColor: styles.colors.primary,
                color: styles.colors.text,
                fontFamily: 'Josefin Sans'
              }}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Categoría</label>
            <select
              className="w-full h-12 px-4 text-lg rounded border focus:outline-none focus:ring-2"
              style={{ 
                borderColor: styles.colors.primary,
                backgroundColor: 'white',
                color: styles.colors.text,
                fontFamily: 'Josefin Sans'
              }}
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Todas las categorías' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-md font-medium mb-2">Filtros avanzados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Ordenar por</label>
                <select
                  className="w-full px-3 py-2 rounded border"
                  style={{ borderColor: styles.colors.primary }}
                  value={sortConfig.key || 'id'}
                  onChange={(e) => handleSort(e.target.value)}
                >
                  <option value="id">Código</option>
                  <option value="descripcion">Descripción</option>
                  <option value="categoria">Categoría</option>
                  <option value="precio_unitario">Precio</option>
                  <option value="fecha_actualizacion">Fecha</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Dirección</label>
                <select
                  className="w-full px-3 py-2 rounded border"
                  style={{ borderColor: styles.colors.primary }}
                  value={sortConfig.direction || 'asc'}
                  onChange={(e) => setSortConfig({...sortConfig, direction: e.target.value})}
                >
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Estado</label>
                <select
                  className="w-full px-3 py-2 rounded border"
                  style={{ borderColor: styles.colors.primary }}
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Información de items mostrados */}
      <div className="py-2 px-4 bg-white rounded shadow-sm text-sm">
        <div className="flex justify-between items-center">
          <span>
            Mostrando {filteredItems.length} de {totalCount} materiales
            {(searchTerm || selectedCategory !== 'all') && ' (filtrados)'}
          </span>
          <span className="font-medium">{Math.round((filteredItems.length / totalCount) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(100, (filteredItems.length / totalCount) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Tabla de items */}
      <div className="overflow-hidden rounded-lg shadow">
        <table className="w-full">
          <TableHeader sortConfig={sortConfig} handleSort={handleSort} />
          <tbody>
            {/* Fila para nuevo material */}
            <NewItemRow 
              newMaterial={newMaterial}
              setNewMaterial={setNewMaterial}
              handleAddMaterial={handleAddMaterial}
              categories={categories}
              loading={loading}
            />

            {/* Estado de carga inicial */}
            {initialLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2">Cargando materiales...</p>
                  </div>
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No se encontraron materiales
                  {searchTerm || selectedCategory !== 'all' ? 
                    ' que coincidan con los criterios de búsqueda.' : '.'}
                </td>
              </tr>
            ) : (
              // Renderizar solo los items visibles para mejorar rendimiento
              filteredItems.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  editingItem={editingItem}
                  setEditingItem={setEditingItem}
                  categories={categories}
                  handleUpdateMaterial={handleUpdateMaterial}
                  updateFieldWithDebounce={updateFieldWithDebounce}
                  handleDeleteMaterial={handleDeleteMaterial}
                  formatDate={formatDate}
                  loading={loading}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Botón de cargar más */}
      {hasMore && !initialLoading && (
        <div className="flex justify-center">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Cargando más...</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                <span>Cargar más</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Indicador de loading flotante */}
      {loading && !initialLoading && !loadingMore && !loadingAllMaterials && (
        <div className="fixed bottom-4 right-4 bg-white p-2 rounded-full shadow-lg">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {/* Indicador de carga total */}
      {loadingAllMaterials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <div className="flex items-center mb-4">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mr-3"></div>
              <h3 className="text-lg font-bold">Cargando todos los materiales</h3>
            </div>
            <p className="mb-2">Esto puede tomar varios segundos...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceManagement;