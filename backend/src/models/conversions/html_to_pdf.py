import os, shutil, tempfile, uuid
import re
from html import unescape
import logging

# Try to import weasyprint for better HTML to PDF conversion
try:
    import weasyprint
    WEASYPRINT_AVAILABLE = True
except (ImportError, OSError) as e:
    # WeasyPrint may fail to import due to missing system libraries on Windows
    WEASYPRINT_AVAILABLE = False
    logging.warning(f"WeasyPrint no disponible: {str(e)}")

# Fallback to FPDF if weasyprint is not available
from fpdf import FPDF

CONVERSION = ('html', 'pdf')

def convert(input_path, output_path):
    """Convierte HTML a PDF con mejor calidad"""
    try:
        # Intentar conversión con WeasyPrint primero (mejor calidad)
        if WEASYPRINT_AVAILABLE:
            try:
                return convert_with_weasyprint(input_path, output_path)
            except Exception as e:
                logging.warning(f"WeasyPrint falló: {str(e)}, usando fallback")
                # Si WeasyPrint falla, usar fallback
                return convert_with_fpdf_enhanced(input_path, output_path)
        else:
            # Usar conversión mejorada con FPDF
            return convert_with_fpdf_enhanced(input_path, output_path)

    except Exception as e:
        logging.error(f"Error en conversión HTML→PDF: {str(e)}")
        return False, f"Error en conversión HTML→PDF: {str(e)}"

def convert_with_weasyprint(input_path, output_path):
    """Conversión HTML a PDF usando WeasyPrint (preserva CSS y formato)"""
    try:
        # Leer contenido HTML
        with open(input_path, 'r', encoding='utf-8') as f:
            html_content = f.read()

        # Crear PDF con WeasyPrint
        html_doc = weasyprint.HTML(string=html_content, base_url=os.path.dirname(input_path))
        html_doc.write_pdf(output_path)

        return True, "Conversión exitosa con WeasyPrint (formato preservado)"

    except Exception as e:
        logging.warning(f"WeasyPrint falló: {str(e)}, usando fallback")
        # Si WeasyPrint falla, usar fallback
        return convert_with_fpdf(input_path, output_path)

def convert_with_fpdf_enhanced(input_path, output_path):
    """Conversión HTML a PDF usando FPDF mejorado"""
    try:
        # Leer contenido HTML
        with open(input_path, 'r', encoding='utf-8') as f:
            html_content = f.read()

        # Extraer contenido estructurado del HTML
        structured_content = extract_structured_content_from_html(html_content)

        # Crear PDF con mejor formato
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # Configurar fuentes con mejor soporte Unicode
        try:
            # Intentar usar Arial primero
            pdf.set_font("Arial", size=12)
        except:
            try:
                # Fallback a Times
                pdf.set_font("Times", size=12)
            except:
                # Último fallback a Helvetica
                pdf.set_font("Helvetica", size=12)

        # Procesar contenido estructurado
        for element in structured_content:
            # Limpiar texto antes de procesarlo
            clean_text = clean_unicode_for_pdf(element['text'])

            try:
                if element['type'] == 'title':
                    # Título principal
                    pdf.set_font("Arial", 'B', 16)
                    pdf.multi_cell(0, 12, clean_text)
                    pdf.ln(5)
                    pdf.set_font("Arial", size=12)

                elif element['type'] == 'heading':
                    # Encabezados
                    pdf.set_font("Arial", 'B', 14)
                    pdf.multi_cell(0, 10, clean_text)
                    pdf.ln(3)
                    pdf.set_font("Arial", size=12)

                elif element['type'] == 'paragraph':
                    # Párrafos normales
                    pdf.multi_cell(0, 8, clean_text)
                    pdf.ln(3)

                elif element['type'] == 'list_item':
                    # Elementos de lista (usar asterisco en lugar de bullet)
                    pdf.multi_cell(0, 8, f"* {clean_text}")
                    pdf.ln(2)

                else:
                    # Texto normal
                    pdf.multi_cell(0, 8, clean_text)
                    pdf.ln(2)

            except (UnicodeEncodeError, Exception) as e:
                # Fallback más agresivo para líneas problemáticas
                try:
                    # Convertir a ASCII puro como último recurso
                    ascii_text = clean_text.encode('ascii', errors='replace').decode('ascii')
                    pdf.multi_cell(0, 8, ascii_text)
                    pdf.ln(2)
                except:
                    # Si todo falla, agregar un marcador
                    pdf.multi_cell(0, 8, "[Contenido no compatible con PDF]")
                    pdf.ln(2)

        pdf.output(output_path)
        return True, "Conversión exitosa con FPDF mejorado (estructura preservada)"

    except Exception as e:
        return False, f"Error en conversión FPDF mejorado: {str(e)}"

