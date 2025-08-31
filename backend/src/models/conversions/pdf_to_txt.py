import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('pdf', 'txt')

def convert(input_path, output_path):
    """Convierte PDF a TXT"""
    try:
        reader = PdfReader(input_path)
        text = ''
        for page in reader.pages:
            text += page.extract_text() or ''
        with open(output_path, 'w', encoding='utf-8') as f_out:
            f_out.write(text)
        return True, "ConversiÃ³n exitosa"
    except Exception as e:
        return False, f"Error en conversiÃ³n PDFâ†’TXT: {str(e)}"

