import React from 'react';
import { Plus } from 'lucide-react';
import { categories } from '../constants/categories';
import CategoryRow from '../components/CategoryRow';
import AnalysisRow from '../components/AnalysisRow';
import AnalysisContent from '../components/AnalysisContent';

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '24px 0',
    color: '#364C63'
  },
  header: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#364C63',
    fontFamily: 'Kanit, sans-serif'
  },
  searchContainer: {
    marginBottom: '24px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontFamily: 'Josefin Sans, sans-serif'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#F3B340',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontWeight: 'bold',
    marginBottom: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  tableHeader: {
    backgroundColor: '#1e3a5f',
    color: 'white',
    textAlign: 'left'
  },
  tableHeaderCell: {
    padding: '12px 16px',
    fontWeight: 'bold',
    fontFamily: 'Kanit, sans-serif'
  },
  noData: {
    padding: '24px',
    textAlign: 'center',
    fontSize: '16px',
    color: '#666'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 0'
  },
  loadingSpinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderTopColor: '#F3B340',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginLeft: '16px',
    fontSize: '16px',
    color: '#364C63'
  },
  error: {
    backgroundColor: '#FECACA',
    border: '1px solid #F87171',
    color: '#B91C1C',
    padding: '16px',
    borderRadius: '4px',
    marginBottom: '24px'
  },
  headerActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  }
};

const CostAnalysisView = ({
  error,
  loading,
  loadingCategories,
  loadingAnalyses,
  searchTerm,
  editingAnalysis,
  editingItem,
  expandedCategories,
  expandedAnalyses,
  availableItems,
  groupedAnalyses,
  setSearchTerm,
  toggleCategory,
  toggleAnalysis,
  setEditingAnalysis,
  setEditingItem,
  handleUpdateAnalysis,
  handleDeleteAnalysis,
  handleAddItem,
  handleUpdateItem,
  handleDeleteItem,
  setNewItem,
  formatDate,
  onCreateAnalysis
}) => {
  // Funciones para filtrar análisis por término de búsqueda
  const filterAnalyses = (analyses) => {
    if (!searchTerm) return analyses;
    
    return analyses.filter(analysis => 
      analysis.codigoDisplay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Verificar si hay análisis después de aplicar los filtros
  const hasVisibleAnalyses = Object.values(groupedAnalyses).some(analyses => 
    filterAnalyses(analyses).length > 0
  );

  return (
    <div style={styles.container}>
      {/* Título y controles superiores */}
      <div style={styles.headerActions}>
        <h1 style={styles.header}>Análisis de Costos</h1>
        <button 
          style={styles.addButton}
          className="hover:bg-yellow-500"
          onClick={onCreateAnalysis}
        >
          <Plus size={18} />
          Nuevo Análisis
        </button>
      </div>
      
      {/* Mensaje de error */}
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}
      
      {/* Búsqueda */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Cargando */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner} className="animate-spin"></div>
          <span style={styles.loadingText}>Cargando análisis...</span>
        </div>
      ) : (
        <>
          {/* Tabla de análisis */}
          {!hasVisibleAnalyses && !loading ? (
            <div style={styles.noData}>
              No se encontraron análisis que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg shadow">
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell} className="w-1/6">Código</th>
                    <th style={styles.tableHeaderCell} className="w-2/6">Nombre</th>
                    <th style={styles.tableHeaderCell} className="w-1/12">Unidad</th>
                    <th style={styles.tableHeaderCell} className="w-1/12">Rendimiento</th>
                    <th style={styles.tableHeaderCell} className="w-1/6">Costo Total</th>
                    <th style={styles.tableHeaderCell} className="w-1/6">Última Actualización</th>
                    <th style={styles.tableHeaderCell} className="w-1/12">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Iterar categorías desde categories.ts */}
                  {categories.map((category) => {
                    // Usar category.id para buscar análisis en groupedAnalyses
                    const analyses = groupedAnalyses[category.id] || [];
                    const filteredAnalyses = filterAnalyses(analyses);
                    const isExpanded = expandedCategories[category.id] || false;
                    const isLoading = loadingCategories[category.id] || false;
                    
                    // Si no hay análisis después de filtrar y hay término de búsqueda, omitir categoría
                    if (searchTerm && filteredAnalyses.length === 0) {
                      return null;
                    }
                    
                    return (
                      <React.Fragment key={category.id}>
                        {/* Fila de categoría */}
                        <tr>
                          <td colSpan={7} className="p-0">
                            <CategoryRow
                              category={category}
                              name={category.name}
                              isExpanded={isExpanded}
                              isLoading={isLoading}
                              toggleCategory={() => toggleCategory(category.id)}
                            />
                          </td>
                        </tr>
                        
                        {/* Filas de análisis (solo si la categoría está expandida) */}
                        {isExpanded && (
                          <>
                            {filteredAnalyses.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500">
                                  No hay análisis en esta categoría.
                                </td>
                              </tr>
                            ) : (
                              filteredAnalyses.map(analysis => {
                                const isAnalysisExpanded = expandedAnalyses[analysis.id] || false;
                                const isAnalysisLoading = loadingAnalyses[analysis.id] || false;
                                
                                return (
                                  <React.Fragment key={analysis.id}>
                                    {/* Fila principal del análisis */}
                                    <AnalysisRow
                                      analysis={analysis}
                                      isExpanded={isAnalysisExpanded}
                                      isLoading={isAnalysisLoading}
                                      toggleAnalysis={() => toggleAnalysis(analysis.id)}
                                      handleDeleteAnalysis={handleDeleteAnalysis}
                                      setEditingAnalysis={setEditingAnalysis}
                                      formatDate={formatDate}
                                    />
                                    
                                    {/* Contenido expandido del análisis */}
                                    {isAnalysisExpanded && (
                                      <tr>
                                        <td colSpan={7} className="p-0">
                                          <AnalysisContent
                                            analysis={analysis}
                                            availableItems={availableItems}
                                            handleAddItem={() => handleAddItem(analysis.id)}
                                            handleUpdateItem={(itemKey, updatedItem) => 
                                              handleUpdateItem(analysis.id, itemKey, updatedItem)
                                            }
                                            handleDeleteItem={(itemKey) => 
                                              handleDeleteItem(analysis.id, itemKey)
                                            }
                                            editingItem={editingItem}
                                            setEditingItem={setEditingItem}
                                          />
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })
                            )}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CostAnalysisView;