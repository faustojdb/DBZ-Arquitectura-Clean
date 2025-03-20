import React, { useState, useEffect, useRef } from 'react';
import { Plus, Save, X, Pencil, Trash2, Search, ChevronDown } from 'lucide-react';

// MaterialSelector Component
interface Material {
  id: string;
  descripcion: string;
  precio_unitario: number;
  unidad: string;
}

interface MaterialSelectorProps {
  value: string;
  onChange: (materialId: string) => void;
  materials: Material[];
  placeholder?: string;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  value,
  onChange,
  materials,
  placeholder = 'Buscar material...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredMaterials = materials.filter(material =>
    material.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMaterial = materials.find(m => m.id === value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredMaterials.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && filteredMaterials[highlightedIndex]) {
      onChange(filteredMaterials[highlightedIndex].id);
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full rounded border px-3 py-2 pr-8 focus:outline-none focus:ring-2"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-auto">
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material, index) => (
              <div
                key={material.id}
                className={`px-3 py-2 cursor-pointer ${
                  index === highlightedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  onChange(material.id);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{material.id}</span>
                    <span className="mx-2">-</span>
                    <span>{material.descripcion}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {material.precio_unitario.toFixed(2)} / {material.unidad}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">
              No se encontraron materiales
            </div>
          )}
        </div>
      )}

      {selectedMaterial && !isOpen && (
        <div className="mt-1 text-sm text-gray-600">
          Seleccionado: {selectedMaterial.descripcion}
        </div>
      )}
    </div>
  );
};

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
  const [newItem, setNewItem] = useState({
    itemId: '',
    cantidad: '1',
    coeficiente: '1'
  });
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const handleAddItem = () => {
    if (!newItem.itemId) return;
    
    const selectedItem = availableItems.find(i => i.id === newItem.itemId);
    if (!selectedItem) return;

    onAddItem(analysis.id, {
      item_id: newItem.itemId,
      cantidad: parseFloat(newItem.cantidad) || 0,
      coeficiente: parseFloat(newItem.coeficiente) || 1,
      precio_unitario: selectedItem.precio_unitario,
      subtotal: (parseFloat(newItem.cantidad) || 0) * selectedItem.precio_unitario
    });

    setNewItem({
      itemId: '',
      cantidad: '1',
      coeficiente: '1'
    });
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
        {/* Fila para nuevo item */}
        <tr className="border-b bg-gray-50">
          <td className="px-4 py-2" colSpan={2}>
            <MaterialSelector
              value={newItem.itemId}
              onChange={(value) => setNewItem(prev => ({
                ...prev,
                itemId: value
              }))}
              materials={availableItems}
              placeholder="Buscar material..."
            />
          </td>
          <td className="px-4 py-2">
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded border px-2 py-1 text-right"
              value={newItem.cantidad}
              onChange={(e) => setNewItem(prev => ({
                ...prev,
                cantidad: e.target.value
              }))}
            />
          </td>
          <td className="px-4 py-2">
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded border px-2 py-1 text-right"
              value={newItem.coeficiente}
              onChange={(e) => setNewItem(prev => ({
                ...prev,
                coeficiente: e.target.value
              }))}
            />
          </td>
          <td className="px-4 py-2 text-right">
            {availableItems.find(i => i.id === newItem.itemId)?.precio_unitario.toFixed(2) || '-'}
          </td>
          <td className="px-4 py-2 text-right">
            {newItem.itemId && newItem.cantidad ? 
              ((parseFloat(newItem.cantidad) || 0) * 
              (availableItems.find(i => i.id === newItem.itemId)?.precio_unitario || 0)).toFixed(2) 
              : '-'}
          </td>
          <td className="px-4 py-2">
            <div className="flex justify-center">
              <button
                onClick={handleAddItem}
                disabled={!newItem.itemId}
                className="p-1 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Agregar item"
              >
                <Plus className="h-5 w-5 text-green-600" />
              </button>
            </div>
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