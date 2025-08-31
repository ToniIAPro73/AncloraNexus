// frontend/src/components/CreditSystem/types.ts

export interface CreditBalance {
  current: number;
  total_purchased: number;
  total_consumed: number;
  plan_credits: number;
  bonus_credits: number;
}

export interface CreditTransaction {
  id: string;
  type: 'conversion' | 'purchase' | 'refund' | 'bonus' | 'consumption';
  amount: number;
  description: string;
  timestamp: Date;
  conversion_id?: string;
}

export type CreditContextType = {
  balance: CreditBalance;
  transactions: CreditTransaction[];
  currency: 'eur' | 'usd';
  calculateConversionCost: (conversionType: string, fileSize: number, quality?: keyof typeof QUALITY_MULTIPLIERS) => number;
  canAffordConversion: (cost: number) => boolean;
  consumeCredits: (cost: number, description: string, conversionId?: string) => boolean;
  addCredits: (amount: number, type: 'purchase' | 'bonus', description: string) => void;
  setCurrency: (currency: 'eur' | 'usd') => void;
  getTransactionHistory: () => CreditTransaction[];
};

// Costos de conversiÃ³n por tipo de archivo
export const CONVERSION_COSTS = {
  txt: 1,
  md: 1,
  docx: 2,
  pdf: 3,
  html: 2,
  csv: 2,
  json: 1,
  image: 3,
  video: 5,
  audio: 4
};

// Multiplicadores por tamaÃ±o de archivo
export const SIZE_MULTIPLIERS = {
  small: 1,    // < 1MB
  medium: 1.5, // 1-10MB
  large: 2,    // 10-100MB
  xlarge: 3    // > 100MB
};

// Multiplicadores por calidad
export const QUALITY_MULTIPLIERS = {
  low: 0.8,
  medium: 1,
  high: 1.5,
  ultra: 2,
  standard: 1,
};

