// src/components/presupuestos/components/ExportToPDF.tsx
import React from 'react';

interface ExportToPDFProps {
  elementId: string;
  fileName?: string;
}

/**
 * Componente para exportar un elemento HTML a PDF
 * Nota: Requiere instalación de jspdf y html2canvas:
 * npm install jspdf html2canvas --save
 */
const ExportToPDF: React.FC<ExportToPDFProps> = ({ 
  elementId, 
  fileName = 'presupuesto.pdf' 
}) => {
  const handleExport = async () => {
    try {
      // Importar dinámicamente las librerías (para reducir tamaño inicial del bundle)
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      const element = document.getElementById(elementId);
      
      if (!element) {
        alert('No se encontró el elemento a exportar');
        return;
      }
      
      // Indicador de carga
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50';
      loadingDiv.innerHTML = `
        <div class="bg-white p-5 rounded-lg shadow-lg">
          <div class="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
          <p class="mt-3 text-center">Generando PDF...</p>
        </div>
      `;
      document.body.appendChild(loadingDiv);
      
      try {
        // Crear el canvas a partir del elemento
        const canvas = await html2canvas(element, {
          scale: 2, // Mayor calidad
          useCORS: true, // Permitir imágenes externas
          logging: false, // Desactivar logs
          allowTaint: false,
          backgroundColor: '#ffffff'
        });
        
        // Obtener datos de imagen del canvas
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Crear PDF en formato A4
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Calcular proporciones para mantener aspecto
        const imgWidth = 210; // A4 ancho
        const pageHeight = 297; // A4 alto
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        // Añadir primera página
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Añadir páginas adicionales si es necesario
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        // Guardar el PDF
        pdf.save(fileName);
      } finally {
        // Eliminar indicador de carga
        document.body.removeChild(loadingDiv);
      }
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      alert('Ocurrió un error al generar el PDF. Verifique la consola para más detalles.');
    }
  };
  
  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      title="Exportar a PDF"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M9 15L12 12 15 15"></path>
        <path d="M12 12L12 19"></path>
      </svg>
      <span>Exportar PDF</span>
    </button>
  );
};

export default ExportToPDF;