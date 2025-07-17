import json
import matplotlib.pyplot as plt
import pandas as pd
from collections import defaultdict, Counter
import numpy as np

# Cargar resultados
with open('/home/ubuntu/test_results_detailed.json', 'r') as f:
    results = json.load(f)

# Análisis de datos
def analyze_test_results():
    """Analizar resultados de pruebas y generar estadísticas"""
    
    # Estadísticas básicas
    total_tests = results['total_tests']
    successful = results['successful_tests']
    failed = results['failed_tests']
    errors = results['error_tests']
    
    success_rate = (successful / total_tests) * 100 if total_tests > 0 else 0
    
    print("📊 ANÁLISIS DETALLADO DE RESULTADOS")
    print("=" * 50)
    print(f"Total de pruebas ejecutadas: {total_tests}")
    print(f"Pruebas exitosas: {successful} ({success_rate:.1f}%)")
    print(f"Pruebas fallidas: {failed} ({(failed/total_tests)*100:.1f}%)")
    print(f"Errores del sistema: {errors} ({(errors/total_tests)*100:.1f}%)")
    
    # Análisis por tipo de conversión
    conversion_stats = defaultdict(lambda: {'success': 0, 'failed': 0, 'total': 0})
    
    for test in results['test_details']:
        conv_type = test['conversion']
        status = test['status']
        
        conversion_stats[conv_type]['total'] += 1
        if status == 'success':
            conversion_stats[conv_type]['success'] += 1
        else:
            conversion_stats[conv_type]['failed'] += 1
    
    print("\n🔄 ANÁLISIS POR TIPO DE CONVERSIÓN")
    print("-" * 50)
    for conv_type, stats in sorted(conversion_stats.items()):
        success_rate = (stats['success'] / stats['total']) * 100
        print(f"{conv_type}: {stats['success']}/{stats['total']} ({success_rate:.1f}%)")
    
    # Análisis por categoría de archivo
    category_stats = defaultdict(lambda: {'success': 0, 'failed': 0, 'total': 0})
    
    # Mapear archivos a categorías
    file_categories = {
        'simple.txt': 'basic',
        'unicode.txt': 'complex',
        'large.txt': 'size_test',
        'special_chars.txt': 'problematic',
        'empty.txt': 'edge_case',
        'markdown.md': 'structured',
        'csv.csv': 'structured',
        'json.json': 'structured',
        'xml.xml': 'structured',
        'html.html': 'complex',
        'simple_logo.png': 'basic',
        'complex_diagram.png': 'complex',
        'photo_realistic.png': 'realistic',
        'binary_data.txt': 'corrupted',
        'malformed.json': 'corrupted',
        'malformed.xml': 'corrupted',
        'large_file.txt': 'size_limit'
    }
    
    for test in results['test_details']:
        file_name = test['file']
        category = file_categories.get(file_name, 'unknown')
        status = test['status']
        
        category_stats[category]['total'] += 1
        if status == 'success':
            category_stats[category]['success'] += 1
        else:
            category_stats[category]['failed'] += 1
    
    print("\n📁 ANÁLISIS POR CATEGORÍA DE ARCHIVO")
    print("-" * 50)
    for category, stats in sorted(category_stats.items()):
        success_rate = (stats['success'] / stats['total']) * 100
        print(f"{category.capitalize()}: {stats['success']}/{stats['total']} ({success_rate:.1f}%)")
    
    # Análisis de tiempos de conversión
    successful_tests = [t for t in results['test_details'] if t['status'] == 'success' and t['duration_seconds']]
    
    if successful_tests:
        durations = [t['duration_seconds'] for t in successful_tests]
        avg_duration = np.mean(durations)
        min_duration = np.min(durations)
        max_duration = np.max(durations)
        
        print("\n⏱️ ANÁLISIS DE TIEMPOS DE CONVERSIÓN")
        print("-" * 50)
        print(f"Tiempo promedio: {avg_duration:.2f} segundos")
        print(f"Tiempo mínimo: {min_duration:.2f} segundos")
        print(f"Tiempo máximo: {max_duration:.2f} segundos")
    
    # Análisis de errores
    error_types = Counter()
    for test in results['test_details']:
        if test['status'] != 'success' and test['error_message']:
            error_types[test['error_message']] += 1
    
    print("\n❌ ANÁLISIS DE ERRORES")
    print("-" * 50)
    for error, count in error_types.most_common():
        print(f"{error}: {count} casos")
    
    # Recomendaciones
    print("\n💡 RECOMENDACIONES")
    print("-" * 50)
    
    if success_rate >= 80:
        print("✅ Excelente tasa de éxito general")
    elif success_rate >= 70:
        print("⚠️ Tasa de éxito aceptable, pero mejorable")
    else:
        print("❌ Tasa de éxito baja, requiere atención")
    
    # Recomendaciones específicas
    if category_stats['corrupted']['failed'] > 0:
        print("• Implementar mejor validación de archivos corruptos")
    
    if category_stats['edge_case']['failed'] > 0:
        print("• Mejorar manejo de casos extremos (archivos vacíos)")
    
    if any('malformed' in error for error in error_types.keys()):
        print("• Añadir validación de formato antes de conversión")
    
    if max_duration > 2.0:
        print("• Optimizar conversiones de archivos grandes")
    
    return {
        'success_rate': success_rate,
        'conversion_stats': dict(conversion_stats),
        'category_stats': dict(category_stats),
        'error_types': dict(error_types),
        'avg_duration': avg_duration if successful_tests else 0
    }

if __name__ == "__main__":
    stats = analyze_test_results()
