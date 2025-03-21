import React from 'react';
import { Plus } from 'lucide-react';

interface AddButtonProps {
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
}

const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  className = '',
  size = 'md',
  title = 'Agregar material'
}) => {
  // Determinar tamaño del botón
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };
  
  // Determinar tamaño del icono
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };
  
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full border border-[#F3B340] bg-white text-[#F3B340] hover:bg-[#F3B340] hover:bg-opacity-10 transition-colors ${sizeClasses[size]} ${className}`}
      title={title}
    >
      <Plus size={iconSizes[size]} />
    </button>
  );
};

export default AddButton;