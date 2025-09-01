#!/usr/bin/env python3
"""
Prueba del flujo completo de conversión en la UI
Verifica que la selección de formato y descarga funcionen
"""
import requests
import tempfile
import os
from pathlib import Path

def test_ui_conversion_flow():
    """Prueba el flujo completo de conversión"""
    print("🧪 PRUEBA FLUJO COMPLETO DE CONVERSIÓN UI")
    print("=" * 45)
    
    # Crear archivo de prueba
    temp_dir = Path(tempfile.gettempdir())
    test_file = temp_dir / "ui_test.txt"
    test_file.write_text("Contenido de prueba para conversión UI\nSegunda línea con acentos: áéíóú", encoding='utf-8')
    
    try:
        # 1. Probar conversión TXT→PDF
        print("📄 Probando conversión TXT→PDF...")
        
        with open(test_file, 'rb') as f:
            files = {'file': ('ui_test.txt', f, 'text/plain')}
            data = {'target_format': 'pdf'}
            
            response = requests.post(
                'http://localhost:8000/api/conversion/guest-convert',
                files=files,
                data=data,
                timeout=30
            )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Success: {result.get('success')}")
            print(f"   Message: {result.get('message')}")
            
            if result.get('success'):
                download_id = result.get('download_id')
                output_filename = result.get('output_filename')
                
                print(f"   Download ID: {download_id}")
                print(f"   Output filename: {output_filename}")
                
                # 2. Probar descarga
                print("\n📥 Probando descarga...")
                
                download_response = requests.get(
                    f'http://localhost:8000/api/conversion/guest-download/{download_id}',
                    timeout=15
                )
                
                print(f"   Download status: {download_response.status_code}")
                
                if download_response.status_code == 200:
                    print("   ✅ DESCARGA EXITOSA")
                    print(f"   Tamaño archivo: {len(download_response.content)} bytes")
                    
                    # Guardar archivo descargado para verificación
                    download_path = temp_dir / f"downloaded_{output_filename}"
                    download_path.write_bytes(download_response.content)
                    print(f"   Archivo guardado en: {download_path}")
                    
                    return True
                else:
                    print(f"   ❌ ERROR EN DESCARGA: {download_response.text}")
                    return False
            else:
                print(f"   ❌ CONVERSIÓN FALLÓ: {result.get('error')}")
                return False
        else:
            print(f"   ❌ ERROR HTTP: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ EXCEPCIÓN: {e}")
        return False
    
    finally:
        # Limpiar archivo de prueba
        if test_file.exists():
            test_file.unlink()

def test_format_availability():
    """Prueba que los formatos estén disponibles"""
    print("\n🔍 PROBANDO DISPONIBILIDAD DE FORMATOS...")
    
    try:
        response = requests.get('http://localhost:8000/api/conversion/formats', timeout=10)
        
        if response.status_code == 200:
            formats = response.json()
            input_formats = formats.get('input', [])
            output_formats = formats.get('output', [])
            
            print(f"   Formatos de entrada: {len(input_formats)}")
            print(f"   Formatos de salida: {len(output_formats)}")
            
            # Verificar nuevos formatos
            new_formats = ['csv', 'json', 'epub', 'rtf', 'odt', 'webp', 'tiff']
            available_new = [f for f in new_formats if f in input_formats]
            
            print(f"   Nuevos formatos disponibles: {available_new}")
            
            if len(available_new) >= 5:
                print("   ✅ NUEVOS FORMATOS CARGADOS")
                return True
            else:
                print("   ⚠️ ALGUNOS FORMATOS FALTANTES")
                return False
        else:
            print(f"   ❌ ERROR: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 INICIANDO PRUEBAS DE UI...")
    
    # Verificar servidor
    try:
        response = requests.get('http://localhost:8000/api/health', timeout=5)
        if response.status_code != 200:
            print("❌ Servidor backend no disponible")
            return
        print("✅ Servidor backend funcionando")
    except:
        print("❌ No se puede conectar al servidor backend")
        return
    
    # Ejecutar pruebas
    format_test = test_format_availability()
    conversion_test = test_ui_conversion_flow()
    
    print("\n" + "=" * 45)
    print("📊 RESULTADOS FINALES:")
    print(f"   Formatos disponibles: {'✅' if format_test else '❌'}")
    print(f"   Conversión y descarga: {'✅' if conversion_test else '❌'}")
    
    if format_test and conversion_test:
        print("\n🎯 ✅ UI COMPLETAMENTE FUNCIONAL")
        print("   • Subida de archivos: ✅")
        print("   • Selección de formato: ✅") 
        print("   • Conversión real: ✅")
        print("   • Descarga: ✅")
    else:
        print("\n⚠️ UI CON PROBLEMAS")
        print("   Revisar logs del servidor para más detalles")

if __name__ == "__main__":
    main()
