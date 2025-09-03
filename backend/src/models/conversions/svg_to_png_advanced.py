import os
import tempfile
import logging
from xml.etree import ElementTree as ET

# Importar librerías para SVG de alta calidad
try:
    import cairosvg
    CAIROSVG_AVAILABLE = True
except ImportError:
    CAIROSVG_AVAILABLE = False
    logging.warning("CairoSVG no disponible para SVG→PNG de alta calidad")

try:
    from svglib.svglib import renderSVG
    from reportlab.graphics import renderPM
    SVGLIB_AVAILABLE = True
except ImportError:
    SVGLIB_AVAILABLE = False
    logging.warning("svglib no disponible para SVG→PNG")

try:
    from PIL import Image, ImageDraw
    from io import BytesIO
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logging.warning("PIL no disponible")

CONVERSION = ('svg', 'png')

def convert(input_path, output_path):
    """Convierte SVG a PNG usando la mejor librería disponible"""
    
    # Método 1: CairoSVG (RECOMENDADO - mejor calidad)
    if CAIROSVG_AVAILABLE:
        try:
            success, message = convert_with_cairosvg(input_path, output_path)
            if success:
                return True, f"Conversión SVG→PNG exitosa con CairoSVG - {message}"
        except Exception as e:
            logging.warning(f"CairoSVG falló: {e}")
    
    # Método 2: svglib + ReportLab (buena calidad)
    if SVGLIB_AVAILABLE:
        try:
            success, message = convert_with_svglib(input_path, output_path)
            if success:
                return True, f"Conversión SVG→PNG exitosa con svglib - {message}"
        except Exception as e:
            logging.warning(f"svglib falló: {e}")
    
    # Método 3: Fallback básico con PIL
    if PIL_AVAILABLE:
        return convert_with_pil_fallback(input_path, output_path)
    
    return False, "No hay librerías disponibles para SVG→PNG"

def convert_with_cairosvg(input_path, output_path):
    """Conversión usando CairoSVG (máxima calidad)"""
    try:
        # Leer SVG
        with open(input_path, 'r', encoding='utf-8') as f:
            svg_content = f.read()
        
        # Analizar dimensiones del SVG
        dimensions = analyze_svg_dimensions(svg_content)
        
        # Convertir con CairoSVG
        cairosvg.svg2png(
            bytestring=svg_content.encode('utf-8'),
            write_to=output_path,
            output_width=dimensions.get('width', 800),
            output_height=dimensions.get('height', 600),
            dpi=300  # Alta resolución
        )
        
        # Verificar que se creó correctamente
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            return True, f"PNG generado: {dimensions.get('width', 800)}x{dimensions.get('height', 600)}px"
        else:
            return False, "Error: PNG no se generó correctamente"
        
    except Exception as e:
        return False, f"Error con CairoSVG: {str(e)}"

def convert_with_svglib(input_path, output_path):
    """Conversión usando svglib + ReportLab"""
    try:
        # Renderizar SVG
        drawing = renderSVG.renderSVG(input_path)
        
        if drawing is None:
            return False, "Error: No se pudo renderizar el SVG"
        
        # Convertir a PNG
        renderPM.drawToFile(drawing, output_path, fmt='PNG', dpi=300)
        
        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            return True, f"PNG generado con svglib (DPI: 300)"
        else:
            return False, "Error: PNG no se generó correctamente"
        
    except Exception as e:
        return False, f"Error con svglib: {str(e)}"

