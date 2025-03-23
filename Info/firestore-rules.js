// Archivo: firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para desarrollo - CAMBIAR ANTES DE PRODUCCIÓN
    // Permite lectura/escritura sin restricciones para facilitar el desarrollo inicial
    match /{document=**} {
      allow read, write: if true;
    }
    
    // REGLAS RECOMENDADAS PARA PRODUCCIÓN - Descomentar antes de pasar a producción
    // match /{document=**} {
    //   // Regla por defecto - denegar todo
    //   allow read, write: if false;
    // }
    
    // // Reglas para colección de materiales
    // match /items/{item} {
    //   // Permitir lectura a todos
    //   allow read: if true;
    //   // Permitir escritura solo a usuarios autenticados
    //   allow write: if request.auth != null;
    // }
    
    // // Reglas para colección de análisis
    // match /analisis/{analysis} {
    //   // Permitir lectura a todos
    //   allow read: if true;
    //   // Permitir escritura solo a usuarios autenticados
    //   allow write: if request.auth != null;
    // }
    
    // // Reglas para colección de presupuestos
    // match /presupuestos/{presupuesto} {
    //   // Permitir operaciones solo a usuarios autenticados
    //   allow read, write: if request.auth != null;
    // }
  }
}