import React from 'react';
import { ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { styles } from '../constants/styles';
import { AnalisisCosto } from '../../../types/analysis';

interface AnalysisCardProps {
  analysis: AnalisisCosto;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  isExpanded,
  onToggle,
  onEdit,
  onDelete
}) => {
  // Format date (timestamp from Firestore)
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return '-';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow">
      {/* Header */}
      <div
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-blue-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-blue-500" />
          )}
          <div>
            <div className="flex items-center">
              <span className="text-blue-600 font-mono font-medium mr-2">
                {analysis.codigoDisplay}
              </span>
              <h3 className="font-medium">{analysis.nombre}</h3>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              <span className="mr-4">Unidad: {analysis.unidad}</span>
              <span>Actualizado: {formatDate(analysis.fecha_actualizacion)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-500">Costo Total</div>
            <div className="font-medium">{formatCurrency(analysis.costo_total)}</div>
          </div>
          
          {(onEdit || onDelete) && (
            <div className="flex gap-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(analysis.id);
                  }}
                  className="p-1 rounded hover:bg-blue-100 text-blue-600"
                  title="Editar análisis"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('¿Está seguro que desea eliminar este análisis?')) {
                      onDelete(analysis.id);
                    }
                  }}
                  className="p-1 rounded hover:bg-red-100 text-red-600"
                  title="Eliminar análisis"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500">Código</div>
              <div className="font-mono">{analysis.codigoDisplay}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Unidad</div>
              <div>{analysis.unidad}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Rendimiento</div>
              <div>{analysis.rendimiento}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Última Actualización</div>
              <div>{formatDate(analysis.fecha_actualizacion)}</div>
            </div>
          </div>
          
          {/* Insumos */}
          <div>
            <h4 className="font-medium mb-2">Insumos</h4>
            {Object.keys(analysis.insumos || {}).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Código</th>
                      <th className="p-2 text-left">Descripción</th>
                      <th className="p-2 text-right">Cantidad</th>
                      <th className="p-2 text-center">Unidad</th>
                      <th className="p-2 text-right">Precio Unit.</th>
                      <th className="p-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(analysis.insumos).map(([key, insumo]) => (
                      <tr key={key} className="border-b">
                        <td className="p-2">{insumo.item_id}</td>
                        <td className="p-2">{insumo.item?.descripcion || '-'}</td>
                        <td className="p-2 text-right">{insumo.cantidad}</td>
                        <td className="p-2 text-center">{insumo.unidad}</td>
                        <td className="p-2 text-right">{formatCurrency(insumo.precio_unitario)}</td>
                        <td className="p-2 text-right">{formatCurrency(insumo.subtotal)}</td>
                      </tr>
                    ))}
                    <tr className="font-medium bg-gray-50">
                      <td colSpan={5} className="p-2 text-right">Total:</td>
                      <td className="p-2 text-right">{formatCurrency(analysis.costo_total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 bg-gray-100 rounded">
                No hay insumos registrados para este análisis.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};