import React, { createContext, useContext, useState, ReactNode } from 'react';

// Tipos de conversión y sus costes en créditos
export const CONVERSION_COSTS = {
  // ... mismo contenido que antes (omito para abreviar)
};

// Multiplicadores por tamaño de archivo
export const SIZE_MULTIPLIERS = {
  // ... mismo contenido que antes (omito para abreviar)
};

// Multiplicadores por calidad
export const QUALITY_MULTIPLIERS = {
  // ... mismo contenido que antes (omito para abreviar)
};

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
  
  export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

