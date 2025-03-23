import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { toast } from 'react-toastify';

/**
 * Componente de botón para actualizar precios de materiales en un análisis
 * 
 * @param {Object} analysis - El análisis cuyos precios se actualizarán
 * @param {Array} availableItems - Lista de materiales con precios actualizados
 * @param {Function} onAnalysisUpdated - Callback para cuando el análisis se actualiza
 */
const UpdatePricesButton = ({ analysis, availableItems, onAnalysisUpdated }) => {
  const [loading, setLoading] = useState(false);

  /**
   * Verifica si hay cambios de precios entre los insumos y los materiales actuales
   */
  const checkPriceChanges = () => {
    if (!analysis?.insumos || !availableItems?.length) return false;
    
    // Para cada insumo, verificar si hay un cambio de precio
    for (const key in analysis.insumos) {
      const insumo = analysis.insumos[key];
      const materialId = insumo.item_id;
      
      // Buscar el material actualizado
      const currentMaterial = availableItems.find(m => m.id === materialId);
      
      // Si encontramos el material y su precio es diferente, hay un cambio
      if (currentMaterial && currentMaterial.precio_unitario !== insumo.precio_unitario) {
        return true;
      }
    }
    
    // No se encontraron cambios
    return false;
  };

  /**
   * Maneja la actualización de precios
   */
  const handleUpdatePrices = async () => {
    if (!analysis?.id || !analysis?.insumos) {
      toast.error("No hay análisis para actualizar");
      return;
    }
    
    try {
      setLoading(true);
      
      // Crear una copia profunda de los insumos para no modificar el estado directamente
      const updatedInsumos = JSON.parse(JSON.stringify(analysis.insumos));
      let costoTotalActualizado = 0;
      let cambiosRealizados = false;
      const detallesCambios = [];
      
      // Para cada insumo, actualizar su precio si el material correspondiente existe
      for (const key in updatedInsumos) {
        const insumo = updatedInsumos[key];
        const materialId = insumo.item_id;
        
        // Buscar el material actualizado
        const currentMaterial = availableItems.find(m => m.id === materialId);
        
        if (currentMaterial) {
          // Guardar el precio anterior para mostrar el cambio
          const precioAnterior = insumo.precio_unitario;
          
          // Si el precio es diferente, actualizarlo
          if (currentMaterial.precio_unitario !== insumo.precio_unitario) {
            insumo.precio_unitario = currentMaterial.precio_unitario;
            // Recalcular el subtotal
            insumo.subtotal = insumo.cantidad * insumo.coeficiente * currentMaterial.precio_unitario;
            
            cambiosRealizados = true;
            detallesCambios.push({
              material: currentMaterial.descripcion || materialId,
              precioAnterior,
              precioNuevo: currentMaterial.precio_unitario
            });
          }
        }
        
        // Sumar al costo total independientemente de si cambió o no
        costoTotalActualizado += insumo.subtotal;
      }
      
      // Si no se hicieron cambios, notificar y salir
      if (!cambiosRealizados) {
        toast.info("Los precios ya están actualizados");
        setLoading(false);
        return;
      }
      
      // Actualizar en la base de datos
      const analysisRef = doc(db, 'analisis', analysis.id);
      await updateDoc(analysisRef, {
        insumos: updatedInsumos,
        costo_total: costoTotalActualizado,
        fecha_actualizacion: serverTimestamp()
      });
      
      // Notificar los cambios realizados
      toast.success(`Se actualizaron los precios de ${detallesCambios.length} materiales`);
      
      // Mostrar detalles de los cambios (opcional)
      if (detallesCambios.length > 0) {
        console.table(detallesCambios);
      }
      
      // Notificar al componente padre que se actualizó el análisis
      if (onAnalysisUpdated) {
        onAnalysisUpdated({
          ...analysis,
          insumos: updatedInsumos,
          costo_total: costoTotalActualizado
        });
      }
      
    } catch (error) {
      console.error("Error al actualizar precios:", error);
      toast.error(`Error al actualizar precios: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si hay cambios de precios
  const hasChanges = checkPriceChanges();

  return (
    <button
      className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
        hasChanges 
          ? 'bg-blue-500 hover:bg-blue-600 text-white' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      onClick={handleUpdatePrices}
      disabled={loading || !hasChanges}
      title={hasChanges ? "Hay cambios de precios pendientes" : "No hay cambios de precios pendientes"}
    >
      <RefreshCw 
        size={16} 
        className={loading ? "animate-spin" : ""} 
      />
      {loading 
        ? "Actualizando..." 
        : hasChanges 
          ? "Actualizar precios" 
          : "Precios actualizados"
      }
    </button>
  );
};

export default UpdatePricesButton;