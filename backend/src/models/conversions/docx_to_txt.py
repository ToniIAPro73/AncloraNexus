import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('docx', 'txt')


def _read_docx(path):
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)


def convert(input_path, output_path):
    """Convierte DOCX a TXT"""
    try:
        text = _read_docx(input_path)
        with open(output_path, 'w', encoding='utf-8') as f_out:
            f_out.write(text)
        return True, "ConversiÃ³n exitosa"
    except Exception as e:
        return False, f"Error en conversiÃ³n DOCXâ†’TXT: {str(e)}"

