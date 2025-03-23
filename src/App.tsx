// src/App.tsx
import React, { useState, useEffect } from 'react';
import './styles/toastify.css';
import { ToastContainer } from 'react-toastify';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation,
  useNavigate
} from 'react-router-dom';
import PriceManagement from './components/prices/PriceManagement';
import CostAnalysis from './components/analysis/CostAnalysis';
// Importamos el componente de rutas para presupuestos
import PresupuestoRoutes from './components/presupuestos/PresupuestoRoutes';
// Importamos funciones de autenticación
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const styles = {
  colors: {
    primary: '#F3B340',
    secondary: '#E66A2C',
    accent: '#F094A7',
    text: '#364C63',
    background: '#F4F3EF',
    headerBg: '#1e3a5f'
  }
};

// Componente para redireccionar rutas obsoletas
const LegacyRouteHandler = () => {
  const location = useLocation();
  useEffect(() => {
    console.log('Redirecting from deprecated route:', location.pathname);
  }, [location]);
  
  return <Navigate to="/" replace />;
};

// Componente de navegación
const Navigation = () => {
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

  const handleNavigation = (module) => {
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
      <div className="max-w-10xl mx-auto px-4">
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

function App() {
  const [authInitialized, setAuthInitialized] = useState(false);

  // Inicializar autenticación anónima
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Si no hay usuario autenticado, iniciar sesión anónima
        signInAnonymously(auth)
          .then(() => {
            console.log("Autenticación anónima exitosa");
            setAuthInitialized(true);
          })
          .catch((error) => {
            console.error("Error en autenticación anónima:", error);
            setAuthInitialized(true); // Aún así consideramos la autenticación inicializada
          });
      } else {
        console.log("Usuario ya autenticado:", user.uid);
        setAuthInitialized(true);
      }
    });
    
    // Limpieza del efecto
    return () => unsubscribe();
  }, []);

  // Pantalla de carga mientras se inicializa la autenticación
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: styles.colors.background }}>
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin" 
               style={{ borderColor: styles.colors.primary }}></div>
          <p className="mt-4 text-lg">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen" style={{ backgroundColor: styles.colors.background }}>
        <Routes>
          <Route path="/*" element={
            <>
              <Navigation />
              <main className="max-w-10xl mx-auto px-4">
                <Routes>
                  {/* Ruta principal */}
                  <Route path="/" element={<PriceManagement />} />
                  <Route path="/analysis" element={<CostAnalysis />} />
                  
                  {/* Rutas de presupuestos - Nuevo módulo limpio */}
                  <Route path="/presupuestos/*" element={<PresupuestoRoutes />} />
                  
                  {/* Manejar rutas obsoletas */}
                  <Route path="/analysis/migration" element={<LegacyRouteHandler />} />
                  
                  {/* Capturar todas las rutas no definidas */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </>
          } />
        </Routes>
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;