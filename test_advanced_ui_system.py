#!/usr/bin/env python3
"""
Script de prueba para el sistema avanzado de UI con selector de formato
y análisis de secuencias de conversión optimizadas
"""
import requests
import json
import tempfile
import os
from pathlib import Path

# Configuración
API_BASE = "http://localhost:8000/api"
TEMP_DIR = Path(tempfile.gettempdir())

def test_server_health():
    """Verifica que el servidor esté funcionando"""
    try:
        response = requests.get(f"{API_BASE}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def test_supported_formats():
    """Prueba el endpoint de formatos soportados"""
    print("🔍 PROBANDO FORMATOS SOPORTADOS...")
    
    try:
        response = requests.get(f"{API_BASE}/conversion/supported-formats")
        
        if response.status_code == 200:
            data = response.json()
            input_formats = data.get('input', [])
            output_formats = data.get('output', [])
            
            print(f"   ✅ Formatos de entrada: {len(input_formats)}")
            print(f"   ✅ Formatos de salida: {len(output_formats)}")
            
            # Verificar nuevos formatos
            new_formats = ['csv', 'json', 'epub', 'rtf', 'odt', 'webp', 'tiff']
            loaded_new = [f for f in new_formats if f in input_formats]
            
            print(f"   ✅ Nuevos formatos cargados: {loaded_new}")
            return True
        else:
            print(f"   ❌ Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_conversion_analysis(source_format, target_format):
    """Prueba el análisis de opciones de conversión"""
    print(f"🧪 ANALIZANDO CONVERSIÓN {source_format.upper()} → {target_format.upper()}...")
    
    try:
        response = requests.post(f"{API_BASE}/conversion/analyze-conversion", 
                               json={
                                   'source_format': source_format,
                                   'target_format': target_format
                               })
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                analysis = data.get('analysis', {})
                direct = analysis.get('direct', {})
                optimized = analysis.get('optimized')
                recommendation = analysis.get('recommendation', {})
                
                print(f"   📊 OPCIÓN DIRECTA:")
                print(f"      Costo: {direct.get('cost', 0)} créditos")
                print(f"      Calidad: {direct.get('quality', 0)}%")
                print(f"      Tiempo: {direct.get('time_estimate', 'N/A')}")
                
                if optimized:
                    print(f"   🚀 OPCIÓN OPTIMIZADA:")
                    print(f"      Secuencia: {' → '.join(optimized.get('steps', []))}")
                    print(f"      Costo: {optimized.get('cost', 0)} créditos")
                    print(f"      Calidad: {optimized.get('quality', 0)}%")
                    print(f"      Mejora: +{optimized.get('quality_improvement', 0)}%")
                    print(f"      Tiempo: {optimized.get('time_estimate', 'N/A')}")
                else:
                    print(f"   ℹ️  No hay secuencia optimizada disponible")
                
                print(f"   💡 RECOMENDACIÓN: {recommendation.get('type', 'N/A').upper()}")
                print(f"      Razón: {recommendation.get('reason', 'N/A')}")
                print(f"      Confianza: {recommendation.get('confidence', 'N/A')}")
                
                return True
            else:
                print(f"   ❌ Error en análisis: {data.get('error', 'Desconocido')}")
                return False
        else:
            print(f"   ❌ Error HTTP: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_conversion_with_sequence():
    """Prueba conversión con secuencia optimizada"""
    print("🔄 PROBANDO CONVERSIÓN CON SECUENCIA OPTIMIZADA...")
    
    # Crear archivo CSV de prueba
    csv_content = """nombre,edad,ciudad
Juan,25,Madrid
María,30,Barcelona
Pedro,35,Valencia"""
    
    csv_file = TEMP_DIR / "test_data.csv"
    with open(csv_file, 'w', encoding='utf-8') as f:
        f.write(csv_content)
    
    try:
        # Primero analizar la conversión
        analysis_response = requests.post(f"{API_BASE}/conversion/analyze-conversion", 
                                        json={
                                            'source_format': 'csv',
                                            'target_format': 'pdf'
                                        })
        
        if analysis_response.status_code != 200:
            print("   ❌ Error en análisis previo")
            return False
        
        analysis_data = analysis_response.json()
        
        # Realizar conversión
        with open(csv_file, 'rb') as f:
            files = {'file': ('test_data.csv', f, 'text/csv')}
            data = {
                'target_format': 'pdf',
                'conversion_type': 'optimized',  # Usar secuencia optimizada
                'conversion_sequence': json.dumps(['csv', 'html', 'pdf'])
            }
            
            response = requests.post(f"{API_BASE}/conversion/guest-convert", 
                                   files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                download_id = result.get('download_id')
                print(f"   ✅ Conversión exitosa")
                print(f"   📥 ID de descarga: {download_id}")
                
                # Probar descarga
                download_response = requests.get(f"{API_BASE}/conversion/guest-download/{download_id}")
                
                if download_response.status_code == 200:
                    output_file = TEMP_DIR / "converted_optimized.pdf"
                    with open(output_file, 'wb') as f:
                        f.write(download_response.content)
                    
                    print(f"   ✅ Descarga exitosa: {output_file}")
                    print(f"   📊 Tamaño: {len(download_response.content)} bytes")
                    return True
                else:
                    print(f"   ❌ Error en descarga: {download_response.status_code}")
                    return False
            else:
                print(f"   ❌ Error en conversión: {result.get('message', 'Desconocido')}")
                return False
        else:
            print(f"   ❌ Error HTTP: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    finally:
        # Limpiar archivo temporal
        if csv_file.exists():
            csv_file.unlink()

def main():
    """Función principal de pruebas"""
    print("🚀 INICIANDO PRUEBAS DEL SISTEMA AVANZADO DE UI")
    print("=" * 60)
    
    # Verificar servidor
    if not test_server_health():
        print("❌ Servidor backend no disponible")
        return
    
    print("✅ Servidor backend funcionando\n")
    
    # Pruebas
    tests = [
        ("Formatos Soportados", test_supported_formats),
        ("Análisis CSV→PDF", lambda: test_conversion_analysis('csv', 'pdf')),
        ("Análisis MD→PDF", lambda: test_conversion_analysis('md', 'pdf')),
        ("Análisis JSON→HTML", lambda: test_conversion_analysis('json', 'html')),
        ("Análisis TXT→DOCX", lambda: test_conversion_analysis('txt', 'docx')),
        ("Conversión con Secuencia", test_conversion_with_sequence),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 PRUEBA: {test_name}")
        print("-" * 40)
        
        try:
            result = test_func()
            results.append((test_name, result))
            
            if result:
                print(f"✅ {test_name}: EXITOSA")
            else:
                print(f"❌ {test_name}: FALLIDA")
                
        except Exception as e:
            print(f"❌ {test_name}: ERROR - {e}")
            results.append((test_name, False))
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ EXITOSA" if result else "❌ FALLIDA"
        print(f"   {test_name}: {status}")
    
    print(f"\n🎯 RESULTADO FINAL: {passed}/{total} pruebas exitosas")
    
    if passed == total:
        print("🎉 ¡TODAS LAS PRUEBAS EXITOSAS!")
        print("🚀 Sistema avanzado de UI completamente funcional")
    else:
        print("⚠️  Algunas pruebas fallaron - revisar logs")

if __name__ == "__main__":
    main()
