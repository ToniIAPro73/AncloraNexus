import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('png', 'jpg')

def convert(input_path, output_path):
    """Convierte PNG a JPG"""
    try:
        with Image.open(input_path) as img:
            img.convert('RGB').save(output_path, 'JPEG')
        return True, "ConversiÃ³n exitosa"
    except Exception as e:
        return False, f"Error en conversiÃ³n PNGâ†’JPG: {str(e)}"

