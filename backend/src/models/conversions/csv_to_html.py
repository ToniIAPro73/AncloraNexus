import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader
import csv

# Importar motor Pandoc
try:
    from .pandoc_engine import pandoc_engine
    PANDOC_AVAILABLE = True
except ImportError:
    PANDOC_AVAILABLE = False

CONVERSION = ('csv', 'html')

def convert(input_path, output_path):
    """Convierte CSV a HTML con tabla formateada"""
    try:
        # Intentar conversión con Pandoc primero
        if PANDOC_AVAILABLE and pandoc_engine.is_supported_conversion('csv', 'html'):
            success, message = pandoc_engine.convert_with_pandoc(
                input_path, output_path, 'csv', 'html',
                extra_args=['--standalone', '--table-style=bootstrap']
            )
            if success:
                return success, message
        
        # Fallback: conversión manual con tabla HTML
        return convert_csv_manual(input_path, output_path)
        
    except Exception as e:
        return False, f"Error en conversión CSV→HTML: {str(e)}"

def convert_csv_manual(input_path, output_path):
    """Conversión CSV manual optimizada con detección avanzada"""
    try:
        # Análisis avanzado del CSV
        csv_analysis = analyze_csv_structure(input_path)

        if not csv_analysis['is_valid']:
            return False, f"CSV inválido: {csv_analysis['error']}"

        # Leer archivo CSV con configuración detectada
        rows = []
        with open(input_path, 'r', encoding=csv_analysis['encoding'], newline='') as csvfile:
            reader = csv.reader(csvfile, delimiter=csv_analysis['delimiter'])
            rows = list(reader)

        if not rows:
            return False, "Error: El archivo CSV está vacío"

        # Validar consistencia de estructura
        validation_result = validate_csv_structure(rows)
        if not validation_result['is_consistent']:
            return False, f"CSV con estructura inconsistente: {validation_result['message']}"

        # Generar HTML con tabla mejorada
        html_content = generate_enhanced_html_table(rows, csv_analysis)

        # Guardar HTML
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        # Verificar que se creó correctamente
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            return False, "Error: No se pudo generar el archivo HTML"

        return True, f"Conversión CSV→HTML exitosa: {len(rows)} filas, {len(rows[0]) if rows else 0} columnas"

    except Exception as e:
        return False, f"Error en conversión CSV→HTML: {str(e)}"

def analyze_csv_structure(file_path):
    """Análisis avanzado de estructura CSV"""
    analysis = {
        'is_valid': False,
        'delimiter': ',',
        'encoding': 'utf-8',
        'has_header': False,
        'row_count': 0,
        'column_count': 0,
        'data_types': [],
        'preview': [],
        'error': None
    }

    try:
        # Detectar encoding
        with open(file_path, 'rb') as f:
            raw_bytes = f.read()

        # Intentar múltiples encodings
        for encoding in ['utf-8', 'latin-1', 'windows-1252', 'iso-8859-1']:
            try:
                content = raw_bytes.decode(encoding)
                analysis['encoding'] = encoding
                break
            except UnicodeDecodeError:
                continue
        else:
            analysis['error'] = "No se pudo detectar encoding válido"
            return analysis

        # Detectar delimitador
        sample = content[:2048]  # Muestra más grande
        sniffer = csv.Sniffer()

        try:
            dialect = sniffer.sniff(sample, delimiters=',;\t|')
            analysis['delimiter'] = dialect.delimiter
        except csv.Error:
            # Fallback: detectar manualmente
            delimiters = [',', ';', '\t', '|']
            delimiter_counts = {d: sample.count(d) for d in delimiters}
            analysis['delimiter'] = max(delimiter_counts, key=delimiter_counts.get)

        # Leer y analizar estructura
        with open(file_path, 'r', encoding=analysis['encoding'], newline='') as csvfile:
            reader = csv.reader(csvfile, delimiter=analysis['delimiter'])
            rows = list(reader)

        if not rows:
            analysis['error'] = "Archivo CSV vacío"
            return analysis

        analysis['row_count'] = len(rows)
        analysis['column_count'] = len(rows[0]) if rows else 0

        # Detectar si tiene header
        if len(rows) > 1:
            first_row = rows[0]
            second_row = rows[1]

            # Heurística: si la primera fila tiene tipos diferentes a la segunda, probablemente es header
            analysis['has_header'] = detect_csv_header(first_row, second_row)

        # Analizar tipos de datos
        data_rows = rows[1:] if analysis['has_header'] else rows
        if data_rows:
            analysis['data_types'] = analyze_column_types(data_rows, analysis['column_count'])

        # Generar preview
        analysis['preview'] = rows[:5]  # Primeras 5 filas

        analysis['is_valid'] = True

    except Exception as e:
        analysis['error'] = str(e)

    return analysis

