// Sistema de Feature Flags para entregas parciales
// Permite habilitar/deshabilitar funcionalidades según el plan de lanzamiento

export interface FeatureFlags {
  // Conversores especializados
  ebookConverter: boolean;
  videoConverter: boolean;
  imageConverter: boolean;
  audioConverter: boolean;
  documentConverter: boolean;
  
  // Funcionalidades premium
  batchConversion: boolean;
  priorityProcessing: boolean;
  advancedOptions: boolean;
  apiAccess: boolean;
  webhookNotifications: boolean;
  
  // Funcionalidades experimentales
  aiEnhancement: boolean;
  cloudStorage: boolean;
  collaborativeEditing: boolean;
  
  // Funcionalidades de monetización
  subscriptionPlans: boolean;
  paymentProcessing: boolean;
  usageAnalytics: boolean;
  
  // Funcionalidades de marketing
  referralProgram: boolean;
  promotionalBanners: boolean;
  emailMarketing: boolean;
}

export interface ReleasePhase {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  features: Partial<FeatureFlags>;
  userSegments: string[];
  rolloutPercentage: number;
}

// Configuración de fases de lanzamiento
export const RELEASE_PHASES: ReleasePhase[] = [
  {
    id: 'phase-1-mvp',
    name: 'MVP - Conversor Universal',
    description: 'Lanzamiento inicial con conversor universal y sistema de autenticación',
    targetDate: '2025-02-01',
    features: {
      ebookConverter: false,
      videoConverter: false,
      imageConverter: false,
      audioConverter: false,
      documentConverter: false,
      batchConversion: false,
      priorityProcessing: false,
      advancedOptions: false,
      apiAccess: false,
      webhookNotifications: false,
      aiEnhancement: false,
      cloudStorage: false,
      collaborativeEditing: false,
      subscriptionPlans: true,
      paymentProcessing: true,
      usageAnalytics: true,
      referralProgram: false,
      promotionalBanners: true,
      emailMarketing: true
    },
    userSegments: ['all'],
    rolloutPercentage: 100
  },
  {
    id: 'phase-2-ebooks',
    name: 'Conversor Especializado de E-books',
    description: 'Añadir conversor especializado para libros electrónicos',
    targetDate: '2025-03-01',
    features: {
      ebookConverter: true,
      videoConverter: false,
      imageConverter: false,
      audioConverter: false,
      documentConverter: false,
      batchConversion: true, // Solo para Pro+
      priorityProcessing: true,
      advancedOptions: true,
      apiAccess: false,
      webhookNotifications: false,
      aiEnhancement: false,
      cloudStorage: false,
      collaborativeEditing: false,
      subscriptionPlans: true,
      paymentProcessing: true,
      usageAnalytics: true,
      referralProgram: true,
      promotionalBanners: true,
      emailMarketing: true
    },
    userSegments: ['all'],
    rolloutPercentage: 100
  },
  {
    id: 'phase-3-video',
    name: 'Conversor Especializado de Video',
    description: 'Añadir conversor especializado para archivos de video',
    targetDate: '2025-04-15',
    features: {
      ebookConverter: true,
      videoConverter: true,
      imageConverter: false,
      audioConverter: false,
      documentConverter: false,
      batchConversion: true,
      priorityProcessing: true,
      advancedOptions: true,
      apiAccess: true, // Para Business+
      webhookNotifications: true,
      aiEnhancement: false,
      cloudStorage: true,
      collaborativeEditing: false,
      subscriptionPlans: true,
      paymentProcessing: true,
      usageAnalytics: true,
      referralProgram: true,
      promotionalBanners: true,
      emailMarketing: true
    },
    userSegments: ['all'],
    rolloutPercentage: 100
  },
  {
    id: 'phase-4-image-audio',
    name: 'Conversores de Imagen y Audio',
    description: 'Añadir conversores especializados para imágenes y audio',
    targetDate: '2025-06-01',
    features: {
      ebookConverter: true,
      videoConverter: true,
      imageConverter: true,
      audioConverter: true,
      documentConverter: false,
      batchConversion: true,
      priorityProcessing: true,
      advancedOptions: true,
      apiAccess: true,
      webhookNotifications: true,
      aiEnhancement: true, // Beta para Enterprise
      cloudStorage: true,
      collaborativeEditing: false,
      subscriptionPlans: true,
      paymentProcessing: true,
      usageAnalytics: true,
      referralProgram: true,
      promotionalBanners: true,
      emailMarketing: true
    },
    userSegments: ['all'],
    rolloutPercentage: 100
  },
  {
    id: 'phase-5-documents',
    name: 'Conversor Especializado de Documentos',
    description: 'Añadir conversor especializado para documentos complejos',
    targetDate: '2025-08-01',
    features: {
      ebookConverter: true,
      videoConverter: true,
      imageConverter: true,
      audioConverter: true,
      documentConverter: true,
      batchConversion: true,
      priorityProcessing: true,
      advancedOptions: true,
      apiAccess: true,
      webhookNotifications: true,
      aiEnhancement: true,
      cloudStorage: true,
      collaborativeEditing: true,
      subscriptionPlans: true,
      paymentProcessing: true,
      usageAnalytics: true,
      referralProgram: true,
      promotionalBanners: true,
      emailMarketing: true
    },
    userSegments: ['all'],
    rolloutPercentage: 100
  }
];

