import React, { useState } from 'react';
import { CreditProvider } from './components/CreditSystem';
import { UniversalConverter } from './components/UniversalConverter';
import { PricingSelector } from './components/PricingSelector';
import { CreditHistory } from './components/CreditSystem';
import { UserMenu } from './components/UserMenu';
import './index.css';

function App() {
  const [activeSection, setActiveSection] = useState('converter');

  const sidebarItems = [
    { id: 'converter', icon: '🎯', label: 'Conversor', badge: null },
    { id: 'formats', icon: '📋', label: 'Formatos', badge: '45+' },
    { id: 'history', icon: '📊', label: 'Historial', badge: '12' },
    { id: 'credits', icon: '💎', label: 'Créditos', badge: null },
    { id: 'pricing', icon: '💳', label: 'Planes', badge: 'Pro' },
    { id: 'faq', icon: '❓', label: 'FAQ', badge: null },
    { id: 'reviews', icon: '⭐', label: 'Valoraciones', badge: null },
    { id: 'settings', icon: '⚙️', label: 'Configuración', badge: null },
    { id: 'stats', icon: '📈', label: 'Estadísticas', badge: null },
  ];

  const renderMainContent = () => {
    switch (activeSection) {
      case 'converter':
        return <UniversalConverter />;
      case 'formats':
        return <SupportedFormats />;
      case 'pricing':
        return <PricingSelector />;
      case 'credits':
        return <CreditHistory />;
      case 'history':
        return <ConversionHistory />;
      case 'faq':
        return <FAQ />;
      case 'reviews':
        return <UserReviews />;
      case 'settings':
        return <Settings />;
      case 'stats':
        return <Statistics />;
      default:
        return <UniversalConverter />;
    }
  };

  return (
    <CreditProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-xl font-bold text-white">Anclora Workspace</h1>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                Beta
              </span>
            </div>
            <UserMenu />
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-slate-800/30 backdrop-blur-sm border-r border-slate-700/50 min-h-[calc(100vh-80px)]">
            <nav className="p-4 space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.badge === 'Pro' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : item.badge.includes('+')
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-slate-600 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="p-4 mt-8">
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                <h3 className="text-slate-300 text-sm font-medium mb-3">Actividad Hoy</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Conversiones</span>
                    <span className="text-cyan-400 font-medium">47</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Créditos usados</span>
                    <span className="text-orange-400 font-medium">156</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Nivel</span>
                    <span className="text-purple-400 font-medium">Pro</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div className="p-4">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-blue-300 text-sm font-medium mb-2">Acceso Rápido</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveSection('converter')}
                    className="w-full text-left text-slate-300 hover:text-white text-sm transition-colors"
                  >
                    🚀 Conversión rápida
                  </button>
                  <button 
                    onClick={() => setActiveSection('formats')}
                    className="w-full text-left text-slate-300 hover:text-white text-sm transition-colors"
                  >
                    📋 Ver todos los formatos
                  </button>
                  <button 
                    onClick={() => setActiveSection('pricing')}
                    className="w-full text-left text-slate-300 hover:text-white text-sm transition-colors"
                  >
                    💳 Comprar créditos
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {renderMainContent()}
          </main>
        </div>
      </div>
    </CreditProvider>
  );
}

// Componente de Formatos Compatibles simplificado
const SupportedFormats = () => (
  <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
    <h2 className="text-2xl font-bold text-white mb-6">Formatos Compatibles</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[
        { name: 'PDF', icon: '📄', category: 'Documentos' },
        { name: 'JPG', icon: '🖼️', category: 'Imágenes' },
        { name: 'PNG', icon: '🎨', category: 'Imágenes' },
        { name: 'MP4', icon: '🎬', category: 'Video' },
        { name: 'MP3', icon: '🎵', category: 'Audio' },
        { name: 'ZIP', icon: '📦', category: 'Archivos' },
        { name: 'DOC', icon: '📝', category: 'Documentos' },
        { name: 'GIF', icon: '🎞️', category: 'Imágenes' },
        { name: 'SVG', icon: '📐', category: 'Vectores' },
        { name: 'WAV', icon: '🎼', category: 'Audio' },
        { name: 'AVI', icon: '🎥', category: 'Video' },
        { name: 'TXT', icon: '📃', category: 'Texto' },
      ].map((format, index) => (
        <div
          key={index}
          className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-600/30 transition-all duration-200 hover:border-blue-500/30 text-center"
        >
          <div className="text-2xl mb-2">{format.icon}</div>
          <h3 className="text-white font-bold text-sm">{format.name}</h3>
          <p className="text-slate-400 text-xs mt-1">{format.category}</p>
        </div>
      ))}
    </div>
  </div>
);

// Componente FAQ
const FAQ = () => (
  <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
    <h2 className="text-2xl font-bold text-white mb-6">Preguntas Frecuentes</h2>
    <div className="space-y-4">
      {[
        {
          question: "¿Cómo funciona el sistema de créditos?",
          answer: "Cada conversión consume créditos según la complejidad. Las conversiones básicas (JPG→PNG) cuestan 1 crédito, mientras que las avanzadas (PDF→Video) pueden costar hasta 10 créditos."
        },
        {
          question: "¿Mis archivos están seguros?",
          answer: "Sí, todos los archivos se procesan de forma segura y se eliminan automáticamente después de 24 horas. Nunca almacenamos ni compartimos tu contenido."
        },
        {
          question: "¿Puedo convertir archivos grandes?",
          answer: "Los usuarios gratuitos pueden convertir archivos de hasta 10MB. Los usuarios Pro pueden procesar archivos de hasta 100MB, y Enterprise hasta 1GB."
        },
        {
          question: "¿Qué significa 'Análisis IA'?",
          answer: "Nuestro sistema analiza inteligentemente tu archivo para optimizar la conversión, detectar el mejor formato de salida y aplicar configuraciones automáticas para obtener la mejor calidad."
        },
        {
          question: "¿Puedo cancelar mi suscripción?",
          answer: "Sí, puedes cancelar en cualquier momento desde tu panel de usuario. Los créditos no utilizados permanecen disponibles hasta su fecha de expiración."
        }
      ].map((faq, index) => (
        <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
          <h3 className="text-blue-300 font-medium mb-2">{faq.question}</h3>
          <p className="text-slate-300 text-sm">{faq.answer}</p>
        </div>
      ))}
    </div>
  </div>
);

