import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader
import markdown

CONVERSION = ('md', 'html')

def convert(input_path, output_path):
    """Convierte Markdown a HTML"""
    try:
        # Leer contenido markdown
        with open(input_path, 'r', encoding='utf-8') as f:
            md_content = f.read()
        
        # Convertir markdown a HTML
        html_content = markdown.markdown(md_content, extensions=['extra', 'codehilite'])
        
        # Crear HTML completo
        full_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documento Convertido</title>
    <style>
        body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
        h1, h2, h3 {{ color: #333; }}
        code {{ background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }}
        pre {{ background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }}
        blockquote {{ border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }}
    </style>
</head>
<body>
{html_content}
<hr>
<p><small>Convertido con <strong>Anclora Nexus</strong> - Tu Contenido, Reinventado</small></p>
</body>
</html>"""
        
        # Guardar HTML
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(full_html)
        
        return True, "Conversión exitosa"
        
    except Exception as e:
        return False, f"Error en conversión MD→HTML: {str(e)}"
