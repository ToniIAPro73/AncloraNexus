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
    logging.warning("CairoSVG no disponible para SVG→JPG de alta calidad")

try:
    from PIL import Image, ImageDraw
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logging.warning("PIL no disponible para SVG→JPG")

try:
    from wand.image import Image as WandImage
    WAND_AVAILABLE = True
except ImportError:
    WAND_AVAILABLE = False
    logging.warning("Wand no disponible para SVG→JPG")

CONVERSION = ('svg', 'jpg')

def convert(input_path, output_path):
    """Convierte SVG a JPG usando la mejor librería disponible"""
    
    # Método 1: CairoSVG (RECOMENDADO - mejor calidad y control)
    if CAIROSVG_AVAILABLE and PIL_AVAILABLE:
        try:
            success, message = convert_with_cairosvg(input_path, output_path)
            if success:
                return True, f"Conversión SVG→JPG exitosa con CairoSVG - {message}"
        except Exception as e:
            logging.warning(f"CairoSVG falló: {e}")
    
    # Método 2: Wand/ImageMagick (buena calidad)
    if WAND_AVAILABLE:
        try:
            success, message = convert_with_wand(input_path, output_path)
            if success:
                return True, f"Conversión SVG→JPG exitosa con Wand - {message}"
        except Exception as e:
            logging.warning(f"Wand falló: {e}")
    
    # Método 3: Fallback básico
    return convert_basic_fallback(input_path, output_path)

def convert_with_cairosvg(input_path, output_path):
    """Conversión usando CairoSVG + PIL (máxima calidad)"""
    try:
        # Leer SVG
        with open(input_path, 'rb') as svg_file:
            svg_data = svg_file.read()
        
        if not svg_data:
            return False, "SVG vacío o corrupto"
        
        # Determinar dimensiones óptimas
        target_width, target_height = determine_optimal_dimensions(input_path)
        
        # Crear archivo temporal PNG
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_png:
            temp_png_path = temp_png.name
        
        try:
            # Convertir SVG a PNG con alta resolución
            cairosvg.svg2png(
                bytestring=svg_data,
                write_to=temp_png_path,
                output_width=target_width,
                output_height=target_height,
                background_color='white'  # Fondo blanco para JPG
            )
            
            # Convertir PNG a JPG usando PIL
            img = Image.open(temp_png_path)
            
            # Convertir a RGB (JPG no soporta transparencia)
            if img.mode in ('RGBA', 'LA'):
                # Crear fondo blanco
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Guardar como JPG con alta calidad
            img.save(output_path, 'JPEG', quality=95, optimize=True)
            
            # Verificar resultado
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                return True, f"JPG generado: {target_width}x{target_height}px (calidad 95%)"
            else:
                return False, "Error: JPG no se generó correctamente"
        
        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_png_path):
                os.unlink(temp_png_path)
        
    except Exception as e:
        return False, f"Error con CairoSVG: {str(e)}"

def convert_with_wand(input_path, output_path):
    """Conversión usando Wand/ImageMagick"""
    try:
        with WandImage(filename=input_path) as img:
            # Configurar fondo blanco
            img.background_color = 'white'
            img.alpha_channel = 'remove'
            
            # Determinar dimensiones óptimas
            target_width, target_height = determine_optimal_dimensions(input_path)
            
            # Redimensionar si es necesario
            if target_width and target_height:
                img.resize(target_width, target_height)
            
            # Configurar formato JPG
            img.format = 'jpeg'
            img.compression_quality = 95
            
            # Guardar
            img.save(filename=output_path)
        
        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            return True, f"JPG generado con Wand: {img.width}x{img.height}px"
        else:
            return False, "Error: JPG no se generó correctamente"
        
    except Exception as e:
        return False, f"Error con Wand: {str(e)}"

def convert_basic_fallback(input_path, output_path):
    """Fallback básico cuando no hay librerías disponibles"""
    try:
        if not PIL_AVAILABLE:
            return False, "PIL no está disponible para conversión SVG→JPG"
        
        # Crear imagen básica con información del SVG
        img = Image.new('RGB', (800, 600), 'white')
        draw = ImageDraw.Draw(img)
        
        # Información del archivo
        file_size = os.path.getsize(input_path) / 1024  # KB
        svg_info = get_svg_basic_info(input_path)
        
        # Dibujar marco
        draw.rectangle([20, 20, 780, 580], outline='black', width=2)
        
        # Título
        draw.text((40, 40), "SVG → JPG", fill='black')
        draw.text((40, 70), f"Archivo: {os.path.basename(input_path)}", fill='black')
        draw.text((40, 100), f"Tamaño: {file_size:.1f} KB", fill='black')
        draw.text((40, 130), f"Info: {svg_info}", fill='black')
        
        # Mensaje informativo
        draw.text((40, 200), "CONVERSIÓN BÁSICA", fill='red')
        draw.text((40, 230), "Para obtener la imagen real del SVG:", fill='black')
        draw.text((40, 260), "• Instalar CairoSVG para mejor calidad", fill='darkblue')
        draw.text((40, 290), "• Instalar Wand/ImageMagick como alternativa", fill='darkblue')
        
        # Dibujar representación básica del SVG
        draw_svg_representation(draw, input_path)
        
        # Guardar imagen como JPG
        img.save(output_path, 'JPEG', quality=95, optimize=True)
        
        return True, "JPG placeholder generado: 800x600px (instalar CairoSVG para conversión real)"
        
    except Exception as e:
        return False, f"Error en fallback básico: {str(e)}"

