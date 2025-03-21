import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import AddButton from './AddButton';

interface Material {
  id: string;
  descripcion: string;
  precio_unitario: number;
  unidad: string;
}

interface MaterialSelectorProps {
  availableItems: Material[];
  onSelect?: (material: Material | null) => void;
  onClose?: () => void;
  onAddToAnalysis?: (material: Material) => void;
  selectedMaterial?: Material | null;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  availableItems,
  onSelect,
  onClose,
  onAddToAnalysis,
  selectedMaterial = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Inicializar con todos los materiales disponibles
  useEffect(() => {
    if (availableItems && availableItems.length > 0) {
      setFilteredMaterials(availableItems.slice(0, 20));
    }
  }, [availableItems]);
  
  // Actualizar filtrados cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      // Si no hay búsqueda, mostrar los primeros 20 elementos
      setFilteredMaterials(availableItems.slice(0, 20));
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    // Filtrar por código o descripción
    const filtered = availableItems.filter(material => 
      material.id?.toLowerCase().includes(term) ||
      material.descripcion?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(term)
    ).slice(0, 20); // Limitar a 20 resultados para rendimiento
    
    setFilteredMaterials(filtered);
  }, [searchTerm, availableItems]);
  
  // Focus en el input al montar el componente
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Formatear precio para mostrar
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '-';
    
    return `$ ${price.toFixed(2)}`;
  };

  // Manejar clic en el botón de agregar
  const handleAddMaterial = (material: Material, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Verificar que onAddToAnalysis existe y es una función
    if (onAddToAnalysis && typeof onAddToAnalysis === 'function') {
      onAddToAnalysis(material);
    } else if (onSelect && typeof onSelect === 'function') {
      // Usar onSelect como alternativa si está disponible
      onSelect(material);
      // Si hay una función de cierre, cerrar el selector
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    } else {
      console.warn('No se ha proporcionado una función para manejar la adición del material:', material.id);
    }
  };

  return (
    <div className="material-selector">
      {/* Barra de búsqueda */}
      <div className="mb-3 relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-10 py-2 border rounded focus:outline-none"
          placeholder="Buscar por código o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Lista de materiales */}
      <div className="overflow-auto max-h-96">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Código</th>
              <th className="px-4 py-2 text-left">Descripción</th>
              <th className="px-4 py-2 text-right">Precio</th>
              <th className="px-4 py-2 text-center">Unidad</th>
              <th className="px-4 py-2 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((material) => (
              <tr key={material.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{material.id}</td>
                <td className="px-4 py-2">{material.descripcion}</td>
                <td className="px-4 py-2 text-right">{formatPrice(material.precio_unitario)}</td>
                <td className="px-4 py-2 text-center">{material.unidad}</td>
                <td className="px-4 py-2 text-center">
                  <AddButton 
                    onClick={(e) => handleAddMaterial(material, e)}
                    size="md"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredMaterials.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No se encontraron materiales que coincidan con la búsqueda
          </div>
        )}
      </div>

      {/* Botón de cancelar */}
      {onClose && (
        <div className="mt-4 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default MaterialSelector;