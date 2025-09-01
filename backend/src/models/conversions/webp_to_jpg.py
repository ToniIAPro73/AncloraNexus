import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('webp', 'jpg')

def convert(input_path, output_path):
    """Convierte WEBP a JPG con optimización de calidad"""
    try:
        # Abrir imagen WEBP
        with Image.open(input_path) as img:
            # Convertir a RGB si es necesario (WEBP puede tener transparencia)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Crear fondo blanco para transparencia
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Guardar como JPG con calidad optimizada
            img.save(output_path, 'JPEG', quality=90, optimize=True)
        
        # Verificar que el archivo se creó correctamente
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            return False, "Error: No se pudo generar el archivo JPG"
        
        return True, "Conversión WEBP→JPG exitosa"
        
    except Exception as e:
        return False, f"Error en conversión WEBP→JPG: {str(e)}"
