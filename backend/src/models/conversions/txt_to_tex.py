import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('txt', 'tex')

def convert(input_path, output_path):
    """Convierte TXT a LaTeX"""
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            content = f.read()
        tex = f"""\\documentclass{{article}}
\\begin{{document}}
{content}
\\end{{document}}
"""
        with open(output_path, 'w', encoding='utf-8') as f_out:
            f_out.write(tex)
        return True, "Conversión exitosa"
    except Exception as e:
        return False, f"Error en conversión TXT→TEX: {str(e)}"
