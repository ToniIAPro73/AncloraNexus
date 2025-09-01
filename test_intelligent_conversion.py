#!/usr/bin/env python3
"""
Test del sistema de conversión HTML a PDF inteligente
"""

import sys
import os
import time
from pathlib import Path

# Agregar el directorio backend al path
backend_path = Path(__file__).parent / "backend" / "src"
sys.path.insert(0, str(backend_path))

from models.conversions.html_to_pdf import convert

def test_intelligent_conversion():
    """Prueba el sistema de conversión inteligente"""
    
    # Archivo de entrada
    input_html = "docs/design/Anclora Brand & Design System Guide (A4).html"
    output_pdf = "intelligent_conversion_test.pdf"
    
    if not os.path.exists(input_html):
        print(f"❌ Archivo HTML no encontrado: {input_html}")
        return
    
    print("=== TEST DE CONVERSIÓN INTELIGENTE HTML→PDF ===")
    print(f"📄 Entrada: {input_html}")
    print(f"📄 Salida: {output_pdf}")
    print()
    
    try:
        print("🔍 Iniciando conversión inteligente...")
        start_time = time.time()
        
        success, message = convert(input_html, output_pdf)
        
        end_time = time.time()
        duration = end_time - start_time
        
        if success:
            file_size = os.path.getsize(output_pdf) if os.path.exists(output_pdf) else 0
            
            print("✅ CONVERSIÓN EXITOSA!")
            print(f"   Mensaje: {message}")
            print(f"   Tiempo real: {duration:.2f}s")
            print(f"   Tamaño del PDF: {file_size:,} bytes ({file_size/1024/1024:.2f} MB)")
            print(f"   Archivo generado: {output_pdf}")
            
            # Comparar con el PDF anterior
            old_pdf = "Anclora_Brand__Design_System_Guide_A4.pdf"
            if os.path.exists(old_pdf):
                old_size = os.path.getsize(old_pdf)
                improvement = ((file_size - old_size) / old_size) * 100
                print()
                print("📈 COMPARACIÓN CON CONVERSIÓN ANTERIOR:")
                print(f"   PDF anterior: {old_size:,} bytes")
                print(f"   PDF inteligente: {file_size:,} bytes")
                print(f"   Mejora: {improvement:+.1f}% en tamaño")
                
                if file_size > old_size * 2:
                    print("   🎉 ¡Significativa mejora en calidad detectada!")
                elif file_size > old_size:
                    print("   ✅ Mejora en calidad detectada")
                else:
                    print("   ⚠️ Tamaño similar - verificar calidad manualmente")
            
        else:
            print("❌ CONVERSIÓN FALLÓ")
            print(f"   Error: {message}")
            print(f"   Tiempo: {duration:.2f}s")
            
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")

def test_simple_html_conversion():
    """Prueba conversión con HTML simple para verificar eficiencia"""
    
    simple_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test Simple</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            p { line-height: 1.6; }
        </style>
    </head>
    <body>
        <h1>Documento Simple</h1>
        <p>Este es un documento HTML simple para probar la selección inteligente de método de conversión.</p>
        <p>Debería usar FPDF por ser eficiente para contenido básico.</p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
        </ul>
    </body>
    </html>
    """
    
    # Crear archivo temporal
    temp_html = "temp_simple_test.html"
    temp_pdf = "simple_conversion_test.pdf"
    
    with open(temp_html, 'w', encoding='utf-8') as f:
        f.write(simple_html)
    
    try:
        print("\n" + "="*60)
        print("=== TEST: HTML SIMPLE (Verificación de Eficiencia) ===")
        print(f"📄 Entrada: {temp_html}")
        print(f"📄 Salida: {temp_pdf}")
        print()
        
        print("🔍 Iniciando conversión inteligente...")
        start_time = time.time()
        
        success, message = convert(temp_html, temp_pdf)
        
        end_time = time.time()
        duration = end_time - start_time
        
        if success:
            file_size = os.path.getsize(temp_pdf) if os.path.exists(temp_pdf) else 0
            
            print("✅ CONVERSIÓN EXITOSA!")
            print(f"   Mensaje: {message}")
            print(f"   Tiempo real: {duration:.2f}s")
            print(f"   Tamaño del PDF: {file_size:,} bytes")
            
            # Verificar que usó método eficiente
            if "FPDF" in message:
                print("   🎯 ¡Perfecto! Usó FPDF para HTML simple (eficiente)")
            elif duration < 2.0:
                print("   ✅ Conversión rápida - método eficiente seleccionado")
            else:
                print("   ⚠️ Conversión lenta para HTML simple - revisar lógica")
                
        else:
            print("❌ CONVERSIÓN FALLÓ")
            print(f"   Error: {message}")
            
    finally:
        # Limpiar archivos temporales
        for temp_file in [temp_html, temp_pdf]:
            if os.path.exists(temp_file):
                os.remove(temp_file)

if __name__ == "__main__":
    test_intelligent_conversion()
    test_simple_html_conversion()