// Feature flags por defecto (fase actual)
let currentFeatureFlags: FeatureFlags = RELEASE_PHASES[0].features as FeatureFlags;

// Configuración de entorno
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const FEATURE_FLAGS_ENDPOINT = process.env.VITE_FEATURE_FLAGS_ENDPOINT;

class FeatureFlagManager {
  private flags: FeatureFlags;
  private userSegment: string;
  private userId?: string;
  private rolloutPercentage: number = 100;

  constructor() {
    this.flags = { ...currentFeatureFlags };
    this.userSegment = 'all';
    this.loadFeatureFlags();
  }

  // Cargar feature flags desde configuración remota o local
  private async loadFeatureFlags(): Promise<void> {
    try {
      if (FEATURE_FLAGS_ENDPOINT && ENVIRONMENT === 'production') {
        // Cargar desde endpoint remoto en producción
        const response = await fetch(FEATURE_FLAGS_ENDPOINT);
        const remoteFlags = await response.json();
        this.flags = { ...this.flags, ...remoteFlags };
      } else {
        // Usar configuración local en desarrollo
        const currentPhase = this.getCurrentPhase();
        if (currentPhase) {
          this.flags = { ...currentPhase.features } as FeatureFlags;
          this.rolloutPercentage = currentPhase.rolloutPercentage;
        }
      }
    } catch (error) {
      console.warn('Failed to load feature flags, using defaults:', error);
    }
  }

  // Obtener la fase actual basada en la fecha
  private getCurrentPhase(): ReleasePhase | null {
    const now = new Date();
    
    // Encontrar la fase más reciente que ya debería estar activa
    const activePhases = RELEASE_PHASES.filter(phase => 
      new Date(phase.targetDate) <= now
    );
    
    if (activePhases.length === 0) {
      return RELEASE_PHASES[0]; // Usar MVP si no hay fases activas
    }
    
    // Retornar la fase más reciente
    return activePhases[activePhases.length - 1];
  }

  // Verificar si una funcionalidad está habilitada
  public isEnabled(feature: keyof FeatureFlags): boolean {
    // Verificar rollout percentage
    if (!this.isInRollout()) {
      return false;
    }

    // Verificar si la funcionalidad está habilitada
    return this.flags[feature] || false;
  }

  // Verificar si el usuario está en el rollout
  private isInRollout(): boolean {
    if (this.rolloutPercentage >= 100) {
      return true;
    }

    // Usar hash del userId para determinar si está en el rollout
    if (this.userId) {
      const hash = this.hashString(this.userId);
      return (hash % 100) < this.rolloutPercentage;
    }

    // Si no hay userId, usar random
    return Math.random() * 100 < this.rolloutPercentage;
  }

  // Hash simple para consistencia en rollouts
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Configurar usuario para personalización de flags
  public setUser(userId: string, segment: string = 'all'): void {
    this.userId = userId;
    this.userSegment = segment;
    this.loadFeatureFlags(); // Recargar con nueva configuración
  }

  // Obtener todas las flags actuales
  public getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }

  // Obtener información de la fase actual
  public getCurrentPhaseInfo(): ReleasePhase | null {
    return this.getCurrentPhase();
  }

  // Obtener próximas funcionalidades
  public getUpcomingFeatures(): { feature: string; phase: string; date: string }[] {
    const currentPhase = this.getCurrentPhase();
    const currentPhaseIndex = currentPhase ? 
      RELEASE_PHASES.findIndex(p => p.id === currentPhase.id) : -1;
    
    const upcomingFeatures: { feature: string; phase: string; date: string }[] = [];
    
    // Revisar fases futuras
    for (let i = currentPhaseIndex + 1; i < RELEASE_PHASES.length; i++) {
      const phase = RELEASE_PHASES[i];
      
      Object.entries(phase.features).forEach(([feature, enabled]) => {
        if (enabled && !this.flags[feature as keyof FeatureFlags]) {
          upcomingFeatures.push({
            feature,
            phase: phase.name,
            date: phase.targetDate
          });
        }
      });
    }
    
    return upcomingFeatures;
  }

  // Forzar habilitación de una funcionalidad (solo desarrollo)
  public forceEnable(feature: keyof FeatureFlags, enabled: boolean = true): void {
    if (ENVIRONMENT === 'development') {
      this.flags[feature] = enabled;
    }
  }

  // Obtener configuración de marketing para la fase actual
  public getMarketingConfig(): {
    showUpcomingFeatures: boolean;
    showReferralProgram: boolean;
    showPromotionalBanners: boolean;
    upcomingFeatures: { feature: string; phase: string; date: string }[];
  } {
    return {
      showUpcomingFeatures: true,
      showReferralProgram: this.isEnabled('referralProgram'),
      showPromotionalBanners: this.isEnabled('promotionalBanners'),
      upcomingFeatures: this.getUpcomingFeatures()
    };
  }
}

