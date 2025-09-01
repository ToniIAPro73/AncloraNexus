import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('txt', 'md')

def convert(input_path, output_path):
    """Convierte TXT a Markdown con formato inteligente"""
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Convertir texto plano a Markdown con formato básico
        md_content = convert_text_to_markdown(content)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
        
        return True, "Conversión TXT→MD exitosa"
    except Exception as e:
        return False, f"Error en conversión TXT→MD: {str(e)}"

def convert_text_to_markdown(text):
    """Convierte texto plano a formato Markdown con detección inteligente"""
    lines = text.split('\n')
    md_lines = []
    
    for i, line in enumerate(lines):
        line = line.strip()
        
        if not line:
            md_lines.append('')
            continue
        
        # Detectar títulos (líneas que parecen títulos)
        if is_title_line(line, i, lines):
            # Determinar nivel de título
            if line.isupper() or line.startswith('#'):
                md_lines.append(f"# {line.replace('#', '').strip()}")
            elif line.endswith(':') or is_section_header(line):
                md_lines.append(f"## {line.replace(':', '').strip()}")
            else:
                md_lines.append(f"### {line}")
        
        # Detectar listas
        elif line.startswith(('- ', '* ', '+ ')) or line.startswith(tuple(f"{i}. " for i in range(1, 10))):
            md_lines.append(line)
        
        # Detectar citas (líneas que empiezan con > o comillas)
        elif line.startswith(('"', '>', '»')) or 'dijo' in line.lower() or 'cita' in line.lower():
            clean_quote = line.replace('"', '').replace('>', '').replace('»', '').strip()
            md_lines.append(f"> {clean_quote}")
        
        # Detectar código (líneas con muchos símbolos técnicos)
        elif is_code_line(line):
            md_lines.append(f"```\n{line}\n```")
        
        # Detectar texto enfatizado
        elif line.startswith(('**', '*')) and line.endswith(('**', '*')):
            md_lines.append(line)
        
        # Texto normal con formato automático
        else:
            # Detectar palabras importantes para enfatizar
            formatted_line = auto_format_text(line)
            md_lines.append(formatted_line)
    
    return '\n'.join(md_lines)

def is_title_line(line, index, all_lines):
    """Detecta si una línea parece ser un título"""
    # Líneas cortas al inicio del documento
    if index < 3 and len(line) < 60 and not line.endswith('.'):
        return True
    
    # Líneas que terminan con : y son cortas
    if line.endswith(':') and len(line) < 50:
        return True
    
    # Líneas en mayúsculas
    if line.isupper() and len(line) < 80:
        return True
    
    # Líneas seguidas de líneas vacías
    if index < len(all_lines) - 1 and not all_lines[index + 1].strip():
        if len(line) < 60 and not line.endswith('.'):
            return True
    
    return False

def is_section_header(line):
    """Detecta si una línea es un encabezado de sección"""
    section_words = ['características', 'beneficios', 'conclusión', 'introducción', 
                    'resumen', 'objetivos', 'metodología', 'resultados', 'análisis']
    return any(word in line.lower() for word in section_words)

def is_code_line(line):
    """Detecta si una línea parece ser código"""
    code_indicators = ['{', '}', '()', '=>', '->', '==', '!=', '&&', '||', 
                      'function', 'def ', 'class ', 'import ', 'from ']
    return any(indicator in line for indicator in code_indicators)

def auto_format_text(line):
    """Aplica formato automático a texto normal"""
    # Enfatizar palabras importantes
    important_words = ['importante', 'nota', 'atención', 'cuidado', 'advertencia',
                      'recomendación', 'conclusión', 'resultado', 'análisis']
    
    formatted_line = line
    for word in important_words:
        if word in line.lower():
            # Buscar la palabra exacta y enfatizarla
            import re
            pattern = re.compile(re.escape(word), re.IGNORECASE)
            formatted_line = pattern.sub(f"**{word}**", formatted_line, count=1)
    
    # Detectar y formatear números o porcentajes importantes
    import re
    # Enfatizar porcentajes
    formatted_line = re.sub(r'(\d+%)', r'**\1**', formatted_line)
    
    # Enfatizar números grandes
    formatted_line = re.sub(r'(\d{4,})', r'**\1**', formatted_line)
    
    return formatted_line
