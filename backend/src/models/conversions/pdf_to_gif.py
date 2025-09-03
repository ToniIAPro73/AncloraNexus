import os
import tempfile
import logging
from PIL import Image, ImageDraw

# Importar librerías para PDF de alta calidad
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    logging.warning("PyMuPDF no disponible para PDF→GIF de alta calidad")

try:
    from pdf2image import convert_from_path
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False
    logging.warning("pdf2image no disponible para PDF→GIF")

try:
    from pypdf import PdfReader
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False
    logging.warning("pypdf no disponible")

CONVERSION = ('pdf', 'gif')

def convert(input_path, output_path):
    """Convierte PDF a GIF usando la mejor librería disponible"""
    
    # Método 1: PyMuPDF (RECOMENDADO - mejor calidad y velocidad)
    if PYMUPDF_AVAILABLE:
        try:
            success, message = convert_with_pymupdf(input_path, output_path)
            if success:
                return True, f"Conversión PDF→GIF exitosa con PyMuPDF - {message}"
        except Exception as e:
            logging.warning(f"PyMuPDF falló: {e}")
    
    # Método 2: pdf2image (buena calidad)
    if PDF2IMAGE_AVAILABLE:
        try:
            success, message = convert_with_pdf2image(input_path, output_path)
            if success:
                return True, f"Conversión PDF→GIF exitosa con pdf2image - {message}"
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
        
        # Configurar matriz de transformación para resolución moderada (GIF es más limitado)
        mat = fitz.Matrix(1.5, 1.5)  # 1.5x zoom = 108 DPI (bueno para GIF)
        
        # Renderizar página como imagen
        pix = page.get_pixmap(matrix=mat)
        
        # Guardar como PNG temporal
        temp_png = output_path.replace('.gif', '_temp.png')
        pix.save(temp_png)
        
        # Convertir PNG a GIF usando PIL
        img = Image.open(temp_png)
        
        # Convertir a RGB si es necesario
        if img.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode == 'P':
            img = img.convert('RGB')
        
        # Reducir colores para GIF (máximo 256 colores)
        img = img.convert('P', palette=Image.ADAPTIVE, colors=256)
        
        # Guardar como GIF
        img.save(output_path, 'GIF', optimize=True)
        
        # Limpiar archivo temporal
        if os.path.exists(temp_png):
            os.remove(temp_png)
        
        # Cerrar documento
        pdf_document.close()
        
        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            return True, f"Primera página convertida: {pix.width}x{pix.height}px (108 DPI, 256 colores)"
        else:
            return False, "Error: GIF no se generó correctamente"
        
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
            dpi=120,  # Resolución moderada para GIF
            fmt='PNG'
        )
        
        if not images:
            return False, "No se pudo convertir el PDF"
        
        # Convertir a GIF
        img = images[0]
        
        # Convertir a RGB si es necesario
        if img.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        # Reducir colores para GIF
        img = img.convert('P', palette=Image.ADAPTIVE, colors=256)
        
        # Guardar como GIF
        img.save(output_path, 'GIF', optimize=True)
        
        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            width, height = img.size
            return True, f"Primera página convertida: {width}x{height}px (120 DPI, 256 colores)"
        else:
            return False, "Error: GIF no se generó correctamente"
        
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
                text_content = first_page.extract_text()[:150]  # Primeros 150 caracteres
            except:
                text_content = "Contenido PDF"
        
        # Crear imagen representativa (más pequeña para GIF)
        img = Image.new('RGB', (600, 400), 'white')
        draw = ImageDraw.Draw(img)
        
        # Dibujar marco
        draw.rectangle([10, 10, 590, 390], outline='black', width=2)
        
        # Título
        draw.text((20, 25), "PDF → GIF", fill='black')
        draw.text((20, 50), f"Archivo: {os.path.basename(input_path)}", fill='black')
        draw.text((20, 75), f"Páginas: {len(pdf_reader.pages)}", fill='black')
        
        # Contenido de texto (si existe)
        if text_content.strip():
            lines = text_content.split('\n')[:12]  # Máximo 12 líneas
            y_pos = 105
            for line in lines:
                if line.strip():
                    draw.text((20, y_pos), line[:60], fill='darkblue')  # Máximo 60 caracteres por línea
                    y_pos += 20
        
        # Nota informativa
        draw.text((20, 360), "Conversión básica - Instalar PyMuPDF para mejor calidad", fill='gray')
        
        # Convertir a GIF con paleta optimizada
        img = img.convert('P', palette=Image.ADAPTIVE, colors=256)
        img.save(output_path, 'GIF', optimize=True)
        
        return True, f"GIF básico generado: 600x400px con información del PDF ({len(pdf_reader.pages)} páginas)"
        
    except Exception as e:
        return convert_basic_fallback(input_path, output_path)

def convert_basic_fallback(input_path, output_path):
    """Fallback más básico cuando no hay librerías disponibles"""
    try:
        # Crear imagen básica
        img = Image.new('RGB', (300, 200), 'white')
        draw = ImageDraw.Draw(img)
        
        # Información básica
        file_size = os.path.getsize(input_path) / 1024  # KB
        
        draw.rectangle([5, 5, 295, 195], outline='black', width=2)
        draw.text((15, 20), "PDF → GIF", fill='black')
        draw.text((15, 45), f"Archivo: {os.path.basename(input_path)[:25]}", fill='black')
        draw.text((15, 70), f"Tamaño: {file_size:.1f} KB", fill='black')
        draw.text((15, 160), "Instalar PyMuPDF para conversión real", fill='red')
        
        # Convertir a GIF con paleta básica
        img = img.convert('P', palette=Image.ADAPTIVE, colors=256)
        img.save(output_path, 'GIF', optimize=True)
        
        return True, f"GIF placeholder generado: 300x200px (instalar PyMuPDF para conversión real)"
        
    except Exception as e:
        return False, f"Error en fallback básico: {str(e)}"
