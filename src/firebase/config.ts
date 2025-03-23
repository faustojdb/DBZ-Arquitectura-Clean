// Archivo: src/firebase/config.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// IMPORTANTE: Reemplazar esta configuración con tus propias credenciales de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar Firestore
export const db = getFirestore(app);

export default db;