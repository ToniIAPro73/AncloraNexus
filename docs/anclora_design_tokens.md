# Tokens de Diseño Anclora - Resumen para Implementación

## Colores
```css
:root {
  --color-primary: #006EE6;
  --color-secondary: #00B8D9;
  --color-success: #28A745;
  --color-warning: #FFC107;
  --color-danger: #DC3545;
  --color-neutral-100: #FFFFFF;
  --color-neutral-200: #F5F5F5;
  --color-neutral-900: #0D0D0D;
}
```

## Tipografía
```css
:root {
  --font-heading: 'SF Pro Display', -apple-system, sans-serif;
  --font-body: 'SF Pro Display', -apple-system, sans-serif;
}

/* Escala tipográfica */
.text-h1 { font-size: 32px; font-weight: 700; line-height: 1.2; }
.text-h2 { font-size: 28px; font-weight: 700; line-height: 1.2; }
.text-h3 { font-size: 24px; font-weight: 500; line-height: 1.3; }
.text-body { font-size: 16px; font-weight: 400; line-height: 1.5; }
.text-caption { font-size: 12px; font-weight: 400; line-height: 1.5; }
```

## Espaciado
```css
:root {
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
}
```

## Componentes Base

### Botón Primario
```css
.button-primary {
  background: var(--color-primary);
  color: var(--color-neutral-100);
  padding: var(--space-1) var(--space-3);
  border-radius: 4px;
  font-weight: 500;
  transition: all 150ms ease-in-out;
}

.button-primary:hover {
  background: #0056B3; /* primary-dark */
}
```

### Botón Secundario
```css
.button-secondary {
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  background: transparent;
  padding: var(--space-1) var(--space-3);
  border-radius: 4px;
  font-weight: 500;
  transition: all 150ms ease-in-out;
}

.button-secondary:hover {
  background: rgba(0, 110, 230, 0.1);
}
```

### Tarjeta
```css
.card {
  background: var(--color-neutral-200);
  padding: var(--space-2);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### Input
```css
.input {
  width: 100%;
  border: 1px solid var(--color-neutral-200);
  padding: var(--space-1);
  border-radius: 4px;
  font-size: 16px;
}

.input:focus {
  outline: 2px solid var(--color-secondary);
  outline-offset: 2px;
}
```

## Transiciones
```css
.transition-fast { transition: opacity 150ms ease-in-out, transform 150ms ease-in-out; }
.transition-medium { transition: all 300ms ease; }
```

## Breakpoints
- sm: 640px (Móviles grandes)
- md: 768px (Tablets)  
- lg: 1024px (Escritorio mediano)
- xl: 1280px (Escritorio amplio)

## Principios de Diseño
1. **Tono visual**: Profesional, náutico y moderno
2. **Accesibilidad**: WCAG 2.1 AA
3. **Contraste**: Mínimo 7.7:1 para texto principal
4. **Espaciado**: Sistema basado en 8px
5. **Iconografía**: Material Symbols Rounded

