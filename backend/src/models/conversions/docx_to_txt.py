import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader
import zipfile

CONVERSION = ('docx', 'txt')

def _read_docx(path):
    """Lee un archivo DOCX con validación"""
    if not is_valid_docx(path):
        raise ValueError("El archivo DOCX está corrupto o no es válido")
    
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)

def convert(input_path, output_path):
    """Convierte DOCX a TXT con validación mejorada"""
    try:
        text = _read_docx(input_path)
        with open(output_path, 'w', encoding='utf-8') as f_out:
            f_out.write(text)
        
        # Verificar que el archivo se creó correctamente
        if not os.path.exists(output_path):
            return False, "Error: No se pudo generar el archivo TXT"
        
        return True, "Conversión DOCX→TXT exitosa"
    except Exception as e:
        return False, f"Error en conversión DOCX→TXT: {str(e)}"

def is_valid_docx(file_path):
    """Verifica si un archivo DOCX es válido"""
    try:
        with zipfile.ZipFile(file_path, 'r') as zip_file:
            # Verificar que contiene los archivos esenciales de un DOCX
            required_files = ['[Content_Types].xml', 'word/document.xml']
            file_list = zip_file.namelist()
            
            for required_file in required_files:
                if required_file not in file_list:
                    return False
            
            return True
    except (zipfile.BadZipFile, FileNotFoundError):
        return False
