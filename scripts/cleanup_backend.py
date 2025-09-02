#!/usr/bin/env python3
"""
Script de limpieza específica para el directorio backend
"""
import os
import shutil
from pathlib import Path

def main():
    print("🧹 LIMPIANDO DIRECTORIO BACKEND...")
    
    os.chdir("backend")
    
    # Archivos de debug/temporales para marcar como DELETE
    debug_files = [
        "debug_server.py",
        "debug_sqlalchemy.py", 
        "minimal_server.py",
        "monkey_patch.py",
        "simple_patch.py",
        "simple_server.py",
        "test.txt",
        "test_ai_conversion.py",
        "test_conversion_system.py",
        "conversion_sequence_examples.py",
        "main_current.py"
    ]
    
    # Archivos de configuración Node.js que no deberían estar en backend
    node_files = [
        "package.json",
        "package-lock.json"
    ]
    
    # Reportes que van a test_reports
    report_files = [
        "final_validation_report.json",
        "optimization_cache.json"
    ]
    
    print("\n🗑️ MARCANDO ARCHIVOS DE DEBUG PARA ELIMINACIÓN...")
    
    for file in debug_files:
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
    
    print("\n🗑️ MARCANDO ARCHIVOS NODE.JS INCORRECTOS...")
    
    for file in node_files:
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
    
    print("\n📊 MOVIENDO REPORTES...")
    
    for file in report_files:
        if os.path.exists(file):
            try:
                dest = f"../test_reports/{file}"
                if not os.path.exists(dest):
                    shutil.move(file, dest)
                    print(f"✅ Movido: {file} → {dest}")
                else:
                    print(f"⚠️ Ya existe: {dest}")
            except Exception as e:
                print(f"❌ Error moviendo {file}: {e}")
    
    print("\n🗑️ ELIMINANDO NODE_MODULES (NO DEBERÍA ESTAR EN BACKEND)...")
    
    if os.path.exists("node_modules"):
        try:
            shutil.rmtree("node_modules")
            print("✅ Eliminado: node_modules/")
        except Exception as e:
            print(f"❌ Error eliminando node_modules: {e}")
    
    print("\n🗑️ ELIMINANDO CARPETA FRONTEND DUPLICADA...")
    
    if os.path.exists("frontend"):
        try:
            shutil.rmtree("frontend")
            print("✅ Eliminado: frontend/ (duplicada)")
        except Exception as e:
            print(f"❌ Error eliminando frontend duplicada: {e}")
    
    print("\n✅ LIMPIEZA DE BACKEND COMPLETADA!")
    
    os.chdir("..")

if __name__ == "__main__":
    main()
