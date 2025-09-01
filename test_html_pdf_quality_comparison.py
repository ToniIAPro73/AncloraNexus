#!/usr/bin/env python3
"""
Test de comparación de calidad HTML a PDF
Compara diferentes métodos de conversión usando el archivo de diseño de Anclora
"""

import os
import sys
import time
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Agregar el directorio backend al path
backend_path = Path(__file__).parent / "backend" / "src"
sys.path.insert(0, str(backend_path))

def test_html_to_pdf_conversion():
    """Prueba todos los métodos de conversión HTML a PDF disponibles"""
    
    # Archivo de entrada
    input_html = "docs/design/Anclora Brand & Design System Guide (A4).html"
    
    if not os.path.exists(input_html):
        logger.error(f"Archivo HTML no encontrado: {input_html}")
        return
    
    logger.info(f"Iniciando pruebas de conversión HTML→PDF con: {input_html}")
    
    # Crear directorio de resultados
    results_dir = "html_pdf_quality_test_results"
    os.makedirs(results_dir, exist_ok=True)
    
    # Métodos de conversión a probar
    conversion_methods = [
        ("playwright", "Playwright (Chromium)"),
        ("wkhtmltopdf", "wkhtmltopdf"),
        ("pandoc", "Pandoc"),
        ("weasyprint", "WeasyPrint"),
        ("fpdf", "FPDF (fallback)")
    ]
    
    results = {}
    
    for method_id, method_name in conversion_methods:
        logger.info(f"\n{'='*50}")
        logger.info(f"Probando: {method_name}")
        logger.info(f"{'='*50}")
        
        output_file = os.path.join(results_dir, f"anclora_design_guide_{method_id}.pdf")
        
        try:
            start_time = time.time()
            success, message = test_conversion_method(method_id, input_html, output_file)
            end_time = time.time()
            
            duration = end_time - start_time
            file_size = os.path.getsize(output_file) if os.path.exists(output_file) else 0
            
            results[method_id] = {
                'method_name': method_name,
                'success': success,
                'message': message,
                'duration': duration,
                'file_size': file_size,
                'output_file': output_file
            }
            
            if success:
                logger.info(f"✅ {method_name}: {message}")
                logger.info(f"   Tiempo: {duration:.2f}s")
                logger.info(f"   Tamaño: {file_size:,} bytes")
                logger.info(f"   Archivo: {output_file}")
            else:
                logger.error(f"❌ {method_name}: {message}")
                
        except Exception as e:
            logger.error(f"❌ {method_name}: Error inesperado - {str(e)}")
            results[method_id] = {
                'method_name': method_name,
                'success': False,
                'message': f"Error inesperado: {str(e)}",
                'duration': 0,
                'file_size': 0,
                'output_file': output_file
            }
    
    # Generar reporte de resultados
    generate_quality_report(results, results_dir)

def test_conversion_method(method_id, input_path, output_path):
    """Prueba un método específico de conversión"""
    
    if method_id == "playwright":
        return test_playwright_conversion(input_path, output_path)
    elif method_id == "wkhtmltopdf":
        return test_wkhtmltopdf_conversion(input_path, output_path)
    elif method_id == "pandoc":
        return test_pandoc_conversion(input_path, output_path)
    elif method_id == "weasyprint":
        return test_weasyprint_conversion(input_path, output_path)
    elif method_id == "fpdf":
        return test_fpdf_conversion(input_path, output_path)
    else:
        return False, f"Método desconocido: {method_id}"

def test_playwright_conversion(input_path, output_path):
    """Prueba conversión con Playwright"""
    try:
        from playwright.sync_api import sync_playwright
        
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            
            # Configurar viewport para A4
            page.set_viewport_size({"width": 794, "height": 1123})
            
            # Cargar el archivo HTML
            page.goto(f"file://{os.path.abspath(input_path)}")
            
            # Esperar a que se carguen todos los recursos
            page.wait_for_load_state("networkidle")
            
            # Generar PDF
            page.pdf(
                path=output_path,
                format="A4",
                margin={
                    "top": "20mm",
                    "bottom": "20mm", 
                    "left": "20mm",
                    "right": "20mm"
                },
                print_background=True,
                prefer_css_page_size=True,
                display_header_footer=False
            )
            
            browser.close()
            
        return True, "Conversión exitosa con Playwright"
        
    except ImportError:
        return False, "Playwright no está instalado"
    except Exception as e:
        return False, f"Error en Playwright: {str(e)}"

