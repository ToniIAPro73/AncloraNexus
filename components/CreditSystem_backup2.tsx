import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface CreditBalance {
  current: number;
  total_purchased: number;
  total_consumed: number;
  plan_credits: number;
  bonus_credits: number;
}

interface CreditTransaction {
  id: string;
  type: 'purchase' | 'consumption' | 'refund' | 'bonus';
  amount: number;
  description: string;
  conversion_id?: string;
  timestamp: Date;
}

interface CreditContextType {
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

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const useCreditSystem = () => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error('useCreditSystem must be used within a CreditProvider');
  }
  return context;
};

interface CreditProviderProps {
  children: ReactNode;
  initialBalance?: Partial<CreditBalance>;
}

export const CreditProvider: React.FC<CreditProviderProps> = ({ 
  children, 
  initialBalance = {} 
}) => {
  const [balance, setBalance] = useState<CreditBalance>({
    current: 50, // Plan gratuito: 50 créditos
    total_purchased: 0,
    total_consumed: 0,
    plan_credits: 50,
    bonus_credits: 0,
    ...initialBalance
  });

  const [transactions, setTransactions] = useState<CreditTransaction[]>([
    {
      id: '1',
      type: 'bonus',
      amount: 50,
      description: 'Créditos gratuitos del plan Explorador Plus',
      timestamp: new Date()
    }
  ]);

  const [currency, setCurrency] = useState<'eur' | 'usd'>('eur');

  const getSizeMultiplier = (fileSize: number): number => {
    if (fileSize < 10 * 1024 * 1024) return SIZE_MULTIPLIERS.small;
    if (fileSize < 100 * 1024 * 1024) return SIZE_MULTIPLIERS.medium;
    if (fileSize < 1024 * 1024 * 1024) return SIZE_MULTIPLIERS.large;
    return SIZE_MULTIPLIERS.xlarge;
  };

  const calculateConversionCost = (
    conversionType: string,
    fileSize: number,
    quality: keyof typeof QUALITY_MULTIPLIERS = 'standard'
  ): number => {
    const baseCost = CONVERSION_COSTS[conversionType as keyof typeof CONVERSION_COSTS] || 5;
    const sizeMultiplier = getSizeMultiplier(fileSize);
    const qualityMultiplier = QUALITY_MULTIPLIERS[quality];
    
    return Math.ceil(baseCost * sizeMultiplier * qualityMultiplier);
  };

  const canAffordConversion = (cost: number): boolean => {
    return balance.current >= cost;
  };

  const consumeCredits = (
    cost: number, 
    description: string, 
    conversionId?: string
  ): boolean => {
    if (!canAffordConversion(cost)) {
      return false;
    }

    const newTransaction: CreditTransaction = {
      id: Date.now().toString(),
      type: 'consumption',
      amount: -cost,
      description,
      conversion_id: conversionId,
      timestamp: new Date()
    };

    setBalance(prev => ({
      ...prev,
      current: prev.current - cost,
      total_consumed: prev.total_consumed + cost
    }));

    setTransactions(prev => [newTransaction, ...prev]);
    return true;
  };

  const addCredits = (
    amount: number, 
    type: 'purchase' | 'bonus', 
    description: string
  ): void => {
    const newTransaction: CreditTransaction = {
      id: Date.now().toString(),
      type,
      amount,
      description,
      timestamp: new Date()
    };

    setBalance(prev => ({
      ...prev,
      current: prev.current + amount,
      total_purchased: type === 'purchase' ? prev.total_purchased + amount : prev.total_purchased,
      bonus_credits: type === 'bonus' ? prev.bonus_credits + amount : prev.bonus_credits
    }));

    setTransactions(prev => [newTransaction, ...prev]);
  };

  const getTransactionHistory = (): CreditTransaction[] => {
    return transactions;
  };

  const value: CreditContextType = {
    balance,
    transactions,
    currency,
    calculateConversionCost,
    canAffordConversion,
    consumeCredits,
    addCredits,
    setCurrency,
    getTransactionHistory
  };

  return (
    <CreditContext.Provider value={value}>
      {children}
    </CreditContext.Provider>
  );
};

