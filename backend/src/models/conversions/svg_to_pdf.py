import os
import logging
import tempfile
from pathlib import Path

# Importar librerías para SVG de alta calidad
try:
    import cairosvg
    CAIROSVG_AVAILABLE = True
except ImportError:
    CAIROSVG_AVAILABLE = False
    logging.warning("CairoSVG no disponible para SVG→PDF de alta calidad")

try:
    from svglib.svglib import renderSVG
    from reportlab.graphics import renderPDF
    SVGLIB_AVAILABLE = True
except ImportError:
    SVGLIB_AVAILABLE = False
    logging.warning("svglib no disponible para SVG→PDF")

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logging.warning("PIL no disponible para SVG→PDF fallback")

try:
    from fpdf import FPDF
    FPDF_AVAILABLE = True
except ImportError:
    FPDF_AVAILABLE = False
    logging.warning("FPDF no disponible para SVG→PDF fallback")

CONVERSION = ('svg', 'pdf')

def convert(input_path, output_path):
    """Convierte SVG a PDF usando la mejor librería disponible"""
    
    # Método 1: CairoSVG (RECOMENDADO - mejor calidad vectorial)
    if CAIROSVG_AVAILABLE:
        try:
            success, message = convert_with_cairosvg(input_path, output_path)
            if success:
                return True, f"Conversión SVG→PDF exitosa con CairoSVG - {message}"
        except Exception as e:
            logging.warning(f"CairoSVG falló: {e}")
    
    # Método 2: svglib + reportlab (buena calidad)
    if SVGLIB_AVAILABLE:
        try:
            success, message = convert_with_svglib(input_path, output_path)
            if success:
                return True, f"Conversión SVG→PDF exitosa con svglib - {message}"
        except Exception as e:
            logging.warning(f"svglib falló: {e}")
    
    # Método 3: Fallback vía PNG (si PIL está disponible)
    if PIL_AVAILABLE and CAIROSVG_AVAILABLE:
        try:
            success, message = convert_via_png_fallback(input_path, output_path)
            if success:
                return True, f"Conversión SVG→PDF exitosa vía PNG - {message}"
        except Exception as e:
            logging.warning(f"Fallback PNG falló: {e}")
    
    # Método 4: Fallback básico
    return convert_basic_fallback(input_path, output_path)

def convert_with_cairosvg(input_path, output_path):
    """Conversión usando CairoSVG (máxima calidad vectorial)"""
    try:
        # Leer SVG
        with open(input_path, 'rb') as svg_file:
            svg_data = svg_file.read()
        
        if not svg_data:
            return False, "SVG vacío o corrupto"
        
        # Convertir SVG a PDF directamente
        cairosvg.svg2pdf(
            bytestring=svg_data,
            write_to=output_path,
            output_width=None,  # Mantener dimensiones originales
            output_height=None,
            background_color='white'  # Fondo blanco por defecto
        )
        
        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            # Obtener información del SVG
            svg_info = get_svg_info(input_path)
            return True, f"PDF vectorial generado: {svg_info}"
        else:
            return False, "Error: PDF no se generó correctamente"
        
    except Exception as e:
        return False, f"Error con CairoSVG: {str(e)}"

def convert_with_svglib(input_path, output_path):
    """Conversión usando svglib + reportlab"""
    try:
        # Renderizar SVG usando svglib
        drawing = renderSVG.renderSVG(input_path)
        
        if not drawing:
            return False, "No se pudo renderizar el SVG"
        
        # Convertir a PDF usando reportlab
        renderPDF.drawToFile(drawing, output_path)
        
        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            # Obtener dimensiones del drawing
            width = getattr(drawing, 'width', 'desconocido')
            height = getattr(drawing, 'height', 'desconocido')
            return True, f"PDF generado con svglib: {width}x{height}"
        else:
            return False, "Error: PDF no se generó correctamente"
        
    except Exception as e:
        return False, f"Error con svglib: {str(e)}"

def convert_via_png_fallback(input_path, output_path):
    """Conversión vía PNG como fallback"""
    try:
        # Crear archivo temporal PNG
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_png:
            temp_png_path = temp_png.name
        
        try:
            # Convertir SVG a PNG con alta resolución
            with open(input_path, 'rb') as svg_file:
                svg_data = svg_file.read()
            
            cairosvg.svg2png(
                bytestring=svg_data,
                write_to=temp_png_path,
                output_width=2048,  # Alta resolución
                output_height=2048,
                background_color='white'
            )
            
            # Convertir PNG a PDF
            if PIL_AVAILABLE and FPDF_AVAILABLE:
                success, message = png_to_pdf_conversion(temp_png_path, output_path)
                return success, f"Conversión vía PNG (2048x2048): {message}"
            else:
                return False, "Librerías necesarias no disponibles para conversión PNG→PDF"
        
        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_png_path):
                os.unlink(temp_png_path)
        
    except Exception as e:
        return False, f"Error en conversión vía PNG: {str(e)}"

