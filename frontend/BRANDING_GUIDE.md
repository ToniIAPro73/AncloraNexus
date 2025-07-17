# 🎨 Guía de Branding - Anclora Metaform

![Anclora Metaform Logo](./assets/anclora_metaform_logo.png)

**Tu Contenido, Reinventado**

## 📋 Identidad de Marca

### **Nombre de la Marca**
- **Empresa Matriz:** Anclora
- **Producto:** Anclora Metaform
- **Tagline:** "Tu Contenido, Reinventado"

### **Filosofía de Marca**
Anclora Metaform representa la transformación inteligente del contenido. Nuestro enfoque es reinventar la manera en que los usuarios interactúan con sus archivos, ofreciendo conversiones potenciadas por IA que van más allá de la simple transformación de formatos.

## 🎨 Elementos Visuales

### **Logo**
- **Archivo:** `anclora_metaform_logo.png`
- **Diseño:** Formas fluidas entrelazadas en azul y azul marino
- **Simbolismo:** Transformación, fluidez, conexión
- **Uso:** Siempre acompañado del nombre "Anclora Metaform"

### **Paleta de Colores**

#### **Colores Primarios**
- **Azul Primario:** `#3b82f6` (RGB: 59, 130, 246)
- **Azul Secundario:** `#2563eb` (RGB: 37, 99, 235)
- **Azul Oscuro:** `#1e40af` (RGB: 30, 64, 175)

#### **Colores Complementarios**
- **Azul Claro:** `#dbeafe` (RGB: 219, 234, 254)
- **Azul Marino:** `#1e293b` (RGB: 30, 41, 59)
- **Gris:** `#64748b` (RGB: 100, 116, 139)

#### **Variables CSS**
```css
:root {
  --anclora-blue-primary: #3b82f6;
  --anclora-blue-secondary: #2563eb;
  --anclora-blue-dark: #1e40af;
  --anclora-blue-light: #dbeafe;
  --anclora-navy: #1e293b;
  --anclora-gray: #64748b;
}
```

### **Tipografía**
- **Fuente Principal:** System fonts (San Francisco, Segoe UI, Roboto)
- **Títulos:** Font-weight 700, color azul oscuro
- **Subtítulos:** Font-weight 500, color azul primario
- **Texto:** Font-weight 400, color gris
- **Tagline:** Font-style italic, font-weight 500

## 🖼️ Uso del Logo

### **Tamaños Recomendados**
- **Desktop Header:** 60px × 60px
- **Mobile Header:** 50px × 50px
- **Favicon:** 32px × 32px
- **Documentación:** 120px × 120px

### **Espaciado**
- **Margen mínimo:** 1rem alrededor del logo
- **Alineación:** Centro o izquierda según contexto
- **Acompañamiento:** Siempre con texto de marca

### **Efectos Visuales**
- **Sombra:** `filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))`
- **Hover:** Ligero aumento de escala (1.05x)
- **Transición:** `transition: all 0.3s ease`

## 📱 Aplicación en Componentes

### **Header de Aplicación**
```jsx
<div className="brand-header">
  <img src={ancloraLogo} alt="Anclora Metaform" className="brand-logo" />
  <div className="brand-text">
    <h1>Anclora Metaform</h1>
    <p className="brand-tagline">Tu Contenido, Reinventado</p>
  </div>
</div>
```

### **Footer de Aplicación**
```jsx
<div className="converter-footer">
  Powered by Anclora Metaform - Tu Contenido, Reinventado
</div>
```

### **Metadatos de Conversores**
```javascript
constructor() {
  this.name = 'Anclora Metaform - [Tipo] Converter';
  this.brand = 'Anclora Metaform';
  this.tagline = 'Tu Contenido, Reinventado';
}
```

## 📄 Aplicación en Documentación

### **Encabezados de Documentos**
```markdown
# 🚀 [Título] - Anclora Metaform

![Anclora Metaform Logo](./assets/anclora_metaform_logo.png)

**Tu Contenido, Reinventado**
```

### **Referencias de Marca**
- Siempre usar "Anclora Metaform" (no "Anclora" solo)
- Incluir tagline en contextos promocionales
- Mantener consistencia en toda la documentación

## 🎯 Principios de Diseño

### **Consistencia Visual**
- Usar paleta de colores definida
- Mantener espaciado uniforme
- Aplicar efectos visuales coherentes

### **Experiencia de Usuario**
- Diseño limpio y profesional
- Navegación intuitiva
- Feedback visual claro

### **Accesibilidad**
- Contraste adecuado para legibilidad
- Tamaños de fuente apropiados
- Soporte para dispositivos móviles

## 🔧 Implementación Técnica

### **Archivos Requeridos**
- `anclora_metaform_logo.png` - Logo principal
- `brand-styles.css` - Estilos de marca
- Variables CSS definidas

### **Componentes Actualizados**
- `UniversalConverter.tsx` - Header con branding
- Todos los conversores - Metadatos de marca
- Documentación - Referencias consistentes

### **Responsive Design**
```css
@media (max-width: 768px) {
  .brand-header {
    flex-direction: column;
    text-align: center;
  }
  
  .brand-logo {
    width: 50px;
    height: 50px;
  }
}
```

## ✅ Checklist de Implementación

### **Componentes React**
- [ ] Logo integrado en header
- [ ] Estilos CSS aplicados
- [ ] Responsive design implementado
- [ ] Metadatos actualizados

### **Conversores**
- [ ] Headers con branding
- [ ] Metadatos de marca
- [ ] Comentarios actualizados

### **Documentación**
- [ ] README con logo
- [ ] Instrucciones con branding
- [ ] Referencias consistentes
- [ ] Guía de branding incluida

### **Assets**
- [ ] Logo en directorio assets
- [ ] Estilos CSS organizados
- [ ] Variables definidas

## 🚀 Resultado Final

Con esta implementación, **Anclora Metaform** tiene una identidad visual homogénea y profesional que:

- **Refuerza la marca** en todos los puntos de contacto
- **Mejora la percepción** de calidad y profesionalismo
- **Facilita el reconocimiento** de marca
- **Mantiene consistencia** en toda la experiencia

---

*Esta guía asegura que todos los elementos de Anclora Metaform mantengan una identidad visual coherente y profesional.*

