import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Save, X, Plus } from 'lucide-react';
import MaterialSelector from './MaterialSelector';
import UpdatePricesButton from './UpdatePricesButton';
import AddButton from './AddButton';

const styles = {
  container: {
    padding: '16px 24px 24px',
    backgroundColor: '#f8fafc',
    borderTop: '1px dashed #cbd5e1',
  },
  header: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#1e3a5f',
    fontFamily: 'Kanit, sans-serif'
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '16px',
  },
  tableHeader: {
    backgroundColor: '#e2e8f0',
    fontWeight: 'bold',
    color: '#1e3a5f',
    fontFamily: 'Kanit, sans-serif'
  },
  tableHeaderCell: {
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '14px',
  },
  tableRow: {
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: 'white',
  },
  tableCell: {
    padding: '10px 12px',
    fontSize: '14px',
  },
  editableCell: {
    padding: '6px',
  },
  numericCell: {
    textAlign: 'right',
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '14px',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#F3B340',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  actionButton: {
    padding: '4px',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    color: '#1e3a5f',
  },
  deleteButton: {
    color: '#1e3a5f',
  },
  saveButton: {
    color: '#10B981',
  },
  cancelButton: {
    color: '#6B7280',
  },
  summary: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#1e3a5f',
    fontFamily: 'Kanit, sans-serif'
  },
  summaryTable: {
    width: '100%',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  summaryLabel: {
    color: '#64748b',
  },
  summaryValue: {
    fontWeight: 'bold',
    fontFamily: 'Josefin Sans, sans-serif'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0 0',
    marginTop: '8px',
    borderTop: '2px solid #e2e8f0',
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#1e3a5f',
  },
  emptyState: {
    textAlign: 'center',
    padding: '24px',
    color: '#64748b',
  }
};

