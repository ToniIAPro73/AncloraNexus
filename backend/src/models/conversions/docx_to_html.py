import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader
import zipfile

CONVERSION = ('docx', 'html')

def _read_docx(path):
    """Lee un archivo DOCX con validación robusta"""
    if not is_valid_docx(path):
        raise ValueError("El archivo DOCX está corrupto o no es válido")
    
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)

def convert(input_path, output_path):
    """Convierte DOCX a HTML con validación mejorada"""
    try:
        # Validar archivo DOCX antes de procesarlo
        if not is_valid_docx(input_path):
            return False, "Error: El archivo DOCX está corrupto o no es válido"
        
        # Leer contenido del DOCX
        try:
            text = _read_docx(input_path)
        except Exception as e:
            return False, f"Error leyendo DOCX: {str(e)}"
        
        # Generar HTML con mejor formato
        html_content = generate_html_from_docx_text(text)
        
        # Guardar HTML
        with open(output_path, 'w', encoding='utf-8') as f_out:
            f_out.write(html_content)
        
        # Verificar que el archivo se creó correctamente
        if not os.path.exists(output_path):
            return False, "Error: No se pudo generar el archivo HTML"
        
        return True, "Conversión DOCX→HTML exitosa"
    except Exception as e:
        return False, f"Error en conversión DOCX→HTML: {str(e)}"

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

def generate_html_from_docx_text(text):
    """Genera HTML bien formateado desde texto DOCX"""
    lines = text.split('\n')
    html_lines = ['<!DOCTYPE html>', '<html lang="es">', '<head>',
                  '<meta charset="UTF-8">', '<title>Documento Convertido</title>',
                  '<style>body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }</style>',
                  '</head>', '<body>']
    
    for line in lines:
        line = line.strip()
        if line:
            # Detectar títulos (líneas cortas sin punto final)
            if len(line) < 60 and not line.endswith('.') and line.isupper():
                html_lines.append(f'<h1>{line}</h1>')
            elif line.startswith('#'):
                level = min(line.count('#'), 6)
                title = line.lstrip('#').strip()
                html_lines.append(f'<h{level}>{title}</h{level}>')
            else:
                html_lines.append(f'<p>{line}</p>')
        else:
            html_lines.append('<br>')
    
    html_lines.extend(['</body>', '</html>'])
    return '\n'.join(html_lines)
