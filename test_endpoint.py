#!/usr/bin/env python3
"""
Script para probar el endpoint analyze-conversion
"""

import requests
import json

def test_analyze_conversion():
    """Prueba el endpoint de análisis de conversión"""
    
    url = "http://localhost:8000/api/conversion/analyze-conversion"
    
    # Datos de prueba
    test_data = {
        "source_format": "jpg",
        "target_format": "png"
    }
    
    print("🔧 Probando endpoint analyze-conversion...")
    print(f"URL: {url}")
    print(f"Datos: {json.dumps(test_data, indent=2)}")
    print()
    
    try:
        # Hacer la petición
        response = requests.post(
            url,
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"📊 Código de respuesta: {response.status_code}")
        print()
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Respuesta exitosa:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
            # Verificar estructura esperada
            if result.get('success'):
                analysis = result.get('analysis', {})
                if 'direct' in analysis:
                    print("\n✅ Estructura de análisis correcta")
                    print(f"   - Conversión: {result['source_format']} → {result['target_format']}")
                    print(f"   - Calidad: {analysis['direct'].get('quality', 'N/A')}%")
                    print(f"   - Descripción: {analysis['direct'].get('description', 'N/A')}")
                    return True
                else:
                    print("\n❌ Falta estructura 'direct' en análisis")
                    return False
            else:
                print(f"\n❌ Respuesta indica error: {result.get('error', 'Error desconocido')}")
                return False
        else:
            print("❌ Error en la petición:")
            try:
                error_data = response.json()
                print(json.dumps(error_data, indent=2, ensure_ascii=False))
            except:
                print(response.text)
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Error de conexión: ¿Está el servidor ejecutándose en localhost:8000?")
        return False
    except requests.exceptions.Timeout:
        print("❌ Timeout: El servidor tardó demasiado en responder")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def test_multiple_conversions():
    """Prueba múltiples conversiones"""
    
    test_cases = [
        ("jpg", "png"),
        ("png", "jpg"),
        ("docx", "pdf"),
        ("csv", "html"),
        ("md", "pdf")
    ]
    
    print("\n🧪 PROBANDO MÚLTIPLES CONVERSIONES")
    print("=" * 50)
    
    results = []
    
    for source, target in test_cases:
        print(f"\n📋 Probando {source.upper()} → {target.upper()}")
        
        url = "http://localhost:8000/api/conversion/analyze-conversion"
        data = {"source_format": source, "target_format": target}
        
        try:
            response = requests.post(url, json=data, timeout=5)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    analysis = result.get('analysis', {})
                    quality = analysis.get('direct', {}).get('quality', 'N/A')
                    print(f"   ✅ Exitoso - Calidad: {quality}%")
                    results.append(True)
                else:
                    print(f"   ❌ Error: {result.get('error', 'Desconocido')}")
                    results.append(False)
            else:
                print(f"   ❌ HTTP {response.status_code}")
                results.append(False)
                
        except Exception as e:
            print(f"   ❌ Excepción: {e}")
            results.append(False)
    
    # Resumen
    successful = sum(results)
    total = len(results)
    
    print(f"\n📊 RESUMEN: {successful}/{total} conversiones exitosas")
    
    if successful == total:
        print("🎉 ¡Todas las pruebas pasaron!")
    else:
        print("⚠️  Algunas pruebas fallaron")
    
    return successful == total

if __name__ == "__main__":
    print("🚀 INICIANDO PRUEBAS DEL ENDPOINT")
    print("=" * 60)
    
    # Prueba básica
    basic_success = test_analyze_conversion()
    
    if basic_success:
        # Pruebas múltiples
        multiple_success = test_multiple_conversions()
        
        if multiple_success:
            print("\n🎯 TODAS LAS PRUEBAS EXITOSAS")
            print("El endpoint analyze-conversion está funcionando correctamente.")
        else:
            print("\n⚠️  ALGUNAS PRUEBAS FALLARON")
    else:
        print("\n❌ PRUEBA BÁSICA FALLÓ")
        print("El endpoint analyze-conversion tiene problemas.")
