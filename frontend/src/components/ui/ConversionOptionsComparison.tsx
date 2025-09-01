import React, { useState } from 'react';
import { 
  Zap, Clock, Star, TrendingUp, ArrowRight, CheckCircle, 
  AlertCircle, Info, CreditCard, Eye, Download 
} from 'lucide-react';

interface ConversionOption {
  steps: string[];
  cost: number;
  quality: number;
  description: string;
  advantages: string[];
  time_estimate: string;
  recommended?: boolean;
  quality_improvement?: number;
  cost_increase?: number;
}

interface ConversionAnalysis {
  direct: ConversionOption;
  optimized?: ConversionOption;
  recommendation: {
    type: 'direct' | 'optimized';
    reason: string;
    confidence: 'high' | 'medium' | 'low';
  };
}

interface ConversionOptionsComparisonProps {
  analysis: ConversionAnalysis;
  onOptionSelect: (option: 'direct' | 'optimized') => void;
  selectedOption: 'direct' | 'optimized' | null;
  onPreview?: (option: 'direct' | 'optimized') => void;
  className?: string;
}

export const ConversionOptionsComparison: React.FC<ConversionOptionsComparisonProps> = ({
  analysis,
  onOptionSelect,
  selectedOption,
  onPreview,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const renderConversionSteps = (steps: string[]) => (
    <div className="flex items-center gap-2 text-sm">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <span className="bg-slate-700 px-2 py-1 rounded text-xs font-mono">
            {step.toUpperCase()}
          </span>
          {index < steps.length - 1 && (
            <ArrowRight size={14} className="text-slate-400" />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderQualityBar = (quality: number) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${
            quality >= 90 ? 'bg-green-500' : 
            quality >= 75 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${quality}%` }}
        />
      </div>
      <span className="text-sm font-medium text-white">{quality}%</span>
    </div>
  );

  const renderOptionCard = (
    option: ConversionOption, 
    type: 'direct' | 'optimized',
    title: string,
    subtitle: string
  ) => (
    <div 
      className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${
        selectedOption === type
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
          : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
      }`}
      onClick={() => onOptionSelect(type)}
    >
      {/* Badge recomendado */}
      {option.recommended && (
        <div className="absolute -top-3 left-4 bg-primary text-white text-xs px-3 py-1 rounded-full font-bold">
          ⭐ Recomendado
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-primary font-bold">
            <CreditCard size={16} />
            <span>{option.cost}</span>
          </div>
          <div className="text-xs text-slate-400">créditos</div>
        </div>
      </div>

      {/* Secuencia de conversión */}
      <div className="mb-4">
        <div className="text-sm text-slate-300 mb-2">Proceso:</div>
        {renderConversionSteps(option.steps)}
      </div>

      {/* Calidad */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-300">Calidad esperada:</span>
          <span className="text-white font-medium">{option.quality}%</span>
        </div>
        {renderQualityBar(option.quality)}
      </div>

      {/* Tiempo estimado */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <Clock size={14} />
        <span>{option.time_estimate}</span>
      </div>

      {/* Ventajas */}
      <div className="space-y-2">
        {option.advantages.slice(0, 2).map((advantage, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-slate-300">{advantage}</span>
          </div>
        ))}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2 mt-4">
        {onPreview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(type);
            }}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Eye size={14} />
            Preview
          </button>
        )}
        <button
          onClick={() => onOptionSelect(type)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            selectedOption === type
              ? 'bg-primary text-white'
              : 'bg-slate-600 hover:bg-slate-500 text-white'
          }`}
        >
          {selectedOption === type ? 'Seleccionado' : 'Seleccionar'}
        </button>
      </div>

      {/* Indicador de selección */}
      {selectedOption === type && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <CheckCircle size={16} className="text-white" />
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con recomendación */}
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            analysis.recommendation.confidence === 'high' ? 'bg-green-500/20' :
            analysis.recommendation.confidence === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
          }`}>
            <Info size={20} className={
              analysis.recommendation.confidence === 'high' ? 'text-green-400' :
              analysis.recommendation.confidence === 'medium' ? 'text-yellow-400' : 'text-blue-400'
            } />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white mb-1">Recomendación del Sistema</h3>
            <p className="text-sm text-slate-300">{analysis.recommendation.reason}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                Confianza: {analysis.recommendation.confidence}
              </span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                Recomendado: {analysis.recommendation.type === 'direct' ? 'Conversión Directa' : 'Secuencia Optimizada'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparación de opciones */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Opción directa */}
        {renderOptionCard(
          analysis.direct,
          'direct',
          'Conversión Directa',
          'Rápida y eficiente'
        )}

        {/* Opción optimizada */}
        {analysis.optimized && renderOptionCard(
          analysis.optimized,
          'optimized',
          'Secuencia Optimizada',
          `+${analysis.optimized.quality_improvement}% calidad`
        )}
      </div>

      {/* Comparación detallada */}
      {analysis.optimized && (
        <div className="bg-slate-800/30 rounded-lg border border-slate-700">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-700/30 transition-colors"
          >
            <span className="font-medium text-white">Comparación Detallada</span>
            <div className={`transform transition-transform ${showDetails ? 'rotate-90' : ''}`}>
              <ArrowRight size={16} className="text-slate-400" />
            </div>
          </button>
          
          {showDetails && (
            <div className="px-4 pb-4 border-t border-slate-700">
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-sm text-slate-300">Velocidad</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Directa: {analysis.direct.time_estimate}<br/>
                    {analysis.optimized && `Optimizada: ${analysis.optimized.time_estimate}`}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-2">💎</div>
                  <div className="text-sm text-slate-300">Calidad</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Directa: {analysis.direct.quality}%<br/>
                    {analysis.optimized && `Optimizada: ${analysis.optimized.quality}%`}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-sm text-slate-300">Costo</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Directa: {analysis.direct.cost} créditos<br/>
                    {analysis.optimized && `Optimizada: ${analysis.optimized.cost} créditos`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Información adicional */}
      {!analysis.optimized && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-300 mb-1">Conversión Óptima</h4>
              <p className="text-sm text-blue-200">
                La conversión directa es la opción óptima para esta combinación de formatos.
                No hay secuencias alternativas que mejoren significativamente el resultado.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
