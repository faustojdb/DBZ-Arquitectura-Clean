// src/debug/firebase-config-debug.ts
/**
 * Este archivo es solo para depuración de la configuración de Firebase
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';

// Configuración básica de Firebase (ajustar según sea necesario)
const firebaseConfig = {
  apiKey: "AIzaSyBweR6uGVv46oFvgEOPONaUxVIFB8exJsI",
  authDomain: "bns-whatsapp-bo.firebaseapp.com",
  databaseURL: "https://bns-whatsapp-bo-default-rtdb.firebaseio.com",
  projectId: "bns-whatsapp-bo",
  storageBucket: "bns-whatsapp-bo.firebasestorage.app",
  messagingSenderId: "885329022100",
  appId: "1:885329022100:web:5d4b501f91c91b0f457881"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig, 'debug-instance');

// Inicializar Firestore
const db = getFirestore(app);

// Función para probar la conexión
export const testFirestoreConnection = async () => {
  console.log('Probando conexión a Firestore...');
  
  try {
    console.log('Firestore inicializado:', !!db);
    
    // Listar todas las colecciones disponibles
    const presupuestosRef = collection(db, 'presupuestos');
    const querySnapshot = await getDocs(presupuestosRef);
    
    console.log(`Colección 'presupuestos': ${querySnapshot.size} documentos`);
    if (querySnapshot.empty) {
      console.log('La colección está vacía.');
    } else {
      console.log('Primer documento:', querySnapshot.docs[0].id);
      console.log('Datos:', querySnapshot.docs[0].data());
    }
    
    return {
      success: true,
      docCount: querySnapshot.size,
      firstDocId: querySnapshot.empty ? null : querySnapshot.docs[0].id
    };
  } catch (error) {
    console.error('Error al conectar con Firestore:', error);
    return {
      success: false,
      error: error
    };
  }
};

export { db as debugDb };
export default db;