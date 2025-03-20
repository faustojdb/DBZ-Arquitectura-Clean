// src/components/shared/Navigation.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationProps {
  styles: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      text: string;
      background: string;
      headerBg: string;
    }
  }
}

const Navigation: React.FC<NavigationProps> = ({ styles }) => {
  const [currentModule, setCurrentModule] = useState('prices');
  const navigate = useNavigate();
  const location = useLocation();

  // Determinar el módulo actual basado en la URL al montar el componente
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/presupuestos')) {
      setCurrentModule('budget');
    } else if (path.includes('/analysis')) {
      setCurrentModule('analysis');
    } else {
      setCurrentModule('prices');
    }
  }, [location.pathname]);

  const handleNavigation = (module: string) => {
    setCurrentModule(module);
    switch (module) {
      case 'prices':
        navigate('/');
        break;
      case 'analysis':
        navigate('/analysis');
        break;
      case 'budget':
        navigate('/presupuestos');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow mb-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="text-xl font-semibold" style={{ 
            color: styles.colors.text,
            fontFamily: 'Kanit'
          }}>
            DBZ Arquitectura
          </div>
          <div className="flex space-x-6">
            <button
              className={`px-6 py-3 rounded text-lg transition-colors ${
                currentModule === 'prices' 
                  ? 'text-white' 
                  : 'hover:bg-gray-100'
              }`}
              style={{ 
                backgroundColor: currentModule === 'prices' ? styles.colors.primary : 'transparent',
                color: currentModule === 'prices' ? 'white' : styles.colors.text,
                fontFamily: 'Josefin Sans'
              }}
              onClick={() => handleNavigation('prices')}
            >
              Gestión de Precios
            </button>
            <button
              className={`px-6 py-3 rounded text-lg transition-colors ${
                currentModule === 'analysis' 
                  ? 'text-white' 
                  : 'hover:bg-gray-100'
              }`}
              style={{ 
                backgroundColor: currentModule === 'analysis' ? styles.colors.primary : 'transparent',
                color: currentModule === 'analysis' ? 'white' : styles.colors.text,
                fontFamily: 'Josefin Sans'
              }}
              onClick={() => handleNavigation('analysis')}
            >
              Análisis de Costos
            </button>
            <button
              className={`px-6 py-3 rounded text-lg transition-colors ${
                currentModule === 'budget' 
                  ? 'text-white' 
                  : 'hover:bg-gray-100'
              }`}
              style={{ 
                backgroundColor: currentModule === 'budget' ? styles.colors.primary : 'transparent',
                color: currentModule === 'budget' ? 'white' : styles.colors.text,
                fontFamily: 'Josefin Sans'
              }}
              onClick={() => handleNavigation('budget')}
            >
              Presupuestos
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;