# DBZ Arquitectura - Sistema de Gestión de Presupuestos

Un sistema completo para la gestión de materiales, análisis de costos y generación de presupuestos en el ámbito de la arquitectura y construcción.

## 🚨 Importante: Seguridad de Credenciales 🚨

Este proyecto requiere configurar credenciales de Firebase. **NUNCA** subas el archivo `serviceAccountKey.json` u otras credenciales al repositorio. Consulta la [Guía para Gestionar Credenciales de Firebase](docs/CREDENTIALS.md) para más información.

## Características Principales

- Gestión de precios y materiales
- Análisis de costos unitarios con componentes
- Generación de presupuestos completos
- Exportación a PDF
- Interfaz responsive y moderna

## Tecnologías Principales

- React + TypeScript
- Firebase (Firestore)
- Vite
- Tailwind CSS
- React Router

## Documentación

Para entender y configurar el proyecto, consulta:

- [Guía Rápida de Inicio](docs/SETUP.md)
- [Guía para Gestionar Credenciales](docs/CREDENTIALS.md)
- [Guía de Despliegue en Producción](docs/DEPLOYMENT.md)

## Requisitos

- Node.js 16.x o superior
- Cuenta en Firebase
- Git

## Instalación

1. Clona el repositorio
   ```bash
   git clone https://github.com/tu-usuario/proyecto-ac.git
   cd proyecto-ac
   ```

2. Instala las dependencias
   ```bash
   npm install
   ```

3. Configura Firebase (consulta la [Guía Rápida](docs/SETUP.md))

4. Inicia el servidor de desarrollo
   ```bash
   npm run dev
   ```

## Configuración Personalizada

El proyecto está diseñado para permitir una personalización sencilla:

- Categorías y rubros genéricos en `src/components/analysis/constants/`
- Estilos personalizables en `src/components/prices/materialsStyles.js`
- Imágenes personalizables en `public/assets/`

## Licencia

[MIT](LICENSE)

## Contacto

Para soporte o consultas, contacta a [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com)
