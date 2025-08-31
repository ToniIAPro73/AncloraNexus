import os, shutil, tempfile, uuid
from fpdf import FPDF
from PIL import Image, ImageDraw
from docx import Document
from pypdf import PdfReader

CONVERSION = ('txt', 'markdown')

def convert(input_path, output_path):
    """Convierte TXT a Markdown"""
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # ConversiÃ³n bÃ¡sica a Markdown
        markdown_content = f"""# Documento Convertido

*Convertido con Anclora Nexus - {datetime.now().strftime('%d/%m/%Y')}*

---

{content}

---

**Generado por:** [Anclora Nexus](https://anclora-Nexus.com)  
**Tu Contenido, Reinventado**
"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        return True, "ConversiÃ³n exitosa"
        
    except Exception as e:
        return False, f"Error en conversiÃ³n TXTâ†’MD: {str(e)}"

