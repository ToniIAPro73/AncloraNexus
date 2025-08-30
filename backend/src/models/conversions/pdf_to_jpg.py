import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('pdf', 'jpg')

def convert(input_path, output_path):
    """Convierte PDF a JPG (placeholder)"""
    try:
        img = Image.new('RGB', (100, 100), 'white')
        draw = ImageDraw.Draw(img)
        draw.text((10, 40), 'PDF', fill='black')
        img.save(output_path, 'JPEG')
        return True, "ConversiÃ³n exitosa"
    except Exception as e:
        return False, f"Error en conversiÃ³n PDFâ†’JPG: {str(e)}"

