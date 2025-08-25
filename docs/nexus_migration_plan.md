# Plan de Migración de Nexus

## Módulos y Librerías Asociadas

| Componente | Ubicación / Librería | Clasificación | Notas |
| --- | --- | --- | --- |
| `encoding_normalizer` | `backend/src/encoding_normalizer.py` | Crítico | Núcleo de normalización de encoding; depende de `chardet`. |
| `chardet` | Paquete externo | Crítico | Utilizado para detección automática de encoding. |
| `lxml` | Paquete externo | Opcional | Biblioteca XML requerida por `python-docx`. |
| `typing_extensions` | Paquete externo | Opcional | Proporciona compatibilidad con anotaciones de tipos futuras. |
| Integración con `ConversionEngine` | `backend/src/models/conversion.py` | Crítico | Se invoca `normalize_to_utf8` antes de cada conversión de texto. |
| CLI de normalización | `backend/src/cli.py` | Opcional | Herramienta de línea de comandos para normalizar archivos manualmente. |
| Registro de eventos | `backend/logs/encoding/encoding_normalizer.log` | Opcional | Mantiene trazabilidad de cambios realizados. |
| Reparación de *mojibake* | Función `repair_mojibake` en `encoding_normalizer.py` | Experimental | Heurística para corregir caracteres mal codificados. |
| Reversión de normalización | Función `undo_normalization` en `encoding_normalizer.py` | Experimental | Restaura archivos desde copias de respaldo. |

## Orden de Migración Propuesto

1. Migrar el módulo `encoding_normalizer` junto con la dependencia `chardet`.
2. Adaptar la integración con `ConversionEngine` para asegurar la normalización previa a conversiones.
3. Incorporar la CLI de normalización y el registro de eventos para soporte operativo.
4. Evaluar y migrar las funciones experimentales (`repair_mojibake`, `undo_normalization`) una vez validada la estabilidad del núcleo.

