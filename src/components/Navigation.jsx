// src/components/Navigation.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Componente de navegación principal
 */
const Navigation = () => {
  const [currentModule, setCurrentModule] = useState('');
  const location = useLocation();

  // Determinar el módulo actual basado en la URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/presupuestos')) {
      setCurrentModule('presupuestos');
    } else if (path.includes('/analisis')) {
      setCurrentModule('analisis');
    } else if (path.includes('/precios')) {
      setCurrentModule('precios');
    }
  }, [location.pathname]);

  return (
    <nav className="bg-white shadow-md print:hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="text-xl font-semibold text-gray-700">
            DBZ Arquitectura
          </div>
          
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`px-4 py-2 rounded ${
                currentModule === 'precios' 
                  ? 'bg-yellow-400 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Gestión de Precios
            </Link>
            
            <Link
              to="/analisis"
              className={`px-4 py-2 rounded ${
                currentModule === 'analisis' 
                  ? 'bg-yellow-400 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Análisis de Costos
            </Link>
            
            <Link
              to="/presupuestos"
              className={`px-4 py-2 rounded ${
                currentModule === 'presupuestos' 
                  ? 'bg-yellow-400 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Presupuestos
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;