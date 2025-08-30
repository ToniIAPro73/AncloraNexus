import React from 'react';
import { ConversionPath } from '../utils/advancedConversionEngine';

interface ConversionRouteDisplayProps {
  primaryPath: ConversionPath;
  alternativePaths?: ConversionPath[];
  onSelectPath?: (path: ConversionPath) => void;
  selectedPath?: ConversionPath;
}

export const ConversionRouteDisplay: React.FC<ConversionRouteDisplayProps> = ({
  primaryPath,
  alternativePaths = [],
  onSelectPath,
  selectedPath
}) => {
  const renderPath = (path: ConversionPath, isPrimary: boolean = false, isSelected: boolean = false) => {
    const getQualityColor = (quality: number) => {
      if (quality >= 90) return 'text-green-600';
      if (quality >= 75) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getStepColor = (steps: number) => {
      if (steps === 1) return 'bg-green-100 text-green-800';
      if (steps <= 2) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    };

    return (
      <div
        key={path.path.join('-')}
        className={`
          p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
          ${isPrimary ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
          ${isSelected ? 'ring-2 ring-blue-400' : ''}
          hover:border-blue-300 hover:shadow-md
        `}
        onClick={() => onSelectPath?.(path)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isPrimary && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
                RECOMENDADA
              </span>
            )}
            <span className={`px-2 py-1 text-xs font-medium rounded ${getStepColor(path.steps)}`}>
              {path.steps === 1 ? 'DIRECTA' : `${path.steps} PASOS`}
            </span>
            {!path.isRecommended && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                COMPLEJA
              </span>
            )}
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${getQualityColor(path.estimatedQuality)}`}>
              {path.estimatedQuality}%
            </div>
            <div className="text-xs text-gray-500">calidad</div>
          </div>
        </div>

        {/* Ruta visual */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto">
          {path.path.map((format, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center min-w-0">
                <div className={`
                  px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                  ${index === 0 ? 'bg-blue-100 text-blue-800' : 
                    index === path.path.length - 1 ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-700'}
                `}>
                  {format.toUpperCase()}
                </div>
              </div>
              {index < path.path.length - 1 && (
                <div className="flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* InformaciÃ³n adicional */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>â±ï¸ ~{path.estimatedTime}s</span>
          <span>{path.description}</span>
        </div>

        {/* Advertencia si existe */}
        {path.warningMessage && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            âš ï¸ {path.warningMessage}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold text-gray-800 mb-4">
        Rutas de ConversiÃ³n Disponibles
      </div>

      {/* Ruta principal */}
      {renderPath(primaryPath, true, selectedPath?.path.join('-') === primaryPath.path.join('-'))}

      {/* Rutas alternativas */}
      {alternativePaths.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-600">
            Rutas Alternativas ({alternativePaths.length})
          </div>
          {alternativePaths.map((path) => 
            renderPath(path, false, selectedPath?.path.join('-') === path.path.join('-'))
          )}
        </div>
      )}

      {/* InformaciÃ³n adicional */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span><strong>ConversiÃ³n directa:</strong> MÃ¡xima calidad y velocidad</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span><strong>Ruta optimizada:</strong> Buena calidad, tiempo moderado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span><strong>Ruta compleja:</strong> Calidad reducida, mÃ¡s tiempo</span>
          </div>
        </div>
      </div>
    </div>
  );
};


