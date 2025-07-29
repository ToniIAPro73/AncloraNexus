// frontend/src/components/CreditSystem/index.tsx
import React, { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { 
  CreditBalance as CreditBalanceType, 
  CreditTransaction, 
  CreditContextType,
  CONVERSION_COSTS,
  SIZE_MULTIPLIERS,
  QUALITY_MULTIPLIERS
} from "./types";

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const useCreditSystem = () => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error("useCreditSystem must be used within a CreditProvider");
  }
  return context;
};

interface CreditProviderProps {
  children: ReactNode;
  initialBalance?: Partial<CreditBalanceType>;
}

export const CreditProvider: React.FC<CreditProviderProps> = ({ 
  children, 
  initialBalance = {} 
}) => {
  const [balance, setBalance] = useState<CreditBalanceType>({
    current: 50, // Plan gratuito: 50 créditos
    total_purchased: 0,
    total_consumed: 0,
    plan_credits: 50,
    bonus_credits: 0,
    ...initialBalance
  });

  const [transactions, setTransactions] = useState<CreditTransaction[]>([
    {
      id: "1",
      type: "bonus",
      amount: 50,
      description: "Créditos gratuitos del plan Explorador Plus",
      timestamp: new Date()
    }
  ]);

  const [currency, setCurrency] = useState<"eur" | "usd">("eur");

  // Memoizar esta función para evitar recálculos innecesarios
  const getSizeMultiplier = useMemo(() => (fileSize: number): number => {
    if (fileSize < 10 * 1024 * 1024) return SIZE_MULTIPLIERS.small;
    if (fileSize < 100 * 1024 * 1024) return SIZE_MULTIPLIERS.medium;
    if (fileSize < 1024 * 1024 * 1024) return SIZE_MULTIPLIERS.large;
    return SIZE_MULTIPLIERS.xlarge;
  }, []);

  const calculateConversionCost = (
    conversionType: string,
    fileSize: number,
    quality: keyof typeof QUALITY_MULTIPLIERS = "standard"
  ): number => {
    // Verificar si el tipo de conversión existe
    const baseCost = CONVERSION_COSTS[conversionType as keyof typeof CONVERSION_COSTS];
    
    // Si no existe, usar un valor predeterminado y registrar una advertencia
    if (baseCost === undefined) {
      console.warn();
      return 5; // Coste predeterminado
    }
    
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
      type: "consumption",
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
    type: "purchase" | "bonus", 
    description: string
  ): void => {
    if (amount <= 0) {
      console.warn("Intentando añadir una cantidad no válida de créditos:", amount);
      return;
    }

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
      total_purchased: type === "purchase" ? prev.total_purchased + amount : prev.total_purchased,
      bonus_credits: type === "bonus" ? prev.bonus_credits + amount : prev.bonus_credits
    }));

    setTransactions(prev => [newTransaction, ...prev]);
  };

  const getTransactionHistory = (): CreditTransaction[] => {
    return transactions;
  };

  // Memoizar el valor del contexto para evitar renderizados innecesarios
  const value = useMemo<CreditContextType>(() => ({
    balance,
    transactions,
    currency,
    calculateConversionCost,
    canAffordConversion,
    consumeCredits,
    addCredits,
    setCurrency,
    getTransactionHistory
  }), [balance, transactions, currency]);

  return (
    <CreditContext.Provider value={value}>
      {children}
    </CreditContext.Provider>
  );
};

export { CONVERSION_COSTS, SIZE_MULTIPLIERS, QUALITY_MULTIPLIERS };

// Exportar los componentes
export { default as CreditBalance } from "./CreditBalance";
export { default as CreditHistory } from "./CreditHistory";
export { default as ConversionCost } from "./ConversionCost";
