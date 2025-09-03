import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader
import markdown
import re
import logging

# Importar motor Pandoc para conversión de alta calidad
try:
    from .pandoc_engine import pandoc_engine, PANDOC_AVAILABLE
except ImportError:
    PANDOC_AVAILABLE = False
    logging.warning("Pandoc engine no disponible para MD→PDF")

CONVERSION = ('md', 'pdf')

def convert(input_path, output_path):
    """Convierte Markdown a PDF usando Pandoc (preserva Unicode) con fallback FPDF"""

    # Método 1: Pandoc (RECOMENDADO - preserva caracteres Unicode perfectamente)
    if PANDOC_AVAILABLE:
        try:
            success, message = pandoc_engine.convert_with_pandoc(
                input_path, output_path, 'md', 'pdf',
                extra_args=[
                    '--pdf-engine=xelatex',  # XeLaTeX tiene excelente soporte Unicode
                    '--variable', 'geometry:margin=20mm',
                    '--variable', 'fontsize=12pt',
                    '--variable', 'documentclass=article',
                    '--variable', 'mainfont=DejaVu Sans',  # Fuente con soporte Unicode
                    '--standalone'
                ]
            )
            if success:
                return True, f"Conversión MD→PDF exitosa con Pandoc (Unicode preservado) - {message}"
        except Exception as e:
            logging.warning(f"Pandoc falló para MD→PDF: {e}, usando fallback FPDF")

    # Método 2: Fallback FPDF (limpia caracteres Unicode)
    return convert_with_fpdf_fallback(input_path, output_path)

def convert_with_fpdf_fallback(input_path, output_path):
    """Fallback usando FPDF con limpieza de Unicode (para compatibilidad)"""
    try:
        # Leer contenido markdown
        with open(input_path, 'r', encoding='utf-8') as f:
            md_content = f.read()

        # Limpiar contenido ANTES de procesar
        md_content = clean_unicode_for_pdf(md_content)

        # Convertir markdown a HTML
        html_content = markdown.markdown(md_content)

        # Crear PDF con configuración mejorada
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # Configurar fuente con mejor soporte Unicode
        try:
            pdf.set_font("Arial", size=12)
        except:
            try:
                pdf.set_font("Helvetica", size=12)
            except:
                pdf.set_font("Times", size=12)

        # Extraer texto del HTML (simple)
        text_content = re.sub(r'<[^>]+>', '', html_content)
        text_content = text_content.replace('&nbsp;', ' ').replace('&amp;', '&')
        text_content = text_content.replace('&lt;', '<').replace('&gt;', '>')
        text_content = text_content.replace('&quot;', '"').replace('&#39;', "'")

        # Limpiar caracteres Unicode problemáticos OTRA VEZ
        text_content = clean_unicode_for_pdf(text_content)

        # Agregar contenido al PDF con manejo de errores mejorado
        lines = text_content.split('\n')
        for i, line in enumerate(lines):
            if line.strip():
                try:
                    # Intentar escribir la línea original
                    pdf.multi_cell(0, 10, line.strip())
                    pdf.ln(2)
                except (UnicodeEncodeError, Exception) as e:
                    try:
                        # Fallback 1: Limpiar línea problemática
                        line_clean = clean_unicode_for_pdf(line.strip())
                        pdf.multi_cell(0, 10, line_clean)
                        pdf.ln(2)
                    except Exception as e2:
                        try:
                            # Fallback 2: Convertir a ASCII puro
                            line_ascii = line.strip().encode('ascii', errors='replace').decode('ascii')
                            pdf.multi_cell(0, 10, line_ascii)
                            pdf.ln(2)
                        except Exception as e3:
                            # Fallback 3: Saltar línea problemática
                            pdf.multi_cell(0, 10, f"[Línea {i+1}: Contenido no compatible con PDF]")
                            pdf.ln(2)

        # Verificar que el PDF se creó correctamente
        pdf.output(output_path)

        # Verificar integridad del PDF generado
        try:
            with open(output_path, 'rb') as f:
                reader = PdfReader(f)
                if len(reader.pages) == 0:
                    return False, "PDF generado sin páginas"
        except Exception as e:
            return False, f"PDF generado corrupto: {str(e)}"

        return True, "Conversión MD→PDF exitosa con FPDF (caracteres Unicode normalizados)"

    except Exception as e:
        return False, f"Error en conversión MD→PDF con FPDF: {str(e)}"

def clean_unicode_for_pdf(text):
    """Limpia caracteres Unicode problemáticos para PDF con soporte extendido"""
    if not text:
        return text

    # Reemplazos de caracteres especiales comunes
    replacements = {
        # Acentos y caracteres especiales del español
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'Ü': 'U',
        'ñ': 'n', 'Ñ': 'N', 'ç': 'c', 'Ç': 'C',

        # Signos especiales
        '¿': '?', '¡': '!', '°': 'o', '€': 'EUR', '£': 'GBP', '$': 'USD',
        '"': '"', '"': '"', ''': "'", ''': "'", '`': "'", '´': "'",
        '–': '-', '—': '-', '…': '...', '•': '*', '·': '*',

        # Símbolos matemáticos y técnicos
        '×': 'x', '÷': '/', '±': '+/-', '≤': '<=', '≥': '>=', '≠': '!=',
        '→': '->', '←': '<-', '↑': '^', '↓': 'v', '↔': '<->',

        # Emojis comunes (más completo)
        '🚀': '[rocket]', '🎉': '[party]', '✅': '[check]', '❌': '[x]',
        '🔥': '[fire]', '💡': '[idea]', '📄': '[document]', '🧠': '[brain]',
        '⚡': '[lightning]', '🎯': '[target]', '📊': '[chart]', '🔒': '[lock]',
        '👁️': '[eye]', '📦': '[package]', '🌟': '[star]', '💻': '[computer]',
        '🔧': '[tool]', '🛠️': '[tools]', '⚙️': '[gear]', '🔍': '[search]',
        '📝': '[note]', '📋': '[clipboard]', '📁': '[folder]', '💾': '[disk]',
        '🌐': '[web]', '📱': '[phone]', '💬': '[chat]', '📧': '[email]',
        '⭐': '[star]', '🎨': '[art]', '🔗': '[link]', '📈': '[graph]',
        '🏆': '[trophy]', '🎪': '[circus]', '🎭': '[theater]', '🎬': '[movie]',

        # Caracteres de control y espacios especiales
        '\u00a0': ' ',  # Non-breaking space
        '\u2000': ' ',  # En quad
        '\u2001': ' ',  # Em quad
        '\u2002': ' ',  # En space
        '\u2003': ' ',  # Em space
        '\u2004': ' ',  # Three-per-em space
        '\u2005': ' ',  # Four-per-em space
        '\u2006': ' ',  # Six-per-em space
        '\u2007': ' ',  # Figure space
        '\u2008': ' ',  # Punctuation space
        '\u2009': ' ',  # Thin space
        '\u200a': ' ',  # Hair space
        '\u200b': '',   # Zero width space
        '\u200c': '',   # Zero width non-joiner
        '\u200d': '',   # Zero width joiner
        '\ufeff': '',   # Byte order mark
    }

    # Aplicar reemplazos
    cleaned_text = text
    for old, new in replacements.items():
        cleaned_text = cleaned_text.replace(old, new)

    # Limpiar caracteres de control restantes
    import unicodedata
    cleaned_text = ''.join(char for char in cleaned_text
                          if unicodedata.category(char)[0] != 'C' or char in '\n\r\t')

    return cleaned_text
