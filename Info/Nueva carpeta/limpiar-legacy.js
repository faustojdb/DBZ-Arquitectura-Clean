const admin = require('firebase-admin');
const fs = require('fs');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function backupCollection(collectionName) {
  console.log(`Haciendo backup de la colección ${collectionName}...`);
  const snapshot = await db.collection(collectionName).get();
  const data = {};
  
  snapshot.forEach(doc => {
    data[doc.id] = doc.data();
  });
  
  fs.writeFileSync(
    `./backup_${collectionName}_${Date.now()}.json`,
    JSON.stringify(data, null, 2)
  );
  console.log(`Backup de ${collectionName} completado.`);
}

async function removeLegacyCodes() {
  try {
    // 1. Hacer backup de todas las colecciones
    await backupCollection('items');
    await backupCollection('analisis');
    await backupCollection('presupuestos');
    
    console.log('\nIniciando eliminación de códigos legacy...');
    
    // 2. Eliminar códigos legacy de la colección items
    const itemsSnapshot = await db.collection('items').get();
    let batch = db.batch();
    let batchCount = 0;
    let totalProcessed = 0;
    let modifiedDocs = 0;
    
    for (const doc of itemsSnapshot.docs) {
      const docRef = db.collection('items').doc(doc.id);
      const data = doc.data();
      
      // Verificar la estructura actual del documento
      console.log(`\nProcesando documento ${doc.id}:`);
      console.log('Estructura actual:', JSON.stringify(data, null, 2));
      
      let wasModified = false;
      
      // Verificar y eliminar synagro directo
      if ('synagro' in data) {
        delete data.synagro;
        wasModified = true;
      }
      
      // Verificar y eliminar bejerman directo
      if ('bejerman' in data) {
        delete data.bejerman;
        wasModified = true;
      }
      
      // Verificar y eliminar dentro de codigos_legacy
      if (data.codigos_legacy) {
        console.log('Encontrado codigos_legacy en', doc.id);
        if ('bejerman' in data.codigos_legacy) {
          delete data.codigos_legacy.bejerman;
          wasModified = true;
        }
        if ('synagro' in data.codigos_legacy) {
          delete data.codigos_legacy.synagro;
          wasModified = true;
        }
        
        // Si codigos_legacy está vacío, eliminarlo
        if (Object.keys(data.codigos_legacy).length === 0) {
          delete data.codigos_legacy;
        }
      }
      
      if (wasModified) {
        console.log(`Documento ${doc.id} modificado. Nueva estructura:`, JSON.stringify(data, null, 2));
        batch.update(docRef, data);
        batchCount++;
        modifiedDocs++;
      }
      
      totalProcessed++;
      
      // Firestore tiene un límite de 500 operaciones por batch
      if (batchCount >= 450) {
        await batch.commit();
        console.log(`Procesados ${totalProcessed} documentos (${modifiedDocs} modificados)...`);
        batch = db.batch();
        batchCount = 0;
      }
    }
    
    if (batchCount > 0) {
      await batch.commit();
      console.log(`\nProceso completado:`);
      console.log(`- Total documentos procesados: ${totalProcessed}`);
      console.log(`- Documentos modificados: ${modifiedDocs}`);
    }
    
    console.log('\nVerificando integridad de las relaciones...');
    const verificationSnapshot = await db.collection('analisis')
      .limit(5)
      .get();
    
    for (const doc of verificationSnapshot.docs) {
      const data = doc.data();
      if (data.insumos) {
        for (const [key, insumo] of Object.entries(data.insumos)) {
          const itemRef = await db.collection('items')
            .doc(insumo.item_id)
            .get();
          
          if (!itemRef.exists) {
            console.error(`¡Alerta! Referencia rota encontrada en ${doc.id} -> ${insumo.item_id}`);
          } else {
            console.log(`Verificada referencia: ${doc.id} -> ${insumo.item_id}`);
          }
        }
      }
    }
    
    console.log('\nProceso completado exitosamente.');
    console.log('Los backups se han guardado en archivos JSON separados.');
    
  } catch (error) {
    console.error('Error durante el proceso:', error);
    throw error;
  }
}

// Ejecutar el script
removeLegacyCodes()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });