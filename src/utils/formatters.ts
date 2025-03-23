// src/utils/formatters.ts

/**
 * Formatea un número como moneda en pesos argentinos
 * @param value - Valor numérico a formatear
 * @returns Cadena formateada con símbolo de pesos
 */
export const formatCurrency = (value) => {
  // Verificar si el valor es un número válido
  if (value === undefined || value === null) {
    return '$ 0,00';
  }
  
  // Convertir a número si es string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Verificar si es un número válido después de la conversión
  if (isNaN(numValue)) {
    return '$ 0,00';
  }
  
  // Formatear con separador de miles y decimales
  return `$ ${numValue.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Formatea una fecha según el formato especificado
 * @param date - Fecha a formatear (string, Date o timestamp)
 * @param format - Formato deseado (opcional, por defecto dd/MM/yyyy)
 * @returns Cadena de fecha formateada
 */
export const formatDate = (date, format = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  let dateObj;
  
  try {
    // Convertir a objeto Date según el tipo
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date.toDate && typeof date.toDate === 'function') {
      // Timestamp de Firestore
      dateObj = date.toDate();
    } else if (date.seconds) {
      // Objeto con seconds (formato timestamp)
      dateObj = new Date(date.seconds * 1000);
    } else {
      // Número (timestamp en milisegundos)
      dateObj = new Date(date);
    }
    
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    // Obtener componentes de fecha
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    // Formato para nombre de mes
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    // Funciones auxiliares para reemplazos comunes
    const replaceMonth = (format) => {
      // Reemplazar MMMM con el nombre del mes
      if (format.includes('MMMM')) {
        return format.replace('MMMM', monthNames[dateObj.getMonth()]);
      }
      // Reemplazar MM con el número de mes con ceros a la izquierda
      if (format.includes('MM')) {
        return format.replace('MM', month);
      }
      // Reemplazar M con el número de mes sin ceros a la izquierda
      if (format.includes('M')) {
        return format.replace('M', dateObj.getMonth() + 1 + '');
      }
      return format;
    };
    
    const replaceDay = (format) => {
      // Reemplazar dd con el día con ceros a la izquierda
      if (format.includes('dd')) {
        return format.replace('dd', day);
      }
      // Reemplazar d con el día sin ceros a la izquierda
      if (format.includes('d')) {
        return format.replace('d', dateObj.getDate() + '');
      }
      return format;
    };
    
    const replaceYear = (format) => {
      // Reemplazar yyyy con el año completo
      if (format.includes('yyyy')) {
        return format.replace('yyyy', year);
      }
      // Reemplazar yy con el año de 2 dígitos
      if (format.includes('yy')) {
        return format.replace('yy', year.toString().slice(-2));
      }
      return format;
    };
    
    // Aplicar formato paso a paso para garantizar todos los reemplazos
    let result = format;
    result = replaceDay(result);
    result = replaceMonth(result);
    result = replaceYear(result);
    
    // Si hay formato literal con comillas, eliminarlas pero preservar el contenido
    result = result.replace(/"([^"]*)"/g, '$1'); // Reemplazar "texto" con texto
    
    console.log("Fecha formateada:", {
      input: date,
      dateObj,
      format,
      result
    });
    
    return result;
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '';
  }
};