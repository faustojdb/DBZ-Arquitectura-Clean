// src/components/shared/InfoTooltip.tsx
import React, { useState } from 'react';

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Componente que muestra un tooltip informativo al pasar el ratón sobre un ícono de información
 */
const InfoTooltip: React.FC<InfoTooltipProps> = ({ 
  content, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="inline-block relative ml-1">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-blue-400 cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      
      {isVisible && (
        <div className={`absolute z-10 bg-gray-800 text-white p-2 rounded text-xs max-w-xs ${
          position === 'top' ? 'bottom-full mb-2' :
          position === 'bottom' ? 'top-full mt-2' :
          position === 'left' ? 'right-full mr-2' :
          'left-full ml-2'
        }`}>
          {content}
          <div className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 ${
            position === 'top' ? 'bottom-0 -mb-1 left-1/2 -translate-x-1/2' :
            position === 'bottom' ? 'top-0 -mt-1 left-1/2 -translate-x-1/2' :
            position === 'left' ? 'right-0 -mr-1 top-1/2 -translate-y-1/2' :
            'left-0 -ml-1 top-1/2 -translate-y-1/2'
          }`}></div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;