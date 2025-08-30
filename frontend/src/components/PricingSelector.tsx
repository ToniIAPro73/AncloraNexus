import React, { useState } from 'react';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: { eur: number; usd: number };
  annualPrice: { eur: number; usd: number };
  credits: number;
  features: string[];
  popular?: boolean;
  enterprise?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Explorador Plus',
    description: 'Gateway de AdquisiciÃ³n Gratuito',
    monthlyPrice: { eur: 0, usd: 0 },
    annualPrice: { eur: 0, usd: 0 },
    credits: 50,
    features: [
      '50 crÃ©ditos mensuales',
      'Conversiones bÃ¡sicas',
      'Archivos hasta 25MB',
      '5 consultas IA bÃ¡sicas',
      'Certificaciones bÃ¡sicas'
    ]
  },
  {
    id: 'pro',
    name: 'Profesional IA',
    description: 'Para profesionales creativos',
    monthlyPrice: { eur: 34.99, usd: 37.99 },
    annualPrice: { eur: 29.99, usd: 32.49 },
    credits: 500,
    features: [
      '500 crÃ©ditos mensuales',
      'CatÃ¡logo completo 150+ formatos',
      'Archivos hasta 1GB',
      'Agente IA avanzado ilimitado',
      'Conversiones multi-paso',
      'API 10,000 llamadas/mes',
      'Certificaciones SOC 2',
      'Soporte prioritario 4h'
    ],
    popular: true
  },
  {
    id: 'business',
    name: 'Estudio Inteligente',
    description: 'Para equipos y empresas',
    monthlyPrice: { eur: 79.99, usd: 86.99 },
    annualPrice: { eur: 67.99, usd: 73.99 },
    credits: 1500,
    features: [
      '1,500 crÃ©ditos mensuales',
      'Todas las funcionalidades Pro',
      'Archivos sin lÃ­mite de tamaÃ±o',
      'Agente IA personalizable',
      'API 100,000 llamadas/mes',
      'Integraciones directas',
      'Conversiones por lotes',
      'Workflows automatizados',
      'Analytics avanzados',
      'Soporte especializado 2h'
    ]
  },
  {
    id: 'enterprise',
    name: 'Plataforma Corporativa',
    description: 'Para grandes organizaciones',
    monthlyPrice: { eur: 269.99, usd: 293.99 },
    annualPrice: { eur: 229.99, usd: 249.99 },
    credits: 5000,
    features: [
      '5,000 crÃ©ditos mensuales',
      'Todas las funcionalidades Business',
      'Agente IA entrenado personalizado',
      'API dedicada sin lÃ­mites',
      'ImplementaciÃ³n on-premise',
      'Certificaciones personalizadas',
      'Cumplimiento regulatorio',
      'ConsultorÃ­a tÃ©cnica 20h/mes',
      'Gerente de cuenta dedicado',
      'SLA 99.9% garantizado'
    ],
    enterprise: true
  }
];

const creditPackages = [
  { credits: 100, eur: 8.29, usd: 8.99, discount: 0 },
  { credits: 500, eur: 36.79, usd: 39.99, discount: 11 },
  { credits: 1500, eur: 92.09, usd: 99.99, discount: 26 },
  { credits: 5000, eur: 275.99, usd: 299.99, discount: 34 },
  { credits: 15000, eur: 736.99, usd: 799.99, discount: 41 }
];

type Currency = 'eur' | 'usd';
type BillingCycle = 'monthly' | 'annual';

