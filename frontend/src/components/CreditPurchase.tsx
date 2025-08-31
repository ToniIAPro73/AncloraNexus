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
      name: 'Empresa',
      price: 99.99,
      credits: 2000,
      features: ['2000 créditos mensuales', 'Todo incluido', 'Soporte dedicado', 'Integración personalizada'],
    }
  ];

  const handlePurchase = async (packageId: number) => {
    setIsLoading(true);
    try {
      const response = await apiService.purchaseCredits(packageId);
      setMessage(`¡Compra exitosa! Nuevo saldo: ${response.new_balance} créditos`);
    } catch (error) {
      setMessage('Error al procesar la compra. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.subscribeToPlan(planId);
      setMessage(`¡Suscripción exitosa! Plan: ${response.plan_name}`);
    } catch (error) {
      setMessage('Error al procesar la suscripción. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Compra créditos o actualiza tu plan de suscripción
        </h2>
        <p className="text-slate-400">Elige la opción que mejor se adapte a tus necesidades</p>
      </div>

      {/* Saldo actual */}
      <div className="bg-slate-700/50 rounded-lg p-4 mb-8 flex items-center justify-between">
        <div>
          <p className="text-slate-300">créditos disponibles</p>
          <p className="text-3xl font-bold text-white">{user?.credits || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* Paquetes de créditos */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-white mb-4">Paquetes de créditos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {creditPackages.map((pkg, index) => (
            <button
              key={index}
              onClick={() => handlePurchase(index)}
              disabled={isLoading}
              className={`bg-slate-700 hover:bg-slate-600 transition-colors rounded-lg p-4 flex flex-col items-center justify-between h-full border-2 ${
                pkg.popular ? 'border-cyan-500' : 'border-transparent'
              }`}
              aria-label={`Comprar ${pkg.credits} créditos por €${pkg.price}`}
            >
              {pkg.popular && (
                <div className="bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                  POPULAR
                </div>
              )}
              
              <div className="flex items-baseline mb-2">
                <span className="text-2xl font-bold text-white">{pkg.credits}</span>
                {pkg.bonus > 0 && (
                  <span className="text-green-400 text-sm ml-1">+{pkg.bonus}</span>
                )}
              </div>
              
              <div className="text-slate-400 text-sm mb-2">créditos</div>
              
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg py-1 px-3 mt-2">
                €{pkg.price}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Planes de suscripción */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Planes de suscripción</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-slate-700 rounded-xl overflow-hidden border-2 ${
                plan.popular ? 'border-purple-500' : 'border-transparent'
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-1 font-medium">
                  RECOMENDADO
                </div>
              )}
              
              <div className="p-6">
                <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-white">€{plan.price}</span>
                  <span className="text-slate-400 text-sm ml-1">/mes</span>
                </div>
                
                <div className="flex items-baseline mb-6">
                  <span className="text-2xl font-bold text-cyan-400">{plan.credits}</span>
                  <span className="text-slate-400 text-sm ml-1">créditos/mes</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading}
                  className={`w-full py-2 rounded-lg font-medium ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-slate-600 text-white hover:bg-slate-500'
                  } transition-colors`}
                >
                  Suscribirse
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h4 className="text-h4 font-medium text-white mb-2">¿Cómo funcionan los créditos?</h4>
          <ul className="text-slate-300 text-sm space-y-1">
            <li>• Cada conversión consume créditos según la complejidad</li>
            <li>• Los créditos no expiran</li>
            <li>• Conversiones básicas: 1-2 créditos</li>
            <li>• Conversiones avanzadas: 3-10 créditos</li>
          </ul>
        </div>
        
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h4 className="text-h4 font-medium text-white mb-2">Ventajas de la suscripción</h4>
          <ul className="text-slate-300 text-sm space-y-1">
            <li>• Créditos renovados mensualmente</li>
            <li>• Descuentos en créditos adicionales</li>
            <li>• Acceso a funciones premium</li>
            <li>• Soporte prioritario</li>
          </ul>
        </div>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-lg ${message.includes('Error') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
          {message}
        </div>
      )}
    </div>
  );
};