def extract_structured_content_from_html(html_content):
    """Extrae contenido estructurado de HTML para mejor conversión a PDF"""
    try:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html_content, 'html.parser')

        # Remover scripts, estilos y elementos no deseados
        for element in soup(["script", "style", "nav", "footer", "aside"]):
            element.decompose()

        structured_content = []

        # Extraer título principal
        title = soup.find('title')
        if title and title.get_text().strip():
            structured_content.append({
                'type': 'title',
                'text': clean_unicode_for_pdf(title.get_text().strip())
            })

        # Extraer h1 como título si no hay title
        elif soup.find('h1'):
            h1 = soup.find('h1')
            structured_content.append({
                'type': 'title',
                'text': clean_unicode_for_pdf(h1.get_text().strip())
            })

        # Procesar elementos del body
        body = soup.find('body') or soup
        for element in body.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'li', 'span']):
            text = element.get_text().strip()
            if not text:
                continue

            # Limpiar texto
            clean_text = clean_unicode_for_pdf(text)
            if len(clean_text) < 3:  # Ignorar textos muy cortos
                continue

            if element.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                structured_content.append({
                    'type': 'heading',
                    'text': clean_text
                })
            elif element.name == 'li':
                structured_content.append({
                    'type': 'list_item',
                    'text': clean_text
                })
            elif element.name in ['p', 'div'] and len(clean_text) > 20:
                structured_content.append({
                    'type': 'paragraph',
                    'text': clean_text
                })
            elif len(clean_text) > 10:
                structured_content.append({
                    'type': 'text',
                    'text': clean_text
                })

        # Si no se encontró contenido estructurado, usar texto plano
        if not structured_content:
            text_content = soup.get_text()
            clean_text = clean_unicode_for_pdf(text_content)
            structured_content.append({
                'type': 'paragraph',
                'text': clean_text
            })

        return structured_content

    except ImportError:
        # Fallback sin BeautifulSoup
        text_content = re.sub(r'<[^>]+>', '', html_content)
        text_content = unescape(text_content)
        text_content = re.sub(r'\s+', ' ', text_content).strip()
        clean_text = clean_unicode_for_pdf(text_content)
        return [{'type': 'paragraph', 'text': clean_text}]

def extract_text_from_html(html_content):
    """Extrae texto de HTML preservando estructura básica (función de compatibilidad)"""
    structured = extract_structured_content_from_html(html_content)
    return '\n'.join([item['text'] for item in structured])

def clean_unicode_for_pdf(text):
    """Limpia caracteres Unicode problemáticos para PDF (versión mejorada)"""
    if not text:
        return ""

    try:
        # Normalizar Unicode
        import unicodedata
        text = unicodedata.normalize('NFC', text)

        # Reemplazos extensivos para emojis y caracteres especiales
        replacements = {
            # Comillas tipográficas
            '"': '"', '"': '"', ''': "'", ''': "'",
            '–': '-', '—': '-', '…': '...',

            # Emojis comunes de construcción y desarrollo
            '🏗️': '[construccion]', '🏗': '[construccion]',
            '🚀': '[rocket]', '🎉': '[party]', '✅': '[check]',
            '❌': '[x]', '🔥': '[fire]', '💡': '[idea]',
            '📄': '[document]', '🧠': '[brain]', '⚡': '[lightning]',
            '🎯': '[target]', '📊': '[chart]', '🔒': '[lock]',
            '👁️': '[eye]', '📦': '[package]', '🌟': '[star]',
            '🎨': '[arte]', '🖌️': '[pincel]', '🖌': '[pincel]',
            '🎭': '[teatro]', '🎪': '[circo]', '🎨': '[paleta]',
            '📐': '[regla]', '📏': '[regla]', '✏️': '[lapiz]',
            '✏': '[lapiz]', '🖊️': '[pluma]', '🖊': '[pluma]',
            '🖍️': '[crayon]', '🖍': '[crayon]',

            # Símbolos técnicos
            '⚙️': '[config]', '⚙': '[config]', '🔧': '[herramienta]',
            '🔨': '[martillo]', '⚡': '[rayo]', '🔌': '[enchufe]',
            '💻': '[computadora]', '📱': '[movil]', '⌨️': '[teclado]',
            '⌨': '[teclado]', '🖱️': '[mouse]', '🖱': '[mouse]',

            # Flechas y direcciones
            '→': '->', '←': '<-', '↑': '^', '↓': 'v',
            '⬆️': '^', '⬇️': 'v', '⬅️': '<-', '➡️': '->',
            '⬆': '^', '⬇': 'v', '⬅': '<-', '➡': '->',

            # Símbolos de marca y copyright
            '©': '(c)', '®': '(R)', '™': '(TM)', '℠': '(SM)',

            # Otros símbolos comunes
            '•': '*', '◦': '-', '▪': '*', '▫': '-',
            '★': '*', '☆': '*', '♦': '<>', '♠': '<>',
            '♣': '<>', '♥': '<3',
        }

        # Aplicar reemplazos
        for old, new in replacements.items():
            text = text.replace(old, new)

        # Remover caracteres que no son compatibles con FPDF (fuera del rango Latin-1)
        # Mantener caracteres básicos de Latin-1 (0-255) pero reemplazar emojis y símbolos complejos
        cleaned_chars = []
        for char in text:
            char_code = ord(char)
            if char_code <= 255:  # Latin-1 compatible
                cleaned_chars.append(char)
            elif char_code < 0x1F600:  # Antes del rango de emojis
                # Intentar transliterar caracteres especiales
                try:
                    transliterated = unicodedata.normalize('NFKD', char)
                    ascii_char = ''.join(c for c in transliterated if ord(c) < 128)
                    cleaned_chars.append(ascii_char if ascii_char else '?')
                except:
                    cleaned_chars.append('?')
            else:  # Emojis y símbolos complejos
                cleaned_chars.append('[emoji]')

        return ''.join(cleaned_chars)

    except Exception as e:
        logging.warning(f"Error en limpieza Unicode: {str(e)}")
        # Fallback más agresivo si hay problemas
        try:
            # Remover todos los caracteres no ASCII como último recurso
            return ''.join(c if ord(c) < 128 else '?' for c in text if ord(c) != 0)
        except:
            return "Error procesando texto"
