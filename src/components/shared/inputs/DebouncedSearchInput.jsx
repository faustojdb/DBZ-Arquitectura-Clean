import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';

/**
 * Componente de búsqueda con debounce para mejor performance
 * Evita actualizaciones excesivas mientras el usuario escribe
 */
const DebouncedSearchInput = ({
  value,
  onChange,
  placeholder = "Buscar...",
  delay = 300,
  className = "",
  style = {}
}) => {
  // Estado local (para respuesta inmediata de la UI)
  const [inputValue, setInputValue] = useState(value);
  const timerRef = useRef(null);
  
  // Sincronizar con prop externa
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Manejar cambio con debounce
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Actualizar inmediatamente el valor visual
    setInputValue(newValue);
    
    // Cancelar cualquier timer pendiente
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Programar la actualización real después del delay
    timerRef.current = setTimeout(() => {
      onChange(newValue);
      timerRef.current = null;
    }, delay);
  };
  
  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Manejar la limpieza del campo
  const handleClear = () => {
    setInputValue('');
    onChange('');
    
    // Cancelar cualquier timer pendiente
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  
  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full rounded border pl-10 pr-8 py-2 ${className}`}
        style={style}
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default DebouncedSearchInput;