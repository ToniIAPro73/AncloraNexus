# **Guía de Estilos de Anclora Metaform**

## **1\. Identidad de Marca**

### **Propósito y Visión**

Anclora Metaform es un espacio de trabajo inteligente diseñado para transformar archivos de un formato a otro de manera rápida, precisa y profesional. Nuestra plataforma utiliza inteligencia artificial para analizar documentos y ofrecer siempre la mejor calidad posible.

### **Valores de Marca**

* Innovación: Utilizamos tecnología de vanguardia con IA integrada  
* Precisión: Garantizamos conversiones de alta calidad que mantienen la integridad del formato original  
* Simplicidad: Ofrecemos una experiencia intuitiva que elimina la complejidad  
* Adaptabilidad: Proporcionamos soluciones escalables desde usuarios individuales hasta corporaciones

### **Tono de Voz**

* Directo y claro: Comunicamos de forma concisa y sin jerga técnica innecesaria  
* Profesional pero cercano: Mantenemos un equilibrio entre profesionalidad y accesibilidad  
* Orientado a soluciones: Enfocamos la comunicación en resolver las necesidades del usuario  
* Confiable: Transmitimos seguridad y experiencia en cada interacción

#### **Ejemplos de Tono de Voz**

| Contexto | Ejemplo | |----------|---------| | CTA Principal | "Convierte ahora" | | Mensaje de éxito | "¡Conversión completada\! Tu archivo está listo para descargar." | | Mensaje de error | "No pudimos procesar tu archivo. Por favor, verifica el formato e intenta de nuevo." | | Instrucciones | "Selecciona el formato al que quieres convertir tu archivo." |

## **2\. Paleta de Colores**

### **Colores Primarios**

| Color | Hex | RGB | Uso | |-------|-----|-----|-----| |\#006EE6Azul Anclora | `#006EE6` | `0, 110, 230` | Color principal de marca, CTAs primarios, enlaces | |\#00B8D9Cian Anclora | `#00B8D9` | `0, 184, 217` | Acentos, iconos, elementos secundarios |

### **Colores Secundarios**

| Color | Hex | RGB | Uso | |-------|-----|-----|-----| |\#0050A7Azul Profundo | `#0050A7` | `0, 80, 167` | Hover de elementos primarios, fondos oscuros | |\#00829BCian Profundo | `#00829B` | `0, 130, 155` | Hover de elementos secundarios |

### **Colores de Estado**

| Color | Hex | RGB | Uso | |-------|-----|-----|-----| |\#28A745Verde Éxito | `#28A745` | `40, 167, 69` | Confirmaciones, acciones completadas | |\#FFC107Ámbar Advertencia | `#FFC107` | `255, 193, 7` | Advertencias, acciones que requieren atención | |\#DC3545Rojo Error | `#DC3545` | `220, 53, 69` | Errores, acciones destructivas |

### **Colores Neutros**

| Color | Hex | RGB | Uso | |-------|-----|-----|-----| |\#FFFFFFBlanco | `#FFFFFF` | `255, 255, 255` | Fondos principales, texto sobre fondos oscuros | |\#F5F7FAGris Claro | `#F5F7FA` | `245, 247, 250` | Fondos secundarios, separadores sutiles | |\#E4E7EBGris Medio | `#E4E7EB` | `228, 231, 235` | Bordes, separadores | |\#8492A6Gris | `#8492A6` | `132, 146, 166` | Texto secundario, iconos inactivos | |\#3E4C59Gris Oscuro | `#3E4C59` | `62, 76, 89` | Texto de énfasis secundario | |\#1F2933Negro Anclora | `#1F2933` | `31, 41, 51` | Texto principal, encabezados |

### **Variables CSS**

Css  
Copy  
Paste  
:root {  
  /\* Colores primarios \*/  
  \--color-primary: \#006EE6;  
  \--color-secondary: \#00B8D9;  
    
  /\* Colores secundarios \*/  
  \--color-primary-dark: \#0050A7;  
  \--color-secondary-dark: \#00829B;  
    
  /\* Colores de estado \*/  
  \--color-success: \#28A745;  
  \--color-warning: \#FFC107;  
  \--color-danger: \#DC3545;  
    
  /\* Colores neutros \*/  
  \--color-white: \#FFFFFF;  
  \--color-gray-100: \#F5F7FA;  
  \--color-gray-200: \#E4E7EB;  
  \--color-gray-400: \#8492A6;  
  \--color-gray-700: \#3E4C59;  
  \--color-gray-900: \#1F2933;  
}

