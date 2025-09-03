import os
import zipfile
from fpdf import FPDF
from docx import Document

CONVERSION = ('docx', 'pdf')

def convert(input_path, output_path):
    """Convierte DOCX a PDF con validación mejorada"""
    try:
        # Verificar que el archivo DOCX es válido
        if not is_valid_docx(input_path):
            return False, "Error: El archivo DOCX está corrupto o no es válido"
        
        # Leer documento DOCX
        try:
            doc = Document(input_path)
        except Exception as e:
            return False, f"Error leyendo DOCX: {str(e)}"
        
        # Crear PDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        # Configurar fuente con soporte Unicode
        try:
            pdf.set_font("Helvetica", size=12)
        except:
            pdf.set_font("Times", size=12)
        
        # Extraer texto de todos los párrafos
        for paragraph in doc.paragraphs:
            text = paragraph.text.strip()
            if text:
                # Limpiar caracteres Unicode problemáticos
                text_clean = clean_unicode_for_pdf(text)
                
                try:
                    # Determinar si es título basado en el estilo
                    if paragraph.style.name.startswith('Heading'):
                        pdf.set_font("Helvetica", 'B', 14)
                        pdf.multi_cell(0, 10, text_clean)
                        pdf.ln(5)
                        pdf.set_font("Helvetica", size=12)
                    else:
                        pdf.multi_cell(0, 10, text_clean)
                        pdf.ln(2)
                except UnicodeEncodeError:
                    # Fallback adicional
                    text_ascii = text_clean.encode('ascii', 'ignore').decode('ascii')
                    pdf.multi_cell(0, 10, text_ascii)
                    pdf.ln(2)
        
        # Guardar PDF
        pdf.output(output_path)
        
        # Verificar que el archivo se creó correctamente
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            return False, "Error: No se pudo generar el archivo PDF"
        
        return True, "Conversión DOCX→PDF exitosa"
    except Exception as e:
        return False, f"Error en conversión DOCX→PDF: {str(e)}"

def is_valid_docx(file_path):
    """Verifica si un archivo DOCX es válido"""
    try:
        # Un archivo DOCX es realmente un archivo ZIP
        with zipfile.ZipFile(file_path, 'r') as zip_file:
            # Verificar que contiene los archivos esenciales de un DOCX
            required_files = ['[Content_Types].xml', 'word/document.xml']
            file_list = zip_file.namelist()
            
            for required_file in required_files:
                if required_file not in file_list:
                    return False
            
            return True
    except (zipfile.BadZipFile, FileNotFoundError):
        return False

def clean_unicode_for_pdf(text):
    """Limpia caracteres Unicode problemáticos para PDF"""
    # Reemplazos de caracteres especiales comunes
    replacements = {
        # Acentos
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
        'ñ': 'n', 'Ñ': 'N',
        
        # Signos especiales
        '¿': '?', '¡': '!',
        # Comillas tipográficas a ASCII
        '"': '"', '"': '"', ''': "'", ''': "'",
        '–': '-', '—': '-',
        
        # Emojis comunes
        '🚀': '[rocket]', '🎉': '[party]', '✅': '[check]', 
        '❌': '[x]', '🔥': '[fire]', '💡': '[idea]',
        '📄': '[document]', '🧠': '[brain]', '⚡': '[lightning]',
        '🎯': '[target]', '📊': '[chart]', '🔒': '[lock]',
        '👁️': '[eye]', '📦': '[package]', '🌟': '[star]'
    }
    
    # Aplicar reemplazos
    cleaned_text = text
    for old, new in replacements.items():
        cleaned_text = cleaned_text.replace(old, new)
    
    # Normalizar Unicode
    try:
        import unicodedata
        cleaned_text = unicodedata.normalize('NFKD', cleaned_text)
        # Remover caracteres no ASCII problemáticos
        cleaned_text = ''.join(c if ord(c) < 128 else '?' for c in cleaned_text if ord(c) != 0)
    except:
        pass
    
    return cleaned_text
