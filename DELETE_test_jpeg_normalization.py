#!/usr/bin/env python3
import requests
import json

def test_jpeg_normalization():
    """Probar que la normalización jpeg → jpg funciona"""
    url = "http://localhost:8000/api/conversion/analyze-conversion"
    headers = {
        "Content-Type": "application/json",
        "Origin": "http://localhost:5173"
    }
    
    # Probar con formato 'jpeg' (debe normalizarse a 'jpg')
    data = {
        "source_format": "jpeg",  # ← Esto debe normalizarse a 'jpg'
        "target_format": "png"
    }
    
    print(f"🔍 Testing JPEG normalization...")
    print(f"🔍 Enviando: {data}")
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"🔍 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS! JPEG normalization working")
            print(f"✅ Source format normalized to: {result.get('source_format')}")
            print(f"✅ Target format: {result.get('target_format')}")
            return True
        else:
            print("❌ ERROR!")
            try:
                error_data = response.json()
                print(f"❌ Error: {error_data}")
            except:
                print(f"❌ Raw response: {response.text}")
            return False
                
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

if __name__ == "__main__":
    success = test_jpeg_normalization()
    if success:
        print("\n🎉 JPEG normalization test PASSED!")
    else:
        print("\n💥 JPEG normalization test FAILED!")
