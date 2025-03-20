// src/pages/FirestoreDiagnosticPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FirestoreConfigCheck from '../components/debug/FirestoreConfigCheck';
import FirestoreDiagnostic from '../components/debug/FirestoreDiagnostic';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const FirestoreDiagnosticPage = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  // Función de prueba manual directamente aquí
  const runManualTest = async () => {
    setTesting(true);
    try {
      console.log('Probando conexión a Firestore...');
      
      // Verificar si Firestore está inicializado
      if (!db) {
        throw new Error('Firestore no está inicializado');
      }
      
      console.log('Firestore inicializado:', !!db);
      
      // Intentar leer la colección de presupuestos
      const presupuestosRef = collection(db, 'presupuestos');
      const querySnapshot = await getDocs(presupuestosRef);
      
      console.log(`Colección 'presupuestos': ${querySnapshot.size} documentos`);
      
      // Verificar si hay documentos
      if (querySnapshot.empty) {
        console.log('La colección está vacía.');
        setTestResults({
          success: true,
          docCount: 0,
          message: 'Conexión exitosa pero no hay documentos en la colección'
        });
      } else {
        // Mostrar información del primer documento
        const firstDoc = querySnapshot.docs[0];
        const firstDocData = firstDoc.data();
        
        console.log('Primer documento:', firstDoc.id);
        console.log('Datos:', firstDocData);
        
        setTestResults({
          success: true,
          docCount: querySnapshot.size,
          firstDocId: firstDoc.id,
          sampleData: {
            docId: firstDoc.id,
            hasDataGenerales: !!firstDocData.datos_generales,
            hasItems: !!firstDocData.items,
            hasSubtotales: !!firstDocData.subtotales,
            totalGeneral: firstDocData.total_general,
            fields: Object.keys(firstDocData)
          }
        });
      }
    } catch (error: any) {
      console.error('Error al conectar con Firestore:', error);
      setTestResults({
        success: false,
        error: error.message,
        stack: error.stack
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Diagnóstico de Firestore</h1>
        <button
          onClick={() => navigate('/presupuestos')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Volver a Presupuestos
        </button>
      </div>

      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h2 className="text-lg font-semibold mb-2 text-yellow-800">Instrucciones</h2>
        <p>
          Esta página te ayudará a diagnosticar problemas con la conexión a Firestore y
          proporcionar información sobre la estructura de los datos.
        </p>
        <p className="mt-2">
          Revisa los resultados de las pruebas automáticas a continuación y utiliza el botón
          "Ejecutar prueba manual" para realizar una prueba adicional con más detalles.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
        <FirestoreConfigCheck />
        <FirestoreDiagnostic />
      </div>

      <div className="p-4 bg-white rounded shadow mb-6">
        <h2 className="text-lg font-bold mb-4">Prueba Manual de Conexión</h2>
        <button
          onClick={runManualTest}
          disabled={testing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {testing ? 'Ejecutando prueba...' : 'Ejecutar prueba manual'}
        </button>

        {testResults && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Resultados:</h3>
            <div className={`p-3 rounded ${
              testResults.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <p className="font-semibold">
                {testResults.success 
                  ? `✅ Conexión exitosa. Documentos encontrados: ${testResults.docCount}` 
                  : '❌ Error en la conexión'
                }
              </p>
            </div>
            <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs mt-3">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-lg font-bold mb-2">Próximos pasos</h2>
        <div className="space-y-3">
          <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
            <p className="font-semibold text-blue-800">Si el diagnóstico muestra cero documentos:</p>
            <ul className="list-disc pl-5 mt-1 text-sm">
              <li>Verifica que la colección 'presupuestos' exista en tu base de datos Firestore</li>
              <li>Asegúrate de que exista al menos un documento con la estructura correcta</li>
              <li>Comprueba las reglas de seguridad de Firestore</li>
            </ul>
          </div>
          
          <div className="p-3 border-l-4 border-green-500 bg-green-50">
            <p className="font-semibold text-green-800">Si el diagnóstico es exitoso pero los presupuestos no se cargan:</p>
            <ul className="list-disc pl-5 mt-1 text-sm">
              <li>Revisa la estructura de datos en los documentos (campos necesarios)</li>
              <li>Verifica que los componentes de lista y visualización estén utilizando los campos correctos</li>
              <li>Comprueba si hay errores en la consola del navegador</li>
            </ul>
          </div>
          
          <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
            <p className="font-semibold text-yellow-800">Alternativas mientras solucionas el problema:</p>
            <ul className="list-disc pl-5 mt-1 text-sm">
              <li>Utiliza la versión de demostración: <button onClick={() => navigate('/presupuestos/demo')} className="text-blue-600 underline">Ver Demo</button></li>
              <li>Crea presupuestos con el creador simple: <button onClick={() => navigate('/presupuestos/crear-simple')} className="text-blue-600 underline">Crear Simple</button></li>
              <li>Crea presupuestos directamente en la consola de Firebase</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirestoreDiagnosticPage;