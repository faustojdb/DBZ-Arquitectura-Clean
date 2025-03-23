// src/components/presupuestos/PresupuestoEditor.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

import usePresupuesto from '../../hooks/usePresupuesto';
import useAnalisis from '../../hooks/useAnalisis';
import AnalisisSelector from './AnalisisSelector';
import InfoTooltip from '../shared/InfoTooltip';

import { formatCurrency } from '../../utils/formatters';
import { 
  analisisToPresupuestoItem, 
  calcularRubrosYTotales, 
  prepararDatosFirestore 
} from '../../utils/presupuestoUtils';
import RUBROS from '../analysis/constants/rubros'; // Importar los 37 rubros

const PresupuestoEditor = () => {
  const navigate = useNavigate();
  const { presupuestoId } = useParams();
  const isEditing = !!presupuestoId;

  const [analyses, setAnalyses] = useState([]);
  const [formError, setFormError] = useState(null);
  const [items, setItems] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [lastBeneficioImplicito, setLastBeneficioImplicito] = useState(0);

  const { presupuesto, loading, error, createPresupuesto, updatePresupuesto } = usePresupuesto(presupuestoId);
  const { fetchAllRubros } = useAnalisis();

  const [formData, setFormData] = useState({
    comitente: '',
    obra: '',
    lugar: 'Lugar',
    fecha: new Date().toISOString().split('T')[0],
    tipo_encomienda: 'Obra - Construcción',
    beneficio_explicito: 20,
    beneficio_implicito: 0
  });
  
  // Cargar análisis al iniciar
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const analysisRef = collection(db, 'analisis');
        const snapshot = await getDocs(analysisRef);
        
        const loadedAnalyses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAnalyses(loadedAnalyses);
      } catch (error) {
        console.error("Error al cargar análisis:", error);
      }
    };
    
    fetchAnalyses();
  }, []);

  // Cargar datos del presupuesto existente
  useEffect(() => {
    if (presupuesto && isEditing) {
      const beneficioImplicito = presupuesto.beneficioImplicito || 0;
      
      // Formatear la fecha correctamente
      let fechaFormateada = new Date().toISOString().split('T')[0];
      
      if (presupuesto.fecha) {
        try {
          fechaFormateada = new Date(presupuesto.fecha).toISOString().split('T')[0];
        } catch (error) {
          console.error("Error al formatear la fecha:", error);
        }
      }
      
      setFormData({
        comitente: presupuesto.comitente || '',
        obra: presupuesto.obra || '',
        lugar: presupuesto.lugar || 'Lugar',
        fecha: fechaFormateada,
        tipo_encomienda: presupuesto.tipoEncomenda || 'Obra - Construcción',
        beneficio_explicito: presupuesto.beneficioExplicito || 20,
        beneficio_implicito: beneficioImplicito
      });
      
      setLastBeneficioImplicito(beneficioImplicito);
      
      // Cargar ítems del presupuesto
      if (presupuesto.items && Object.keys(presupuesto.items).length > 0) {
        const itemsConvertidos = Object.entries(presupuesto.items).map(([id, itemData]) => ({
          id,
          analisisId: itemData.analisis_id || '',
          nombre: itemData.nombre || '',
          unidad: itemData.unidad || '',
          cantidad: itemData.cantidad || 0,
          precioUnitario: itemData.precio_unitario || 0,
          importe: itemData.importe || 0,
          incidencia: itemData.incidencia || 0,
          indice: itemData.numero_item || '',
          rubroId: `ST${(itemData.numero_item || '').split('.')[0].padStart(3, '0')}`,
          abrev: itemData.abrev || ''
        }));
        
        setItems(itemsConvertidos);
      }
    }
  }, [presupuesto, isEditing]);

  // NUEVO EFECTO: Para monitorear cambios en los ítems
  useEffect(() => {
    console.log("Items han cambiado. Cantidad actual:", items.length);
    
    if (items.length > 0) {
      // Registrar algunos datos para diagnóstico
      console.log("IDs de ítems actuales:", items.map(item => item.id).join(', '));
      
      // Verificar si hay ítems con valores problemáticos
      const itemsInvalidos = items.filter(item => 
        !item.id || 
        item.cantidad === undefined || 
        isNaN(item.cantidad) ||
        item.precioUnitario === undefined ||
        isNaN(item.precioUnitario)
      );
      
      if (itemsInvalidos.length > 0) {
        console.warn("Se detectaron ítems con valores problemáticos:", itemsInvalidos);
      }
      
      // Verificar si la función handleDeleteItem está funcionando correctamente
      console.log("Los rubros e ítems serán recalculados con estos datos");
    } else {
      console.log("No hay ítems en el presupuesto actual.");
    }
    
  }, [items]); // Solo depende del array de items

  // Funciones de índices
  const getIndiceMayor = useCallback((item) => {
    const analysisDoc = analyses.find(a => a.id === item.analisisId);
    
    if (analysisDoc) {
      if (analysisDoc.indice?.mayor) return analysisDoc.indice.mayor;
      if (analysisDoc.codigoDisplay) {
        const parts = analysisDoc.codigoDisplay.split('.');
        return parseInt(parts[0]) || 1;
      }
    }
    
    if (item.numero_item) {
      const partes = item.numero_item.split('.');
      return parseInt(partes[0]) || 1;
    }
    
    return 1;
  }, [analyses]);

  const getIndiceMenor = useCallback((item) => {
    const analysisDoc = analyses.find(a => a.id === item.analisisId);
    
    if (analysisDoc) {
      if (analysisDoc.indice?.menor) return analysisDoc.indice.menor;
      if (analysisDoc.codigoDisplay) {
        const parts = analysisDoc.codigoDisplay.split('.');
        return parts.length > 1 ? parseInt(parts[1]) || 1 : 1;
      }
    }
    
    if (item.numero_item) {
      const partes = item.numero_item.split('.');
      return partes.length > 1 ? parseInt(partes[1]) || 1 : 1;
    }
    
    return 1;
  }, [analyses]);

  const getCategoriaFromIndiceMayor = (indiceMayor) => {
    // Buscar el rubro con el ID que coincide con indiceMayor
    const rubro = Object.values(RUBROS).find(r => r.id === indiceMayor);
    
    console.log(`Buscando categoría para índice ${indiceMayor}:`, 
      rubro ? rubro.nombre : 'No encontrada');
    
    return rubro 
      ? rubro.nombre 
      : `Categoría ${indiceMayor}`;
  };
  
  // Funciones de manejo de formulario y acciones
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'beneficio_implicito') {
      const newBeneficioImplicito = parseFloat(value) || 0;
      
      if (items.length > 0 && newBeneficioImplicito !== lastBeneficioImplicito) {
        const precioProporcional = (1 + newBeneficioImplicito/100) / (1 + lastBeneficioImplicito/100);
        
        setItems(items.map(item => ({
          ...item,
          precioUnitario: item.precioUnitario * precioProporcional,
          importe: item.cantidad * (item.precioUnitario * precioProporcional)
        })));
        
        setLastBeneficioImplicito(newBeneficioImplicito);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('beneficio') ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    try {
      // Validaciones
      if (!formData.comitente || !formData.obra) {
        setFormError('Comitente y Obra son campos obligatorios');
        return;
      }
      
      if (items.length === 0) {
        setFormError('Debe agregar al menos un ítem al presupuesto');
        return;
      }
      
      const presupuestoData = prepararDatosParaGuardar();
      
      if (isEditing && presupuestoId) {
        await updatePresupuesto(presupuestoId, presupuestoData);
        alert('Presupuesto actualizado correctamente');
      } else {
        await createPresupuesto(presupuestoData);
        alert('Presupuesto creado correctamente');
      }
      
      navigate('/presupuestos');
    } catch (err) {
      console.error('Error al guardar presupuesto:', err);
      setFormError(`Error: ${err.message}`);
    }
  };

  // Función auxiliar para preparar los datos para guardar
  const prepararDatosParaGuardar = (itemsActualizados = items) => {
    const fecha = new Date().toISOString();
    
    const datosCompletos = {
      ...formData,
      fecha: formData.fecha || fecha
    };
    
    return prepararDatosFirestore(datosCompletos, itemsActualizados);
  };
  
  const handleAddAnalisis = (analisis) => {
    if (!analisis) return;
    
    const newItem = analisisToPresupuestoItem(
      analisis, 
      1, 
      formData.beneficio_implicito
    );
    
    setItems(prev => [...prev, newItem]);
    setShowSelector(false);
  };

  const handleQuantityChange = (id, quantity) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, cantidad: quantity, importe: quantity * item.precioUnitario } 
        : item
    ));
  };

  const handleDeleteItem = async (id) => {
    console.log(`Iniciando eliminación del ítem: ${id}`);
    
    try {
      // 1. Eliminar el ítem del estado local
      const itemsActualizados = items.filter(item => item.id !== id);
      console.log(`Ítem ${id} filtrado. Quedan ${itemsActualizados.length} ítems`);
      
      // 2. Actualizar el estado local
      setItems(itemsActualizados);
      
      // 3. Si estamos editando un presupuesto existente, guardar los cambios en Firebase
      if (isEditing && presupuestoId) {
        console.log(`Guardando cambios en Firebase para presupuesto: ${presupuestoId}`);
        
        // Preparar datos para guardar
        const datosActualizados = prepararDatosParaGuardar(itemsActualizados);
        
        // Guardar en Firebase
        try {
          await updatePresupuesto(presupuestoId, datosActualizados);
          console.log(`Cambios guardados correctamente en Firebase`);
        } catch (errorFirebase) {
          console.error(`Error al guardar en Firebase:`, errorFirebase);
          // Opcionalmente, mostrar mensaje al usuario
        }
      }
      
      console.log(`Ítem ${id} eliminado con éxito`);
    } catch (error) {
      console.error(`Error al eliminar ítem ${id}:`, error);
      // Opcionalmente, mostrar mensaje al usuario
    }
  };

  const generarIndicesOrdenados = () => {
    console.log("Iniciando generación de índices ordenados");
    
    // Paso 1: Agrupar ítems por categoría según su índice mayor
    const itemsPorCategoria = {};
    
    items.forEach(item => {
      const indiceMayor = getIndiceMayor(item);
      if (!itemsPorCategoria[indiceMayor]) {
        itemsPorCategoria[indiceMayor] = [];
      }
      itemsPorCategoria[indiceMayor].push(item);
    });
    
    // Paso 2: Obtener categorías ordenadas por su índice numérico
    const categoriasOrdenadas = Object.keys(itemsPorCategoria)
      .map(Number)
      .sort((a, b) => a - b);
    
    console.log("Categorías ordenadas:", categoriasOrdenadas);
    
    // Paso 3: Asignar nuevos índices secuenciales por orden de categoría
    const itemsActualizados = [];
    let indiceCategoria = 1; // Empezar desde 1
    
    categoriasOrdenadas.forEach(categoriaOriginal => {
      // Obtener nombre de categoría para mostrar en logs
      const nombreCategoria = getCategoriaFromIndiceMayor(categoriaOriginal);
      console.log(`Procesando categoría ${indiceCategoria}: ${nombreCategoria}`);
      
      // Crear ID del rubro con el nuevo índice de categoría secuencial
      const rubroId = `ST${indiceCategoria.toString().padStart(3, '0')}`;
      
      // Asignar índices secuenciales a los ítems de esta categoría
      const itemsEnCategoria = itemsPorCategoria[categoriaOriginal];
      
      itemsEnCategoria.forEach((item, idx) => {
        // Crear el nuevo índice en formato X.Y.Z
        const nuevoIndice = `${indiceCategoria}.${idx + 1}.0`;
        
        itemsActualizados.push({
          ...item,
          indice: nuevoIndice,  // Índice secuencial del presupuesto
          rubroId: rubroId,     // ID del rubro secuencial
          categoriaOriginalId: categoriaOriginal  // Guardar la referencia a la categoría original
        });
        
        console.log(`Ítem asignado: ${nuevoIndice} (original: ${getIndiceMayor(item)}.${getIndiceMenor(item)})`);
      });
      
      // Incrementar para la siguiente categoría
      indiceCategoria++;
    });
    
    console.log(`Total: ${itemsActualizados.length} ítems con nuevos índices generados`);
    
    // Actualizar el estado con los nuevos ítems
    setItems(itemsActualizados);
    
    // Si estamos editando un presupuesto existente, guardar los cambios en Firebase
    if (isEditing && presupuestoId) {
      const datosActualizados = prepararDatosParaGuardar(itemsActualizados);
      
      updatePresupuesto(presupuestoId, datosActualizados)
        .then(() => {
          console.log("Índices generados y guardados correctamente");
          alert("Índices generados y guardados correctamente");
        })
        .catch(error => {
          console.error("Error al guardar índices:", error);
          alert("Índices generados pero no se pudieron guardar en la base de datos");
        });
    } else {
      alert("Índices generados correctamente");
    }
  };

  // Calcular rubros y totales
  const { items: itemsConIncidencia, rubros, totalGeneral } = calcularRubrosYTotales(items);
  const totalConBeneficioImplicito = totalGeneral;
  const beneficioExplicitoMonto = totalConBeneficioImplicito * (formData.beneficio_explicito / 100);
  const totalFinal = totalConBeneficioImplicito + beneficioExplicitoMonto;

  return (
    <div className="w-full max-w-10xl mx-auto px-4">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@600&family=Kanit:wght@500&display=swap');
          
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
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dbz-title">
          {isEditing ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
        </h1>
        <button
          onClick={() => navigate('/presupuestos')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Volver
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de datos generales */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4 dbz-title">Datos Generales</h2>
          
          <form onSubmit={handleSubmit}>
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {formError}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Comitente <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="comitente"
                value={formData.comitente}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Obra <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="obra"
                value={formData.obra}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Lugar
              </label>
              <input
                type="text"
                name="lugar"
                value={formData.lugar}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Fecha
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tipo de Encomienda
              </label>
              <select
                name="tipo_encomienda"
                value={formData.tipo_encomienda}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Obra - Construcción">Obra - Construcción</option>
                <option value="Obra - Remodelación">Obra - Remodelación</option>
                <option value="Proyecto">Proyecto</option>
                <option value="Dirección">Dirección</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Beneficio Explícito (%)
                <InfoTooltip text="Porcentaje visible que se suma al presupuesto final" />
              </label>
              <input
                type="number"
                name="beneficio_explicito"
                value={formData.beneficio_explicito}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Beneficio Implícito (%)
                <InfoTooltip text="Porcentaje oculto que se aplica a todos los ítems" />
              </label>
              <input
                type="number"
                name="beneficio_implicito"
                value={formData.beneficio_implicito}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isEditing ? 'Actualizar Presupuesto' : 'Crear Presupuesto'}
            </button>
          </form>
        </div>
        
        {/* Selector de análisis o lista de ítems */}
        <div className="lg:col-span-2">
          {showSelector ? (
            <AnalisisSelector onSelect={handleAddAnalisis} onCancel={() => setShowSelector(false)} />
          ) : (
            <div className="bg-white p-6 rounded shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold dbz-title">Ítems del Presupuesto</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSelector(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Agregar Ítem
                  </button>
                  
                  <button
                    onClick={() => generarIndicesOrdenados()}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    disabled={items.length === 0}
                  >
                    Generar Índices
                  </button>
                </div>
              </div>
              
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay ítems en el presupuesto. Haga clic en "Agregar Ítem" para comenzar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr style={{backgroundColor: '#F3B340'}}>
                        <th className="p-2 border border-gray-300 text-left">ITEM</th>
                        <th className="p-2 border border-gray-300 text-left">Abrev</th>
                        <th className="p-2 border border-gray-300 text-left">NOMBRE / INSUMO</th>
                        <th className="p-2 border border-gray-300 text-center">UNIDAD</th>
                        <th className="p-2 border border-gray-300 text-right">CANTIDAD</th>
                        <th className="p-2 border border-gray-300 text-right">PRECIO UNIT.</th>
                        <th className="p-2 border border-gray-300 text-right" style={{width: '120px'}}>IMPORTE</th>
                        <th className="p-2 border border-gray-300 text-right" style={{width: '90px'}}>INCID. (%)</th>
                        <th className="p-2 border border-gray-300 text-center">ACCIONES</th>
                        
                        {/* COLUMNAS DE DIAGNÓSTICO */}
                        <th className="p-2 border border-gray-300 text-left">Índice Mayor</th>
                        <th className="p-2 border border-gray-300 text-left">Índice Menor</th>
                        <th className="p-2 border border-gray-300 text-left">Categoría</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rubros.map(rubro => (
                        <React.Fragment key={rubro.id}>
                          <tr 
                            style={{
                              backgroundColor: '#364C63',
                              fontWeight: 'bold',
                              color: 'white'
                            }}
                          >
                            <td className="p-2 border border-gray-300">{rubro.indice}</td>
                            <td className="p-2 border border-gray-300"></td>
                            <td className="p-2 border border-gray-300">
                              {/* Mostrar la categoría real obtenida del índice mayor original del primer ítem */}
                              {rubro.items.length > 0 ? 
                                getCategoriaFromIndiceMayor(getIndiceMayor(rubro.items[0])) : 
                                'Sin categoría'}
                            </td>
                            <td className="p-2 border border-gray-300 text-center"></td>
                            <td className="p-2 border border-gray-300 text-right"></td>
                            <td className="p-2 border border-gray-300 text-right"></td>
                            <td className="p-2 border border-gray-300 text-right">
                              {formatCurrency(rubro.importe)}
                            </td>
                            <td className="p-2 border border-gray-300 text-right">
                              {rubro.incidencia.toFixed(2)}%
                            </td>
                            <td className="p-2 border border-gray-300 text-center"></td>
                            
                            {/* Columnas de diagnóstico para rubros */}
                            <td className="p-2 border border-gray-300"></td>
                            <td className="p-2 border border-gray-300"></td>
                            <td className="p-2 border border-gray-300"></td>
                          </tr>
                          {rubro.items.map(item => (
                            <tr key={item.id}>
                              <td className="p-2 border border-gray-300">{item.indice}</td>
                              <td className="p-2 border border-gray-300">{item.abrev}</td>
                              <td className="p-2 border border-gray-300">{item.nombre}</td>
                              <td className="p-2 border border-gray-300 text-center">{item.unidad}</td>
                              <td className="p-2 border border-gray-300 text-right">
                                <input
                                  type="number"
                                  value={item.cantidad}
                                  onChange={(e) => handleQuantityChange(item.id, parseFloat(e.target.value) || 0)}
                                  className="w-16 p-1 text-right border border-gray-300 rounded"
                                  min="0.01"
                                  step="0.01"
                                />
                              </td>
                              <td className="p-2 border border-gray-300 text-right">{formatCurrency(item.precioUnitario)}</td>
                              <td className="p-2 border border-gray-300 text-right">{formatCurrency(item.importe)}</td>
                              <td className="p-2 border border-gray-300 text-right">{item.incidencia.toFixed(2)}%</td>
                              <td className="p-2 border border-gray-300 text-center">
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Eliminar ítem"
                                >
                                  ×
                                </button>
                              </td>
							  <td className="p-2 border border-gray-300">
                                {getIndiceMayor(item)}
                              </td>
                              <td className="p-2 border border-gray-300">
                                {getIndiceMenor(item)}
                              </td>
                              <td className="p-2 border border-gray-300">
                                {getCategoriaFromIndiceMayor(getIndiceMayor(item))}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{backgroundColor: '#364C63', height: '40px'}}>
                        <td colSpan={12} className="p-2"></td>
                      </tr>
                      <tr className="totales-row">
                        <td colSpan={8}></td>
                        <td className="p-2 border border-gray-300 text-right" colSpan={3}><strong>Subtotal:</strong></td>
                        <td className="p-2 border border-gray-300 text-right">$</td>
                        <td className="p-2 border border-gray-300 text-right">
                          {totalGeneral.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: '#F3B340'}}>
                        <td colSpan={8}></td>
                        <td className="p-2 border border-gray-300 text-right" colSpan={3}><strong>Beneficios ({formData.beneficio_explicito}%)</strong></td>
                        <td className="p-2 border border-gray-300 text-right">$</td>
                        <td className="p-2 border border-gray-300 text-right">
                          {beneficioExplicitoMonto.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: '#F3B340'}}>
                        <td colSpan={8}></td>
                        <td className="p-2 border border-gray-300 text-right" colSpan={3}><strong>Total Ejecucion:</strong></td>
                        <td className="p-2 border border-gray-300 text-right">$</td>
                        <td className="p-2 border border-gray-300 text-right font-bold">
                          {totalFinal.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresupuestoEditor;