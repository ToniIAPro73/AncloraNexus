import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('docx', 'pdf')


def _read_docx(path):
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)


def convert(input_path, output_path):
    """Convierte DOCX a PDF"""
    try:
        text = _read_docx(input_path)
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.multi_cell(0, 10, text)
        pdf.output(output_path)
        return True, "ConversiÃ³n exitosa"
    except Exception as e:
        return False, f"Error en conversiÃ³n DOCXâ†’PDF: {str(e)}"

