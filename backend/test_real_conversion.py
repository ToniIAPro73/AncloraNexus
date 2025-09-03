#!/usr/bin/env python3
"""Test script para probar la conversión del archivo real con caracteres especiales"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.models.conversions.md_to_pdf import convert as md_to_pdf

def test_real_file_conversion():
    """Prueba la conversión del archivo real con caracteres especiales"""
    input_file = 'test_real_file.md'
    output_file = 'test_real_output.pdf'
    
    print("🚀 Probando conversión del archivo real con caracteres especiales")
    print("=" * 70)
    print(f"📄 Archivo: {input_file}")
    print(f"🎯 Destino: {output_file}")
    print()
    
    if not os.path.exists(input_file):
        print(f"❌ Error: No se encuentra el archivo {input_file}")
        return
    
    # Mostrar información del archivo
    size = os.path.getsize(input_file)
    print(f"📊 Tamaño del archivo: {size} bytes")
    
    # Analizar caracteres especiales
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    special_chars = set()
    for char in content:
        if ord(char) > 127:  # Caracteres no-ASCII
            special_chars.add(char)
    
    print(f"🔍 Caracteres especiales encontrados: {len(special_chars)}")
    if special_chars:
        print(f"   Ejemplos: {list(special_chars)[:10]}")
    print()
    
    # Realizar conversión
    print("🔄 Iniciando conversión MD→PDF...")
    try:
        success, message = md_to_pdf(input_file, output_file)
        
        if success:
            print(f"✅ ÉXITO: {message}")
            
            if os.path.exists(output_file):
                output_size = os.path.getsize(output_file)
                print(f"📄 PDF generado: {output_size} bytes")
                
                # Verificar integridad del PDF
                try:
                    from pypdf import PdfReader
                    with open(output_file, 'rb') as f:
                        reader = PdfReader(f)
                        pages = len(reader.pages)
                        print(f"📖 PDF válido con {pages} páginas")
                        
                        # Intentar extraer texto de la primera página
                        if pages > 0:
                            first_page_text = reader.pages[0].extract_text()
                            print(f"📝 Texto extraído (primeros 100 chars): {first_page_text[:100]}...")
                            
                except Exception as e:
                    print(f"⚠️ Error verificando PDF: {e}")
            else:
                print("❌ Archivo PDF no se generó")
        else:
            print(f"❌ ERROR: {message}")
            
    except Exception as e:
        print(f"💥 Error inesperado: {e}")
    
    print("\n" + "=" * 70)
    print("🏁 Prueba completada")

if __name__ == "__main__":
    test_real_file_conversion()
