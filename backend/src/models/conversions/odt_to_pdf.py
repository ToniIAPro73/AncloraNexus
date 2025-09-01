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

CONVERSION = ('odt', 'pdf')

def convert(input_path, output_path):
    """Convierte ODT a PDF usando Pandoc con fallback manual"""
    try:
        # Intentar conversión con Pandoc primero
        if PANDOC_AVAILABLE and pandoc_engine.is_supported_conversion('odt', 'pdf'):
            success, message = pandoc_engine.convert_with_pandoc(
                input_path, output_path, 'odt', 'pdf',
                extra_args=[
                    '--pdf-engine=xelatex',
                    '--variable', 'geometry:margin=1in',
                    '--variable', 'fontsize=12pt'
                ]
            )
            if success:
                return success, message
        
        # Fallback: conversión manual básica
        return convert_odt_manual(input_path, output_path)
        
    except Exception as e:
        return False, f"Error en conversión ODT→PDF: {str(e)}"

def convert_odt_manual(input_path, output_path):
    """Conversión ODT manual como fallback"""
    try:
        import zipfile
        import xml.etree.ElementTree as ET
        
        # ODT es un archivo ZIP
        with zipfile.ZipFile(input_path, 'r') as odt_zip:
            # Leer content.xml que contiene el texto
            try:
                content_xml = odt_zip.read('content.xml').decode('utf-8')
            except KeyError:
                return False, "Error: Archivo ODT inválido (falta content.xml)"
            
            # Extraer texto del XML
            text_content = extract_text_from_odt_xml(content_xml)
            
            if not text_content.strip():
                return False, "Error: No se pudo extraer texto del archivo ODT"
            
            # Crear PDF con el texto extraído
            pdf = FPDF()
            pdf.add_page()
            pdf.set_auto_page_break(auto=True, margin=15)
            
            # Configurar fuente con soporte Unicode
            try:
                pdf.set_font("Arial", size=12)
            except:
                pdf.set_font("Helvetica", size=12)
            
            # Limpiar caracteres Unicode problemáticos
            text_clean = clean_unicode_for_pdf(text_content)
            
            # Agregar contenido al PDF
            for line in text_clean.split('\n'):
                line = line.strip()
                if line:
                    try:
                        pdf.multi_cell(0, 10, line)
                        pdf.ln(2)
                    except UnicodeEncodeError:
                        # Fallback adicional
                        line_ascii = line.encode('ascii', 'ignore').decode('ascii')
                        pdf.multi_cell(0, 10, line_ascii)
                        pdf.ln(2)
            
            # Guardar PDF
            pdf.output(output_path)
            
            # Verificar que se creó correctamente
            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                return False, "Error: No se pudo generar el archivo PDF"
            
            return True, "Conversión ODT→PDF exitosa (fallback manual)"
        
    except Exception as e:
        return False, f"Error en conversión manual ODT→PDF: {str(e)}"

def extract_text_from_odt_xml(xml_content):
    """Extrae texto de content.xml de un archivo ODT"""
    try:
        # Parsear XML
        root = ET.fromstring(xml_content)
        
        # Definir namespaces ODT
        namespaces = {
            'text': 'urn:oasis:names:tc:opendocument:xmlns:text:1.0',
            'office': 'urn:oasis:names:tc:opendocument:xmlns:office:1.0'
        }
        
        # Buscar todos los elementos de texto
        text_elements = []
        
        # Buscar párrafos
        for p in root.findall('.//text:p', namespaces):
            if p.text:
                text_elements.append(p.text)
            # Buscar texto en elementos hijos
            for child in p:
                if child.text:
                    text_elements.append(child.text)
                if child.tail:
                    text_elements.append(child.tail)
        
        # Buscar encabezados
        for h in root.findall('.//text:h', namespaces):
            if h.text:
                text_elements.append(f"\n{h.text}\n")
        
        return '\n'.join(text_elements)
        
    except Exception as e:
        # Fallback: extraer texto básico sin parseo XML
        import re
        text = re.sub(r'<[^>]+>', '', xml_content)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

def clean_unicode_for_pdf(text):
    """Limpia caracteres Unicode problemáticos para PDF"""
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
        'ñ': 'n', 'Ñ': 'N', '¿': '?', '¡': '!',
        '"': '"', '"': '"', ''': "'", ''': "'",
        '–': '-', '—': '-',
        '🚀': '[rocket]', '📄': '[document]', '✅': '[check]'
    }
    
    cleaned_text = text
    for old, new in replacements.items():
        cleaned_text = cleaned_text.replace(old, new)
    
    try:
        import unicodedata
        cleaned_text = unicodedata.normalize('NFKD', cleaned_text)
        cleaned_text = ''.join(c if ord(c) < 128 else '?' for c in cleaned_text if ord(c) != 0)
    except:
        pass
    
    return cleaned_text
