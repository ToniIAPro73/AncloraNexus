# ðŸŽ¨ GuÃ­a de Branding - Anclora Nexus

![Anclora Nexus Logo](./assets/anclora_Nexus_logo.png)

## Tu Contenido, Reinventado

## ðŸ“‹ Identidad de Marca

### **Nombre de la Marca**

- **Empresa Matriz:** Anclora
- **Producto:** Anclora Nexus
- **Tagline:** "Tu Contenido, Reinventado"

### **FilosofÃ­a de Marca**

Anclora Nexus representa la transformaciÃ³n inteligente del contenido. Nuestro enfoque es reinventar la manera en que los usuarios interactÃºan con sus archivos, ofreciendo conversiones potenciadas por IA que van mÃ¡s allÃ¡ de la simple transformaciÃ³n de formatos.

## ðŸŽ¨ Elementos Visuales

### **Logo**

- **Archivo:** `anclora_Nexus_logo.png`
- **DiseÃ±o:** Formas fluidas entrelazadas en azul y azul marino
- **Simbolismo:** TransformaciÃ³n, fluidez, conexiÃ³n
- **Uso:** Siempre acompaÃ±ado del nombre "Anclora Nexus"

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

### **TipografÃ­a**

- **Fuente Principal:** System fonts (San Francisco, Segoe UI, Roboto)
- **TÃ­tulos:** Font-weight 700, color azul oscuro
- **SubtÃ­tulos:** Font-weight 500, color azul primario
- **Texto:** Font-weight 400, color gris
- **Tagline:** Font-style italic, font-weight 500

## ðŸ–¼ï¸ Uso del Logo

### **TamaÃ±os Recomendados**

- **Desktop Header:** 60px Ã— 60px
- **Mobile Header:** 50px Ã— 50px
- **Favicon:** 32px Ã— 32px
- **DocumentaciÃ³n:** 120px Ã— 120px

### **Espaciado**

- **Margen mÃ­nimo:** 1rem alrededor del logo
- **AlineaciÃ³n:** Centro o izquierda segÃºn contexto
- **AcompaÃ±amiento:** Siempre con texto de marca

### **Efectos Visuales**

- **Sombra:** `filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))`
- **Hover:** Ligero aumento de escala (1.05x)
- **TransiciÃ³n:** `transition: all 0.3s ease`

## ðŸ“± AplicaciÃ³n en Componentes

### **Header de AplicaciÃ³n**

```jsx
<div className="brand-header">
  <img src={ancloraLogo} alt="Anclora Nexus" className="brand-logo" />
  <div className="brand-text">
    <h1>Anclora Nexus</h1>
    <p className="brand-tagline">Tu Contenido, Reinventado</p>
  </div>
</div>
```

### **Footer de AplicaciÃ³n**

```jsx
<div className="converter-footer">
  Powered by Anclora Nexus - Tu Contenido, Reinventado
</div>
```

### **Metadatos de Conversores**

```javascript
constructor() {
  this.name = 'Anclora Nexus - [Tipo] Converter';
  this.brand = 'Anclora Nexus';
  this.tagline = 'Tu Contenido, Reinventado';
}
```

## ðŸ“„ AplicaciÃ³n en DocumentaciÃ³n

### **Encabezados de Documentos**

```markdown
# ðŸš€ [TÃ­tulo] - Anclora Nexus

![Anclora Nexus Logo](./assets/anclora_Nexus_logo.png)

**Tu Contenido, Reinventado**
```

### **Referencias de Marca**

- Siempre usar "Anclora Nexus" (no "Anclora" solo)
- Incluir tagline en contextos promocionales
- Mantener consistencia en toda la documentaciÃ³n

### **Estructura de Tests**

- Documentar la nueva estructura de tests en `backend/tests/` y `frontend/tests/`
- Incluir ejemplos de ejecuciÃ³n de tests en la documentaciÃ³n
- Mantener referencias consistentes a la nueva estructura

## ðŸŽ¯ Principios de DiseÃ±o

### **Consistencia Visual**

- Usar paleta de colores definida
- Mantener espaciado uniforme
- Aplicar efectos visuales coherentes

### **Experiencia de Usuario**

- DiseÃ±o limpio y profesional
- NavegaciÃ³n intuitiva
- Feedback visual claro

### **Accesibilidad**

- Contraste adecuado para legibilidad
- TamaÃ±os de fuente apropiados
- Soporte para dispositivos mÃ³viles

## ðŸ”§ ImplementaciÃ³n TÃ©cnica

### **Archivos Requeridos**

- `anclora_Nexus_logo.png` - Logo principal
- `brand-styles.css` - Estilos de marca
- Variables CSS definidas

### **Componentes Actualizados**

- `UniversalConverter.tsx` - Header con branding
- Todos los conversores - Metadatos de marca
- DocumentaciÃ³n - Referencias consistentes

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

### **Utilidades de Layout Responsivo**

- `AppLayout` emplea **CSS Grid** con Ã¡reas nombradas `sidebar`, `header` y `main` para organizar la aplicaciÃ³n.
- Se habilitÃ³ el plugin `@tailwindcss/container-queries` para usar `@container` y adaptar las columnas segÃºn el ancho del contenedor.
- Ejemplo:

```jsx
<section className="@container">
  <div className="grid grid-cols-1 @[30rem]:grid-cols-2 @[48rem]:grid-cols-3">
    {/* cards */}
  </div>
</section>
```

## âœ… Checklist de ImplementaciÃ³n

### **Componentes React**

- [ ] Logo integrado en header
- [ ] Estilos CSS aplicados
- [ ] Responsive design implementado
- [ ] Metadatos actualizados

### **Conversores**

- [ ] Headers con branding
- [ ] Metadatos de marca
- [ ] Comentarios actualizados

### **DocumentaciÃ³n**

- [ ] README con logo
- [ ] Instrucciones con branding
- [ ] Referencias consistentes
- [ ] GuÃ­a de branding incluida
- [ ] Estructura de tests documentada

### **Assets**

- [ ] Logo en directorio assets
- [ ] Estilos CSS organizados
- [ ] Variables definidas

### **Tests**

- [ ] Estructura de tests backend actualizada
- [ ] Estructura de tests frontend actualizada
- [ ] Referencias a tests actualizadas

## ðŸš€ Resultado Final

Con esta implementaciÃ³n, **Anclora Nexus** tiene una identidad visual homogÃ©nea y profesional que:

- **Refuerza la marca** en todos los puntos de contacto
- **Mejora la percepciÃ³n** de calidad y profesionalismo
- **Facilita el reconocimiento** de marca
- **Mantiene consistencia** en toda la experiencia

---

*Esta guÃ­a asegura que todos los elementos de Anclora Nexus mantengan una identidad visual coherente y profesional.*

