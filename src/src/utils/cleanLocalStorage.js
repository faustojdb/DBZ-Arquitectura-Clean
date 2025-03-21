// Script para limpiar localStorage y eliminar datos corruptos
const cleanLocalStorage = () => {
  console.log("Limpiando localStorage para resolver problemas de datos...");
  
  try {
    // Eliminar datos del almacenamiento local
    localStorage.removeItem('dbz_materials');
    localStorage.removeItem('dbz_categories');
    localStorage.removeItem('dbz_materials_timestamp');
    
    console.log("Datos eliminados correctamente. La próxima vez que cargue la aplicación, se cargarán datos frescos desde Firestore.");
    
    // Opcional: Recargar la página
    if (confirm("Se han limpiado los datos en caché. ¿Desea recargar la página ahora para obtener datos frescos?")) {
      window.location.reload();
    }
  } catch (err) {
    console.error("Error al limpiar localStorage:", err);
  }
};

// Puedes ejecutar esta función desde la consola del navegador escribiendo:
// cleanLocalStorage()