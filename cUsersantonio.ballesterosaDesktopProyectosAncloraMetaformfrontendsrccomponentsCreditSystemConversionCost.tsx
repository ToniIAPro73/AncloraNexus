// frontend/src/components/CreditSystem/ConversionCost.tsx
import React, { useMemo } from 'react';
import { useCreditSystem } from './index';
import { QUALITY_MULTIPLIERS } from './types';

interface Props {
  fileType: string;
  fileSize: number;
  quality: keyof typeof QUALITY_MULTIPLIERS;
  fileName?: string;
}

const ConversionCost: React.FC<Props> = ({ 
  fileType, 
  fileSize, 
  quality = 'standard',
  fileName 
}) => {
  const { calculateConversionCost, canAffordConversion, balance, currency } = useCreditSystem();
  
  // Memoizar el cálculo del costo para evitar recálculos innecesarios
  const cost = useMemo(() => 
    calculateConversionCost(fileType, fileSize, quality), 
    [fileType, fileSize, quality, calculateConversionCost]
  );
  
  const canAfford = canAffordConversion(cost);
  
  // Memoizar el formateo del tamaño del archivo
  const formattedFileSize = useMemo(() => {
    if (fileSize < 1024) return `${fileSize} B`;
    if (fileSize < 1024 * 1024) return `${(fileSize / 1024).toFixed(1)} KB`;
    if (fileSize < 1024 * 1024 * 1024) return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
    return `${(fileSize / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }, [fileSize]);

  // Memoizar el cálculo del valor de créditos
  const creditValue = useMemo(() => {
    const pricePerCredit = currency === 'eur' ? 0.074 : 0.080;
    const value = cost * pricePerCredit;
    const symbol = currency === 'eur' ? '€' : '$';
    return `${symbol}${value.toFixed(3)}`;
  }, [cost, currency]);

  // Calcular créditos adicionales necesarios si no puede permitirse la conversión
  const additionalCreditsNeeded = useMemo(() => 
    Math.max(0, cost - balance.current),
    [cost, balance.current]
  );

  return (
    <div className={`text-sm p-4 rounded-lg border ${
      canAfford 
        ? 'bg-green-500/10 border-green-500/30 text-white' 
        : 'bg-red-500/10 border-red-500/30 text-white'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">Costo estimado de conversión:</h4>
        <div className="flex items-center space-x-2">
          <span className={`text-lg font-bold ${
            canAfford ? 'text-green-400' : 'text-red-400'
          }`}>
            {cost} créditos
          </span>
          <span className="text-sm text-gray-400">
            ({creditValue})
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
        <div>
          <span>Archivo: </span>
          <span className="font-medium">{fileName || 'archivo'}</span>
        </div>
        <div>
          <span>Tamaño: </span>
          <span className="font-medium">{formattedFileSize}</span>
        </div>
        <div>
          <span>Conversión: </span>
          <span className="font-medium">{fileType}</span>
        </div>
        <div>
          <span>Calidad: </span>
          <span className="font-medium capitalize">{quality}</span>
        </div>
      </div>

      {!canAfford && (
        <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded">
          <p className="text-red-300 text-sm font-medium">
            Créditos insuficientes. Necesitas {additionalCreditsNeeded} créditos más.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConversionCost;
