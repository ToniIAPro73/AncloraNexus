import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('doc', 'pdf')

def convert(input_path, output_path):
    """Convierte DOC a PDF"""
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            text = f.read()
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.multi_cell(0, 10, text)
        pdf.output(output_path)
        return True, "Conversión exitosa"
    except Exception as e:
        return False, f"Error en conversión DOC→PDF: {str(e)}"
