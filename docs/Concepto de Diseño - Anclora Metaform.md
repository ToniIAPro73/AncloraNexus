# Concepto de Diseño - Anclora Metaform

## Análisis de la Situación Actual

### Problemas Identificados en el Diseño Actual
- **Navegación básica**: La navegación superior es funcional pero carece de atractivo visual
- **Layout simple**: El diseño actual es muy básico y no aprovecha el espacio disponible
- **Falta de jerarquía visual**: Los elementos no tienen una clara jerarquía de importancia
- **Colores limitados**: No se aprovecha completamente la paleta de colores de la guía de estilos
- **Experiencia de usuario básica**: Falta de elementos interactivos y feedback visual

### Análisis del Diseño Objetivo
Basándome en la imagen "Diseño aplicación.png", el objetivo es crear:
- **Navegación lateral moderna**: Sidebar con iconos y etiquetas claras
- **Layout de tarjetas**: Organización en tarjetas para diferentes secciones
- **Proceso visual claro**: Pasos numerados para el flujo de conversión
- **Sección de conversiones populares**: Área dedicada a conversiones frecuentes
- **Mejor uso del espacio**: Aprovechamiento completo del viewport

## Concepto de Diseño Propuesto

### 1. Estilo Visual General
- **Tema**: Moderno, profesional, tecnológico
- **Mood**: Confiable, innovador, eficiente
- **Tono**: Profesional pero accesible

### 2. Layout Principal
```
┌─────────────────────────────────────────────────────────┐
│ Header: Logo + Créditos + Usuario                       │
├─────────────┬───────────────────────────────────────────┤
│             │                                           │
│  Sidebar    │           Área Principal                  │
│             │                                           │
│ - Conversor │  ┌─────────────────────────────────────┐  │
│ - Formatos  │  │     Conversor Inteligente           │  │
│ - Historial │  │                                     │  │
│ - Créditos  │  │  [Pasos 1-2-3-4 con tarjetas]      │  │
│ - Planes    │  │                                     │  │
│ - FAQ       │  └─────────────────────────────────────┘  │
│ - Valorac.  │                                           │
│ - Config.   │  ┌─────────────────────────────────────┐  │
│ - Estadíst. │  │    Conversiones Populares          │  │
│             │  │                                     │  │
│             │  │  [Grid de conversiones comunes]    │  │
│             │  └─────────────────────────────────────┘  │
└─────────────┴───────────────────────────────────────────┘
```

### 3. Paleta de Colores (Según Guía de Estilos)
- **Primario**: #006EE6 (Azul Anclora)
- **Secundario**: #00B8D9 (Cian Anclora)
- **Fondo principal**: Gradiente sutil de azules con efecto de ondas
- **Tarjetas**: Fondos semitransparentes con glassmorphism
- **Texto**: Contraste optimizado según WCAG 2.1 AA

### 4. Tipografía
- **Fuente principal**: Inter (ya configurada)
- **Jerarquía**:
  - H1: 32px/28px (desktop/mobile) - Títulos principales
  - H2: 28px/24px - Títulos de sección
  - H3: 24px/20px - Títulos de tarjetas
  - Body: 16px - Texto general

### 5. Componentes Clave

#### Sidebar Navigation
- **Estilo**: Fijo, con iconos y etiquetas
- **Ancho**: 280px en desktop, colapsable en mobile
- **Elementos**: Iconos + texto, hover states, indicador de sección activa
- **Fondo**: Semitransparente con blur

#### Tarjetas de Proceso
- **Diseño**: 4 tarjetas horizontales para el proceso de conversión
- **Estados**: Normal, activo, completado
- **Elementos**: Número de paso, icono, título, contenido dinámico
- **Interacción**: Hover effects, transiciones suaves

#### Conversiones Populares
- **Layout**: Grid responsive (5 columnas desktop, 2-3 mobile)
- **Elementos**: Icono de conversión, formatos, costo en créditos
- **Interacción**: Click para iniciar conversión rápida

### 6. Animaciones y Microinteracciones
- **Transiciones**: 200-300ms ease para hover states
- **Loading states**: Spinners y progress bars elegantes
- **Feedback visual**: Confirmaciones, errores, éxitos
- **Fondo animado**: Gradiente sutil que simula movimiento de ondas

### 7. Responsive Design
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Adaptaciones**:
  - Sidebar colapsable en mobile
  - Grid de conversiones adaptativo
  - Tarjetas de proceso apilables

### 8. Accesibilidad
- **Contraste**: Cumplimiento WCAG 2.1 AA
- **Navegación por teclado**: Focus states visibles
- **Screen readers**: Etiquetas ARIA apropiadas
- **Reducción de movimiento**: Respeto a prefers-reduced-motion

## Plan de Implementación

### Fase 1: Estructura Base
1. Crear nuevo layout con sidebar
2. Implementar sistema de navegación
3. Configurar grid principal

### Fase 2: Componentes Principales
1. Rediseñar tarjetas de proceso de conversión
2. Crear componente de conversiones populares
3. Implementar nuevo header

### Fase 3: Estilos y Animaciones
1. Aplicar nueva paleta de colores
2. Implementar fondo animado
3. Añadir microinteracciones

### Fase 4: Responsive y Testing
1. Optimizar para todos los dispositivos
2. Testing de accesibilidad
3. Refinamiento final

## Resultado Esperado
Una interfaz moderna, intuitiva y atractiva que:
- Mejore significativamente la experiencia de usuario
- Siga fielmente la guía de estilos de Anclora
- Sea completamente responsive
- Cumpla con estándares de accesibilidad
- Genere confianza y profesionalismo