## **3\. Tipografía**

### **Familia Tipográfica**

La familia tipográfica principal de Anclora Metaform es Inter, una fuente de código abierto diseñada para alta legibilidad en pantallas.

Css  
Copy  
Paste  
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700\&display=swap');

:root {  
  \--font-primary: 'Inter', \-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;  
}

body {  
  font-family: var(--font-primary);  
}

### **Escala Tipográfica**

#### **Escritorio**

| Elemento | Tamaño | Peso | Line-height | Clase | |----------|--------|------|-------------|-------| | H1 | 32px | 700 | 1.2 | `text-h1` | | H2 | 28px | 700 | 1.2 | `text-h2` | | H3 | 24px | 600 | 1.3 | `text-h3` | | H4 | 20px | 600 | 1.3 | `text-h4` | | Subtítulo | 18px | 500 | 1.4 | `text-subtitle` | | Cuerpo | 16px | 400 | 1.5 | `text-body` | | Pequeño | 14px | 400 | 1.5 | `text-small` | | Micro | 12px | 400 | 1.5 | `text-micro` |

#### **Móvil**

| Elemento | Tamaño | Peso | Line-height | Clase | |----------|--------|------|-------------|-------| | H1 | 28px | 700 | 1.2 | `text-h1` | | H2 | 24px | 700 | 1.2 | `text-h2` | | H3 | 20px | 600 | 1.3 | `text-h3` | | H4 | 18px | 600 | 1.3 | `text-h4` | | Subtítulo | 16px | 500 | 1.4 | `text-subtitle` | | Cuerpo | 16px | 400 | 1.5 | `text-body` | | Pequeño | 14px | 400 | 1.5 | `text-small` | | Micro | 12px | 400 | 1.5 | `text-micro` |

### **Variables CSS**

Css  
Copy  
Paste  
:root {  
  /\* Tamaños de fuente \- Escritorio \*/  
  \--font-size-h1: 2rem;        /\* 32px \*/  
  \--font-size-h2: 1.75rem;     /\* 28px \*/  
  \--font-size-h3: 1.5rem;      /\* 24px \*/  
  \--font-size-h4: 1.25rem;     /\* 20px \*/  
  \--font-size-subtitle: 1.125rem; /\* 18px \*/  
  \--font-size-body: 1rem;      /\* 16px \*/  
  \--font-size-small: 0.875rem; /\* 14px \*/  
  \--font-size-micro: 0.75rem;  /\* 12px \*/  
    
  /\* Pesos de fuente \*/  
  \--font-weight-regular: 400;  
  \--font-weight-medium: 500;  
  \--font-weight-semibold: 600;  
  \--font-weight-bold: 700;  
    
  /\* Line heights \*/  
  \--line-height-tight: 1.2;  
  \--line-height-snug: 1.3;  
  \--line-height-normal: 1.4;  
  \--line-height-relaxed: 1.5;  
}

/\* Media query para móviles \*/  
@media (max-width: 768px) {  
  :root {  
    \--font-size-h1: 1.75rem;    /\* 28px \*/  
    \--font-size-h2: 1.5rem;     /\* 24px \*/  
    \--font-size-h3: 1.25rem;    /\* 20px \*/  
    \--font-size-h4: 1.125rem;   /\* 18px \*/  
    \--font-size-subtitle: 1rem; /\* 16px \*/  
  }  
}

## **4\. Sistema de Espaciado y Rejilla**

### **Sistema de Espaciado**

Anclora Metaform utiliza un sistema de espaciado basado en múltiplos de 4px para mantener consistencia en toda la interfaz.

| Token | Valor | Uso | |-------|-------|-----| | `--space-1` | 4px | Espaciado mínimo, separación entre elementos relacionados | | `--space-2` | 8px | Espaciado estándar, padding interno de componentes pequeños | | `--space-3` | 12px | Espaciado medio, márgenes entre elementos relacionados | | `--space-4` | 16px | Espaciado base, padding estándar de componentes | | `--space-5` | 24px | Espaciado amplio, separación entre secciones relacionadas | | `--space-6` | 32px | Espaciado grande, separación entre secciones principales | | `--space-7` | 48px | Espaciado muy grande, separación entre bloques de contenido | | `--space-8` | 64px | Espaciado máximo, separación entre secciones principales |

