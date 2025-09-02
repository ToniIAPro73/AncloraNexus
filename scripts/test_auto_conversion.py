#!/usr/bin/env python3
"""
Test para verificar la nueva funcionalidad de conversión automática
"""
import requests
import json

def test_auto_conversion_logic():
    """Probar diferentes escenarios de conversión automática"""
    url = "http://localhost:8000/api/conversion/analyze-conversion"
    headers = {
        "Content-Type": "application/json",
        "Origin": "http://localhost:5173"
    }
    
    print("🧪 TESTING AUTO CONVERSION LOGIC")
    print("=" * 50)
    
    # Test 1: JPG → PNG (debería ser automática)
    print("\n📋 Test 1: JPG → PNG (esperado: automática)")
    data1 = {"source_format": "jpg", "target_format": "png"}
    
    try:
        response = requests.post(url, json=data1, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"✅ Recommendation: {result.get('analysis', {}).get('recommendation', {}).get('type')}")
            
            # Verificar si debería ser automática
            analysis = result.get('analysis', {})
            direct_quality = analysis.get('direct', {}).get('quality', 0)
            optimized_quality = analysis.get('optimized', {}).get('quality', 0)
            
            should_auto = (
                analysis.get('recommendation', {}).get('type') == 'direct' and
                (not optimized_quality or optimized_quality - direct_quality < 10)
            )
            
            print(f"✅ Direct quality: {direct_quality}%")
            print(f"✅ Optimized quality: {optimized_quality}%")
            print(f"✅ Should be automatic: {should_auto}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # Test 2: JPEG → PNG (debería ser automática con normalización)
    print("\n📋 Test 2: JPEG → PNG (esperado: automática con normalización)")
    data2 = {"source_format": "jpeg", "target_format": "png"}
    
    try:
        response = requests.post(url, json=data2, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"✅ Source normalized to: {result.get('source_format')}")
            print(f"✅ Recommendation: {result.get('analysis', {}).get('recommendation', {}).get('type')}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # Test 3: Verificar estructura de respuesta
    print("\n📋 Test 3: Verificar estructura completa de respuesta")
    data3 = {"source_format": "png", "target_format": "jpg"}
    
    try:
        response = requests.post(url, json=data3, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Status: {response.status_code}")
            print("✅ Response structure:")
            print(json.dumps(result, indent=2))
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_auto_conversion_logic()
    print("\n" + "=" * 50)
    print("🎯 FRONTEND LOGIC:")
    print("- Si recommendation.type === 'direct' Y")
    print("- (no hay optimized O optimized.quality - direct.quality < 10)")
    print("- ENTONCES: shouldAutoConvert = true")
    print("- RESULTADO: Mostrar 'Conversión Óptima' y saltar al paso 3")
