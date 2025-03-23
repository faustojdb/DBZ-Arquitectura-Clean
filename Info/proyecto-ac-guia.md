# Guía Completa del Proyecto DBZ Arquitectura

## Índice
1. [Descripción General](#descripción-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Diagrama de Flujo](#diagrama-de-flujo)
4. [Tecnologías y Dependencias](#tecnologías-y-dependencias)
5. [Configuración del Entorno](#configuración-del-entorno)
6. [Configuración de Firebase](#configuración-de-firebase)
7. [Clonación e Instalación](#clonación-e-instalación)
8. [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
9. [Ejecución del Proyecto](#ejecución-del-proyecto)
10. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
11. [Preguntas Frecuentes](#preguntas-frecuentes)

## Descripción General

El proyecto **DBZ Arquitectura** es una aplicación web para la gestión de presupuestos, análisis de costos y gestión de precios de materiales en el ámbito de la arquitectura y construcción. Consta de tres módulos principales:

1. **Gestión de Precios**: Permite administrar un catálogo de materiales con sus precios, categorías y unidades de medida.
2. **Análisis de Costos**: Facilita la creación de análisis detallados de costos para diferentes tipos de obras.
3. **Presupuestos**: Permite generar presupuestos completos a partir de los análisis de costos.

La aplicación está construida con React y utiliza Firebase como base de datos en la nube.

## Estructura del Proyecto

El proyecto sigue una estructura organizada basada en componentes y módulos funcionales:

```
proyecto-ac/
├── node_modules/
├── public/
│   ├── assets/
│   │   ├── logo-dbz.png
│   │   └── firma.png
│   └── index.html
├── src/
│   ├── components/
│   │   ├── analysis/          # Componentes del módulo de análisis de costos
│   │   ├── prices/            # Componentes del módulo de gestión de precios
│   │   ├── presupuestos/      # Componentes del módulo de presupuestos
│   │   └── shared/            # Componentes compartidos
│   ├── firebase/              # Configuración de Firebase
│   ├── hooks/                 # Hooks personalizados para lógica compartida
│   ├── styles/                # Estilos globales
│   ├── types/                 # Definiciones de tipos TypeScript
│   ├── utils/                 # Utilidades y funciones auxiliares
│   ├── App.tsx                # Componente principal
│   └── main.tsx               # Punto de entrada
├── .gitignore
├── firebase.json              # Configuración de despliegue de Firebase
├── index.html                 # HTML base
├── package.json               # Dependencias y scripts
├── postcss.config.js          # Configuración de PostCSS
├── tailwind.config.js         # Configuración de Tailwind CSS
├── tsconfig.json              # Configuración de TypeScript
└── vite.config.js             # Configuración de Vite
```

### Estructura de Carpetas Principales

#### `/src/components/`

Contiene los componentes organizados por módulos funcionales:

- **analysis/**: Componentes para el análisis de costos
  - **components/**: Componentes específicos (AnalysisCard, AnalysisRow, etc.)
  - **constants/**: Constantes (categorías, rubros, estilos)
  - **utils/**: Utilidades específicas para análisis

- **prices/**: Componentes para la gestión de precios
  - **PriceManagement.tsx**: Componente principal
  - **useMaterialsData.ts**: Hook para manejo de datos de materiales
  - **materialsStyles.js**: Estilos específicos

- **presupuestos/**: Componentes para presupuestos
  - **components/**: Componentes específicos (ItemRow, RubroRow, etc.)
  - **utils/**: Utilidades para presupuestos
  - **PresupuestoList.tsx, PresupuestoEditor.tsx, PresupuestoViewer.tsx**: Componentes principales

- **shared/**: Componentes compartidos entre módulos
  - **inputs/**: Componentes de entrada reutilizables
  - **Navigation.tsx**: Barra de navegación principal

#### `/src/firebase/`

Contiene la configuración y utilidades para la integración con Firebase:

- **config.ts**: Configuración principal de Firebase
- **firestore.ts**: Funciones para interactuar con Firestore

#### `/src/hooks/`

Hooks personalizados para lógica reutilizable:

- **useFirestore.ts**: Hook para operaciones CRUD con Firestore
- **usePresupuesto.ts**: Hook para la gestión de presupuestos
- **useAnalisis.ts**: Hook para la gestión de análisis de costos

#### `/src/types/`

Definiciones de tipos TypeScript para las diferentes entidades del sistema:

- **analysis.ts**: Tipos para análisis de costos
- **budget.ts**: Tipos para presupuestos

## Diagrama de Flujo

### Flujo General de la Aplicación

1. **Inicio**:
   - El usuario inicia la aplicación
   - Se carga la navegación principal con los tres módulos
   - Se realiza autenticación anónima con Firebase

2. **Módulo de Gestión de Precios**:
   - Carga de materiales desde Firebase
   - CRUD de materiales (Crear, Leer, Actualizar, Eliminar)
   - Sincronización automática con Firebase

3. **Módulo de Análisis de Costos**:
   - Carga de análisis por categorías
   - CRUD de análisis
   - Cada análisis contiene insumos (materiales) con cantidades y precios
   - Los precios se obtienen del catálogo de materiales

4. **Módulo de Presupuestos**:
   - Creación de presupuestos a partir de análisis
   - Adición/eliminación de ítems al presupuesto
   - Cálculo de totales, subtotales y beneficios
   - Generación de documentos exportables (PDF)

### Flujo de Datos

```
Materiales → Análisis de Costos → Presupuestos → PDF/Exportación
```

1. **Materiales**: Base de datos principal de precios
2. **Análisis**: Utilizan materiales para calcular costos unitarios
3. **Presupuestos**: Agregan análisis para formar presupuestos completos

## Tecnologías y Dependencias

### Tecnologías Principales

- **React**: Biblioteca para construcción de interfaces (v18.2)
- **TypeScript**: Superset tipado de JavaScript
- **Vite**: Herramienta de construcción y desarrollo
- **Firebase**: Plataforma de desarrollo de aplicaciones
  - **Firestore**: Base de datos NoSQL en la nube
  - **Authentication**: Sistema de autenticación
  - **Hosting**: Alojamiento web

### Dependencias Principales

A continuación se listan las dependencias principales del proyecto según el archivo `package.json`:

```json
"dependencies": {
  "@tanstack/react-virtual": "^3.13.4",
  "date-fns": "^4.1.0",
  "firebase": "^10.7.1",
  "firebase-admin": "^13.1.0",
  "html2canvas": "^1.4.1",
  "jspdf": "^3.0.1",
  "lucide-react": "^0.294.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^7.1.5",
  "react-toastify": "^11.0.5",
  "uuid": "^11.1.0",
  "xlsx": "^0.18.5"
},
"devDependencies": {
  "@types/react": "^18.2.43",
  "@types/react-dom": "^18.2.17",
  "@vitejs/plugin-react-swc": "^3.5.0",
  "autoprefixer": "^10.4.16",
  "esbuild": "^0.20.0",
  "postcss": "^8.4.32",
  "tailwindcss": "^3.3.6",
  "typescript": "^5.2.2",
  "vite": "^5.0.8"
}
```

### Desglose de Dependencias

- **Interfaz y UI**:
  - `react`, `react-dom`: Biblioteca principal para construcción de interfaces
  - `lucide-react`: Iconos para la interfaz
  - `react-toastify`: Notificaciones Toast
  - `@tanstack/react-virtual`: Virtualización para listas largas

- **Enrutamiento**:
  - `react-router-dom`: Navegación entre páginas

- **Firebase**:
  - `firebase`: SDK de Firebase
  - `firebase-admin`: SDK de administración de Firebase

- **Exportación y Manejo de Documentos**:
  - `html2canvas`: Captura de HTML como canvas
  - `jspdf`: Generación de PDF
  - `xlsx`: Manejo de archivos Excel

- **Utilidades**:
  - `date-fns`: Manipulación de fechas
  - `uuid`: Generación de identificadores únicos

- **Desarrollo**:
  - `typescript`: Tipado estático
  - `vite`: Servidor de desarrollo y construcción
  - `tailwindcss`: Framework CSS utilitario
  - `postcss`, `autoprefixer`: Procesamiento de CSS

## Configuración del Entorno

### Requisitos Previos

- **Node.js**: versión 16.x o superior
- **npm** o **yarn**: Gestores de paquetes
- **Git**: Sistema de control de versiones
- **Cuenta de Firebase**: Para la creación y gestión de proyectos Firebase

### Herramientas Recomendadas

- **Visual Studio Code**: Editor de código con extensiones para React/TypeScript
- **Firebase CLI**: Herramienta de línea de comandos para Firebase
- **Chrome DevTools**: Para depuración de React y Firebase

## Configuración de Firebase

### Paso 1: Crear un Proyecto en Firebase

1. Accede a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Ingresa un nombre para tu proyecto (por ejemplo, "dbz-arquitectura")
4. Sigue los pasos del asistente (puedes desactivar Google Analytics si no lo necesitas)
5. Haz clic en "Crear proyecto"

### Paso 2: Configurar Firebase Authentication

1. En la consola de Firebase, selecciona tu proyecto
2. En el menú lateral, haz clic en "Authentication"
3. Haz clic en "Comenzar"
4. En la pestaña "Sign-in method", habilita el método "Anónimo"

### Paso 3: Configurar Firebase Firestore

1. En el menú lateral, haz clic en "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Iniciar en modo de prueba" (para desarrollo)
4. Elige la ubicación de tus datos (preferiblemente una cercana a tus usuarios)
5. Haz clic en "Habilitar"

### Paso 4: Obtener Credenciales de Firebase

1. En la página principal del proyecto, haz clic en "Agregar app" y selecciona el icono de web (`</>`)
2. Registra la app con un apodo (por ejemplo, "dbz-web")
3. Haz clic en "Registrar app"
4. Copia el objeto `firebaseConfig` que se muestra, lo necesitarás para conectar tu aplicación

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "TU_ID_DE_REMITENTE",
  appId: "TU_ID_DE_APP"
};
```

## Clonación e Instalación

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/proyecto-ac.git
cd proyecto-ac
```

### Paso 2: Instalar Dependencias

Con npm:
```bash
npm install
```

Con yarn:
```bash
yarn install
```

### Paso 3: Configurar Variables de Firebase

1. Busca los archivos de configuración de Firebase en el proyecto:
   - `src/firebase/config.ts`
   - `src/firebase/firebase.ts`
   - `src/services/firestore.ts`
   - `index.html` (script de inicialización)

2. Reemplaza las configuraciones existentes con tus credenciales de Firebase:

En `src/firebase/config.ts`:
```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "TU_ID_DE_REMITENTE",
  appId: "TU_ID_DE_APP"
};
```

Asegúrate de reemplazar esta misma configuración en todos los archivos mencionados.

## Configuración de la Base de Datos

### Estructura de Colecciones en Firestore

El proyecto requiere las siguientes colecciones en Firestore:

1. **items**: Catálogo de materiales
2. **analisis**: Análisis de costos
3. **presupuestos**: Presupuestos generados

### Paso 1: Crear la Colección de Materiales (items)

1. En la consola de Firebase, selecciona "Firestore Database"
2. Haz clic en "Iniciar colección"
3. Ingresa "items" como ID de colección
4. Crea un primer documento con los siguientes campos:

```
ID del documento: MAT-0001 (ID personalizado)
Campos:
- activo: boolean (true)
- categoria: string ("MATERIAL GENERAL")
- descripcion: string ("Ejemplo de material")
- fecha_actualizacion: timestamp (usa el servidor)
- precio_unitario: number (100)
- unidad: string ("m2")
```

### Paso 2: Crear la Colección de Análisis (analisis)

1. Crea una nueva colección llamada "analisis"
2. Crea un primer documento con los siguientes campos:

```
ID del documento: AC1 (ID personalizado)
Campos:
- codigoDisplay: string ("1.01")
- costo_total: number (100)
- fecha_actualizacion: timestamp (usa el servidor)
- indice: map {
    mayor: number (1),
    menor: number (1)
  }
- insumos: map {} (objeto vacío inicialmente)
- nombre: string ("Ejemplo de análisis")
- rendimiento: number (1)
- rubro: map {
    id: number (1),
    nombre: string ("GENERALES VARIABLES"),
    unidad: string ("GL")
  }
- unidad: string ("m2")
```

### Paso 3: Crear la Colección de Presupuestos (presupuestos)

1. Crea una nueva colección llamada "presupuestos"
2. Crea un primer documento con los siguientes campos:

```
ID del documento: PRES0001 (ID personalizado)
Campos:
- datos_generales: map {
    beneficio_explicito: number (20),
    beneficio_implicito: number (0),
    comitente: string ("Cliente Ejemplo"),
    fecha: timestamp (usa el servidor),
    lugar: string ("Lugar"),
    obra: string ("Proyecto Ejemplo"),
    tipo_encomienda: string ("Obra - Construcción")
  }
- items: map {} (objeto vacío inicialmente)
- subtotales: map {} (objeto vacío inicialmente)
- total_general: number (0)
```

## Ejecución del Proyecto

### Desarrollo Local

Para iniciar el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
```

Esto iniciará el servidor de desarrollo de Vite, generalmente en `http://localhost:5173`

### Construcción para Producción

Para construir la aplicación para producción:

```bash
npm run build
# o
yarn build
```

Esto generará una versión optimizada en la carpeta `dist/`

### Despliegue en Firebase Hosting

1. Instala Firebase CLI si aún no lo has hecho:
```bash
npm install -g firebase-tools
```

2. Inicia sesión en Firebase:
```bash
firebase login
```

3. Inicializa Firebase en tu proyecto:
```bash
firebase init
```
- Selecciona "Hosting"
- Selecciona tu proyecto de Firebase
- Usa "dist" como directorio público
- Configura como SPA

4. Despliega tu aplicación:
```bash
firebase deploy
```

## Estructura de la Base de Datos

### Colección `items` (Materiales)

Cada documento representa un material con la siguiente estructura:

```javascript
{
  "id": "MAT-0001", // ID del documento
  "activo": true,
  "categoria": "MATERIAL GENERAL",
  "descripcion": "Cemento Portland",
  "fecha_actualizacion": Timestamp,
  "precio_unitario": 2500,
  "unidad": "bolsa"
}
```

### Colección `analisis` (Análisis de Costos)

Cada documento representa un análisis de costo con la siguiente estructura:

```javascript
{
  "id": "AC1", // ID del documento
  "codigoDisplay": "1.01",
  "costo_total": 25000,
  "fecha_actualizacion": Timestamp,
  "indice": {
    "mayor": 1,
    "menor": 1
  },
  "insumos": {
    "INS001": {
      "cantidad": 10,
      "coeficiente": 1,
      "item_id": "MAT-0001",
      "precio_unitario": 2500,
      "subtotal": 25000,
      "unidad": "bolsa"
    }
  },
  "nombre": "Ejemplo de análisis",
  "rendimiento": 1,
  "rubro": {
    "id": 1,
    "nombre": "GENERALES VARIABLES",
    "unidad": "GL"
  },
  "unidad": "m2"
}
```

### Colección `presupuestos` (Presupuestos)

Cada documento representa un presupuesto completo con la siguiente estructura:

```javascript
{
  "id": "PRES0001", // ID del documento
  "datos_generales": {
    "beneficio_explicito": 20,
    "beneficio_implicito": 0,
    "comitente": "Cliente Ejemplo",
    "fecha": Timestamp,
    "lugar": "Lugar",
    "obra": "Proyecto Ejemplo",
    "tipo_encomienda": "Obra - Construcción"
  },
  "items": {
    "item_12345": {
      "analisis_id": "AC1",
      "cantidad": 10,
      "importe": 250000,
      "incidencia": 100,
      "nombre": "Ejemplo de análisis",
      "numero_item": "1.1.0",
      "precio_unitario": 25000,
      "unidad": "m2"
    }
  },
  "subtotales": {
    "ST01": {
      "importe": 250000,
      "incidencia": 100,
      "nombre": "GENERALES VARIABLES"
    }
  },
  "total_general": 250000
}
```

## Preguntas Frecuentes

### ¿Cómo cambiar los rubros y categorías?

Los rubros están definidos en `src/components/analysis/constants/rubros.ts` y `src/components/analysis/constants/categories.ts`. Modifica estos archivos para ajustar las categorías según tus necesidades.

### ¿Cómo actualizar los precios de múltiples materiales?

La aplicación incluye una función de actualización masiva de precios en el componente `UpdatePricesButton.jsx`. Puedes modificar esta funcionalidad según necesites.

### ¿Es posible exportar/importar datos?

El proyecto incluye funcionalidades para exportar presupuestos a PDF mediante `html2canvas` y `jspdf`. Para implementar importación de datos, necesitarías extender la funcionalidad usando `xlsx` para archivos Excel.

### ¿Cómo cambiar el logo y la firma?

Reemplaza los archivos `logo-dbz.png` y `firma.png` en la carpeta `public/assets/` con tus propias imágenes, manteniendo los mismos nombres.

### ¿Cómo modificar los colores de la aplicación?

Los colores principales están definidos en `src/components/prices/materialsStyles.js` y `tailwind.config.js`. Modifica estos archivos para cambiar la paleta de colores de la aplicación.
