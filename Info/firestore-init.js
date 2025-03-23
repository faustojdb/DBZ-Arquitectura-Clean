// firestore-init.js
// Script para inicializar una base de datos de Firebase Firestore para el proyecto DBZ Arquitectura
// Ejecutar con: node firestore-init.js

// IMPORTANTE: Debes tener un archivo serviceAccountKey.json en la raíz del proyecto
// Este archivo NUNCA debe subirse al repositorio (inclúyelo en .gitignore)
// Puedes generar este archivo desde Firebase Console > Configuración > Cuentas de servicio

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar app con credenciales
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Función para añadir timestamp actual
const now = admin.firestore.Timestamp.now();

// Inicializar datos básicos
async function initializeDatabase() {
  try {
    console.log('Iniciando configuración de la base de datos...');
    
    // 1. Crear materiales de ejemplo
    console.log('Creando materiales de ejemplo...');
    const materialsCollection = db.collection('items');
    
    const materials = [
      {
        id: 'MAT-0001',
        activo: true,
        categoria: 'Categoría 1',
        descripcion: 'Material de Prueba 01',
        fecha_actualizacion: now,
        precio_unitario: 1000,
        unidad: 'und'
      },
      {
        id: 'MAT-0002',
        activo: true,
        categoria: 'Categoría 1',
        descripcion: 'Material de Prueba 02',
        fecha_actualizacion: now,
        precio_unitario: 2000,
        unidad: 'und'
      },
      {
        id: 'MAT-0003',
        activo: true,
        categoria: 'Categoría 2',
        descripcion: 'Material de Prueba 03',
        fecha_actualizacion: now,
        precio_unitario: 3000,
        unidad: 'und'
      },
      {
        id: 'MAT-0004',
        activo: true,
        categoria: 'Categoría 3',
        descripcion: 'Material de Prueba 04',
        fecha_actualizacion: now,
        precio_unitario: 4000,
        unidad: 'hora'
      },
      {
        id: 'MAT-0005',
        activo: true,
        categoria: 'Categoría 3',
        descripcion: 'Material de Prueba 05',
        fecha_actualizacion: now,
        precio_unitario: 5000,
        unidad: 'hora'
      }
    ];
    
    // Crear cada material con ID personalizado
    for (const material of materials) {
      const id = material.id;
      delete material.id;
      await materialsCollection.doc(id).set(material);
    }
    
    // 2. Crear análisis de ejemplo
    console.log('Creando análisis de ejemplo...');
    const analysisCollection = db.collection('analisis');
    
    const analyses = [
      {
        id: 'AC1',
        codigoDisplay: '1.01',
        costo_total: 7000,
        fecha_actualizacion: now,
        indice: {
          mayor: 1,
          menor: 1
        },
        insumos: {
          'INS001': {
            cantidad: 2,
            coeficiente: 1,
            item_id: 'MAT-0001',
            precio_unitario: 1000,
            subtotal: 2000,
            unidad: 'und'
          },
          'INS002': {
            cantidad: 1,
            coeficiente: 1,
            item_id: 'MAT-0002',
            precio_unitario: 2000,
            subtotal: 2000,
            unidad: 'und'
          },
          'INS003': {
            cantidad: 1,
            coeficiente: 1,
            item_id: 'MAT-0003',
            precio_unitario: 3000,
            subtotal: 3000,
            unidad: 'und'
          }
        },
        nombre: 'Análisis de Prueba 01',
        rendimiento: 1,
        rubro: {
          id: 1,
          nombre: 'Categoría 1',
          unidad: 'GL'
        },
        unidad: 'und'
      },
      {
        id: 'AC2',
        codigoDisplay: '3.01',
        costo_total: 19000,
        fecha_actualizacion: now,
        indice: {
          mayor: 3,
          menor: 1
        },
        insumos: {
          'INS001': {
            cantidad: 1,
            coeficiente: 1,
            item_id: 'MAT-0003',
            precio_unitario: 3000,
            subtotal: 3000,
            unidad: 'und'
          },
          'INS002': {
            cantidad: 2,
            coeficiente: 1,
            item_id: 'MAT-0004',
            precio_unitario: 4000,
            subtotal: 8000,
            unidad: 'hora'
          },
          'INS003': {
            cantidad: 1.6,
            coeficiente: 1,
            item_id: 'MAT-0005',
            precio_unitario: 5000,
            subtotal: 8000,
            unidad: 'hora'
          }
        },
        nombre: 'Análisis de Prueba 02',
        rendimiento: 1,
        rubro: {
          id: 3,
          nombre: 'Categoría 3',
          unidad: 'GL'
        },
        unidad: 'und'
      }
    ];
    
    // Crear cada análisis con ID personalizado
    for (const analysis of analyses) {
      const id = analysis.id;
      delete analysis.id;
      await analysisCollection.doc(id).set(analysis);
    }
    
    // 3. Crear presupuesto de ejemplo
    console.log('Creando presupuesto de ejemplo...');
    const presupuestosCollection = db.collection('presupuestos');
    
    const presupuesto = {
      datos_generales: {
        beneficio_explicito: 20,
        beneficio_implicito: 0,
        comitente: 'Cliente de Prueba',
        fecha: now,
        lugar: 'Ubicación de Prueba',
        obra: 'Proyecto de Prueba',
        tipo_encomienda: 'Proyecto'
      },
      items: {
        'item_1234567890': {
          analisis_id: 'AC1',
          cantidad: 10,
          importe: 70000,
          incidencia: 26.9,
          nombre: 'Análisis de Prueba 01',
          numero_item: '1.1.0',
          precio_unitario: 7000,
          unidad: 'und'
        },
        'item_0987654321': {
          analisis_id: 'AC2',
          cantidad: 10,
          importe: 190000,
          incidencia: 73.1,
          nombre: 'Análisis de Prueba 02',
          numero_item: '3.1.0',
          precio_unitario: 19000,
          unidad: 'und'
        }
      },
      subtotales: {
        'ST01': {
          importe: 70000,
          incidencia: 26.9,
          nombre: 'Categoría 1'
        },
        'ST03': {
          importe: 190000,
          incidencia: 73.1,
          nombre: 'Categoría 3'
        }
      },
      total_general: 260000
    };
    
    await presupuestosCollection.doc('PRES0001').set(presupuesto);
    
    console.log('¡Base de datos inicializada correctamente!');
    console.log('Materiales creados: 5');
    console.log('Análisis creados: 2');
    console.log('Presupuestos creados: 1');
    
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
}

// Ejecutar la inicialización
initializeDatabase().then(() => {
  console.log('Proceso completado.');
  process.exit(0);
}).catch(error => {
  console.error('Error en el proceso:', error);
  process.exit(1);
});