export const PricingSelector: React.FC = () => {
  const [currency, setCurrency] = useState<Currency>('eur');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [showCredits, setShowCredits] = useState(false);

  const formatPrice = (price: number, curr: Currency) => {
    const symbol = curr === 'eur' ? 'â‚¬' : '$';
    return `${symbol}${price.toFixed(2)}`;
  };

  const getPrice = (plan: PricingPlan) => {
    return billingCycle === 'monthly' 
      ? plan.monthlyPrice[currency]
      : plan.annualPrice[currency];
  };

  const getAnnualSavings = (plan: PricingPlan) => {
    const monthly = plan.monthlyPrice[currency] * 12;
    const annual = plan.annualPrice[currency];
    return Math.round(((monthly - annual) / monthly) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-h2 font-bold text-unified-primary mb-4">
          Elige tu Plan Anclora
        </h2>
        <p className="text-xl text-unified-secondary mb-8">
          Transparencia total, flexibilidad mÃ¡xima, precios justos
        </p>

        {/* Currency and Billing Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
          {/* Currency Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Moneda:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrency('eur')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currency === 'eur'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                EUR (â‚¬)
              </button>
              <button
                onClick={() => setCurrency('usd')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currency === 'usd'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">FacturaciÃ³n:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Anual
                <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Ahorra hasta 15%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans vs Credits Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowCredits(false)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                !showCredits
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Planes de SuscripciÃ³n
            </button>
            <button
              onClick={() => setShowCredits(true)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                showCredits
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Paquetes de CrÃ©ditos
            </button>
          </div>
        </div>
      </div>

      {!showCredits ? (
        /* Subscription Plans */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative pricing-card card-unified shadow-lg border-2 transition-all hover:shadow-xl ${
                plan.popular
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-slate-600/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    MÃ¡s Popular
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-h3 font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="mb-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {formatPrice(getPrice(plan), currency)}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {plan.id !== 'free' && `por ${billingCycle === 'monthly' ? 'mes' : 'mes (anual)'}`}
                    </div>
                    {billingCycle === 'annual' && plan.id !== 'free' && (
                      <div className="text-green-600 text-sm font-medium mt-1">
                        Ahorra {getAnnualSavings(plan)}%
                      </div>
                    )}
                  </div>

                  <div className="text-center mb-4">
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {plan.credits.toLocaleString()} crÃ©ditos/mes
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : plan.enterprise
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.id === 'free' ? 'Comenzar Gratis' : 
                   plan.enterprise ? 'Contactar Ventas' : 'Comenzar Prueba'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Credit Packages */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {creditPackages.map((pkg, index) => (
            <div
              key={index}
              className="pricing-card card-unified shadow-lg p-6 hover:shadow-xl transition-all"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-unified-primary mb-2">
                  {pkg.credits.toLocaleString()}
                </div>
                <div className="text-unified-secondary text-sm mb-4">crÃ©ditos</div>
                
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {formatPrice(currency === 'eur' ? pkg.eur : pkg.usd, currency)}
                </div>
                
                <div className="text-gray-500 text-sm mb-4">
                  {formatPrice((currency === 'eur' ? pkg.eur : pkg.usd) / pkg.credits, currency)}/crÃ©dito
                </div>

                {pkg.discount > 0 && (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    Ahorra {pkg.discount}%
                  </div>
                )}

                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Comprar CrÃ©ditos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Features Comparison */}
      <div className="mt-16 text-center">
        <h3 className="text-h3 font-bold text-gray-900 mb-4">
          CaracterÃ­sticas de los CrÃ©ditos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-h4 font-semibold text-gray-900 mb-2">Sin ExpiraciÃ³n</h4>
            <p className="text-gray-600 text-sm text-center">Los crÃ©ditos nunca caducan</p>
          </div>
          
          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h4 className="text-h4 font-semibold text-gray-900 mb-2">Transferibles</h4>
            <p className="text-gray-600 text-sm text-center">Comparte entre cuentas del mismo dominio</p>
          </div>
          
          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-h4 font-semibold text-gray-900 mb-2">Transparentes</h4>
            <p className="text-gray-600 text-sm text-center">Coste exacto mostrado antes de conversiÃ³n</p>
          </div>
          
          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h4 className="text-h4 font-semibold text-gray-900 mb-2">Flexibles</h4>
            <p className="text-gray-600 text-sm text-center">Usa solo lo que necesitas</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <h3 className="text-h3 font-bold text-gray-900 mb-6 text-center">
          Preguntas Frecuentes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-h4 font-semibold text-gray-900 mb-2">Â¿Puedo cambiar de plan en cualquier momento?</h4>
            <p className="text-gray-600 text-sm">SÃ­, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente.</p>
          </div>
          <div>
            <h4 className="text-h4 font-semibold text-gray-900 mb-2">Â¿QuÃ© sucede si no uso todos mis crÃ©ditos?</h4>
            <p className="text-gray-600 text-sm">Los crÃ©ditos no utilizados se acumulan al mes siguiente. Nunca pierdes crÃ©ditos pagados.</p>
          </div>
          <div>
            <h4 className="text-h4 font-semibold text-gray-900 mb-2">Â¿Puedo comprar crÃ©ditos adicionales?</h4>
            <p className="text-gray-600 text-sm">SÃ­, puedes comprar paquetes de crÃ©ditos adicionales en cualquier momento con descuentos por volumen.</p>
          </div>
          <div>
            <h4 className="text-h4 font-semibold text-gray-900 mb-2">Â¿Hay descuentos para facturaciÃ³n anual?</h4>
            <p className="text-gray-600 text-sm">SÃ­, obtienes hasta 15% de descuento al pagar anualmente en lugar de mensualmente.</p>
          </div>
        </div>
      </div>
    </div>
  );
};


