import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('tiff', 'jpg')

def convert(input_path, output_path):
    """Convierte TIFF a JPG con manejo de múltiples páginas"""
    try:
        # Abrir imagen TIFF
        with Image.open(input_path) as img:
            # TIFF puede tener múltiples páginas/frames
            if hasattr(img, 'n_frames') and img.n_frames > 1:
                # Para TIFF multipágina, convertir solo la primera página
                img.seek(0)
            
            # Convertir a RGB si es necesario
            if img.mode in ('RGBA', 'LA', 'P', 'CMYK'):
                # Crear fondo blanco para transparencia
                if img.mode == 'CMYK':
                    img = img.convert('RGB')
                else:
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    if img.mode in ('RGBA', 'LA'):
                        background.paste(img, mask=img.split()[-1])
                        img = background
                    else:
                        img = img.convert('RGB')
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Guardar como JPG con calidad alta
            img.save(output_path, 'JPEG', quality=95, optimize=True)
        
        # Verificar que el archivo se creó correctamente
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            return False, "Error: No se pudo generar el archivo JPG"
        
        return True, "Conversión TIFF→JPG exitosa"
        
    except Exception as e:
        return False, f"Error en conversión TIFF→JPG: {str(e)}"
