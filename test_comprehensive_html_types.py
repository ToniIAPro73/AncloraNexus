#!/usr/bin/env python3
"""
Test comprehensivo del sistema inteligente con diferentes tipos de HTML
"""

import sys
import os
import time
from pathlib import Path

# Agregar el directorio backend al path
backend_path = Path(__file__).parent / "backend" / "src"
sys.path.insert(0, str(backend_path))

from models.conversions.html_to_pdf import convert
from models.conversions.html_complexity_analyzer import analyze_html_complexity

def create_test_htmls():
    """Crea diferentes tipos de HTML para probar"""
    
    test_cases = {
        "simple_text": {
            "filename": "test_simple_text.html",
            "expected_method": "fpdf",
            "content": """
<!DOCTYPE html>
<html>
<head>
    <title>Documento Simple</title>
</head>
<body>
    <h1>Título Principal</h1>
    <p>Este es un documento HTML muy simple con solo texto básico.</p>
    <p>No tiene CSS complejo, ni imágenes, ni JavaScript.</p>
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
    </ul>
</body>
</html>
            """
        },
        
        "basic_css": {
            "filename": "test_basic_css.html",
            "expected_method": "weasyprint",
            "content": """
<!DOCTYPE html>
<html>
<head>
    <title>Documento con CSS Básico</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6;
            color: #333;
        }
        h1 { 
            color: #2c3e50; 
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .highlight { 
            background-color: #f39c12; 
            padding: 5px;
            border-radius: 3px;
        }
        .box {
            border: 1px solid #bdc3c7;
            padding: 15px;
            margin: 10px 0;
            background-color: #ecf0f1;
        }
    </style>
</head>
<body>
    <h1>Documento con CSS Básico</h1>
    <p>Este documento tiene <span class="highlight">CSS básico</span> con colores y estilos simples.</p>
    <div class="box">
        <h2>Caja con Estilo</h2>
        <p>Contenido dentro de una caja estilizada.</p>
    </div>
</body>
</html>
            """
        },
        
        "complex_layout": {
            "filename": "test_complex_layout.html",
            "expected_method": "wkhtmltopdf",
            "content": """
<!DOCTYPE html>
<html>
<head>
    <title>Layout Complejo</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: 'Roboto', sans-serif; 
            margin: 0; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            display: grid;
            grid-template-columns: 1fr 2fr 1fr;
            gap: 20px;
            padding: 20px;
            min-height: 100vh;
        }
        .card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transform: translateY(0);
            transition: transform 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
        }
        h1 {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h2>Sidebar</h2>
            <p>Contenido lateral con CSS Grid.</p>
        </div>
        <div class="card">
            <h1>Contenido Principal</h1>
            <p>Este documento usa CSS Grid, gradientes, fuentes de Google y efectos hover.</p>
        </div>
        <div class="card">
            <h2>Otro Sidebar</h2>
            <p>Más contenido lateral.</p>
        </div>
    </div>
</body>
</html>
            """
        },
        
        "very_complex": {
            "filename": "test_very_complex.html",
            "expected_method": "playwright",
            "content": """
<!DOCTYPE html>
<html>
<head>
    <title>HTML Muy Complejo</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        body { 
            font-family: 'Inter', sans-serif; 
            margin: 0; 
            background: 
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%),
                linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            animation: fadeIn 1s ease-out;
        }
        
        .hero {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.5;
        }
        
        .title {
            font-family: 'Playfair Display', serif;
            font-size: 4rem;
            font-weight: 700;
            background: linear-gradient(
                45deg,
                #ff6b6b,
                #4ecdc4,
                #45b7d1,
                #96ceb4,
                #ffeaa7
            );
            background-size: 300% 300%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: pulse 2s infinite;
            text-shadow: 0 0 30px rgba(255,255,255,0.5);
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        }
        
        .card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 20px;
            padding: 2rem;
            margin: 2rem;
            box-shadow: 
                0 8px 32px rgba(0,0,0,0.1),
                inset 0 1px 0 rgba(255,255,255,0.2);
        }
        
        @media print {
            body { background: white; }
            .hero { height: auto; }
        }
    </style>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Documento muy complejo cargado');
        });
    </script>
</head>
<body>
    <div class="hero">
        <div class="card">
            <h1 class="title">HTML Muy Complejo</h1>
            <p>Este documento incluye:</p>
            <ul>
                <li>Múltiples fuentes de Google</li>
                <li>Gradientes complejos y múltiples</li>
                <li>Animaciones CSS</li>
                <li>Backdrop filters</li>
                <li>SVG inline en CSS</li>
                <li>JavaScript</li>
                <li>Media queries para impresión</li>
                <li>Efectos de sombra avanzados</li>
            </ul>
        </div>
    </div>
</body>
</html>
            """
        }
    }
    
    return test_cases

