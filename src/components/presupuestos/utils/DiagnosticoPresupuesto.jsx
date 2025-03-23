// src/components/presupuestos/utils/DiagnosticoPresupuesto.jsx
import React from 'react';

/**
 * Componente para diagnosticar en profundidad la estructura de un presupuesto
 * y detectar problemas específicos con la lectura de datos
 */
const DiagnosticoPresupuesto = ({ presupuesto }) => {
  if (!presupuesto) {
    return <div className="p-4 bg-red-100 rounded">No hay presupuesto para diagnosticar</div>;
  }

  // Analizar la estructura completa del presupuesto
  const keysPresupuesto = Object.keys(presupuesto);
  
  // Buscar todas las posibles propiedades relacionadas con totales
  const propiedadesTotales = keysPresupuesto.filter(k => 
    k.toLowerCase().includes('total') || 
    k.toLowerCase().includes('monto') || 
    k.toLowerCase().includes('importe')
  );
  
  // Extraer todos los valores numéricos en el primer nivel
  const valoresNumericos = Object.entries(presupuesto)
    .filter(([_, value]) => typeof value === 'number' || !isNaN(parseFloat(value)))
    .map(([key, value]) => ({ key, value }));
  
  // Verificar datos_generales
  const tieneDatosGenerales = presupuesto.datos_generales && typeof presupuesto.datos_generales === 'object';
  
  // Analizar datos_generales si existe
  const propiedadesDatosGenerales = tieneDatosGenerales ? 
    Object.keys(presupuesto.datos_generales) : [];
  
  // Buscar propiedades de total en datos_generales
  const propiedadesTotalesEnDatosGenerales = tieneDatosGenerales ?
    propiedadesDatosGenerales.filter(k => 
      k.toLowerCase().includes('total') || 
      k.toLowerCase().includes('monto') || 
      k.toLowerCase().includes('importe')
    ) : [];
  
  // Calcular total manualmente desde ítems
  let totalCalculado = 0;
  if (presupuesto.items && Object.keys(presupuesto.items).length > 0) {
    totalCalculado = Object.values(presupuesto.items)
      .reduce((sum, item) => {
        const importe = parseFloat(item.importe || 0);
        return sum + (isNaN(importe) ? 0 : importe);
      }, 0);
  }
  
  // Datos de estructura del hook usePresupuesto y procesamiento
  const estructuraPropuesta = {
    total_general: '¿?',
    totalGeneral: '¿?',
    datos_generales: {
      total: '¿?'
    }
  };

  return (
    <div className="p-4 mb-6 bg-blue-50 rounded border border-blue-300">
      <h3 className="text-lg font-bold mb-2">Diagnóstico Detallado del Presupuesto</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-semibold">Propiedades en la raíz:</h4>
          <div className="p-2 bg-white rounded border overflow-x-auto">
            <pre className="text-xs">{JSON.stringify(keysPresupuesto, null, 2)}</pre>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold">Propiedades en datos_generales:</h4>
          <div className="p-2 bg-white rounded border overflow-x-auto">
            <pre className="text-xs">{JSON.stringify(propiedadesDatosGenerales, null, 2)}</pre>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold">Propiedades que podrían contener el total:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-sm font-medium">En la raíz:</p>
            <ul className="list-disc pl-5 mt-1">
              {propiedadesTotales.map(prop => (
                <li key={prop} className="text-sm">
                  <code>{prop}</code>: {" "}
                  <span className="font-mono">
                    {typeof presupuesto[prop] === 'object' 
                      ? 'Objeto' 
                      : JSON.stringify(presupuesto[prop])}
                  </span>
                </li>
              ))}
              {propiedadesTotales.length === 0 && (
                <li className="text-red-500 text-sm">No se encontraron propiedades de totales</li>
              )}
            </ul>
          </div>
          
          <div>
            <p className="text-sm font-medium">En datos_generales:</p>
            <ul className="list-disc pl-5 mt-1">
              {propiedadesTotalesEnDatosGenerales.map(prop => (
                <li key={prop} className="text-sm">
                  <code>{prop}</code>: {" "}
                  <span className="font-mono">
                    {typeof presupuesto.datos_generales[prop] === 'object' 
                      ? 'Objeto' 
                      : JSON.stringify(presupuesto.datos_generales[prop])}
                  </span>
                </li>
              ))}
              {(propiedadesTotalesEnDatosGenerales.length === 0 && tieneDatosGenerales) && (
                <li className="text-orange-500 text-sm">No se encontraron propiedades de totales</li>
              )}
              {!tieneDatosGenerales && (
                <li className="text-red-500 text-sm">No existe datos_generales</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold">Todos los valores numéricos en la raíz:</h4>
        <div className="p-2 bg-white rounded border overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-1 border text-left">Propiedad</th>
                <th className="p-1 border text-left">Valor</th>
                <th className="p-1 border text-left">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {valoresNumericos.map(({key, value}) => (
                <tr key={key} className="border-b">
                  <td className="p-1 border"><code>{key}</code></td>
                  <td className="p-1 border font-mono">{JSON.stringify(value)}</td>
                  <td className="p-1 border">{typeof value}</td>
                </tr>
              ))}
              {valoresNumericos.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-1 border text-center text-red-500">
                    No se encontraron valores numéricos en la raíz
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-semibold">Total calculado de ítems:</h4>
          <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="font-mono">{totalCalculado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold">Propiedades típicas esperadas:</h4>
          <div className="p-2 bg-white rounded border overflow-x-auto">
            <pre className="text-xs">{JSON.stringify(estructuraPropuesta, null, 2)}</pre>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-yellow-100 rounded">
        <h4 className="font-semibold">Diagnóstico preliminar:</h4>
        <ul className="list-disc pl-5 mt-2">
          <li className="mb-1">
            {keysPresupuesto.includes('total_general') 
              ? <span className="text-green-600">La propiedad 'total_general' SÍ existe en el presupuesto</span>
              : <span className="text-red-600">La propiedad 'total_general' NO existe en el presupuesto</span>
            }
          </li>
          <li className="mb-1">
            {keysPresupuesto.includes('totalGeneral') 
              ? <span className="text-green-600">La propiedad 'totalGeneral' SÍ existe en el presupuesto</span>
              : <span className="text-red-600">La propiedad 'totalGeneral' NO existe en el presupuesto</span>
            }
          </li>
          <li className="mb-1">
            {tieneDatosGenerales && propiedadesDatosGenerales.some(p => p.toLowerCase().includes('total'))
              ? <span className="text-green-600">SÍ existen propiedades relacionadas con totales en datos_generales</span>
              : <span className="text-red-600">NO existen propiedades relacionadas con totales en datos_generales</span>
            }
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DiagnosticoPresupuesto;