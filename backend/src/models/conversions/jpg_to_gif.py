import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('jpg', 'gif')

def convert(input_path, output_path):
    """Convierte JPG a GIF"""
    try:
        with Image.open(input_path) as img:
            img.save(output_path, 'GIF')
        return True, "Conversión exitosa"
    except Exception as e:
        return False, f"Error en conversión JPG→GIF: {str(e)}"
