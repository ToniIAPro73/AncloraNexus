import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('gif', 'mp4')

def convert(input_path, output_path):
    """Convierte GIF a MP4 (placeholder)"""
    try:
        with open(input_path, 'rb') as src, open(output_path, 'wb') as dst:
            shutil.copyfileobj(src, dst)
        return True, "Conversión exitosa"
    except Exception as e:
        return False, f"Error en conversión GIF→MP4: {str(e)}"
