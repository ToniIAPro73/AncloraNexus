#!/usr/bin/env python3
"""
Test completo del sistema inteligente de conversión HTML a PDF con monitoreo
"""

import sys
import os
import time
from datetime import datetime
from pathlib import Path

# Agregar el directorio backend al path
backend_path = Path(__file__).parent / "backend" / "src"
sys.path.insert(0, str(backend_path))

from models.conversions.html_to_pdf import convert
from models.conversions.html_complexity_analyzer import analyze_html_complexity
from services.conversion_performance_monitor import ConversionPerformanceMonitor, ConversionMetrics

def test_complete_system():
    """Test completo del sistema inteligente con monitoreo"""
    
    print("=== TEST COMPLETO DEL SISTEMA INTELIGENTE ===")
    print("🚀 Iniciando prueba integral con monitoreo de rendimiento")
    print()
    
    # Inicializar monitor de rendimiento
    monitor = ConversionPerformanceMonitor("test_metrics.json")
    
    # Casos de prueba
    test_files = [
        {
            "name": "Anclora Design Guide (Muy Complejo)",
            "path": "docs/design/Anclora Brand & Design System Guide (A4).html",
            "expected_complexity": "MUY_COMPLEJA"
        }
    ]
    
    # Crear casos adicionales para demostrar el sistema
    additional_cases = create_demo_cases()
    test_files.extend(additional_cases)
    
    results = []
    
    for i, test_case in enumerate(test_files, 1):
        print(f"📋 PRUEBA {i}/{len(test_files)}: {test_case['name']}")
        print(f"📄 Archivo: {test_case['path']}")
        
        if not os.path.exists(test_case['path']):
            print(f"⚠️ Archivo no encontrado, saltando...")
            continue
        
        try:
            # 1. Análisis de complejidad
            print("🔍 Analizando complejidad HTML...")
            analysis_start = time.time()
            analysis = analyze_html_complexity(test_case['path'])
            analysis_time = time.time() - analysis_start
            
            print(f"   Complejidad: {analysis['complexity_level']} (Score: {analysis['complexity_score']})")
            print(f"   Método recomendado: {analysis['recommended_method'].upper()}")
            print(f"   Tiempo de análisis: {analysis_time:.3f}s")
            
            # 2. Conversión inteligente
            output_file = f"test_result_{i}.pdf"
            print(f"⚙️ Convirtiendo con método inteligente...")
            
            conversion_start = time.time()
            success, message = convert(test_case['path'], output_file)
            conversion_end = time.time()
            conversion_duration = conversion_end - conversion_start
            
            # 3. Recopilar métricas
            input_size = os.path.getsize(test_case['path'])
            output_size = os.path.getsize(output_file) if os.path.exists(output_file) else 0
            
            # Extraer método usado del mensaje
            actual_method = extract_method_from_message(message)
            
            # 4. Registrar métricas
            metrics = ConversionMetrics(
                timestamp=datetime.now().isoformat(),
                input_file=test_case['path'],
                output_file=output_file,
                html_complexity_score=analysis['complexity_score'],
                html_complexity_level=analysis['complexity_level'],
                recommended_method=analysis['recommended_method'],
                actual_method_used=actual_method,
                conversion_duration=conversion_duration,
                input_file_size=input_size,
                output_file_size=output_size,
                success=success,
                error_message=None if success else message
            )
            
            monitor.record_conversion(metrics)
            
            # 5. Mostrar resultados
            if success:
                print(f"✅ Conversión exitosa!")
                print(f"   Tiempo: {conversion_duration:.2f}s")
                print(f"   Tamaño entrada: {input_size:,} bytes")
                print(f"   Tamaño salida: {output_size:,} bytes")
                print(f"   Ratio compresión: {(output_size/input_size):.1f}x")
                print(f"   Método usado: {actual_method.upper()}")
                print(f"   Mensaje: {message}")
                
                # Evaluar eficiencia
                efficiency_score = evaluate_efficiency(analysis, conversion_duration, output_size)
                print(f"   Eficiencia: {efficiency_score}/10")
                
            else:
                print(f"❌ Conversión falló: {message}")
            
            results.append({
                'test_case': test_case,
                'analysis': analysis,
                'success': success,
                'duration': conversion_duration,
                'output_size': output_size,
                'efficiency': efficiency_score if success else 0
            })
            
        except Exception as e:
            print(f"❌ Error inesperado: {str(e)}")
            
        print("-" * 60)
        print()
    
    # Generar reporte de rendimiento
    print("📊 GENERANDO REPORTE DE RENDIMIENTO...")
    performance_report = monitor.get_performance_report(days=1)
    display_performance_report(performance_report)
    
    # Generar recomendaciones de mejora
    print("\n🎯 ANALIZANDO RECOMENDACIONES DE MEJORA...")
    recommendations = monitor.get_method_recommendations()
    display_recommendations(recommendations)
    
    # Limpiar archivos de prueba
    cleanup_test_files(results)
    
    print("\n🎉 PRUEBA COMPLETA FINALIZADA")
    return results

def create_demo_cases():
    """Crea casos de demostración adicionales"""
    
    cases = []
    
    # Caso simple
    simple_html = """<!DOCTYPE html>
<html><head><title>Simple</title></head>
<body><h1>Documento Simple</h1><p>Solo texto básico.</p></body></html>"""
    
    with open("demo_simple.html", "w", encoding="utf-8") as f:
        f.write(simple_html)
    
    cases.append({
        "name": "Demo Simple",
        "path": "demo_simple.html",
        "expected_complexity": "SIMPLE"
    })
    
    # Caso moderado
    moderate_html = """<!DOCTYPE html>
<html><head><title>Moderado</title>
<style>body{font-family:Arial;color:#333;} .box{border:1px solid #ccc;padding:10px;background:#f9f9f9;}</style>
</head><body><h1>Documento Moderado</h1><div class="box"><p>Con CSS básico.</p></div></body></html>"""
    
    with open("demo_moderate.html", "w", encoding="utf-8") as f:
        f.write(moderate_html)
    
    cases.append({
        "name": "Demo Moderado",
        "path": "demo_moderate.html",
        "expected_complexity": "MODERADA"
    })
    
    return cases

def extract_method_from_message(message: str) -> str:
    """Extrae el método usado del mensaje de conversión"""
    message_lower = message.lower()
    
    if "playwright" in message_lower:
        return "playwright"
    elif "wkhtmltopdf" in message_lower:
        return "wkhtmltopdf"
    elif "weasyprint" in message_lower:
        return "weasyprint"
    elif "pandoc" in message_lower:
        return "pandoc"
    elif "fpdf" in message_lower:
        return "fpdf"
    else:
        return "unknown"

def evaluate_efficiency(analysis: dict, duration: float, output_size: int) -> int:
    """Evalúa la eficiencia de la conversión (1-10)"""
    
    complexity_score = analysis['complexity_score']
    expected_time = {
        'SIMPLE': 1.0,
        'MODERADA': 3.0,
        'COMPLEJA': 6.0,
        'MUY_COMPLEJA': 10.0
    }.get(analysis['complexity_level'], 5.0)
    
    # Evaluar tiempo (50% del score)
    time_efficiency = min(10, (expected_time / max(duration, 0.1)) * 5)
    
    # Evaluar calidad basada en tamaño (50% del score)
    expected_size = complexity_score * 1000  # Estimación básica
    size_quality = min(10, (output_size / max(expected_size, 1000)) * 5)
    
    return round((time_efficiency + size_quality) / 2)

def display_performance_report(report: dict):
    """Muestra el reporte de rendimiento de forma legible"""
    
    if "error" in report:
        print(f"⚠️ {report['error']}")
        return
    
    summary = report['summary']
    print(f"📈 RESUMEN DE RENDIMIENTO:")
    print(f"   Total conversiones: {summary['total_conversions']}")
    print(f"   Tasa de éxito: {summary['success_rate']}%")
    print(f"   Tiempo promedio: {summary['avg_duration']}s")
    print(f"   Tamaño promedio salida: {summary['avg_output_size']:,} bytes")
    
    if 'method_performance' in report:
        print(f"\n🔧 RENDIMIENTO POR MÉTODO:")
        for method, stats in report['method_performance'].items():
            print(f"   {method.upper()}:")
            print(f"     - Usos: {stats['count']}")
            print(f"     - Éxito: {stats['success_rate']}%")
            print(f"     - Tiempo promedio: {stats['avg_duration']}s")
            print(f"     - Complejidad promedio: {stats['avg_complexity']}")

def display_recommendations(recommendations: dict):
    """Muestra las recomendaciones de mejora"""
    
    if "error" in recommendations:
        print(f"⚠️ {recommendations['error']}")
        return
    
    print("💡 RECOMENDACIONES BASADAS EN DATOS HISTÓRICOS:")
    for level, rec in recommendations.items():
        print(f"   {level}:")
        print(f"     - Método recomendado: {rec['recommended_method'].upper()}")
        print(f"     - Basado en {rec['sample_size']} conversiones")

def cleanup_test_files(results: list):
    """Limpia archivos temporales"""
    
    print("🧹 Limpiando archivos temporales...")
    
    # Archivos demo
    demo_files = ["demo_simple.html", "demo_moderate.html"]
    for file in demo_files:
        if os.path.exists(file):
            os.remove(file)
    
    # PDFs generados
    for i in range(1, len(results) + 1):
        pdf_file = f"test_result_{i}.pdf"
        if os.path.exists(pdf_file):
            os.remove(pdf_file)
    
    # Archivo de métricas de prueba
    if os.path.exists("test_metrics.json"):
        os.remove("test_metrics.json")
    
    print("✅ Limpieza completada")

if __name__ == "__main__":
    test_complete_system()
