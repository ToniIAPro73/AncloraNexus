import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  // Comentamos esta línea ya que la variable no se usa
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('Professional');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const isDark = theme === 'dark';
  
  const styles = {
    container: {
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#f1f5f9' : '#1e293b',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#10b981',
    },
    nav: {
      display: 'flex',
      gap: '2rem',
      alignItems: 'center',
    },
    navLink: {
      color: isDark ? '#cbd5e1' : '#64748b',
      textDecoration: 'none',
      fontSize: '0.9rem',
      cursor: 'pointer',
    },
    button: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
    },
    themeButton: {
      padding: '0.5rem',
      backgroundColor: 'transparent',
      border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
      borderRadius: '0.25rem',
      cursor: 'pointer',
      color: isDark ? '#cbd5e1' : '#64748b',
    },
    hero: {
      textAlign: 'center' as const,
      padding: '4rem 2rem',
      maxWidth: '800px',
      margin: '0 auto',
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      fontSize: '1.25rem',
      color: isDark ? '#94a3b8' : '#64748b',
      marginBottom: '2rem',
      lineHeight: '1.6',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap' as const,
      marginBottom: '3rem',
    },
    secondaryButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: 'transparent',
      color: '#10b981',
      border: '2px solid #10b981',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
    },
    features: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
    },
    featureCard: {
      padding: '2rem',
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      borderRadius: '0.75rem',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      textAlign: 'center' as const,
    },
    featureIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
    },
    featureTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#10b981',
    },
    featureDesc: {
      color: isDark ? '#94a3b8' : '#64748b',
      lineHeight: '1.5',
    },
    pricing: {
      padding: '4rem 2rem',
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      marginTop: '4rem',
    },
    pricingTitle: {
      textAlign: 'center' as const,
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '3rem',
      color: isDark ? '#f1f5f9' : '#1e293b',
    },
    pricingGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    pricingCard: {
      padding: '2rem',
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      borderRadius: '0.75rem',
      border: `2px solid ${selectedPlan === 'Professional' ? '#10b981' : (isDark ? '#334155' : '#e2e8f0')}`,
      textAlign: 'center' as const,
      cursor: 'pointer',
      position: 'relative' as const,
    },
    planName: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#10b981',
    },
    planPrice: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
    },
    planDesc: {
      color: isDark ? '#94a3b8' : '#64748b',
      marginBottom: '2rem',
      lineHeight: '1.5',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>Anclora Nexus</div>
        <nav style={styles.nav}>
          <a href="#features" style={styles.navLink}>Características</a>
          <a href="#pricing" style={styles.navLink}>Precios</a>
          <button style={styles.themeButton} onClick={toggleTheme}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <button style={styles.button} onClick={onEnterApp}>
            Acceder
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.title}>
          Tu contenido, reinventado
        </h1>
        <p style={styles.subtitle}>
          Transforma tus documentos con la potencia de la inteligencia artificial. 
          Convierte, optimiza y crea contenido profesional en segundos.
        </p>
        <div style={styles.buttonGroup}>
          <button style={styles.button} onClick={onEnterApp}>
            Comenzar ahora
          </button>
          <button style={styles.secondaryButton}>
            Ver demo
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '4rem 0' }}>
        <h2 style={{ ...styles.pricingTitle, marginTop: 0 }}>
          Características principales
        </h2>
        <div style={styles.features}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔄</div>
            <h3 style={styles.featureTitle}>Conversión inteligente</h3>
            <p style={styles.featureDesc}>
              Convierte entre múltiples formatos con precisión y calidad profesional
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⚡</div>
            <h3 style={styles.featureTitle}>Procesamiento rápido</h3>
            <p style={styles.featureDesc}>
              Tecnología de vanguardia para resultados en tiempo récord
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔒</div>
            <h3 style={styles.featureTitle}>Seguridad total</h3>
            <p style={styles.featureDesc}>
              Tus documentos están protegidos con encriptación de nivel empresarial
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={styles.pricing}>
        <h2 style={styles.pricingTitle}>Planes de precios</h2>
        <div style={styles.pricingGrid}>
          <div 
            style={{
              ...styles.pricingCard,
              borderColor: selectedPlan === 'Básico' ? '#10b981' : (isDark ? '#334155' : '#e2e8f0')
            }}
            onClick={() => setSelectedPlan('Básico')}
          >
            <h3 style={styles.planName}>Básico</h3>
            <div style={styles.planPrice}>Gratis</div>
            <p style={styles.planDesc}>
              Perfecto para empezar a explorar las capacidades de conversión
            </p>
            <button style={styles.button} onClick={onEnterApp}>
              Comenzar gratis
            </button>
          </div>

          <div 
            style={{
              ...styles.pricingCard,
              borderColor: selectedPlan === 'Professional' ? '#10b981' : (isDark ? '#334155' : '#e2e8f0')
            }}
            onClick={() => setSelectedPlan('Professional')}
          >
            <h3 style={styles.planName}>Professional</h3>
            <div style={styles.planPrice}>€19/mes</div>
            <p style={styles.planDesc}>
              Funciones avanzadas y mayor capacidad para uso profesional
            </p>
            <button style={styles.button} onClick={onEnterApp}>
              Elegir plan
            </button>
          </div>

          <div 
            style={{
              ...styles.pricingCard,
              borderColor: selectedPlan === 'Enterprise' ? '#10b981' : (isDark ? '#334155' : '#e2e8f0')
            }}
            onClick={() => setSelectedPlan('Enterprise')}
          >
            <h3 style={styles.planName}>Enterprise</h3>
            <div style={styles.planPrice}>Personalizado</div>
            <p style={styles.planDesc}>
              Soluciones a medida para empresas con necesidades específicas
            </p>
            <button style={styles.button} onClick={onEnterApp}>
              Contactar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
