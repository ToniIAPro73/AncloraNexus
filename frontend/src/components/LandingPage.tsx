import React from 'react';
import { ArrowRight, FileText, Zap, Shield, Users } from 'lucide-react';

interface LandingPageProps {
  onEnterApp?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <section className="text-center py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            🎯 Anclora Nexus
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 italic mb-8">
            Tu Contenido, Reinventado
          </p>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Convierte archivos entre múltiples formatos de manera rápida, segura y profesional. 
            Desde documentos hasta libros digitales con Anclora Press.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button 
              onClick={onEnterApp}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2"
            >
              Comenzar Ahora <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border border-blue-400 text-blue-300 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-400/10 transition-colors">
              Ver Formatos Soportados
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            ¿Por qué elegir Anclora Nexus?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Múltiples Formatos
              </h3>
              <p className="text-gray-300">
                Convierte entre TXT, PDF, DOCX, HTML, CSV, JSON y más
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Rápido y Eficiente
              </h3>
              <p className="text-gray-300">
                Conversiones instantáneas con la mejor calidad
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Seguro y Privado
              </h3>
              <p className="text-gray-300">
                Tus archivos se procesan de forma segura y privada
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Anclora Press
              </h3>
              <p className="text-gray-300">
                Crea y publica libros digitales profesionales
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">
            ¡Empieza a convertir ahora mismo!
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Únete a miles de usuarios que confían en Anclora Nexus para sus conversiones de archivos.
          </p>
          <button 
            onClick={onEnterApp}
            className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-lg font-semibold text-xl transition-colors"
          >
            Acceder a la Aplicación
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2025 Anclora Nexus. Tu Contenido, Reinventado.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
