import React, { useState } from 'react';
import { X, Plus, Save, Pencil, Trash2 } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import MaterialSelector from './MaterialSelector';
import AddButton from './AddButton';

// Estilos compartidos
const styles = {
  container: {
    width: '100%',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
  },
  header: {
    backgroundColor: '#1e3a5f',
    color: 'white',
    padding: '12px 16px',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Kanit, sans-serif',
  },
  content: {
    padding: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 'medium',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  select: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  tableHeader: {
    backgroundColor: '#1e3a5f',
    color: 'white',
  },
  errorMessage: {
    backgroundColor: '#FECACA',
    border: '1px solid #F87171',
    color: '#B91C1C',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '16px',
  },
};

interface Material {
  id: string;
  descripcion: string;
  precio_unitario: number;
  unidad: string;
}

interface AnalysisInput {
  item_id: string;
  cantidad: number;
  coeficiente: number;
  unidad: string;
  precio_unitario: number;
  subtotal: number;
  codigo_original: string;
}

const CreateAnalysisForm = ({ onSave, onCancel, availableItems }: { onSave: (data: any) => Promise<void>; onCancel: () => void; availableItems: Material[] }) => {
  const [codigoRubro, setCodigoRubro] = useState('');
  const [codigoSubrubro, setCodigoSubrubro] = useState('');
  const [nombre, setNombre] = useState('');
  const [unidad, setUnidad] = useState('');
  const [rendimiento, setRendimiento] = useState(1);
  const [insumos, setInsumos] = useState<AnalysisInput[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingInsumoIndex, setEditingInsumoIndex] = useState<number | null>(null);
  const [editingCantidad, setEditingCantidad] = useState(1);
  const [editingCoeficiente, setEditingCoeficiente] = useState(1);
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);

  // Calcular código completo
  const codigoDisplay = codigoRubro && codigoSubrubro ? `${codigoRubro}.${codigoSubrubro}` : '';

  // Calcular costo total
  const costoTotal = insumos.reduce((total, ins) => total + ins.subtotal, 0);

  // Iniciar edición de un insumo
  const startEditingInsumo = (index: number) => {
    const insumo = insumos[index];
    setEditingInsumoIndex(index);
    setEditingCantidad(insumo.cantidad);
    setEditingCoeficiente(insumo.coeficiente);
  };

  // Guardar cambios en un insumo
  const saveInsumoChanges = () => {
    if (editingInsumoIndex === null) return;

    const updatedInsumos = [...insumos];
    const insumo = updatedInsumos[editingInsumoIndex];

    insumo.cantidad = editingCantidad;
    insumo.coeficiente = editingCoeficiente;
    insumo.subtotal = insumo.precio_unitario * editingCantidad * editingCoeficiente;

    setInsumos(updatedInsumos);
    setEditingInsumoIndex(null);
  };

  // Eliminar insumo
  const removeInsumo = (index: number) => {
    if (confirm('¿Está seguro que desea eliminar este material?')) {
      const newInsumos = [...insumos];
      newInsumos.splice(index, 1);
      setInsumos(newInsumos);
      if (editingInsumoIndex === index) setEditingInsumoIndex(null);
    }
  };

  // Generar ID del análisis con sufijo único
  const generateAnalysisId = () => {
    if (codigoDisplay) {
      const numericCode = codigoDisplay.replace('.', '');
      const timestamp = Date.now().toString().slice(-4); // Usar últimos 4 dígitos del timestamp
      return `AC${numericCode}_${timestamp}`;
    }
    return null;
  };

  // Manejar la adición de un material seleccionado
  const handleAddMaterial = (material: Material) => {
    if (!material) return;
    
    const newInsumo: AnalysisInput = {
      item_id: material.id,
      cantidad: 1,
      coeficiente: 1,
      unidad: material.unidad,
      codigo_original: "",
      precio_unitario: material.precio_unitario,
      subtotal: material.precio_unitario, // cantidad * coeficiente * precio_unitario
    };
    
    setInsumos([...insumos, newInsumo]);
  };

  // Guardar análisis
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!codigoRubro || !codigoSubrubro) {
        setErrorMessage('Debe seleccionar un rubro y completar el subrubro');
        return;
      }
      if (!nombre) {
        setErrorMessage('Debe ingresar un nombre para el análisis');
        return;
      }
      if (!unidad) {
        setErrorMessage('Debe seleccionar una unidad de medida');
        return;
      }
      if (insumos.length === 0) {
        setErrorMessage('Debe agregar al menos un insumo al análisis');
        return;
      }

      if (editingInsumoIndex !== null) {
        saveInsumoChanges();
      }

      setIsSubmitting(true);
      setErrorMessage('');

      const analysisId = generateAnalysisId();
      const insumosObj = {};
      insumos.forEach((insumo, index) => {
        const key = `INS${String(index + 1).padStart(3, '0')}`;
        insumosObj[key] = {
          item_id: insumo.item_id,
          cantidad: parseFloat(insumo.cantidad.toString()) || 0,
          coeficiente: parseFloat(insumo.coeficiente.toString()) || 1,
          unidad: insumo.unidad,
          precio_unitario: insumo.precio_unitario,
          subtotal: insumo.subtotal,
          codigo_original: insumo.codigo_original || ""
        };
      });

      const analysisData = {
        id: analysisId,
        codigoDisplay,
        nombre,
        unidad,
        rendimiento,
        costo_total: costoTotal,
        insumos: insumosObj,
        indice: {
          mayor: parseInt(codigoRubro),
          menor: parseInt(codigoSubrubro)
        },
        rubro: {
          id: parseInt(codigoRubro),
          nombre: CATEGORIES[`CATEGORY_${codigoRubro}`] || "Sin categoría",
          unidad: "GL"
        }
      };

      console.log('Enviando datos de análisis:', analysisData);
      await onSave(analysisData);
    } catch (err) {
      console.error('Error creando análisis:', err);
      setErrorMessage(`Error al crear análisis: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    });
  };

  return (
    <div style={styles.container}>
      {/* Encabezado */}
      <div style={styles.header}>
        <h2 style={{ fontWeight: 'bold', fontFamily: 'Kanit, sans-serif' }}>Nuevo Análisis de Costo</h2>
        <button onClick={onCancel} className="hover:bg-blue-700 rounded-full p-1">
          <X size={20} color="white" />
        </button>
      </div>

      <div style={styles.content}>
        {/* Mensaje de error */}
        {errorMessage && (
          <div style={styles.errorMessage}>
            <div className="flex justify-between items-center">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage('')} className="text-red-500 hover:text-red-700">
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Datos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label style={styles.label}>Código</label>
              <div className="flex space-x-2">
                <select
                  style={styles.select}
                  value={codigoRubro}
                  onChange={(e) => setCodigoRubro(e.target.value)}
                  required
                >
                  <option value="">Seleccione Rubro</option>
                  {Object.entries(CATEGORIES).map(([key, value]) => (
                    <option key={key} value={key.replace('CATEGORY_', '')}>
                      {key.replace('CATEGORY_', '')} - {value}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Subrubro (ej: 01)"
                  style={styles.input}
                  value={codigoSubrubro}
                  onChange={(e) => setCodigoSubrubro(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={2}
                  required
                />
              </div>
              {codigoDisplay && (
                <p className="mt-1 text-sm text-gray-500">
                  Código completo: <span className="font-mono">{codigoDisplay}</span>
                </p>
              )}
            </div>

            <div>
              <label style={styles.label}>Nombre</label>
              <input
                type="text"
                style={styles.input}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del análisis"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label style={styles.label}>Unidad</label>
                <input
                  type="text"
                  style={styles.input}
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value)}
                  placeholder="ej. m2, m3, kg"
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Rendimiento</label>
                <input
                  type="number"
                  style={styles.input}
                  value={rendimiento}
                  onChange={(e) => setRendimiento(parseFloat(e.target.value) || 1)}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sección de Materiales e Insumos */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Materiales e Insumos</h3>
              <div className="text-gray-700">
                <span className="font-bold">Costo Total: </span>
                <span className="font-mono">{formatPrice(costoTotal)}</span>
              </div>
            </div>

            {/* Sección de selección de materiales */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Seleccionar Material</h4>
                {!showMaterialSelector && (
                  <button
                    type="button"
                    onClick={() => setShowMaterialSelector(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#F3B340] text-white hover:bg-opacity-90 text-sm"
                  >
                    <Plus size={16} />
                    Agregar Material
                  </button>
                )}
              </div>
              
              {showMaterialSelector && (
                <div className="p-4 border rounded bg-gray-50">
                  <MaterialSelector
                    availableItems={availableItems}
                    onAddToAnalysis={handleAddMaterial}
                    onClose={() => setShowMaterialSelector(false)}
                  />
                </div>
              )}
            </div>

            {/* Tabla de insumos */}
            {insumos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th className="p-2 text-left">Código</th>
                      <th className="p-2 text-left">Descripción</th>
                      <th className="p-2 text-right">Cantidad</th>
                      <th className="p-2 text-center">Unidad</th>
                      <th className="p-2 text-right">Coef.</th>
                      <th className="p-2 text-right">Precio Unit.</th>
                      <th className="p-2 text-right">Subtotal</th>
                      <th className="p-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insumos.map((insumo, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">{insumo.item_id}</td>
                        <td className="p-2">
                          {availableItems.find(item => item.id === insumo.item_id)?.descripcion || 'Material desconocido'}
                        </td>
                        <td className="p-2 text-right">
                          {editingInsumoIndex === index ? (
                            <input
                              type="number"
                              className="w-16 p-1 text-right border rounded"
                              value={editingCantidad}
                              onChange={(e) => setEditingCantidad(parseFloat(e.target.value) || 0)}
                              min="0.01"
                              step="0.01"
                            />
                          ) : (
                            insumo.cantidad
                          )}
                        </td>
                        <td className="p-2 text-center">{insumo.unidad}</td>
                        <td className="p-2 text-right">
                          {editingInsumoIndex === index ? (
                            <input
                              type="number"
                              className="w-16 p-1 text-right border rounded"
                              value={editingCoeficiente}
                              onChange={(e) => setEditingCoeficiente(parseFloat(e.target.value) || 0)}
                              min="0.01"
                              step="0.01"
                            />
                          ) : (
                            insumo.coeficiente
                          )}
                        </td>
                        <td className="p-2 text-right">{formatPrice(insumo.precio_unitario)}</td>
                        <td className="p-2 text-right">
                          {editingInsumoIndex === index
                            ? formatPrice(insumo.precio_unitario * editingCantidad * editingCoeficiente)
                            : formatPrice(insumo.subtotal)}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center gap-1">
                            {editingInsumoIndex === index ? (
                              <button
                                type="button"
                                onClick={saveInsumoChanges}
                                className="p-1 rounded hover:bg-green-100 text-green-600"
                                title="Guardar cambios"
                              >
                                <Save size={16} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEditingInsumo(index)}
                                className="p-1 rounded hover:bg-blue-100 text-blue-600"
                                title="Editar insumo"
                              >
                                <Pencil size={16} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeInsumo(index)}
                              className="p-1 rounded hover:bg-red-100 text-red-600"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={6} className="p-2 text-right">TOTAL:</td>
                      <td className="p-2 text-right">{formatPrice(costoTotal)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 text-center rounded border">
                No hay insumos agregados. Utilice el buscador para encontrar y agregar materiales al análisis.
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-100"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded hover:bg-yellow-500 flex items-center gap-1 disabled:opacity-50"
              style={{ backgroundColor: '#F3B340' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar Análisis
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnalysisForm;