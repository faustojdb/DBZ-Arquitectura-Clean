// src/components/debug/FirestoreConfigCheck.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

/**
 * Componente para verificar la configuración de Firestore
 * Este componente intentará listar las colecciones disponibles
 */
const FirestoreConfigCheck: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [collections, setCollections] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [configDetails, setConfigDetails] = useState<any>(null);

  useEffect(() => {
    const checkFirestore = async () => {
      try {
        // 1. Verificar si la instancia de Firestore existe
        if (!db) {
          throw new Error('La instancia de Firestore (db) no está inicializada');
        }

        // 2. Intentar obtener configuración de Firestore
        const firestoreConfig = {
          // Extraer configuración segura para mostrar (sin API keys)
          type: 'Firestore',
          initialized: !!db,
          instanceId: db ? 'Disponible' : 'No disponible',
        };
        
        setConfigDetails(firestoreConfig);

        // 3. Intentar leer la colección de presupuestos
        try {
          const presupuestosRef = collection(db, 'presupuestos');
          const presupuestosSnap = await getDocs(presupuestosRef);
          
          if (presupuestosSnap.empty) {
            setCollections(['presupuestos (vacía)']);
            console.warn('La colección de presupuestos está vacía');
          } else {
            setCollections([`presupuestos (${presupuestosSnap.size} documentos)`]);
          }
          
          // Imprimir el primer documento para depuración
          if (!presupuestosSnap.empty) {
            const firstDoc = presupuestosSnap.docs[0];
            console.log('Primer documento:', firstDoc.id, firstDoc.data());
          }
          
          setDbStatus('success');
        } catch (collectionError: any) {
          setError(`Error al leer colección: ${collectionError.message}`);
          setDbStatus('error');
        }
      } catch (dbError: any) {
        setError(`Error de Firestore: ${dbError.message}`);
        setDbStatus('error');
      }
    };

    checkFirestore();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">Estado de Conexión a Firestore</h2>
      
      <div className={`p-3 rounded ${
        dbStatus === 'checking' ? 'bg-blue-100' : 
        dbStatus === 'success' ? 'bg-green-100' : 
        'bg-red-100'
      }`}>
        <div className="font-semibold">
          {dbStatus === 'checking' && 'Verificando conexión...'}
          {dbStatus === 'success' && '✅ Conexión exitosa a Firestore'}
          {dbStatus === 'error' && '❌ Error de conexión a Firestore'}
        </div>
        
        {error && <p className="text-red-700 mt-1">{error}</p>}
      </div>
      
      {collections.length > 0 && (
        <div className="mt-3">
          <h3 className="font-semibold">Colecciones:</h3>
          <ul className="list-disc pl-5 mt-1">
            {collections.map((collection, index) => (
              <li key={index}>{collection}</li>
            ))}
          </ul>
        </div>
      )}
      
      {configDetails && (
        <div className="mt-4 pt-4 border-t">
          <h3 className="font-semibold">Detalles de Configuración:</h3>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-1">
            {JSON.stringify(configDetails, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Posibles problemas:</p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>Configuración incorrecta en config.ts/firebase.ts</li>
          <li>No existe la colección 'presupuestos'</li>
          <li>Permisos insuficientes en reglas de Firestore</li>
          <li>Proyecto o API key desactivada</li>
        </ol>
      </div>
    </div>
  );
};

export default FirestoreConfigCheck;