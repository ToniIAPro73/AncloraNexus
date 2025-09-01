import os, shutil, tempfile, uuid
import re
import time
from html import unescape
import logging

# Import production monitoring
try:
    from ...services.production_monitoring import log_conversion
    MONITORING_AVAILABLE = True
except ImportError:
    MONITORING_AVAILABLE = False
    logging.warning("Production monitoring no disponible")

# Try to import weasyprint for better HTML to PDF conversion
try:
    import weasyprint
    WEASYPRINT_AVAILABLE = True
except (ImportError, OSError) as e:
    # WeasyPrint may fail to import due to missing system libraries on Windows
    WEASYPRINT_AVAILABLE = False
    logging.warning(f"WeasyPrint no disponible: {str(e)}")

# Try to import Pandoc for high-quality HTML to PDF conversion
try:
    from .pandoc_engine import PANDOC_AVAILABLE, convert_with_pandoc
    PANDOC_HTML_PDF_AVAILABLE = PANDOC_AVAILABLE
except ImportError:
    PANDOC_HTML_PDF_AVAILABLE = False
    logging.warning("Pandoc engine no disponible para HTML→PDF")

# Try to import Playwright for browser-based HTML to PDF conversion
try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    logging.warning("Playwright no disponible para HTML→PDF")

# Try to import pdfkit (wkhtmltopdf wrapper) for high-quality HTML to PDF
try:
    import pdfkit
    PDFKIT_AVAILABLE = True
except ImportError:
    PDFKIT_AVAILABLE = False
    logging.warning("pdfkit/wkhtmltopdf no disponible para HTML→PDF")

# Import HTML complexity analyzer for intelligent method selection
try:
    from .html_complexity_analyzer import HTMLComplexityAnalyzer
    COMPLEXITY_ANALYZER_AVAILABLE = True
except ImportError:
    COMPLEXITY_ANALYZER_AVAILABLE = False
    logging.warning("Analizador de complejidad HTML no disponible")

# Import essential converter for budget-friendly conversions
try:
    from .essential_converter import EssentialConverter
    ESSENTIAL_CONVERTER_AVAILABLE = True
except ImportError:
    ESSENTIAL_CONVERTER_AVAILABLE = False
    logging.warning("Conversor esencial no disponible")

# Fallback to FPDF if weasyprint is not available
from fpdf import FPDF

CONVERSION = ('html', 'pdf')

def convert(input_path, output_path):
    """Convierte HTML a PDF usando selección inteligente de método basada en complejidad"""

    # Generar ID único para esta conversión
    conversion_id = str(uuid.uuid4())
    start_time = time.time()

    # Calcular tamaño del archivo de entrada
    try:
        input_size_mb = os.path.getsize(input_path) / (1024 * 1024)
    except:
        input_size_mb = 0.0

    try:
        # Analizar complejidad del HTML para seleccionar el mejor método
        if COMPLEXITY_ANALYZER_AVAILABLE:
            analyzer = HTMLComplexityAnalyzer()
            analysis = analyzer.analyze_html_file(input_path)

            logging.info(f"Análisis HTML: {analysis['complexity_level']} (Score: {analysis['complexity_score']})")
            logging.info(f"Método recomendado: {analysis['recommended_method']}")
            logging.info(f"Razón: {analysis['reasoning']}")

            # Intentar conversión con métodos en orden de prioridad recomendado
            method_used = None
            for method in analysis['method_priority']:
                success, message = try_conversion_method(method, input_path, output_path)
                method_used = method
                if success:
                    duration = time.time() - start_time
                    final_message = f"{message} | Análisis: {analysis['complexity_level']} | Tiempo estimado: {analysis['estimated_time']}"

                    # Log de monitoreo para conversión exitosa
                    if MONITORING_AVAILABLE:
                        log_conversion(
                            conversion_id=conversion_id,
                            input_format="html",
                            output_format="pdf",
                            file_size_mb=input_size_mb,
                            duration_seconds=duration,
                            method_used=method,
                            success=True,
                            user_id=None
                        )

                    return True, final_message
                else:
                    logging.warning(f"Método {method} falló: {message}")

            # Si todos los métodos recomendados fallan, usar fallback
            success, message = convert_with_fpdf_enhanced(input_path, output_path)
            duration = time.time() - start_time
            method_used = "fpdf_fallback"

            # Log de monitoreo
            if MONITORING_AVAILABLE:
                log_conversion(
                    conversion_id=conversion_id,
                    input_format="html",
                    output_format="pdf",
                    file_size_mb=input_size_mb,
                    duration_seconds=duration,
                    method_used=method_used,
                    success=success,
                    error_message=None if success else message,
                    user_id=None
                )

            return success, message

        else:
            # Fallback al sistema anterior si no hay analizador
            logging.warning("Analizador no disponible, usando orden de prioridad fijo")
            success, message = convert_with_fixed_priority(input_path, output_path)
            duration = time.time() - start_time

            # Log de monitoreo
            if MONITORING_AVAILABLE:
                log_conversion(
                    conversion_id=conversion_id,
                    input_format="html",
                    output_format="pdf",
                    file_size_mb=input_size_mb,
                    duration_seconds=duration,
                    method_used="fixed_priority",
                    success=success,
                    error_message=None if success else message,
                    user_id=None
                )

            return success, message

    except Exception as e:
        duration = time.time() - start_time
        error_message = f"Error en conversión HTML→PDF: {str(e)}"
        logging.error(error_message)

        # Log de monitoreo para error
        if MONITORING_AVAILABLE:
            log_conversion(
                conversion_id=conversion_id,
                input_format="html",
                output_format="pdf",
                file_size_mb=input_size_mb,
                duration_seconds=duration,
                method_used="unknown",
                success=False,
                error_message=error_message,
                user_id=None
            )

        return False, error_message