def determine_optimal_dimensions(svg_path):
    """Determinar dimensiones óptimas para la conversión"""
    try:
        with open(svg_path, 'r', encoding='utf-8') as f:
            svg_content = f.read()
        
        import re
        
        # Buscar dimensiones explícitas
        width_match = re.search(r'width=["\']([^"\']+)["\']', svg_content)
        height_match = re.search(r'height=["\']([^"\']+)["\']', svg_content)
        
        if width_match and height_match:
            try:
                width_str = width_match.group(1)
                height_str = height_match.group(1)
                
                # Extraer números (ignorar unidades)
                width_num = float(re.search(r'[\d.]+', width_str).group())
                height_num = float(re.search(r'[\d.]+', height_str).group())
                
                # Escalar a dimensiones razonables para JPG
                max_dimension = 2048
                scale = min(max_dimension / width_num, max_dimension / height_num)
                
                if scale < 1:
                    return int(width_num * scale), int(height_num * scale)
                else:
                    # Si es pequeño, escalar hasta un mínimo razonable
                    min_dimension = 512
                    scale = max(min_dimension / width_num, min_dimension / height_num)
                    return int(width_num * scale), int(height_num * scale)
                    
            except (ValueError, AttributeError):
                pass
        
        # Buscar viewBox como alternativa
        viewbox_match = re.search(r'viewBox=["\']([^"\']+)["\']', svg_content)
        if viewbox_match:
            try:
                viewbox = viewbox_match.group(1).split()
                if len(viewbox) >= 4:
                    vb_width = float(viewbox[2])
                    vb_height = float(viewbox[3])
                    
                    # Aplicar misma lógica de escalado
                    max_dimension = 2048
                    scale = min(max_dimension / vb_width, max_dimension / vb_height)
                    
                    if scale < 1:
                        return int(vb_width * scale), int(vb_height * scale)
                    else:
                        min_dimension = 512
                        scale = max(min_dimension / vb_width, min_dimension / vb_height)
                        return int(vb_width * scale), int(vb_height * scale)
                        
            except (ValueError, IndexError):
                pass
        
        # Dimensiones por defecto
        return 1024, 1024
        
    except Exception:
        return 1024, 1024

def get_svg_basic_info(svg_path):
    """Obtener información básica del SVG"""
    try:
        with open(svg_path, 'r', encoding='utf-8') as f:
            svg_content = f.read()
        
        import re
        
        info_parts = []
        
        # Buscar dimensiones
        width_match = re.search(r'width=["\']([^"\']+)["\']', svg_content)
        height_match = re.search(r'height=["\']([^"\']+)["\']', svg_content)
        
        if width_match and height_match:
            width = width_match.group(1)
            height = height_match.group(1)
            info_parts.append(f"{width}×{height}")
        
        # Contar elementos básicos
        path_count = len(re.findall(r'<path', svg_content))
        circle_count = len(re.findall(r'<circle', svg_content))
        rect_count = len(re.findall(r'<rect', svg_content))
        
        total_elements = path_count + circle_count + rect_count
        if total_elements > 0:
            info_parts.append(f"{total_elements} elementos")
        
        return ', '.join(info_parts) if info_parts else "SVG válido"
        
    except Exception:
        return "SVG"

def draw_svg_representation(draw, svg_path):
    """Dibujar una representación básica del SVG"""
    try:
        with open(svg_path, 'r', encoding='utf-8') as f:
            svg_content = f.read()
        
        import re
        
        # Área de dibujo
        draw_area = (50, 350, 750, 550)
        
        # Dibujar marco del área
        draw.rectangle(draw_area, outline='gray', width=1)
        
        # Contar elementos para mostrar representación
        path_count = len(re.findall(r'<path', svg_content))
        circle_count = len(re.findall(r'<circle', svg_content))
        rect_count = len(re.findall(r'<rect', svg_content))
        
        # Dibujar representación simple
        x_start, y_start, x_end, y_end = draw_area
        center_x = (x_start + x_end) // 2
        center_y = (y_start + y_end) // 2
        
        if circle_count > 0:
            # Dibujar círculos representativos
            for i in range(min(circle_count, 3)):
                radius = 30 + i * 10
                draw.ellipse([center_x - radius, center_y - radius, 
                            center_x + radius, center_y + radius], 
                           outline='blue', width=2)
        
        if rect_count > 0:
            # Dibujar rectángulos representativos
            for i in range(min(rect_count, 2)):
                offset = i * 20
                draw.rectangle([center_x - 50 + offset, center_y - 30 + offset,
                              center_x + 50 + offset, center_y + 30 + offset],
                             outline='green', width=2)
        
        if path_count > 0:
            # Dibujar líneas representativas de paths
            for i in range(min(path_count, 4)):
                y_offset = i * 15 - 30
                draw.line([x_start + 100, center_y + y_offset, 
                          x_end - 100, center_y + y_offset], 
                         fill='red', width=2)
        
        # Si no hay elementos específicos, dibujar forma genérica
        if path_count + circle_count + rect_count == 0:
            draw.polygon([center_x, y_start + 50, 
                         x_end - 50, center_y,
                         center_x, y_end - 50,
                         x_start + 50, center_y], 
                        outline='purple', width=2)
        
    except Exception as e:
        # Si hay error, dibujar forma básica
        draw.text((60, 370), "Representación SVG no disponible", fill='gray')
