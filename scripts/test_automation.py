import json
import time
import os
from datetime import datetime

# Cargar configuración de archivos de prueba
with open('/home/ubuntu/test_results.json', 'r') as f:
    test_config = json.load(f)

# Configuración de pruebas
test_conversions = [
    {"from": "txt", "to": "pdf", "expected_cost": 1},
    {"from": "txt", "to": "html", "expected_cost": 1},
    {"from": "md", "to": "pdf", "expected_cost": 2},
    {"from": "md", "to": "html", "expected_cost": 1},
    {"from": "csv", "to": "json", "expected_cost": 2},
    {"from": "json", "to": "csv", "expected_cost": 2},
    {"from": "xml", "to": "json", "expected_cost": 2},
    {"from": "html", "to": "pdf", "expected_cost": 3},
    {"from": "png", "to": "jpg", "expected_cost": 1},
    {"from": "png", "to": "pdf", "expected_cost": 2}
]

# Resultados de pruebas
test_results = {
    "session_start": datetime.now().isoformat(),
    "total_tests": 0,
    "successful_tests": 0,
    "failed_tests": 0,
    "error_tests": 0,
    "test_details": []
}

def log_test_result(file_name, conversion, status, error_msg=None, duration=None):
    """Registrar resultado de una prueba"""
    result = {
        "file": file_name,
        "conversion": f"{conversion['from']} → {conversion['to']}",
        "expected_cost": conversion['expected_cost'],
        "status": status,
        "timestamp": datetime.now().isoformat(),
        "duration_seconds": duration,
        "error_message": error_msg
    }
    
    test_results["test_details"].append(result)
    test_results["total_tests"] += 1
    
    if status == "success":
        test_results["successful_tests"] += 1
    elif status == "failed":
        test_results["failed_tests"] += 1
    else:
        test_results["error_tests"] += 1
    
    print(f"[{status.upper()}] {file_name} ({conversion['from']} → {conversion['to']})")
    if error_msg:
        print(f"  Error: {error_msg}")

def simulate_conversion_test(file_info, conversion):
    """Simular una prueba de conversión"""
    start_time = time.time()
    
    try:
        # Verificar que el archivo existe
        if not os.path.exists(file_info['path']):
            log_test_result(file_info['name'], conversion, "error", "Archivo no encontrado")
            return
        
        # Verificar tamaño del archivo
        file_size = os.path.getsize(file_info['path'])
        if file_size > 100 * 1024 * 1024:  # 100MB
            log_test_result(file_info['name'], conversion, "failed", "Archivo demasiado grande")
            return
        
        # Simular tiempo de conversión basado en tamaño
        conversion_time = min(0.5 + (file_size / 1024 / 1024) * 0.1, 5.0)
        time.sleep(conversion_time)
        
        # Verificar si es un archivo problemático
        if file_info['category'] == 'corrupted':
            if 'malformed' in file_info['name']:
                log_test_result(file_info['name'], conversion, "failed", "Archivo malformado")
                return
            elif 'binary' in file_info['name']:
                log_test_result(file_info['name'], conversion, "failed", "Datos binarios en archivo de texto")
                return
        
        # Verificar si es un archivo vacío
        if file_size == 0 or file_size <= 2:
            log_test_result(file_info['name'], conversion, "failed", "Archivo vacío")
            return
        
        # Verificar compatibilidad de conversión
        file_ext = file_info['name'].split('.')[-1].lower()
        if file_ext != conversion['from']:
            log_test_result(file_info['name'], conversion, "error", f"Extensión {file_ext} no coincide con {conversion['from']}")
            return
        
        # Conversiones que deberían fallar
        problematic_conversions = [
            ("txt", "jpg"),  # Texto a imagen
            ("png", "csv"),  # Imagen a datos
            ("html", "png")  # Web a imagen (sin renderizado)
        ]
        
        if (conversion['from'], conversion['to']) in problematic_conversions:
            log_test_result(file_info['name'], conversion, "failed", "Conversión no compatible")
            return
        
        # Simular éxito
        duration = time.time() - start_time
        log_test_result(file_info['name'], conversion, "success", duration=duration)
        
    except Exception as e:
        duration = time.time() - start_time
        log_test_result(file_info['name'], conversion, "error", str(e), duration)

def run_comprehensive_tests():
    """Ejecutar batería completa de pruebas"""
    print("🚀 Iniciando batería de pruebas de conversión...")
    print(f"📁 Archivos de prueba: {len(test_config['test_files'])}")
    print(f"🔄 Conversiones a probar: {len(test_conversions)}")
    print("-" * 60)
    
    for file_info in test_config['test_files']:
        print(f"\n📄 Probando archivo: {file_info['name']} ({file_info['size']})")
        
        # Determinar qué conversiones probar para este archivo
        file_ext = file_info['name'].split('.')[-1].lower()
        
        applicable_conversions = [
            conv for conv in test_conversions 
            if conv['from'] == file_ext
        ]
        
        if not applicable_conversions:
            print(f"  ⚠️  No hay conversiones aplicables para .{file_ext}")
            continue
        
        for conversion in applicable_conversions:
            simulate_conversion_test(file_info, conversion)
    
    # Guardar resultados
    with open('/home/ubuntu/test_results_detailed.json', 'w') as f:
        json.dump(test_results, f, indent=2)
    
    # Mostrar resumen
    print("\n" + "="*60)
    print("📊 RESUMEN DE PRUEBAS")
    print("="*60)
    print(f"Total de pruebas: {test_results['total_tests']}")
    print(f"Exitosas: {test_results['successful_tests']}")
    print(f"Fallidas: {test_results['failed_tests']}")
    print(f"Errores: {test_results['error_tests']}")
    
    if test_results['total_tests'] > 0:
        success_rate = (test_results['successful_tests'] / test_results['total_tests']) * 100
        print(f"Tasa de éxito: {success_rate:.1f}%")
    
    print(f"\n📄 Resultados detallados guardados en: test_results_detailed.json")

if __name__ == "__main__":
    run_comprehensive_tests()
