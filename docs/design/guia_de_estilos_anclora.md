# Guía de Estilos Anclora

## 1. Introducción

Define las bases de diseño para todas las plataformas de Anclora: web, móvil y documentación. Incluye:

- Tokens de diseño centralizados.
- Principios de tipografía, color y espaciado.
- Sistemas de grid y responsive.
- Componentes reutilizables.
- Accesibilidad y guidelines de interacción.
- Ejemplos de implementación.

---

## 2. Identidad de Marca

**Objetivo:** Mantener la integridad del logotipo y tono visual.

1. **Logotipo**
   - Usa siempre la versión SVG oficial.
   - Respeta zona de reserva: 50% de la altura.
   - **Ejemplo**:
     ```html
     <div class="navbar h-16 flex items-center">
       <img src="logo.svg" alt="Anclora" class="mx-8 h-full" />
     </div>
     ```
2. **Variaciones y fondos**
   - Sobre fondos oscuros, usa versión blanca.
   - Nunca modifiques proporciones ni colores.
   - **Ejemplo CSS**:
     ```css
     .logo-dark { filter: invert(100%); }
     ```
3. **Tono visual**
   - Profesional, náutico y moderno.
   - Evita texturas recargadas.
   - **Ejemplo de hero**:
     ```html
     <section class="hero text-center py-16 relative">
       <img src="wave.svg" class="absolute inset-0 w-full opacity-10" alt=""/>
       <h1 class="text-h1 text-primary relative">Bienvenido a Anclora</h1>
     </section>
     ```

---

## 3. Paleta de Colores

**Objetivo:** Roles claros, contraste y consistencia.

| Rol           | Variable CSS          | Valor   | Uso                     |
| ------------- | --------------------- | ------- | ----------------------- |
| Primario      | `--color-primary`     | #006EE6 | CTA principal, enlaces  |
| Secundario    | `--color-secondary`   | #00B8D9 | CTA secundaria, iconos  |
| Éxito         | `--color-success`     | #28A745 | Confirmaciones          |
| Advertencia   | `--color-warning`     | #FFC107 | Precauciones            |
| Peligro       | `--color-danger`      | #DC3545 | Errores críticos        |
| Neutro Claro  | `--color-neutral-100` | #FFFFFF | Fondos principales      |
| Neutro 200    | `--color-neutral-200` | #F5F5F5 | Superficies secundarias |
| Neutro Oscuro | `--color-neutral-900` | #0D0D0D | Texto principal         |

**Ejemplos de componentes:**

```css
.button-primary { background: var(--color-primary); color: var(--color-neutral-100); }
.card { background: var(--color-neutral-200); border: 1px solid var(--color-neutral-200); }
.alert-error { background: var(--color-danger); color: var(--color-neutral-100); }
```

---

## 4. Tipografía

**Objetivo:** Legibilidad y jerarquía clara.

1. **Familias y carga**
   ```css
   @import url('https://fonts.apple.com/sf-pro-display.css');
   :root { --font-heading: 'SF Pro Display', -apple-system, sans-serif; }
   ```
2. **Escala tipográfica**
   | Elemento | Tamaño | Peso | Line-height | Clase Tailwind        |
   | -------- | ------ | ---- | ----------- | --------------------- |
   | h1       | 32px   | 700  | 1.2         | `text-h1 font-bold`   |
   | h2       | 28px   | 700  | 1.2         | `text-h2 font-bold`   |
   | h3       | 24px   | 500  | 1.3         | `text-h3 font-medium` |
   | body     | 16px   | 400  | 1.5         | `text-body`           |
   | small    | 12px   | 400  | 1.5         | `text-caption`        |
3. **Aplicación global**
   ```css
   @layer base {
     h1 { font: 700/1.2 var(--font-heading); }
     p { font: 400/1.5 var(--font-body); }
   }
   ```
4. **Ejemplo React**
   ```jsx
   function Hero() {
     return <h2 className="text-h2">Descubre Anclora</h2>;
   }
   ```