def detect_csv_header(first_row, second_row):
    """Detecta si la primera fila es un header"""
    if len(first_row) != len(second_row):
        return False

    # Contar cuántas columnas de la primera fila parecen texto vs números
    text_columns = 0
    for i, (first_val, second_val) in enumerate(zip(first_row, second_row)):
        try:
            # Si el segundo valor es numérico pero el primero no, probablemente es header
            float(second_val)
            try:
                float(first_val)
            except ValueError:
                text_columns += 1
        except ValueError:
            continue

    # Si más del 50% de las columnas parecen headers, asumir que es header
    return text_columns > len(first_row) * 0.5

def analyze_column_types(data_rows, column_count):
    """Analiza tipos de datos en cada columna"""
    column_types = []

    for col_idx in range(column_count):
        # Analizar valores en esta columna
        values = [row[col_idx] if col_idx < len(row) else '' for row in data_rows[:20]]  # Muestra de 20 filas

        # Contar tipos
        numbers = sum(1 for v in values if v and is_number(v))
        dates = sum(1 for v in values if v and is_date_like(v))

        if numbers > len(values) * 0.8:
            column_types.append('numeric')
        elif dates > len(values) * 0.6:
            column_types.append('date')
        else:
            column_types.append('text')

    return column_types

def is_number(value):
    """Verifica si un valor es numérico"""
    try:
        float(value.replace(',', '.'))  # Manejar decimales con coma
        return True
    except (ValueError, AttributeError):
        return False

def is_date_like(value):
    """Verifica si un valor parece una fecha"""
    if not value:
        return False

    # Patrones comunes de fecha
    date_patterns = [
        r'\d{1,2}/\d{1,2}/\d{4}',      # DD/MM/YYYY
        r'\d{4}-\d{1,2}-\d{1,2}',      # YYYY-MM-DD
        r'\d{1,2}-\d{1,2}-\d{4}',      # DD-MM-YYYY
        r'\d{1,2}\.\d{1,2}\.\d{4}',    # DD.MM.YYYY
    ]

    for pattern in date_patterns:
        if re.match(pattern, str(value)):
            return True

    return False

def validate_csv_structure(rows):
    """Valida consistencia de estructura CSV"""
    if not rows:
        return {'is_consistent': False, 'message': 'CSV vacío'}

    first_row_cols = len(rows[0])
    inconsistent_rows = []

    for i, row in enumerate(rows):
        if len(row) != first_row_cols:
            inconsistent_rows.append(i + 1)

    # Permitir hasta 10% de filas inconsistentes
    if len(inconsistent_rows) > len(rows) * 0.1:
        return {
            'is_consistent': False,
            'message': f'Demasiadas filas con número incorrecto de columnas: {len(inconsistent_rows)} de {len(rows)}'
        }

    return {
        'is_consistent': True,
        'message': f'Estructura consistente: {len(rows)} filas, {first_row_cols} columnas',
        'inconsistent_rows': inconsistent_rows
    }

