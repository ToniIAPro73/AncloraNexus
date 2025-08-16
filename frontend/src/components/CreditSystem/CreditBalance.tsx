// frontend/src/components/CreditSystem/CreditBalance.tsx
import React from 'react';
import { useCreditSystem } from './index';

const CreditBalance: React.FC = () => {
  const { creditBalance } = useCreditSystem();

  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow text-white">
      <h3 className="text-h3 font-semibold mb-2">Saldo de Créditos</h3>
      <p className="text-3xl font-bold">{creditBalance} 💳</p>
    </div>
  );
};

export default CreditBalance;
