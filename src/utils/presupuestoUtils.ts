// src/utils/presupuestoUtils.ts

/**
 * Convierte un análisis a un ítem de presupuesto
 * @param {Object} analisis - Objeto del análisis
 * @param {number} cantidad - Cantidad a usar
 * @param {number} beneficioImplicito - Porcentaje de beneficio implícito
 * @returns {Object} Ítem preparado para el presupuesto
 */
export const analisisToPresupuestoItem = (analisis, cantidad = 1, beneficioImplicito = 0) => {
  if (!analisis) return null;
  
  // Extraer datos del análisis
  const { 
    id: analisisId,
    nombre,
    unidad = '',
    costo_total = 0,
    rubro_id = '',
    rubro_nombre = '',
    abrev = '',
  } = analisis;
  
  // Aplicar beneficio implícito al precio
  const factor = 1 + (beneficioImplicito / 100);
  const precioUnitario = costo_total * factor;
  
  // Calcular importe total
  const importe = precioUnitario * cantidad;
  
  return {
    id: `item_${Date.now()}_${Math.floor(Math.random() * 10000)}`, // ID único
    analisisId,
    nombre,
    unidad,
    cantidad,
    precioUnitario,
    importe,
    incidencia: 0, // Se calculará después
    indice: '', // Se generará después
    rubroId: rubro_id ? `ST${rubro_id.padStart(3, '0')}` : 'ST000',
    rubroNombre: rubro_nombre || 'Sin categoría',
    abrev,
  };
};

/**
 * Calcula rubros y totales a partir de ítems
 * @param {Array} items - Lista de ítems
 * @returns {Object} Objeto con ítems actualizados, rubros y total
 */
export const calcularRubrosYTotales = (items) => {
  // Si no hay ítems, retornar valores por defecto
  if (!items || items.length === 0) {
    return { items: [], rubros: [], totalGeneral: 0 };
  }
  
  // 1. Obtener total general
  const totalGeneral = items.reduce((sum, item) => sum + (item.importe || 0), 0);
  
  // 2. Agrupar ítems por rubro
  const rubroMap = {};

  items.forEach(item => {
    const rubroId = item.rubroId || 'ST000';
    
    if (!rubroMap[rubroId]) {
      // Extraer el número de rubro del ID o del índice
      const rubroNumero = rubroId.replace('ST', '').replace(/^0+/, '') || 
                          (item.indice ? item.indice.split('.')[0] : '0');
      
      rubroMap[rubroId] = {
        id: rubroId,
        nombre: 'Sin categoría', // Esto se reemplazará al renderizar con la categoría real
        indice: `${rubroNumero}.0.0`,
        items: [],
        importe: 0,
        incidencia: 0
      };
    }
    
    // Añadir ítem al rubro
    rubroMap[rubroId].items.push(item);
    rubroMap[rubroId].importe += (item.importe || 0);
  });
  
  // 3. Calcular incidencias de rubros
  Object.values(rubroMap).forEach(rubro => {
    rubro.incidencia = totalGeneral > 0 ? (rubro.importe / totalGeneral) * 100 : 0;
  });
  
  // 4. Ordenar rubros por ID
  const rubrosOrdenados = Object.values(rubroMap).sort((a, b) => {
    const idA = parseInt(a.id.replace('ST', '').replace(/^0+/, '') || '0');
    const idB = parseInt(b.id.replace('ST', '').replace(/^0+/, '') || '0');
    return idA - idB;
  });
  
  // 5. Calcular incidencias de ítems
  const itemsActualizados = items.map(item => {
    const incidencia = totalGeneral > 0 ? (item.importe / totalGeneral) * 100 : 0;
    return { ...item, incidencia };
  });
  
  return {
    items: itemsActualizados,
    rubros: rubrosOrdenados,
    totalGeneral
  };
};

/**
 * Prepara datos para guardar en Firestore
 * @param {Object} formData - Datos del formulario
 * @param {Array} items - Lista de ítems
 * @returns {Object} Datos preparados para Firestore
 */
export const prepararDatosFirestore = (formData, items) => {
  // Si no hay datos de formulario o ítems, retornar objeto vacío
  if (!formData || !items || items.length === 0) {
    return {};
  }
  
  // 1. Extraer datos del formulario
  const { 
    comitente = '', 
    obra = '', 
    lugar = 'Lugar',
    fecha,
    tipo_encomienda = 'Obra - Construcción',
    beneficio_explicito = 20,
    beneficio_implicito = 0
  } = formData;
  
  // Asegurarse de que lugar no sea undefined o null
  const lugarFinal = lugar || 'Lugar';
  
  // 2. Preparar ítems para Firestore
  const itemsFirestore = {};
  
  items.forEach(item => {
    const itemId = item.id;
    
    itemsFirestore[itemId] = {
      analisis_id: item.analisisId || '',
      nombre: item.nombre || '',
      unidad: item.unidad || '',
      cantidad: item.cantidad || 0,
      precio_unitario: item.precioUnitario || 0,
      importe: item.importe || 0,
      incidencia: item.incidencia || 0,
      numero_item: item.indice || '',  // Guardar el índice del presupuesto
      abrev: item.abrev || ''
    };
  });
  
  // 3. Calcular rubros y totales
  const { rubros, totalGeneral } = calcularRubrosYTotales(items);
  
  // 4. Preparar subtotales para Firestore
  const subtotalesFirestore = {};
  
  rubros.forEach(rubro => {
    subtotalesFirestore[rubro.id] = {
      nombre: rubro.nombre,
      importe: rubro.importe,
      incidencia: rubro.incidencia
    };
  });
  
  // 5. Estructurar datos generales con valor explícito para lugar
  const datosGenerales = {
    comitente,
    obra,
    lugar: lugarFinal,
    fecha,
    tipo_encomienda,
    beneficio_explicito,
    beneficio_implicito
  };
  
  console.log("Datos generales a guardar:", datosGenerales);
  
  // 6. Armar objeto final para Firestore
  return {
    datos_generales: datosGenerales,
    items: itemsFirestore,
    subtotales: subtotalesFirestore,
    total_general: totalGeneral
  };
};

