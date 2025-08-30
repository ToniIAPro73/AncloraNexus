import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('jpg', 'png')

def convert(input_path, output_path):
    """Convierte JPG a PNG"""
    try:
        with Image.open(input_path) as img:
            img.save(output_path, 'PNG')
        return True, "ConversiÃ³n exitosa"
    except Exception as e:
        return False, f"Error en conversiÃ³n JPGâ†’PNG: {str(e)}"

