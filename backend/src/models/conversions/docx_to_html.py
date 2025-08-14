import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('docx', 'html')


def _read_docx(path):
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)


def convert(input_path, output_path):
    """Convierte DOCX a HTML"""
    try:
        text = _read_docx(input_path)
        html = f"<html><body><pre>{text}</pre></body></html>"
        with open(output_path, 'w', encoding='utf-8') as f_out:
            f_out.write(html)
        return True, "Conversión exitosa"
    except Exception as e:
        return False, f"Error en conversión DOCX→HTML: {str(e)}"
