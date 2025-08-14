import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('gif', 'png')

def convert(input_path, output_path):
    """Convierte GIF a PNG"""
    try:
        with Image.open(input_path) as img:
            img.save(output_path, 'PNG')
        return True, "Conversión exitosa"
    except Exception as e:
        return False, f"Error en conversión GIF→PNG: {str(e)}"
