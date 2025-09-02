#!/usr/bin/env python3
"""
Prueba simple para diagnosticar problemas de conversión
"""
import requests
import tempfile
import os

BASE_URL = "http://localhost:8000"

def test_simple_conversion():
    """Prueba una conversión simple TXT→HTML"""
    print("🔍 Probando conversión simple TXT→HTML...")
    
    # Crear archivo de prueba
    temp_dir = tempfile.gettempdir()
    test_file = os.path.join(temp_dir, "test_simple.txt")
    
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write("Hola mundo\nEste es un archivo de prueba simple.")
    
    try:
        # Realizar conversión
        with open(test_file, 'rb') as f:
            files = {'file': ('test_simple.txt', f, 'text/plain')}
            data = {'target_format': 'html'}
            
            response = requests.post(f"{BASE_URL}/api/conversion/guest-convert", 
                                   files=files, data=data, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Conversión exitosa: {result.get('message')}")
            return True
        else:
            print(f"❌ Error en conversión")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    finally:
        # Limpiar
        if os.path.exists(test_file):
            os.remove(test_file)

def test_supported_formats():
    """Verifica formatos soportados"""
    print("\n🔍 Verificando formatos soportados...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/conversion/supported-formats")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            formats = response.json()
            print(f"✅ Formatos soportados: {formats}")
            return formats
        else:
            print(f"❌ Error obteniendo formatos: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def main():
    print("🚀 DIAGNÓSTICO SIMPLE DEL SISTEMA")
    print("=" * 40)
    
    # Verificar servidor
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Servidor funcionando")
        else:
            print("❌ Servidor con problemas")
            return
    except:
        print("❌ No se puede conectar al servidor")
        return
    
    # Probar formatos soportados
    formats = test_supported_formats()
    
    # Probar conversión simple
    success = test_simple_conversion()
    
    print(f"\n📊 RESULTADO: {'✅ SISTEMA FUNCIONANDO' if success else '❌ SISTEMA CON PROBLEMAS'}")

if __name__ == "__main__":
    main()
