// src/components/presupuestos/PresupuestoRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importar componentes (estarán vacíos inicialmente)
import PresupuestoList from './PresupuestoList';
import PresupuestoEditor from './PresupuestoEditor';
import PresupuestoViewer from './PresupuestoViewer';

/**
 * Componente que maneja todas las rutas relacionadas con presupuestos
 */
const PresupuestoRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Lista de presupuestos */}
      <Route path="/" element={<PresupuestoList />} />
      
      {/* Crear nuevo presupuesto */}
      <Route path="/nuevo" element={<PresupuestoEditor />} />
      
      {/* Editar presupuesto existente */}
      <Route path="/editar/:presupuestoId" element={<PresupuestoEditor />} />
      
      {/* Visualizar presupuesto para impresión */}
      <Route path="/ver/:presupuestoId" element={<PresupuestoViewer />} />
      
      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
};

export default PresupuestoRoutes;