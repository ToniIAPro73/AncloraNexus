import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader
import re
from html import unescape

CONVERSION = ('html', 'md')

def convert(input_path, output_path):
    """Convierte HTML a Markdown"""
    try:
        # Leer contenido HTML
        with open(input_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Conversión básica HTML a Markdown
        md_content = html_content
        
        # Convertir headers
        md_content = re.sub(r'<h1[^>]*>(.*?)</h1>', r'# \1', md_content, flags=re.IGNORECASE)
        md_content = re.sub(r'<h2[^>]*>(.*?)</h2>', r'## \1', md_content, flags=re.IGNORECASE)
        md_content = re.sub(r'<h3[^>]*>(.*?)</h3>', r'### \1', md_content, flags=re.IGNORECASE)
        md_content = re.sub(r'<h4[^>]*>(.*?)</h4>', r'#### \1', md_content, flags=re.IGNORECASE)
        md_content = re.sub(r'<h5[^>]*>(.*?)</h5>', r'##### \1', md_content, flags=re.IGNORECASE)
        md_content = re.sub(r'<h6[^>]*>(.*?)</h6>', r'###### \1', md_content, flags=re.IGNORECASE)
        
        # Convertir énfasis
        md_content = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', md_content, flags=re.IGNORECASE)
        md_content = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', md_content, flags=re.IGNORECASE)
        md_content = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', md_content, flags=re.IGNORECASE)
        md_content = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', md_content, flags=re.IGNORECASE)
        
        # Convertir links
        md_content = re.sub(r'<a[^>]*href=["\']([^"\']*)["\'][^>]*>(.*?)</a>', r'[\2](\1)', md_content, flags=re.IGNORECASE)
        
        # Convertir código
        md_content = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', md_content, flags=re.IGNORECASE)
        md_content = re.sub(r'<pre[^>]*>(.*?)</pre>', r'```\n\1\n```', md_content, flags=re.IGNORECASE | re.DOTALL)
        
        # Convertir párrafos
        md_content = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', md_content, flags=re.IGNORECASE | re.DOTALL)
        
        # Convertir saltos de línea
        md_content = re.sub(r'<br[^>]*/?>', '\n', md_content, flags=re.IGNORECASE)
        
        # Remover tags restantes
        md_content = re.sub(r'<[^>]+>', '', md_content)
        
        # Decodificar entidades HTML
        md_content = unescape(md_content)
        
        # Limpiar espacios en blanco múltiples
        md_content = re.sub(r'\n\s*\n\s*\n', '\n\n', md_content)
        md_content = re.sub(r'[ \t]+', ' ', md_content)
        
        # Guardar markdown
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(md_content.strip())
        
        return True, "Conversión exitosa"
        
    except Exception as e:
        return False, f"Error en conversión HTML→MD: {str(e)}"
