import React from 'react';

const PlaceholderImages = () => {
  return (
    <div className="space-y-8 p-6 bg-gray-100 rounded-lg">
      <div>
        <h2 className="text-xl font-bold mb-4">Imágenes requeridas para el proyecto</h2>
        <p className="mb-4">
          Para el correcto funcionamiento de la aplicación, debes crear dos imágenes y colocarlas en la carpeta <code className="bg-gray-200 px-2 py-1 rounded">public/assets/</code>:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">1. Logo</h3>
            <div className="bg-gray-200 h-32 w-64 mb-4 flex items-center justify-center">
              <div className="bg-blue-600 text-white font-bold py-2 px-4 rounded">
                LOGO
              </div>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Nombre de archivo: <code className="bg-gray-100 px-1">logo-dbz.png</code></li>
              <li>Tamaño recomendado: 320x160 píxeles</li>
              <li>Formatos aceptados: PNG (preferido), JPG, SVG</li>
              <li>Este logo aparecerá en la cabecera de los presupuestos</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">2. Firma</h3>
            <div className="bg-gray-200 h-32 w-64 mb-4 flex items-center justify-center">
              <div className="italic text-gray-600 border-b-2 border-gray-600 px-4">
                Firma
              </div>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Nombre de archivo: <code className="bg-gray-100 px-1">firma.png</code></li>
              <li>Tamaño recomendado: 300x150 píxeles</li>
              <li>Fondo transparente (PNG)</li>
              <li>Esta firma aparecerá al final de los presupuestos</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-semibold mb-2">Instrucciones para crear estas imágenes:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Puedes crear estas imágenes con herramientas como Photoshop, GIMP, Canva o similar</li>
          <li>Si no tienes estas imágenes aún, puedes usar temporalmente placeholders como los mostrados arriba</li>
          <li>Asegúrate de guardar las imágenes con los nombres exactos mencionados</li>
          <li>Coloca ambas imágenes en la carpeta <code className="bg-gray-200 px-2 py-1 rounded">public/assets/</code> de tu proyecto</li>
          <li>Si la carpeta no existe, créala dentro de <code className="bg-gray-200 px-2 py-1 rounded">public/</code></li>
        </ol>
      </div>
    </div>
  );
};

export default PlaceholderImages;