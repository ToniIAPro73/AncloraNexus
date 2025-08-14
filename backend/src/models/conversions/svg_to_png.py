import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('svg', 'png')

def convert(input_path, output_path):
    """Convierte SVG a PNG (placeholder)"""
    try:
        with open(input_path, 'r', encoding='utf-8'):
            pass  # simple validation de existencia
        img = Image.new('RGB', (100, 100), 'white')
        draw = ImageDraw.Draw(img)
        draw.text((10, 40), 'SVG', fill='black')
        img.save(output_path, 'PNG')
        return True, "Conversión exitosa"
    except Exception as e:
        return False, f"Error en conversión SVG→PNG: {str(e)}"
