// src/components/presupuestos/components/ItemRow.tsx
import React from 'react';

interface ItemRowProps {
  item: {
    id: string;
    indice: string;
    nombre: string;
    unidad: string;
    cantidad: number;
    precioUnitario: number;
    importe: number;
    incidencia: number;
  };
  onQuantityChange?: (id: string, quantity: number) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

/**
 * Componente para mostrar una fila de un ítem en la tabla de presupuesto
 */
const ItemRow: React.FC<ItemRowProps> = ({ item, onQuantityChange, onDelete, readOnly = false }) => {
  // Formatear moneda
  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Formatear porcentaje
  const formatPercent = (value: number) => {
    return value.toFixed(2) + '%';
  };
  
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-2 px-3 text-center">{item.indice}</td>
      <td className="py-2 px-3">{item.nombre}</td>
      <td className="py-2 px-3 text-center">{item.unidad}</td>
      <td className="py-2 px-3 text-right">
        {readOnly ? (
          item.cantidad.toFixed(2)
        ) : (
          <input
            type="number"
            value={item.cantidad}
            onChange={(e) => onQuantityChange && onQuantityChange(item.id, parseFloat(e.target.value) || 0)}
            className="w-16 p-1 text-right border border-gray-300 rounded"
            min="0.01"
            step="0.01"
          />
        )}
      </td>
      <td className="py-2 px-3 text-right">{formatCurrency(item.precioUnitario)}</td>
      <td className="py-2 px-3 text-right">{formatCurrency(item.importe)}</td>
      <td className="py-2 px-3 text-right">{formatPercent(item.incidencia)}</td>
      {!readOnly && (
        <td className="py-2 px-3 text-center">
          <button
            onClick={() => onDelete && onDelete(item.id)}
            className="text-red-500 hover:text-red-700"
            title="Eliminar ítem"
          >
            ×
          </button>
        </td>
      )}
    </tr>
  );
};

export default ItemRow;