### **Sistema de Rejilla (Grid)**

Anclora Metaform utiliza un sistema de rejilla de 12 columnas para layouts flexibles y responsivos.

Css  
Copy  
Paste  
.container {  
  width: 100%;  
  max-width: 1200px;  
  margin: 0 auto;  
  padding: 0 var(--space-4);  
}

.row {  
  display: grid;  
  grid-template-columns: repeat(12, 1fr);  
  gap: var(--space-4);  
}

/\* Clases de columnas \*/  
.col-1 { grid-column: span 1; }  
.col-2 { grid-column: span 2; }  
.col-3 { grid-column: span 3; }  
.col-4 { grid-column: span 4; }  
.col-5 { grid-column: span 5; }  
.col-6 { grid-column: span 6; }  
.col-7 { grid-column: span 7; }  
.col-8 { grid-column: span 8; }  
.col-9 { grid-column: span 9; }  
.col-10 { grid-column: span 10; }  
.col-11 { grid-column: span 11; }  
.col-12 { grid-column: span 12; }

### **Breakpoints**

| Nombre | Valor | Descripción | |--------|-------|-------------| | `xs` | 0px | Móviles pequeños | | `sm` | 640px | Móviles grandes | | `md` | 768px | Tablets | | `lg` | 1024px | Escritorio pequeño | | `xl` | 1280px | Escritorio mediano | | `2xl` | 1536px | Escritorio grande |

Css  
Copy  
Paste  
/\* Media queries \*/  
@media (min-width: 640px) { /\* sm \*/ }  
@media (min-width: 768px) { /\* md \*/ }  
@media (min-width: 1024px) { /\* lg \*/ }  
@media (min-width: 1280px) { /\* xl \*/ }  
@media (min-width: 1536px) { /\* 2xl \*/ }

## **5\. Componentes Base**

### **Botones**

Los botones en Anclora Metaform siguen una jerarquía visual clara para guiar al usuario.

#### **Variantes de Botones**

| Variante | Uso | Clase | |----------|-----|-------| | Primario | Acciones principales, CTAs | `btn-primary` | | Secundario | Acciones alternativas | `btn-secondary` | | Terciario | Acciones menos importantes | `btn-tertiary` | | Peligro | Acciones destructivas | `btn-danger` | | Éxito | Acciones de confirmación | `btn-success` |

#### **Tamaños de Botones**

| Tamaño | Uso | Clase | |--------|-----|-------| | Pequeño | Interfaces densas, acciones secundarias | `btn-sm` | | Mediano (default) | Uso general | `btn` | | Grande | CTAs principales, destacados | `btn-lg` |

#### **Estados de Botones**

| Estado | Apariencia | Clase/Pseudo-clase | |--------|------------|-------------------| | Normal | Color base | \- | | Hover | Oscurecimiento del 10% | `:hover` | | Activo | Oscurecimiento del 15% | `:active` | | Enfocado | Borde de enfoque | `:focus` | | Deshabilitado | Opacidad reducida, cursor no permitido | `:disabled` | | Cargando | Indicador de carga | `.loading` |

Css  
Copy  
Paste  
/\* Base de botones \*/  
.btn {  
  display: inline-flex;  
  align-items: center;  
  justify-content: center;  
  padding: var(--space-2) var(--space-4);  
  border-radius: 6px;  
  font-weight: var(--font-weight-medium);  
  font-size: var(--font-size-body);  
  line-height: var(--line-height-normal);  
  transition: all 0.2s ease;  
  cursor: pointer;  
}

/\* Variantes \*/  
.btn-primary {  
  background-color: var(--color-primary);  
  color: var(--color-white);  
}

.btn-primary:hover {  
  background-color: var(--color-primary-dark);  
}

.btn-secondary {  
  background-color: transparent;  
  color: var(--color-primary);  
  border: 1px solid var(--color-primary);  
}

.btn-secondary:hover {  
  background-color: rgba(0, 110, 230, 0.1);  
}

/\* Estados \*/  
.btn:disabled, .btn.disabled {  
  opacity: 0.5;  
  cursor: not-allowed;  
  pointer-events: none;  
}

.btn.loading {  
  position: relative;  
  color: transparent;  
}

