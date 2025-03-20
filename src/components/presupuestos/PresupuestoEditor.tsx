// src/components/presupuestos/PresupuestoEditor.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePresupuesto from '../../hooks/usePresupuesto';
import useAnalisis from '../../hooks/useAnalisis';
import AnalisisSelector from './AnalisisSelector';
import ItemRow from './components/ItemRow';
import RubroRow from './components/RubroRow';
import InfoTooltip from '../shared/InfoTooltip';
import { formatCurrency } from '../../utils/formatters';
import { analisisToPresupuestoItem, calcularRubrosYTotales, prepararDatosFirestore } from '../../utils/presupuestoUtils';

const PresupuestoEditor = () => {
  const { presupuestoId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!presupuestoId;
  
  const [formError, setFormError] = useState(null);
  const [lastBeneficioImplicito, setLastBeneficioImplicito] = useState(0);
  const [itemsOriginalesIds, setItemsOriginalesIds] = useState([]);
  
  // Estado local con valores por defecto
  const [formData, setFormData] = useState({
    comitente: '',
    obra: '',
    lugar: 'Lugar',
    fecha: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
    tipo_encomienda: 'Obra - Construcción',
    beneficio_explicito: 20,
    beneficio_implicito: 0
  });
  const [items, setItems] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [buscandoAnalisis, setBuscandoAnalisis] = useState(false);
  
  // Hooks personalizados
  const { presupuesto, loading, error, fetchPresupuesto, createPresupuesto, updatePresupuesto } = usePresupuesto(presupuestoId);
  const { fetchAllRubros } = useAnalisis();
  
  // Cargar datos del presupuesto existente
  useEffect(() => {
    if (presupuesto && isEditing) {
      console.log("Cargando datos del presupuesto para edición:", presupuesto);
      
      const beneficioImplicito = presupuesto.beneficioImplicito || 0;
      
      // Formatear la fecha correctamente según el tipo de dato
      let fechaFormateada = new Date().toISOString().split('T')[0]; // Valor por defecto
      
      if (presupuesto.fecha) {
        try {
          // Intentar diferentes formatos de fecha
          if (typeof presupuesto.fecha === 'string') {
            // Si ya es string, intentamos formatearla
            fechaFormateada = presupuesto.fecha.split('T')[0];
          } else if (presupuesto.fecha instanceof Date) {
            // Si es un objeto Date
            fechaFormateada = presupuesto.fecha.toISOString().split('T')[0];
          } else if (presupuesto.fecha.toDate && typeof presupuesto.fecha.toDate === 'function') {
            // Si es un Timestamp de Firestore
            fechaFormateada = presupuesto.fecha.toDate().toISOString().split('T')[0];
          } else if (presupuesto.fecha.seconds) {
            // Si es un objeto con seconds (formato timestamp)
            fechaFormateada = new Date(presupuesto.fecha.seconds * 1000).toISOString().split('T')[0];
          }
        } catch (error) {
          console.error("Error al formatear la fecha:", error);
        }
      }
      
      // Cargar datos del presupuesto
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
        console.log("Cargando ítems existentes:", Object.keys(presupuesto.items).length);
        
        // Convertir items de Firestore al formato local
        const itemsConvertidos = Object.entries(presupuesto.items).map(([id, itemData]) => {
          return {
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
            rubroNombre: presupuesto.subtotales?.[`ST${(itemData.numero_item || '').split('.')[0].padStart(3, '0')}`]?.nombre || '',
            abrev: itemData.abrev || ''
          };
        });
        
        // Guardar IDs de los ítems originales
        setItemsOriginalesIds(itemsConvertidos.map(item => item.id));
        
        // Actualizar estado
        setItems(itemsConvertidos);
        console.log("Ítems cargados:", itemsConvertidos);
      }
    }
  }, [presupuesto, isEditing]);
  
  // Función para buscar todos los rubros al abrir selector
  useEffect(() => {
    if (showSelector && !buscandoAnalisis) {
      setBuscandoAnalisis(true);
      
      // Cargar todos los rubros disponibles (1-20 para asegurar que cargue todos)
      const loadAllCategorias = async () => {
        console.log("Cargando todas las categorías disponibles...");
        try {
          // Crear un array de promesas para buscar las primeras 20 categorías
          const promises = Array.from({ length: 20 }, (_, i) => 
            fetchAllRubros(i + 1).catch(err => {
              console.log(`No se encontraron análisis para categoría ${i + 1}`);
              return [];
            })
          );
          
          await Promise.all(promises);
          console.log("Todas las categorías cargadas correctamente");
        } catch (error) {
          console.error("Error al cargar categorías:", error);
        } finally {
          setBuscandoAnalisis(false);
        }
      };
      
      loadAllCategorias();
    }
  }, [showSelector, fetchAllRubros, buscandoAnalisis]);
  
  // Manejadores de eventos
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    console.log(`Campo modificado: ${name}, valor: ${value}`);
    
    // Si cambia el beneficio implícito, recalcular precios
    if (name === 'beneficio_implicito') {
      const newBeneficioImplicito = parseFloat(value) || 0;
      
      // Si hay ítems y el beneficio implícito cambia, recalculamos los precios
      if (items.length > 0 && newBeneficioImplicito !== lastBeneficioImplicito) {
        console.log(`Actualizando precios: beneficio anterior ${lastBeneficioImplicito}%, nuevo ${newBeneficioImplicito}%`);
        
        // Calcular factor de actualización
        const precioProporcional = (1 + newBeneficioImplicito/100) / (1 + lastBeneficioImplicito/100);
        
        // Actualizar precios proporcionalmente
        setItems(items.map(item => ({
          ...item,
          precioUnitario: item.precioUnitario * precioProporcional,
          importe: item.cantidad * (item.precioUnitario * precioProporcional)
        })));
        
        setLastBeneficioImplicito(newBeneficioImplicito);
      }
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: name.includes('beneficio') ? parseFloat(value) || 0 : value
      };
      
      return newData;
    });
  };
  
  const handleAddAnalisis = (analisis) => {
    if (!analisis) return;
    
    console.log("Añadiendo análisis:", analisis);
    
    // Pasar el beneficio implícito actual para que se aplique directamente al precio
    const newItem = analisisToPresupuestoItem(analisis, 1, formData.beneficio_implicito);
    console.log("Nuevo ítem con beneficio implícito aplicado:", newItem);
    
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
  
  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  /**
 * Función para generar índices ordenados secuencialmente utilizando SIEMPRE
 * los índices originales del análisis de costos (mayor/menor)
 */
/**
 * Función para generar índices ordenados secuencialmente utilizando SIEMPRE
 * los índices originales del análisis de costos (mayor/menor)
 */
const generarIndicesOrdenados = () => {
  if (items.length === 0) {
    alert("No hay ítems para ordenar");
    return;
  }
  
  console.log("Generando índices ordenados para", items.length, "ítems");
  
  // 1. Extraer el índice original de cada ítem del análisis de costos
  const itemsConIndiceOriginal = items.map(item => {
    // Intentar obtener el índice original del análisis
    let indiceMayor = 0;
    let indiceMenor = 0;
    
    // Primero intentamos extraer del analisisId (que es más confiable)
    if (item.analisisId) {
      // Los analisisId suelen tener un formato como "AC001001" donde:
      // - "AC" es un prefijo
      // - "001" es el índice mayor (rubro)
      // - "001" es el índice menor (dentro del rubro)
      // Extraemos los números
      const match = item.analisisId.match(/^AC(\d+)(\d{3})$/);
      if (match) {
        indiceMayor = parseInt(match[1]);
        indiceMenor = parseInt(match[2]);
      }
    } 
    
    // Si no pudimos extraer del analisisId, intentamos con el rubroId
    if (indiceMayor === 0 && item.rubroId) {
      // rubroId suele tener formato "ST001"
      const rubroMatch = item.rubroId.match(/^ST0*(\d+)$/);
      if (rubroMatch) {
        indiceMayor = parseInt(rubroMatch[1]);
      }
    }
    
    // Si aún no tenemos un índice mayor válido, intentamos extraerlo del indice actual
    if (indiceMayor === 0 && item.indice) {
      const partes = item.indice.split('.');
      if (partes.length >= 1) {
        indiceMayor = parseInt(partes[0]);
      }
      if (partes.length >= 2) {
        indiceMenor = parseInt(partes[1]);
      }
    }
    
    // Si después de todos los intentos no tenemos índices válidos,
    // asignamos valores predeterminados que los pondrán al final
    indiceMayor = indiceMayor || 999;
    indiceMenor = indiceMenor || 999;
    
    console.log(`Ítem ${item.nombre}: Índice original identificado como ${indiceMayor}.${indiceMenor}`);
    
    return {
      ...item,
      indiceMayorOriginal: indiceMayor,
      indiceMenorOriginal: indiceMenor
    };
  });
  
  // 2. Agrupar ítems por su índice mayor original (rubro)
  const rubrosPorIndice = {};
  
  itemsConIndiceOriginal.forEach(item => {
    const indiceMayor = item.indiceMayorOriginal;
    const rubroId = item.rubroId || `ST${indiceMayor.toString().padStart(3, '0')}`;
    const rubroNombre = item.rubroNombre || `Rubro ${indiceMayor}`;
    
    // Crear la entrada para el rubro si no existe
    if (!rubrosPorIndice[indiceMayor]) {
      rubrosPorIndice[indiceMayor] = {
        id: rubroId,
        nombre: rubroNombre,
        indiceMayor: indiceMayor,
        items: []
      };
    }
    
    // Añadir ítem al rubro
    rubrosPorIndice[indiceMayor].items.push(item);
  });
  
  console.log("Ítems agrupados por rubro según índice original:", Object.keys(rubrosPorIndice).length, "rubros");
  
  // 3. Convertir a array y ordenar los rubros por su índice mayor
  const rubrosOrdenados = Object.values(rubrosPorIndice).sort((a, b) => {
    return a.indiceMayor - b.indiceMayor;
  });
  
  console.log("Rubros ordenados por índice original:", 
    rubrosOrdenados.map(r => `${r.indiceMayor}: ${r.nombre} (${r.items.length} ítems)`));
  
  // 4. Asignar nuevos números secuenciales
  const itemsConNuevosIndices = [];
  let rubroIndex = 1; // Comenzar rubros desde 1
  
  rubrosOrdenados.forEach(rubro => {
    // Ordenar ítems dentro del rubro por su índice menor original
    const itemsOrdenados = rubro.items.sort((a, b) => {
      return a.indiceMenorOriginal - b.indiceMenorOriginal;
    });
    
    // Asignar nuevos índices a los ítems
    let itemIndex = 1; // Comenzar ítems desde 1 dentro de cada rubro
    itemsOrdenados.forEach(item => {
      const nuevoIndiceItem = `${rubroIndex}.${itemIndex}.0`;
      
      // Crear nuevo ítem con el índice actualizado
      itemsConNuevosIndices.push({
        ...item,
        indice: nuevoIndiceItem,
        rubroId: rubro.id,
        rubroNombre: rubro.nombre
      });
      
      itemIndex++;
    });
    
    // Incrementar el índice del rubro para el siguiente
    rubroIndex++;
  });
  
  console.log("Items reorganizados con nuevos índices:", itemsConNuevosIndices);
  
  // 5. Calcular incidencias y totales
  const { items: itemsCalculados } = calcularRubrosYTotales(itemsConNuevosIndices);
  
  // 6. Actualizar el estado con los nuevos ítems
  setItems(itemsCalculados);
  
  alert(`Índices generados correctamente para ${itemsCalculados.length} ítems en ${rubrosOrdenados.length} rubros`);
};




  // Función para preparar los datos antes de guardar
  const prepararDatosParaGuardar = () => {
    // Asegurarse de incluir el lugar y la fecha en los datos
    const fecha = new Date().toISOString(); // Por defecto, fecha actual si no se proporciona una
    
    const datosCompletos = {
      ...formData,
      fecha: formData.fecha || fecha // Usamos la fecha del formulario o la actual
    };
    
    return prepararDatosFirestore(datosCompletos, items);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    try {
      // Verificar campos obligatorios
      if (!formData.comitente || formData.comitente.trim() === '') {
        setFormError('El comitente es un campo obligatorio y no puede estar vacío');
        return;
      }
      
      if (!formData.obra || formData.obra.trim() === '') {
        setFormError('La obra es un campo obligatorio y no puede estar vacío');
        return;
      }
      
      if (items.length === 0) {
        setFormError('Debe agregar al menos un ítem al presupuesto');
        return;
      }
      
      console.log("Preparando datos para guardar presupuesto...");
      
      // Preparar datos para Firestore, incluyendo lugar y fecha
      const presupuestoData = prepararDatosParaGuardar();
      
      console.log("Datos a guardar:", presupuestoData);
      
      if (isEditing && presupuestoId) {
        // Actualizar presupuesto existente
        console.log(`Actualizando presupuesto existente: ${presupuestoId}`);
        const updatedId = await updatePresupuesto(presupuestoId, presupuestoData);
        alert(`Presupuesto actualizado con éxito. ID: ${updatedId}`);
      } else {
        // Crear nuevo presupuesto
        console.log("Creando nuevo presupuesto...");
        const newId = await createPresupuesto(presupuestoData);
        alert(`Presupuesto creado con éxito. ID: ${newId}`);
      }
      
      // Redirigir a la lista de presupuestos
      navigate('/presupuestos');
    } catch (err) {
      console.error('Error al guardar presupuesto:', err);
      setFormError(`Error al guardar el presupuesto: ${err.message || 'Error desconocido'}`);
    }
  };
  
  // Calcular rubros y totales
  const { items: itemsConIncidencia, rubros, totalGeneral } = calcularRubrosYTotales(items);
  
  // Calcular totales con beneficios
  const totalConBeneficioImplicito = totalGeneral;
  const beneficioExplicitoMonto = totalConBeneficioImplicito * (formData.beneficio_explicito / 100);
  const totalFinal = totalConBeneficioImplicito + beneficioExplicitoMonto;
  
  // Renderizado condicional para carga
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4">Cargando datos del presupuesto...</p>
      </div>
    );
  }
  
  // Renderizado condicional para error
  if (error && isEditing) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error: {error}</p>
        <button 
          onClick={() => navigate('/presupuestos')}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Volver a Presupuestos
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4">
      {/* Estilos CSS */}
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
              <label htmlFor="lugar" className="block font-medium mb-1">
                Lugar: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lugar"
                name="lugar"
                value={formData.lugar}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Lugar"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="fecha" className="block font-medium mb-1">
                Fecha: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="comitente" className="block font-medium mb-1">
                Comitente: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="comitente"
                name="comitente"
                value={formData.comitente}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Nombre del cliente"
                required
              />
              {!formData.comitente && (
                <p className="text-sm text-red-500 mt-1">Este campo es obligatorio</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="obra" className="block font-medium mb-1">
                Obra: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="obra"
                name="obra"
                value={formData.obra}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Descripción de la obra"
                required
              />
              {!formData.obra && (
                <p className="text-sm text-red-500 mt-1">Este campo es obligatorio</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="tipo_encomienda" className="block font-medium mb-1">Tipo de Encomienda:</label>
              <select
                id="tipo_encomienda"
                name="tipo_encomienda"
                value={formData.tipo_encomienda}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Obra - Construcción">Obra - Construcción</option>
                <option value="Obra - Remodelación">Obra - Remodelación</option>
                <option value="Proyecto - Arquitectura">Proyecto - Arquitectura</option>
                <option value="Consultoría">Consultoría</option>
                <option value="Dirección de Obra">Dirección de Obra</option>
              </select>
            </div>
            
            {/* Sección de beneficios con explicaciones */}
            <div className="beneficios-container">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="beneficio_implicito" className="block font-medium mb-1">
                    Beneficio Implícito (%)
                    <InfoTooltip 
                      content="Este porcentaje se aplica internamente y no es visible para el cliente" 
                    />
                  </label>
                  <input
                    type="number"
                    id="beneficio_implicito"
                    name="beneficio_implicito"
                    value={formData.beneficio_implicito}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                </div>
                
                <div>
                  <label htmlFor="beneficio_explicito" className="block font-medium mb-1">
                    Beneficio Explícito (%)
                    <InfoTooltip 
                      content="Este porcentaje se muestra al cliente en el documento final" 
                    />
                  </label>
                  <input
                    type="number"
                    id="beneficio_explicito"
                    name="beneficio_explicito"
                    value={formData.beneficio_explicito}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                </div>
              </div>
              
              <div className="mt-4 bg-gray-50 p-3 rounded border">
                <h4 className="font-medium text-sm">Cómo funcionan los beneficios:</h4>
                <ul className="text-xs text-gray-600 mt-1">
                  <li>• El <b>beneficio implícito</b> se aplica a cada ítem pero no se muestra al cliente</li>
                  <li>• El <b>beneficio explícito</b> se aplica al total y aparece como línea separada en el presupuesto final</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {isEditing ? 'Actualizar Presupuesto' : 'Crear Presupuesto'}
              </button>
            </div>
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
                    onClick={generarIndicesOrdenados}
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
                      </tr>
                    </thead>
                    <tbody>
                      {/* Renderizar rubros e ítems */}
                      {rubros.map(rubro => (
                        <React.Fragment key={rubro.id}>
                          <tr 
                            style={{
                              backgroundColor: '#F4F3EF',
                              fontWeight: 'bold'
                            }}
                          >
                            <td className="p-2 border border-gray-300">{rubro.indice}</td>
                            <td className="p-2 border border-gray-300"></td>
                            <td className="p-2 border border-gray-300">{rubro.nombre}</td>
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
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{backgroundColor: '#364C63', height: '40px'}}>
                        <td colSpan={9} className="p-2"></td>
                      </tr>
                      <tr style={{backgroundColor: '#F3B340'}}>
                        <td colSpan={5}></td>
                        <td className="p-2 border border-gray-300 text-right"><strong>Subtotal:</strong></td>
                        <td className="p-2 border border-gray-300 text-right">$</td>
                        <td className="p-2 border border-gray-300 text-right" colSpan={2}>
                          {totalGeneral.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: '#F3B340'}}>
                        <td colSpan={5}></td>
                        <td className="p-2 border border-gray-300 text-right"><strong>Beneficios ({formData.beneficio_explicito}%)</strong></td>
                        <td className="p-2 border border-gray-300 text-right">$</td>
                        <td className="p-2 border border-gray-300 text-right" colSpan={2}>
                          {beneficioExplicitoMonto.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: '#F3B340'}}>
                        <td colSpan={5}></td>
                        <td className="p-2 border border-gray-300 text-right"><strong>Total Ejecucion:</strong></td>
                        <td className="p-2 border border-gray-300 text-right">$</td>
                        <td className="p-2 border border-gray-300 text-right font-bold" colSpan={2}>
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