// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Aseguramos importar getAuth

// Usar la misma configuración que ya tienes en tu proyecto
// Reemplaza estos valores con tu configuración actual
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
const app = initializeApp(firebaseConfig);

// Obtener instancia de Firestore
const db = getFirestore(app);

// Obtener instancia de Auth
const auth = getAuth(app);

export { db, auth };
export default db;