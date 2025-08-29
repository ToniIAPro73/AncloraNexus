# 🚀 Instrucciones de Instalación - Anclora Metaform

![Anclora Metaform](../assets/anclora_metaform_logo.png)

**Tu Contenido, Reinventado**

## 📋 Resumen
Este paquete contiene 6 nuevos conversores para Anclora Metaform que añaden soporte para:
- **TXT → HTML** (Páginas web)
- **TXT → DOC** (Microsoft Word)
- **TXT → MD** (Markdown)
- **TXT → RTF** (Rich Text Format)
- **TXT → ODT** (OpenDocument Text)
- **TXT → TEX** (LaTeX para académicos)

## 📁 Estructura del Paquete
```
anclora_integration_package/
├── converters/                 # Conversores JavaScript
│   ├── TxtToHtmlConverter.js
│   ├── TxtToDocConverter.js
│   ├── TxtToMarkdownConverter.js
│   ├── TxtToRtfConverter.js
│   ├── TxtToOdtConverter.js
│   └── TxtToTexConverter.js
├── components/                 # Componente React actualizado
│   └── UniversalConverter.tsx
├── instructions/               # Documentación
│   ├── INSTALACION.md
│   └── PRUEBAS.md
└── package.json               # Dependencias necesarias
```

## 🔧 Pasos de Instalación

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
Asegúrate de que las rutas de importación en `UniversalConverter.tsx` coincidan con tu estructura:
```typescript
import TxtToHtmlConverter from '../converters/TxtToHtmlConverter';
import TxtToDocConverter from '../converters/TxtToDocConverter';
import TxtToMarkdownConverter from '../converters/TxtToMarkdownConverter';
import TxtToRtfConverter from '../converters/TxtToRtfConverter';
import TxtToOdtConverter from '../converters/TxtToOdtConverter';
```

## 🎯 Configuración Específica

### **Frontend (React/TypeScript)**
1. **Ubicación de conversores:** `frontend/converters/`
2. **Ubicación de componente:** `frontend/components/`
3. **Dependencias requeridas:**
   - `docx`: Para conversión a DOC/DOCX
   - `jszip`: Para conversión a ODT

### **Backend (si aplica)**
Si usas conversores en el backend:
1. Instala las mismas dependencias
2. Adapta los imports para Node.js
3. Maneja la descarga de archivos según tu framework

## ⚙️ Configuración de Webpack/Vite

### **Para Vite (recomendado)**
Añade a tu `vite.config.ts`:
```typescript
export default defineConfig({
  // ... tu configuración existente
  optimizeDeps: {
    include: ['docx', 'jszip']
  }
});
```

### **Para Webpack**
Añade a tu configuración:
```javascript
module.exports = {
  // ... tu configuración existente
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer"),
      "stream": require.resolve("stream-browserify")
    }
  }
};
```

## 🔍 Verificación de Instalación

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

### **3. Probar Compilación**
```bash
npm run dev
# o
npm run build
```

## 🚨 Solución de Problemas

### **Error: Module not found**
- Verifica que las rutas de import sean correctas
- Confirma que los archivos están en las ubicaciones correctas

### **Error: docx is not a constructor**
- Verifica que `docx` esté instalado: `npm install docx`
- Reinicia el servidor de desarrollo

### **Error: JSZip is not defined**
- Verifica que `jszip` esté instalado: `npm install jszip`
- Para uso en navegador, incluye el CDN si es necesario

### **Error de TypeScript**
Si usas TypeScript, instala los tipos:
```bash
npm install --save-dev @types/jszip
```

## 📝 Notas Importantes

1. **Compatibilidad:** Los conversores funcionan tanto en navegador como en Node.js
2. **Tamaño:** Los archivos generados son optimizados para tamaño y compatibilidad
3. **Formatos:** Todos los formatos generados son estándar y compatibles con software común
4. **Rendimiento:** Las conversiones son instantáneas para archivos de texto típicos

## 📈 Métricas y Logs

Una vez integrado el backend, instala también las dependencias de observabilidad:

```bash
cd backend
pip install -r requirements.txt
```

Desde la raíz del proyecto, copia el archivo de variables de entorno:

```bash
cp .env.example backend/.env
```

Define el nivel de logging con la variable de entorno `LOG_LEVEL` y consulta las métricas en `http://localhost:${PORT:-8000}/metrics`.
El puerto puede configurarse mediante la variable de entorno `PORT` (por defecto `8000`).

## 🎉 ¡Listo!

Una vez completada la instalación, tu Anclora Converter tendrá:
- ✅ 9 formatos de conversión total (vs 4 anteriores)
- ✅ Paridad competitiva completa
- ✅ Conversores probados y validados
- ✅ Interfaz actualizada con nuevos formatos

Para probar los conversores, consulta `PRUEBAS.md`.

