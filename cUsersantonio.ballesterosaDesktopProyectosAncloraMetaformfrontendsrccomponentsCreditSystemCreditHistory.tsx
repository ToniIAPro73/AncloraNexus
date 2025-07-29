// frontend/src/components/CreditSystem/CreditHistory.tsx
import React, { useMemo } from 'react';
import { useCreditSystem } from './index';
import { CreditTransaction } from './types';

const CreditHistory: React.FC = () => {
  const { transactions } = useCreditSystem();

  // Memoizar las estadísticas para evitar recálculos en cada renderizado
  const stats = useMemo(() => {
    return {
      purchases: transactions.filter(t => t.type === 'purchase').length,
      conversions: transactions.filter(t => t.type === 'consumption').length,
      bonuses: transactions.filter(t => t.type === 'bonus').length
    };
  }, [transactions]);

  // Funciones de utilidad memoizadas
  const getTypeColor = useMemo(() => (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase': return 'text-green-400';
      case 'consumption': return 'text-red-400';
      case 'bonus': return 'text-blue-400';
      case 'refund': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  }, []);

  const getTypeIcon = useMemo(() => (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase': return '💳';
      case 'consumption': return '⚡';
      case 'bonus': return '🎁';
      case 'refund': return '↩️';
      default: return '📝';
    }
  }, []);

  const getTypeLabel = useMemo(() => (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase': return 'Compra';
      case 'consumption': return 'Conversión';
      case 'bonus': return 'Créditos del plan';
      case 'refund': return 'Reembolso';
      default: return type;
    }
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow text-white">
      <h3 className="text-lg font-semibold mb-4">Historial de Créditos</h3>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4 text-center mb-4 p-3 bg-slate-700/30 rounded-lg">
        <div>
          <div className="text-xl font-bold text-green-400">
            {stats.purchases}
          </div>
          <div className="text-gray-400 text-sm">Compras</div>
        </div>
        <div>
          <div className="text-xl font-bold text-red-400">
            {stats.conversions}
          </div>
          <div className="text-gray-400 text-sm">Conversiones</div>
        </div>
        <div>
          <div className="text-xl font-bold text-blue-400">
            {stats.bonuses}
          </div>
          <div className="text-gray-400 text-sm">Bonus</div>
        </div>
      </div>
      
      {/* Lista de transacciones */}
      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4 opacity-50">📝</div>
            <p className="text-gray-400">No hay transacciones aún</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div 
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-600/40 rounded-lg transition-colors border border-slate-700/30"
            >
              {/* Lado izquierdo - Icono y detalles */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400">{getTypeIcon(transaction.type)}</span>
                </div>
                
                <div>
                  <p className="text-white font-medium">
                    {getTypeLabel(transaction.type)} → {transaction.amount > 0 ? '+' : ''}{Math.abs(transaction.amount)} créditos
                  </p>
                  <p className="text-gray-400 text-sm">
                    {formatDate(transaction.timestamp)} • {transaction.description}
                  </p>
                </div>
              </div>

              {/* Lado derecho - Estado */}
              <div className="text-right">
                <span className={`text-sm font-medium ${getTypeColor(transaction.type)}`}>
                  Completado
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CreditHistory;