def png_to_pdf_conversion(png_path, pdf_path):
    """Convertir PNG a PDF usando PIL + FPDF"""
    try:
        # Abrir imagen PNG
        img = Image.open(png_path)
        
        # Convertir a RGB si es necesario
        if img.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Crear PDF
        pdf = FPDF()
        
        # Calcular dimensiones para el PDF
        img_width, img_height = img.size
        
        # Determinar orientación y tamaño de página
        if img_width > img_height:
            # Paisaje
            pdf.add_page(orientation='L')
            page_width = 297  # A4 paisaje en mm
            page_height = 210
        else:
            # Retrato
            pdf.add_page()
            page_width = 210  # A4 retrato en mm
            page_height = 297
        
        # Calcular escala para ajustar a la página
        scale_w = (page_width - 20) / img_width * 25.4  # Convertir a mm
        scale_h = (page_height - 20) / img_height * 25.4
        scale = min(scale_w, scale_h)
        
        # Dimensiones finales
        final_width = img_width * scale / 25.4
        final_height = img_height * scale / 25.4
        
        # Centrar imagen
        x = (page_width - final_width) / 2
        y = (page_height - final_height) / 2
        
        # Guardar imagen temporalmente para FPDF
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_jpg:
            img.save(temp_jpg.name, 'JPEG', quality=95)
            temp_jpg_path = temp_jpg.name
        
        try:
            # Agregar imagen al PDF
            pdf.image(temp_jpg_path, x, y, final_width, final_height)
            
            # Guardar PDF
            pdf.output(pdf_path)
            
            return True, f"Imagen {img_width}x{img_height} ajustada a PDF"
            
        finally:
            # Limpiar archivo temporal
            os.unlink(temp_jpg_path)
        
    except Exception as e:
        return False, f"Error en conversión PNG→PDF: {str(e)}"

def convert_basic_fallback(input_path, output_path):
    """Fallback básico cuando no hay librerías disponibles"""
    try:
        if not FPDF_AVAILABLE:
            return False, "No hay librerías disponibles para conversión SVG→PDF"
        
        # Crear PDF básico con información del SVG
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font('Arial', 'B', 16)
        
        # Título
        pdf.cell(0, 10, 'Conversión SVG → PDF', 0, 1, 'C')
        pdf.ln(10)
        
        # Información del archivo
        pdf.set_font('Arial', '', 12)
        file_size = os.path.getsize(input_path) / 1024  # KB
        
        pdf.cell(0, 8, f'Archivo original: {os.path.basename(input_path)}', 0, 1)
        pdf.cell(0, 8, f'Tamaño: {file_size:.1f} KB', 0, 1)
        pdf.ln(5)
        
        # Obtener información básica del SVG
        svg_info = get_svg_info(input_path)
        pdf.cell(0, 8, f'Información SVG: {svg_info}', 0, 1)
        pdf.ln(10)
        
        # Mensaje informativo
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 8, 'NOTA:', 0, 1)
        pdf.set_font('Arial', '', 10)
        pdf.multi_cell(0, 6, 'Esta es una conversión básica. Para obtener el gráfico vectorial real, instale CairoSVG o svglib.')
        pdf.ln(5)
        
        pdf.multi_cell(0, 6, 'Para una conversión completa, el sistema necesita:')
        pdf.ln(2)
        
        requirements = [
            '• CairoSVG - para conversión vectorial de alta calidad',
            '• svglib + reportlab - para conversión vectorial alternativa',
            '• PIL + FPDF - para conversión vía imagen de alta resolución'
        ]
        
        for req in requirements:
            pdf.multi_cell(0, 6, req)
        
        # Guardar PDF
        pdf.output(output_path)
        
        return True, "PDF placeholder generado (instalar CairoSVG para conversión real)"
        
    except Exception as e:
        return False, f"Error en fallback básico: {str(e)}"

def get_svg_info(svg_path):
    """Obtener información básica del SVG"""
    try:
        with open(svg_path, 'r', encoding='utf-8') as f:
            svg_content = f.read()
        
        info_parts = []
        
        # Buscar dimensiones
        import re
        
        width_match = re.search(r'width=["\']([^"\']+)["\']', svg_content)
        height_match = re.search(r'height=["\']([^"\']+)["\']', svg_content)
        
        if width_match and height_match:
            width = width_match.group(1)
            height = height_match.group(1)
            info_parts.append(f"{width}×{height}")
        
        # Buscar viewBox
        viewbox_match = re.search(r'viewBox=["\']([^"\']+)["\']', svg_content)
        if viewbox_match:
            viewbox = viewbox_match.group(1)
            info_parts.append(f"viewBox: {viewbox}")
        
        # Contar elementos básicos
        path_count = len(re.findall(r'<path', svg_content))
        circle_count = len(re.findall(r'<circle', svg_content))
        rect_count = len(re.findall(r'<rect', svg_content))
        
        elements = []
        if path_count > 0:
            elements.append(f"{path_count} paths")
        if circle_count > 0:
            elements.append(f"{circle_count} circles")
        if rect_count > 0:
            elements.append(f"{rect_count} rects")
        
        if elements:
            info_parts.append(f"elementos: {', '.join(elements)}")
        
        return ', '.join(info_parts) if info_parts else "SVG válido"
        
    except Exception as e:
        return f"SVG ({os.path.getsize(svg_path)} bytes)"
