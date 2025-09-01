import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader
import markdown
import re

CONVERSION = ('md', 'pdf')

def convert(input_path, output_path):
    """Convierte Markdown a PDF"""
    try:
        # Leer contenido markdown
        with open(input_path, 'r', encoding='utf-8') as f:
            md_content = f.read()
        
        # Convertir markdown a HTML
        html_content = markdown.markdown(md_content)
        
        # Crear PDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # Configurar fuente con mejor soporte Unicode
        try:
            pdf.set_font("Arial", size=12)
        except:
            pdf.set_font("Helvetica", size=12)

        # Extraer texto del HTML (simple)
        text_content = re.sub(r'<[^>]+>', '', html_content)
        text_content = text_content.replace('&nbsp;', ' ').replace('&amp;', '&')
        text_content = text_content.replace('&lt;', '<').replace('&gt;', '>')

        # Limpiar caracteres Unicode problemáticos
        text_content = clean_unicode_for_pdf(text_content)

        # Agregar contenido al PDF
        for line in text_content.split('\n'):
            if line.strip():
                try:
                    pdf.multi_cell(0, 10, line.strip())
                    pdf.ln(2)
                except UnicodeEncodeError:
                    # Fallback para líneas problemáticas
                    line_clean = clean_unicode_for_pdf(line.strip())
                    pdf.multi_cell(0, 10, line_clean)
                    pdf.ln(2)
        
        pdf.output(output_path)
        return True, "Conversión exitosa"
        
    except Exception as e:
        return False, f"Error en conversión MD→PDF: {str(e)}"

def clean_unicode_for_pdf(text):
    """Limpia caracteres Unicode problemáticos para PDF"""
    # Reemplazos de caracteres especiales comunes
    replacements = {
        # Acentos
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
        'ñ': 'n', 'Ñ': 'N',

        # Signos especiales
        '¿': '?', '¡': '!',
        '"': '"', '"': '"', ''': "'", ''': "'",
        '–': '-', '—': '-',

        # Emojis comunes
        '🚀': '[rocket]', '🎉': '[party]', '✅': '[check]',
        '❌': '[x]', '🔥': '[fire]', '💡': '[idea]',
        '📄': '[document]', '🧠': '[brain]', '⚡': '[lightning]',
        '🎯': '[target]', '📊': '[chart]', '🔒': '[lock]',
        '👁️': '[eye]', '📦': '[package]', '🌟': '[star]'
    }

    # Aplicar reemplazos
    cleaned_text = text
    for old, new in replacements.items():
        cleaned_text = cleaned_text.replace(old, new)

    return cleaned_text
