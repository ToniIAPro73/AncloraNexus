#!/usr/bin/env python3
"""
Test del analizador inteligente de complejidad HTML
"""

import sys
import os
from pathlib import Path

# Agregar el directorio backend al path
backend_path = Path(__file__).parent / "backend" / "src"
sys.path.insert(0, str(backend_path))

from models.conversions.html_complexity_analyzer import analyze_html_complexity

def test_html_analysis():
    """Prueba el analizador de complejidad HTML"""
    
    # Test con el archivo de diseño de Anclora
    test_file = 'docs/design/Anclora Brand & Design System Guide (A4).html'
    
    if not os.path.exists(test_file):
        print(f"❌ Archivo no encontrado: {test_file}")
        return
    
    print("=== ANÁLISIS INTELIGENTE DE COMPLEJIDAD HTML ===")
    print(f"📄 Archivo: {test_file}")
    print()
    
    try:
        result = analyze_html_complexity(test_file)
        
        print("📊 RESULTADOS DEL ANÁLISIS:")
        print(f"   Complejidad: {result['complexity_level']} (Score: {result['complexity_score']}/200)")
        print(f"   Método recomendado: {result['recommended_method'].upper()}")
        print(f"   Prioridad de métodos: {' → '.join(result['method_priority'])}")
        print()
        
        print("🎯 RECOMENDACIÓN:")
        print(f"   Razón: {result['reasoning']}")
        print(f"   Tiempo estimado: {result['estimated_time']}")
        print(f"   Calidad esperada: {result['quality_expectation']}")
        print()
        
        print("🔍 CARACTERÍSTICAS DETECTADAS:")
        features = result['features_detected']
        if features:
            for feature, value in features.items():
                feature_names = {
                    'custom_fonts': '🔤 Fuentes personalizadas',
                    'gradients': '🌈 Gradientes CSS',
                    'background_images': '🖼️ Imágenes de fondo',
                    'complex_css': '🎨 CSS complejo',
                    'javascript': '⚡ JavaScript',
                    'svg_content': '🔺 Contenido SVG',
                    'advanced_layout': '📐 Layout avanzado',
                    'animations': '✨ Animaciones',
                    'external_resources': '🌐 Recursos externos',
                    'print_styles': '🖨️ Estilos de impresión'
                }
                print(f"   ✅ {feature_names.get(feature, feature)}")
        else:
            print("   📝 HTML simple sin características avanzadas")
        
        print()
        print("💡 INTERPRETACIÓN:")
        score = result['complexity_score']
        if score <= 30:
            print("   Este HTML es simple y puede convertirse eficientemente con FPDF.")
        elif score <= 70:
            print("   Este HTML tiene complejidad moderada. WeasyPrint es ideal.")
        elif score <= 120:
            print("   Este HTML es complejo. Se recomienda wkhtmltopdf o Playwright.")
        else:
            print("   Este HTML es muy complejo. Solo Playwright garantiza fidelidad completa.")
            
    except Exception as e:
        print(f"❌ Error en el análisis: {str(e)}")

def test_simple_html():
    """Prueba con HTML simple para comparar"""
    simple_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test Simple</title>
    </head>
    <body>
        <h1>Título Simple</h1>
        <p>Este es un párrafo simple.</p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
        </ul>
    </body>
    </html>
    """
    
    # Crear archivo temporal
    temp_file = "temp_simple.html"
    with open(temp_file, 'w', encoding='utf-8') as f:
        f.write(simple_html)
    
    try:
        print("\n" + "="*60)
        print("=== COMPARACIÓN: HTML SIMPLE ===")
        print(f"📄 Archivo: {temp_file}")
        print()
        
        result = analyze_html_complexity(temp_file)
        
        print("📊 RESULTADOS DEL ANÁLISIS:")
        print(f"   Complejidad: {result['complexity_level']} (Score: {result['complexity_score']}/200)")
        print(f"   Método recomendado: {result['recommended_method'].upper()}")
        print(f"   Razón: {result['reasoning']}")
        print(f"   Tiempo estimado: {result['estimated_time']}")
        
    finally:
        # Limpiar archivo temporal
        if os.path.exists(temp_file):
            os.remove(temp_file)

if __name__ == "__main__":
    test_html_analysis()
    test_simple_html()