// Componente de Valoraciones de Usuarios
const UserReviews = () => (
  <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
    <h2 className="text-2xl font-bold text-white mb-6">Valoraciones de Usuarios</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        {
          name: "María González",
          role: "Diseñadora Gráfica",
          rating: 5,
          comment: "Increíble herramienta. El análisis IA realmente optimiza mis conversiones y ahorro muchísimo tiempo en mi flujo de trabajo diario.",
          avatar: "👩‍🎨"
        },
        {
          name: "Carlos Ruiz",
          role: "Desarrollador Web",
          rating: 5,
          comment: "La calidad de conversión es excepcional. Especialmente útil para optimizar imágenes para web sin perder calidad.",
          avatar: "👨‍💻"
        },
        {
          name: "Ana Martín",
          role: "Content Creator",
          rating: 4,
          comment: "Uso Anclora diariamente para convertir videos y audios. El sistema de créditos es muy justo y transparente.",
          avatar: "👩‍🎬"
        },
        {
          name: "David López",
          role: "Arquitecto",
          rating: 5,
          comment: "Perfecto para convertir planos y documentos técnicos. La precisión en las conversiones PDF es impresionante.",
          avatar: "👨‍🏗️"
        },
        {
          name: "Laura Sánchez",
          role: "Editora",
          rating: 5,
          comment: "La interfaz es intuitiva y las conversiones son rápidas. Me encanta poder ver el historial completo de mis trabajos.",
          avatar: "👩‍📝"
        },
        {
          name: "Miguel Torres",
          role: "Fotógrafo",
          rating: 4,
          comment: "Excelente para procesar lotes de fotos. El análisis inteligente detecta automáticamente la mejor configuración.",
          avatar: "👨‍📷"
        }
      ].map((review, index) => (
        <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white">{review.avatar}</span>
            </div>
            <div>
              <h3 className="text-white font-medium">{review.name}</h3>
              <p className="text-slate-400 text-sm">{review.role}</p>
            </div>
            <div className="ml-auto flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-slate-600'}`}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
          <p className="text-slate-300 text-sm italic">"{review.comment}"</p>
        </div>
      ))}
    </div>
    
    {/* Estadísticas de valoraciones */}
    <div className="mt-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-4">
      <h3 className="text-green-300 font-medium mb-3">Resumen de Valoraciones</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-400">4.8</div>
          <div className="text-slate-400 text-sm">Puntuación media</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-400">2,847</div>
          <div className="text-slate-400 text-sm">Valoraciones</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-400">94%</div>
          <div className="text-slate-400 text-sm">Recomiendan</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-cyan-400">12K+</div>
          <div className="text-slate-400 text-sm">Usuarios activos</div>
        </div>
      </div>
    </div>
  </div>
);

// Otros componentes
const ConversionHistory = () => (
  <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
    <h2 className="text-2xl font-bold text-white mb-6">Historial de Conversiones</h2>
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400">📄</span>
            </div>
            <div>
              <p className="text-white font-medium">documento_{i}.pdf → imagen_{i}.jpg</p>
              <p className="text-slate-400 text-sm">Hace {i} horas • 2 créditos • Análisis IA aplicado</p>
            </div>
          </div>
          <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Descargar
          </button>
        </div>
      ))}
    </div>
  </div>
);

const Settings = () => (
  <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
    <h2 className="text-2xl font-bold text-white mb-6">Configuración</h2>
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 font-medium mb-2">Calidad por defecto</label>
        <select className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white">
          <option>Alta calidad (más créditos)</option>
          <option>Calidad media (equilibrado)</option>
          <option>Compresión máxima (menos créditos)</option>
        </select>
      </div>
      <div>
        <label className="block text-slate-300 font-medium mb-2">Análisis IA</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span className="text-slate-300">Activar análisis inteligente automático</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span className="text-slate-300">Optimización automática de calidad</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-slate-300 font-medium mb-2">Notificaciones</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span className="text-slate-300">Conversión completada</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-slate-300">Créditos bajos</span>
          </label>
        </div>
      </div>
    </div>
  </div>
);

const Statistics = () => (
  <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
    <h2 className="text-2xl font-bold text-white mb-6">Estadísticas</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-500/30">
        <h3 className="text-cyan-400 font-medium">Total Conversiones</h3>
        <p className="text-2xl font-bold text-white mt-2">1,247</p>
        <p className="text-slate-400 text-sm mt-1">+23% este mes</p>
      </div>
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
        <h3 className="text-purple-400 font-medium">Créditos Usados</h3>
        <p className="text-2xl font-bold text-white mt-2">3,891</p>
        <p className="text-slate-400 text-sm mt-1">Promedio: 3.1 por conversión</p>
      </div>
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
        <h3 className="text-green-400 font-medium">Tiempo Ahorrado</h3>
        <p className="text-2xl font-bold text-white mt-2">24h</p>
        <p className="text-slate-400 text-sm mt-1">vs conversión manual</p>
      </div>
    </div>
  </div>
);

export default App;