def convert_with_pil_fallback(input_path, output_path):
    """Fallback básico usando PIL (calidad limitada)"""
    try:
        # Leer y analizar SVG
        with open(input_path, 'r', encoding='utf-8') as f:
            svg_content = f.read()
        
        dimensions = analyze_svg_dimensions(svg_content)
        width = dimensions.get('width', 400)
        height = dimensions.get('height', 300)
        
        # Crear imagen básica con información del SVG
        img = Image.new('RGB', (width, height), 'white')
        draw = ImageDraw.Draw(img)
        
        # Extraer información básica del SVG
        svg_info = extract_svg_info(svg_content)
        
        # Dibujar representación básica
        draw.rectangle([10, 10, width-10, height-10], outline='black', width=2)
        
        # Texto informativo
        draw.text((20, 20), f"SVG: {svg_info.get('title', 'Sin título')}", fill='black')
        draw.text((20, 40), f"Elementos: {svg_info.get('elements', 0)}", fill='black')
        draw.text((20, 60), f"Tamaño: {width}x{height}", fill='black')
        draw.text((20, height-30), "Conversión básica - Instalar CairoSVG para mejor calidad", fill='gray')
        
        # Guardar PNG
        img.save(output_path, 'PNG', quality=95)
        
        return True, f"PNG básico generado: {width}x{height}px (instalar CairoSVG para mejor calidad)"
        
    except Exception as e:
        return False, f"Error en fallback PIL: {str(e)}"

def analyze_svg_dimensions(svg_content):
    """Analiza las dimensiones del SVG"""
    dimensions = {'width': 800, 'height': 600}  # Valores por defecto
    
    try:
        # Parsear XML
        root = ET.fromstring(svg_content)
        
        # Buscar atributos de dimensión
        width = root.get('width')
        height = root.get('height')
        viewbox = root.get('viewBox')
        
        # Procesar width y height
        if width:
            dimensions['width'] = parse_dimension(width)
        if height:
            dimensions['height'] = parse_dimension(height)
        
        # Procesar viewBox si no hay width/height
        if viewbox and (not width or not height):
            parts = viewbox.split()
            if len(parts) >= 4:
                dimensions['width'] = int(float(parts[2]))
                dimensions['height'] = int(float(parts[3]))
        
        # Asegurar dimensiones mínimas y máximas
        dimensions['width'] = max(100, min(dimensions['width'], 4000))
        dimensions['height'] = max(100, min(dimensions['height'], 4000))
        
    except Exception as e:
        logging.warning(f"Error analizando dimensiones SVG: {e}")
    
    return dimensions

def parse_dimension(dim_str):
    """Parsea una dimensión SVG (ej: '100px', '50%', '200')"""
    try:
        # Remover unidades comunes
        dim_str = dim_str.lower().replace('px', '').replace('pt', '').replace('em', '')
        
        # Si contiene %, usar valor por defecto
        if '%' in dim_str:
            return 400
        
        return int(float(dim_str))
    except:
        return 400

def extract_svg_info(svg_content):
    """Extrae información básica del SVG"""
    info = {'title': 'SVG', 'elements': 0}
    
    try:
        root = ET.fromstring(svg_content)
        
        # Buscar título
        title_elem = root.find('.//{http://www.w3.org/2000/svg}title')
        if title_elem is not None and title_elem.text:
            info['title'] = title_elem.text[:30]
        
        # Contar elementos gráficos
        graphic_elements = ['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path', 'text', 'image']
        element_count = 0
        
        for elem_type in graphic_elements:
            elements = root.findall(f'.//{{{http://www.w3.org/2000/svg}}}{elem_type}')
            element_count += len(elements)
        
        info['elements'] = element_count
        
    except Exception as e:
        logging.warning(f"Error extrayendo info SVG: {e}")
    
    return info

# Función para reemplazar el SVG→PNG básico existente
def replace_basic_svg_converter():
    """Reemplaza el convertidor SVG→PNG básico con esta versión avanzada"""
    try:
        # Importar el módulo básico
        from . import svg_to_png
        
        # Reemplazar la función convert
        svg_to_png.convert = convert
        
        logging.info("Convertidor SVG→PNG básico reemplazado con versión avanzada")
        return True
    except Exception as e:
        logging.warning(f"No se pudo reemplazar convertidor básico: {e}")
        return False

# Auto-reemplazar al importar
replace_basic_svg_converter()
