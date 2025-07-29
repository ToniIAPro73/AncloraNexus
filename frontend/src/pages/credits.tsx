// src/pages/credits.tsx
import React from 'react';
import { CreditProvider, CreditBalance, CreditHistory } from '@/components/CreditSystem';

const CreditsPage: React.FC = () => {
  return (
    <CreditProvider>
      <main className="min-h-screen bg-slate-900 text-white p-6">
        <h1 className="text-4xl font-bold mb-6 text-center">Sistema de Créditos</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <CreditBalance />
          <CreditHistory />
        </div>
      </main>
    </CreditProvider>
  );
};

export default CreditsPage;
