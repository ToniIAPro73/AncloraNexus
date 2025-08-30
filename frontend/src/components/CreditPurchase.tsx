import React, { useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

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
  const { user } = useAuth();

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
      name: 'BÃ¡sico',
      price: 9.99,
      credits: 100,
      features: ['100 crÃ©ditos mensuales', 'Todas las conversiones', 'Soporte prioritario', 'Sin marca de agua'],
    },
    {
      id: 'PRO',
      name: 'Profesional',
      price: 29.99,
      credits: 500,
      features: ['500 crÃ©ditos mensuales', 'Conversiones ilimitadas', 'API access', 'Workflows personalizados'],
      popular: true,
    },
    {
      id: 'ENTERPRISE',
      name: 'Empresarial',
      price: 99.99,
      credits: 2000,
      features: ['2000 crÃ©ditos mensuales', 'Todo incluido', 'Soporte dedicado', 'IntegraciÃ³n personalizada'],
    },
  ];

  const handlePurchaseCredits = async (amount: number) => {
    try {
      setIsLoading(true);
      setMessage('');
      
      const response = await apiService.purchaseCredits(amount);
      setMessage(`Â¡Compra exitosa! Nuevo saldo: ${response.new_balance} crÃ©ditos`);
      
      // Actualizar informaciÃ³n del usuario
      // TODO: refrescar perfil si se implementa
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
      setMessage(`Â¡Plan actualizado exitosamente! ${response.message}`);
      
      // Actualizar informaciÃ³n del usuario
      // TODO: refrescar perfil si se implementa
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
          ðŸ’³ GestiÃ³n de CrÃ©ditos
        </h1>
        <p className="text-slate-300">
          Compra crÃ©ditos o actualiza tu plan de suscripciÃ³n
        </p>
      </div>

      {/* Saldo actual */}
      {user && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="text-center">
            <h2 className="text-h2 font-bold text-white mb-2">Saldo Actual</h2>
            <div className="text-4xl font-bold text-blue-400 mb-2">{user.credits}</div>
            <p className="text-slate-300">crÃ©ditos disponibles</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Plan actual: </span>
                <span className="text-blue-400 font-medium">{user.plan_info?.name || 'free'}</span>
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

      {/* Paquetes de crÃ©ditos */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h2 className="text-h2 text-white mb-6 text-center">
          ðŸŽ¯ Paquetes de CrÃ©ditos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {creditPackages.map((pkg, index) => (
          <div
            key={index}
            tabIndex={0}
            role="button"
            aria-label={`Comprar ${pkg.credits} crÃ©ditos por â‚¬${pkg.price}`}
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
                <div className="text-slate-400 text-sm mb-2">crÃ©ditos</div>
                
                {pkg.bonus > 0 && (
                  <div className="text-green-400 text-xs mb-2">
                    +{pkg.bonus} bonus
                  </div>
                )}
                
                <div className="text-lg font-bold text-blue-400 mb-3">
                  â‚¬{pkg.price}
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

      {/* Planes de suscripciÃ³n */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h2 className="text-h2 text-white mb-6 text-center">
          ðŸš€ Planes de SuscripciÃ³n
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            tabIndex={0}
            role="button"
            aria-label={`Seleccionar plan ${plan.name} por â‚¬${plan.price}`}
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
                    MÃ¡s Popular
                  </span>
                </div>
              )}

              <div className="card-body">
                <div className="text-center mb-4">
                  <h3 className="text-h3 font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    â‚¬{plan.price}
                  </div>
                  <div className="text-slate-400 text-sm">por mes</div>
                </div>

                <div className="mb-6">
                  <div className="text-center mb-4">
                    <span className="text-lg font-bold text-green-400">{plan.credits}</span>
                    <span className="text-slate-400 text-sm ml-1">crÃ©ditos/mes</span>
                  </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-slate-300">
                      <span className="text-green-400 mr-2">âœ“</span>
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

      {/* InformaciÃ³n adicional */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-h3 font-bold text-white mb-4">â„¹ï¸ InformaciÃ³n sobre CrÃ©ditos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div>
            <h4 className="text-h4 font-medium text-white mb-2">Â¿CÃ³mo funcionan los crÃ©ditos?</h4>
            <ul className="space-y-1">
              <li>â€¢ Cada conversiÃ³n consume crÃ©ditos segÃºn la complejidad</li>
              <li>â€¢ Los crÃ©ditos no expiran</li>
              <li>â€¢ Conversiones bÃ¡sicas: 1-2 crÃ©ditos</li>
              <li>â€¢ Conversiones avanzadas: 3-10 crÃ©ditos</li>
            </ul>
          </div>
          <div>
            <h4 className="text-h4 font-medium text-white mb-2">Ventajas de los planes</h4>
            <ul className="space-y-1">
              <li>â€¢ CrÃ©ditos mensuales automÃ¡ticos</li>
              <li>â€¢ Descuentos en crÃ©ditos adicionales</li>
              <li>â€¢ Funciones exclusivas</li>
              <li>â€¢ Soporte prioritario</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};


