// frontend/src/components/CreditSystem/types.ts

export interface CreditBalance {
  current: number;
  total: number;
  lastUpdated: string;
}

export interface CreditTransaction {
  id: string;
  type: 'conversion' | 'purchase' | 'refund';
  amount: number;
  description: string;
  timestamp: string;
}

export interface CreditHistoryEntry {
  date: string;
  description: string;
  amount: number;
}

export type CreditContextType = {
  creditBalance: number;
  creditHistory: CreditHistoryEntry[];
  calculateCost: (fileType: string, fileSize: number, quality: string) => number;
};

// Costos de conversión por tipo de archivo
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

// Multiplicadores por tamaño de archivo
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
  ultra: 2
};
