import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader
import json

# Importar motor Pandoc
try:
    from .pandoc_engine import pandoc_engine
    PANDOC_AVAILABLE = True
except ImportError:
    PANDOC_AVAILABLE = False

CONVERSION = ('json', 'html')

def convert(input_path, output_path):
    """Convierte JSON a HTML con formato estructurado"""
    try:
        # Intentar conversión con Pandoc primero
        if PANDOC_AVAILABLE and pandoc_engine.is_supported_conversion('json', 'html'):
            success, message = pandoc_engine.convert_with_pandoc(
                input_path, output_path, 'json', 'html',
                extra_args=['--standalone', '--template=default']
            )
            if success:
                return success, message
        
        # Fallback: conversión manual con formato estructurado
        return convert_json_manual(input_path, output_path)
        
    except Exception as e:
        return False, f"Error en conversión JSON→HTML: {str(e)}"

def convert_json_manual(input_path, output_path):
    """Conversión JSON manual como fallback"""
    try:
        # Leer archivo JSON
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Generar HTML estructurado
        html_content = generate_html_from_json(data)
        
        # Guardar HTML
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        # Verificar que se creó correctamente
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            return False, "Error: No se pudo generar el archivo HTML"
        
        return True, "Conversión JSON→HTML exitosa"
        
    except json.JSONDecodeError as e:
        return False, f"Error: Archivo JSON inválido - {str(e)}"
    except Exception as e:
        return False, f"Error en conversión manual JSON→HTML: {str(e)}"

def generate_html_from_json(data, title="Datos JSON Convertidos"):
    """Genera HTML estructurado desde datos JSON"""
    html_lines = [
        '<!DOCTYPE html>',
        '<html lang="es">',
        '<head>',
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        f'<title>{title}</title>',
        '<style>',
        'body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }',
        '.json-container { background: #f8f9fa; padding: 20px; border-radius: 8px; }',
        '.json-key { font-weight: bold; color: #0066cc; }',
        '.json-value { margin-left: 20px; }',
        '.json-object { margin-left: 20px; border-left: 2px solid #ddd; padding-left: 15px; }',
        '.json-array { margin-left: 20px; }',
        '.json-string { color: #008000; }',
        '.json-number { color: #ff6600; }',
        '.json-boolean { color: #cc0066; }',
        '.json-null { color: #999; font-style: italic; }',
        'pre { background: #f4f4f4; padding: 15px; border-radius: 4px; overflow-x: auto; }',
        '</style>',
        '</head>',
        '<body>',
        f'<h1>{title}</h1>',
        '<div class="json-container">'
    ]
    
    # Generar contenido estructurado
    html_lines.append(json_to_html_recursive(data))
    
    # Agregar también versión raw para referencia
    html_lines.extend([
        '</div>',
        '<h2>Datos Raw (JSON)</h2>',
        '<pre>' + escape_html(json.dumps(data, indent=2, ensure_ascii=False)) + '</pre>',
        '</body>',
        '</html>'
    ])
    
    return '\n'.join(html_lines)

def json_to_html_recursive(obj, level=0):
    """Convierte objeto JSON a HTML de forma recursiva"""
    if isinstance(obj, dict):
        html = '<div class="json-object">'
        for key, value in obj.items():
            html += f'<div><span class="json-key">{escape_html(str(key))}:</span>'
            html += f'<div class="json-value">{json_to_html_recursive(value, level + 1)}</div></div>'
        html += '</div>'
        return html
    
    elif isinstance(obj, list):
        html = '<div class="json-array">'
        for i, item in enumerate(obj):
            html += f'<div><span class="json-key">[{i}]:</span>'
            html += f'<div class="json-value">{json_to_html_recursive(item, level + 1)}</div></div>'
        html += '</div>'
        return html
    
    elif isinstance(obj, str):
        return f'<span class="json-string">"{escape_html(obj)}"</span>'
    
    elif isinstance(obj, (int, float)):
        return f'<span class="json-number">{obj}</span>'
    
    elif isinstance(obj, bool):
        return f'<span class="json-boolean">{str(obj).lower()}</span>'
    
    elif obj is None:
        return '<span class="json-null">null</span>'
    
    else:
        return f'<span>{escape_html(str(obj))}</span>'

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
