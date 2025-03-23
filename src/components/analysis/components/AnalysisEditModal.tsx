import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { styles } from '../constants/styles';
import { AnalisisCosto } from '../../../types/analysis';
import RUBROS from '../constants/rubros'; // Importar los rubros

interface AnalysisEditModalProps {
  analysis: AnalisisCosto;
  onSave: (data: Partial<AnalisisCosto>) => Promise<void>;
  onClose: () => void;
}

export const AnalysisEditModal: React.FC<AnalysisEditModalProps> = ({
  analysis,
  onSave,
  onClose
}) => {
  // Extraer el rubro y subrubro del código
  const extractRubroSubrubro = (codigoDisplay: string) => {
    if (!codigoDisplay) return { rubro: "", subrubro: "" };
    
    const parts = codigoDisplay.split('.');
    return {
      rubro: parts[0] || "",
      subrubro: parts[1] || ""
    };
  };
  
  const { rubro: initialRubro, subrubro: initialSubrubro } = extractRubroSubrubro(analysis.codigoDisplay);
  
  const [formData, setFormData] = useState({
    nombre: analysis.nombre || "",
    unidad: analysis.unidad || "",
    rendimiento: (analysis.rendimiento || 1).toString(),
    rubro: initialRubro,
    subrubro: initialSubrubro,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rubroOptions, setRubroOptions] = useState<{id: string, nombre: string}[]>([]);
  
  // Preparar las opciones de rubros al montar el componente
  useEffect(() => {
    const options = Object.values(RUBROS).map(rubro => ({
      id: String(rubro.id).padStart(2, '0'),
      nombre: rubro.nombre
    }));
    
    setRubroOptions(options);
  }, []);
  
  // Generar código completo basado en rubro y subrubro
  const generarCodigoDisplay = () => {
    if (!formData.rubro) return "";
    if (!formData.subrubro) return formData.rubro;
    return `${formData.rubro}.${formData.subrubro}`;
  };
  
  // Función para validar el formulario
  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setError("El nombre es obligatorio");
      return false;
    }
    
    if (!formData.unidad.trim()) {
      setError("La unidad es obligatoria");
      return false;
    }
    
    if (!formData.rubro) {
      setError("Debe seleccionar un rubro");
      return false;
    }
    
    if (!formData.subrubro) {
      setError("Debe especificar un subrubro");
      return false;
    }
    
    // Verificar que el subrubro sea un número entre 1 y 99
    const subrubroNum = parseInt(formData.subrubro, 10);
    if (isNaN(subrubroNum) || subrubroNum < 1 || subrubroNum > 99) {
      setError("El subrubro debe ser un número entre 1 y 99");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    // Limpiar error previo
    setError("");
    
    // Validar formulario
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Usar el subrubro exactamente como fue ingresado sin formateo
      const inputSubrubro = formData.subrubro;
      
      // Generar codigoDisplay sin formatear el subrubro
      const codigoDisplay = `${formData.rubro}.${inputSubrubro}`;
      
      // Determinar rubro y subrubro como números para el campo indice
      const rubroNum = parseInt(formData.rubro, 10);
      const subrubroNum = parseInt(inputSubrubro, 10);
      
      // Crear objeto de actualización
      const updateData = {
        nombre: formData.nombre,
        unidad: formData.unidad,
        rendimiento: parseFloat(formData.rendimiento) || 1,
        codigoDisplay,
        indice: {
          ...analysis.indice,
          mayor: rubroNum,
          menor: subrubroNum
        }
      };
      
      await onSave(updateData);
    } catch (error) {
      console.error('Error al guardar:', error);
      setError(`Error al guardar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Editar Análisis</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Código (Rubro y Subrubro) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código (Rubro.Subrubro)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-opacity-50"
                style={{ borderColor: styles.colors.primary }}
                value={formData.rubro}
                onChange={(e) => setFormData(prev => ({ ...prev, rubro: e.target.value }))}
                required
              >
                <option value="">Seleccione Rubro</option>
                {rubroOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.id} - {option.nombre}
                  </option>
                ))}
              </select>
              
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-opacity-50"
                  style={{ borderColor: styles.colors.primary }}
                  value={formData.subrubro}
                  onChange={(e) => {
                    // Solo permitir números y limitar a 2 dígitos
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                    if (onlyNums.length <= 2) {
                      setFormData(prev => ({ ...prev, subrubro: onlyNums }));
                    }
                  }}
                  placeholder="Ej: 1"
                  maxLength={2}
                  required
                />
              </div>
            </div>
            
            {/* Mostrar código completo */}
            {formData.rubro && formData.subrubro && (
              <div className="mt-1 text-sm text-gray-500">
                Código completo: <span className="font-mono font-medium">{generarCodigoDisplay()}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-opacity-50"
              style={{ borderColor: styles.colors.primary }}
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidad
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-opacity-50"
              style={{ borderColor: styles.colors.primary }}
              value={formData.unidad}
              onChange={(e) => setFormData(prev => ({ ...prev, unidad: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rendimiento
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-opacity-50"
              style={{ borderColor: styles.colors.primary }}
              value={formData.rendimiento}
              onChange={(e) => setFormData(prev => ({ ...prev, rendimiento: e.target.value }))}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded text-white disabled:opacity-50"
              style={{ backgroundColor: styles.colors.primary }}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};