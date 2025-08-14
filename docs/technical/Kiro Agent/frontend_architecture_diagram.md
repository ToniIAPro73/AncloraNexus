# Frontend Architecture Diagram

## Current Architecture

```mermaid
graph TD
    A[Next.js App] --> B[pages/_app.tsx]
    B --> C[AuthProvider]
    C --> D[pages/app.tsx]
    D --> E[MainLayout]
    E --> F[Sidebar]
    E --> G[Header]
    E --> H[Children Content]
    E --> I[CreditSystem Context]
    I --> J[CreditBalance]
    I --> K[CreditHistory]
    
    L[pages/landing.tsx] --> M[Landing Page]
    N[pages/index.tsx] --> O[Redirect to /landing]
    
    P[index.css] --> Q[Base Styles]
    R[styles/anclora-animations.css] --> S[Animations]
    T[styles/brand-styles.css] --> U[Brand Styles]
    V[styles/converter-styles.css] --> W[Converter Styles]
```

## Proposed Improved Architecture

```mermaid
graph TD
    A[Next.js App] --> B[pages/_app.tsx]
    B --> C[Providers Wrapper]
    C --> D[AuthProvider]
    C --> E[ThemeProvider]
    C --> F[CreditSystemProvider]
    
    G[pages/app.tsx] --> H[AppLayout]
    H --> I[EnhancedSidebar]
    H --> J[EnhancedHeader]
    H --> K[MainContentRouter]
    
    L[Component Structure] --> M[Layout Components]
    L --> N[UI Components]
    L --> O[Feature Components]
    
    P[State Management] --> Q[Context Providers]
    P --> R[Custom Hooks]
    P --> S[Redux Toolkit]
    
    T[Performance] --> U[Code Splitting]
    T --> V[Lazy Loading]
    T --> W[Optimized Animations]
    
    X[Testing] --> Y[Unit Tests]
    X --> Z[Integration Tests]
    X --> AA[E2E Tests]