def generate_enhanced_html_table(rows, csv_analysis):
    """Genera HTML mejorado con información del análisis CSV"""
    html_lines = [
        '<!DOCTYPE html>',
        '<html lang="es">',
        '<head>',
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '<title>Datos CSV Convertidos</title>',
        '<style>',
        'body { font-family: Arial, sans-serif; margin: 20px; background: #f8f9fa; }',
        '.container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }',
        '.info-panel { background: #e3f2fd; padding: 15px; border-radius: 6px; margin-bottom: 20px; }',
        '.info-panel h3 { margin-top: 0; color: #1976d2; }',
        'table { border-collapse: collapse; width: 100%; margin: 20px 0; }',
        'th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }',
        'th { background-color: #2196f3; color: white; font-weight: bold; position: sticky; top: 0; }',
        'tr:nth-child(even) { background-color: #f9f9f9; }',
        'tr:hover { background-color: #f5f5f5; }',
        '.table-container { overflow-x: auto; max-height: 600px; overflow-y: auto; border: 1px solid #ddd; }',
        '.numeric { text-align: right; font-family: monospace; }',
        '.date { text-align: center; }',
        '.stats { display: flex; gap: 20px; margin: 15px 0; }',
        '.stat-item { background: #f0f0f0; padding: 10px; border-radius: 4px; text-align: center; }',
        '</style>',
        '</head>',
        '<body>',
        '<div class="container">',
        '<h1>📊 Datos CSV Convertidos</h1>'
    ]

    # Panel de información
    html_lines.extend([
        '<div class="info-panel">',
        '<h3>ℹ️ Información del Archivo</h3>',
        '<div class="stats">',
        f'<div class="stat-item"><strong>{csv_analysis["row_count"]}</strong><br>Filas</div>',
        f'<div class="stat-item"><strong>{csv_analysis["column_count"]}</strong><br>Columnas</div>',
        f'<div class="stat-item"><strong>{csv_analysis["delimiter"]}</strong><br>Delimitador</div>',
        f'<div class="stat-item"><strong>{csv_analysis["encoding"]}</strong><br>Codificación</div>',
        '</div>',
        f'<p><strong>Estructura:</strong> {"Con encabezados" if csv_analysis["has_header"] else "Sin encabezados"}</p>',
        '</div>'
    ])

    # Tabla de datos
    html_lines.extend([
        '<div class="table-container">',
        '<table>'
    ])

    # Agregar encabezados
    if rows:
        html_lines.append('<thead><tr>')
        for i, cell in enumerate(rows[0]):
            col_type = csv_analysis['data_types'][i] if i < len(csv_analysis['data_types']) else 'text'
            class_name = f'class="{col_type}"' if col_type != 'text' else ''
            html_lines.append(f'<th {class_name}>{escape_html(str(cell))}</th>')
        html_lines.append('</tr></thead>')

        # Agregar filas de datos
        html_lines.append('<tbody>')
        start_row = 1 if csv_analysis['has_header'] else 0

        for row in rows[start_row:]:
            html_lines.append('<tr>')
            for i, cell in enumerate(row):
                col_type = csv_analysis['data_types'][i] if i < len(csv_analysis['data_types']) else 'text'
                class_name = f'class="{col_type}"' if col_type != 'text' else ''
                html_lines.append(f'<td {class_name}>{escape_html(str(cell))}</td>')
            html_lines.append('</tr>')
        html_lines.append('</tbody>')

    html_lines.extend([
        '</table>',
        '</div>',
        f'<p class="footer"><small>Tabla generada desde CSV • Delimitador: "{csv_analysis["delimiter"]}" • Codificación: {csv_analysis["encoding"]}</small></p>',
        '</div>',
        '</body>',
        '</html>'
    ])

    return '\n'.join(html_lines)

def generate_html_table(rows):
    """Genera HTML con tabla bien formateada"""
    html_lines = [
        '<!DOCTYPE html>',
        '<html lang="es">',
        '<head>',
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '<title>Datos CSV Convertidos</title>',
        '<style>',
        'body { font-family: Arial, sans-serif; margin: 20px; }',
        'table { border-collapse: collapse; width: 100%; margin: 20px 0; }',
        'th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }',
        'th { background-color: #f2f2f2; font-weight: bold; }',
        'tr:nth-child(even) { background-color: #f9f9f9; }',
        'tr:hover { background-color: #f5f5f5; }',
        '.table-container { overflow-x: auto; }',
        '</style>',
        '</head>',
        '<body>',
        '<h1>Datos CSV Convertidos</h1>',
        '<div class="table-container">',
        '<table>'
    ]
    
    # Agregar encabezados (primera fila)
    if rows:
        html_lines.append('<thead><tr>')
        for cell in rows[0]:
            html_lines.append(f'<th>{escape_html(str(cell))}</th>')
        html_lines.append('</tr></thead>')
        
        # Agregar filas de datos
        html_lines.append('<tbody>')
        for row in rows[1:]:
            html_lines.append('<tr>')
            for cell in row:
                html_lines.append(f'<td>{escape_html(str(cell))}</td>')
            html_lines.append('</tr>')
        html_lines.append('</tbody>')
    
    html_lines.extend([
        '</table>',
        '</div>',
        f'<p><small>Tabla generada desde CSV con {len(rows)} filas y {len(rows[0]) if rows else 0} columnas.</small></p>',
        '</body>',
        '</html>'
    ])
    
    return '\n'.join(html_lines)

def escape_html(text):
    """Escapa caracteres HTML especiales"""
    if not text:
        return ''
    
    text = str(text)
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    text = text.replace('"', '&quot;')
    text = text.replace("'", '&#x27;')
    
    return text
