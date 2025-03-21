import React, { useState, useEffect } from 'react';
import { X, Plus, Search } from 'lucide-react';
import MaterialSelector from './MaterialSelector';

// Este componente gestiona el flujo completo para seleccionar y agregar materiales
// Se integra directamente en la vista de detalle del análisis

interface Material {
  id: string;
  descripcion: string;
  precio_unitario: number;
  unidad: string;
}

interface MaterialSelectorIntegrationProps {
  availableItems: Material[];
  onAddMaterial: (material: Material) => void;
  isVisible?: boolean;
  onClose?: () => void;
}

const MaterialSelectorIntegration: React.FC<MaterialSelectorIntegrationProps> = ({
  availableItems,
  onAddMaterial,
  isVisible = true,
  onClose
}) => {
  // Estado para controlar la visibilidad
  const [isOpen, setIsOpen] = useState(isVisible);
  
  // Si cambia el prop isVisible, actualizar estado interno
  useEffect(() => {
    setIsOpen(isVisible);
  }, [isVisible]);
  
  // Manejar la adición de un material
  const handleAddMaterial = (material: Material) => {
    if (onAddMaterial) {
      onAddMaterial(material);
    }
  };
  
  // Cerrar el selector
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };
  
  // Si no está visible, retornar null
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="material-selector-container">
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Seleccionar Material</h3>
        <button
          onClick={handleClose}
          className="p-1 rounded hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <MaterialSelector
        availableItems={availableItems}
        onAddToAnalysis={handleAddMaterial}
        onClose={handleClose}
      />
    </div>
  );
};

// Exportamos un componente adicional: el botón que muestra el selector
export const AddMaterialButton: React.FC<{
  onClick: () => void;
  label?: string;
  variant?: 'primary' | 'secondary';
}> = ({
  onClick,
  label = 'Agregar Material',
  variant = 'primary'
}) => {
  const primaryStyles = "bg-[#F3B340] text-white hover:bg-[#E66A2C]";
  const secondaryStyles = "bg-white text-[#F3B340] border border-[#F3B340] hover:bg-[#F3B340] hover:bg-opacity-10";
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${variant === 'primary' ? primaryStyles : secondaryStyles}`}
    >
      <Plus className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};

export default MaterialSelectorIntegration;