// Instancia global del manager
export const featureFlagManager = new FeatureFlagManager();

// Hook para React
export function useFeatureFlags() {
  return {
    isEnabled: (feature: keyof FeatureFlags) => featureFlagManager.isEnabled(feature),
    getAllFlags: () => featureFlagManager.getAllFlags(),
    getCurrentPhase: () => featureFlagManager.getCurrentPhaseInfo(),
    getUpcomingFeatures: () => featureFlagManager.getUpcomingFeatures(),
    getMarketingConfig: () => featureFlagManager.getMarketingConfig()
  };
}

// Componente HOC para condicionar renderizado
export function withFeatureFlag<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: keyof FeatureFlags,
  fallback?: React.ComponentType<P>
) {
  return function FeatureFlaggedComponent(props: P) {
    const { isEnabled } = useFeatureFlags();
    
    if (isEnabled(feature)) {
      return <WrappedComponent {...props} />;
    }
    
    if (fallback) {
      const FallbackComponent = fallback;
      return <FallbackComponent {...props} />;
    }
    
    return null;
  };
}

// Componente para mostrar funcionalidades próximas
export function UpcomingFeaturesBanner(): JSX.Element | null {
  const { getMarketingConfig } = useFeatureFlags();
  const config = getMarketingConfig();
  
  if (!config.showUpcomingFeatures || config.upcomingFeatures.length === 0) {
    return null;
  }

  const nextFeature = config.upcomingFeatures[0];
  
  return (
    <div className="upcoming-features-banner">
      <div className="banner-content">
        <span className="banner-icon">🚀</span>
        <div className="banner-text">
          <strong>Próximamente:</strong> {nextFeature.feature} en {nextFeature.phase}
        </div>
        <div className="banner-date">
          {new Date(nextFeature.date).toLocaleDateString('es-ES')}
        </div>
      </div>
      
      <style jsx>{`
        .upcoming-features-banner {
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          color: white;
          padding: var(--space-2) var(--space-3);
          border-radius: 8px;
          margin-bottom: var(--space-3);
        }

        .banner-content {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .banner-icon {
          font-size: 20px;
        }

        .banner-text {
          flex: 1;
          font-size: 14px;
        }

        .banner-date {
          font-size: 12px;
          opacity: 0.9;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .banner-content {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-1);
          }
        }
      `}</style>
    </div>
  );
}

// Utilidades para debugging en desarrollo
export const FeatureFlagDebugger = {
  // Mostrar todas las flags en consola
  logAllFlags: () => {
    if (ENVIRONMENT === 'development') {
      console.table(featureFlagManager.getAllFlags());
    }
  },
  
  // Mostrar fase actual
  logCurrentPhase: () => {
    if (ENVIRONMENT === 'development') {
      console.log('Current Phase:', featureFlagManager.getCurrentPhaseInfo());
    }
  },
  
  // Mostrar próximas funcionalidades
  logUpcomingFeatures: () => {
    if (ENVIRONMENT === 'development') {
      console.log('Upcoming Features:', featureFlagManager.getUpcomingFeatures());
    }
  },
  
  // Simular fase específica
  simulatePhase: (phaseId: string) => {
    if (ENVIRONMENT === 'development') {
      const phase = RELEASE_PHASES.find(p => p.id === phaseId);
      if (phase) {
        Object.entries(phase.features).forEach(([feature, enabled]) => {
          featureFlagManager.forceEnable(feature as keyof FeatureFlags, enabled);
        });
        console.log(`Simulating phase: ${phase.name}`);
      }
    }
  }
};

// Exportar para uso en desarrollo
if (ENVIRONMENT === 'development') {
  (window as any).FeatureFlagDebugger = FeatureFlagDebugger;
}

