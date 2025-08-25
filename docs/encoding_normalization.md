# Normalización de Encoding

La normalización de encoding asegura que todos los archivos de texto se procesen como **UTF-8** antes de realizar cualquier conversión. Esto evita problemas de caracteres ilegibles, corrupción de datos o errores durante la conversión.

## Uso de la CLI

La interfaz de línea de comandos permite normalizar archivos de manera individual o en lote:

```bash
python backend/src/cli.py <archivos>
```

### Opciones disponibles

- `--bom`: escribe un **Byte Order Mark (BOM)** al inicio del archivo UTF-8 resultante.
- `--dry-run`: muestra la conversión que se realizaría sin modificar los archivos.
- `--undo`: restaura archivos desde sus copias de respaldo (`.bak`).

#### Ejemplos

```bash
# Normalizar archivo.txt a UTF-8
python backend/src/cli.py archivo.txt

# Previsualizar normalización y agregar BOM
python backend/src/cli.py archivo.txt --dry-run --bom

# Restaurar desde respaldo
python backend/src/cli.py archivo.txt --undo
```

## Integración con el Motor de Conversión

El motor de conversión invoca automáticamente la función `normalize_to_utf8` para todos los formatos de texto antes de iniciar el proceso de conversión. Esto garantiza que cada archivo tenga una codificación consistente y evita errores en etapas posteriores del flujo de conversión.

Los eventos de normalización se registran en `backend/logs/encoding/encoding_normalizer.log`, facilitando la auditoría y el seguimiento de los cambios realizados.

## Beneficios

- Elimina problemas de **mojibake** y caracteres ilegibles.
- Genera respaldos automáticos de los archivos originales.
- Unifica la codificación para mantener la compatibilidad a lo largo de todo el pipeline de conversión.

