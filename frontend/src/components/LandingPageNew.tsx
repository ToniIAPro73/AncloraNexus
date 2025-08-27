import React, { useState, useEffect } from 'react';
import { FileText, Zap, Shield, Star, ArrowRight, Download, Upload, Settings, CheckCircle, BookOpen, Moon, Sun, Monitor, Menu, X } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    let effectiveTheme = newTheme;
    if (newTheme === 'auto') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    setThemeMenuOpen(false);
  };

  const conversions = [
    { from: 'PDF', to: 'DOC', category: 'Documentos' },
    { from: 'JPG', to: 'PNG', category: 'Imágenes' },
    { from: 'DOCX', to: 'PDF', category: 'Documentos' },
    { from: 'PNG', to: 'JPG', category: 'Imágenes' },
    { from: 'TXT', to: 'PDF', category: 'Documentos' },
    { from: 'HTML', to: 'PDF', category: 'Web' }
  ];

  const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Múltiples Formatos",
      description: "Convierte entre TXT, PDF, DOC, DOCX, HTML, MD, RTF, ODT, TEX, JPG, PNG, GIF y más. Soporte completo para documentos e imágenes."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Rápido y Eficiente",
      description: "Conversiones instantáneas con la mejor calidad. Procesa tus archivos en segundos, no en minutos."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Seguro y Privado",
      description: "Tus archivos se procesan de manera segura y se eliminan automáticamente. Tu privacidad es nuestra prioridad."
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Anclora Press",
      description: "Herramienta avanzada para la creación y publicación de libros digitales profesionales."
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Importación de Datos",
      description: "Carga tus archivos desde múltiples fuentes (TXT, PDF, DOC, DOCX, JPG, PNG, GIF, HTML, MD, RTF, ODT, TEX) con solo unos clics."
    },
    {
      number: 2,
      title: "Normalización Automática",
      description: "Nuestro AI analiza y corrige inconsistencias, duplicados y formatos incorrectos."
    },
    {
      number: 3,
      title: "Validación y Calidad",
      description: "Revisa los resultados con herramientas de validación integradas y ajusta según tus necesidades."
    },
    {
      number: 4,
      title: "Exportación e Integración",
      description: "Exporta tus datos limpios a cualquier plataforma o intégralos directamente en tu sistema."
    }
  ];

  const plans = [
    {
      name: "Básico",
      price: "0",
      period: "Gratis",
      features: [
        "10 conversiones por mes",
        "Formatos básicos",
        "Soporte por email",
        "Sin marca de agua"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "9.99",
      period: "mes",
      features: [
        "500 conversiones por mes",
        "Todos los formatos",
        "Soporte prioritario",
        "API access",
        "Conversiones por lotes"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "29.99",
      period: "mes",
      features: [
        "Conversiones ilimitadas",
        "Todos los formatos premium",
        "Soporte 24/7",
        "API completa",
        "Servidor dedicado"
      ],
      popular: false
    }
  ];

  const faqs = [
    {
      question: "¿Qué formatos de archivo admite Anclora Nexus?",
      answer: "Anclora Nexus admite más de 20 formatos diferentes incluyendo documentos (PDF, DOC, DOCX, TXT, HTML, MD, RTF, ODT, TEX), imágenes (JPG, PNG, GIF) y muchos más. Constantemente añadimos nuevos formatos basados en las necesidades de nuestros usuarios."
    },
    {
      question: "¿Es seguro subir mis archivos?",
      answer: "Absolutamente. Todos los archivos se procesan en servidores seguros con cifrado SSL. Los archivos se eliminan automáticamente después de la conversión y nunca almacenamos tu contenido permanentemente."
    },
    {
      question: "¿Hay límites en el tamaño de archivo?",
      answer: "El plan gratuito permite archivos de hasta 100MB. Los planes Pro y Enterprise permiten archivos de hasta 1GB y 5GB respectivamente."
    },
    {
      question: "¿Qué es Anclora Press?",
      answer: "Anclora Press es nuestro módulo especializado para la creación y publicación de libros digitales. Permite importar documentos, editarlos profesionalmente y publicarlos en múltiples formatos como EPUB, PDF y Kindle."
    }
  ];

  return (
    <div className="min-h-screen transition-colors duration-300" data-theme={theme}>
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/logo-anclora-nexus.png" 
                alt="Anclora Nexus" 
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Anclora Nexus</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tu Contenido, Reinventado</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Inicio</a>
              <a href="#proceso" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Proceso</a>
              <a href="#conversiones" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Conversiones</a>
              <a href="#precios" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Precios</a>
              <a href="#faq" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">FAQ</a>
            </div>

            {/* Theme Selector & CTA */}
            <div className="flex items-center space-x-4">
              {/* Theme Selector */}
              <div className="relative">
                <button
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Cambiar tema"
                >
                  {theme === 'light' && <Sun className="w-5 h-5" />}
                  {theme === 'dark' && <Moon className="w-5 h-5" />}
                  {theme === 'auto' && <Monitor className="w-5 h-5" />}
                </button>
                
                {themeMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 ${theme === 'light' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <Sun className="w-4 h-4" />
                      <span>Claro</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 ${theme === 'dark' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <Moon className="w-4 h-4" />
                      <span>Oscuro</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('auto')}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 rounded-b-lg ${theme === 'auto' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <Monitor className="w-4 h-4" />
                      <span>Sistema</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={onEnterApp}
                className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 items-center space-x-2"
              >
                <span>Acceder a la App</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-4">
                <a href="#inicio" className="text-gray-700 dark:text-gray-300">Inicio</a>
                <a href="#proceso" className="text-gray-700 dark:text-gray-300">Proceso</a>
                <a href="#conversiones" className="text-gray-700 dark:text-gray-300">Conversiones</a>
                <a href="#precios" className="text-gray-700 dark:text-gray-300">Precios</a>
                <a href="#faq" className="text-gray-700 dark:text-gray-300">FAQ</a>
                <button
                  onClick={onEnterApp}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Acceder a la App</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="inicio" 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/bg4.png)' }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Convierte cualquier archivo
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            La plataforma más avanzada para convertir archivos entre múltiples formatos. 
            Rápido, seguro y profesional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onEnterApp}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Comenzar Ahora</span>
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Ver Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Proceso de 4 Pasos */}
      <section id="proceso" className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nuestro Proceso
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Convierte tus archivos en 4 simples pasos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Por qué elegir Anclora Nexus?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Una plataforma completa para todas tus necesidades de conversión de contenido
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversiones Populares */}
      <section id="conversiones" className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Conversiones Más Populares
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Las conversiones que más utilizan nuestros usuarios
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {conversions.map((conversion, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center space-x-4">
                  <span className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-semibold text-sm">
                    {conversion.from}
                  </span>
                  <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-semibold text-sm">
                    {conversion.to}
                  </span>
                </div>
                <p className="text-center text-gray-600 dark:text-gray-300 text-sm mt-3">
                  {conversion.category}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">20+</div>
              <p className="text-blue-100">Formatos Soportados</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <p className="text-blue-100">Archivos Convertidos</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <p className="text-blue-100">Tiempo de Actividad</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-blue-100">Soporte Disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Planes y Precios
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Elige el plan que mejor se adapte a tus necesidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 ${plan.popular ? 'ring-2 ring-blue-600 scale-105' : ''} hover:shadow-xl transition-all duration-300`}>
                {plan.popular && (
                  <div className="bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full inline-block mb-4">
                    Más Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">€{plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-300">/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={onEnterApp}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  Comenzar
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Encuentra respuestas a las preguntas más comunes
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg">
                <summary className="p-6 cursor-pointer font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  {faq.question}
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            ¿Necesitas ayuda?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Nuestro equipo está aquí para ayudarte. Contáctanos para cualquier pregunta o soporte técnico.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:soporte@anclora.com" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
            >
              Contactar Soporte
            </a>
            <a 
              href="mailto:ventas@anclora.com" 
              className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
            >
              Contactar Ventas
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/logo-anclora.png" 
                  alt="Anclora" 
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-xl font-bold">Anclora</span>
              </div>
              <p className="text-gray-400 mb-4">
                Tu Productividad, bien anclada.
              </p>
              <p className="text-gray-400">
                La plataforma completa para conversión de archivos y creación de contenido digital.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Convertidor de Archivos</a></li>
                <li><a href="#" className="hover:text-white">Anclora Press</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Documentación</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Formatos</h3>
              <ul className="space-y-2 text-gray-400">
                <li>PDF, DOC, DOCX, TXT</li>
                <li>HTML, MD, RTF, ODT</li>
                <li>JPG, PNG, GIF, TEX</li>
                <li>Y muchos más...</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Centro de Ayuda</a></li>
                <li><a href="mailto:soporte@anclora.com" className="hover:text-white">Contacto</a></li>
                <li><a href="#" className="hover:text-white">Estado del Servicio</a></li>
                <li><a href="#" className="hover:text-white">Actualizaciones</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Anclora Nexus. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
