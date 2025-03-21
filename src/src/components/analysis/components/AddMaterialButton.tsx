import React from 'react';
import { Plus } from 'lucide-react';

interface AddMaterialButtonProps {
  onClick: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'minimal' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  primaryColor?: string;
  label?: string;
}

const AddMaterialButton: React.FC<AddMaterialButtonProps> = ({
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  primaryColor = '#F3B340', // Color primario por defecto
  label = 'Agregar Material'
}) => {
  // Tamaños para el botón
  const sizeClasses = {
    sm: {
      button: 'h-7',
      padding: variant === 'icon-only' ? 'p-1' : 'px-2',
      icon: 'h-3.5 w-3.5',
      text: 'text-xs',
    },
    md: {
      button: 'h-9',
      padding: variant === 'icon-only' ? 'p-1.5' : 'px-3',
      icon: 'h-4 w-4',
      text: 'text-sm',
    },
    lg: {
      button: 'h-11',
      padding: variant === 'icon-only' ? 'p-2' : 'px-4',
      icon: 'h-5 w-5',
      text: 'text-base',
    },
  };

  // Estilos base para todas las variantes
  const baseClasses = 'transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50';
  
  // Variantes de estilo
  let variantClasses = '';
  let iconColor = '';
  
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-[#F3B340] text-white hover:bg-opacity-90 focus:ring-[#F3B340]';
      iconColor = 'text-white';
      break;
    case 'secondary':
      variantClasses = 'bg-white border border-[#F3B340] text-[#F3B340] hover:bg-[#F3B340] hover:bg-opacity-10 focus:ring-[#F3B340]';
      iconColor = 'text-[#F3B340]';
      break;
    case 'minimal':
      variantClasses = 'bg-gray-50 text-gray-700 hover:bg-gray-100 focus:ring-gray-200';
      iconColor = 'text-gray-700';
      break;
    case 'icon-only':
      // Variante circular solo con icono
      variantClasses = 'rounded-full border border-[#F3B340] bg-white text-[#F3B340] hover:bg-[#F3B340] hover:bg-opacity-10 focus:ring-[#F3B340]';
      iconColor = 'text-[#F3B340]';
      break;
  }

  // Estilos para estado deshabilitado
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  // Clases de forma
  const shapeClasses = variant === 'icon-only' ? 
    (size === 'sm' ? 'w-7' : size === 'md' ? 'w-9' : 'w-11') : 
    'rounded';
  
  // Clases para el ícono
  const iconClasses = `${sizeClasses[size].icon} ${iconColor}`;
  
  // Clases de distribución de elementos (flex)
  const flexClasses = 'flex items-center justify-center gap-1';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses}
        ${sizeClasses[size].button}
        ${sizeClasses[size].padding}
        ${shapeClasses}
        ${disabledClasses}
        ${flexClasses}
        ${className}
      `}
      title={label}
      style={{
        backgroundColor: variant === 'primary' ? primaryColor : '',
        borderColor: variant !== 'minimal' ? primaryColor : '',
        color: variant === 'primary' ? 'white' : (variant !== 'minimal' ? primaryColor : '')
      }}
    >
      <Plus className={iconClasses} />
      {variant !== 'icon-only' && (
        <span className={sizeClasses[size].text}>{label}</span>
      )}
    </button>
  );
};

export default AddMaterialButton;