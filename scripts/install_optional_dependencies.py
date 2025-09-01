#!/usr/bin/env python3
"""
Script para instalar dependencias opcionales para conversión HTML a PDF de alta calidad
"""

import subprocess
import sys
import os
import platform
import requests
import zipfile
from pathlib import Path

def run_command(command, description=""):
    """Ejecuta un comando y maneja errores"""
    print(f"🔧 {description}")
    print(f"   Ejecutando: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"   ✅ Éxito")
            if result.stdout.strip():
                print(f"   📄 Output: {result.stdout.strip()}")
            return True
        else:
            print(f"   ❌ Error (código {result.returncode})")
            if result.stderr.strip():
                print(f"   📄 Error: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"   ❌ Excepción: {str(e)}")
        return False

def install_weasyprint():
    """Instala WeasyPrint y sus dependencias"""
    print("\n=== INSTALANDO WEASYPRINT ===")
    
    system = platform.system().lower()
    
    if system == "windows":
        print("🪟 Detectado Windows - Instalando WeasyPrint con GTK")
        
        # Instalar WeasyPrint
        success = run_command(
            "pip install weasyprint",
            "Instalando WeasyPrint via pip"
        )
        
        if success:
            print("✅ WeasyPrint instalado correctamente")
            print("⚠️  NOTA: Si hay errores de GTK, instalar GTK manualmente:")
            print("   - Descargar GTK desde: https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer")
            print("   - O usar: choco install gtk-runtime")
        
        return success
        
    elif system == "linux":
        print("🐧 Detectado Linux - Instalando dependencias del sistema")
        
        # Detectar distribución
        try:
            with open("/etc/os-release") as f:
                os_info = f.read().lower()
            
            if "ubuntu" in os_info or "debian" in os_info:
                run_command(
                    "sudo apt-get update && sudo apt-get install -y python3-dev python3-pip python3-cffi python3-brotli libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0",
                    "Instalando dependencias del sistema (Ubuntu/Debian)"
                )
            elif "centos" in os_info or "rhel" in os_info or "fedora" in os_info:
                run_command(
                    "sudo yum install -y python3-devel python3-pip python3-cffi pango harfbuzz",
                    "Instalando dependencias del sistema (CentOS/RHEL/Fedora)"
                )
        except:
            print("⚠️  No se pudo detectar la distribución Linux")
        
        return run_command("pip install weasyprint", "Instalando WeasyPrint")
        
    elif system == "darwin":
        print("🍎 Detectado macOS - Instalando con Homebrew")
        
        # Instalar dependencias con Homebrew
        run_command("brew install pango", "Instalando Pango")
        return run_command("pip install weasyprint", "Instalando WeasyPrint")
    
    else:
        print(f"❌ Sistema operativo no soportado: {system}")
        return False

def install_wkhtmltopdf():
    """Instala wkhtmltopdf"""
    print("\n=== INSTALANDO WKHTMLTOPDF ===")
    
    system = platform.system().lower()
    
    if system == "windows":
        print("🪟 Para Windows, descargar manualmente desde:")
        print("   https://wkhtmltopdf.org/downloads.html")
        print("   O usar: choco install wkhtmltopdf")
        
        # Verificar si ya está instalado
        if run_command("wkhtmltopdf --version", "Verificando instalación existente"):
            print("✅ wkhtmltopdf ya está instalado")
            return True
        else:
            print("⚠️  wkhtmltopdf no encontrado. Instalar manualmente.")
            return False
            
    elif system == "linux":
        print("🐧 Instalando wkhtmltopdf en Linux")
        
        try:
            with open("/etc/os-release") as f:
                os_info = f.read().lower()
            
            if "ubuntu" in os_info or "debian" in os_info:
                return run_command(
                    "sudo apt-get install -y wkhtmltopdf",
                    "Instalando wkhtmltopdf (Ubuntu/Debian)"
                )
            elif "centos" in os_info or "rhel" in os_info or "fedora" in os_info:
                return run_command(
                    "sudo yum install -y wkhtmltopdf",
                    "Instalando wkhtmltopdf (CentOS/RHEL/Fedora)"
                )
        except:
            print("⚠️  Instalar manualmente: sudo apt-get install wkhtmltopdf")
            return False
            
    elif system == "darwin":
        print("🍎 Instalando wkhtmltopdf en macOS")
        return run_command("brew install wkhtmltopdf", "Instalando con Homebrew")
    
    return False

def install_pandoc():
    """Instala Pandoc"""
    print("\n=== INSTALANDO PANDOC ===")
    
    system = platform.system().lower()
    
    if system == "windows":
        print("🪟 Para Windows, Pandoc se puede instalar con:")
        print("   - Chocolatey: choco install pandoc")
        print("   - Scoop: scoop install pandoc")
        print("   - Manual: https://pandoc.org/installing.html")
        
        # Verificar si ya está instalado
        if run_command("pandoc --version", "Verificando instalación existente"):
            print("✅ Pandoc ya está instalado")
            return True
        else:
            print("⚠️  Pandoc no encontrado. Instalar manualmente.")
            return False
            
    elif system == "linux":
        try:
            with open("/etc/os-release") as f:
                os_info = f.read().lower()
            
            if "ubuntu" in os_info or "debian" in os_info:
                return run_command(
                    "sudo apt-get install -y pandoc texlive-xetex",
                    "Instalando Pandoc y XeLaTeX (Ubuntu/Debian)"
                )
            elif "centos" in os_info or "rhel" in os_info or "fedora" in os_info:
                return run_command(
                    "sudo yum install -y pandoc texlive-xetex",
                    "Instalando Pandoc y XeLaTeX (CentOS/RHEL/Fedora)"
                )
        except:
            return run_command("sudo apt-get install -y pandoc", "Instalando Pandoc")
            
    elif system == "darwin":
        return run_command("brew install pandoc", "Instalando Pandoc con Homebrew")
    
    return False

def test_installations():
    """Prueba las instalaciones"""
    print("\n=== PROBANDO INSTALACIONES ===")
    
    tests = [
        ("WeasyPrint", "python -c 'import weasyprint; print(\"WeasyPrint OK\")'"),
        ("pdfkit", "python -c 'import pdfkit; print(\"pdfkit OK\")'"),
        ("wkhtmltopdf", "wkhtmltopdf --version"),
        ("Pandoc", "pandoc --version"),
        ("Playwright", "python -c 'from playwright.sync_api import sync_playwright; print(\"Playwright OK\")'")
    ]
    
    results = {}
    
    for name, command in tests:
        print(f"🧪 Probando {name}...")
        success = run_command(command, f"Test de {name}")
        results[name] = success
        print()
    
    print("📊 RESUMEN DE PRUEBAS:")
    for name, success in results.items():
        status = "✅ OK" if success else "❌ FALLO"
        print(f"   {name}: {status}")
    
    return results

def main():
    """Función principal"""
    print("🚀 INSTALADOR DE DEPENDENCIAS OPCIONALES")
    print("=" * 50)
    print(f"Sistema operativo: {platform.system()} {platform.release()}")
    print(f"Python: {sys.version}")
    print()
    
    # Instalar dependencias Python básicas
    print("📦 Instalando dependencias Python...")
    python_deps = [
        "pdfkit",
        "beautifulsoup4",
        "playwright"
    ]
    
    for dep in python_deps:
        run_command(f"pip install {dep}", f"Instalando {dep}")
    
    # Instalar navegadores de Playwright
    run_command("playwright install chromium", "Instalando navegador Chromium para Playwright")
    
    # Instalar dependencias del sistema
    install_weasyprint()
    install_wkhtmltopdf()
    install_pandoc()
    
    # Probar instalaciones
    results = test_installations()
    
    # Generar reporte final
    print("\n" + "=" * 50)
    print("📋 REPORTE FINAL DE INSTALACIÓN")
    print("=" * 50)
    
    working_methods = sum(1 for success in results.values() if success)
    total_methods = len(results)
    
    print(f"✅ Métodos funcionando: {working_methods}/{total_methods}")
    
    if working_methods >= 2:
        print("🎉 ¡Instalación exitosa! El sistema de conversión inteligente está listo.")
    elif working_methods >= 1:
        print("⚠️  Instalación parcial. Algunos métodos pueden no estar disponibles.")
    else:
        print("❌ Instalación falló. Revisar errores anteriores.")
    
    print("\n💡 PRÓXIMOS PASOS:")
    print("1. Ejecutar: python test_html_pdf_quality_comparison.py")
    print("2. Verificar que todos los métodos funcionen correctamente")
    print("3. Configurar monitoreo en producción")

if __name__ == "__main__":
    main()
