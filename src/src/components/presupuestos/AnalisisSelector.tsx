// src/components/presupuestos/AnalisisSelector.tsx
import React, { useState, useEffect } from 'react';
import useAnalisis from '../../hooks/useAnalisis';
import { formatCurrency } from '../../utils/formatters';

interface AnalisisSelectorProps {
  onSelect: (analisis: any) => void;
  onCancel?: () => void;
}

/**
 * Componente para buscar y seleccionar análisis de costos
 */
const AnalisisSelector: React.FC<AnalisisSelectorProps> = ({ onSelect, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const { analisis, loading, error, searchAnalisis, fetchAllRubros } = useAnalisis();
  const [initialized, setInitialized] = useState(false);
  
  // Cargar análisis iniciales
  useEffect(() => {
    if (!initialized) {
      console.log('Cargando análisis iniciales...');
      
      // Modificamos para usar fetchAllRubros en lugar de getInitialAnalisis
      const cargarAnalisisIniciales = async (limit = 20) => {
        try {
          // Buscar análisis para el primer rubro como muestra inicial
          await fetchAllRubros(1);
          setInitialized(true);
          console.log('Análisis iniciales cargados');
          return true;
        } catch (error) {
          console.error('Error al cargar análisis iniciales:', error);
          return false;
        }
      };
      
      cargarAnalisisIniciales();
    }
  }, [fetchAllRubros, initialized]);
  
  // Debounce para la búsqueda
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);
  
  // Buscar análisis cuando cambia el término de búsqueda debounced
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      console.log(`Buscando análisis con término: "${debouncedSearchTerm}"`);
      // Verificar que la función existe antes de llamarla
      if (typeof searchAnalisis === 'function') {
        searchAnalisis(debouncedSearchTerm);
      } else {
        // Alternativa: buscar en los análisis ya cargados
        console.log("Función searchAnalisis no disponible, filtrando resultados localmente");
        // Esto sería una implementación de respaldo si la función de API no está disponible
        // Aquí podrías implementar una búsqueda local en los datos que ya tienes
      }
    }
  }, [debouncedSearchTerm, searchAnalisis]);
  
  // Manejar cambio en el campo de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Manejar selección de un análisis
  const handleSelectAnalisis = (analisis: any) => {
    onSelect(analisis);
  };
  
  // Función para cargar todos los análisis (reemplaza getInitialAnalisis)
  const cargarTodosAnalisis = async () => {
    try {
      // Cargar análisis para el primer rubro como muestra
      await fetchAllRubros(1);
    } catch (err) {
      console.error("Error al cargar análisis:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      {/* Estilos CSS */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@600&family=Kanit:wght@500&display=swap');
          
          .dbz-title {
            font-family: 'Kanit', sans-serif;
            font-weight: 500;
            color: #364C63;
          }
          
          .arquitectura-title {
            font-family: 'Josefin Sans', sans-serif;
            font-weight: 600;
            color: #364C63;
          }
        `}
      </style>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold dbz-title">Seleccionar Análisis de Costos</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          className="w-full p-2 border border-gray-300 rounded"
          value={searchTerm}
          onChange={handleSearchChange}
          autoFocus
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Ingrese al menos 2 caracteres para buscar</span>
          <span>{analisis.length} resultados</span>
        </div>
      </div>
      
      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 mt-2">Buscando análisis...</p>
        </div>
      )}
      
      {/* Error */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <p className="font-semibold">Error al buscar análisis:</p>
          <p>{error}</p>
          <button
            onClick={cargarTodosAnalisis}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}
      
      {/* Instrucciones iniciales */}
      {!loading && !error && analisis.length === 0 && !initialized && (
        <div className="text-center py-4 text-gray-500">
          <div className="inline-block w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-2">Cargando análisis iniciales...</p>
        </div>
      )}
      
      {/* Mensaje cuando no hay resultados */}
      {!loading && !error && debouncedSearchTerm.length >= 2 && analisis.length === 0 && initialized && (
        <div className="text-center py-4 text-gray-500">
          <p>No se encontraron análisis que coincidan con "{debouncedSearchTerm}"</p>
          <button
            onClick={cargarTodosAnalisis}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Mostrar análisis iniciales
          </button>
        </div>
      )}
      
      {/* Tabla de resultados */}
      {!loading && !error && analisis.length > 0 && (
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead style={{backgroundColor: '#F3B340'}} className="sticky top-0">
              <tr>
                <th className="p-2 border border-gray-300 text-left">Código</th>
                <th className="p-2 border border-gray-300 text-left">Nombre</th>
                <th className="p-2 border border-gray-300 text-center">Unidad</th>
                <th className="p-2 border border-gray-300 text-right">Costo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analisis.map(item => (
                <tr 
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectAnalisis(item)}
                >
                  <td className="p-2 border border-gray-300 text-sm font-medium">{item.codigo_display}</td>
                  <td className="p-2 border border-gray-300 text-sm">{item.nombre}</td>
                  <td className="p-2 border border-gray-300 text-sm text-center">{item.unidad}</td>
                  <td className="p-2 border border-gray-300 text-sm text-right">{formatCurrency(item.costo_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Botones de acción */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mr-2"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

export default AnalisisSelector;