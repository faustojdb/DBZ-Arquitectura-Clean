import React from 'react';
import { ChevronRight, ChevronDown, Edit, Trash2 } from 'lucide-react';

// Estilos para el componente
const styles = {
  analysisRow: {
    display: 'flex',
    width: '100%',
    padding: '10px',
    borderBottom: '1px solid #e2e8f0',
    alignItems: 'center',
    transition: 'background-color 0.2s ease',
    backgroundColor: 'white',
  },
  expandIcon: {
    marginRight: '8px',
    cursor: 'pointer',
    color: '#1e3a5f',
    display: 'flex',
    alignItems: 'center',
  },
  codeCell: {
    fontFamily: 'Josefin Sans, sans-serif',
    fontWeight: 'bold',
    width: '80px',
    minWidth: '80px',
    display: 'flex',
    alignItems: 'center',
  },
  nameCell: {
    fontFamily: 'Josefin Sans, sans-serif',
    flex: 1,
    padding: '0 10px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  unitCell: {
    width: '80px',
    textAlign: 'center',
  },
  costCell: {
    fontFamily: 'Josefin Sans, sans-serif',
    fontWeight: 'bold',
    width: '120px',
    textAlign: 'right',
  },
  dateCell: {
    width: '120px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.85rem',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '5px',
    width: '80px',
  },
  actionButton: {
    padding: '4px',
    margin: '0 2px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    color: '#3B82F6',
  },
  deleteButton: {
    color: '#EF4444',
  },
  loading: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    marginLeft: '8px',
    border: '2px solid rgba(30, 58, 95, 0.2)',
    borderTopColor: '#F3B340',
    borderRadius: '50%',
    animation: 'spin 1s infinite linear',
  }
};

interface AnalysisRowProps {
  analysis: any;
  isExpanded: boolean;
  isLoading: boolean;
  toggleAnalysis: () => void;
  handleDeleteAnalysis: (id: string) => void;
  setEditingAnalysis: (id: string | null) => void;
  formatDate: (timestamp: any) => string;
}

const AnalysisRow: React.FC<AnalysisRowProps> = ({
  analysis,
  isExpanded,
  isLoading,
  toggleAnalysis,
  handleDeleteAnalysis,
  setEditingAnalysis,
  formatDate
}) => {
  return (
    <div 
      style={{
        ...styles.analysisRow,
        backgroundColor: isExpanded ? '#f0f5ff' : 'white',
      }} 
      className="hover:bg-gray-50"
    >
      {/* Columna expandir */}
      <div 
        style={styles.expandIcon}
        onClick={(e) => {
          e.stopPropagation();
          toggleAnalysis();
        }}
        className="hover:bg-gray-100 rounded p-1"
      >
        {isExpanded ? 
          <ChevronDown size={18} strokeWidth={2.5} /> : 
          <ChevronRight size={18} strokeWidth={2.5} />
        }
      </div>
      
      {/* Columna código */}
      <div style={styles.codeCell}>
        {analysis.codigoDisplay}
        {isLoading && (
          <div style={styles.loading} className="animate-spin"></div>
        )}
      </div>
      
      {/* Columna nombre */}
      <div style={styles.nameCell} title={analysis.nombre}>
        {analysis.nombre}
      </div>
      
      {/* Columna unidad */}
      <div style={styles.unitCell}>
        {analysis.unidad || '-'}
      </div>
      
      {/* Columna costo */}
      <div style={styles.costCell}>
        {typeof analysis.costo_total === 'number' 
          ? `${analysis.costo_total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` 
          : '-'
        }
      </div>
      
      {/* Columna fecha */}
      <div style={styles.dateCell}>
        {analysis.fecha_actualizacion ? formatDate(analysis.fecha_actualizacion) : '-'}
      </div>
      
      {/* Columna acciones */}
      <div style={styles.actionButtons}>
        <button
          style={{...styles.actionButton, ...styles.editButton}}
          className="hover:bg-blue-100"
          onClick={(e) => {
            e.stopPropagation();
            setEditingAnalysis(analysis.id);
          }}
          title="Editar análisis"
        >
          <Edit size={18} />
        </button>
        <button
          style={{...styles.actionButton, ...styles.deleteButton}}
          className="hover:bg-red-100"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteAnalysis(analysis.id);
          }}
          title="Eliminar análisis"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default AnalysisRow;