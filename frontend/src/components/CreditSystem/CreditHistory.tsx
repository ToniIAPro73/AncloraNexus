    // frontend/src/components/CreditSystem/CreditHistory.tsx
    import React from 'react';
    import { useCreditSystem } from './index';

    const CreditHistory: React.FC = () => {
    const { creditHistory } = useCreditSystem();

    return (
        <div className="p-4 bg-slate-800 rounded-lg shadow text-white">
        <h3 className="text-h3 font-semibold mb-2">Historial de Créditos</h3>
        <ul className="space-y-1 text-sm">
            {creditHistory.map((entry, index) => (
            <li key={index}>
                <span className="font-medium">{entry.date}</span>: {entry.description} ({entry.amount > 0 ? '+' : ''}{entry.amount})
            </li>
            ))}
        </ul>
        </div>
    );
    };

    export default CreditHistory;
