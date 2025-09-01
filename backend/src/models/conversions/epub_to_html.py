import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

# Importar motor Pandoc
try:
    from .pandoc_engine import pandoc_engine
    PANDOC_AVAILABLE = True
except ImportError:
    PANDOC_AVAILABLE = False

CONVERSION = ('epub', 'html')

def convert(input_path, output_path):
    """Convierte EPUB a HTML usando Pandoc con fallback manual"""
    try:
        # Intentar conversión con Pandoc primero
        if PANDOC_AVAILABLE and pandoc_engine.is_supported_conversion('epub', 'html'):
            success, message = pandoc_engine.convert_with_pandoc(
                input_path, output_path, 'epub', 'html',
                extra_args=['--standalone', '--self-contained']
            )
            if success:
                return success, message
        
        # Fallback: conversión manual básica
        return convert_epub_manual(input_path, output_path)
        
    except Exception as e:
        return False, f"Error en conversión EPUB→HTML: {str(e)}"

def convert_epub_manual(input_path, output_path):
    """Conversión EPUB manual como fallback"""
    try:
        import zipfile
        import xml.etree.ElementTree as ET
        
        # EPUB es un archivo ZIP
        with zipfile.ZipFile(input_path, 'r') as epub_zip:
            # Buscar archivos HTML/XHTML en el EPUB
            html_files = [f for f in epub_zip.namelist() 
                         if f.endswith(('.html', '.xhtml', '.htm'))]
            
            if not html_files:
                return False, "Error: No se encontraron archivos HTML en el EPUB"
            
            # Extraer y combinar contenido HTML
            combined_html = ['<!DOCTYPE html>', '<html>', '<head>',
                           '<meta charset="UTF-8">', '<title>EPUB Convertido</title>',
                           '</head>', '<body>']
            
            for html_file in html_files:
                try:
                    content = epub_zip.read(html_file).decode('utf-8', errors='ignore')
                    # Extraer contenido del body
                    body_content = extract_body_content(content)
                    if body_content:
                        combined_html.append(f'<div class="chapter">{body_content}</div>')
                except Exception:
                    continue
            
            combined_html.extend(['</body>', '</html>'])
            
            # Guardar HTML combinado
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(combined_html))
            
            # Verificar que se creó correctamente
            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Error: No se pudo generar el archivo HTML"
            
            return True, "Conversión EPUB→HTML exitosa (fallback manual)"
        
    except Exception as e:
        return False, f"Error en conversión manual EPUB→HTML: {str(e)}"

def extract_body_content(html_content):
    """Extrae contenido del body de un archivo HTML"""
    import re
    
    # Buscar contenido entre tags body
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL | re.IGNORECASE)
    if body_match:
        return body_match.group(1).strip()
    
    # Si no hay body, buscar contenido entre html
    html_match = re.search(r'<html[^>]*>(.*?)</html>', html_content, re.DOTALL | re.IGNORECASE)
    if html_match:
        content = html_match.group(1).strip()
        # Remover head si existe
        content = re.sub(r'<head[^>]*>.*?</head>', '', content, flags=re.DOTALL | re.IGNORECASE)
        return content.strip()
    
    # Fallback: devolver todo el contenido limpio
    clean_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
    clean_content = re.sub(r'<style[^>]*>.*?</style>', '', clean_content, flags=re.DOTALL | re.IGNORECASE)
    
    return clean_content.strip()