---

## 5. Espaciado y Grid

**Objetivo:** Consistencia y modularidad.

1. **Sistema de espaciado (8px)**
   | Token       | Valor |
   | ----------- | ----- |
   | `--space-1` | 8px   |
   | `--space-2` | 16px  |
   | `--space-3` | 24px  |
   | `--space-4` | 32px  |
2. **Grid 12 columnas**
   ```css
   .container { max-width:1024px; margin:0 auto; padding:0 var(--space-2); }
   .row { display:grid; grid-template-columns: repeat(12,1fr); gap:var(--space-2); }
   .col-6 { grid-column: span 6; }
   ```
3. **Ejemplo HTML**
   ```html
   <div class="container row">
     <div class="col-4">A</div>
     <div class="col-8">B</div>
   </div>
   ```

---

## 6. Iconografía

**Objetivo:** Uniformidad y escalabilidad.

1. **Uso de Material Symbols Rounded**
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded" rel="stylesheet" />
   ```
2. **Clases y tamaños**
   ```css
   .icon { font-family: 'Material Symbols Rounded'; font-variation-settings: 'FILL' 0, 'wght' 400; font-size:24px; }
   .icon-lg { font-size:32px; }
   .icon-active { color: var(--color-primary); }
   ```
3. **Ejemplo**
   ```html
   <span class="icon">anchor</span>
   <span class="icon icon-active">anchor</span>
   ```

---

## 7. Componentes UI

**Objetivo:** Biblioteca coherente y accesible.

1. **Botón Primario**
   ```html
   <button class="px-6 py-2 bg-primary text-neutral-100 rounded transition-fast hover:bg-primary-dark">
     Acción
   </button>
   ```
2. **Tarjeta**
   ```html
   <div class="bg-neutral-200 p-4 rounded shadow-sm">
     <h3 class="text-h3">Título</h3>
     <p class="text-body">Texto descriptivo.</p>
   </div>
   ```
3. **Entrada de texto**
   ```html
   <label class="text-body" for="name">Nombre</label>
   <input id="name" type="text" class="w-full border p-2 rounded focus:outline-primary" />
   ```
4. **Modal**
   ```html
   <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
     <div class="bg-neutral-100 p-8 rounded-lg max-w-md">
       <h4 class="text-h4 mb-4">¿Eliminar?</h4>
       <button class="bg-danger text-neutral-100 px-4 py-2 rounded">Confirmar</button>
     </div>
   </div>
   ```

---

## 8. Accesibilidad

**Objetivo:** Cumplir WCAG 2.1 AA y mejorar UX.

1. **Contraste**
   - Herramienta: WebAIM Contrast Checker.
   - **Colores recomendados**: primario/neutral-100 = 7.7:1.
2. **Foco**
   ```css
   :focus { outline: 2px solid var(--color-secondary); outline-offset:2px; }
   ```
3. **Alternativas textuales**
   - Imágenes sin texto: `alt="Descripción de la imagen"`.
4. **Ejemplo ARIA-label**
   ```html
   <button aria-label="Cerrar ventana">✕</button>
   ```

---

## 9. Motion & Transiciones

**Objetivo:** Mejora percepción sin distraer.

1. **Transiciones comunes**
   ```css
   .transition-fast { transition: opacity 150ms ease-in-out, transform 150ms ease-in-out; }
   .transition-medium { transition: all 300ms ease; }
   ```
2. **Animación de spinner**
   ```css
   @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
   .spinner { width:24px; height:24px; border:3px solid #ccc; border-top-color: var(--color-primary); border-radius:50%; animation: spin 1s linear infinite; }
   ```

---

## 10. Tokens de Diseño (Appendix)

Referencia completa en `src/styles/design-tokens.json`. Incluye:

- Colores, tipografía, espaciado.
- Breakpoints y variables de tema.

---

## 11. Responsive & Breakpoints

**Objetivo:** Adaptación fluida.

1. **Breakpoints**
   | Label | Min-width | Uso recomendado    |
   | ----- | --------- | ------------------ |
   | `sm`  | 640px     | Móviles grandes    |
   | `md`  | 768px     | Tablets            |
   | `lg`  | 1024px    | Escritorio mediano |
   | `xl`  | 1280px    | Escritorio amplio  |
2. **Ejemplo CSS**
   ```css
   @media (min-width: 768px) {
     .text-body { font-size:18px; }
     .row { grid-template-columns: repeat(8,1fr); }
   }
   ```

---

## 12. Dark Mode & Theming

**Objetivo:** Experiencia coherente en entornos oscuros.

1. **Variables**
   ```css
   :root { --bg: var(--color-neutral-100); --text: var(--color-neutral-900); }
   [data-theme="dark"] { --bg: #121212; --text: #E0E0E0; }
   ```
2. **Toggle en JS**
   ```js
   const toggleTheme = () => {
     const html = document.documentElement;
     html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
   };
   ```

---

## 13. Estados de Componentes & Feedback

**Objetivo:** Respuestas claras a la interacción.

1. **Hover/Active**
   ```css
   .btn:hover { background: var(--color-primary-dark); }
   .btn:active { transform: scale(0.97); }
   ```
2. **Disabled**
   ```css
   .btn:disabled, .input:disabled { opacity:0.5; cursor:not-allowed; }
   ```
3. **Loading**
   ```jsx
   function LoadButton({loading, children}) {
     return <button disabled={loading}>{loading ? <span className="spinner"/> : children}</button>;
   }
   ```

---

## 14. Accesibilidad Avanzada (ARIA & Keyboard)

1. **Roles y atributos**
   ```html
   <nav role="navigation">…</nav>
   <main role="main">…</main>
   <footer role="contentinfo">…</footer>
   ```
2. **Tabindex**
   - Evita `tabindex` > 0.
3. **Shortcuts**
   ```js
   document.addEventListener('keydown', e => {
     if(e.key==='Escape') closeDialog();
   });
   ```

---

## 15. Ilustraciones & Fotografía

**Objetivo:** Coherencia en assets.

1. **Estilo**
   - Flat, pocos colores.
2. **Proporciones**
   ```css
   .hero-img { aspect-ratio:16/9; }
   ```
3. **Formatos**
   - SVG, WebP, PNG para transparencias.

---

## 16. Data Visualization (Gráficos & Tablas)

**Objetivo:** Claridad de datos.

1. **Configuración de charts**
   ```js
   import { Line } from 'react-chartjs-2';
   const options = {
     plugins: { legend: { labels: { color: getCSSVar('--color-neutral-900') } } },
   };
   ```
2. **Tablas scrollables**
   ```css
   .table-container { overflow-x:auto; }
   table { min-width:600px; }
   ```

---

## 17. Internacionalización & Localización

**Objetivo:** Preparar para múltiples idiomas.

1. **Librería**: i18next.
2. **Ejemplo JSON**
   ```json
   {
     "es": { "welcome": "Bienvenido" },
     "en": { "welcome": "Welcome" }
   }
   ```
3. **Formatting**
   ```js
   new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR' }).format(1234.56);
   ```

---

## 18. Proceso de Handoff Diseño–Desarrollo

**Objetivo:** Agilizar colaboración.

1. **Figma**: componentes con redlines y tokens.
2. **Automatización**: Style Dictionary para exportar tokens.
3. **Checklist**:
   - Revisión visual, specs y accesibilidad.
   - Tests unitarios de componentes.

---

## 19. Governance & Versionado de Tokens

**Objetivo:** Trazabilidad.

1. **SemVer**:
   - MAJOR: breaking changes.
   - MINOR: nuevas variables.
   - PATCH: ajustes de valores.
2. **Proceso**:
   - PR con CHANGELOG.
   - Aprobación por diseño y QA.

---

## 20. Voice & Tone Guidelines

**Objetivo:** Comunicación clara.

1. **Voice**: directo, profesional.
2. **Tone**: conciso, sin jerga.
3. **Ejemplos**:
   - CTA: “Descargar informe”.
   - Error: “No se pudo cargar. Intenta de nuevo.”

---

## 21. Desarrollo de Componentes en React

**Objetivo:** Crear UI reutilizable alineada a los tokens de diseño y a la guía de estilos.

1. **Estructura de un componente Button**:
   ```jsx
   // src/components/Button.jsx
   import React from 'react';

   /**
    * Props:
    * - variant: 'primary' | 'secondary'
    * - disabled: boolean
    * - onClick: function
    */
   export function Button({ variant = 'primary', disabled = false, onClick, children }) {
     const base = 'rounded font-medium transition-fast';
     const styles = {
       primary: 'bg-primary text-neutral-100 hover:bg-primary-dark',
       secondary: 'border border-primary text-primary hover:bg-primary/10'
     };
     return (
       <button
         className={`${base} ${styles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} px-6 py-2`}
         onClick={disabled ? undefined : onClick}
         disabled={disabled}
       >
         {children}
       </button>
     );
   }
   ```
2. **Uso en pantalla**:
   ```jsx
   import { Button } from '@/components/Button';

   function App() {
     return (
       <div className="p-4">
         <Button onClick={() => alert('Clicked!')}>Enviar</Button>
         <Button variant="secondary" disabled>Cancelar</Button>
       </div>
     );
   }
   ```
3. **Tests unitarios con Jest + React Testing Library**:
   ```js
   // src/components/Button.test.jsx
   import { render, fireEvent } from '@testing-library/react';
   import { Button } from './Button';

   test('dispara onClick al pulsar', () => {
     const handle = jest.fn();
     const { getByText } = render(<Button onClick={handle}>Test</Button>);
     fireEvent.click(getByText('Test'));
     expect(handle).toHaveBeenCalled();
   });
   ```

**Ejemplo en Storybook:**

```markdown
![Button Component en Storybook](./screenshots/button-storybook.png)
```

---

## 22. Integración de Tokens en Figma

**Objetivo:** Sincronizar tokens de diseño entre código y prototipo.

1. **Plugin Style Dictionary**:
   - Exporta `design-tokens.json` a un archivo `tokens.json` legible por Figma.
2. **Pasos en Figma**:
   1. Instala el plugin **Figma Tokens**.
   2. Importa `tokens.json` en el plugin.
   3. Asocia estilos de color, tipografía y espaciado:
      - Crea Color Styles con el nombre `Primary / Default`, valor `#006EE6`.
      - Crea Text Styles: `H1 / Bold`, tamaño 32px, línea 1.2.
      - Crea Spacing Tokens: `Spacing / 16` = 16px.
3. **Captura de la interfaz del plugin:**

```markdown
![Figma Tokens Plugin](./screenshots/figma-tokens.png)
```

**Beneficio:** Cambios en tokens se exportan al código automáticamente, evitando discrepancias.

---

## 23. Diseño de Diagramas de Flujo

**Objetivo:** Visualizar procesos de interacción y navegación.

1. **Herramienta recomendada**: **Lucidchart**, **Figma FigJam** o **Miro**.
2. **Convenciones gráficas**:
   - **Rectángulos**: pantallas o componentes (etiqueta con nombre y variante).
   - **Rombos**: decisiones/condiciones (etiqueta con pregunta).
   - **Flechas**: flujos, con label opcional (e.g., "Aceptar", "Cancelar").
3. **Ejemplo ASCII**:
   ```text
       [Login Screen]
            |
        (Credenciales válidas?)
         /           \
       Sí             No
       /               \
   [Dashboard]     [Error modal]
   ```
4. **Ejemplo de prototipo en FigJam**:

```markdown
![Diagrama de flujo en FigJam](./screenshots/figjam-flowchart.png)
```

5. **Captura de pantalla de FigJam**: Inserta un recorte del diagrama de flujo con estilos de Anclora (colores y tipografías) para mostrar un flujo completo.

---

