// Agregar desde el principio hasta el final:
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { styles } from '../constants/styles';
import { AnalysisCard } from './AnalysisCard';
import { AnalisisCosto } from '../../../types/analysis';

interface RubroProps {
  rubro: {
    id: string;
    nombre: string;
    analisis: AnalisisCosto[];
  };
  isExpanded: boolean;
  onToggle: () => void;
  expandedAnalysis: Record<string, boolean>;
  toggleAnalysis: (id: string) => void;
}

export const RubroCard: React.FC<RubroProps> = ({
  rubro,
  isExpanded,
  onToggle,
  expandedAnalysis,
  toggleAnalysis
}) => {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      {/* Header del Rubro */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors"
        style={{ backgroundColor: styles.colors.headerBg }}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-white" />
          ) : (
            <ChevronRight className="h-4 w-4 text-white" />
          )}
          <span className="text-lg font-medium" style={{ color: styles.colors.primary }}>
            {rubro.id}. {rubro.nombre}
          </span>
        </div>
      </button>

      {/* Contenido expandible del Rubro */}
      {isExpanded && (
        <div className="bg-white">
          <div className="p-4 space-y-2">
            {rubro.analisis.map((analysis) => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
                isExpanded={expandedAnalysis[analysis.id]}
                onToggle={() => toggleAnalysis(analysis.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};