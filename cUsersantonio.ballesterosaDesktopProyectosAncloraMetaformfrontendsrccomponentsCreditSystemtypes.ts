// frontend/src/components/CreditSystem/types.ts

// Tipos de conversión y sus costes en créditos
export const CONVERSION_COSTS = {
  // Conversiones básicas (1-2 créditos)
  'jpg-png': 1,
  'png-jpg': 1,
  'bmp-jpg': 1,
  'gif-png': 1,
  'webp-jpg': 1,
  'txt-pdf': 1,
  'mp3-wav': 1,
  'wav-mp3': 2,
  'm4a-mp3': 2,
  'csv-xlsx': 2,
  'rtf-docx': 2,
  
  // Conversiones estándar (3-5 créditos)
  'mp4-avi': 3,
  'mov-mp4': 3,
  'wav-flac': 3,
  'aiff-wav': 3,
  'wmv-mp4': 4,
  'flv-mp4': 4,
  'ogg-mp3': 4,
  'xlsx-pdf': 4,
  'docx-html': 4,
  'raw-jpg': 4,
  'psd-png': 5,
  'pptx-pdf': 5,
  'svg-png': 3,
  
  // Conversiones avanzadas (6-10 créditos)
  'video-hd': 6,
  'h264-h265': 8,
  'video-filters': 8,
  'cad-conversion': 8,
  '3d-models': 9,
  'ai-enhancement': 8,
  'batch-processing': 7,
  'multi-step': 7,
  
  // Conversiones profesionales (11-20 créditos)
  'video-4k': 15,
  'audio-mastering': 12,
  'professional-workflows': 18,
  'ai-generative': 20,
  'video-8k': 18,
  'hdr-processing': 16,
  'surround-audio': 14,
  
  // Servicios de IA
  'ai-query-basic': 1,
  'ai-query-advanced': 3,
  'ai-query-specialized': 5,
  'transcription-per-minute': 2,
  'translation-per-page': 5,
  'auto-summary': 8,
  'metadata-generation': 3,
} as const;

// Multiplicadores por tamaño de archivo
export const SIZE_MULTIPLIERS = {
  small: 1.0,    // < 10MB
  medium: 1.3,   // 10-100MB
  large: 1.8,    // 100MB-1GB
  xlarge: 2.5,   // > 1GB
} as const;

// Multiplicadores por calidad
export const QUALITY_MULTIPLIERS = {
  standard: 1.0,
  high: 1.4,
  maximum: 2.0,
} as const;

export interface CreditBalance {
  current: number;
  total_purchased: number;
  total_consumed: number;
  plan_credits: number;
  bonus_credits: number;
}

export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'consumption' | 'refund' | 'bonus';
  amount: number;
  description: string;
  conversion_id?: string;
  timestamp: Date;
}

export interface CreditContextType {
  balance: CreditBalance;
  transactions: CreditTransaction[];
  currency: 'eur' | 'usd';
  calculateConversionCost: (
    conversionType: string,
    fileSize: number,
    quality: keyof typeof QUALITY_MULTIPLIERS
  ) => number;
  canAffordConversion: (cost: number) => boolean;
  consumeCredits: (cost: number, description: string, conversionId?: string) => boolean;
  addCredits: (amount: number, type: 'purchase' | 'bonus', description: string) => void;
  setCurrency: (currency: 'eur' | 'usd') => void;
  getTransactionHistory: () => CreditTransaction[];
}
