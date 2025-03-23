# Guía para Gestionar Credenciales de Firebase de Forma Segura

## ⚠️ IMPORTANTE: Seguridad de las Credenciales de Firebase ⚠️

El archivo `serviceAccountKey.json` contiene credenciales sensibles que otorgan acceso administrativo a tu proyecto Firebase. Este archivo **NUNCA debe incluirse en un repositorio de código** y debe manejarse con extrema precaución.

## Cómo Generar tu Propio Archivo de Credenciales

Cada desarrollador que configure el proyecto debe generar sus propias credenciales:

1. Ve a la [consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Navega a **Configuración del proyecto** (el ícono de engranaje) > **Cuentas de servicio**
4. Selecciona **Firebase Admin SDK**
5. Haz clic en **Generar nueva clave privada**
6. Guarda el archivo JSON descargado como `serviceAccountKey.json` en la raíz de tu proyecto local
7. **¡NUNCA** subas este archivo a GitHub u otro repositorio público!

## Protegiendo tus Credenciales

### 1. Configura .gitignore

Asegúrate de que el archivo `.gitignore` contenga las siguientes líneas:

```
# Firebase credentials
serviceAccountKey.json
*serviceAccountKey*.json
*.key.json
```

### 2. Verifica que no esté en tu repositorio

Si accidentalmente has subido este archivo al repositorio:

```bash
# Elimina el archivo del control de versiones, pero mantenlo localmente
git rm --cached serviceAccountKey.json

# Haz commit del cambio
git commit -m "Eliminar credenciales sensibles del repositorio"

# Sube el cambio
git push origin main
```

### 3. Rotación de Credenciales

Si crees que tus credenciales se han comprometido:

1. Ve a la [consola de Firebase](https://console.firebase.google.com/)
2. Navega a **Configuración del proyecto** > **Cuentas de servicio**
3. Revoca las claves antiguas y genera nuevas

## Uso del Archivo para Inicializar la Base de Datos

El script `firestore-init.js` requiere este archivo para funcionar. Asegúrate de:

1. Tener el archivo `serviceAccountKey.json` en la raíz del proyecto
2. Verificar que esté incluido en `.gitignore`
3. Ejecutar el script localmente:

```bash
node firestore-init.js
```

## Alternativas en Producción

Para entornos de producción, considera usar:

1. **Variables de entorno**: Configura las credenciales como variables de entorno en tu servidor
2. **Servicios de administración de secretos**: Como AWS Secrets Manager, Google Secret Manager, etc.
3. **Autenticación implícita**: En entornos como Google Cloud, puedes usar la autenticación por defecto (sin necesidad de archivo de credenciales)

## Resumen de Buenas Prácticas

- ✅ Genera tu propio archivo de credenciales
- ✅ Agrégalo a `.gitignore` inmediatamente
- ✅ Nunca compartas este archivo
- ✅ Considera usar variables de entorno en producción
- ✅ Rota las credenciales periódicamente

Siguiendo estas prácticas, mantendrás seguro tu proyecto y prevendrás accesos no autorizados a tu base de datos.
