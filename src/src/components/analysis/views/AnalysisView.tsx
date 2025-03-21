// Agregar desde el principio hasta el final:
import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { styles } from '../constants/styles';
import { AnalisisCosto } from '../../../types/analysis';

const AnalysisView: React.FC = () => {
  const [expandedRubros, setExpandedRubros] = useState<Record<string, boolean>>({});
  const [expandedAnalysis, setExpandedAnalysis] = useState<Record<string, boolean>>({});

  const toggleRubro = (rubroId: string) => {
    setExpandedRubros(prev => ({
      ...prev,
      [rubroId]: !prev[rubroId]
    }));
  };

  const toggleAnalysis = (analysisId: string) => {
    setExpandedAnalysis(prev => ({
      ...prev,
      [analysisId]: !prev[analysisId]
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header con botón de nuevo análisis */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-kanit" style={{ color: styles.colors.text }}>
          Análisis de Costos
        </h1>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: styles.colors.primary }}
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Análisis</span>
        </button>
      </div>

      {/* Lista de Rubros */}
      <div className="space-y-2">
        {rubros.map((rubro) => (
          <RubroCard
            key={rubro.id}
            rubro={rubro}
            isExpanded={expandedRubros[rubro.id]}
            onToggle={() => toggleRubro(rubro.id)}
            expandedAnalysis={expandedAnalysis}
            toggleAnalysis={toggleAnalysis}
          />
        ))}
      </div>
    </div>
  );
};

export default AnalysisView;