def run_comprehensive_tests():
    """Ejecuta pruebas comprehensivas con diferentes tipos de HTML"""
    
    print("=== PRUEBAS COMPREHENSIVAS DEL SISTEMA INTELIGENTE ===")
    print()
    
    test_cases = create_test_htmls()
    results = []
    
    for test_name, test_data in test_cases.items():
        print(f"🧪 PRUEBA: {test_name.upper().replace('_', ' ')}")
        print(f"📄 Archivo: {test_data['filename']}")
        print(f"🎯 Método esperado: {test_data['expected_method'].upper()}")
        
        # Crear archivo HTML
        with open(test_data['filename'], 'w', encoding='utf-8') as f:
            f.write(test_data['content'])
        
        try:
            # Analizar complejidad
            analysis = analyze_html_complexity(test_data['filename'])
            print(f"📊 Complejidad detectada: {analysis['complexity_level']} (Score: {analysis['complexity_score']})")
            print(f"🔧 Método recomendado: {analysis['recommended_method'].upper()}")
            
            # Verificar si la recomendación es correcta
            method_match = analysis['recommended_method'] == test_data['expected_method']
            print(f"✅ Recomendación: {'CORRECTA' if method_match else 'DIFERENTE'}")
            
            # Realizar conversión
            output_pdf = f"{test_name}_result.pdf"
            start_time = time.time()
            
            success, message = convert(test_data['filename'], output_pdf)
            
            end_time = time.time()
            duration = end_time - start_time
            
            if success:
                file_size = os.path.getsize(output_pdf) if os.path.exists(output_pdf) else 0
                print(f"✅ Conversión exitosa en {duration:.2f}s")
                print(f"📦 Tamaño: {file_size:,} bytes")
                print(f"💬 Mensaje: {message}")
                
                results.append({
                    'test_name': test_name,
                    'expected_method': test_data['expected_method'],
                    'recommended_method': analysis['recommended_method'],
                    'complexity_score': analysis['complexity_score'],
                    'complexity_level': analysis['complexity_level'],
                    'method_match': method_match,
                    'conversion_success': True,
                    'duration': duration,
                    'file_size': file_size,
                    'message': message
                })
            else:
                print(f"❌ Conversión falló: {message}")
                results.append({
                    'test_name': test_name,
                    'expected_method': test_data['expected_method'],
                    'recommended_method': analysis['recommended_method'],
                    'complexity_score': analysis['complexity_score'],
                    'complexity_level': analysis['complexity_level'],
                    'method_match': method_match,
                    'conversion_success': False,
                    'duration': duration,
                    'file_size': 0,
                    'message': message
                })
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            results.append({
                'test_name': test_name,
                'error': str(e)
            })
        
        print("-" * 60)
        print()
    
    # Generar resumen
    generate_test_summary(results)
    
    # Limpiar archivos temporales
    cleanup_test_files(test_cases, results)

def generate_test_summary(results):
    """Genera un resumen de los resultados de las pruebas"""
    
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)
    
    successful_conversions = sum(1 for r in results if r.get('conversion_success', False))
    correct_recommendations = sum(1 for r in results if r.get('method_match', False))
    total_tests = len(results)
    
    print(f"✅ Conversiones exitosas: {successful_conversions}/{total_tests}")
    print(f"🎯 Recomendaciones correctas: {correct_recommendations}/{total_tests}")
    print(f"📈 Tasa de éxito: {(successful_conversions/total_tests)*100:.1f}%")
    print(f"🎯 Precisión de recomendaciones: {(correct_recommendations/total_tests)*100:.1f}%")
    print()
    
    print("📋 DETALLE POR PRUEBA:")
    print("| Prueba | Complejidad | Método Esperado | Método Usado | Tiempo | Tamaño |")
    print("|--------|-------------|-----------------|--------------|--------|--------|")
    
    for result in results:
        if 'error' not in result:
            test_name = result['test_name'].replace('_', ' ').title()
            complexity = result['complexity_level']
            expected = result['expected_method'].upper()
            recommended = result['recommended_method'].upper()
            duration = f"{result['duration']:.2f}s"
            size = f"{result['file_size']//1024}KB" if result['file_size'] > 0 else "0KB"
            
            print(f"| {test_name:<10} | {complexity:<11} | {expected:<15} | {recommended:<12} | {duration:<6} | {size:<6} |")

def cleanup_test_files(test_cases, results):
    """Limpia los archivos temporales generados durante las pruebas"""
    
    print("\n🧹 Limpiando archivos temporales...")
    
    # Limpiar archivos HTML de prueba
    for test_data in test_cases.values():
        if os.path.exists(test_data['filename']):
            os.remove(test_data['filename'])
    
    # Limpiar archivos PDF generados
    for result in results:
        if 'test_name' in result:
            pdf_file = f"{result['test_name']}_result.pdf"
            if os.path.exists(pdf_file):
                os.remove(pdf_file)
    
    print("✅ Archivos temporales eliminados")

if __name__ == "__main__":
    run_comprehensive_tests()
