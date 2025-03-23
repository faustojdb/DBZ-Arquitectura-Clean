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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };