import React, { useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../auth/AuthContext';

interface CreditPackage {
  credits: number;
  price: number;
  bonus: number;
  popular?: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

export const CreditPurchase: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, refreshUser } = useAuth();

  const creditPackages: CreditPackage[] = [
    { credits: 50, price: 4.99, bonus: 0 },
    { credits: 100, price: 8.99, bonus: 10, popular: true },
    { credits: 250, price: 19.99, bonus: 50 },
    { credits: 500, price: 34.99, bonus: 100 },
    { credits: 1000, price: 59.99, bonus: 250 },
  ];

  const plans: Plan[] = [
    {
      id: 'BASIC',
      name: 'Básico',
      price: 9.99,
      credits: 100,
      features: ['100 créditos mensuales', 'Todas las conversiones', 'Soporte prioritario', 'Sin marca de agua'],
    },
    {
      id: 'PRO',
      name: 'Profesional',
      price: 29.99,
      credits: 500,
      features: ['500 créditos mensuales', 'Conversiones ilimitadas', 'API access', 'Workflows personalizados'],
      popular: true,
    },
    {
      id: 'ENTERPRISE',
      name: 'Empresarial',
      price: 99.99,
      credits: 2000,
      features: ['2000 créditos mensuales', 'Todo incluido', 'Soporte dedicado', 'Integración personalizada'],
    },
  ];

  const handlePurchaseCredits = async (amount: number) => {
    try {
      setIsLoading(true);
      setMessage('');
      
      const response = await apiService.purchaseCredits(amount);
      setMessage(`¡Compra exitosa! Nuevo saldo: ${response.new_balance} créditos`);
      
      // Actualizar información del usuario
      await refreshUser();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    try {
      setIsLoading(true);
      setMessage('');
      
      const response = await apiService.upgradePlan(planId);
      setMessage(`¡Plan actualizado exitosamente! ${response.message}`);
      
      // Actualizar información del usuario
      await refreshUser();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-h1 text-white mb-2">
          💳 Gestión de Créditos
        </h1>
        <p className="text-slate-300">
          Compra créditos o actualiza tu plan de suscripción
        </p>
      </div>

      {/* Saldo actual */}
      {user && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Saldo Actual</h2>
            <div className="text-4xl font-bold text-blue-400 mb-2">{user.credits}</div>
            <p className="text-slate-300">créditos disponibles</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Plan actual: </span>
                <span className="text-blue-400 font-medium">{user.plan_info.name}</span>
              </div>
              <div>
                <span className="text-slate-400">Usados hoy: </span>
                <span className="text-white">{user.credits_used_today}</span>
              </div>
              <div>
                <span className="text-slate-400">Total conversiones: </span>
                <span className="text-white">{user.total_conversions}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de estado */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.includes('Error') 
            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
            : 'bg-green-500/10 border-green-500/30 text-green-400'
        }`}>
          {message}
        </div>
      )}

      {/* Paquetes de créditos */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h2 className="text-h2 text-white mb-6 text-center">
          🎯 Paquetes de Créditos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {creditPackages.map((pkg, index) => (
          <div
            key={index}
            tabIndex={0}
            role="button"
            aria-label={`Comprar ${pkg.credits} créditos por €${pkg.price}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePurchaseCredits(pkg.credits);
              }
            }}
            className={`card relative transition-all duration-200 hover:scale-105 ${
              pkg.popular ? 'border-primary' : ''
            }`}
          >
              {pkg.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              )}

              <div className="card-body text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {pkg.credits + pkg.bonus}
                </div>
                <div className="text-slate-400 text-sm mb-2">créditos</div>
                
                {pkg.bonus > 0 && (
                  <div className="text-green-400 text-xs mb-2">
                    +{pkg.bonus} bonus
                  </div>
                )}
                
                <div className="text-lg font-bold text-blue-400 mb-3">
                  €{pkg.price}
                </div>
                
                <button
                  onClick={() => handlePurchaseCredits(pkg.credits)}
                  disabled={isLoading}
                  className="btn btn-primary w-full text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Comprando...' : 'Comprar'}
                </button>
          </div>
        </div>
      ))}
        </div>
      </div>

      {/* Planes de suscripción */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h2 className="text-h2 text-white mb-6 text-center">
          🚀 Planes de Suscripción
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            tabIndex={0}
            role="button"
            aria-label={`Seleccionar plan ${plan.name} por €${plan.price}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleUpgradePlan(plan.id);
              }
            }}
            className={`card relative transition-all duration-200 ${
              plan.popular ? 'border-primary scale-105' : ''
            }`}
          >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm px-3 py-1 rounded-full">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="card-body">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    €{plan.price}
                  </div>
                  <div className="text-slate-400 text-sm">por mes</div>
                </div>

                <div className="mb-6">
                  <div className="text-center mb-4">
                    <span className="text-lg font-bold text-green-400">{plan.credits}</span>
                    <span className="text-slate-400 text-sm ml-1">créditos/mes</span>
                  </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-slate-300">
                      <span className="text-green-400 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => handleUpgradePlan(plan.id)}
                disabled={isLoading || user?.plan === plan.id}
                className={`btn w-full font-medium transition-colors ${
                  user?.plan === plan.id
                    ? 'btn-secondary cursor-not-allowed opacity-50'
                    : 'btn-primary'
                }`}
              >
                {user?.plan === plan.id 
                  ? 'Plan Actual' 
                  : isLoading 
                  ? 'Actualizando...' 
                  : 'Seleccionar Plan'
                }
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-bold text-white mb-4">ℹ️ Información sobre Créditos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div>
            <h4 className="font-medium text-white mb-2">¿Cómo funcionan los créditos?</h4>
            <ul className="space-y-1">
              <li>• Cada conversión consume créditos según la complejidad</li>
              <li>• Los créditos no expiran</li>
              <li>• Conversiones básicas: 1-2 créditos</li>
              <li>• Conversiones avanzadas: 3-10 créditos</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Ventajas de los planes</h4>
            <ul className="space-y-1">
              <li>• Créditos mensuales automáticos</li>
              <li>• Descuentos en créditos adicionales</li>
              <li>• Funciones exclusivas</li>
              <li>• Soporte prioritario</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

