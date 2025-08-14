import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('pdf', 'gif')

def convert(input_path, output_path):
    """Convierte PDF a GIF (placeholder)"""
    try:
        img = Image.new('RGB', (100, 100), 'white')
        draw = ImageDraw.Draw(img)
        draw.text((10, 40), 'PDF', fill='black')
        img.save(output_path, 'GIF')
        return True, "Conversión exitosa"
    except Exception as e:
        return False, f"Error en conversión PDF→GIF: {str(e)}"
