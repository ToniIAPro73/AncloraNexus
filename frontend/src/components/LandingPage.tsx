import React, { useState, useEffect } from 'react';
import { FileText, Zap, Shield, ArrowRight, Download, Upload, Settings, CheckCircle, BookOpen, Moon, Sun, Monitor, Menu, X, Cpu, Lock, Layers, Database, Globe, Package, ChevronDown, ChevronUp } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('Professional');
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Determine if current theme is dark
  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // Scroll to top button logic
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const applyTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    let effectiveTheme = newTheme;
    if (newTheme === 'auto') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    setThemeMenuOpen(false);
  };

  // Conversiones categorizadas con efectos hover
  const conversionCategories = [
    {
      title: "Documentos",
      icon: <FileText className="w-12 h-12 mx-auto text-emerald-600 dark:text-emerald-400" />,
      conversions: [
        { from: 'PDF', to: 'Word' },
        { from: 'Word', to: 'PDF' },
        { from: 'Excel', to: 'PDF' },
        { from: 'PPT', to: 'PDF' },
        { from: 'CSV', to: 'Excel' }
      ]
    },
    {
      title: "Imágenes & gráficos",
      icon: <Upload className="w-12 h-12 mx-auto text-teal-600 dark:text-teal-400" />,
      conversions: [
        { from: 'PNG', to: 'JPG' },
        { from: 'JPG', to: 'PNG' },
        { from: 'SVG', to: 'PNG' },
        { from: 'WebP', to: 'JPG' },
        { from: 'TIFF', to: 'PDF' }
      ]
    },
    {
      title: "Audio & vídeo",
      icon: <Cpu className="w-12 h-12 mx-auto text-cyan-600 dark:text-cyan-400" />,
      conversions: [
        { from: 'MP4', to: 'MP3' },
        { from: 'WAV', to: 'MP3' },
        { from: 'FLAC', to: 'MP3' },
        { from: 'MOV', to: 'MP4' },
        { from: 'AVI', to: 'MP4' }
      ]
    },
    {
      title: "Comprimidos",
      icon: <Package className="w-12 h-12 mx-auto text-green-600 dark:text-green-400" />,
      conversions: []
    },
    {
      title: "Datos & bases",
      icon: <Database className="w-12 h-12 mx-auto text-emerald-700 dark:text-emerald-300" />,
      conversions: []
    },
    {
      title: "Web & desarrollo",
      icon: <Globe className="w-12 h-12 mx-auto text-teal-700 dark:text-teal-300" />,
      conversions: []
    }
  ];

  // Características avanzadas con efectos hover
  const advancedFeatures = [
    {
      icon: <Settings className="w-16 h-16 text-teal-600 dark:text-teal-400" />,
      title: "Conversión universal",
      description: "Convierte entre más de 200 formatos sin perder calidad. Desde documentos hasta vídeo."
    },
    {
      icon: <Cpu className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />,
      title: "IA inteligente",
      description: "Reconoce contenido y estructura, aplica OCR avanzado y optimiza tus archivos automáticamente."
    },
    {
      icon: <Zap className="w-16 h-16 text-cyan-600 dark:text-cyan-400" />,
      title: "Velocidad extrema",
      description: "Procesa archivos de cualquier tamaño en segundos gracias a una infraestructura distribuida."
    },
    {
      icon: <Lock className="w-16 h-16 text-green-600 dark:text-green-400" />,
      title: "Seguridad total",
      description: "Cifrado de extremo a extremo y cumplimiento con GDPR. Tus datos siempre están protegidos."
    },
    {
      icon: <Layers className="w-16 h-16 text-teal-700 dark:text-teal-300" />,
      title: "Procesamiento por lotes",
      description: "Convierte miles de archivos simultáneamente con reglas personalizadas y monitorización en tiempo real."
    },
    {
      icon: <Database className="w-16 h-16 text-emerald-700 dark:text-emerald-300" />,
      title: "API robusta",
      description: "Integra nuestras capacidades en tus sistemas con una API RESTful, SDKs y webhooks."
    }
  ];

  // Proceso innovador en tonos verdosos
  const processSteps = [
    {
      number: 1,
      title: "Sube tu archivo",
      description: "Arrastra o selecciona cualquier archivo desde tu dispositivo. Soporte para más de 200 formatos.",
      icon: <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
    },
    {
      number: 2,
      title: "Procesamiento IA",
      description: "Nuestra inteligencia artificial analiza y optimiza tu contenido automáticamente.",
      icon: <Cpu className="w-8 h-8 text-teal-600 dark:text-teal-400" />
    },
    {
      number: 3,
      title: "Conversión segura",
      description: "Convertimos tu archivo con máxima calidad y seguridad garantizada.",
      icon: <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
    },
    {
      number: 4,
      title: "Descarga inmediata",
      description: "Obtén tu archivo convertido al instante y con la mejor calidad posible.",
      icon: <Download className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "€9",
      period: "/mes",
      features: [
        "1000 conversiones/mes",
        "Archivos hasta 50 MB",
        "Formatos básicos",
        "Soporte por email"
      ],
      popular: false,
      buttonText: "Comenzar prueba"
    },
    {
      name: "Professional",
      price: "€29",
      period: "/mes",
      features: [
        "10.000 conversiones/mes",
        "Archivos hasta 500 MB",
        "Todos los formatos",
        "API completa",
        "Procesamiento por lotes",
        "Soporte prioritario"
      ],
      popular: true,
      buttonText: "Empezar ahora"
    },
    {
      name: "Enterprise",
      price: "€99",
      period: "/mes",
      features: [
        "Conversiones ilimitadas",
        "Archivos hasta 5 GB",
        "Formatos personalizados",
        "API dedicada",
        "Integración custom",
        "Soporte 24/7"
      ],
      popular: false,
      buttonText: "Contactar ventas"
    }
  ];

  const faqs = [
    {
      question: "¿Qué formatos puedo convertir?",
      answer: "Soportamos más de 200 formatos incluyendo documentos (PDF, Word, Excel, PowerPoint), imágenes (JPG, PNG, SVG, WebP), audio y vídeo (MP4, MP3, WAV), archivos comprimidos y muchos más."
    },
    {
      question: "¿Es seguro subir mis archivos?",
      answer: "Absolutamente. Utilizamos cifrado de extremo a extremo, cumplimos con GDPR y todos los archivos se eliminan automáticamente de nuestros servidores tras la conversión."
    },
    {
      question: "¿Hay límites en el tamaño de archivo?",
      answer: "Depende de tu plan. El plan Starter permite archivos hasta 50 MB, Professional hasta 500 MB y Enterprise hasta 5 GB. Para archivos más grandes, contacta con nosotros."
    },
    {
      question: "¿Puedo usar la API?",
      answer: "Sí, desde el plan Professional tienes acceso completo a nuestra API RESTful con documentación completa, SDKs y webhooks para integrar nuestras capacidades en tus sistemas."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Extremo izquierdo */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <img src="/logo-anclora-nexus.png" alt="Anclora Nexus" className="h-8 w-auto" />
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900 dark:text-white">Anclora Nexus</span>
                <p className="text-xs text-gray-600 dark:text-gray-300">Tu Productividad, bien anclada</p>
              </div>
            </div>

            {/* Navigation - Centro */}
            <nav className="hidden lg:flex space-x-6">
              <a href="#proceso" className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm">Proceso</a>
              <a href="#caracteristicas" className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm">Características</a>
              <a href="#conversiones" className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm">Conversiones</a>
              <a href="#precios" className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm">Precios</a>
              <a href="#faq" className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm">FAQ</a>
              <a href="#contacto" className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm">Contacto</a>
            </nav>

            {/* Actions - Extremo derecho */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Theme Selector */}
              <div className="relative theme-selector">
                <button
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {theme === 'light' && <Sun className="w-5 h-5" />}
                  {theme === 'dark' && <Moon className="w-5 h-5" />}
                  {theme === 'auto' && <Monitor className="w-5 h-5" />}
                </button>
                
                {themeMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 theme-menu">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <Sun className="w-4 h-4" />
                      <span>Claro</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <Moon className="w-4 h-4" />
                      <span>Oscuro</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('auto')}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <Monitor className="w-4 h-4" />
                      <span>Automático</span>
                    </button>
                  </div>
                )}
              </div>

              {/* App Button */}
              <button
                onClick={onEnterApp}
                className="hidden lg:inline-flex items-center px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg text-sm"
              >
                Acceder a la app
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 space-y-3">
              <a href="#proceso" className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">Proceso</a>
              <a href="#caracteristicas" className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">Características</a>
              <a href="#conversiones" className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">Conversiones</a>
              <a href="#precios" className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">Precios</a>
              <a href="#faq" className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">FAQ</a>
              <a href="#contacto" className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">Contacto</a>
              <button
                onClick={onEnterApp}
                className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium transition-all duration-300"
              >
                Acceder a la app
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section con bg4.png */}
      <section id="inicio" className="relative pt-16 min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/bg4.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 to-teal-900/60 dark:from-emerald-900/80 dark:to-teal-900/80" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Convierte cualquier archivo
            <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              sin perder calidad
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            La plataforma más avanzada para convertir documentos, imágenes, audio y vídeo. 
            Más de 200 formatos soportados con IA integrada.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-3">
              <Upload className="w-6 h-6 group-hover:animate-bounce" />
              <span>Comenzar conversión</span>
            </button>
            
            <button 
              onClick={onEnterApp}
              className="group px-8 py-4 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm flex items-center space-x-3"
            >
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              <span>Probar la app</span>
            </button>
          </div>
        </div>
      </section>

      {/* Rest of landing con bg3.png */}
      <div 
        className="relative bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url(/bg3.png)' }}
      >
        <div className={`absolute inset-0 transition-colors duration-300 ${
          isDark ? 'bg-gray-900/85' : 'bg-white/85'
        }`} />
        
        <div className="relative z-10">
          {/* Nuestro proceso innovador */}
          <section id="proceso" className="py-20 relative">
            <div
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300 ${
                isDark ? 'opacity-20' : 'opacity-40'
              }`}
              style={{
                backgroundImage: `url('/bg3.png')`
              }}
            />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Nuestro proceso
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Conversión inteligente en 4 pasos simples
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 items-center">
                {processSteps.map((step, index) => (
                  <React.Fragment key={index}>
                    <div className="lg:col-span-1 relative group">
                      <div className="p-8 bg-gradient-to-br from-white/90 to-emerald-50/70 dark:from-gray-800/90 dark:to-emerald-900/30 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-emerald-200/50 dark:border-emerald-700/30 backdrop-blur-sm">
                        <div className="text-center">
                          <div className="mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4">
                              <span className="text-2xl font-bold text-white">{step.number}</span>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center shadow-md mx-auto">
                              {step.icon}
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Elegant connector arrow */}
                    {index < processSteps.length - 1 && (
                      <div className="lg:col-span-1 hidden lg:flex justify-center items-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-60"></div>
                          <div className="relative">
                            <ArrowRight className="w-8 h-8 text-emerald-500 dark:text-emerald-400 animate-pulse drop-shadow-lg" />
                            <div className="absolute -inset-2 bg-emerald-400/20 rounded-full blur-sm"></div>
                          </div>
                          <div className="w-16 h-0.5 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full opacity-60"></div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          {/* Características avanzadas */}
          <section id="caracteristicas" className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Capacidades avanzadas
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Tecnología de vanguardia para todas tus necesidades de conversión
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {advancedFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className="group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Conversiones más frecuentes */}
          <section id="conversiones" className="py-20 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Conversiones más frecuentes
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Accede rápidamente a las conversiones más populares organizadas por categorías
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {conversionCategories.map((category, index) => (
                  <div 
                    key={index}
                    className="group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="text-center mb-6">
                      <div className="mb-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {category.title}
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {category.conversions.map((conversion, convIndex) => (
                        <div 
                          key={convIndex}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-800/30 dark:hover:to-teal-800/30 transition-all duration-200 cursor-pointer"
                        >
                          <span className="font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 rounded-md text-sm">
                            {conversion.from}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="font-medium text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 px-3 py-1 rounded-md text-sm">
                            {conversion.to}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Planes y precios */}
          <section id="precios" className="py-20 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Planes y precios
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Elige el plan perfecto para tus necesidades de conversión
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan, index) => (
                  <div 
                    key={index}
                    onClick={() => setSelectedPlan(plan.name)}
                    className={`relative p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${
                      selectedPlan === plan.name
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-4 border-emerald-400 scale-105'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-300 dark:hover:border-emerald-600'
                    }`}
                  >
                    {selectedPlan === plan.name && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          Seleccionado
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-8">
                      <h3 className={`text-2xl font-bold mb-4 ${selectedPlan === plan.name ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {plan.name}
                      </h3>
                      <div className="mb-6">
                        <span className={`text-5xl font-bold ${selectedPlan === plan.name ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {plan.price}
                        </span>
                        <span className={`text-lg ${selectedPlan === plan.name ? 'text-emerald-100' : 'text-gray-600 dark:text-gray-300'}`}>
                          {plan.period}
                        </span>
                      </div>
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li 
                          key={featureIndex}
                          className={`flex items-center space-x-3 ${selectedPlan === plan.name ? 'text-emerald-100' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                          <CheckCircle className={`w-5 h-5 ${selectedPlan === plan.name ? 'text-emerald-200' : 'text-emerald-500 dark:text-emerald-400'}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Aquí iría la lógica de compra/contratación
                        console.log(`Seleccionando plan: ${plan.name}`);
                      }}
                      className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                        selectedPlan === plan.name
                          ? 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ con colores */}
          <section id="faq" className="py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Preguntas frecuentes
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Resolvemos tus dudas más comunes
                </p>
              </div>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <details 
                    key={index}
                    className="group p-6 bg-gradient-to-r from-white to-emerald-50/30 dark:from-gray-800 dark:to-emerald-900/10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-200/30 dark:border-emerald-700/20"
                  >
                    <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      <span>{faq.question}</span>
                      <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform duration-300 text-emerald-500" />
                    </summary>
                    <div className="mt-4 pt-4 border-t border-emerald-200/30 dark:border-emerald-700/20">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Necesitas ayuda */}
          <section id="contacto" className="py-20 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                ¿Necesitas ayuda?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
                Nuestro equipo está aquí para ayudarte. Contáctanos para resolver cualquier duda o problema.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3">
                  <Settings className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  <span>Contactar soporte</span>
                </button>
                
                <button className="group px-8 py-4 bg-white/80 dark:bg-gray-800/80 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 text-gray-900 dark:text-white border-2 border-emerald-200 dark:border-emerald-700 hover:border-emerald-300 dark:hover:border-emerald-600 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm flex items-center space-x-3">
                  <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Ver documentación</span>
                </button>
              </div>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <div className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg border border-emerald-200/30 dark:border-emerald-700/20">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Soporte técnico</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Para problemas técnicos y consultas sobre la plataforma</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">soporte@anclora.com</p>
                </div>
                
                <div className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg border border-emerald-200/30 dark:border-emerald-700/20">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Ventas</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Para consultas comerciales y planes Enterprise</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">ventas@anclora.com</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo-anclora.png" alt="Anclora" className="h-8 w-auto" />
                <div>
                  <span className="text-xl font-bold">Anclora</span>
                  <p className="text-sm text-gray-400">Empresa matriz</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Anclora Nexus es parte del ecosistema Anclora, dedicado a crear herramientas que potencien tu productividad y creatividad.
              </p>
              <p className="text-emerald-400 font-medium">Tu Productividad, bien anclada</p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-emerald-400">Producto</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#caracteristicas" className="hover:text-emerald-400 transition-colors">Características</a></li>
                <li><a href="#conversiones" className="hover:text-emerald-400 transition-colors">Conversiones</a></li>
                <li><a href="#precios" className="hover:text-emerald-400 transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-emerald-400">Soporte</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a></li>
                <li><a href="#contacto" className="hover:text-emerald-400 transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Estado del servicio</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 Anclora. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Privacidad</a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Términos</a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 group animate-bounce"
          aria-label="Volver al inicio"
        >
          <ChevronUp className="w-6 h-6 group-hover:animate-pulse" />
        </button>
      )}
    </div>
  );
};

export default LandingPage;
