"""
Conversor esencial para presupuesto reducido
Implementa las 5 conversiones de mayor ROI con dependencias gratuitas
"""

import os
import pandas as pd
from pathlib import Path
from typing import Dict, Tuple
import logging

# Dependencias gratuitas esenciales
try:
    from docx import Document
    from docx2pdf import convert as docx_to_pdf_convert
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    logging.warning("python-docx o docx2pdf no disponible")

try:
    from PIL import Image
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False
    logging.warning("Pillow no disponible")

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    logging.warning("PyPDF2 no disponible")

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter, A4
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    logging.warning("ReportLab no disponible")

logger = logging.getLogger(__name__)

class EssentialConverter:
    """
    Conversor esencial con las 5 conversiones de mayor ROI
    Diseñado para presupuesto cero y máximo impacto
    """
    
    def __init__(self):
        self.supported_conversions = {
            ('docx', 'pdf'): self.docx_to_pdf,
            ('xlsx', 'csv'): self.xlsx_to_csv,
            ('csv', 'xlsx'): self.csv_to_xlsx,
            ('json', 'xlsx'): self.json_to_xlsx,
            ('pdf', 'txt'): self.pdf_to_text,
            ('jpg', 'png'): self.convert_image,
            ('png', 'jpg'): self.convert_image,
            ('gif', 'png'): self.convert_image,
            ('bmp', 'jpg'): self.convert_image,
        }
    
    def convert(self, input_path: str, output_path: str, 
                source_format: str = None, target_format: str = None) -> Tuple[bool, str]:
        """
        Conversión universal con detección automática de formato
        """
        try:
            # Detectar formatos si no se especifican
            if not source_format:
                source_format = self._detect_format(input_path)
            if not target_format:
                target_format = self._detect_format(output_path)
            
            # Buscar conversor apropiado
            conversion_key = (source_format.lower(), target_format.lower())
            
            if conversion_key not in self.supported_conversions:
                return False, f"Conversión {source_format}→{target_format} no soportada"
            
            # Ejecutar conversión
            converter_func = self.supported_conversions[conversion_key]
            return converter_func(input_path, output_path)
            
        except Exception as e:
            logger.error(f"Error en conversión: {str(e)}")
            return False, f"Error en conversión: {str(e)}"
    
    def docx_to_pdf(self, input_path: str, output_path: str) -> Tuple[bool, str]:
        """
        Conversión Word a PDF - GRATIS
        ROI: ⭐⭐⭐⭐⭐ (demanda muy alta)
        """
        if not DOCX_AVAILABLE:
            return False, "python-docx no disponible"
        
        try:
            # Método 1: Intentar docx2pdf (Windows/Mac)
            try:
                docx_to_pdf_convert(input_path, output_path)
                return True, "Conversión DOCX→PDF exitosa con docx2pdf"
            except:
                pass
            
            # Método 2: Fallback con reportlab (multiplataforma)
            if REPORTLAB_AVAILABLE:
                return self._docx_to_pdf_reportlab(input_path, output_path)
            
            return False, "No se pudo convertir DOCX a PDF"
            
        except Exception as e:
            return False, f"Error en conversión DOCX→PDF: {str(e)}"
    
    def _docx_to_pdf_reportlab(self, input_path: str, output_path: str) -> Tuple[bool, str]:
        """Fallback DOCX→PDF usando reportlab"""
        try:
            # Leer contenido del DOCX
            doc = Document(input_path)
            
            # Crear PDF con reportlab
            c = canvas.Canvas(output_path, pagesize=A4)
            width, height = A4
            
            y_position = height - 50
            line_height = 20
            
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    # Manejar texto largo (wrap básico)
                    text = paragraph.text[:100] + "..." if len(paragraph.text) > 100 else paragraph.text
                    c.drawString(50, y_position, text)
                    y_position -= line_height
                    
                    # Nueva página si es necesario
                    if y_position < 50:
                        c.showPage()
                        y_position = height - 50
            
            c.save()
            return True, "Conversión DOCX→PDF exitosa con ReportLab"
            
        except Exception as e:
            return False, f"Error en fallback DOCX→PDF: {str(e)}"
    
    def xlsx_to_csv(self, input_path: str, output_path: str) -> Tuple[bool, str]:
        """
        Conversión Excel a CSV - GRATIS
        ROI: ⭐⭐⭐⭐⭐ (muy común en empresas)
        """
        try:
            # Leer Excel con pandas
            df = pd.read_excel(input_path, engine='openpyxl')
            
            # Guardar como CSV
            df.to_csv(output_path, index=False, encoding='utf-8')
            
            return True, f"Conversión XLSX→CSV exitosa ({len(df)} filas)"
            
        except Exception as e:
            return False, f"Error en conversión XLSX→CSV: {str(e)}"
    
    def csv_to_xlsx(self, input_path: str, output_path: str) -> Tuple[bool, str]:
        """
        Conversión CSV a Excel - GRATIS
        ROI: ⭐⭐⭐⭐ (formato más profesional)
        """
        try:
            # Leer CSV con pandas
            df = pd.read_csv(input_path, encoding='utf-8')
            
            # Guardar como Excel con formato básico
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Data', index=False)
                
                # Formato básico
                worksheet = writer.sheets['Data']
                for column in worksheet.columns:
                    max_length = 0
                    column_letter = column[0].column_letter
                    for cell in column:
                        try:
                            if len(str(cell.value)) > max_length:
                                max_length = len(str(cell.value))
                        except:
                            pass
                    adjusted_width = min(max_length + 2, 50)
                    worksheet.column_dimensions[column_letter].width = adjusted_width
            
            return True, f"Conversión CSV→XLSX exitosa ({len(df)} filas)"
            
        except Exception as e:
            return False, f"Error en conversión CSV→XLSX: {str(e)}"
    
    def json_to_xlsx(self, input_path: str, output_path: str) -> Tuple[bool, str]:
        """
        Conversión JSON a Excel - GRATIS
        ROI: ⭐⭐⭐⭐ (APIs → reportes)
        """
        try:
            # Leer JSON con pandas
            df = pd.read_json(input_path)
            
            # Si es JSON anidado, intentar normalizar
            if any(isinstance(val, (dict, list)) for val in df.iloc[0] if pd.notna(val)):
                try:
                    df = pd.json_normalize(df.to_dict('records'))
                except:
                    pass  # Usar DataFrame original si normalización falla
            
            # Guardar como Excel
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Data', index=False)
                
                # Auto-ajustar columnas
                worksheet = writer.sheets['Data']
                for column in worksheet.columns:
                    max_length = 0
                    column_letter = column[0].column_letter
                    for cell in column:
                        try:
                            if len(str(cell.value)) > max_length:
                                max_length = len(str(cell.value))
                        except:
                            pass
                    adjusted_width = min(max_length + 2, 50)
                    worksheet.column_dimensions[column_letter].width = adjusted_width
            
            return True, f"Conversión JSON→XLSX exitosa ({len(df)} filas)"
            
        except Exception as e:
            return False, f"Error en conversión JSON→XLSX: {str(e)}"
    
    def pdf_to_text(self, input_path: str, output_path: str) -> Tuple[bool, str]:
        """
        Conversión PDF a texto - GRATIS
        ROI: ⭐⭐⭐⭐ (extracción de contenido)
        """
        if not PDF_AVAILABLE:
            return False, "PyPDF2 no disponible"
        
        try:
            text_content = []
            
            with open(input_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                for page_num, page in enumerate(pdf_reader.pages):
                    try:
                        text = page.extract_text()
                        if text.strip():
                            text_content.append(f"--- Página {page_num + 1} ---\n{text}\n")
                    except Exception as e:
                        text_content.append(f"--- Página {page_num + 1} ---\n[Error extrayendo texto: {str(e)}]\n")
            
            # Guardar texto extraído
            with open(output_path, 'w', encoding='utf-8') as output_file:
                output_file.write('\n'.join(text_content))
            
            return True, f"Conversión PDF→TXT exitosa ({len(pdf_reader.pages)} páginas)"
            
        except Exception as e:
            return False, f"Error en conversión PDF→TXT: {str(e)}"
    
    def convert_image(self, input_path: str, output_path: str) -> Tuple[bool, str]:
        """
        Conversión de imágenes - GRATIS
        ROI: ⭐⭐⭐⭐ (muy común)
        """
        if not PILLOW_AVAILABLE:
            return False, "Pillow no disponible"
        
        try:
            # Abrir imagen
            with Image.open(input_path) as img:
                # Detectar formato de salida
                output_format = self._detect_format(output_path).upper()
                if output_format == 'JPG':
                    output_format = 'JPEG'
                
                # Convertir RGBA a RGB si es necesario (para JPEG)
                if output_format == 'JPEG' and img.mode in ('RGBA', 'LA', 'P'):
                    # Crear fondo blanco
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                
                # Guardar en nuevo formato
                img.save(output_path, format=output_format, quality=95, optimize=True)
            
            return True, f"Conversión de imagen exitosa → {output_format}"
            
        except Exception as e:
            return False, f"Error en conversión de imagen: {str(e)}"
    
    def _detect_format(self, file_path: str) -> str:
        """Detecta formato de archivo por extensión"""
        return Path(file_path).suffix.lower().lstrip('.')
    
    def get_supported_conversions(self) -> Dict[str, list]:
        """Retorna conversiones soportadas organizadas por categoría"""
        return {
            'documentos': [
                'DOCX → PDF (Word a PDF)',
                'PDF → TXT (Extraer texto)'
            ],
            'datos': [
                'XLSX → CSV (Excel a CSV)',
                'CSV → XLSX (CSV a Excel)',
                'JSON → XLSX (JSON a Excel)'
            ],
            'imagenes': [
                'JPG → PNG',
                'PNG → JPG', 
                'GIF → PNG',
                'BMP → JPG'
            ]
        }
    
    def estimate_conversion_time(self, input_path: str, conversion_type: str) -> str:
        """Estima tiempo de conversión"""
        try:
            file_size = os.path.getsize(input_path) / (1024 * 1024)  # MB
            
            if file_size < 1:
                return "< 5 segundos"
            elif file_size < 10:
                return "5-15 segundos"
            elif file_size < 50:
                return "15-60 segundos"
            else:
                return "1-3 minutos"
        except:
            return "< 30 segundos"

# Función de conveniencia para uso directo
def convert_document(input_path: str, output_path: str, 
                    source_format: str = None, target_format: str = None) -> Tuple[bool, str]:
    """
    Función de conveniencia para conversión directa
    """
    converter = EssentialConverter()
    return converter.convert(input_path, output_path, source_format, target_format)

# Ejemplo de uso
if __name__ == "__main__":
    converter = EssentialConverter()
    
    print("=== CONVERSOR ESENCIAL - PRESUPUESTO CERO ===")
    print("Conversiones soportadas:")
    
    for category, conversions in converter.get_supported_conversions().items():
        print(f"\n{category.upper()}:")
        for conversion in conversions:
            print(f"  • {conversion}")
    
    print(f"\nTotal conversiones: {len(converter.supported_conversions)}")
    print("Costo de implementación: $0")
    print("Tiempo de desarrollo: 2-3 semanas")
    print("ROI esperado: ⭐⭐⭐⭐⭐")
