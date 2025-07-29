// frontend/src/components/CreditSystem/CreditBalance.tsx
import React, { useMemo } from 'react';
import { useCreditSystem } from './index';

const CreditBalance: React.FC = () => {
  const { balance, currency } = useCreditSystem();

  // Memoizar el cálculo del valor de créditos para evitar recálculos innecesarios
  const creditValue = useMemo(() => {
    const pricePerCredit = currency === 'eur' ? 0.074 : 0.080;
    const value = balance.current * pricePerCredit;
    const symbol = currency === 'eur' ? '€' : '$';
    return `${symbol}${value.toFixed(2)}`;
  }, [balance.current, currency]);

  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow text-white">
      <h3 className="text-lg font-semibold mb-2">Saldo de Créditos</h3>
      <p className="text-3xl font-bold">{balance.current} 💳</p>
      
      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Valor equivalente:</span>
          <div className="font-medium text-white">
            {creditValue}
          </div>
        </div>
        <div>
          <span className="text-gray-400">Total consumido:</span>
          <div className="font-medium text-white">
            {balance.total_consumed.toLocaleString()}
          </div>
        </div>
      </div>

      {balance.current < 10 && (
        <div className="mt-3 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-orange-300 font-medium">Saldo bajo</p>
              <p className="text-orange-200 text-sm">Considera comprar más créditos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditBalance;
