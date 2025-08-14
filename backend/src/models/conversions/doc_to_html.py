import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('doc', 'html')

def convert(input_path, output_path):
    """Convierte DOC a HTML"""
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            content = f.read()
        html = f"<html><body><pre>{content}</pre></body></html>"
        with open(output_path, 'w', encoding='utf-8') as f_out:
            f_out.write(html)
        return True, "Conversión exitosa"
    except Exception as e:
        return False, f"Error en conversión DOC→HTML: {str(e)}"
