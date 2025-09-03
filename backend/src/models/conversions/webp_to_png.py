import os
import logging
from pathlib import Path

# Importar librerías para imágenes
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logging.warning("PIL no disponible para WEBP→PNG")

try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    logging.warning("OpenCV no disponible para WEBP→PNG")

CONVERSION = ('webp', 'png')

def convert(input_path, output_path):
    """Convierte WEBP a PNG usando la mejor librería disponible"""
    
    # Método 1: PIL/Pillow (RECOMENDADO - mejor compatibilidad)
    if PIL_AVAILABLE:
        try:
            success, message = convert_with_pil(input_path, output_path)
            if success:
                return True, f"Conversión WEBP→PNG exitosa con PIL - {message}"
        except Exception as e:
            logging.warning(f"PIL falló: {e}")
    
    # Método 2: OpenCV (alternativa)
    if CV2_AVAILABLE:
        try:
            success, message = convert_with_opencv(input_path, output_path)
            if success:
                return True, f"Conversión WEBP→PNG exitosa con OpenCV - {message}"
        except Exception as e:
            logging.warning(f"OpenCV falló: {e}")
    
    # Sin librerías disponibles
    return False, "No hay librerías disponibles para conversión WEBP→PNG (instalar PIL/Pillow)"

def convert_with_pil(input_path, output_path):
    """Conversión usando PIL/Pillow (método recomendado)"""
    try:
        # Verificar que el archivo existe y no está vacío
        if not os.path.exists(input_path) or os.path.getsize(input_path) == 0:
            return False, "Archivo WEBP vacío o no existe"
        
        # Abrir imagen WEBP
        with Image.open(input_path) as img:
            # Obtener información de la imagen
            original_mode = img.mode
            width, height = img.size
            
            # Verificar si la imagen tiene transparencia
            has_transparency = original_mode in ('RGBA', 'LA') or 'transparency' in img.info
            
            # Convertir según el modo original
            if original_mode == 'RGBA':
                # Ya está en RGBA, perfecto para PNG
                converted_img = img
            elif original_mode == 'RGB':
                # Convertir a RGBA para mantener compatibilidad completa con PNG
                converted_img = img.convert('RGBA')
            elif original_mode == 'P':
                # Paleta de colores - convertir a RGBA preservando transparencia
                converted_img = img.convert('RGBA')
            elif original_mode == 'L':
                # Escala de grises - convertir a RGBA
                converted_img = img.convert('RGBA')
            elif original_mode == 'LA':
                # Escala de grises con alpha - convertir a RGBA
                converted_img = img.convert('RGBA')
            else:
                # Otros modos - convertir a RGBA por seguridad
                converted_img = img.convert('RGBA')
            
            # Configurar opciones de guardado PNG
            save_kwargs = {
                'format': 'PNG',
                'optimize': True,
            }
            
            # Si tiene transparencia, usar compresión PNG apropiada
            if has_transparency:
                save_kwargs['compress_level'] = 6  # Balance entre tamaño y velocidad
            else:
                save_kwargs['compress_level'] = 9  # Máxima compresión para imágenes opacas
            
            # Guardar como PNG
            converted_img.save(output_path, **save_kwargs)
        
        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            # Obtener información del archivo resultante
            result_size = os.path.getsize(output_path)
            original_size = os.path.getsize(input_path)
            
            transparency_info = " con transparencia" if has_transparency else " opaco"
            size_info = f"({result_size/1024:.1f}KB vs {original_size/1024:.1f}KB original)"
            
            return True, f"PNG generado: {width}x{height}px{transparency_info} {size_info}"
        else:
            return False, "Error: PNG no se generó correctamente"
        
    except Exception as e:
        return False, f"Error con PIL: {str(e)}"

def convert_with_opencv(input_path, output_path):
    """Conversión usando OpenCV (método alternativo)"""
    try:
        # Leer imagen WEBP con OpenCV
        # cv2.IMREAD_UNCHANGED preserva el canal alpha si existe
        img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
        
        if img is None:
            return False, "No se pudo leer el archivo WEBP con OpenCV"
        
        # Obtener información de la imagen
        if len(img.shape) == 3:
            height, width, channels = img.shape
            has_alpha = channels == 4
        else:
            height, width = img.shape
            channels = 1
            has_alpha = False
        
        # OpenCV lee en BGR, pero para PNG necesitamos RGB
        if channels == 3:
            # BGR a RGB
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        elif channels == 4:
            # BGRA a RGBA
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGRA2RGBA)
        else:
            # Escala de grises
            img_rgb = img
        
        # Guardar como PNG
        # OpenCV espera BGR para escribir, así que convertimos de vuelta
        if channels == 3:
            img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
        elif channels == 4:
            img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGBA2BGRA)
        else:
            img_bgr = img_rgb
        
        # Configurar parámetros de compresión PNG
        compression_params = [cv2.IMWRITE_PNG_COMPRESSION, 6]  # 0-9, donde 9 es máxima compresión
        
        # Escribir archivo PNG
        success = cv2.imwrite(output_path, img_bgr, compression_params)
        
        if not success:
            return False, "OpenCV no pudo escribir el archivo PNG"
        
        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            result_size = os.path.getsize(output_path)
            original_size = os.path.getsize(input_path)
            
            alpha_info = " con canal alpha" if has_alpha else ""
            size_info = f"({result_size/1024:.1f}KB vs {original_size/1024:.1f}KB original)"
            
            return True, f"PNG generado: {width}x{height}px, {channels} canales{alpha_info} {size_info}"
        else:
            return False, "Error: PNG no se generó correctamente"
        
    except Exception as e:
        return False, f"Error con OpenCV: {str(e)}"