def try_conversion_method(method: str, input_path: str, output_path: str) -> tuple:
    """Intenta conversión con un método específico"""
    try:
        if method == 'playwright' and PLAYWRIGHT_AVAILABLE:
            return convert_with_playwright(input_path, output_path)
        elif method == 'wkhtmltopdf' and PDFKIT_AVAILABLE:
            return convert_with_wkhtmltopdf(input_path, output_path)
        elif method == 'pandoc' and PANDOC_HTML_PDF_AVAILABLE:
            return convert_with_pandoc_html(input_path, output_path)
        elif method == 'weasyprint' and WEASYPRINT_AVAILABLE:
            return convert_with_weasyprint(input_path, output_path)
        elif method == 'fpdf':
            return convert_with_fpdf_enhanced(input_path, output_path)
        else:
            return False, f"Método {method} no disponible"
    except Exception as e:
        return False, f"Error en método {method}: {str(e)}"

def convert_with_fixed_priority(input_path: str, output_path: str) -> tuple:
    """Sistema de conversión con prioridad fija (fallback)"""
    methods = [
        ('playwright', PLAYWRIGHT_AVAILABLE, convert_with_playwright),
        ('wkhtmltopdf', PDFKIT_AVAILABLE, convert_with_wkhtmltopdf),
        ('pandoc', PANDOC_HTML_PDF_AVAILABLE, convert_with_pandoc_html),
        ('weasyprint', WEASYPRINT_AVAILABLE, convert_with_weasyprint),
        ('fpdf', True, convert_with_fpdf_enhanced)
    ]

    for method_name, available, method_func in methods:
        if available:
            try:
                success, message = method_func(input_path, output_path)
                if success:
                    return success, f"{message} (prioridad fija)"
                else:
                    logging.warning(f"{method_name} falló: {message}")
            except Exception as e:
                logging.warning(f"{method_name} falló: {str(e)}")

    return False, "Todos los métodos de conversión fallaron"

def convert_with_playwright(input_path, output_path):
    """Conversión HTML a PDF usando Playwright (máxima fidelidad para HTML moderno)"""
    try:
        with sync_playwright() as p:
            # Usar Chromium para mejor compatibilidad CSS
            browser = p.chromium.launch()
            page = browser.new_page()

            # Configurar viewport para A4
            page.set_viewport_size({"width": 794, "height": 1123})  # A4 en pixels a 96 DPI

            # Cargar el archivo HTML
            page.goto(f"file://{os.path.abspath(input_path)}")

            # Esperar a que se carguen todos los recursos
            page.wait_for_load_state("networkidle")

            # Generar PDF con configuraciones optimizadas
            page.pdf(
                path=output_path,
                format="A4",
                margin={
                    "top": "20mm",
                    "bottom": "20mm",
                    "left": "20mm",
                    "right": "20mm"
                },
                print_background=True,  # Incluir fondos CSS
                prefer_css_page_size=True,  # Respetar CSS @page
                display_header_footer=False
            )

            browser.close()

        return True, "Conversión exitosa con Playwright (máxima fidelidad HTML moderno)"

    except Exception as e:
        return False, f"Error en conversión Playwright HTML→PDF: {str(e)}"

def convert_with_wkhtmltopdf(input_path, output_path):
    """Conversión HTML a PDF usando wkhtmltopdf (excelente calidad CSS)"""
    try:
        # Configuraciones optimizadas para wkhtmltopdf
        options = {
            'page-size': 'A4',
            'margin-top': '20mm',
            'margin-right': '20mm',
            'margin-bottom': '20mm',
            'margin-left': '20mm',
            'encoding': "UTF-8",
            'no-outline': None,
            'enable-local-file-access': None,
            'print-media-type': None,
            'disable-smart-shrinking': None,
            'javascript-delay': 1000,
            'load-error-handling': 'ignore',
            'load-media-error-handling': 'ignore'
        }

        # Convertir HTML a PDF
        pdfkit.from_file(input_path, output_path, options=options)

        return True, "Conversión exitosa con wkhtmltopdf (excelente calidad CSS)"

    except Exception as e:
        return False, f"Error en conversión wkhtmltopdf HTML→PDF: {str(e)}"

def convert_with_pandoc_html(input_path, output_path):
    """Conversión HTML a PDF usando Pandoc (buena calidad estructurada)"""
    try:
        # Usar Pandoc con configuraciones optimizadas para HTML complejos
        success, message = convert_with_pandoc(
            input_path, output_path, 'html', 'pdf',
            extra_args=[
                '--pdf-engine=xelatex',  # Motor LaTeX para mejor tipografía
                '--variable', 'geometry:margin=20mm',
                '--variable', 'fontsize=11pt',
                '--variable', 'documentclass=article',
                '--standalone'
            ]
        )

        if success:
            return True, "Conversión exitosa con Pandoc (buena calidad estructurada)"
        else:
            return False, f"Error en Pandoc: {message}"

    except Exception as e:
        return False, f"Error en conversión Pandoc HTML→PDF: {str(e)}"

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
        return convert_with_fpdf_enhanced(input_path, output_path)

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