.btn.loading::after {  
  content: "";  
  position: absolute;  
  width: 16px;  
  height: 16px;  
  border: 2px solid rgba(255, 255, 255, 0.3);  
  border-radius: 50%;  
  border-top-color: var(--color-white);  
  animation: spin 1s linear infinite;  
}

@keyframes spin {  
  to { transform: rotate(360deg); }  
}

### **Campos de Entrada (Inputs)**

#### **Variantes de Inputs**

| Variante | Uso | Clase | |----------|-----|-------| | Texto | Entrada de texto estándar | `input` | | Área de texto | Texto multilínea | `textarea` | | Selección | Opciones predefinidas | `select` | | Checkbox | Selección múltiple | `checkbox` | | Radio | Selección única | `radio` | | Archivo | Carga de archivos | `input-file` |

#### **Estados de Inputs**

| Estado | Apariencia | Clase/Pseudo-clase | |--------|------------|-------------------| | Normal | Borde estándar | \- | | Hover | Borde más oscuro | `:hover` | | Enfocado | Borde primario, sombra suave | `:focus` | | Deshabilitado | Opacidad reducida, fondo gris | `:disabled` | | Error | Borde rojo, mensaje de error | `.error` | | Éxito | Borde verde, icono de verificación | `.success` |

Css  
Copy  
Paste  
/\* Base de inputs \*/  
.input-group {  
  margin-bottom: var(--space-4);  
}

.input-label {  
  display: block;  
  margin-bottom: var(--space-2);  
  font-size: var(--font-size-small);  
  font-weight: var(--font-weight-medium);  
  color: var(--color-gray-700);  
}

.input {  
  width: 100%;  
  padding: var(--space-3);  
  border: 1px solid var(--color-gray-200);  
  border-radius: 6px;  
  font-size: var(--font-size-body);  
  line-height: var(--line-height-normal);  
  color: var(--color-gray-900);  
  transition: all 0.2s ease;  
}

.input:hover {  
  border-color: var(--color-gray-400);  
}

.input:focus {  
  outline: none;  
  border-color: var(--color-primary);  
  box-shadow: 0 0 0 3px rgba(0, 110, 230, 0.15);  
}

/\* Estados \*/  
.input:disabled {  
  background-color: var(--color-gray-100);  
  opacity: 0.7;  
  cursor: not-allowed;  
}

.input-group.error .input {  
  border-color: var(--color-danger);  
}

.input-group.error .input:focus {  
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15);  
}

.input-error-message {  
  margin-top: var(--space-1);  
  font-size: var(--font-size-small);  
  color: var(--color-danger);  
}

.input-group.success .input {  
  border-color: var(--color-success);  
}

### **Tarjetas**

Las tarjetas son contenedores versátiles para agrupar información relacionada.

Css  
Copy  
Paste  
.card {  
  background-color: var(--color-white);  
  border-radius: 8px;  
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);  
  overflow: hidden;  
}

.card-header {  
  padding: var(--space-4);  
  border-bottom: 1px solid var(--color-gray-200);  
}

.card-body {  
  padding: var(--space-4);  
}

.card-footer {  
  padding: var(--space-4);  
  border-top: 1px solid var(--color-gray-200);  
  background-color: var(--color-gray-100);  
}

.card-title {  
  margin: 0;  
  font-size: var(--font-size-h4);  
  font-weight: var(--font-weight-semibold);  
  color: var(--color-gray-900);  
}

.card-subtitle {  
  margin-top: var(--space-1);  
  font-size: var(--font-size-small);  
  color: var(--color-gray-400);  
}

### **Modales**

Los modales presentan contenido que requiere atención o acción del usuario.

Css  
Copy  
Paste  
.modal-backdrop {  
  position: fixed;  
  top: 0;  
  left: 0;  
  right: 0;  
  bottom: 0;  
  background-color: rgba(0, 0, 0, 0.5);  
  display: flex;  
  align-items: center;  
  justify-content: center;  
  z-index: 1000;  
}

.modal {  
  background-color: var(--color-white);  
  border-radius: 8px;  
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);  
  width: 100%;  
  max-width: 500px;  
  max-height: 90vh;  
  overflow-y: auto;  
}

.modal-header {  
  display: flex;  
  align-items: center;  
  justify-content: space-between;  
  padding: var(--space-4);  
  border-bottom: 1px solid var(--color-gray-200);  
}