const AnalysisContent = ({
  analysis,
  availableItems,
  handleAddItem,
  handleUpdateItem,
  handleDeleteItem,
  handleUpdateAnalysis,
  editingItem,
  setEditingItem
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [tempItem, setTempItem] = useState({});
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);
  const [editingInsumoIndex, setEditingInsumoIndex] = useState(null);
  const [editingCantidad, setEditingCantidad] = useState(1);
  const [editingCoeficiente, setEditingCoeficiente] = useState(1);

  const insumos = analysis.insumos || {};
  const hasInsumos = Object.keys(insumos).length > 0;

  // Función para manejar la actualización del análisis completo
  const handleAnalysisUpdated = (updatedAnalysis) => {
    if (handleUpdateAnalysis) {
      handleUpdateAnalysis(updatedAnalysis);
    }
  };

  // Función para manejar la adición de un material desde el selector
  // En AnalysisContent.tsx
const handleAddMaterialToAnalysis = (material) => {
  if (!material) return;
  
  console.log("Agregando material:", material);
  
  // Crear el objeto de insumo
  const newItem = {
    item_id: material.id,
    cantidad: 1,
    coeficiente: 1,
    unidad: material.unidad,
    precio_unitario: material.precio_unitario || 0,
    subtotal: (material.precio_unitario || 0) * 1 * 1
  };
  
  // Llamar a handleAddItem con el objeto newItem
  console.log("Llamando a handleAddItem con:", newItem);
  
  // Asegurarse de que handleAddItem existe y es una función
  if (typeof handleAddItem === 'function') {
    // IMPORTANTE: handleAddItem ya debe tener el ID del análisis vinculado
    // cuando se pasa desde CostAnalysis.tsx
    handleAddItem(newItem);
  } else {
    console.error("handleAddItem no es una función o no está definida");
  }
};

  // Cuando se selecciona un nuevo material
  const handleMaterialSelected = (item) => {
    setSelectedItem(item);
    setShowMaterialSelector(false);
    
    // Actualizar el item en edición con los datos del material seleccionado
    if (editingItem && item) {
      const updatedItem = {
        ...insumos[editingItem],
        item_id: item.id,
        unidad: item.unidad,
        precio_unitario: item.precio_unitario,
        item: item
      };
      
      setTempItem(updatedItem);
    }
  };

  // Iniciar edición de un insumo
  const startEditing = (itemKey) => {
    setEditingInsumoIndex(itemKey);
    const insumo = insumos[itemKey];
    setEditingCantidad(insumo.cantidad);
    setEditingCoeficiente(insumo.coeficiente);
    setTempItem(insumos[itemKey]);
  };

  // Guardar cambios en un insumo
  const saveItemChanges = (itemKey) => {
    // Calcular subtotal
    const cantidad = parseFloat(editingCantidad) || 0;
    const coeficiente = parseFloat(editingCoeficiente) || 1;
    const precio = parseFloat(tempItem.precio_unitario) || 0;
    const subtotal = cantidad * coeficiente * precio;
    
    const updatedItem = {
      ...tempItem,
      cantidad,
      coeficiente,
      subtotal
    };
    
    handleUpdateItem(itemKey, updatedItem);
    setEditingInsumoIndex(null);
    setTempItem({});
  };

  // Calcular el costo total
  const calculateTotal = () => {
    let total = 0;
    Object.values(insumos).forEach((insumo) => {
      total += insumo.subtotal || 0;
    });
    return total;
  };
  
  // Ordenar insumos numéricamente
  const sortedInsumos = Object.entries(insumos || {}).sort(([keyA, insumoA], [keyB, insumoB]) => {
    // Extraer números de las claves (INS001, INS002, etc.)
    const numA = parseInt(keyA.replace(/\D/g, '')) || 0;
    const numB = parseInt(keyB.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  // Formatear precio para mostrar
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '-';
    
    return typeof price === 'number' 
      ? price.toLocaleString('es-AR', { 
          style: 'currency', 
          currency: 'ARS'
        }) 
      : '-';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span>Detalle del Análisis: {analysis.nombre}</span>
        
        <div style={styles.headerActions}>
          {/* Botón para actualizar precios */}
          <UpdatePricesButton 
            analysis={analysis}
            availableItems={availableItems}
            onAnalysisUpdated={handleAnalysisUpdated}
          />
          
          {/* Botón para mostrar/ocultar el selector de materiales */}
          <button
            onClick={() => setShowMaterialSelector(!showMaterialSelector)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#F3B340] text-white hover:bg-opacity-90 text-sm"
          >
            <Plus size={16} />
            Agregar Material
          </button>
        </div>
      </div>
      
      {/* Selector de materiales */}
      {showMaterialSelector && (
        <div className="p-4 mb-4 border rounded bg-white">
          <MaterialSelector
            availableItems={availableItems}
            onSelect={handleMaterialSelected}
            onAddToAnalysis={handleAddMaterialToAnalysis} // Pasar la función correcta
            onClose={() => setShowMaterialSelector(false)}
          />
        </div>
      )}

      {/* Tabla de insumos */}
      {!hasInsumos ? (
        <div style={styles.emptyState}>
          Este análisis no tiene materiales asociados. Haga clic en "Agregar Material" para comenzar.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell} className="w-1/12">Código</th>
                <th style={styles.tableHeaderCell} className="w-3/12">Descripción</th>
                <th style={styles.tableHeaderCell} className="w-1/12">Unidad</th>
                <th style={styles.tableHeaderCell} className="w-1/12">Cantidad</th>
                <th style={styles.tableHeaderCell} className="w-1/12">Coeficiente</th>
                <th style={{...styles.tableHeaderCell, ...styles.numericCell}} className="w-1/12">Precio Unit.</th>
                <th style={{...styles.tableHeaderCell, ...styles.numericCell}} className="w-1/12">Subtotal</th>
                <th style={styles.tableHeaderCell} className="w-1/12">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedInsumos.map(([key, insumo]) => {
                const isEditing = editingInsumoIndex === key;
                
                return (
                  <tr key={key} style={styles.tableRow} className="hover:bg-gray-50">
                    <td style={styles.tableCell}>{insumo.item_id}</td>
                    <td style={styles.tableCell}>
                      {/* Mostrar descripción con fallbacks */}
                      {insumo.item?.descripcion || 
                       insumo.descripcion || 
                       `Material no encontrado (ID: ${insumo.item_id || 'desconocido'})`}
                    </td>
                    <td style={styles.tableCell}>{insumo.unidad || insumo.item?.unidad || '-'}</td>
                    <td style={isEditing ? styles.editableCell : styles.tableCell}>
                      {isEditing ? (
                        <input
                          type="number"
                          style={{...styles.input, textAlign: 'right'}}
                          value={editingCantidad}
                          onChange={(e) => setEditingCantidad(parseFloat(e.target.value) || 0)}
                          step="0.01"
                          min="0"
                        />
                      ) : (
                        <span className="text-right block">{insumo.cantidad}</span>
                      )}
                    </td>
                    <td style={isEditing ? styles.editableCell : styles.tableCell}>
                      {isEditing ? (
                        <input
                          type="number"
                          style={{...styles.input, textAlign: 'right'}}
                          value={editingCoeficiente}
                          onChange={(e) => setEditingCoeficiente(parseFloat(e.target.value) || 0)}
                          step="0.01"
                          min="0"
                        />
                      ) : (
                        <span className="text-right block">{insumo.coeficiente}</span>
                      )}
                    </td>
                    <td style={{...styles.tableCell, ...styles.numericCell}}>
                      {formatPrice(insumo.precio_unitario)}
                    </td>
                    <td style={{...styles.tableCell, ...styles.numericCell}}>
                      {isEditing
                        ? formatPrice(insumo.precio_unitario * editingCantidad * editingCoeficiente)
                        : formatPrice(insumo.subtotal)}
                    </td>
                    <td style={styles.tableCell}>
                      <div className="flex justify-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              style={{...styles.actionButton, ...styles.saveButton}}
                              className="hover:bg-green-100"
                              onClick={() => saveItemChanges(key)}
                              title="Guardar cambios"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              style={{...styles.actionButton, ...styles.cancelButton}}
                              className="hover:bg-gray-100"
                              onClick={() => {
                                setEditingInsumoIndex(null);
                                setTempItem({});
                              }}
                              title="Cancelar edición"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              style={{...styles.actionButton, ...styles.editButton}}
                              className="hover:text-blue-600" 
                              onClick={() => startEditing(key)}
                              title="Editar insumo"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              style={{...styles.actionButton, ...styles.deleteButton}}
                              className="hover:text-red-600" 
                              onClick={() => handleDeleteItem(key)}
                              title="Eliminar insumo"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumen y totales */}
      {hasInsumos && (
        <div style={styles.summary}>
          <div style={styles.summaryTitle}>Resumen</div>
          <div style={styles.summaryTable}>
            <div style={styles.totalRow}>
              <span>Costo Total</span>
              <span>
                {formatPrice(calculateTotal())}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisContent;