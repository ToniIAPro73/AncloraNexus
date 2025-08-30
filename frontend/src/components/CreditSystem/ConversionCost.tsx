// frontend/src/components/CreditSystem/ConversionCost.tsx
import React from 'react';
import { useCreditSystem } from './index';

interface Props {
  fileType: string;
  fileSize: number;
  quality: 'low' | 'medium' | 'high';
}

const ConversionCost: React.FC<Props> = ({ fileType, fileSize, quality }) => {
  const { calculateConversionCost } = useCreditSystem();
  const cost = calculateConversionCost(fileType, fileSize, quality as any);

  return (
    <div className="text-sm text-gray-300">
      Costo estimado de conversiÃ³n: <span className="font-semibold text-white">{cost} crÃ©ditos</span>
    </div>
  );
};

export default ConversionCost;

