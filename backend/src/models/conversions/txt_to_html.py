import os, shutil, tempfile, uuid
from datetime import datetime
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('txt', 'html')

def convert(input_path, output_path):
    """Convierte TXT a HTML"""
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Escapar caracteres HTML
        content = content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        
        # Convertir saltos de lÃ­nea
        content = content.replace('\n\n', '</p><p>').replace('\n', '<br>')
        content = f'<p>{content}</p>'
        
        # Generar HTML completo
        html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Documento Convertido - Anclora Nexus</title>
<meta name="generator" content="Anclora Nexus">
<style>
    body {{ 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        color: #333;
    }}
    .header {{
        text-align: center;
        border-bottom: 2px solid #1e40af;
        padding-bottom: 10px;
        margin-bottom: 20px;
    }}
    .content {{
        background: #f8fafc;
        padding: 20px;
        border-radius: 8px;
    }}
    .footer {{
        text-align: center;
        margin-top: 20px;
        font-size: 0.9em;
        color: #666;
    }}
</style>
</head>
<body>
<div class="header">
    <h1>Anclora Nexus</h1>
    <p>Tu Contenido, Reinventado</p>
</div>
<div class="content">
    {content}
</div>
<div class="footer">
    <p>Convertido con Anclora Nexus - {datetime.now().strftime('%d/%m/%Y')}</p>
</div>
</body>
</html>"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return True, "ConversiÃ³n exitosa"
        
    except Exception as e:
        return False, f"Error en conversiÃ³n TXTâ†’HTML: {str(e)}"