// Componente para mostrar el saldo de créditos
export const CreditBalance: React.FC = () => {
  const { balance, currency } = useCreditSystem();

  const getCreditValue = (credits: number): string => {
    const pricePerCredit = currency === 'eur' ? 0.074 : 0.080;
    const value = credits * pricePerCredit;
    const symbol = currency === 'eur' ? '€' : '$';
    return `${symbol}${value.toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Saldo de Créditos</h3>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-blue-600">
            {balance.current.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">créditos</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Valor equivalente:</span>
          <div className="font-medium text-gray-900">
            {getCreditValue(balance.current)}
          </div>
        </div>
        <div>
          <span className="text-gray-600">Total consumido:</span>
          <div className="font-medium text-gray-900">
            {balance.total_consumed.toLocaleString()}
          </div>
        </div>
      </div>

      {balance.current < 10 && (
        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-orange-800 font-medium">Saldo bajo</p>
              <p className="text-orange-700 text-sm">Considera comprar más créditos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para mostrar el coste de una conversión
interface ConversionCostProps {
  conversionType: string;
  fileSize: number;
  quality?: keyof typeof QUALITY_MULTIPLIERS;
  fileName?: string;
}

export const ConversionCost: React.FC<ConversionCostProps> = ({
  conversionType,
  fileSize,
  quality = 'standard',
  fileName
}) => {
  const { calculateConversionCost, canAffordConversion, currency } = useCreditSystem();
  
  const cost = calculateConversionCost(conversionType, fileSize, quality);
  const canAfford = canAffordConversion(cost);
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getCreditValue = (credits: number): string => {
    const pricePerCredit = currency === 'eur' ? 0.074 : 0.080;
    const value = credits * pricePerCredit;
    const symbol = currency === 'eur' ? '€' : '$';
    return `${symbol}${value.toFixed(3)}`;
  };

  return (
    <div className={`p-4 rounded-lg border ${
      canAfford 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">Coste de Conversión</h4>
        <div className="flex items-center space-x-2">
          <span className={`text-lg font-bold ${
            canAfford ? 'text-green-600' : 'text-red-600'
          }`}>
            {cost} créditos
          </span>
          <span className="text-sm text-gray-500">
            ({getCreditValue(cost)})
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          <span>Archivo: </span>
          <span className="font-medium">{fileName || 'archivo'}</span>
        </div>
        <div>
          <span>Tamaño: </span>
          <span className="font-medium">{formatFileSize(fileSize)}</span>
        </div>
        <div>
          <span>Conversión: </span>
          <span className="font-medium">{conversionType}</span>
        </div>
        <div>
          <span>Calidad: </span>
          <span className="font-medium capitalize">{quality}</span>
        </div>
      </div>

      {!canAfford && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded">
          <p className="text-red-800 text-sm font-medium">
            Créditos insuficientes. Necesitas {cost - canAffordConversion(cost) ? 0 : cost} créditos más.
          </p>
        </div>
      )}
    </div>
  );
};

// Componente para el historial de transacciones

export const CreditHistory: React.FC = () => {
  const { getTransactionHistory } = useCreditSystem();
  const transactions = getTransactionHistory();

  const getTypeColor = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'consumption': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'bonus': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'refund': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getTypeIcon = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase': return '💳';
      case 'consumption': return '⚡';
      case 'bonus': return '🎁';
      case 'refund': return '↩️';
      default: return '📝';
    }
  };

  const getTypeLabel = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase': return 'Compra';
      case 'consumption': return 'Conversión';
      case 'bonus': return 'Bonus';
      case 'refund': return 'Reembolso';
      default: return type;
    }
  };

  return (
    <div className="flex justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-unified-primary mb-3">
            📊 Historial de Créditos
          </h1>
          <p className="text-unified-secondary text-lg">
            Registro completo de todas tus transacciones
          </p>
        </div>

        {/* Main Content Card */}
        <div className="card-unified">
          {/* Stats Header */}
          <div className="p-6 border-b border-slate-700/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{transactions.filter(t => t.type === 'purchase').length}</div>
                <div className="text-unified-secondary text-sm">Compras</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{transactions.filter(t => t.type === 'consumption').length}</div>
                <div className="text-unified-secondary text-sm">Conversiones</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{transactions.filter(t => t.type === 'bonus').length}</div>
                <div className="text-unified-secondary text-sm">Bonus</div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4 opacity-50">📝</div>
                <h3 className="text-xl font-semibold text-unified-primary mb-2">
                  Sin transacciones aún
                </h3>
                <p className="text-unified-muted">
                  Tus transacciones aparecerán aquí cuando realices conversiones o compres créditos
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {transactions.map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 bg-slate-700/20 hover:bg-slate-600/30 rounded-xl transition-all duration-200 border border-slate-700/30 hover:border-slate-600/50"
                  >
                    {/* Left Side - Icon and Details */}
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">{getTypeIcon(transaction.type)}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(transaction.type)}`}>
                            {getTypeLabel(transaction.type)}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                              Reciente
                            </span>
                          )}
                        </div>
                        
                        <p className="text-unified-primary font-medium text-base mb-1">
                          {transaction.description}
                        </p>
                        
                        <p className="text-unified-muted text-sm">
                          {transaction.timestamp.toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Right Side - Amount */}
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xl font-bold ${
                        transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                      <div className="text-unified-muted text-sm">
                        {Math.abs(transaction.amount) === 1 ? 'crédito' : 'créditos'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {transactions.length > 0 && (
            <div className="p-4 border-t border-slate-700/30 bg-slate-800/30 text-center">
              <p className="text-unified-muted text-sm">
                Mostrando {transactions.length} {transactions.length === 1 ? 'transacción' : 'transacciones'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          <button className="btn-unified-secondary px-6 py-3">
            📊 Exportar historial
          </button>
          <button className="btn-unified-primary px-6 py-3">
            💳 Comprar créditos
          </button>
        </div>
      </div>
    </div>
  );
};

