#!/usr/bin/env node

/**
 * Generador de Documentos Reales para Tests de Conversión
 * 
 * Genera documentos reales con contenido variado para probar
 * todas las rutas de conversión identificadas en la matriz.
 */

const fs = require('fs').promises;
const path = require('path');

const REAL_DOCS_DIR = path.join(__dirname, 'real-conversion-docs');

// Contenido real para diferentes tipos de documentos
const REAL_CONTENT = {
  business_report: {
    title: 'Informe Trimestral de Ventas Q3 2025',
    content: `# INFORME TRIMESTRAL DE VENTAS
## Tercer Trimestre 2025

### Resumen Ejecutivo

Durante el tercer trimestre de 2025, la empresa ha experimentado un crecimiento significativo en todas las líneas de producto. Las ventas totales alcanzaron los €2.4 millones, representando un incremento del 18% respecto al trimestre anterior.

### Métricas Clave

| Producto | Q2 2025 | Q3 2025 | Crecimiento |
|----------|---------|---------|-------------|
| Software | €800K   | €950K   | +18.75%     |
| Servicios| €650K   | €780K   | +20.00%     |
| Hardware | €580K   | €670K   | +15.52%     |

### Análisis por Región

**Europa Occidental**: €1.2M (+22%)
- España: €450K
- Francia: €380K  
- Alemania: €370K

**América**: €800K (+15%)
- Estados Unidos: €500K
- Canadá: €180K
- México: €120K

**Asia-Pacífico**: €400K (+12%)
- Japón: €200K
- Australia: €120K
- Singapur: €80K

### Proyecciones Q4 2025

Basándose en las tendencias actuales y la estacionalidad histórica, proyectamos:

- Ventas totales: €2.8M (+16.7%)
- Margen bruto: 68%
- EBITDA: €1.1M

### Recomendaciones Estratégicas

1. **Expansión de mercado**: Incrementar presencia en Asia-Pacífico
2. **Desarrollo de producto**: Lanzar nueva línea de servicios cloud
3. **Optimización operativa**: Automatizar procesos de ventas
4. **Inversión en marketing**: Aumentar presupuesto digital en 25%

### Conclusiones

El Q3 2025 ha sido exitoso, superando las expectativas iniciales. La estrategia de diversificación de productos y expansión geográfica está dando resultados positivos.

---
*Documento confidencial - Solo para uso interno*
*Fecha de generación: ${new Date().toLocaleDateString('es-ES')}*`
  },

  technical_manual: {
    title: 'Manual Técnico - Sistema de Conversión de Archivos',
    content: `# MANUAL TÉCNICO
## Sistema de Conversión de Archivos v2.1

### Introducción

Este manual describe la implementación técnica del sistema de conversión de archivos, incluyendo arquitectura, APIs y procedimientos de mantenimiento.

### Arquitectura del Sistema

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Conversion    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Engine        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Service  │    │   File Storage  │    │   Queue System  │
│   (Supabase)    │    │   (S3/Local)    │    │   (Redis)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

### Componentes Principales

#### 1. Motor de Conversión

**Ubicación**: \`/utils/conversionEngine.ts\`

**Funciones principales**:
- \`findConversionPath(source, target)\`: Encuentra ruta óptima
- \`bfs(start, goal)\`: Algoritmo de búsqueda en anchura
- \`canConvert(source, target)\`: Valida posibilidad de conversión

**Ejemplo de uso**:
\`\`\`typescript
import { findConversionPath } from './utils/conversionEngine';

const result = findConversionPath('docx', 'pdf');
// Resultado: { optimal: true, path: ['docx', 'pdf'] }
\`\`\`

#### 2. Matriz de Conversiones

**Conversiones Intra-categoría**:
- Documentos: PDF ↔ DOCX ↔ TXT ↔ HTML
- Imágenes: JPG ↔ PNG ↔ WebP ↔ GIF
- Audio: MP3 ↔ WAV ↔ FLAC
- Video: MP4 ↔ AVI ↔ WebM

**Conversiones Inter-categoría**:
- Imagen → Documento: JPG/PNG → PDF
- Audio → Video: MP3/WAV → MP4 (con imagen estática)
- Video → Audio: MP4/AVI → MP3/WAV (extracción)

### APIs Disponibles

#### POST /api/convert
Inicia proceso de conversión

**Parámetros**:
\`\`\`json
{
  "sourceFile": "document.docx",
  "targetFormat": "pdf",
  "options": {
    "quality": "high",
    "compression": false
  }
}
\`\`\`

**Respuesta**:
\`\`\`json
{
  "jobId": "conv_123456",
  "status": "processing",
  "estimatedTime": 30,
  "path": ["docx", "pdf"]
}
\`\`\`

#### GET /api/convert/:jobId
Consulta estado de conversión

**Respuesta**:
\`\`\`json
{
  "jobId": "conv_123456",
  "status": "completed",
  "progress": 100,
  "downloadUrl": "/downloads/document.pdf",
  "processingTime": 28
}
\`\`\`

### Configuración de Desarrollo

#### Requisitos del Sistema
- Node.js 18+
- npm 8+
- 4GB RAM mínimo
- 10GB espacio libre

#### Variables de Entorno
\`\`\`bash
# Base de datos
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Almacenamiento
STORAGE_TYPE=local|s3
AWS_BUCKET_NAME=conversions-bucket

# Conversión
MAX_FILE_SIZE=50MB
CONCURRENT_JOBS=3
TIMEOUT_SECONDS=300
\`\`\`

#### Instalación
\`\`\`bash
# Clonar repositorio
git clone https://github.com/user/anclora-converter.git
cd anclora-converter

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env
# Editar .env con tus valores

# Ejecutar en desarrollo
npm run dev
\`\`\`

### Procedimientos de Mantenimiento

#### Limpieza de Archivos Temporales
\`\`\`bash
# Ejecutar diariamente
npm run cleanup:temp

# Limpiar archivos > 24h
find ./temp -type f -mtime +1 -delete
\`\`\`

#### Monitoreo de Performance
\`\`\`bash
# Ver estadísticas de conversión
npm run stats:conversion

# Monitorear uso de memoria
npm run monitor:memory
\`\`\`

#### Backup de Configuración
\`\`\`bash
# Backup semanal
npm run backup:config
tar -czf config-backup-$(date +%Y%m%d).tar.gz config/
\`\`\`

### Solución de Problemas

#### Error: "Conversion timeout"
**Causa**: Archivo muy grande o proceso bloqueado
**Solución**: 
1. Verificar tamaño de archivo (máx 50MB)
2. Reiniciar worker de conversión
3. Aumentar timeout en configuración

#### Error: "Format not supported"
**Causa**: Formato no incluido en matriz de conversión
**Solución**:
1. Verificar extensión de archivo
2. Actualizar matriz en \`conversionMaps.ts\`
3. Implementar convertidor específico

#### Error: "Memory limit exceeded"
**Causa**: Conversión de archivo muy grande
**Solución**:
1. Implementar procesamiento por chunks
2. Aumentar límite de memoria
3. Usar conversión asíncrona

### Métricas y Logging

#### Métricas Clave
- Tiempo promedio de conversión por formato
- Tasa de éxito por tipo de conversión
- Uso de memoria y CPU
- Errores por categoría

#### Configuración de Logs
\`\`\`javascript
// logger.config.js
module.exports = {
  level: 'info',
  format: 'json',
  transports: [
    { type: 'file', filename: 'conversion.log' },
    { type: 'console', colorize: true }
  ]
};
\`\`\`

### Seguridad

#### Validación de Archivos
- Verificación de tipo MIME
- Escaneo de malware
- Límites de tamaño
- Sanitización de nombres

#### Autenticación
- JWT tokens con expiración
- Rate limiting por usuario
- Validación de permisos por operación

---
*Manual actualizado: ${new Date().toLocaleDateString('es-ES')}*
*Versión: 2.1.0*`
  },

  academic_paper: {
    title: 'Análisis Comparativo de Algoritmos de Conversión de Formatos',
    content: `# Análisis Comparativo de Algoritmos de Conversión de Formatos de Archivo
## Un Estudio Empírico sobre Eficiencia y Calidad

**Autores**: Dr. María González¹, Prof. Carlos Rodríguez², Ing. Ana Martín¹

¹Universidad Politécnica de Madrid, ²Instituto Tecnológico de Barcelona

### Resumen

Este estudio presenta un análisis comparativo de diferentes algoritmos utilizados para la conversión entre formatos de archivo digitales. Se evaluaron 15 algoritmos diferentes aplicados a 8 categorías de archivos, midiendo eficiencia computacional, calidad de salida y preservación de metadatos. Los resultados muestran que los algoritmos basados en búsqueda en anchura (BFS) ofrecen el mejor balance entre eficiencia y calidad para rutas de conversión multi-paso.

**Palabras clave**: conversión de archivos, algoritmos de búsqueda, optimización, calidad digital

### 1. Introducción

La conversión entre formatos de archivo es una necesidad fundamental en el ecosistema digital moderno. Con la proliferación de formatos propietarios y estándares abiertos, los usuarios requieren herramientas eficientes para transformar contenido entre diferentes representaciones digitales.

El problema de encontrar rutas óptimas de conversión puede modelarse como un grafo dirigido donde los nodos representan formatos y las aristas representan conversiones directas posibles. La búsqueda de la ruta más eficiente entre dos formatos se convierte entonces en un problema de búsqueda en grafos.

### 2. Metodología

#### 2.1 Conjunto de Datos

Se utilizó un conjunto de 1,000 archivos de prueba distribuidos en 8 categorías:

| Categoría | Formatos | Archivos | Tamaño Promedio |
|-----------|----------|----------|-----------------|
| Documentos| PDF, DOCX, TXT, HTML | 200 | 2.3 MB |
| Imágenes  | JPG, PNG, GIF, WebP | 200 | 1.8 MB |
| Audio     | MP3, WAV, FLAC | 150 | 4.2 MB |
| Video     | MP4, AVI, WebM | 150 | 15.7 MB |
| Archivos  | ZIP, 7Z, TAR | 100 | 8.1 MB |
| E-books   | EPUB, MOBI, PDF | 100 | 3.4 MB |
| Fuentes   | TTF, OTF, WOFF | 50 | 0.8 MB |
| Presentaciones | PPTX, PDF | 50 | 5.2 MB |

#### 2.2 Algoritmos Evaluados

1. **Búsqueda en Anchura (BFS)**: Garantiza ruta mínima
2. **Búsqueda en Profundidad (DFS)**: Menor uso de memoria
3. **Dijkstra**: Considera pesos de conversión
4. **A***: Heurística basada en calidad esperada
5. **Greedy**: Selección local óptima

#### 2.3 Métricas de Evaluación

- **Tiempo de ejecución** (ms)
- **Calidad de salida** (SSIM para imágenes, PESQ para audio)
- **Preservación de metadatos** (%)
- **Uso de memoria** (MB)
- **Tasa de éxito** (%)

### 3. Resultados

#### 3.1 Eficiencia Computacional

Los resultados muestran que BFS ofrece el mejor balance entre tiempo de ejecución y garantía de optimalidad:

\`\`\`
Algoritmo    | Tiempo Promedio | Memoria Pico | Tasa Éxito
-------------|-----------------|--------------|------------
BFS          | 245 ms         | 12.3 MB      | 94.2%
DFS          | 189 ms         | 8.7 MB       | 87.1%
Dijkstra     | 312 ms         | 15.8 MB      | 96.7%
A*           | 278 ms         | 14.2 MB      | 95.3%
Greedy       | 156 ms         | 6.1 MB       | 82.4%
\`\`\`

#### 3.2 Calidad de Conversión

La calidad de salida varía significativamente según el tipo de archivo:

**Imágenes** (SSIM promedio):
- JPG → PNG: 0.987 ± 0.012
- PNG → JPG: 0.923 ± 0.034
- GIF → WebP: 0.945 ± 0.028

**Audio** (PESQ promedio):
- WAV → MP3: 4.12 ± 0.23
- FLAC → MP3: 4.08 ± 0.19
- MP3 → WAV: 3.89 ± 0.31

#### 3.3 Preservación de Metadatos

Los algoritmos que consideran metadatos en su función de costo muestran mejor preservación:

| Tipo de Metadato | BFS | Dijkstra | A* |
|------------------|-----|----------|-----|
| Autor/Creador    | 89% | 94%      | 92% |
| Fecha de creación| 95% | 97%      | 96% |
| Propiedades técnicas| 87% | 91%   | 89% |
| Comentarios      | 76% | 82%      | 79% |

### 4. Análisis de Rutas Multi-paso

Para conversiones que requieren pasos intermedios, se analizaron 45 rutas diferentes:

#### 4.1 Rutas Más Comunes

1. **DOCX → JPG**: DOCX → PDF → JPG (2 pasos)
2. **MP3 → MP4**: MP3 → WAV → MP4 (2 pasos)  
3. **GIF → PDF**: GIF → PNG → PDF (2 pasos)
4. **FLAC → WebM**: FLAC → WAV → MP4 → WebM (3 pasos)

#### 4.2 Impacto en Calidad

Cada paso adicional introduce degradación acumulativa:

\`\`\`
Pasos | Calidad Promedio | Desviación
------|------------------|------------
1     | 0.967           | ±0.018
2     | 0.934           | ±0.032
3     | 0.891           | ±0.047
4+    | 0.823           | ±0.065
\`\`\`

### 5. Optimizaciones Propuestas

#### 5.1 Cache Inteligente

Implementación de cache basado en hash de contenido para evitar reconversiones:

\`\`\`python
def get_conversion_cache_key(file_hash, source_format, target_format):
    return f"{file_hash}:{source_format}:{target_format}"
\`\`\`

#### 5.2 Paralelización

Para rutas multi-paso, paralelizar conversiones independientes:

\`\`\`
Ruta secuencial: A → B → C → D (tiempo: 3t)
Ruta paralela:   A → [B₁, B₂] → C → D (tiempo: 2t + merge)
\`\`\`

#### 5.3 Predicción de Calidad

Modelo de regresión para predecir calidad final:

\`\`\`
Q_final = Q_inicial × ∏(factor_degradación_i)
\`\`\`

### 6. Limitaciones del Estudio

1. **Conjunto de datos limitado**: Solo 1,000 archivos de prueba
2. **Formatos específicos**: No se evaluaron formatos emergentes
3. **Hardware homogéneo**: Tests en un solo tipo de sistema
4. **Métricas objetivas**: No se evaluó percepción humana

### 7. Conclusiones

El algoritmo BFS demuestra ser la opción más equilibrada para sistemas de conversión de archivos, ofreciendo:

- Garantía de ruta mínima
- Tiempo de ejecución aceptable
- Alta tasa de éxito
- Implementación relativamente simple

Para aplicaciones que requieren máxima calidad, se recomienda Dijkstra con pesos basados en calidad esperada, a costa de mayor tiempo de ejecución.

### 8. Trabajo Futuro

- Evaluación con conjuntos de datos más grandes
- Implementación de algoritmos híbridos
- Análisis de percepción humana de calidad
- Optimización para dispositivos móviles

### Referencias

[1] Smith, J. et al. (2024). "Optimal Path Finding in File Conversion Graphs". *Journal of Digital Formats*, 15(3), 234-251.

[2] García, M. (2023). "Quality Preservation in Multi-step Conversions". *Proceedings of ICDF 2023*, pp. 89-102.

[3] Chen, L. & Wang, K. (2024). "Efficient Algorithms for Format Translation". *ACM Transactions on Multimedia*, 20(4), 1-18.

---
*Manuscrito recibido: 15 de octubre de 2025*
*Aceptado para publicación: 28 de noviembre de 2025*`
  },

  legal_contract: {
    title: 'Contrato de Licencia de Software',
    content: `# CONTRATO DE LICENCIA DE SOFTWARE
## Anclora Converter Pro v2.1

**ENTRE:**

**LICENCIANTE**: Anclora Technologies S.L.
- CIF: B-12345678
- Domicilio: Calle Innovación 42, 28001 Madrid, España
- Email: legal@anclora.com

**LICENCIATARIO**: [NOMBRE DE LA EMPRESA]
- CIF/NIF: [NÚMERO]
- Domicilio: [DIRECCIÓN COMPLETA]
- Email: [EMAIL DE CONTACTO]

### CLÁUSULAS

#### 1. OBJETO DEL CONTRATO

El presente contrato tiene por objeto regular la licencia de uso del software "Anclora Converter Pro" versión 2.1 (en adelante, "el Software"), desarrollado por Anclora Technologies S.L.

#### 2. DEFINICIONES

- **Software**: Programa informático Anclora Converter Pro, incluyendo código ejecutable, documentación y actualizaciones.
- **Licencia**: Derecho de uso concedido al Licenciatario según los términos de este contrato.
- **Usuario Final**: Persona física que utiliza el Software bajo supervisión del Licenciatario.
- **Instalación**: Copia del Software instalada en un dispositivo específico.

#### 3. CONCESIÓN DE LICENCIA

3.1. **Alcance**: El Licenciante concede al Licenciatario una licencia no exclusiva, intransferible y revocable para usar el Software.

3.2. **Modalidades de Licencia**:

| Modalidad | Usuarios | Instalaciones | Conversiones/mes | Precio Anual |
|-----------|----------|---------------|------------------|--------------|
| Individual| 1        | 2             | 1,000           | €99          |
| Profesional| 5       | 10            | 10,000          | €299         |
| Empresarial| 25      | 50            | 100,000         | €999         |
| Enterprise| Ilimitado| Ilimitado     | Ilimitado       | €2,999       |

3.3. **Derechos Concedidos**:
- Instalar y ejecutar el Software
- Realizar copias de seguridad
- Usar funcionalidades de conversión según modalidad contratada
- Acceder a soporte técnico según nivel de servicio

3.4. **Restricciones**:
- No descompilar, desensamblar o realizar ingeniería inversa
- No redistribuir, sublicenciar o transferir la licencia
- No usar el Software para fines ilegales o no autorizados
- No exceder los límites de uso establecidos

#### 4. INSTALACIÓN Y ACTIVACIÓN

4.1. El Software requiere activación online mediante clave de licencia única.

4.2. La activación valida:
- Identidad del Licenciatario
- Modalidad de licencia contratada
- Número de instalaciones permitidas
- Vigencia de la licencia

4.3. El Licenciatario debe proporcionar información veraz para la activación.

#### 5. ACTUALIZACIONES Y SOPORTE

5.1. **Actualizaciones Incluidas**:
- Correcciones de errores (bug fixes)
- Parches de seguridad
- Mejoras menores de funcionalidad
- Nuevos formatos de conversión

5.2. **Niveles de Soporte**:

| Modalidad | Soporte | Tiempo Respuesta | Canal |
|-----------|---------|------------------|-------|
| Individual| Email   | 48h laborables   | Email |
| Profesional| Email + Chat | 24h laborables | Email, Chat |
| Empresarial| Teléfono + Email | 8h laborables | Todos |
| Enterprise| Dedicado | 4h (24/7) | Todos + Dedicado |

#### 6. PROTECCIÓN DE DATOS

6.1. El Software puede procesar archivos que contengan datos personales.

6.2. El Licenciatario es responsable de:
- Cumplir con RGPD y normativa aplicable
- Informar a usuarios sobre el procesamiento
- Obtener consentimientos necesarios
- Implementar medidas de seguridad adecuadas

6.3. Anclora Technologies no accede al contenido de los archivos procesados.

#### 7. PROPIEDAD INTELECTUAL

7.1. Anclora Technologies mantiene todos los derechos de propiedad intelectual sobre el Software.

7.2. Esta licencia no transfiere derechos de propiedad, solo de uso.

7.3. El Licenciatario reconoce la validez de las marcas comerciales de Anclora Technologies.

#### 8. LIMITACIÓN DE RESPONSABILIDAD

8.1. **Garantías Excluidas**:
- Funcionamiento ininterrumpido
- Ausencia total de errores
- Compatibilidad con todo hardware/software
- Resultados específicos de conversión

8.2. **Limitación de Daños**:
La responsabilidad máxima de Anclora Technologies se limita al importe pagado por la licencia en los 12 meses anteriores.

8.3. **Exclusiones**:
Se excluye responsabilidad por:
- Pérdida de datos
- Lucro cesante
- Daños indirectos o consecuenciales
- Uso inadecuado del Software

#### 9. VIGENCIA Y TERMINACIÓN

9.1. **Duración**: La licencia tiene vigencia de un (1) año desde la activación, renovable automáticamente.

9.2. **Terminación por Incumplimiento**:
Anclora Technologies puede terminar la licencia inmediatamente si el Licenciatario:
- Incumple términos de uso
- Excede límites de licencia
- No paga renovación en plazo

9.3. **Efectos de la Terminación**:
- Cese inmediato del derecho de uso
- Desinstalación obligatoria del Software
- Conservación de datos procesados por el Licenciatario

#### 10. MODIFICACIONES

10.1. Anclora Technologies puede modificar estos términos con 30 días de antelación.

10.2. Las modificaciones se notificarán por email y en el sitio web oficial.

10.3. El uso continuado del Software implica aceptación de las modificaciones.

#### 11. LEY APLICABLE Y JURISDICCIÓN

11.1. Este contrato se rige por la legislación española.

11.2. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de Madrid.

#### 12. DISPOSICIONES FINALES

12.1. **Integridad**: Este contrato constituye el acuerdo completo entre las partes.

12.2. **Separabilidad**: La invalidez de una cláusula no afecta al resto del contrato.

12.3. **Notificaciones**: Las comunicaciones se realizarán a las direcciones indicadas.

### ACEPTACIÓN

El Licenciatario declara:
- Haber leído y comprendido todos los términos
- Tener capacidad legal para contratar
- Aceptar íntegramente las condiciones establecidas

**FIRMA DIGITAL**: [HASH DE ACEPTACIÓN]
**FECHA**: ${new Date().toLocaleDateString('es-ES')}
**IP DE ACEPTACIÓN**: [IP_ADDRESS]

---
*Documento generado automáticamente*
*Versión del contrato: 2.1.3*
*Última actualización: ${new Date().toLocaleDateString('es-ES')}*`
  }
};

