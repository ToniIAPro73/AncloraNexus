    // frontend/src/components/CreditSystem/CreditHistory.tsx
    import React from 'react';
    import { useCreditSystem } from './index';

    const CreditHistory: React.FC = () => {
    const { transactions } = useCreditSystem();

    return (
        <div className="p-4 bg-slate-800 rounded-lg shadow text-white">
        <h3 className="text-h3 font-semibold mb-2">Historial de Créditos</h3>
        <ul className="space-y-1 text-sm">
            {transactions.map((t) => (
            <li key={t.id}>
                <span className="font-medium">{t.timestamp.toLocaleString()}</span>: {t.description} ({t.amount > 0 ? '+' : ''}{t.amount})
            </li>
            ))}
        </ul>
        </div>
    );
    };

    export default CreditHistory;