def test_wkhtmltopdf_conversion(input_path, output_path):
    """Prueba conversión con wkhtmltopdf"""
    try:
        import pdfkit
        
        options = {
            'page-size': 'A4',
            'margin-top': '20mm',
            'margin-right': '20mm',
            'margin-bottom': '20mm',
            'margin-left': '20mm',
            'encoding': "UTF-8",
            'no-outline': None,
            'enable-local-file-access': None,
            'print-media-type': None,
            'disable-smart-shrinking': None,
            'javascript-delay': 1000
        }
        
        pdfkit.from_file(input_path, output_path, options=options)
        return True, "Conversión exitosa con wkhtmltopdf"
        
    except ImportError:
        return False, "pdfkit/wkhtmltopdf no está instalado"
    except Exception as e:
        return False, f"Error en wkhtmltopdf: {str(e)}"

def test_pandoc_conversion(input_path, output_path):
    """Prueba conversión con Pandoc"""
    try:
        import pypandoc
        
        pypandoc.convert_file(
            input_path,
            'pdf',
            outputfile=output_path,
            format='html',
            extra_args=[
                '--pdf-engine=xelatex',
                '--variable', 'geometry:margin=20mm',
                '--variable', 'fontsize=11pt',
                '--standalone'
            ]
        )
        
        return True, "Conversión exitosa con Pandoc"
        
    except ImportError:
        return False, "pypandoc no está instalado"
    except Exception as e:
        return False, f"Error en Pandoc: {str(e)}"

def test_weasyprint_conversion(input_path, output_path):
    """Prueba conversión con WeasyPrint"""
    try:
        import weasyprint
        
        with open(input_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        html_doc = weasyprint.HTML(string=html_content, base_url=os.path.dirname(input_path))
        html_doc.write_pdf(output_path)
        
        return True, "Conversión exitosa con WeasyPrint"
        
    except ImportError:
        return False, "WeasyPrint no está instalado"
    except Exception as e:
        return False, f"Error en WeasyPrint: {str(e)}"

def test_fpdf_conversion(input_path, output_path):
    """Prueba conversión con FPDF (fallback)"""
    try:
        from models.conversions.html_to_pdf import convert_with_fpdf_enhanced
        
        success, message = convert_with_fpdf_enhanced(input_path, output_path)
        return success, message
        
    except ImportError:
        return False, "Módulo FPDF no disponible"
    except Exception as e:
        return False, f"Error en FPDF: {str(e)}"

def generate_quality_report(results, results_dir):
    """Genera un reporte de calidad de las conversiones"""
    
    report_file = os.path.join(results_dir, "quality_comparison_report.md")
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("# Reporte de Calidad: HTML a PDF\n\n")
        f.write("## Archivo de prueba\n")
        f.write("- **Archivo**: `docs/design/Anclora Brand & Design System Guide (A4).html`\n")
        f.write("- **Descripción**: Guía de diseño compleja con CSS avanzado, gradientes, fuentes personalizadas\n\n")
        
        f.write("## Resultados de Conversión\n\n")
        f.write("| Método | Estado | Tiempo (s) | Tamaño (KB) | Mensaje |\n")
        f.write("|--------|--------|------------|-------------|----------|\n")
        
        for method_id, result in results.items():
            status = "✅" if result['success'] else "❌"
            duration = f"{result['duration']:.2f}" if result['success'] else "N/A"
            size_kb = f"{result['file_size'] // 1024}" if result['file_size'] > 0 else "0"
            message = result['message'][:50] + "..." if len(result['message']) > 50 else result['message']
            
            f.write(f"| {result['method_name']} | {status} | {duration} | {size_kb} | {message} |\n")
        
        f.write("\n## Recomendaciones\n\n")
        
        successful_methods = [r for r in results.values() if r['success']]
        if successful_methods:
            # Ordenar por tamaño de archivo (mayor = mejor calidad potencial)
            successful_methods.sort(key=lambda x: x['file_size'], reverse=True)
            best_method = successful_methods[0]
            
            f.write(f"### Método Recomendado: {best_method['method_name']}\n")
            f.write(f"- **Razón**: Mayor tamaño de archivo sugiere mejor preservación de elementos visuales\n")
            f.write(f"- **Tiempo**: {best_method['duration']:.2f} segundos\n")
            f.write(f"- **Tamaño**: {best_method['file_size']:,} bytes\n\n")
        
        f.write("### Análisis de Calidad\n")
        f.write("Para evaluar la calidad visual, compare manualmente:\n")
        f.write("1. **Preservación de fuentes**: ¿Se mantienen las fuentes personalizadas?\n")
        f.write("2. **Gradientes y colores**: ¿Se renderizan correctamente los gradientes CSS?\n")
        f.write("3. **Layout y espaciado**: ¿Se mantiene la estructura original?\n")
        f.write("4. **Imágenes de fondo**: ¿Se incluyen las imágenes de fondo?\n")
        f.write("5. **Elementos CSS avanzados**: ¿Se preservan sombras, bordes redondeados, etc.?\n")
    
    logger.info(f"\n📊 Reporte generado: {report_file}")
    logger.info("🔍 Revise manualmente los PDFs generados para evaluar la calidad visual")

if __name__ == "__main__":
    test_html_to_pdf_conversion()