class RealDocumentGenerator {
  constructor() {
    this.outputDir = REAL_DOCS_DIR;
    this.generatedDocs = [];
  }

  async initialize() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      console.log(`📁 Directorio de documentos reales creado: ${this.outputDir}`);
    } catch (error) {
      console.error('Error creando directorio:', error);
    }
  }

  async generateAllDocuments() {
    console.log('📝 Generando documentos reales para tests de conversión...\n');
    
    // Generar documentos base
    await this.generateBaseDocuments();
    
    // Generar variaciones por tamaño
    await this.generateSizeVariations();
    
    // Generar documentos con características especiales
    await this.generateSpecialDocuments();
    
    // Generar documentos para rutas específicas
    await this.generateRouteSpecificDocuments();
    
    // Generar manifiesto
    await this.generateDocumentManifest();
    
    console.log(`\n✅ Generación completa. Total: ${this.generatedDocs.length} documentos`);
    return this.generatedDocs;
  }

  async generateBaseDocuments() {
    console.log('📄 Generando documentos base...');
    
    // Generar cada tipo de contenido en múltiples formatos
    for (const [contentType, data] of Object.entries(REAL_CONTENT)) {
      // TXT
      await this.createTextDocument(`${contentType}.txt`, data.content);
      
      // Markdown
      await this.createMarkdownDocument(`${contentType}.md`, data.content);
      
      // HTML
      await this.createHTMLDocument(`${contentType}.html`, data.title, data.content);
      
      // PDF simulado
      await this.createPDFDocument(`${contentType}.pdf`, data.title, data.content);
      
      // RTF
      await this.createRTFDocument(`${contentType}.rtf`, data.title, data.content);
    }
  }

  async generateSizeVariations() {
    console.log('📏 Generando variaciones por tamaño...');
    
    const baseContent = REAL_CONTENT.business_report.content;
    
    // Documento micro (< 1KB)
    await this.createTextDocument('micro_doc.txt', baseContent.substring(0, 500));
    
    // Documento pequeño (1-10KB)
    await this.createTextDocument('small_doc.txt', baseContent.repeat(2));
    
    // Documento mediano (10-100KB)
    await this.createTextDocument('medium_doc.txt', baseContent.repeat(10));
    
    // Documento grande (100KB-1MB)
    await this.createTextDocument('large_doc.txt', baseContent.repeat(50));
    
    // Documento muy grande (1-10MB)
    const largeContent = baseContent.repeat(200);
    await this.createTextDocument('huge_doc.txt', largeContent);
    await this.createHTMLDocument('huge_doc.html', 'Documento Muy Grande', largeContent);
  }

  async generateSpecialDocuments() {
    console.log('🎯 Generando documentos con características especiales...');
    
    // Documento con caracteres especiales
    const specialChars = `# Documento con Caracteres Especiales

## Caracteres Latinos
áéíóú ñ ç ü ß àèìòù âêîôû ãõ

## Símbolos Matemáticos
∑ ∏ ∫ ∂ ∞ ± × ÷ ≤ ≥ ≠ ≈ √ ∝

## Símbolos Monetarios
€ $ £ ¥ ₹ ₽ ₩ ₪ ₫ ₡

## Caracteres Griegos
α β γ δ ε ζ η θ ι κ λ μ ν ξ ο π ρ σ τ υ φ χ ψ ω

## Emojis y Símbolos
© ® ™ § ¶ † ‡ • … ‰ ′ ″ ‹ › « » " " ' '

## Texto en Diferentes Idiomas
English: The quick brown fox jumps over the lazy dog.
Español: El veloz murciélago hindú comía feliz cardillo y kiwi.
Français: Portez ce vieux whisky au juge blond qui fume.
Deutsch: Zwölf Boxkämpfer jagen Viktor quer über den großen Sylter Deich.
Русский: В чащах юга жил бы цитрус? Да, но фальшивый экземпляр!
中文: 快速的棕色狐狸跳过懒惰的狗。
العربية: نص حكيم له سر قاطع وذو شأن عظيم مكتوب على ثوب أخضر ومغلف بجلد أزرق.
`;
    
    await this.createTextDocument('special_chars.txt', specialChars);
    await this.createHTMLDocument('special_chars.html', 'Caracteres Especiales', specialChars);
    
    // Documento con tablas complejas
    const tableDoc = `# Documento con Tablas Complejas

## Tabla de Ventas Trimestrales

| Región | Q1 2025 | Q2 2025 | Q3 2025 | Q4 2025 | Total | Crecimiento |
|--------|---------|---------|---------|---------|-------|-------------|
| Europa | €1.2M   | €1.4M   | €1.6M   | €1.8M   | €6.0M | +15%        |
| América| €800K   | €950K   | €1.1M   | €1.3M   | €4.15M| +18%        |
| Asia   | €600K   | €720K   | €850K   | €1.0M   | €3.17M| +22%        |
| **Total**| **€2.6M**| **€3.07M**| **€3.55M**| **€4.1M**| **€13.32M**| **+19%** |

## Tabla de Productos

| Código | Producto | Categoría | Precio | Stock | Proveedor | Estado |
|--------|----------|-----------|--------|-------|-----------|--------|
| PRD001 | Laptop Pro | Hardware | €1,299 | 45 | TechCorp | Activo |
| PRD002 | Software Suite | Software | €299 | ∞ | DevSoft | Activo |
| PRD003 | Cloud Storage | Servicio | €9.99/mes | ∞ | CloudInc | Activo |
| PRD004 | Tablet Ultra | Hardware | €599 | 23 | TechCorp | Descontinuado |

## Tabla Anidada

| Departamento | Empleados | Presupuesto |
|--------------|-----------|-------------|
| Desarrollo   | 25        | €2.5M       |
| ├─ Frontend  | 10        | €1.0M       |
| ├─ Backend   | 12        | €1.2M       |
| └─ DevOps    | 3         | €0.3M       |
| Marketing    | 15        | €1.8M       |
| ├─ Digital   | 8         | €1.0M       |
| ├─ Contenido | 5         | €0.5M       |
| └─ Eventos   | 2         | €0.3M       |
`;
    
    await this.createMarkdownDocument('complex_tables.md', tableDoc);
    await this.createHTMLDocument('complex_tables.html', 'Tablas Complejas', tableDoc);
    
    // Documento con código
    const codeDoc = `# Documento con Código

## JavaScript
\`\`\`javascript
function convertFile(input, output, options = {}) {
    try {
        const converter = new FileConverter(options);
        const result = converter.process(input, output);
        
        return {
            success: true,
            outputPath: result.path,
            metadata: result.metadata,
            processingTime: result.duration
        };
    } catch (error) {
        console.error('Conversion failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
\`\`\`

## Python
\`\`\`python
class DocumentConverter:
    def __init__(self, config):
        self.config = config
        self.supported_formats = ['pdf', 'docx', 'txt', 'html']
    
    def convert(self, source_path, target_format):
        if not self.is_supported(target_format):
            raise ValueError(f"Format {target_format} not supported")
        
        with open(source_path, 'rb') as f:
            content = f.read()
        
        converted = self.process_content(content, target_format)
        return self.save_output(converted, target_format)
\`\`\`

## SQL
\`\`\`sql
SELECT 
    c.conversion_id,
    c.source_format,
    c.target_format,
    c.file_size,
    c.processing_time,
    u.username,
    u.subscription_tier
FROM conversions c
JOIN users u ON c.user_id = u.id
WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND c.status = 'completed'
ORDER BY c.processing_time DESC
LIMIT 100;
\`\`\`
`;
    
    await this.createMarkdownDocument('code_examples.md', codeDoc);
    
    // Documento con listas complejas
    const listDoc = `# Documento con Listas Complejas

## Lista Numerada Multinivel

1. Configuración Inicial
   1.1. Instalación de dependencias
       1.1.1. Node.js (versión 18+)
       1.1.2. npm o yarn
       1.1.3. Git
   1.2. Configuración del entorno
       1.2.1. Variables de entorno
       1.2.2. Base de datos
       1.2.3. Servicios externos

2. Desarrollo
   2.1. Estructura del proyecto
   2.2. Implementación de funcionalidades
   2.3. Testing

3. Despliegue
   3.1. Preparación
   3.2. Configuración de producción
   3.3. Monitoreo

## Lista con Viñetas Mixtas

• Categoría Principal
  ◦ Subcategoría A
    ▪ Elemento 1
    ▪ Elemento 2
  ◦ Subcategoría B
    ▪ Elemento 3
    ▪ Elemento 4

• Segunda Categoría
  ◦ Opción X
  ◦ Opción Y
    ▪ Detalle Y1
    ▪ Detalle Y2

## Lista de Tareas

- [x] Completar análisis de requisitos
- [x] Diseñar arquitectura del sistema
- [ ] Implementar módulo de conversión
  - [x] Conversiones básicas
  - [ ] Conversiones avanzadas
  - [ ] Optimizaciones
- [ ] Realizar pruebas
  - [ ] Pruebas unitarias
  - [ ] Pruebas de integración
  - [ ] Pruebas de rendimiento
- [ ] Documentación
  - [x] Manual técnico
  - [ ] Manual de usuario
  - [ ] API documentation
`;
    
    await this.createMarkdownDocument('complex_lists.md', listDoc);
  }

  async generateRouteSpecificDocuments() {
    console.log('🛤️  Generando documentos para rutas específicas...');
    
    // Cargar matriz de conversiones
    const matrixPath = path.join(__dirname, 'conversion-analysis', 'optimized_routes.json');
    let optimizedRoutes = [];
    
    try {
      const matrixContent = await fs.readFile(matrixPath, 'utf-8');
      optimizedRoutes = JSON.parse(matrixContent);
    } catch (error) {
      console.warn('No se pudo cargar matriz de conversiones, usando rutas predefinidas');
      optimizedRoutes = [
        { source: 'docx', target: 'jpg', path: ['docx', 'pdf', 'jpg'] },
        { source: 'txt', target: 'png', path: ['txt', 'pdf', 'png'] },
        { source: 'md', target: 'gif', path: ['md', 'html', 'pdf', 'gif'] },
        { source: 'rtf', target: 'webp', path: ['rtf', 'docx', 'pdf', 'webp'] }
      ];
    }
    
    // Generar documentos específicos para rutas optimizadas
    const routeTestDocs = optimizedRoutes.slice(0, 10); // Primeras 10 rutas
    
    for (const route of routeTestDocs) {
      const routeName = `route_${route.source}_to_${route.target}`;
      const content = `# Documento de Prueba para Ruta Optimizada

## Información de la Ruta
- **Formato origen**: ${route.source.toUpperCase()}
- **Formato destino**: ${route.target.toUpperCase()}
- **Ruta de conversión**: ${route.path.join(' → ')}
- **Número de pasos**: ${route.path.length - 1}

## Contenido de Prueba

Este documento ha sido generado específicamente para probar la ruta de conversión optimizada desde ${route.source.toUpperCase()} hasta ${route.target.toUpperCase()}.

### Características del Documento

1. **Texto simple**: Para verificar preservación básica de contenido
2. **Formato**: Para validar mantenimiento de estructura
3. **Caracteres especiales**: áéíóú ñ ç €£$¥
4. **Números**: 123,456.78 - 98.76% - €1,234.56

### Tabla de Validación

| Paso | Formato | Validación Requerida |
|------|---------|---------------------|
| 1    | ${route.path[0]}    | Formato original válido |
${route.path.slice(1).map((format, index) => 
  `| ${index + 2}    | ${format}    | Conversión exitosa |`
).join('\n')}

### Contenido Extenso

${REAL_CONTENT.business_report.content.substring(0, 1000)}...

---
*Documento generado para testing de ruta: ${route.path.join(' → ')}*
*Fecha: ${new Date().toISOString()}*
`;
      
      // Crear en formato origen
      if (route.source === 'txt') {
        await this.createTextDocument(`${routeName}.txt`, content);
      } else if (route.source === 'md') {
        await this.createMarkdownDocument(`${routeName}.md`, content);
      } else if (route.source === 'html') {
        await this.createHTMLDocument(`${routeName}.html`, 'Prueba de Ruta', content);
      } else if (route.source === 'docx') {
        await this.createDOCXDocument(`${routeName}.docx`, 'Prueba de Ruta', content);
      } else if (route.source === 'rtf') {
        await this.createRTFDocument(`${routeName}.rtf`, 'Prueba de Ruta', content);
      }
    }
  }

  // Métodos para crear documentos específicos

  async createTextDocument(filename, content) {
    const filePath = path.join(this.outputDir, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    
    this.generatedDocs.push({
      filename,
      type: 'text',
      format: 'txt',
      size: Buffer.byteLength(content, 'utf-8'),
      encoding: 'utf-8'
    });
    
    console.log(`  ✅ ${filename}`);
  }

  async createMarkdownDocument(filename, content) {
    const filePath = path.join(this.outputDir, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    
    this.generatedDocs.push({
      filename,
      type: 'document',
      format: 'md',
      size: Buffer.byteLength(content, 'utf-8'),
      features: ['markdown_syntax', 'tables', 'code_blocks']
    });
    
    console.log(`  ✅ ${filename}`);
  }

  async createHTMLDocument(filename, title, content) {
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generator" content="Anclora Test Generator">
    <title>${title}</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        h1, h2, h3 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        .metadata { font-size: 0.8em; color: #666; border-top: 1px solid #eee; padding-top: 10px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="content">
        ${content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
    </div>
    <div class="metadata">
        <p><strong>Documento generado para testing</strong></p>
        <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
        <p>Formato: HTML5</p>
        <p>Encoding: UTF-8</p>
    </div>
</body>
</html>`;

    const filePath = path.join(this.outputDir, filename);
    await fs.writeFile(filePath, htmlContent, 'utf-8');
    
    this.generatedDocs.push({
      filename,
      type: 'document',
      format: 'html',
      size: Buffer.byteLength(htmlContent, 'utf-8'),
      features: ['html5', 'css', 'metadata', 'responsive']
    });
    
    console.log(`  ✅ ${filename}`);
  }

  async createPDFDocument(filename, title, content) {
    // PDF mínimo válido con contenido real
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
/Metadata 5 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 <<
      /Type /Font
      /Subtype /Type1
      /BaseFont /Helvetica
    >>
  >>
>>
>>
endobj

4 0 obj
<<
/Length ${content.length + 200}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${title.replace(/[()\\]/g, '\\$&')}) Tj
0 -20 Td
(${content.substring(0, 500).replace(/[()\\]/g, '\\$&').replace(/\n/g, ') Tj 0 -15 Td (')}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Metadata
/Subtype /XML
/Length 200
>>
stream
<?xml version="1.0"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:title>${title}</dc:title>
      <dc:creator>Anclora Test Generator</dc:creator>
      <dc:subject>Test Document</dc:subject>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
stream
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000289 00000 n 
0000000${400 + content.length} 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${600 + content.length}
%%EOF`;

    const filePath = path.join(this.outputDir, filename);
    await fs.writeFile(filePath, pdfContent);
    
    this.generatedDocs.push({
      filename,
      type: 'document',
      format: 'pdf',
      size: Buffer.byteLength(pdfContent),
      features: ['pdf_1.4', 'metadata', 'fonts', 'text_content']
    });
    
    console.log(`  ✅ ${filename}`);
  }

  async createRTFDocument(filename, title, content) {
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
{\\colortbl;\\red0\\green0\\blue0;\\red255\\green0\\blue0;}
\\f0\\fs24
{\\b\\fs28 ${title}}\\par
\\par
${content.substring(0, 1000).replace(/\n/g, '\\par ')
  .replace(/[{}\\]/g, '\\$&')}\\par
\\par
{\\i Documento generado para testing}\\par
{\\i Fecha: ${new Date().toLocaleDateString('es-ES')}}\\par
}`;

    const filePath = path.join(this.outputDir, filename);
    await fs.writeFile(filePath, rtfContent);
    
    this.generatedDocs.push({
      filename,
      type: 'document',
      format: 'rtf',
      size: Buffer.byteLength(rtfContent),
      features: ['rtf_1.0', 'fonts', 'formatting', 'colors']
    });
    
    console.log(`  ✅ ${filename}`);
  }

  async createDOCXDocument(filename, title, content) {
    // Simulación de DOCX (en realidad sería un ZIP con XML)
    const docxContent = `PK\x03\x04\x14\x00\x00\x00\x08\x00
[Content_Types].xml
word/document.xml
word/_rels/document.xml.rels
word/theme/theme1.xml
word/settings.xml
word/styles.xml
word/webSettings.xml
word/fontTable.xml

DOCX Document: ${title}
Content: ${content.substring(0, 500)}

Generated: ${new Date().toISOString()}
Format: Office Open XML
`;

    const filePath = path.join(this.outputDir, filename);
    await fs.writeFile(filePath, docxContent);
    
    this.generatedDocs.push({
      filename,
      type: 'document',
      format: 'docx',
      size: Buffer.byteLength(docxContent),
      features: ['openxml', 'zip_container', 'xml_content', 'styles']
    });
    
    console.log(`  ✅ ${filename}`);
  }

  async generateDocumentManifest() {
    const manifest = {
      generated_at: new Date().toISOString(),
      total_documents: this.generatedDocs.length,
      categories: {
        text: this.generatedDocs.filter(d => d.type === 'text').length,
        document: this.generatedDocs.filter(d => d.type === 'document').length
      },
      formats: {
        txt: this.generatedDocs.filter(d => d.format === 'txt').length,
        md: this.generatedDocs.filter(d => d.format === 'md').length,
        html: this.generatedDocs.filter(d => d.format === 'html').length,
        pdf: this.generatedDocs.filter(d => d.format === 'pdf').length,
        rtf: this.generatedDocs.filter(d => d.format === 'rtf').length,
        docx: this.generatedDocs.filter(d => d.format === 'docx').length
      },
      size_distribution: {
        micro: this.generatedDocs.filter(d => d.size < 1024).length,
        small: this.generatedDocs.filter(d => d.size >= 1024 && d.size < 10240).length,
        medium: this.generatedDocs.filter(d => d.size >= 10240 && d.size < 102400).length,
        large: this.generatedDocs.filter(d => d.size >= 102400 && d.size < 1048576).length,
        huge: this.generatedDocs.filter(d => d.size >= 1048576).length
      },
      special_features: {
        special_characters: this.generatedDocs.filter(d => 
          d.filename.includes('special') || d.filename.includes('multilingual')
        ).length,
        tables: this.generatedDocs.filter(d => 
          d.filename.includes('table') || d.filename.includes('business')
        ).length,
        code: this.generatedDocs.filter(d => 
          d.filename.includes('code') || d.filename.includes('technical')
        ).length,
        route_specific: this.generatedDocs.filter(d => 
          d.filename.includes('route_')
        ).length
      },
      documents: this.generatedDocs,
      test_scenarios: [
        'Conversiones directas entre formatos de documento',
        'Rutas optimizadas multi-paso',
        'Preservación de caracteres especiales',
        'Mantenimiento de estructura y formato',
        'Conversión de tablas complejas',
        'Procesamiento de código embebido',
        'Documentos de diferentes tamaños',
        'Metadatos y propiedades de documento'
      ]
    };

    const manifestPath = path.join(this.outputDir, 'document_manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log(`\n📋 Manifiesto de documentos generado: ${manifestPath}`);
  }

  async cleanup() {
    try {
      const files = await fs.readdir(this.outputDir);
      for (const file of files) {
        await fs.unlink(path.join(this.outputDir, file));
      }
      await fs.rmdir(this.outputDir);
      console.log('🧹 Documentos de prueba limpiados');
    } catch (error) {
      console.warn('Advertencia al limpiar documentos:', error.message);
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const generator = new RealDocumentGenerator();
  
  generator.initialize()
    .then(() => generator.generateAllDocuments())
    .then((docs) => {
      console.log('\n🎉 ¡Generación de documentos reales completada!');
      console.log(`📁 Documentos guardados en: ${REAL_DOCS_DIR}`);
      console.log(`📊 Total de documentos: ${docs.length}`);
      
      // Mostrar resumen por formato
      const formats = {};
      docs.forEach(doc => {
        formats[doc.format] = (formats[doc.format] || 0) + 1;
      });
      
      console.log('\n📈 Resumen por formato:');
      Object.entries(formats).forEach(([format, count]) => {
        console.log(`  ${format.toUpperCase()}: ${count} documentos`);
      });
      
      // Mostrar documentos para rutas específicas
      const routeDocs = docs.filter(d => d.filename.includes('route_'));
      if (routeDocs.length > 0) {
        console.log(`\n🛤️  Documentos para rutas específicas: ${routeDocs.length}`);
      }
    })
    .catch(error => {
      console.error('❌ Error durante la generación:', error);
      process.exit(1);
    });
}

module.exports = { RealDocumentGenerator, REAL_CONTENT };

