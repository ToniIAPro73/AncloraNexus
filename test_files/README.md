# Test Files Collection

Esta carpeta contiene archivos de prueba para el sistema de testing integral de Anclora Nexus.

## Estructura

```
test_files/
├── valid/              # Archivos válidos para testing normal
│   ├── small/          # Archivos pequeños (< 1MB)
│   ├── medium/         # Archivos medianos (1-10MB)
│   └── large/          # Archivos grandes (10-50MB)
├── corrupted/          # Archivos corruptos para testing de errores
├── edge_cases/         # Casos especiales y límites
├── formats/            # Archivos organizados por formato
└── generated/          # Archivos generados automáticamente

```

## Tipos de Archivos de Prueba

### 1. Archivos Válidos
- **Documentos**: PDF, DOC, DOCX, TXT, RTF, ODT
- **Imágenes**: JPG, PNG, GIF, SVG, WEBP, TIFF, BMP
- **Otros**: HTML, MD, TEX, CSV, JSON, EPUB

### 2. Archivos Corruptos
- Archivos con headers dañados
- Archivos truncados
- Archivos con contenido inválido
- Archivos con extensiones incorrectas

### 3. Casos Edge
- Archivos de 0 bytes
- Archivos muy grandes (límite de 50MB)
- Archivos con nombres especiales
- Archivos con caracteres Unicode

## Uso

Los archivos de prueba son utilizados por:
- Tests unitarios del backend
- Tests de integración
- Tests end-to-end del frontend
- Benchmarks de rendimiento
- Validación de casos edge

## Generación Automática

Algunos archivos se generan automáticamente usando scripts en `scripts/generate_test_files.py`
