import React, { useState, useEffect, useRef } from 'react';
import { Plus, Save, X, Pencil, Trash2, Search, ChevronDown } from 'lucide-react';
import MaterialSelector from './MaterialSelector';

// Material interface for type safety
interface Material {
  id: string;
  descripcion: string;
  precio_unitario: number;
  unidad: string;
}

// ExpandedAnalysisRow Component
interface ExpandedAnalysisRowProps {
  analysis: {
    id: string;
    insumos: Record<string, any>;
    costo_total: number;
  };
  availableItems: Material[];
  onAddItem: (analysisId: string, item: any) => void;
  onUpdateItem: (analysisId: string, itemKey: string, item: any) => void;
  onDeleteItem: (analysisId: string, itemKey: string) => void;
  styles: {
    colors: {
      subCategoryBg: string;
      primary: string;
    };
  };
}

const ExpandedAnalysisRow: React.FC<ExpandedAnalysisRowProps> = ({
  analysis,
  availableItems,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  styles,
}) => {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);

  // Manejador para agregar un material seleccionado al análisis
  const handleAddMaterial = (material: Material) => {
    if (!material) return;
    
    // Crear el objeto de insumo
    const newItem = {
      item_id: material.id,
      cantidad: 1,
      coeficiente: 1,
      unidad: material.unidad,
      precio_unitario: material.precio_unitario,
      subtotal: material.precio_unitario // cantidad * coeficiente * precio_unitario
    };
    
    // Añadir al análisis
    onAddItem(analysis.id, newItem);
  };

  return (
    <table className="w-full">
      <thead>
        <tr style={{ backgroundColor: styles.colors.subCategoryBg }}>
          <th className="px-4 py-2 text-left text-white font-medium">Código</th>
          <th className="px-4 py-2 text-left text-white font-medium">Descripción</th>
          <th className="px-4 py-2 text-right text-white font-medium w-24">Cantidad</th>
          <th className="px-4 py-2 text-right text-white font-medium w-24">Coeficiente</th>
          <th className="px-4 py-2 text-right text-white font-medium w-32">Precio Unit.</th>
          <th className="px-4 py-2 text-right text-white font-medium w-32">Subtotal</th>
          <th className="px-4 py-2 text-center text-white font-medium w-24">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {/* Fila para búsqueda y añadir materiales */}
        <tr className="border-b bg-gray-50">
          <td colSpan={7} className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Seleccionar Material</h3>
              {!showMaterialSelector && (
                <button
                  onClick={() => setShowMaterialSelector(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#F3B340] text-white hover:bg-opacity-90 text-sm"
                >
                  <Plus size={16} />
                  Agregar Material
                </button>
              )}
            </div>
            
            {showMaterialSelector && (
              <div className="p-4 border rounded bg-white">
                <MaterialSelector
                  availableItems={availableItems}
                  onAddToAnalysis={handleAddMaterial} // Pasar explícitamente la función
                  onSelect={(material) => {
                    if (material) {
                      handleAddMaterial(material); // Usar el mismo handler si no se usa el botón +
                    }
                  }}
                  onClose={() => setShowMaterialSelector(false)}
                />
              </div>
            )}
          </td>
        </tr>

        {/* Items existentes */}
        {Object.entries(analysis.insumos || {}).map(([key, insumo]) => (
          <tr key={key} className="border-b hover:bg-gray-50">
            <td className="px-4 py-2">{insumo.item?.id || insumo.item_id}</td>
            <td className="px-4 py-2">{insumo.item?.descripcion || '-'}</td>
            <td className="px-4 py-2 text-right">
              {editingItem === key ? (
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded border px-2 py-1 text-right"
                  defaultValue={insumo.cantidad}
                  onChange={(e) => {
                    insumo.cantidad = parseFloat(e.target.value);
                    insumo.subtotal = insumo.cantidad * insumo.precio_unitario;
                  }}
                />
              ) : (
                insumo.cantidad
              )}
            </td>
            <td className="px-4 py-2 text-right">
              {editingItem === key ? (
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded border px-2 py-1 text-right"
                  defaultValue={insumo.coeficiente}
                  onChange={(e) => {
                    insumo.coeficiente = parseFloat(e.target.value);
                  }}
                />
              ) : (
                insumo.coeficiente
              )}
            </td>
            <td className="px-4 py-2 text-right">{insumo.precio_unitario.toFixed(2)}</td>
            <td className="px-4 py-2 text-right">{insumo.subtotal.toFixed(2)}</td>
            <td className="px-4 py-2">
              <div className="flex justify-center gap-2">
                {editingItem === key ? (
                  <>
                    <button
                      onClick={() => {
                        onUpdateItem(analysis.id, key, insumo);
                        setEditingItem(null);
                      }}
                      className="p-1 rounded hover:bg-green-100"
                      title="Guardar cambios"
                    >
                      <Save className="h-5 w-5 text-green-600" />
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="p-1 rounded hover:bg-red-100"
                      title="Cancelar edición"
                    >
                      <X className="h-5 w-5 text-red-600" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingItem(key)}
                      className="p-1 rounded hover:bg-blue-100"
                      title="Editar item"
                    >
                      <Pencil className="h-5 w-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(analysis.id, key)}
                      className="p-1 rounded hover:bg-red-100"
                      title="Eliminar item"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}

        {/* Fila de totales */}
        <tr className="bg-gray-100 font-bold">
          <td colSpan={5} className="px-4 py-2 text-right">Total:</td>
          <td className="px-4 py-2 text-right">{analysis.costo_total.toFixed(2)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  );
};

export default ExpandedAnalysisRow;