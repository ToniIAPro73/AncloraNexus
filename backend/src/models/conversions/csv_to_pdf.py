import os, shutil, tempfile, uuid
from fpdf import FPDF
import csv

# Importar motor Pandoc
try:
    from .pandoc_engine import pandoc_engine
    PANDOC_AVAILABLE = True
except ImportError:
    PANDOC_AVAILABLE = False

CONVERSION = ('csv', 'pdf')

def convert(input_path, output_path):
    """Convierte CSV a PDF con tabla formateada"""
    try:
        # Intentar conversión vía HTML primero (mejor calidad)
        temp_html = None
        try:
            from .csv_to_html import convert as csv_to_html
            temp_html = tempfile.mktemp(suffix='.html')
            
            # Convertir CSV a HTML
            if csv_to_html(input_path, temp_html):
                # Convertir HTML a PDF usando Pandoc si está disponible
                if PANDOC_AVAILABLE:
                    success = pandoc_engine.convert_file(temp_html, output_path, 'html', 'pdf')
                    if success:
                        return True
                
                # Fallback: conversión HTML a PDF básica
                from .html_to_pdf import convert as html_to_pdf
                if html_to_pdf(temp_html, output_path):
                    return True
                    
        except Exception as e:
            print(f"Error en conversión vía HTML: {e}")
        finally:
            if temp_html and os.path.exists(temp_html):
                os.remove(temp_html)
        
        # Fallback: conversión directa CSV a PDF
        return convert_direct_csv_to_pdf(input_path, output_path)
        
    except Exception as e:
        print(f"Error en conversión CSV a PDF: {e}")
        return False

def convert_direct_csv_to_pdf(input_path, output_path):
    """Conversión directa CSV a PDF usando FPDF"""
    try:
        # Leer CSV
        with open(input_path, 'r', encoding='utf-8') as file:
            csv_reader = csv.reader(file)
            rows = list(csv_reader)
        
        if not rows:
            return False
        
        # Crear PDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font('Arial', 'B', 12)
        
        # Título
        pdf.cell(0, 10, 'Datos CSV', 0, 1, 'C')
        pdf.ln(5)
        
        # Configurar tabla
        pdf.set_font('Arial', 'B', 10)
        col_width = 190 / len(rows[0]) if rows[0] else 50
        
        # Encabezados
        for header in rows[0]:
            pdf.cell(col_width, 8, str(header)[:20], 1, 0, 'C')
        pdf.ln()
        
        # Datos
        pdf.set_font('Arial', '', 9)
        for row in rows[1:]:
            for cell in row:
                pdf.cell(col_width, 6, str(cell)[:20], 1, 0, 'C')
            pdf.ln()
        
        # Guardar PDF
        pdf.output(output_path)
        return True
        
    except Exception as e:
        print(f"Error en conversión directa CSV a PDF: {e}")
        return False
