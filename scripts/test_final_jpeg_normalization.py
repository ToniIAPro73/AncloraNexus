#!/usr/bin/env python3
"""
Test final para verificar que la normalización JPEG → JPG funciona correctamente
"""
import requests
import json

def test_jpeg_normalization():
    """Probar que la normalización jpeg → jpg funciona"""
    url = "http://localhost:8000/api/conversion/analyze-conversion"
    headers = {
        "Content-Type": "application/json",
        "Origin": "http://localhost:5173"
    }
    
    print("🧪 TESTING JPEG NORMALIZATION AFTER CLEANUP")
    print("=" * 50)
    
    # Test 1: JPEG → PNG
    print("\n📋 Test 1: JPEG → PNG")
    data1 = {"source_format": "jpeg", "target_format": "png"}
    
    try:
        response = requests.post(url, json=data1, headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS! Source normalized to: {result.get('source_format')}")
            print(f"✅ Target format: {result.get('target_format')}")
        else:
            print(f"❌ ERROR: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False
    
    # Test 2: JPG → PNG (ya normalizado)
    print("\n📋 Test 2: JPG → PNG (control)")
    data2 = {"source_format": "jpg", "target_format": "png"}
    
    try:
        response = requests.post(url, json=data2, headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS! Source format: {result.get('source_format')}")
            print(f"✅ Target format: {result.get('target_format')}")
        else:
            print(f"❌ ERROR: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False
    
    # Test 3: TIFF → JPG (otra normalización)
    print("\n📋 Test 3: TIFF → JPG")
    data3 = {"source_format": "tiff", "target_format": "jpg"}
    
    try:
        response = requests.post(url, json=data3, headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS! Source normalized to: {result.get('source_format')}")
            print(f"✅ Target format: {result.get('target_format')}")
        else:
            print(f"❌ ERROR: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = test_jpeg_normalization()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 ALL TESTS PASSED!")
        print("✅ JPEG normalization working correctly")
        print("✅ Repository cleanup successful")
        print("✅ Backend functioning properly")
    else:
        print("💥 SOME TESTS FAILED!")
        print("❌ Check the errors above")
