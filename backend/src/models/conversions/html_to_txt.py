import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader
import re
from html import unescape

CONVERSION = ('html', 'txt')

def convert(input_path, output_path):
    """Convierte HTML a TXT (texto plano)"""
    try:
        # Leer contenido HTML
        with open(input_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Extraer texto del HTML
        text_content = re.sub(r'<[^>]+>', '', html_content)
        text_content = unescape(text_content)
        
        # Limpiar espacios en blanco múltiples
        text_content = re.sub(r'\s+', ' ', text_content)
        text_content = re.sub(r'\n\s*\n', '\n\n', text_content)
        
        # Guardar texto plano
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text_content.strip())
        
        return True, "Conversión exitosa"
        
    except Exception as e:
        return False, f"Error en conversión HTML→TXT: {str(e)}"
