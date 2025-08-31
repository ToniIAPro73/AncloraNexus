# ðŸš€ Instrucciones de InstalaciÃ³n - Anclora Nexus

![Anclora Nexus](../assets/anclora_Nexus_logo.png)

**Tu Contenido, Reinventado**

## ðŸ“‹ Resumen
Este paquete contiene 6 nuevos conversores para Anclora Nexus que aÃ±aden soporte para:
- **TXT â†’ HTML** (PÃ¡ginas web)
- **TXT â†’ DOC** (Microsoft Word)
- **TXT â†’ MD** (Markdown)
- **TXT â†’ RTF** (Rich Text Format)
- **TXT â†’ ODT** (OpenDocument Text)
- **TXT â†’ TEX** (LaTeX para acadÃ©micos)

## ðŸ“ Estructura del Paquete
```
anclora_integration_package/
â”œâ”€â”€ converters/                 # Conversores JavaScript
â”‚   â”œâ”€â”€ TxtToHtmlConverter.js
â”‚   â”œâ”€â”€ TxtToDocConverter.js
â”‚   â”œâ”€â”€ TxtToMarkdownConverter.js
â”‚   â”œâ”€â”€ TxtToRtfConverter.js
â”‚   â”œâ”€â”€ TxtToOdtConverter.js
â”‚   â””â”€â”€ TxtToTexConverter.js
â”œâ”€â”€ components/                 # Componente React actualizado
â”‚   â””â”€â”€ UniversalConverter.tsx
â”œâ”€â”€ instructions/               # DocumentaciÃ³n
â”‚   â”œâ”€â”€ INSTALACION.md
â”‚   â””â”€â”€ PRUEBAS.md
â””â”€â”€ package.json               # Dependencias necesarias
```

## ðŸ”§ Pasos de InstalaciÃ³n

### 1. **Instalar Dependencias**
En tu proyecto Anclora, ejecuta:
```bash
npm install docx jszip
```

### 2. **Copiar Conversores**
Copia los archivos de conversores a tu proyecto:
```bash
# Desde el directorio del paquete
cp converters/*.js /ruta/a/tu/proyecto/frontend/converters/
```

### 3. **Actualizar UniversalConverter**
Reemplaza tu archivo `UniversalConverter.tsx` actual con el nuevo:
```bash
cp components/UniversalConverter.tsx /ruta/a/tu/proyecto/frontend/components/
```

### 4. **Verificar Imports**
AsegÃºrate de que las rutas de importaciÃ³n en `UniversalConverter.tsx` coincidan con tu estructura:
```typescript
import TxtToHtmlConverter from '../converters/TxtToHtmlConverter';
import TxtToDocConverter from '../converters/TxtToDocConverter';
import TxtToMarkdownConverter from '../converters/TxtToMarkdownConverter';
import TxtToRtfConverter from '../converters/TxtToRtfConverter';
import TxtToOdtConverter from '../converters/TxtToOdtConverter';
```

## ðŸŽ¯ ConfiguraciÃ³n EspecÃ­fica

### **Frontend (React/TypeScript)**
1. **UbicaciÃ³n de conversores:** `frontend/converters/`
2. **UbicaciÃ³n de componente:** `frontend/components/`
3. **Dependencias requeridas:**
   - `docx`: Para conversiÃ³n a DOC/DOCX
   - `jszip`: Para conversiÃ³n a ODT

### **Backend (si aplica)**
Si usas conversores en el backend:
1. Instala las mismas dependencias
2. Adapta los imports para Node.js
3. Maneja la descarga de archivos segÃºn tu framework

## âš™ï¸ ConfiguraciÃ³n de Webpack/Vite

### **Para Vite (recomendado)**
AÃ±ade a tu `vite.config.ts`:
```typescript
export default defineConfig({
  // ... tu configuraciÃ³n existente
  optimizeDeps: {
    include: ['docx', 'jszip']
  }
});
```

### **Para Webpack**
AÃ±ade a tu configuraciÃ³n:
```javascript
module.exports = {
  // ... tu configuraciÃ³n existente
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer"),
      "stream": require.resolve("stream-browserify")
    }
  }
};
```

## ðŸ” VerificaciÃ³n de InstalaciÃ³n

### **1. Verificar Dependencias**
```bash
npm list docx jszip
```

### **2. Verificar Archivos**
Confirma que estos archivos existen:
- `frontend/converters/TxtToHtmlConverter.js`
- `frontend/converters/TxtToDocConverter.js`
- `frontend/converters/TxtToMarkdownConverter.js`
- `frontend/converters/TxtToRtfConverter.js`
- `frontend/converters/TxtToOdtConverter.js`
- `frontend/components/UniversalConverter.tsx`

### **3. Probar CompilaciÃ³n**
```bash
npm run dev
# o
npm run build
```

## ðŸš¨ SoluciÃ³n de Problemas

### **Error: Module not found**
- Verifica que las rutas de import sean correctas
- Confirma que los archivos estÃ¡n en las ubicaciones correctas

### **Error: docx is not a constructor**
- Verifica que `docx` estÃ© instalado: `npm install docx`
- Reinicia el servidor de desarrollo

### **Error: JSZip is not defined**
- Verifica que `jszip` estÃ© instalado: `npm install jszip`
- Para uso en navegador, incluye el CDN si es necesario

### **Error de TypeScript**
Si usas TypeScript, instala los tipos:
```bash
npm install --save-dev @types/jszip
```

## ðŸ“ Notas Importantes

1. **Compatibilidad:** Los conversores funcionan tanto en navegador como en Node.js
2. **TamaÃ±o:** Los archivos generados son optimizados para tamaÃ±o y compatibilidad
3. **Formatos:** Todos los formatos generados son estÃ¡ndar y compatibles con software comÃºn
4. **Rendimiento:** Las conversiones son instantÃ¡neas para archivos de texto tÃ­picos

## ðŸŽ‰ Â¡Listo!

Una vez completada la instalaciÃ³n, tu Anclora Converter tendrÃ¡:
- âœ… 9 formatos de conversiÃ³n total (vs 4 anteriores)
- âœ… Paridad competitiva completa
- âœ… Conversores probados y validados
- âœ… Interfaz actualizada con nuevos formatos

Para probar los conversores, consulta `PRUEBAS.md`.


