# Reporte de Calidad: HTML a PDF

## Archivo de prueba
- **Archivo**: `docs/design/Anclora Brand & Design System Guide (A4).html`
- **Descripción**: Guía de diseño compleja con CSS avanzado, gradientes, fuentes personalizadas

## Resultados de Conversión

| Método | Estado | Tiempo (s) | Tamaño (KB) | Mensaje |
|--------|--------|------------|-------------|----------|
| Playwright (Chromium) | ✅ | 6.52 | 2610 | Conversión exitosa con Playwright |
| wkhtmltopdf | ❌ | N/A | 0 | Error en wkhtmltopdf: No wkhtmltopdf executable fo... |
| Pandoc | ❌ | N/A | 0 | Error en Pandoc: Pandoc died with exitcode "47" du... |
| WeasyPrint | ❌ | N/A | 0 | Error en WeasyPrint: cannot load library 'libgobje... |
| FPDF (fallback) | ✅ | 0.64 | 36 | Conversión exitosa con FPDF mejorado (estructura p... |

## Recomendaciones

### Método Recomendado: Playwright (Chromium)
- **Razón**: Mayor tamaño de archivo sugiere mejor preservación de elementos visuales
- **Tiempo**: 6.52 segundos
- **Tamaño**: 2,673,164 bytes

### Análisis de Calidad
Para evaluar la calidad visual, compare manualmente:
1. **Preservación de fuentes**: ¿Se mantienen las fuentes personalizadas?
2. **Gradientes y colores**: ¿Se renderizan correctamente los gradientes CSS?
3. **Layout y espaciado**: ¿Se mantiene la estructura original?
4. **Imágenes de fondo**: ¿Se incluyen las imágenes de fondo?
5. **Elementos CSS avanzados**: ¿Se preservan sombras, bordes redondeados, etc.?
