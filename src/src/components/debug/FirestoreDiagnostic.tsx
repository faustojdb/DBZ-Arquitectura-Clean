// src/components/debug/FirestoreDiagnostic.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';

/**
 * Componente de diagnóstico para verificar la conexión a Firestore
 */
const FirestoreDiagnostic: React.FC = () => {
  const [testResult, setTestResult] = useState<{
    status: 'pending' | 'success' | 'error';
    message: string;
    details?: any;
  }>({
    status: 'pending',
    message: 'Ejecutando diagnóstico de Firestore...'
  });

  useEffect(() => {
    const runDiagnostic = async () => {
      try {
        console.log('Iniciando diagnóstico de Firestore...');
        
        // Test 1: Verificar conexión básica
        console.log('Test 1: Verificando conexión básica a Firestore...');
        const presupuestosRef = collection(db, 'presupuestos');
        
        // Test 2: Intentar leer documentos
        console.log('Test 2: Intentando leer documentos...');
        const q = query(presupuestosRef, limit(2));
        const querySnapshot = await getDocs(q);
        
        // Test 3: Contar documentos y verificar estructura
        console.log('Test 3: Analizando documentos...');
        const docCount = querySnapshot.size;
        const collectionStructure: any[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          collectionStructure.push({
            id: doc.id,
            hasData: !!data,
            fields: Object.keys(data || {}),
            sampleData: data ? JSON.stringify(data).substring(0, 100) + '...' : 'No data'
          });
        });
        
        setTestResult({
          status: 'success',
          message: `Conexión exitosa. Encontrados ${docCount} documentos en 'presupuestos'.`,
          details: {
            firestoreInitialized: !!db,
            docCount,
            collectionStructure
          }
        });
      } catch (error: any) {
        console.error('Error en diagnóstico de Firestore:', error);
        setTestResult({
          status: 'error',
          message: `Error: ${error.message}`,
          details: {
            error: error.toString(),
            code: error.code,
            stack: error.stack
          }
        });
      }
    };

    runDiagnostic();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Diagnóstico de Firestore</h2>
      
      <div className={`p-3 rounded ${
        testResult.status === 'pending' ? 'bg-blue-100 text-blue-800' :
        testResult.status === 'success' ? 'bg-green-100 text-green-800' :
        'bg-red-100 text-red-800'
      }`}>
        <p className="font-semibold">{testResult.message}</p>
      </div>
      
      {testResult.details && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-semibold mb-2">Detalles:</h3>
          <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs">
            {JSON.stringify(testResult.details, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Recuerda verificar:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Que la configuración de Firestore sea correcta</li>
          <li>Que exista la colección 'presupuestos'</li>
          <li>Que los permisos de Firestore permitan leer/escribir</li>
          <li>Que no haya problemas de CORS o red</li>
        </ul>
      </div>
    </div>
  );
};

export default FirestoreDiagnostic;