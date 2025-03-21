// src/AppRoutes.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PresupuestosLista from './pages/PresupuestosLista';
import PresupuestoPage from './pages/PresupuestoPage';
import Navigation from './components/Navigation';

/**
 * Componente principal de rutas de la aplicación
 */
const AppRoutes = () => {
  return (
    <Router>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pb-8">
        <Routes>
          {/* Ruta principal redirige a presupuestos */}
          <Route path="/" element={<Navigate to="/presupuestos" replace />} />
          
          {/* Rutas de presupuestos */}
          <Route path="/presupuestos" element={<PresupuestosLista />} />
          <Route path="/presupuestos/:presupuestoId" element={<PresupuestoPage />} />
          
          {/* Ruta para cualquier otra URL no definida */}
          <Route path="*" element={<Navigate to="/presupuestos" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppRoutes;