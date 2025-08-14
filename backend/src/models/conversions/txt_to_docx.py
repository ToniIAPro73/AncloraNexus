import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('txt', 'docx')

def convert(input_path, output_path):
    """Convierte TXT a DOCX"""
    try:
        doc = Document()
        with open(input_path, 'r', encoding='utf-8') as f:
            for line in f:
                doc.add_paragraph(line.rstrip('\n'))
        doc.save(output_path)
        return True, "Conversión exitosa"
    except Exception as e:
        return False, f"Error en conversión TXT→DOCX: {str(e)}"
