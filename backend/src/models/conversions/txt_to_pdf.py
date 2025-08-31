import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('txt', 'pdf')

def convert(input_path, output_path):
    """Convierte TXT a PDF"""
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.set_font("Arial", size=12)
        with open(input_path, 'r', encoding='utf-8') as f:
            for line in f:
                pdf.multi_cell(0, 10, line)
        pdf.output(output_path)
        return True, "ConversiÃ³n exitosa"
    except Exception as e:
        return False, f"Error en conversiÃ³n TXTâ†’PDF: {str(e)}"

