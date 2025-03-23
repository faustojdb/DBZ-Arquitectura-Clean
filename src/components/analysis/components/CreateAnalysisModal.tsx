import React, { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import MaterialSelector from './MaterialSelector'; // Reutilizamos el componente existente

interface Material {
  id: string;
  descripcion: string;
  categoria: string;
  unidad: string;
  precio_unitario: number;
}

interface AnalysisInput {
  item_id: string;
  cantidad: number;
  coeficiente: number;
  unidad: string;
  precio_unitario: number;
  subtotal: number;
  descripcion?: string; // Para mostrar en UI
}

interface CreateAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (analysisData: any) => Promise<void>;
  availableItems: Material[];
}

const CreateAnalysisModal: React.FC<CreateAnalysisModalProps> = ({
  isOpen,
  onClose,
  onSave,
  availableItems
}) => {
  // Estados del formulario
  const [codigoRubro, setCodigoRubro] = useState("");
  const [codigoSubrubro, setCodigoSubrubro] = useState("");
  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("");
  const [rendimiento, setRendimiento] = useState<number>(1);
  const [insumos, setInsumos] = useState<AnalysisInput[]>([]);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [coeficiente, setCoeficiente] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calcular código completo (para display)
  const codigoDisplay = codigoRubro && codigoSubrubro 
    ? `${codigoRubro}.${codigoSubrubro}` 
    : "";
  
  // Calcular costo total basado en insumos
  const costoTotal = insumos.reduce((total, ins) => total + ins.subtotal, 0);
  
  // Limpiar formulario al cerrar
  useEffect(() => {
    if (!isOpen) {
      // Resetear estado al cerrar
      setCodigoRubro("");
      setCodigoSubrubro("");
      setNombre("");
      setUnidad("");
      setRendimiento(1);
      setInsumos([]);
      setErrorMessage("");
      setIsAddingMaterial(false);
      setSelectedMaterial(null);
      setCantidad(1);
      setCoeficiente(1);
    }
  }, [isOpen]);
  
  // Añadir material seleccionado a la lista de insumos
  const handleAddMaterial = () => {
    if (!selectedMaterial) {
      setErrorMessage("Debe seleccionar un material");
      return;
    }
    
    if (cantidad <= 0 || coeficiente <= 0) {
      setErrorMessage("La cantidad y coeficiente deben ser mayores a cero");
      return;
    }
    
    const subtotal = selectedMaterial.precio_unitario * cantidad * coeficiente;
    
    const newInsumo: AnalysisInput = {
      item_id: selectedMaterial.id,
      cantidad,
      coeficiente,
      unidad: selectedMaterial.unidad,
      precio_unitario: selectedMaterial.precio_unitario,
      subtotal,
      descripcion: selectedMaterial.descripcion,
    };
    
    setInsumos([...insumos, newInsumo]);
    setIsAddingMaterial(false);
    setSelectedMaterial(null);
    setCantidad(1);
    setCoeficiente(1);
  };
  
  // Eliminar insumo de la lista
  const removeInsumo = (index: number) => {
    const newInsumos = [...insumos];
    newInsumos.splice(index, 1);
    setInsumos(newInsumos);
  };
  
  // Guardar análisis completo
  const handleSubmit = async () => {
    try {
      // Validaciones
      if (!codigoRubro || !codigoSubrubro) {
        setErrorMessage("Debe seleccionar un rubro y completar el subrubro");
        return;
      }
      
      if (!nombre) {
        setErrorMessage("Debe ingresar un nombre para el análisis");
        return;
      }
      
      if (!unidad) {
        setErrorMessage("Debe seleccionar una unidad de medida");
        return;
      }
      
      if (insumos.length === 0) {
        setErrorMessage("Debe agregar al menos un insumo al análisis");
        return;
      }
      
      // Marcar como enviando
      setIsSubmitting(true);
      setErrorMessage("");
      
      // Preparar objeto para guardar
      const insumosObj: {[key: string]: any} = {};
      insumos.forEach((insumo, index) => {
        const key = `INS${String(index + 1).padStart(3, '0')}`;
        insumosObj[key] = {
          item_id: insumo.item_id,
          cantidad: insumo.cantidad,
          coeficiente: insumo.coeficiente,
          unidad: insumo.unidad,
          precio_unitario: insumo.precio_unitario,
          subtotal: insumo.subtotal,
        };
      });
      
      const analysisData = {
        codigoDisplay,
        nombre,
        unidad,
        rendimiento,
        costo_total: costoTotal,
        insumos: insumosObj
      };
      
      console.log("Enviando datos de análisis:", analysisData);
      
      // Guardar el análisis
      await onSave(analysisData);
      
      // Cerrar modal
      onClose();
      
    } catch (err) {
      console.error("Error creando análisis:", err);
      setErrorMessage(`Error al crear análisis: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto py-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-auto my-2 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>
          <h2 className="text-xl font-bold font-kanit">Crear Nuevo Análisis de Costo</h2>
          <button 
            className="p-1 rounded-full hover:bg-blue-700"
            onClick={onClose}
          >
            <X size={24} color="white" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Mensaje de error */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage("")} className="text-red-500 hover:text-red-700">
                <X size={18} />
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primera columna */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Código</label>
                <div className="flex space-x-2">
                  <select 
                    className="w-1/2 p-2 border rounded"
                    value={codigoRubro}
                    onChange={(e) => setCodigoRubro(e.target.value)}
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
                    placeholder="Subrubro (ej: 01, 02)"
                    className="w-1/2 p-2 border rounded"
                    value={codigoSubrubro}
                    onChange={(e) => setCodigoSubrubro(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={2}
                  />
                </div>
                {codigoDisplay && (
                  <p className="mt-1 text-sm text-gray-500">
                    Código completo: <span className="font-mono">{codigoDisplay}</span>
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del análisis"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Unidad</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value)}
                    placeholder="ej. m2, m3, kg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rendimiento</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={rendimiento}
                    onChange={(e) => setRendimiento(parseFloat(e.target.value) || 1)}
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            
            {/* Segunda columna - Resumen */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-3">Resumen</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Código:</span>
                  <span className="font-mono">{codigoDisplay || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nombre:</span>
                  <span>{nombre || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unidad:</span>
                  <span>{unidad || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rendimiento:</span>
                  <span>{rendimiento}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Costo Total:</span>
                  <span>{costoTotal.toLocaleString('es-AR', { 
                    style: 'currency', 
                    currency: 'ARS' 
                  })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Materiales:</span>
                  <span>{insumos.length}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sección de Insumos */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Materiales e Insumos</h3>
              <button
                onClick={() => setIsAddingMaterial(!isAddingMaterial)}
                className="flex items-center gap-1 px-3 py-1 rounded text-white"
                style={{ backgroundColor: '#F3B340' }}
              >
                {isAddingMaterial ? (
                  <>
                    <X size={16} />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Agregar Material
                  </>
                )}
              </button>
            </div>
            
            {/* Panel para agregar material */}
            {isAddingMaterial && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-3">Seleccionar Material</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="col-span-3">
                    <MaterialSelector
                      onSelectMaterial={setSelectedMaterial}
                      selectedMaterial={selectedMaterial}
                      availableItems={availableItems}
                    />
                  </div>
                  
                  {selectedMaterial && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">Cantidad</label>
                        <input
                          type="number"
                          className="w-full p-2 border rounded"
                          value={cantidad}
                          onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Coeficiente</label>
                        <input
                          type="number"
                          className="w-full p-2 border rounded"
                          value={coeficiente}
                          onChange={(e) => setCoeficiente(parseFloat(e.target.value) || 0)}
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Subtotal</label>
                        <div className="p-2 border rounded bg-gray-50">
                          {(selectedMaterial.precio_unitario * cantidad * coeficiente).toLocaleString('es-AR', { 
                            style: 'currency', 
                            currency: 'ARS' 
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleAddMaterial}
                    disabled={!selectedMaterial}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-white 
                      ${selectedMaterial ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    <Plus size={16} />
                    Agregar al Análisis
                  </button>
                </div>
              </div>
            )}
            
            {/* Tabla de insumos */}
            {insumos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
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
                        <td className="p-2">{insumo.descripcion}</td>
                        <td className="p-2 text-right">{insumo.cantidad}</td>
                        <td className="p-2 text-center">{insumo.unidad}</td>
                        <td className="p-2 text-right">{insumo.coeficiente}</td>
                        <td className="p-2 text-right">{insumo.precio_unitario.toLocaleString('es-AR', { 
                          style: 'currency', 
                          currency: 'ARS' 
                        })}</td>
                        <td className="p-2 text-right">{insumo.subtotal.toLocaleString('es-AR', { 
                          style: 'currency', 
                          currency: 'ARS' 
                        })}</td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => removeInsumo(index)}
                            className="p-1 rounded hover:bg-red-100 text-red-600"
                            title="Eliminar"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={6} className="p-2 text-right">TOTAL:</td>
                      <td className="p-2 text-right">{costoTotal.toLocaleString('es-AR', { 
                        style: 'currency', 
                        currency: 'ARS' 
                      })}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 text-center rounded border">
                No hay insumos agregados. Utilice el botón "Agregar Material" para añadir materiales al análisis.
              </div>
            )}
          </div>
          
          {/* Botones de acción */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              className="px-4 py-2 border rounded hover:bg-gray-100"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 text-white rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
              style={{ backgroundColor: '#F3B340' }}
              onClick={handleSubmit}
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
        </div>
      </div>
    </div>
  );
};

export default CreateAnalysisModal;