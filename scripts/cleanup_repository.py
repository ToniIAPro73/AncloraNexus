#!/usr/bin/env python3
"""
Script de limpieza sistemática del repositorio Anclora Nexus
Organiza archivos en sus carpetas correspondientes y marca obsoletos para eliminación
"""
import os
import shutil
from pathlib import Path

def main():
    print("🧹 INICIANDO LIMPIEZA SISTEMÁTICA DEL REPOSITORIO")
    
    # Archivos de test temporales (marcar para eliminar)
    test_files_to_delete = [
        "test_advanced_ui_system.py",
        "test_bad_magic_number_cases.py", 
        "test_complete_intelligent_system.py",
        "test_complete_system_validation.py",
        "test_comprehensive_conversions.py",
        "test_comprehensive_html_types.py",
        "test_docx_specific_debug.py",
        "test_encoding_direct.py",
        "test_encoding_validation.py",
        "test_endpoint.py",
        "test_enhanced_conversion_system.py",
        "test_final_validation_direct.py",
        "test_html_pdf_quality_comparison.py",
        "test_intelligent_conversion.py",
        "test_intelligent_html_analysis.py",
        "test_jpeg_normalization.py",
        "test_simple_conversion.py",
        "test_ui_conversion_flow.py"
    ]
    
    # Archivos de documentación que van a docs/
    docs_files = [
        "Análisis de las Conversiones de Documentos complejos.md",
        "Librerías Open Source para Conversiones de Documentos no complejas.md",
        "README_ADVANCED_COMPONENTS.md"
    ]
    
    # Archivos de assets/imágenes que van a docs/assets/
    asset_files = [
        "Anclora_Brand__Design_System_Guide_A4.pdf",
        "Captura landing.png", 
        "Recuadro de archivo convertido exitosamente.png",
        "Recuadro de descargar.png"
    ]
    
    # Archivos de reportes/resultados que van a test_reports/
    report_files = [
        "bad_magic_number_test_report.json",
        "encoding_direct_test_report.json", 
        "encoding_validation_report.json",
        "enhanced_system_test_report.json",
        "intelligent_conversion_test.pdf",
        "monitoring_config.json"
    ]
    
    # Archivos temporales/obsoletos (marcar para eliminar)
    temp_files_to_delete = [
        "test_document.md",
        "test_file.txt", 
        "test_html_file.html"
    ]
    
    # Instaladores/binarios que van a tools/
    tool_files = [
        "pandoc-3.7.0.2-windows-x86_64.msi",
        "anclora-nexus-testing-lab.rar"
    ]
    
    # Archivos ZIP de assets que van a backups/
    backup_files = [
        "exported-assets-complex-conversions.zip",
        "exported-assets-easy-medium-conversion.zip"
    ]
    
    print("\n📁 CREANDO ESTRUCTURA DE CARPETAS...")
    
    # Crear carpetas necesarias
    os.makedirs("docs/assets", exist_ok=True)
    os.makedirs("tools", exist_ok=True)
    
    print("\n🗑️ MARCANDO ARCHIVOS TEMPORALES PARA ELIMINACIÓN...")
    
    # Marcar archivos de test para eliminación
    for file in test_files_to_delete:
        if os.path.exists(file):
            try:
                new_name = f"DELETE_{file}"
                if not os.path.exists(new_name):
                    os.rename(file, new_name)
                    print(f"✅ Marcado: {file} → {new_name}")
                else:
                    print(f"⚠️ Ya existe: {new_name}")
            except Exception as e:
                print(f"❌ Error marcando {file}: {e}")
    
    # Marcar archivos temporales para eliminación  
    for file in temp_files_to_delete:
        if os.path.exists(file):
            try:
                new_name = f"DELETE_{file}"
                if not os.path.exists(new_name):
                    os.rename(file, new_name)
                    print(f"✅ Marcado: {file} → {new_name}")
            except Exception as e:
                print(f"❌ Error marcando {file}: {e}")
    
    print("\n📚 MOVIENDO DOCUMENTACIÓN A docs/...")
    
    # Mover archivos de documentación
    for file in docs_files:
        if os.path.exists(file):
            try:
                dest = f"docs/{file}"
                if not os.path.exists(dest):
                    shutil.move(file, dest)
                    print(f"✅ Movido: {file} → {dest}")
                else:
                    print(f"⚠️ Ya existe: {dest}")
            except Exception as e:
                print(f"❌ Error moviendo {file}: {e}")
    
    print("\n🖼️ MOVIENDO ASSETS A docs/assets/...")
    
    # Mover archivos de assets
    for file in asset_files:
        if os.path.exists(file):
            try:
                dest = f"docs/assets/{file}"
                if not os.path.exists(dest):
                    shutil.move(file, dest)
                    print(f"✅ Movido: {file} → {dest}")
                else:
                    print(f"⚠️ Ya existe: {dest}")
            except Exception as e:
                print(f"❌ Error moviendo {file}: {e}")
    
    print("\n📊 MOVIENDO REPORTES A test_reports/...")
    
    # Mover archivos de reportes
    for file in report_files:
        if os.path.exists(file):
            try:
                dest = f"test_reports/{file}"
                if not os.path.exists(dest):
                    shutil.move(file, dest)
                    print(f"✅ Movido: {file} → {dest}")
                else:
                    print(f"⚠️ Ya existe: {dest}")
            except Exception as e:
                print(f"❌ Error moviendo {file}: {e}")
    
    print("\n🔧 MOVIENDO HERRAMIENTAS A tools/...")
    
    # Mover herramientas
    for file in tool_files:
        if os.path.exists(file):
            try:
                dest = f"tools/{file}"
                if not os.path.exists(dest):
                    shutil.move(file, dest)
                    print(f"✅ Movido: {file} → {dest}")
                else:
                    print(f"⚠️ Ya existe: {dest}")
            except Exception as e:
                print(f"❌ Error moviendo {file}: {e}")
    
    print("\n💾 MOVIENDO BACKUPS...")
    
    # Mover backups
    for file in backup_files:
        if os.path.exists(file):
            try:
                dest = f"backups/{file}"
                if not os.path.exists(dest):
                    shutil.move(file, dest)
                    print(f"✅ Movido: {file} → {dest}")
                else:
                    print(f"⚠️ Ya existe: {dest}")
            except Exception as e:
                print(f"❌ Error moviendo {file}: {e}")
    
    print("\n✅ LIMPIEZA COMPLETADA!")
    print("\n📋 RESUMEN:")
    print("- Archivos de test marcados para eliminación con prefijo DELETE_")
    print("- Documentación movida a docs/")
    print("- Assets movidos a docs/assets/")
    print("- Reportes movidos a test_reports/")
    print("- Herramientas movidas a tools/")
    print("- Backups organizados")
    
    print("\n⚠️ SIGUIENTE PASO:")
    print("Revisar archivos marcados con DELETE_ y eliminarlos si están seguros")

if __name__ == "__main__":
    main()
