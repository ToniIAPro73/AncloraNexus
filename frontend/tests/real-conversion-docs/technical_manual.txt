# MANUAL TÉCNICO
## Sistema de Conversión de Archivos v2.1

### Introducción

Este manual describe la implementación técnica del sistema de conversión de archivos, incluyendo arquitectura, APIs y procedimientos de mantenimiento.

### Arquitectura del Sistema

```
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
```

### Componentes Principales

#### 1. Motor de Conversión

**Ubicación**: `/utils/conversionEngine.ts`

**Funciones principales**:
- `findConversionPath(source, target)`: Encuentra ruta óptima
- `bfs(start, goal)`: Algoritmo de búsqueda en anchura
- `canConvert(source, target)`: Valida posibilidad de conversión

**Ejemplo de uso**:
```typescript
import { findConversionPath } from './utils/conversionEngine';

const result = findConversionPath('docx', 'pdf');
// Resultado: { optimal: true, path: ['docx', 'pdf'] }
```

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
```json
{
  "sourceFile": "document.docx",
  "targetFormat": "pdf",
  "options": {
    "quality": "high",
    "compression": false
  }
}
```

**Respuesta**:
```json
{
  "jobId": "conv_123456",
  "status": "processing",
  "estimatedTime": 30,
  "path": ["docx", "pdf"]
}
```

#### GET /api/convert/:jobId
Consulta estado de conversión

**Respuesta**:
```json
{
  "jobId": "conv_123456",
  "status": "completed",
  "progress": 100,
  "downloadUrl": "/downloads/document.pdf",
  "processingTime": 28
}
```

### Configuración de Desarrollo

#### Requisitos del Sistema
- Node.js 18+
- npm 8+
- 4GB RAM mínimo
- 10GB espacio libre

#### Variables de Entorno
```bash
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
```

#### Instalación
```bash
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
```

### Procedimientos de Mantenimiento

#### Limpieza de Archivos Temporales
```bash
# Ejecutar diariamente
npm run cleanup:temp

# Limpiar archivos > 24h
find ./temp -type f -mtime +1 -delete
```

#### Monitoreo de Performance
```bash
# Ver estadísticas de conversión
npm run stats:conversion

# Monitorear uso de memoria
npm run monitor:memory
```

#### Backup de Configuración
```bash
# Backup semanal
npm run backup:config
tar -czf config-backup-$(date +%Y%m%d).tar.gz config/
```

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
2. Actualizar matriz en `conversionMaps.ts`
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
```javascript
// logger.config.js
module.exports = {
  level: 'info',
  format: 'json',
  transports: [
    { type: 'file', filename: 'conversion.log' },
    { type: 'console', colorize: true }
  ]
};
```

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
*Manual actualizado: 13/7/2025*
*Versión: 2.1.0*