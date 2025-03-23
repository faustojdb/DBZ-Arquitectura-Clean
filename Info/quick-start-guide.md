# Guía Rápida de Inicio - DBZ Arquitectura

Esta guía te ayudará a poner en marcha el proyecto DBZ Arquitectura desde cero, configurando tu propia base de datos en Firebase y haciendo funcionar todas las funcionalidades del sistema.

## Paso 1: Clonar el Repositorio

```bash
# Clonar el repositorio desde GitHub
git clone https://github.com/tu-usuario/proyecto-ac.git

# Entrar al directorio del proyecto
cd proyecto-ac
```

## Paso 2: Instalar Dependencias

```bash
# Con npm
npm install

# O con yarn si lo prefieres
yarn install
```

## Paso 3: Crear un Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Ingresa un nombre para tu proyecto (ejemplo: "mi-dbz-arquitectura")
4. Sigue los pasos del asistente
5. Una vez creado, haz clic en "Agregar app" y selecciona el icono web (</>) 
6. Registra la app con un nombre (ejemplo: "dbz-web")
7. Copia el objeto `firebaseConfig` que Firebase te mostrará

## Paso 4: Configurar Firebase en el Proyecto

1. Abre el archivo `src/firebase/config.ts`
2. Reemplaza el objeto `firebaseConfig` con el que copiaste de Firebase

```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
```

3. Haz lo mismo en cualquier otro archivo que contenga una configuración de Firebase:
   - `index.html` (script de inicialización de Firebase)
   - `src/firebase/firebase.ts` (si existe)
   - `src/services/firestore.ts` (si existe)

## Paso 5: Configurar Firestore Database

1. En Firebase Console, ve a "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" y haz clic en "Siguiente"
4. Selecciona la ubicación del servidor y haz clic en "Habilitar"

## Paso 6: Configurar Permisos de Firebase

1. En Firestore Database, ve a la pestaña "Reglas"
2. Para desarrollo inicial, puedes usar estas reglas (no recomendado para producción):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Haz clic en "Publicar"

## Paso 7: Inicializar la Base de Datos

Para inicializar la base de datos con datos de prueba, necesitarás Node.js y una cuenta de servicio de Firebase.

1. En Firebase Console, ve a "Configuración del proyecto" > "Cuentas de servicio"
2. Haz clic en "Generar nueva clave privada"
3. Guarda el archivo JSON como `serviceAccountKey.json` en la raíz del proyecto
4. Crea un archivo llamado `firestore-init.js` en la raíz del proyecto con el código proporcionado
5. Ejecuta el script para inicializar tu base de datos:

```bash
node firestore-init.js
```

## Paso 8: Ejecutar el Proyecto en Desarrollo

```bash
# Con npm
npm run dev

# O con yarn
yarn dev
```

Ahora puedes acceder a la aplicación en: [http://localhost:5173](http://localhost:5173)

## Paso 9: Construir para Producción

```bash
# Con npm
npm run build

# O con yarn
yarn build
```

Esto generará una versión optimizada en la carpeta `dist/`

## Paso 10: Desplegar en Firebase Hosting (Opcional)

Si deseas publicar tu aplicación en Firebase Hosting:

```bash
# Instalar Firebase CLI si aún no lo has hecho
npm install -g firebase-tools

# Iniciar sesión en Firebase
firebase login

# Inicializar Firebase en el proyecto
firebase init

# Seleccionar Hosting y tu proyecto
# Usar "dist" como directorio público
# Configurar como SPA (single-page app)

# Desplegar la aplicación
firebase deploy
```

## ¿Qué Hacer a Continuación?

1. **Personalizar los Rubros y Categorías**: Edita los archivos en `src/components/analysis/constants/` para ajustar las categorías a tus necesidades.

2. **Cargar Tus Propios Materiales**: Utiliza el módulo de Gestión de Precios para añadir tus materiales reales.

3. **Crear Análisis de Costos**: Utiliza el módulo de Análisis de Costos para crear análisis basados en tus materiales.

4. **Generar Presupuestos**: Utiliza el módulo de Presupuestos para crear presupuestos usando tus análisis.

¡Y eso es todo! Ahora deberías tener una instalación funcional del sistema DBZ Arquitectura con tu propia base de datos personalizada.
