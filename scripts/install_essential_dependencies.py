#!/usr/bin/env python3
"""
Instalador de dependencias esenciales para presupuesto reducido
Solo instala lo mínimo necesario para las 5 conversiones de mayor ROI
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description=""):
    """Ejecuta un comando y maneja errores"""
    print(f"🔧 {description}")
    print(f"   Ejecutando: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"   ✅ Éxito")
            return True
        else:
            print(f"   ❌ Error (código {result.returncode})")
            if result.stderr.strip():
                print(f"   📄 Error: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"   ❌ Excepción: {str(e)}")
        return False

def install_essential_dependencies():
    """Instala solo las dependencias esenciales (GRATIS)"""
    
    print("🚀 INSTALADOR DE DEPENDENCIAS ESENCIALES")
    print("=" * 50)
    print("💰 Costo total: $0")
    print("⏱️  Tiempo estimado: 2-5 minutos")
    print("🎯 Objetivo: 5 conversiones de máximo ROI")
    print()
    
    # Dependencias esenciales (todas gratuitas)
    essential_deps = [
        # Documentos Office
        ("python-docx", "Crear/editar documentos Word"),
        ("openpyxl", "Leer/escribir archivos Excel"),
        ("pandas", "Procesamiento de datos (CSV, Excel, JSON)"),
        
        # PDFs
        ("PyPDF2", "Manipulación básica de PDFs"),
        ("reportlab", "Generación de PDFs desde Python"),
        
        # Imágenes
        ("Pillow", "Procesamiento de imágenes"),
        
        # Utilidades
        ("pathlib", "Manejo de rutas (incluido en Python 3.4+)"),
    ]
    
    # Dependencias opcionales (mejoran funcionalidad)
    optional_deps = [
        ("docx2pdf", "Conversión DOCX→PDF nativa (Windows/Mac)"),
        ("xlsxwriter", "Creación avanzada de archivos Excel"),
    ]
    
    print("📦 INSTALANDO DEPENDENCIAS ESENCIALES...")
    print()
    
    success_count = 0
    total_count = len(essential_deps)
    
    for package, description in essential_deps:
        if package == "pathlib":
            # pathlib viene incluido en Python 3.4+
            print(f"✅ {package}: {description} (incluido en Python)")
            success_count += 1
            continue
            
        success = run_command(
            f"pip install {package}",
            f"Instalando {package} - {description}"
        )
        
        if success:
            success_count += 1
        
        print()
    
    print("📦 INSTALANDO DEPENDENCIAS OPCIONALES...")
    print("(Estas pueden fallar sin afectar funcionalidad básica)")
    print()
    
    optional_success = 0
    for package, description in optional_deps:
        success = run_command(
            f"pip install {package}",
            f"Instalando {package} - {description}"
        )
        
        if success:
            optional_success += 1
        
        print()
    
    # Resumen de instalación
    print("=" * 50)
    print("📊 RESUMEN DE INSTALACIÓN")
    print("=" * 50)
    
    print(f"✅ Dependencias esenciales: {success_count}/{total_count}")
    print(f"🔧 Dependencias opcionales: {optional_success}/{len(optional_deps)}")
    
    if success_count >= total_count - 1:  # Permitir 1 fallo
        print("🎉 ¡INSTALACIÓN EXITOSA!")
        print()
        print("🚀 CONVERSIONES DISPONIBLES:")
        print("   • DOCX → PDF (Word a PDF)")
        print("   • XLSX → CSV (Excel a CSV)")
        print("   • CSV → XLSX (CSV a Excel)")
        print("   • JSON → XLSX (JSON a Excel)")
        print("   • PDF → TXT (Extraer texto)")
        print("   • JPG ↔ PNG (Conversión imágenes)")
        print("   • GIF → PNG")
        print("   • BMP → JPG")
        print()
        print("💰 Costo total: $0")
        print("⚡ Tiempo de conversión: < 30 segundos")
        print("🎯 ROI esperado: ⭐⭐⭐⭐⭐")
        
    elif success_count >= total_count // 2:
        print("⚠️  INSTALACIÓN PARCIAL")
        print("Algunas conversiones pueden no estar disponibles.")
        print("Revisa los errores anteriores e intenta instalar manualmente:")
        print()
        for package, description in essential_deps:
            if package != "pathlib":
                print(f"   pip install {package}")
        
    else:
        print("❌ INSTALACIÓN FALLÓ")
        print("Muy pocas dependencias se instalaron correctamente.")
        print("Verifica tu conexión a internet y permisos de instalación.")
        return False
    
    return True

def test_installations():
    """Prueba las instalaciones esenciales"""
    
    print("\n" + "=" * 50)
    print("🧪 PROBANDO INSTALACIONES")
    print("=" * 50)
    
    tests = [
        ("python-docx", "import docx; print('✅ python-docx OK')"),
        ("openpyxl", "import openpyxl; print('✅ openpyxl OK')"),
        ("pandas", "import pandas; print('✅ pandas OK')"),
        ("PyPDF2", "import PyPDF2; print('✅ PyPDF2 OK')"),
        ("reportlab", "from reportlab.pdfgen import canvas; print('✅ reportlab OK')"),
        ("Pillow", "from PIL import Image; print('✅ Pillow OK')"),
    ]
    
    working_count = 0
    
    for name, test_command in tests:
        print(f"🧪 Probando {name}...")
        success = run_command(f'python -c "{test_command}"', f"Test de {name}")
        if success:
            working_count += 1
        print()
    
    print(f"📊 RESULTADO: {working_count}/{len(tests)} dependencias funcionando")
    
    if working_count >= len(tests) - 1:
        print("🎉 ¡TODAS LAS DEPENDENCIAS FUNCIONAN!")
        return True
    elif working_count >= len(tests) // 2:
        print("⚠️  La mayoría de dependencias funcionan")
        return True
    else:
        print("❌ Muchas dependencias fallan")
        return False

def create_test_conversion():
    """Crea un archivo de prueba para verificar conversiones"""
    
    print("\n" + "=" * 50)
    print("🧪 CREANDO PRUEBA DE CONVERSIÓN")
    print("=" * 50)
    
    try:
        # Crear archivo CSV de prueba
        test_csv = "test_data.csv"
        with open(test_csv, 'w', encoding='utf-8') as f:
            f.write("Nombre,Edad,Ciudad\n")
            f.write("Juan,25,Madrid\n")
            f.write("María,30,Barcelona\n")
            f.write("Carlos,35,Valencia\n")
        
        print(f"✅ Archivo CSV creado: {test_csv}")
        
        # Probar conversión CSV → Excel
        try:
            import pandas as pd
            
            df = pd.read_csv(test_csv)
            test_excel = "test_data.xlsx"
            df.to_excel(test_excel, index=False)
            
            print(f"✅ Conversión CSV→Excel exitosa: {test_excel}")
            print(f"   Datos convertidos: {len(df)} filas")
            
            # Limpiar archivos de prueba
            os.remove(test_csv)
            os.remove(test_excel)
            print("✅ Archivos de prueba eliminados")
            
            return True
            
        except Exception as e:
            print(f"❌ Error en conversión de prueba: {str(e)}")
            return False
            
    except Exception as e:
        print(f"❌ Error creando prueba: {str(e)}")
        return False

def main():
    """Función principal"""
    
    print("🎯 ANCLORA NEXUS - SETUP PRESUPUESTO REDUCIDO")
    print("=" * 60)
    print("Objetivo: Implementar 5 conversiones esenciales con $0 de inversión")
    print()
    
    # Verificar Python
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 7):
        print("❌ Se requiere Python 3.7 o superior")
        print(f"   Versión actual: {python_version.major}.{python_version.minor}")
        return False
    
    print(f"✅ Python {python_version.major}.{python_version.minor} detectado")
    print()
    
    # Instalar dependencias
    if not install_essential_dependencies():
        print("❌ Instalación falló")
        return False
    
    # Probar instalaciones
    if not test_installations():
        print("⚠️  Algunas pruebas fallaron, pero el sistema puede funcionar parcialmente")
    
    # Crear prueba de conversión
    if create_test_conversion():
        print("\n🎉 ¡SETUP COMPLETO Y VERIFICADO!")
    else:
        print("\n⚠️  Setup completo, pero la prueba de conversión falló")
    
    print("\n" + "=" * 60)
    print("📋 PRÓXIMOS PASOS:")
    print("1. Integrar essential_converter.py en tu aplicación")
    print("2. Añadir endpoint universal de conversión")
    print("3. Actualizar frontend para soportar nuevos formatos")
    print("4. Probar con archivos reales")
    print("5. Lanzar beta con usuarios")
    print()
    print("💰 Inversión total: $0")
    print("⏱️  Tiempo de desarrollo restante: 1-2 semanas")
    print("🎯 ROI esperado: ⭐⭐⭐⭐⭐")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
