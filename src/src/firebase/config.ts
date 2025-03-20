# Crear el archivo de configuración de Firebase
cat > src/firebase/config.ts << 'EOL'
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

// Inicializar y exportar Firestore
export const db = getFirestore(app);

export default db;
EOL