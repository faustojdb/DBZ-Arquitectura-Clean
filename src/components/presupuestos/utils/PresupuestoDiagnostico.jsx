// src/components/presupuestos/utils/PresupuestoDiagnostico.jsx
import React from 'react';

/**
 * Componente de diagnóstico para analizar la estructura de datos de un presupuesto
 * y detectar posibles problemas
 */
const PresupuestoDiagnostico = ({ presupuesto }) => {
  if (!presupuesto) {
    return (
      <div className="bg-red-100 p-4 rounded border border-red-300 mb-4">
        <h3 className="text-lg font-semibold text-red-700">Diagnóstico: Presupuesto no disponible</h3>
        <p>No se encontró el objeto de presupuesto para analizar.</p>
      </div>
    );
  }

  // Verificar estructura básica del presupuesto
  const tieneItems = presupuesto.items && Object.keys(presupuesto.items).length > 0;
  const tieneSubtotales = presupuesto.subtotales && Object.keys(presupuesto.subtotales).length > 0;
  const tieneTotalGeneral = presupuesto.total_general !== undefined && presupuesto.total_general !== null;
  const tieneDatosGenerales = presupuesto.datos_generales !== undefined && presupuesto.datos_generales !== null;
  
  // Verificar beneficios
  const beneficioExplicitoEnRaiz = presupuesto.beneficioExplicito !== undefined && presupuesto.beneficioExplicito !== null;
  const beneficioExplicitoEnDatos = tieneDatosGenerales && presupuesto.datos_generales.beneficio_explicito !== undefined && presupuesto.datos_generales.beneficio_explicito !== null;
  const beneficioImplicitoEnRaiz = presupuesto.beneficioImplicito !== undefined && presupuesto.beneficioImplicito !== null;
  const beneficioImplicitoEnDatos = tieneDatosGenerales && presupuesto.datos_generales.beneficio_implicito !== undefined && presupuesto.datos_generales.beneficio_implicito !== null;
  
  // Verificar lugar y fecha
  const lugarEnRaiz = presupuesto.lugar !== undefined && presupuesto.lugar !== null;
  const lugarEnDatos = tieneDatosGenerales && presupuesto.datos_generales.lugar !== undefined && presupuesto.datos_generales.lugar !== null;
  const fechaEnRaiz = presupuesto.fecha !== undefined && presupuesto.fecha !== null;
  const fechaEnDatos = tieneDatosGenerales && presupuesto.datos_generales.fecha !== undefined && presupuesto.datos_generales.fecha !== null;
  
  // Calcular total manualmente desde los items para comparar
  let totalCalculado = 0;
  if (tieneItems) {
    totalCalculado = Object.values(presupuesto.items).reduce((sum, item) => sum + (parseFloat(item.importe) || 0), 0);
  }
  
  // Discrepancia entre total almacenado y calculado
  const totalAlmacenado = parseFloat(presupuesto.total_general) || 0;
  const hayDiscrepancia = Math.abs(totalCalculado - totalAlmacenado) > 0.01; // Tolerancia de 0.01 para diferencias de redondeo
  
  // Tipos de datos para debugging
  const tipoTotalGeneral = typeof presupuesto.total_general;
  const valorTotalGeneral = presupuesto.total_general;

  return (
    <div className="bg-blue-50 p-4 rounded border border-blue-300 mb-4 print-hidden">
      <h3 className="text-lg font-semibold text-blue-700">Diagnóstico del Presupuesto</h3>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h4 className="font-semibold">Estructura básica:</h4>
          <ul className="list-disc pl-5 mt-2">
            <li className={tieneItems ? "text-green-600" : "text-red-600"}>
              Items: {tieneItems ? `✓ (${Object.keys(presupuesto.items).length})` : "✗ No encontrados"}
            </li>
            <li className={tieneSubtotales ? "text-green-600" : "text-red-600"}>
              Subtotales: {tieneSubtotales ? `✓ (${Object.keys(presupuesto.subtotales).length})` : "✗ No encontrados"}
            </li>
            <li className={tieneTotalGeneral ? "text-green-600" : "text-red-600"}>
              Total General: {tieneTotalGeneral ? "✓" : "✗ No encontrado"}
              {tieneTotalGeneral && ` (${tipoTotalGeneral}: ${valorTotalGeneral})`}
            </li>
            <li className={tieneDatosGenerales ? "text-green-600" : "text-red-600"}>
              Datos Generales: {tieneDatosGenerales ? "✓" : "✗ No encontrados"}
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold">Datos críticos:</h4>
          <ul className="list-disc pl-5 mt-2">
            <li className={beneficioExplicitoEnRaiz || beneficioExplicitoEnDatos ? "text-green-600" : "text-red-600"}>
              Beneficio Explícito: 
              {beneficioExplicitoEnRaiz ? ` ✓ En raíz (${presupuesto.beneficioExplicito}%)` : " ✗ No en raíz"}
              {beneficioExplicitoEnDatos ? ` ✓ En datos (${presupuesto.datos_generales.beneficio_explicito}%)` : " ✗ No en datos"}
            </li>
            <li className={beneficioImplicitoEnRaiz || beneficioImplicitoEnDatos ? "text-green-600" : "text-red-600"}>
              Beneficio Implícito: 
              {beneficioImplicitoEnRaiz ? ` ✓ En raíz (${presupuesto.beneficioImplicito}%)` : " ✗ No en raíz"}
              {beneficioImplicitoEnDatos ? ` ✓ En datos (${presupuesto.datos_generales.beneficio_implicito}%)` : " ✗ No en datos"}
            </li>
            <li className={lugarEnRaiz || lugarEnDatos ? "text-green-600" : "text-orange-600"}>
              Lugar: 
              {lugarEnRaiz ? ` ✓ En raíz (${presupuesto.lugar})` : " ✗ No en raíz"}
              {lugarEnDatos ? ` ✓ En datos (${presupuesto.datos_generales.lugar})` : " ✗ No en datos"}
            </li>
            <li className={fechaEnRaiz || fechaEnDatos ? "text-green-600" : "text-red-600"}>
              Fecha: 
              {fechaEnRaiz ? ` ✓ En raíz` : " ✗ No en raíz"}
              {fechaEnDatos ? ` ✓ En datos` : " ✗ No en datos"}
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-semibold">Verificación de totales:</h4>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="p-2 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Total almacenado:</p>
            <p className="font-mono">{totalAlmacenado.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="p-2 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Total calculado:</p>
            <p className="font-mono">{totalCalculado.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
          </div>
          <div className={`p-2 rounded ${hayDiscrepancia ? 'bg-red-100' : 'bg-green-100'}`}>
            <p className="text-sm text-gray-600">Diferencia:</p>
            <p className="font-mono">{Math.abs(totalCalculado - totalAlmacenado).toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
            <p className="text-xs mt-1">{hayDiscrepancia ? '⚠️ Discrepancia detectada' : '✓ Totales coinciden'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresupuestoDiagnostico;