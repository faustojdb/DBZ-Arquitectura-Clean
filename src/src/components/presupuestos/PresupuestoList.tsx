// src/components/presupuestos/PresupuestoList.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePresupuesto from '../../hooks/usePresupuesto';
import { formatCurrency, formatDate } from '../../utils/formatters';

/**
 * Componente que muestra la lista de presupuestos
 */
const PresupuestoList: React.FC = () => {
  const navigate = useNavigate();
  const { presupuestos, loading, error, deletePresupuesto } = usePresupuesto();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Registrar en consola para depuración
  useEffect(() => {
    console.log('Estado de presupuestos:', { loading, error, count: presupuestos?.length || 0 });
    if (presupuestos?.length > 0) {
      console.log('Primer presupuesto:', presupuestos[0]);
    }
    if (error) {
      console.error('Error detallado:', error);
    }
  }, [presupuestos, loading, error]);
  
  // Manejar eliminación de presupuesto
  const handleDelete = async (id: string, titulo: string) => {
    if (isDeleting) return;
    
    if (window.confirm(`¿Está seguro de que desea eliminar el presupuesto "${titulo}"?`)) {
      try {
        console.log(`Iniciando eliminación del presupuesto: ${id}`);
        setIsDeleting(true);
        await deletePresupuesto(id);
        console.log(`Presupuesto ${id} eliminado correctamente`);
        alert('Presupuesto eliminado correctamente');
      } catch (err) {
        console.error('Error al eliminar presupuesto:', err);
        alert('Error al eliminar el presupuesto');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  // Función para obtener un valor seguro para formatear
  const getSafeTotal = (presupuesto) => {
    if (!presupuesto) return 0;
    // Intentar obtener el total desde diferentes ubicaciones posibles
    return presupuesto.totalGeneral || presupuesto.total_general || 0;
  };
  
  // Botón de nuevo presupuesto (reutilizable)
  const NewPresupuestoButton = () => (
    <Link
      to="/presupuestos/nuevo"
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Nuevo Presupuesto
    </Link>
  );
  
  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Presupuestos</h1>
        </div>
        
        <div className="bg-white p-8 rounded shadow-md text-center">
          <div className="inline-block w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Cargando presupuestos...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Presupuestos</h1>
          <NewPresupuestoButton />
        </div>
        
        <div className="bg-white p-8 rounded shadow-md">
          <div className="p-4 bg-red-100 text-red-700 rounded">
            <p className="font-semibold">Error al cargar presupuestos:</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Presupuestos</h1>
        <NewPresupuestoButton />
      </div>
      
      {presupuestos.length === 0 ? (
        <div className="bg-white p-8 rounded shadow-md text-center">
          <p className="text-gray-500 mb-4">
            No hay presupuestos disponibles
          </p>
          <NewPresupuestoButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presupuestos.map(presupuesto => (
            <div key={presupuesto.id} className="bg-white rounded shadow-md overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">{presupuesto.titulo}</h2>
                <p className="text-sm text-gray-500">{formatDate(presupuesto.fecha)}</p>
              </div>
              
              <div className="p-4">
                <p><strong>Comitente:</strong> {presupuesto.comitente}</p>
                <p><strong>Obra:</strong> {presupuesto.obra}</p>
                <p><strong>Tipo:</strong> {presupuesto.tipoEncomenda}</p>
                <p className="mt-2 text-right font-bold">
                  Total: {formatCurrency(getSafeTotal(presupuesto))}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 border-t flex justify-between">
                <div className="flex gap-2">
                  <Link
                    to={`/presupuestos/editar/${presupuesto.id}`}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(presupuesto.id, presupuesto.titulo)}
                    disabled={isDeleting}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:bg-red-300"
                  >
                    Eliminar
                  </button>
                </div>
                
                <Link
                  to={`/presupuestos/ver/${presupuesto.id}`}
                  className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-800"
                >
                  Visualizar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PresupuestoList;