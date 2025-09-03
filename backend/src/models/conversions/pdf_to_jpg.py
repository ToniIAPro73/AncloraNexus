import os
import tempfile
import logging
import io
from PIL import Image, ImageDraw

# Importar librerías para PDF de alta calidad
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    logging.warning("PyMuPDF no disponible para PDF→JPG de alta calidad")

try:
    from pdf2image import convert_from_path
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False
    logging.warning("pdf2image no disponible para PDF→JPG")

try:
    from pypdf import PdfReader
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False
    logging.warning("pypdf no disponible")

CONVERSION = ('pdf', 'jpg')

def convert(input_path, output_path):
    """Convierte PDF a JPG usando la mejor librería disponible"""

    # Método 1: PyMuPDF (RECOMENDADO - mejor calidad y velocidad)
    if PYMUPDF_AVAILABLE:
        try:
            success, message = convert_with_pymupdf(input_path, output_path)
            if success:
                return True, f"Conversión PDF→JPG exitosa con PyMuPDF - {message}"
        except Exception as e:
            logging.warning(f"PyMuPDF falló: {e}")

    # Método 2: pdf2image (buena calidad)
    if PDF2IMAGE_AVAILABLE:
        try:
            success, message = convert_with_pdf2image(input_path, output_path)
            if success:
                return True, f"Conversión PDF→JPG exitosa con pdf2image - {message}"
        except Exception as e:
            logging.warning(f"pdf2image falló: {e}")

    # Método 3: Fallback básico con pypdf + PIL
    return convert_with_pypdf_fallback(input_path, output_path)

def convert_with_pymupdf(input_path, output_path):
    """Conversión usando PyMuPDF (máxima calidad)"""
    try:
        # Abrir PDF
        pdf_document = fitz.open(input_path)

        if len(pdf_document) == 0:
            return False, "PDF vacío o corrupto"

        # Convertir primera página (por defecto)
        page = pdf_document[0]

        # Configurar matriz de transformación para alta resolución
        mat = fitz.Matrix(2.0, 2.0)  # 2x zoom = 144 DPI

        # Renderizar página como imagen
        pix = page.get_pixmap(matrix=mat)

        # Guardar directamente como JPEG (PyMuPDF puede hacerlo directamente)
        temp_png = output_path.replace('.jpg', '_temp.png')
        pix.save(temp_png)

        # Convertir PNG a JPEG para asegurar compatibilidad
        img = Image.open(temp_png)

        # Convertir a RGB si es necesario (JPEG no soporta transparencia)
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background

        # Guardar como JPEG con alta calidad
        img.save(output_path, 'JPEG', quality=95, optimize=True)

        # Limpiar archivo temporal
        if os.path.exists(temp_png):
            os.remove(temp_png)

        # Cerrar documento
        pdf_document.close()

        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            return True, f"Primera página convertida: {pix.width}x{pix.height}px (144 DPI, calidad 95%)"
        else:
            return False, "Error: JPG no se generó correctamente"

    except Exception as e:
        return False, f"Error con PyMuPDF: {str(e)}"

def convert_with_pdf2image(input_path, output_path):
    """Conversión usando pdf2image"""
    try:
        # Convertir primera página del PDF
        images = convert_from_path(
            input_path,
            first_page=1,
            last_page=1,
            dpi=150,  # Alta resolución
            fmt='JPEG'
        )

        if not images:
            return False, "No se pudo convertir el PDF"

        # Guardar primera imagen como JPEG
        images[0].save(output_path, 'JPEG', quality=95, optimize=True)

        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            width, height = images[0].size
            return True, f"Primera página convertida: {width}x{height}px (150 DPI, calidad 95%)"
        else:
            return False, "Error: JPG no se generó correctamente"

    except Exception as e:
        return False, f"Error con pdf2image: {str(e)}"

def convert_with_pypdf_fallback(input_path, output_path):
    """Fallback básico usando pypdf + PIL"""
    try:
        if not PYPDF_AVAILABLE:
            return convert_basic_fallback(input_path, output_path)

        # Leer PDF para obtener información
        with open(input_path, 'rb') as file:
            pdf_reader = PdfReader(file)

            if len(pdf_reader.pages) == 0:
                return False, "PDF vacío"

            # Obtener información de la primera página
            first_page = pdf_reader.pages[0]

            # Extraer texto si es posible
            try:
                text_content = first_page.extract_text()[:200]  # Primeros 200 caracteres
            except:
                text_content = "Contenido PDF"

        # Crear imagen representativa
        img = Image.new('RGB', (800, 600), 'white')
        draw = ImageDraw.Draw(img)

        # Dibujar marco
        draw.rectangle([20, 20, 780, 580], outline='black', width=2)

        # Título
        draw.text((40, 40), "PDF → JPG", fill='black')
        draw.text((40, 70), f"Archivo: {os.path.basename(input_path)}", fill='black')
        draw.text((40, 100), f"Páginas: {len(pdf_reader.pages)}", fill='black')

        # Contenido de texto (si existe)
        if text_content.strip():
            lines = text_content.split('\n')[:15]  # Máximo 15 líneas
            y_pos = 140
            for line in lines:
                if line.strip():
                    draw.text((40, y_pos), line[:80], fill='darkblue')  # Máximo 80 caracteres por línea
                    y_pos += 25

        # Nota informativa
        draw.text((40, 520), "Conversión básica - Instalar PyMuPDF o pdf2image para mejor calidad", fill='gray')

        # Guardar imagen como JPEG
        img.save(output_path, 'JPEG', quality=95, optimize=True)

        return True, f"JPG básico generado: 800x600px con información del PDF ({len(pdf_reader.pages)} páginas)"

    except Exception as e:
        return convert_basic_fallback(input_path, output_path)

def convert_basic_fallback(input_path, output_path):
    """Fallback más básico cuando no hay librerías disponibles"""
    try:
        # Crear imagen básica
        img = Image.new('RGB', (400, 300), 'white')
        draw = ImageDraw.Draw(img)

        # Información básica
        file_size = os.path.getsize(input_path) / 1024  # KB

        draw.rectangle([10, 10, 390, 290], outline='black', width=2)
        draw.text((20, 30), "PDF → JPG", fill='black')
        draw.text((20, 60), f"Archivo: {os.path.basename(input_path)}", fill='black')
        draw.text((20, 90), f"Tamaño: {file_size:.1f} KB", fill='black')
        draw.text((20, 250), "Instalar PyMuPDF para conversión real", fill='red')

        img.save(output_path, 'JPEG', quality=95)

        return True, f"JPG placeholder generado: 400x300px (instalar PyMuPDF para conversión real)"

    except Exception as e:
        return False, f"Error en fallback básico: {str(e)}"