import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('txt', 'rtf')

def convert(input_path, output_path):
    """Convierte TXT a RTF"""
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Generar RTF bÃ¡sico
        content_rtf = content.replace('\n', '\\par ')
        date_str = datetime.now().strftime('%d/%m/%Y')
        rtf_content = f"""{{\\rtf1\\ansi\\deff0 {{\\fonttbl {{\\f0 Times New Roman;}}}}
\\f0\\fs24 
\\b Documento Convertido - Anclora Nexus\\b0\\par
\\par
{content_rtf}
\\par
\\par
\\i Convertido con Anclora Nexus - {date_str}\\i0
}}"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(rtf_content)
        
        return True, "ConversiÃ³n exitosa"
        
    except Exception as e:
        return False, f"Error en conversiÃ³n TXTâ†’RTF: {str(e)}"

