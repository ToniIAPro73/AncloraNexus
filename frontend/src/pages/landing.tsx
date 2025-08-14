import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans">
      {/* Hero Section */}
      <section className="bg-[#dbeafe] text-center py-24 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1e40af] mb-4">
          Anclora Metaform
        </h1>
        <p className="text-xl md:text-2xl text-[#2563eb] italic">
          Tu Contenido, Reinventado
        </p>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <h2 className="text-3xl font-semibold text-center text-[#1e40af] mb-12">
          Características
        </h2>
        <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
          <div className="p-6 rounded-lg shadow bg-white">
            <h3 className="text-xl font-semibold text-[#2563eb] mb-2">
              Conversión Inteligente
            </h3>
            <p className="text-[#64748b]">
              Transforma tus archivos a múltiples formatos con IA.
            </p>
          </div>
          <div className="p-6 rounded-lg shadow bg-white">
            <h3 className="text-xl font-semibold text-[#2563eb] mb-2">
              Diseño Intuitivo
            </h3>
            <p className="text-[#64748b]">
              Interfaz sencilla y optimizada para tu flujo de trabajo.
            </p>
          </div>
          <div className="p-6 rounded-lg shadow bg-white">
            <h3 className="text-xl font-semibold text-[#2563eb] mb-2">
              Soporte Multiplataforma
            </h3>
            <p className="text-[#64748b]">
              Disponible en todos tus dispositivos favoritos.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-[#f8fafc] py-16 px-4">
        <h2 className="text-3xl font-semibold text-center text-[#1e40af] mb-12">
          Precios
        </h2>
        <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold text-[#2563eb] mb-4">
              Gratis
            </h3>
            <p className="text-[#64748b] mb-6">Funcionalidades básicas sin costo.</p>
            <Link
              href="/app"
              className="block text-center bg-[#2563eb] text-white py-2 px-4 rounded"
            >
              Comenzar
            </Link>
          </div>
          <div className="p-6 border-2 border-[#2563eb] rounded-lg">
            <h3 className="text-xl font-semibold text-[#2563eb] mb-4">
              Pro
            </h3>
            <p className="text-[#64748b] mb-6">
              Conversión ilimitada y funciones avanzadas.
            </p>
            <Link
              href="/app"
              className="block text-center bg-[#3b82f6] text-white py-2 px-4 rounded"
            >
              Elegir Pro
            </Link>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold text-[#2563eb] mb-4">
              Empresa
            </h3>
            <p className="text-[#64748b] mb-6">
              Soluciones personalizadas para equipos.
            </p>
            <Link
              href="/app"
              className="block text-center bg-[#2563eb] text-white py-2 px-4 rounded"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-20 bg-[#1e293b] text-white px-4">
        <h2 className="text-3xl font-bold mb-6">
          ¿Listo para transformar tu contenido?
        </h2>
        <Link
          href="/app"
          className="inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-3 rounded-lg font-medium"
        >
          Ir a la App
        </Link>
      </section>
    </div>
  );
}