def validate_webp_file(file_path):
    """Validar que el archivo es un WEBP válido"""
    try:
        # Verificar extensión
        if not file_path.lower().endswith('.webp'):
            return False, "Archivo no tiene extensión .webp"
        
        # Verificar que existe y no está vacío
        if not os.path.exists(file_path):
            return False, "Archivo no existe"
        
        if os.path.getsize(file_path) == 0:
            return False, "Archivo está vacío"
        
        # Verificar magic number de WEBP
        with open(file_path, 'rb') as f:
            header = f.read(12)
            
            if len(header) < 12:
                return False, "Archivo demasiado pequeño para ser WEBP válido"
            
            # WEBP tiene la estructura: RIFF + tamaño + WEBP
            if header[:4] != b'RIFF':
                return False, "No es un archivo RIFF válido"
            
            if header[8:12] != b'WEBP':
                return False, "No es un archivo WEBP válido"
        
        return True, "Archivo WEBP válido"
        
    except Exception as e:
        return False, f"Error validando archivo: {str(e)}"

def get_webp_info(file_path):
    """Obtener información detallada del archivo WEBP"""
    try:
        info = {}
        
        # Información básica del archivo
        info['file_size'] = os.path.getsize(file_path)
        info['file_size_kb'] = info['file_size'] / 1024
        
        # Intentar obtener información de imagen con PIL
        if PIL_AVAILABLE:
            try:
                with Image.open(file_path) as img:
                    info['width'] = img.width
                    info['height'] = img.height
                    info['mode'] = img.mode
                    info['format'] = img.format
                    info['has_transparency'] = img.mode in ('RGBA', 'LA') or 'transparency' in img.info
                    
                    # Información adicional si está disponible
                    if hasattr(img, 'info'):
                        info['extra_info'] = img.info
                        
            except Exception as e:
                info['pil_error'] = str(e)
        
        # Intentar obtener información con OpenCV
        if CV2_AVAILABLE:
            try:
                img = cv2.imread(file_path, cv2.IMREAD_UNCHANGED)
                if img is not None:
                    if len(img.shape) == 3:
                        info['cv2_height'], info['cv2_width'], info['cv2_channels'] = img.shape
                    else:
                        info['cv2_height'], info['cv2_width'] = img.shape
                        info['cv2_channels'] = 1
                        
            except Exception as e:
                info['cv2_error'] = str(e)
        
        return info
        
    except Exception as e:
        return {'error': str(e)}

def optimize_png_output(png_path):
    """Optimizar el archivo PNG resultante"""
    try:
        if not PIL_AVAILABLE:
            return False, "PIL no disponible para optimización"
        
        # Abrir PNG generado
        with Image.open(png_path) as img:
            # Verificar si se puede optimizar la paleta
            if img.mode == 'RGBA':
                # Verificar si realmente necesita el canal alpha
                alpha_channel = img.split()[-1]
                alpha_values = set(alpha_channel.getdata())
                
                # Si todos los valores alpha son 255 (opaco), convertir a RGB
                if len(alpha_values) == 1 and 255 in alpha_values:
                    img_rgb = img.convert('RGB')
                    img_rgb.save(png_path, 'PNG', optimize=True, compress_level=9)
                    return True, "PNG optimizado: removido canal alpha innecesario"
            
            elif img.mode == 'RGB':
                # Verificar si se puede convertir a paleta
                if img.width * img.height < 65536:  # Solo para imágenes pequeñas
                    try:
                        img_p = img.convert('P', palette=Image.ADAPTIVE, colors=256)
                        img_p.save(png_path, 'PNG', optimize=True)
                        return True, "PNG optimizado: convertido a paleta de colores"
                    except:
                        pass
        
        return True, "PNG ya optimizado"
        
    except Exception as e:
        return False, f"Error optimizando PNG: {str(e)}"
