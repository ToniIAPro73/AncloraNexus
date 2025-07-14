# Reporte de Matriz de Conversiones

## Resumen Ejecutivo

- **Total de conversiones posibles**: 283
- **Conversiones directas**: 101 (35.69%)
- **Conversiones indirectas**: 182
- **Eficiencia del sistema**: 35.69%

## Conversiones por Categoría

- **inter_image_to_document**: 42 conversiones
- **intra_image**: 30 conversiones
- **inter_document_to_image**: 30 conversiones
- **intra_document**: 30 conversiones
- **inter_ebook_to_document**: 20 conversiones
- **inter_ebook_to_image**: 20 conversiones
- **inter_audio_to_video**: 16 conversiones
- **inter_video_to_audio**: 16 conversiones
- **intra_ebook**: 13 conversiones
- **intra_archive**: 12 conversiones
- **intra_audio**: 12 conversiones
- **intra_video**: 12 conversiones
- **inter_presentation_to_document**: 12 conversiones
- **inter_presentation_to_image**: 10 conversiones
- **intra_font**: 6 conversiones
- **intra_presentation**: 2 conversiones

## Conversiones por Número de Pasos

- **1 paso**: 101 conversiones
- **2 pasos**: 105 conversiones
- **3 pasos**: 69 conversiones
- **4 pasos**: 8 conversiones

## Formatos Más Conectados

- **AZW**: 14 conversiones de salida
- **AZW3**: 13 conversiones de salida
- **EPUB**: 13 conversiones de salida
- **MOBI**: 13 conversiones de salida
- **PPT**: 12 conversiones de salida
- **PPTX**: 12 conversiones de salida
- **BMP**: 11 conversiones de salida
- **JPEG**: 11 conversiones de salida
- **DOCX**: 10 conversiones de salida
- **GIF**: 10 conversiones de salida

## Rutas de Conversión Optimizadas (Ejemplos)

- **7Z → RAR**: Via intermediate: 7z → zip → rar
- **AAC → AVI**: Multi-step: aac → mp3 → mp4 → avi
- **AAC → FLAC**: Via intermediate: aac → wav → flac
- **AAC → MOV**: Multi-step: aac → mp3 → mp4 → mov
- **AAC → MP4**: Via intermediate: aac → mp3 → mp4
- **AAC → WEBM**: Multi-step: aac → mp3 → mp4 → webm
- **AVI → AAC**: Via intermediate: avi → mp3 → aac
- **AVI → FLAC**: Via intermediate: avi → wav → flac
- **AVI → MOV**: Via intermediate: avi → mp4 → mov
- **AZW → AZW3**: Via intermediate: azw → epub → azw3

## Casos de Prueba Críticos

### Conversiones Directas de Alta Prioridad
- AAC → MP3
- AAC → WAV
- BMP → JPG
- BMP → PNG
- DOCX → HTML

### Rutas Optimizadas de Alta Prioridad
- 7Z → RAR: Via intermediate: 7z → zip → rar
- AAC → AVI: Multi-step: aac → mp3 → mp4 → avi
- AAC → FLAC: Via intermediate: aac → wav → flac
- AAC → MOV: Multi-step: aac → mp3 → mp4 → mov
- AAC → MP4: Via intermediate: aac → mp3 → mp4

## Recomendaciones

1. **Priorizar tests de conversiones directas** (35.69% del total)
2. **Validar rutas optimizadas** especialmente para conversiones inter-categoría
3. **Monitorear performance** en rutas de 3+ pasos
4. **Implementar cache** para rutas de conversión frecuentes
5. **Validar calidad** en conversiones con pérdida (ej: FLAC → MP3)

---
*Reporte generado automáticamente el 2025-07-13T23:53:21.158Z*
