import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader
import re

CONVERSION = ('md', 'txt')

def convert(input_path, output_path):
    """Convierte Markdown a TXT (texto plano)"""
    try:
        # Leer contenido markdown
        with open(input_path, 'r', encoding='utf-8') as f:
            md_content = f.read()
        
        # Remover sintaxis markdown para obtener texto plano
        # Remover headers
        text_content = re.sub(r'^#{1,6}\s+', '', md_content, flags=re.MULTILINE)
        
        # Remover énfasis (bold, italic)
        text_content = re.sub(r'\*\*(.*?)\*\*', r'\1', text_content)  # bold
        text_content = re.sub(r'\*(.*?)\*', r'\1', text_content)      # italic
        text_content = re.sub(r'__(.*?)__', r'\1', text_content)      # bold alt
        text_content = re.sub(r'_(.*?)_', r'\1', text_content)        # italic alt
        
        # Remover links
        text_content = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text_content)
        
        # Remover código inline
        text_content = re.sub(r'`([^`]+)`', r'\1', text_content)
        
        # Remover bloques de código
        text_content = re.sub(r'```[\s\S]*?```', '', text_content)
        
        # Remover líneas horizontales
        text_content = re.sub(r'^---+$', '', text_content, flags=re.MULTILINE)
        
        # Limpiar líneas vacías múltiples
        text_content = re.sub(r'\n\s*\n', '\n\n', text_content)
        
        # Guardar texto plano
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text_content.strip())
        
        return True, "Conversión exitosa"
        
    except Exception as e:
        return False, f"Error en conversión MD→TXT: {str(e)}"
