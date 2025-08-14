import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('png', 'pdf')

def convert(input_path, output_path):
    """Convierte PNG a PDF"""
    try:
        with Image.open(input_path) as img:
            img.convert('RGB').save(output_path, 'PDF')
        return True, "Conversión exitosa"
    except Exception as e:
        return False, f"Error en conversión PNG→PDF: {str(e)}"
