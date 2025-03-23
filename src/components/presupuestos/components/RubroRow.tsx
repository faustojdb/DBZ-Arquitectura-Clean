// src/components/presupuestos/components/RubroRow.tsx
import React from 'react';

interface RubroRowProps {
  rubro: {
    id: string;
    indice: string;
    nombre: string;
    importe: number;
    incidencia: number;
  };
}

/**
 * Componente para mostrar una fila de un rubro en la tabla de presupuesto
 */
const RubroRow: React.FC<RubroRowProps> = ({ rubro }) => {
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
    <tr className="bg-gray-100 font-semibold border-b border-gray-300">
      <td className="py-2 px-3 text-center">{rubro.indice}</td>
      <td className="py-2 px-3">{rubro.nombre}</td>
      <td className="py-2 px-3 text-center"></td>
      <td className="py-2 px-3 text-right"></td>
      <td className="py-2 px-3 text-right"></td>
      <td className="py-2 px-3 text-right">{formatCurrency(rubro.importe)}</td>
      <td className="py-2 px-3 text-right">{formatPercent(rubro.incidencia)}</td>
      <td></td>
    </tr>
  );
};

export default RubroRow;