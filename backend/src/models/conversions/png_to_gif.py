import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('png', 'gif')

def convert(input_path, output_path):
    """Convierte PNG a GIF"""
    try:
        with Image.open(input_path) as img:
            img.save(output_path, 'GIF')
        return True, "ConversiÃ³n exitosa"
    except Exception as e:
        return False, f"Error en conversiÃ³n PNGâ†’GIF: {str(e)}"