.modal-title {  
  margin: 0;  
  font-size: var(--font-size-h3);  
  font-weight: var(--font-weight-semibold);  
}

.modal-close {  
  background: transparent;  
  border: none;  
  cursor: pointer;  
  font-size: var(--font-size-h4);  
  color: var(--color-gray-400);  
}

.modal-body {  
  padding: var(--space-4);  
}

.modal-footer {  
  display: flex;  
  justify-content: flex-end;  
  gap: var(--space-3);  
  padding: var(--space-4);  
  border-top: 1px solid var(--color-gray-200);  
}

## **6\. Accesibilidad**

### **Contraste de Color**

Todos los colores de Anclora Metaform han sido seleccionados para cumplir con las directrices WCAG 2.1 AA, que requieren:

* Ratio de contraste mínimo de 4.5:1 para texto normal  
* Ratio de contraste mínimo de 3:1 para texto grande (18pt o 14pt en negrita)  
* Ratio de contraste mínimo de 3:1 para elementos de interfaz y gráficos informativos

#### **Ratios de Contraste Verificados**

| Combinación | Ratio | Cumple AA | Uso | |-------------|-------|-----------|-----| | Texto negro (\#1F2933) sobre blanco (\#FFFFFF) | 14.5:1 | ✅ | Texto principal | | Texto gris (\#3E4C59) sobre blanco (\#FFFFFF) | 8.1:1 | ✅ | Texto secundario | | Texto blanco (\#FFFFFF) sobre azul primario (\#006EE6) | 4.7:1 | ✅ | Botones primarios | | Texto azul primario (\#006EE6) sobre blanco (\#FFFFFF) | 4.7:1 | ✅ | Enlaces | | Texto blanco (\#FFFFFF) sobre rojo error (\#DC3545) | 4.6:1 | ✅ | Alertas de error |

### **Enfoque y Navegación por Teclado**

Css  
Copy  
Paste  
/\* Estilo de enfoque visible y consistente \*/  
:focus {  
  outline: 2px solid var(--color-primary);  
  outline-offset: 2px;  
}

/\* Asegurar que los elementos interactivos sean identificables \*/  
a, button, input, select, textarea, \[tabindex\]:not(\[tabindex="-1"\]) {  
  transition: outline-color 0.2s ease;  
}

/\* Ocultar el contorno solo cuando se usa el ratón, mantenerlo para teclado \*/  
.js-focus-visible :focus:not(.focus-visible) {  
  outline: none;  
}

### **Atributos ARIA**

Html  
Copy  
Paste  
\<\!-- Ejemplo de botón con estado de carga \--\>  
\<button   
  class\="btn btn-primary loading"   
  aria-busy\="true"   
  aria-disabled\="true"  
\>  
  Procesando  
\</button\>

\<\!-- Ejemplo de campo con error \--\>  
\<div class\="input-group error"\>  
  \<label for\="email" class\="input-label"\>Correo electrónico\</label\>  
  \<input   
    type\="email"   
    id\="email"   
    class\="input"   
    aria-invalid\="true"   
    aria-describedby\="email-error"  
  \>  
  \<div id\="email-error" class\="input-error-message"\>  
    Por favor, introduce un correo electrónico válido.  
  \</div\>  
\</div\>

\<\!-- Ejemplo de modal accesible \--\>  
\<div   
  class\="modal-backdrop"   
  role\="dialog"   
  aria-modal\="true"   
  aria-labelledby\="modal-title"  
\>  
  \<div class\="modal"\>  
    \<div class\="modal-header"\>  
      \<h2 id\="modal-title" class\="modal-title"\>Confirmar acción\</h2\>  
      \<button   
        class\="modal-close"   
        aria-label\="Cerrar modal"  
      \>×\</button\>  
    \</div\>  
    \<div class\="modal-body"\>  
      \<p\>¿Estás seguro de que quieres realizar esta acción?\</p\>  
    \</div\>  
    \<div class\="modal-footer"\>  
      \<button class\="btn btn-secondary"\>Cancelar\</button\>  
      \<button class\="btn btn-primary"\>Confirmar\</button\>  
    \</div\>  
  \</div\>  
\</div\>

### **Reducción de Movimiento**

Css  
Copy  
Paste  
/\* Respetar las preferencias de reducción de movimiento del usuario \*/  
@media (prefers-reduced-motion: reduce) {  
  \* {  
    animation-duration: 0.01ms \!important;  
    animation-iteration-count: 1 \!important;  
    transition-duration: 0.01ms \!important;  
    scroll-behavior: auto \!important;  
  }  
}

## **7\. Implementación**

### **Estructura de Archivos CSS**

Copy  
Paste  
styles/  
├── base/  
│   ├── \_reset.css  
│   ├── \_typography.css  
│   ├── \_variables.css  
│   └── \_accessibility.css  
├── components/  
│   ├── \_buttons.css  
│   ├── \_cards.css  
│   ├── \_forms.css  
│   ├── \_modals.css  
│   └── \_navigation.css  
├── layout/  
│   ├── \_grid.css  
│   ├── \_header.css  
│   ├── \_footer.css  
│   └── \_sidebar.css  
├── utilities/  
│   ├── \_spacing.css  
│   ├── \_colors.css  
│   ├── \_flexbox.css  
│   └── \_responsive.css  
└── main.css

### **Integración con Tailwind CSS**

Js  
Copy  
Paste  
// tailwind.config.js  
module.exports \= {  
  theme: {  
    extend: {  
      colors: {  
        primary: {  
          DEFAULT: '\#006EE6',  
          dark: '\#0050A7',  
        },  
        secondary: {  
          DEFAULT: '\#00B8D9',  
          dark: '\#00829B',  
        },  
        success: '\#28A745',  
        warning: '\#FFC107',  
        danger: '\#DC3545',  
        gray: {  
          100: '\#F5F7FA',  
          200: '\#E4E7EB',  
          400: '\#8492A6',  
          700: '\#3E4C59',  
          900: '\#1F2933',  
        },  
      },  
      fontFamily: {  
        sans: \['Inter', 'system-ui', 'sans-serif'\],  
      },  
      fontSize: {  
        'h1': \['2rem', { lineHeight: '1.2', fontWeight: '700' }\],  
        'h2': \['1.75rem', { lineHeight: '1.2', fontWeight: '700' }\],  
        'h3': \['1.5rem', { lineHeight: '1.3', fontWeight: '600' }\],  
        'h4': \['1.25rem', { lineHeight: '1.3', fontWeight: '600' }\],  
        'subtitle': \['1.125rem', { lineHeight: '1.4', fontWeight: '500' }\],  
        'body': \['1rem', { lineHeight: '1.5', fontWeight: '400' }\],  
        'small': \['0.875rem', { lineHeight: '1.5', fontWeight: '400' }\],  
        'micro': \['0.75rem', { lineHeight: '1.5', fontWeight: '400' }\],  
      },  
      spacing: {  
        '1': '4px',  
        '2': '8px',  
        '3': '12px',  
        '4': '16px',  
        '5': '24px',  
        '6': '32px',  
        '7': '48px',  
        '8': '64px',  
      },  
      borderRadius: {  
        DEFAULT: '6px',  
        'lg': '8px',  
      },  
      boxShadow: {  
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',  
        DEFAULT: '0 2px 8px rgba(0, 0, 0, 0.08)',  
        'md': '0 4px 16px rgba(0, 0, 0, 0.1)',  
        'lg': '0 10px 25px rgba(0, 0, 0, 0.15)',  
      },  
    },  
  },  
  variants: {  
    extend: {  
      opacity: \['disabled'\],  
      cursor: \['disabled'\],  
      backgroundColor: \['active'\],  
      transform: \['active'\],  
    },  
  },  
  plugins: \[\],  
}

## **8\. Ejemplos de Implementación**

### **Página de Conversión**

Html  
Copy  
Paste  
\<div class\="container py-6"\>  
  \<h1 class\="text-h1 mb-5"\>Conversor Universal\</h1\>  
    
  \<div class\="card mb-6"\>  
    \<div class\="card-body"\>  
      \<h2 class\="text-h3 mb-4"\>Sube tu archivo\</h2\>  
        
      \<div class\="upload-area p-6 border-2 border-dashed border-gray-200 rounded-lg text-center"\>  
        \<div class\="icon-upload text-primary text-h1 mb-3"\>  
          \<span class\="icon"\>cloud\_upload\</span\>  
        \</div\>  
        \<p class\="text-body mb-3"\>Arrastra y suelta tu archivo aquí o\</p\>  
        \<button class\="btn btn-primary"\>Seleccionar archivo\</button\>  
        \<p class\="text-small text-gray-400 mt-3"\>Formatos soportados: TXT, PDF, DOC, HTML, MD\</p\>  
      \</div\>  
    \</div\>  
  \</div\>  
    
  \<div class\="card"\>  
    \<div class\="card-header"\>  
      \<h3 class\="card-title"\>Opciones de conversión\</h3\>  
    \</div\>  
    \<div class\="card-body"\>  
      \<div class\="input-group mb-4"\>  
        \<label for\="format" class\="input-label"\>Formato de destino\</label\>  
        \<select id\="format" class\="input"\>  
          \<option value\="pdf"\>PDF\</option\>  
          \<option value\="html"\>HTML\</option\>  
          \<option value\="doc"\>DOC\</option\>  
          \<option value\="md"\>Markdown\</option\>  
          \<option value\="rtf"\>RTF\</option\>  
        \</select\>  
      \</div\>  
        
      \<div class\="input-group"\>  
        \<label for\="quality" class\="input-label"\>Calidad\</label\>  
        \<div class\="flex items-center"\>  
          \<input type\="range" id\="quality" class\="w-full" min\="1" max\="3" value\="2"\>  
          \<span class\="text-small text-gray-700 ml-3"\>Alta (2 créditos)\</span\>  
        \</div\>  
      \</div\>  
    \</div\>  
    \<div class\="card-footer flex justify-between items-center"\>  
      \<div class\="text-small"\>  
        \<span class\="text-gray-700"\>Créditos disponibles:\</span\>  
        \<span class\="font-semibold"\>8\</span\>  
      \</div\>  
      \<button class\="btn btn-primary"\>Convertir ahora\</button\>  
    \</div\>  
  \</div\>  
\</div\>

### **Componente de Tarjeta de Plan**

Html  
Copy  
Paste  
\<div class\="plan-card card hover:shadow-md transition-shadow"\>  
  \<div class\="card-header bg-primary text-white"\>  
    \<h3 class\="card-title"\>Plan Profesional\</h3\>  
    \<p class\="card-subtitle text-white opacity-80"\>Para equipos y profesionales\</p\>  
  \</div\>  
  \<div class\="card-body"\>  
    \<div class\="text-center mb-4"\>  
      \<span class\="text-h2 font-bold"\>€29.99\</span\>  
      \<span class\="text-small text-gray-400"\>/mes\</span\>  
    \</div\>  
      
    \<ul class\="space-y-3 mb-6"\>  
      \<li class\="flex items-start"\>  
        \<span class\="icon text-success mr-2"\>check\_circle\</span\>  
        \<span\>500 créditos mensuales\</span\>  
      \</li\>  
      \<li class\="flex items-start"\>  
        \<span class\="icon text-success mr-2"\>check\_circle\</span\>  
        \<span\>Acceso a la API\</span\>  
      \</li\>  
      \<li class\="flex items-start"\>  
        \<span class\="icon text-success mr-2"\>check\_circle\</span\>  
        \<span\>Soporte prioritario\</span\>  
      \</li\>  
      \<li class\="flex items-start"\>  
        \<span class\="icon text-success mr-2"\>check\_circle\</span\>  
        \<span\>Workflows personalizados\</span\>  
      \</li\>  
    \</ul\>  
  \</div\>  
  \<div class\="card-footer text-center"\>  
    \<button class\="btn btn-primary w-full"\>Seleccionar plan\</button\>  
  \</div\>  
\</div\>

## **9\. Recursos y Herramientas**

* Figma Community Kit: [Anclora Metaform UI Kit](https://figma.com/)  
* Repositorio de Componentes: [GitHub \- Anclora/design-system](https://github.com/)  
* Herramientas de Accesibilidad:  
  * [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)  
  * [Axe DevTools](https://www.deque.com/axe/)  
* Documentación Adicional:  
  * [Guía de Implementación para Desarrolladores](https://docs.anclora-metaform.com/dev)  
  * [Guía de Uso para Diseñadores](https://docs.anclora-metaform.com/design)

---

Esta guía de estilos es un documento vivo que evolucionará con Anclora Metaform. Para sugerencias o actualizaciones, contacta al equipo de diseño en design@anclora-metaform.com.  
Ask Zencoder. Type @ to attach files or other contexts. Use Ctrl.to select agents.  
