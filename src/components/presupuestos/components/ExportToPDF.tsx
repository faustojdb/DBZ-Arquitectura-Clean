// src/components/presupuestos/components/ExportToPDF.jsx
import React from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ExportToPDF = ({ elementId, fileName = 'documento.pdf' }) => {
  // A4 dimensions in mm: 210 x 297
  const pageWidth = 210;
  const pageHeight = 297;
  
  // Margin of 2.5cm = 25mm
  const margin = 25;
  const contentWidth = pageWidth - (margin * 2);

  const handleExport = async () => {
    try {
      // Obtener el elemento a exportar
      const element = document.getElementById(elementId);
      if (!element) {
        alert('Elemento no encontrado');
        return;
      }
      
      // Crear un clon del elemento para aplicar estilos específicos para PDF
      const clonedElement = element.cloneNode(true);
      document.body.appendChild(clonedElement);
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '-9999px';
      clonedElement.style.width = `${pageWidth * 3.78}px`; // Factor de conversión aproximado mm a px
      
      // Ajustar tamaños de fuente en el clon para mejor legibilidad
      const allTextElements = clonedElement.querySelectorAll('td, th, p, span, div');
      allTextElements.forEach(el => {
        el.style.fontSize = '14px'; // Tamaño base para la mayoría del texto
        
        // Si es un encabezado, usar un tamaño mayor
        if (el.tagName === 'TH' || el.style.fontWeight === 'bold' || 
            el.classList.contains('dbz-title') || el.classList.contains('arquitectura-title')) {
          el.style.fontSize = '16px';
        }
      });
      
      // Ajustar encabezados específicos
      const mainTitles = clonedElement.querySelectorAll('.dbz-title');
      mainTitles.forEach(el => {
        el.style.fontSize = '24px';
      });
      
      // Configuraciones mejoradas para html2canvas
      const canvas = await html2canvas(clonedElement, {
        scale: 2, // Escala más alta para mejor calidad
        useCORS: true, // Permitir imágenes de otros dominios
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: clonedElement.offsetWidth,
        height: clonedElement.offsetHeight
      });
      
      // Limpiar el clon después de la captura
      document.body.removeChild(clonedElement);
      
      // Crear nuevo documento PDF orientación vertical (A4)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calcular la relación de aspecto para mantenerla al escalar
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Para manejar múltiples páginas
      let heightLeft = imgHeight;
      let position = 0;
      
      // Primera página
      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 2 * margin);
      
      // Añadir páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position + margin, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 2 * margin);
      }
      
      // Guardar el archivo PDF
      pdf.save(fileName);
      
      console.log(`PDF exportado correctamente: ${fileName}`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al exportar PDF. Consulta la consola para más detalles.');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      title="Exportar a PDF"
    >
      Exportar PDF
    </button>
  );
};

export default ExportToPDF;