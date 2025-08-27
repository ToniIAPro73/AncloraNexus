import React from 'react';
import { FileText, Zap, Shield, Star, ArrowRight, Download, Upload, Settings, CheckCircle, BookOpen } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Anclora Nexus</h1>
              <p className="text-sm text-gray-600">Tu Contenido, Reinventado</p>
            </div>
          </div>
          <button
            onClick={onEnterApp}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <span>Acceder a la App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Convierte archivos entre
            <span className="text-blue-600 block">múltiples formatos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Convierte archivos entre múltiples formatos de manera rápida, segura y profesional. 
            Desde documentos hasta libros digitales con Anclora Press.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onEnterApp}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Comenzar Ahora</span>
            </button>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Ver Formatos Soportados</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Por qué elegir Anclora Nexus?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Una plataforma completa para todas tus necesidades de conversión de contenido
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Múltiples Formatos</h3>
            <p className="text-gray-600 leading-relaxed">
              Convierte entre TXT, PDF, DOC, DOCX, HTML, MD, RTF, ODT, TEX, JPG, PNG, GIF y más. 
              Soporte completo para documentos e imágenes.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Rápido y Eficiente</h3>
            <p className="text-gray-600 leading-relaxed">
              Conversiones instantáneas con la mejor calidad. 
              Procesa tus archivos en segundos, no en minutos.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Seguro y Privado</h3>
            <p className="text-gray-600 leading-relaxed">
              Tus archivos se procesan de manera segura y se eliminan automáticamente. 
              Tu privacidad es nuestra prioridad.
            </p>
          </div>
        </div>
      </section>

      {/* Anclora Press Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex items-center justify-center mb-6">
              <BookOpen className="w-12 h-12 mr-4" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Anclora Press
              </h2>
            </div>
            <p className="text-xl mb-8 opacity-90">
              Herramienta avanzada para la creación y publicación de libros digitales. 
              Importa documentos, edítalos y publícalos en múltiples formatos.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  <h3 className="text-lg font-semibold">Creación de Libros</h3>
                </div>
                <p className="opacity-90">
                  Transforma tus documentos en libros digitales profesionales con herramientas 
                  de edición avanzadas y plantillas prediseñadas.
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  <h3 className="text-lg font-semibold">Publicación Multi-formato</h3>
                </div>
                <p className="opacity-90">
                  Publica en EPUB, PDF, Kindle y más. Compatible con las principales 
                  plataformas de distribución de libros digitales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nuestro Proceso
          </h2>
          <p className="text-xl text-gray-600">
            Convierte tus archivos en 4 simples pasos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
              1
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Importación de Datos</h3>
            <p className="text-gray-600">
              Carga tus archivos desde múltiples fuentes (TXT, PDF, DOC, DOCX, JPG, PNG, GIF, HTML, MD, RTF, ODT, TEX) con solo unos clics.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
              2
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Normalización Automática</h3>
            <p className="text-gray-600">
              Nuestro AI analiza y corrige inconsistencias, duplicados y formatos incorrectos.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Validación y Calidad</h3>
            <p className="text-gray-600">
              Revisa los resultados con herramientas de validación integradas y ajusta según tus necesidades.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
              4
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Exportación e Integración</h3>
            <p className="text-gray-600">
              Exporta tus datos limpios a cualquier plataforma o intégralos directamente en tu sistema.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <p className="text-gray-600">Formatos Soportados</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1M+</div>
              <p className="text-gray-600">Archivos Convertidos</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <p className="text-gray-600">Tiempo de Actividad</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-gray-600">Disponibilidad</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Únete a miles de usuarios que ya confían en Anclora Nexus para sus conversiones de archivos
          </p>
          <button
            onClick={onEnterApp}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 inline-flex items-center space-x-2"
          >
            <Settings className="w-5 h-5" />
            <span>Probar la Aplicación</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Anclora Nexus</span>
              </div>
              <p className="text-gray-400">
                Tu contenido, reinventado. La plataforma completa para conversión de archivos.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Convertidor de Archivos</li>
                <li>Anclora Press</li>
                <li>API</li>
                <li>Documentación</li>
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
                <li>Centro de Ayuda</li>
                <li>Contacto</li>
                <li>Estado del Servicio</li>
                <li>Actualizaciones</li>
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
