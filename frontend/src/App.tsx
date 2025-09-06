import { useState } from 'react';
import { Header } from './components/Header';
import { AdvancedFeaturesWithNotifications } from './components/AdvancedFeaturesWithNotifications';
import { SafeConversor } from './components/SafeConversor';
import { ToastProvider } from './components/ui';
import { useAuth } from './hooks/useAuth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UIPlayground } from './pages/UIPlayground';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const userPlan: 'free' | 'premium' | 'business' =
    user?.plan === 'premium' || user?.plan === 'business' || user?.plan === 'free'
      ? user.plan
      : 'free';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ToastProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-background">
          <Header onMenuToggle={toggleSidebar} userPlan={userPlan} />

          <main className="flex-1 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <h1 className="text-3xl font-bold mb-6">Anclora Nexus - Conversiones Avanzadas</h1>
                      <p className="mb-8 text-muted-foreground">
                        Bienvenido a la plataforma de conversión de archivos más avanzada. Utiliza nuestras herramientas para convertir tus archivos con precisión y eficiencia.
                      </p>
                      <SafeConversor />
                    </>
                  }
                />
                <Route path="/ui" element={<UIPlayground />} />
              </Routes>
            </div>
          </main>

          {/* Sidebar Overlay for Mobile */}
          {sidebarOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 w-64 bg-background border-r border-border z-50 p-4 transform transition-transform md:hidden">
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Menú</h2>
                    <button
                      className="p-1 rounded-sm hover:bg-accent/50"
                      onClick={() => setSidebarOpen(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <nav className="flex flex-col space-y-1">
                    <a
                      href="/dashboard"
                      className="px-2 py-3 rounded-md hover:bg-accent/50"
                    >
                      Dashboard
                    </a>
                    <a
                      href="/conversions"
                      className="px-2 py-3 rounded-md hover:bg-accent/50"
                    >
                      Conversiones
                    </a>
                    <a
                      href="/analytics"
                      className="px-2 py-3 rounded-md hover:bg-accent/50"
                    >
                      Analíticas
                    </a>
                    <a
                      href="/docs"
                      className="px-2 py-3 rounded-md hover:bg-accent/50"
                    >
                      Documentación
                    </a>
                    <a
                      href="/settings"
                      className="px-2 py-3 rounded-md hover:bg-accent/50"
                    >
                      Configuración
                    </a>
                    <a
                      href="/help"
                      className="px-2 py-3 rounded-md hover:bg-accent/50"
                    >
                      Ayuda
                    </a>
                  </nav>
                </div>
              </div>
            </>
          )}
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;