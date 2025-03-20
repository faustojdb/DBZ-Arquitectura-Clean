// src/components/presupuestos/PresupuestoViewer.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import usePresupuesto from '../../hooks/usePresupuesto';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ExportToPDF from './components/ExportToPDF';
// Importamos la herramienta de diagnóstico
import PresupuestoDiagnostico from './utils/PresupuestoDiagnostico';

const PresupuestoViewer = () => {
  const { presupuestoId } = useParams();
  const navigate = useNavigate();
  const { presupuesto, loading, error } = usePresupuesto(presupuestoId);
  const [notasTexto, setNotasTexto] = useState('');
  const presupuestoRef = useRef(null);
  const [mostrarDiagnostico, setMostrarDiagnostico] = useState(false);
  
  // Función para obtener el total general de manera confiable
  const getTotalGeneral = () => {
    if (!presupuesto) return 0;
    
    // Intentar con las propiedades más probables
    const candidates = [
      presupuesto.total_general,
      presupuesto.totalGeneral,
      presupuesto.total,
      presupuesto.totalPresupuesto
    ];
    
    // Buscar en datos_generales si existe
    if (presupuesto.datos_generales) {
      candidates.push(
        presupuesto.datos_generales.total_general,
        presupuesto.datos_generales.totalGeneral,
        presupuesto.datos_generales.total
      );
    }
    
    // Obtener el primer valor válido
    for (const candidate of candidates) {
      if (candidate !== undefined && candidate !== null) {
        const numValue = parseFloat(candidate);
        if (!isNaN(numValue)) {
          console.log("Total general encontrado:", numValue);
          return numValue;
        }
      }
    }
    
    // Si no se encuentra, calcular desde los ítems
    if (presupuesto.items && Object.keys(presupuesto.items).length > 0) {
      const totalCalculado = Object.values(presupuesto.items).reduce(
        (sum, item) => {
          const importe = parseFloat(item.importe || 0);
          return sum + (isNaN(importe) ? 0 : importe);
        }, 
        0
      );
      console.log("Total general calculado de los ítems:", totalCalculado);
      return totalCalculado;
    }
    
    return 0;
  };
  
  // Organizar ítems por rubro
  const organizarItemsPorRubro = () => {
    if (!presupuesto) return [];
    
    const result = [];
    const subtotales = presupuesto.subtotales || {};
    const presupuestoItems = presupuesto.items || {};
    
    // Ordenar rubros por ID
    const rubrosOrdenados = Object.entries(subtotales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => {
        const numA = parseInt(a.id.replace('ST', '').replace(/^0+/, '') || '0');
        const numB = parseInt(b.id.replace('ST', '').replace(/^0+/, '') || '0');
        return numA - numB;
      });
    
    // Procesar cada rubro y sus items
    rubrosOrdenados.forEach(rubro => {
      // Extraer el número de rubro
      const rubroNumero = rubro.id.replace('ST', '').replace(/^0+/, '');
      
      // Agregar rubro principal (con índice correcto X.0.0)
      result.push({
        id: rubro.id,
        esRubro: true,
        indice: rubroNumero + '.0.0',
        nombre: rubro.nombre || 'Sin nombre',
        importe: rubro.importe || 0,
        incidencia: rubro.incidencia || 0
      });
      
      // Filtrar items por rubro
      const itemsFiltrados = Object.entries(presupuestoItems)
        .filter(([_, itemData]) => {
          const itemPrefix = (itemData.numero_item || '').split('.')[0];
          return itemPrefix === rubroNumero;
        })
        .map(([itemId, itemData]) => ({
          id: itemId,
          esRubro: false,
          indice: itemData.numero_item || '',
          nombre: itemData.nombre || '',
          unidad: itemData.unidad || '',
          cantidad: itemData.cantidad || 0,
          precioUnitario: itemData.precio_unitario || 0,
          importe: itemData.importe || 0,
          incidencia: itemData.incidencia || 0,
          abrev: itemData.abrev || ''
        }))
        .sort((a, b) => {
          const subIndexA = parseFloat(a.indice.split('.')[1] || '0');
          const subIndexB = parseFloat(b.indice.split('.')[1] || '0');
          return subIndexA - subIndexB;
        });
      
      result.push(...itemsFiltrados);
    });
    
    return result;
  };

  // Función para formatear fecha correctamente (VERSIÓN MEJORADA)
  const formatearFecha = (fechaInput) => {
    if (!fechaInput) return '11 de Marzo de 2025';
    
    try {
      let fecha;
      
      // Manejar diferentes formatos de fecha
      if (typeof fechaInput === 'string') {
        fecha = new Date(fechaInput);
      } else if (fechaInput instanceof Date) {
        fecha = fechaInput;
      } else if (fechaInput.toDate && typeof fechaInput.toDate === 'function') {
        fecha = fechaInput.toDate();
      } else if (fechaInput.seconds) {
        fecha = new Date(fechaInput.seconds * 1000);
      } else {
        fecha = new Date();
      }
      
      // Obtener componentes de fecha
      const day = fecha.getDate().toString().padStart(2, '0');
      const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      const month = monthNames[fecha.getMonth()];
      const year = fecha.getFullYear();
      
      return `${day} de ${month} de ${year}`;
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return '11 de Marzo de 2025';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }
  
  if (error || !presupuesto) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Vista de Presupuesto</h1>
          <button
            onClick={() => navigate('/presupuestos')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver
          </button>
        </div>
        
        <div className="bg-white p-8 rounded shadow-md">
          <div className="p-4 bg-red-100 text-red-700 rounded">
            <p className="font-semibold">Error:</p>
            <p>{error || 'Presupuesto no encontrado'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Calcular totales - VERSIÓN MEJORADA
  const total = getTotalGeneral();
  const beneficioExplicito = parseFloat(presupuesto.beneficioExplicito || presupuesto.datos_generales?.beneficio_explicito) || 20;
  const beneficioAmount = total * (beneficioExplicito / 100);
  const totalConBeneficio = total + beneficioAmount;

  console.log("Datos de totales finales:", { 
    total, 
    beneficioExplicito, 
    beneficioAmount, 
    totalConBeneficio
  });
  
  // Extraer datos del presupuesto para asegurar que estén disponibles
  const lugarPresupuesto = presupuesto.lugar && presupuesto.lugar !== '' ? presupuesto.lugar : 'Lugar';
  
  // Verificar el objeto datos_generales en caso de que la estructura sea anidada
  let lugarFromDatosGenerales = '';
  if (presupuesto.datos_generales && presupuesto.datos_generales.lugar) {
    lugarFromDatosGenerales = presupuesto.datos_generales.lugar;
  }
  
  // Usar el valor que no esté vacío, priorizando datos_generales
  const lugarFinal = lugarFromDatosGenerales || lugarPresupuesto;
  
  // Fecha formateada para mostrar
  const fechaFormateada = formatearFecha(presupuesto.fecha || presupuesto.datos_generales?.fecha);
  
  // Obtener items organizados
  const rubrosItems = organizarItemsPorRubro();
  
  return (
    <div className="container mx-auto px-4 flex flex-col items-center print:px-0 print:py-0">
      {/* Estilos CSS */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@600&family=Kanit:wght@500&display=swap');
          
          @page {
            size: A4;
            margin: 20mm;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
              background-color: #FFFFFF;
            }
            
            #presupuesto-documento {
              width: 100%;
              box-shadow: none;
            }
            
            #presupuesto-main {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
            
            .print-hidden {
              display: none !important;
            }
          }

          .dbz-title {
            font-family: 'Kanit', sans-serif;
            font-weight: 500;
            color: #364C63;
          }
          
          .arquitectura-title {
            font-family: 'Josefin Sans', sans-serif;
            font-weight: 600;
            color: #364C63;
          }
        `}
      </style>
      
      {/* Herramienta de diagnóstico con toggle - Solo visible en desarrollo */}
      {process.env.NODE_ENV !== 'production' && (
        <>
          <button 
            onClick={() => setMostrarDiagnostico(!mostrarDiagnostico)}
            className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-md shadow-lg z-50 print-hidden"
            title="Mostrar diagnóstico técnico"
          >
            {mostrarDiagnostico ? '✕ Cerrar Diagnóstico' : '🔍 Diagnóstico'}
          </button>
          
          {mostrarDiagnostico && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 print-hidden">
              <div className="bg-white rounded-lg shadow-xl max-w-5xl max-h-[90vh] overflow-auto p-6 m-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h3 className="text-xl font-bold">Diagnóstico del Presupuesto</h3>
                  <button 
                    onClick={() => setMostrarDiagnostico(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>
                <PresupuestoDiagnostico presupuesto={presupuesto} />
                <div className="mt-4 pt-2 border-t text-right">
                  <button 
                    onClick={() => setMostrarDiagnostico(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Barra de herramientas (no se imprime) */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 print-hidden">
        <h1 className="text-2xl font-bold">Vista de Presupuesto</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/presupuestos')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver
          </button>
          <Link
            to={`/presupuestos/editar/${presupuestoId}`} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Editar
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Imprimir
          </button>
          {/* Botón para exportar solo la parte principal del presupuesto */}
          <ExportToPDF elementId="presupuesto-main" fileName={`Presupuesto_${presupuestoId}.pdf`} />
        </div>
      </div>
      
      {/* Documento de presupuesto */}
      <div 
        id="presupuesto-documento" 
        ref={presupuestoRef} 
        className="w-full max-w-5xl shadow-lg print:shadow-none bg-white"
      >
        <table className="w-full border-collapse border border-gray-300">
          <tbody>
            {/* Lista de colores */}
            <tr>
              <td style={{backgroundColor: '#F3B340'}}>#F3B340</td>
              <td style={{backgroundColor: '#E66A2C'}}>#E66A2C</td>
              <td style={{backgroundColor: '#F094A7'}}>#F094A7</td>
              <td style={{backgroundColor: '#364C63', color: 'white'}}>#364C63</td>
              <td style={{backgroundColor: '#F4F3EF'}}>#F4F3EF</td>
              <td colSpan={3}></td>
            </tr>
            <tr><td colSpan={8}></td></tr>
            
            {/* DBZ y Arquitectura */}
            <tr>
              <td className="dbz-title p-2" style={{fontSize: '24px'}}>DBZ</td>
              <td colSpan={7} className="p-2"></td>
            </tr>
            <tr>
              <td className="arquitectura-title p-2">ARQUITECTURA</td>
              <td colSpan={7} className="p-2"></td>
            </tr>
            <tr>
              <td className="p-2">Beneficios Imp.:</td>
              <td className="p-2">{presupuesto.beneficioImplicito || presupuesto.datos_generales?.beneficio_implicito || 70}%</td>
              <td colSpan={6} className="p-2"></td>
            </tr>
            <tr><td colSpan={8} className="p-2"></td></tr>
            
            {/* Esta es la parte que se exportará a PDF */}
            <tr id="presupuesto-main">
              <td colSpan={8} style={{padding: 0, border: 'none'}}>
                <table className="w-full border-collapse border border-gray-300" style={{margin: 0}}>
                  <tbody>
                    {/* Título Presupuesto y logo */}
                    <tr>
                      <td colSpan={6} className="dbz-title p-2" style={{fontSize: '28px'}}>PRESUPUESTO</td>
                      <td colSpan={2} rowSpan={3} className="p-2 text-right">
                        <img 
                          src="/assets/logo-dbz.png" 
                          alt="DBZ Arquitectura" 
                          style={{height: '80px', float: 'right'}} 
                          onError={(e) => {
                            e.currentTarget.src = "/logo-dbz.png";
                            e.currentTarget.onerror = null;
                          }}
                        />
                      </td>
                    </tr>
                    <tr><td colSpan={6} className="p-2"></td></tr>
                    <tr>
                      <td className="p-2">{lugarFinal}</td>
                      <td className="p-2">,</td>
                      <td colSpan={5} className="p-2">{fechaFormateada}</td>
                    </tr>
                    
                    {/* Datos iniciales */}
                    <tr style={{backgroundColor: '#364C63'}}>
                      <td colSpan={2} className="p-2" style={{color: '#F4F3EF'}}>COMITENTE:</td>
                      <td colSpan={6} className="p-2" style={{color: '#F4F3EF'}}>{presupuesto.comitente}</td>
                    </tr>
                    <tr style={{backgroundColor: '#364C63'}}>
                      <td colSpan={2} className="p-2" style={{color: '#F4F3EF'}}>OBRA:</td>
                      <td colSpan={6} className="p-2" style={{color: '#F4F3EF'}}>{presupuesto.obra}</td>
                    </tr>
                    <tr style={{backgroundColor: '#364C63'}}>
                      <td colSpan={2} className="p-2" style={{color: '#F4F3EF'}}>TIPO DE ENCOMIENDA:</td>
                      <td colSpan={6} className="p-2" style={{color: '#F4F3EF'}}>{presupuesto.tipoEncomenda || 'Obra - Construcción'}</td>
                    </tr>
                    <tr><td colSpan={8} className="p-2"></td></tr>
                    
                    {/* Tabla de ítems */}
                    <tr style={{backgroundColor: '#F3B340'}}>
                      <th className="p-2 border border-gray-300 text-left">ITEM</th>
                      <th className="p-2 border border-gray-300 text-left">Abrev</th>
                      <th className="p-2 border border-gray-300 text-left">NOMBRE / INSUMO</th>
                      <th className="p-2 border border-gray-300 text-left">UNIDAD</th>
                      <th className="p-2 border border-gray-300 text-left">CANTIDAD</th>
                      <th className="p-2 border border-gray-300 text-left">PRECIO UNITARIO</th>
                      <th className="p-2 border border-gray-300 text-left" style={{width: '120px'}}>IMPORTE</th>
                      <th className="p-2 border border-gray-300 text-left" style={{width: '90px'}}>INCID. (%)</th>
                    </tr>
                    <tr><td colSpan={8} className="p-2"></td></tr>
                    
                    {/* Datos de ítems y rubros */}
                    {rubrosItems.map((item, index) => (
                      <tr 
                        key={`${item.id}-${index}`} 
                        style={{
                          backgroundColor: item.esRubro ? '#F4F3EF' : '#FFFFFF',
                          fontWeight: item.esRubro ? 'bold' : 'normal'
                        }}
                      >
                        <td className="p-2 border border-gray-300">{item.indice}</td>
                        <td className="p-2 border border-gray-300">{!item.esRubro ? item.abrev : ""}</td>
                        <td className="p-2 border border-gray-300">{item.nombre}</td>
                        <td className="p-2 border border-gray-300 text-center">{!item.esRubro ? item.unidad : ""}</td>
                        <td className="p-2 border border-gray-300 text-right">
                          {!item.esRubro ? item.cantidad.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ""}
                        </td>
                        <td className="p-2 border border-gray-300 text-right">
                          {!item.esRubro ? `${item.precioUnitario.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : ""}
                        </td>
                        <td className="p-2 border border-gray-300 text-right">
                          {`$ ${item.importe.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                        </td>
                        <td className="p-2 border border-gray-300 text-right">
                          {item.esRubro && item.incidencia > 0 
                            ? `${parseFloat(item.incidencia).toFixed(2)}%`
                            : ""
                          }
                        </td>
                      </tr>
                    ))}
                    
                    {/* Espacio azul entre ítems y totales */}
                    <tr><td colSpan={8} style={{backgroundColor: '#364C63', height: '60px'}}></td></tr>
                    <tr><td colSpan={8}></td></tr>
                    
                    {/* Totales - CORREGIDO: Muestra valores calculados correctamente */}
                    <tr style={{backgroundColor: '#F3B340'}}>
                      <td colSpan={5} className="p-2 border border-gray-300"></td>
                      <td className="p-2 border border-gray-300 text-right"><strong>Subtotal:</strong></td>
                      <td className="p-2 border border-gray-300 text-right">$</td>
                      <td className="p-2 border border-gray-300 text-right">
                        {total.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                    <tr style={{backgroundColor: '#F3B340'}}>
                      <td colSpan={5} className="p-2 border border-gray-300"></td>
                      <td className="p-2 border border-gray-300 text-right"><strong>Beneficios ({beneficioExplicito}%)</strong></td>
                      <td className="p-2 border border-gray-300 text-right">$</td>
                      <td className="p-2 border border-gray-300 text-right">
                        {beneficioAmount.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                    <tr style={{backgroundColor: '#F3B340'}}>
                      <td colSpan={5} className="p-2 border border-gray-300"></td>
                      <td className="p-2 border border-gray-300 text-right"><strong>Total Ejecucion:</strong></td>
                      <td className="p-2 border border-gray-300 text-right">$</td>
                      <td className="p-2 border border-gray-300 text-right font-bold">
                        {totalConBeneficio.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                    <tr><td colSpan={8}></td></tr>
                    <tr><td colSpan={8}></td></tr>
                    
                    {/* Notas y firma */}
                    <tr>
                      <td colSpan={2}></td>
                      <td colSpan={4} className="p-2 border border-gray-300">
                        <div>
                          <p>Notas:</p>
                          <textarea 
                            className="w-full p-2 border border-gray-300 print:border-none"
                            style={{minHeight: '120px', width: '100%'}}
                            value={notasTexto}
                            onChange={(e) => setNotasTexto(e.target.value)}
                          />
                        </div>
                      </td>
                      <td colSpan={2} className="p-2 border border-gray-300 text-right align-top">
                        <img 
                          src="/assets/firma.png" 
                          alt="Firma" 
                          style={{maxWidth: '100%', float: 'right'}} 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PresupuestoViewer;