import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

// Estilos para el componente
const styles = {
  categoryRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#1e3a5f',
    color: 'white',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'background-color 0.2s ease',
  },
  categoryName: {
    fontSize: '16px',
    fontWeight: 'bold',
    fontFamily: 'Kanit, sans-serif',
    display: 'flex',
    alignItems: 'center',
  },
  categoryNumber: {
    color: '#F3B340',
    marginRight: '8px',
    display: 'inline-block',
    minWidth: '30px',
  },
  expandIcon: {
    marginRight: '12px',
    transition: 'transform 0.2s ease',
  },
  loading: {
    marginLeft: '12px',
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#F3B340',
    borderRadius: '50%',
    animation: 'spin 1s infinite linear',
  }
};

// Definir la interfaz para el objeto de categoría/rubro
interface CategoryObject {
  id: string;
  name: string;
  minCode?: string;
  maxCode?: string;
  color?: string;
}

interface CategoryRowProps {
  category: string | CategoryObject;
  name?: string;
  isExpanded: boolean;
  isLoading: boolean;
  toggleCategory: () => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  name,
  isExpanded,
  isLoading,
  toggleCategory
}) => {
  // Extraer la información de categoría basada en el tipo de dato recibido
  const getCategoryInfo = () => {
    // Si category es un string con formato CATEGORY_X
    if (typeof category === 'string' && category.includes('CATEGORY_')) {
      return {
        number: category.replace('CATEGORY_', ''),
        displayName: name || `Categoría ${category.replace('CATEGORY_', '')}`,
        color: '#F3B340' // Color por defecto
      };
    }
    // Si category es un ID numérico como string
    else if (typeof category === 'string' && !isNaN(Number(category))) {
      const id = category.padStart(2, '0'); // Asegurar formato XX
      return {
        number: id,
        displayName: name || `Rubro ${id}`,
        color: '#F3B340' // Color por defecto
      };
    }
    // Si category es un objeto con la estructura esperada
    else if (category && typeof category === 'object') {
      const categoryObj = category as CategoryObject;
      
      // Para rubro objeto, priorizar minCode como número
      const number = categoryObj.minCode || categoryObj.id;
      
      return {
        number: number,
        displayName: categoryObj.name || name || categoryObj.id,
        color: categoryObj.color || '#F3B340'
      };
    }
    // Caso por defecto
    else {
      return {
        number: '??',
        displayName: name || 'Categoría',
        color: '#F3B340'
      };
    }
  };
  
  // Obtener información formateada de la categoría
  const { number, displayName, color } = getCategoryInfo();
  
  // Asegurarnos de que toggleCategory es una función antes de llamarla
  const handleToggleClick = (e: React.MouseEvent) => {
    // Para evitar propagación en caso de que este componente esté dentro de otros clickables
    e.stopPropagation();
    
    if (typeof toggleCategory === 'function') {
      toggleCategory();
    } else {
      console.error('toggleCategory no es una función', toggleCategory);
    }
  };
  
  return (
    <div 
      style={styles.categoryRow}
      onClick={handleToggleClick}
      className="hover:bg-opacity-90"
    >
      <div style={styles.expandIcon}>
        {isExpanded ? 
          <ChevronDown size={20} strokeWidth={2.5} /> : 
          <ChevronRight size={20} strokeWidth={2.5} />
        }
      </div>
      <div style={styles.categoryName}>
        <span style={{...styles.categoryNumber, color: color}}>{number}.</span>
        <span className="category-name-text">{displayName}</span>
        {isLoading && (
          <div style={styles.loading} className="animate-spin"></div>
        )}
      </div>
    </div>
  );
};

export default CategoryRow;