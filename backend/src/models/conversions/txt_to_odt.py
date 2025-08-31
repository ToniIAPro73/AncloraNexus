import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('txt', 'odt')

def convert(input_path, output_path):
    """Convierte TXT a ODT (plano)"""
    try:
        with open(input_path, 'r', encoding='utf-8') as f_src, open(output_path, 'w', encoding='utf-8') as f_out:
            f_out.write(f_src.read())
        return True, "ConversiÃ³n exitosa"
    except Exception as e:
        return False, f"Error en conversiÃ³n TXTâ†’ODT: {str(e)}"

