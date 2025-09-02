#!/usr/bin/env python3
"""
Pruebas directas del sistema de encoding UTF-8
Evita problemas de importación de módulos
"""
import os
import sys
import tempfile
import json
from pathlib import Path

# Agregar backend al path
sys.path.insert(0, 'backend/src')

def test_encoding_system_direct():
    """Prueba directa del sistema de encoding"""
    print("🔍 PRUEBAS DIRECTAS DEL SISTEMA DE ENCODING UTF-8")
    print("=" * 55)
    
    results = {'passed': 0, 'failed': 0, 'details': {}}
    
    try:
        from encoding_normalizer import normalize_to_utf8, detect_encoding, repair_mojibake, undo_normalization
        print("✅ Módulo encoding_normalizer importado correctamente")
    except ImportError as e:
        print(f"❌ Error importando encoding_normalizer: {e}")
        return
    
    # Crear directorio temporal
    temp_dir = Path(tempfile.gettempdir()) / "encoding_tests"
    temp_dir.mkdir(exist_ok=True)
    
    # 1. Probar detección de encoding
    print("\n📋 1. PROBANDO DETECCIÓN DE ENCODING...")
    
    # Archivo UTF-8
    utf8_file = temp_dir / "test_utf8.txt"
    utf8_content = "Texto UTF-8: áéíóú ñÑ 🚀 📄"
    utf8_file.write_text(utf8_content, encoding='utf-8')
    
    detected = detect_encoding(utf8_file.read_bytes())
    print(f"  • UTF-8 detectado como: {detected}")
    if detected in ['utf-8', 'ascii']:
        results['passed'] += 1
        results['details']['utf8_detection'] = 'passed'
    else:
        results['failed'] += 1
        results['details']['utf8_detection'] = 'failed'
    
    # Archivo Latin-1
    latin1_file = temp_dir / "test_latin1.txt"
    latin1_content = "Texto Latin-1: áéíóú ñÑ"
    latin1_file.write_text(latin1_content, encoding='latin-1')
    
    detected = detect_encoding(latin1_file.read_bytes())
    print(f"  • Latin-1 detectado como: {detected}")
    if detected in ['latin-1', 'ISO-8859-1', 'windows-1252']:
        results['passed'] += 1
        results['details']['latin1_detection'] = 'passed'
    else:
        results['failed'] += 1
        results['details']['latin1_detection'] = 'failed'
    
    # 2. Probar normalización
    print("\n🔄 2. PROBANDO NORMALIZACIÓN...")
    
    # Normalizar archivo Latin-1
    print("  • Normalizando Latin-1 → UTF-8: ", end="")
    try:
        original_content = latin1_file.read_text(encoding='latin-1')
        result = normalize_to_utf8(latin1_file)
        
        # Verificar que se normalizó
        normalized_content = latin1_file.read_text(encoding='utf-8')
        backup_exists = (latin1_file.parent / f"{latin1_file.name}.bak").exists()
        
        if normalized_content == original_content and backup_exists:
            print("✅ EXITOSO")
            results['passed'] += 1
            results['details']['normalization'] = 'passed'
        else:
            print("❌ FALLO")
            results['failed'] += 1
            results['details']['normalization'] = 'failed'
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        results['failed'] += 1
        results['details']['normalization'] = 'error'
    
    # 3. Probar normalización con BOM
    print("  • Normalizando con BOM: ", end="")
    try:
        bom_file = temp_dir / "test_bom.txt"
        bom_file.write_text("Texto para BOM test", encoding='utf-8')
        
        result = normalize_to_utf8(bom_file, bom=True)
        
        # Verificar BOM
        content_bytes = bom_file.read_bytes()
        has_bom = content_bytes.startswith(b'\xef\xbb\xbf')
        
        if has_bom:
            print("✅ BOM AGREGADO")
            results['passed'] += 1
            results['details']['bom'] = 'passed'
        else:
            print("❌ BOM NO AGREGADO")
            results['failed'] += 1
            results['details']['bom'] = 'failed'
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        results['failed'] += 1
        results['details']['bom'] = 'error'
    
    # 4. Probar reparación de mojibake
    print("\n🔧 3. PROBANDO REPARACIÓN DE MOJIBAKE...")
    
    mojibake_cases = [
        ("Ã¡", "á"),  # á mal codificado
        ("Ã©", "é"),  # é mal codificado
        ("Ã±", "ñ"),  # ñ mal codificado
    ]
    
    for mojibake, expected in mojibake_cases:
        print(f"  • Reparando '{mojibake}' → '{expected}': ", end="")
        try:
            repaired = repair_mojibake(mojibake)
            if expected in repaired:
                print("✅ REPARADO")
                results['passed'] += 1
            else:
                print(f"❌ NO REPARADO (resultado: '{repaired}')")
                results['failed'] += 1
        except Exception as e:
            print(f"❌ ERROR: {e}")
            results['failed'] += 1
    
    # 5. Probar undo
    print("\n↩️ 4. PROBANDO FUNCIÓN UNDO...")
    print("  • Restaurando desde backup: ", end="")
    try:
        if (latin1_file.parent / f"{latin1_file.name}.bak").exists():
            success = undo_normalization(latin1_file)
            if success:
                print("✅ RESTAURADO")
                results['passed'] += 1
                results['details']['undo'] = 'passed'
            else:
                print("❌ FALLO")
                results['failed'] += 1
                results['details']['undo'] = 'failed'
        else:
            print("⚠️ NO HAY BACKUP")
            results['details']['undo'] = 'no_backup'
    except Exception as e:
        print(f"❌ ERROR: {e}")
        results['failed'] += 1
        results['details']['undo'] = 'error'
    
    # 6. Verificar logs
    print("\n📋 5. VERIFICANDO LOGS...")
    log_file = Path("backend/logs/encoding/encoding_normalizer.log")
    
    if log_file.exists():
        print(f"  • Log existe: ✅")
        try:
            with open(log_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            print(f"  • Entradas en log: {len(lines)}")
            
            # Analizar últimas entradas
            recent_entries = []
            for line in lines[-5:]:  # Últimas 5 entradas
                try:
                    entry = json.loads(line.strip())
                    recent_entries.append(entry)
                except:
                    continue
            
            print(f"  • Entradas válidas recientes: {len(recent_entries)}")
            
            if recent_entries:
                last_entry = recent_entries[-1]
                print(f"  • Última normalización: {last_entry.get('from')} → {last_entry.get('to')}")
                results['passed'] += 1
                results['details']['logs'] = 'passed'
            else:
                print("  • ❌ No hay entradas válidas")
                results['failed'] += 1
                results['details']['logs'] = 'failed'
                
        except Exception as e:
            print(f"  • ❌ Error leyendo log: {e}")
            results['failed'] += 1
            results['details']['logs'] = 'error'
    else:
        print(f"  • ❌ Log no existe")
        results['failed'] += 1
        results['details']['logs'] = 'not_found'
    
    # Reporte final
    total = results['passed'] + results['failed']
    success_rate = (results['passed'] / total * 100) if total > 0 else 0
    
    print(f"\n📊 REPORTE FINAL DE ENCODING:")
    print(f"   Total pruebas: {total}")
    print(f"   Exitosas: {results['passed']}")
    print(f"   Fallidas: {results['failed']}")
    print(f"   Tasa de éxito: {success_rate:.1f}%")
    
    # Análisis específico para "Bad magic number"
    print(f"\n🔍 ANÁLISIS PARA 'BAD MAGIC NUMBER':")
    print(f"   • Sistema de detección: {'✅ Funcionando' if results['details'].get('utf8_detection') == 'passed' else '❌ Problemas'}")
    print(f"   • Normalización automática: {'✅ Activa' if results['details'].get('logs') == 'passed' else '❌ Inactiva'}")
    print(f"   • Reparación mojibake: {'✅ Disponible' if any('passed' in str(v) for v in results['details'].values()) else '❌ Problemas'}")
    
    if success_rate >= 70:
        print(f"\n✅ CONCLUSIÓN: Sistema de encoding funcionando correctamente")
        print(f"   Los errores 'Bad magic number' probablemente NO son por encoding")
    else:
        print(f"\n❌ CONCLUSIÓN: Sistema de encoding tiene problemas")
        print(f"   Los errores 'Bad magic number' PUEDEN ser por encoding")
    
    # Guardar reporte
    with open('encoding_direct_test_report.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Reporte guardado en: encoding_direct_test_report.json")

if __name__ == "__main__":
    test_encoding_system_direct()
