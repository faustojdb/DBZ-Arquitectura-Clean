# Guía de Despliegue en Producción - DBZ Arquitectura

Esta guía detalla los pasos para desplegar la aplicación DBZ Arquitectura en un entorno de producción utilizando Firebase Hosting.

## Requisitos Previos

- Proyecto configurado y funcionando en entorno de desarrollo
- Cuenta de Firebase
- Node.js y npm instalados
- Firebase CLI instalado (`npm install -g firebase-tools`)

## Paso 1: Configurar Reglas de Seguridad de Firestore

Antes de desplegar en producción, es crucial configurar reglas de seguridad adecuadas para proteger tus datos.

1. En la consola de Firebase, ve a "Firestore Database" > "Reglas"
2. Actualiza las reglas con un modelo más seguro:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regla básica - requiere autenticación
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas específicas para cada colección
    match /items/{item} {
      allow read: if true;  // Lectura pública para materiales
      allow write: if request.auth != null;  // Escritura solo autenticado
    }
    
    match /analisis/{analysis} {
      allow read: if true;  // Lectura pública para análisis
      allow write: if request.auth != null;  // Escritura solo autenticado
    }
    
    match /presupuestos/{presupuesto} {
      allow read, write: if request.auth != null;  // Solo con autenticación
    }
  }
}
```

3. Publica las nuevas reglas

## Paso 2: Optimizar la Aplicación para Producción

1. Revisa y actualiza las variables de entorno si es necesario
2. Asegúrate de que no haya datos de prueba o código de depuración

3. Construye la versión de producción:

```bash
# Con npm
npm run build

# Con yarn
yarn build
```

Esto generará la carpeta `dist/` con los archivos optimizados.

## Paso 3: Configurar Firebase Hosting

1. Inicia sesión en Firebase desde la terminal:

```bash
firebase login
```

2. Inicializa Firebase en tu proyecto:

```bash
firebase init
```

3. Selecciona las opciones:
   - Selecciona "Hosting"
   - Selecciona tu proyecto de Firebase
   - Directorio público: `dist`
   - Configura como aplicación de página única (SPA): Sí
   - No sobrescribas `index.html` si ya existe en la carpeta dist

4. Esto creará un archivo `firebase.json` con la configuración del despliegue.

## Paso 4: Personalizar la Configuración del Hosting

Puedes editar el archivo `firebase.json` para añadir configuraciones adicionales:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

Esta configuración añade reglas de caché para mejorar el rendimiento.

## Paso 5: Desplegar en Firebase Hosting

```bash
firebase deploy
```

Una vez completado, Firebase te proporcionará una URL donde tu aplicación está desplegada (habitualmente `https://tu-proyecto.web.app`).

## Paso 6: Configurar un Dominio Personalizado (Opcional)

Si deseas usar tu propio dominio:

1. En la consola de Firebase, ve a "Hosting" > "Agregar dominio personalizado"
2. Sigue las instrucciones para verificar la propiedad de tu dominio
3. Configura los registros DNS según las instrucciones de Firebase
4. Espera a que los cambios de DNS se propaguen (puede tomar hasta 48 horas)

## Paso 7: Configurar Firebase Authentication (Recomendado)

Para una aplicación en producción, es recomendable configurar métodos de autenticación más robustos:

1. En la consola de Firebase, ve a "Authentication" > "Sign-in method"
2. Habilita métodos adicionales como "Email/Password", "Google", etc.
3. Actualiza tu código para manejar estos métodos de autenticación

## Consideraciones para Producción

1. **Monitoreo**: Configura Firebase Analytics o Google Analytics para monitorear el uso de la aplicación

2. **Respaldos**: Configura respaldos automáticos para tu base de datos Firestore

3. **Escalado**: Observa el uso de tus recursos en Firebase y ajusta el plan según sea necesario

4. **Actualizaciones**: Establece un procedimiento para actualizar la aplicación, incluyendo pruebas antes de cada despliegue

5. **Seguridad**: Realiza auditorías periódicas de seguridad de tu aplicación y base de datos

## Comandos Útiles para el Mantenimiento

```bash
# Ver dominios conectados
firebase hosting:sites

# Desplegar solo el hosting (sin afectar reglas, etc.)
firebase deploy --only hosting

# Realizar una vista previa local de la versión de producción
firebase serve --only hosting

# Listar versiones anteriores desplegadas
firebase hosting:versions:list

# Revertir a una versión anterior
firebase hosting:clone VERSION_ID

# Limpiar caché de hosting
firebase hosting:channel:delete CHANNEL_ID
```

## Solución de Problemas Comunes

### Problema: Error al desplegar
Solución: Verifica que tengas permiso para desplegar, y que la construcción de la aplicación se realizó correctamente.

### Problema: La aplicación no carga después del despliegue
Solución: Verifica que el archivo `index.html` se generó correctamente y está incluido en la carpeta `dist/`.

### Problema: Los archivos no se actualizan después del despliegue
Solución: Asegúrate de limpiar la caché en tu navegador, o despliega con `firebase deploy --only hosting:SITE_ID`.

### Problema: Errores de CORS al acceder a Firestore
Solución: Configura las reglas CORS adecuadas en Firebase o utiliza Cloud Functions para APIs.
