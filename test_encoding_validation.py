#!/usr/bin/env python3
"""
Suite de Pruebas Exhaustiva para Sistema de Encoding UTF-8
Valida normalización, CLI y integración con conversiones
"""
import os
import sys
import tempfile
import subprocess
import json
from pathlib import Path

class EncodingValidationTester:
    """Tester para validación completa del sistema de encoding"""
    
    def __init__(self):
        self.temp_dir = Path(tempfile.gettempdir()) / "anclora_encoding_tests"
        self.temp_dir.mkdir(exist_ok=True)
        self.results = {
            'cli_tests': {},
            'integration_tests': {},
            'edge_cases': {},
            'log_validation': {},
            'total_passed': 0,
            'total_failed': 0
        }

    def run_comprehensive_encoding_tests(self):
        """Ejecuta suite completa de pruebas de encoding"""
        print("🔍 VALIDACIÓN EXHAUSTIVA DEL SISTEMA DE ENCODING UTF-8")
        print("=" * 60)
        
        # 1. Crear archivos de prueba con diferentes encodings
        print("\n📝 1. CREANDO ARCHIVOS DE PRUEBA...")
        self.create_test_files()
        
        # 2. Probar CLI de normalización
        print("\n🖥️ 2. PROBANDO CLI DE NORMALIZACIÓN...")
        self.test_cli_normalization()
        
        # 3. Verificar integración automática
        print("\n🔄 3. VERIFICANDO INTEGRACIÓN AUTOMÁTICA...")
        self.test_automatic_integration()
        
        # 4. Analizar logs de encoding
        print("\n📋 4. ANALIZANDO LOGS DE ENCODING...")
        self.test_encoding_logs()
        
        # 5. Casos edge que causan "Bad magic number"
        print("\n⚠️ 5. PROBANDO CASOS EDGE...")
        self.test_edge_cases()
        
        # 6. Generar reporte final
        print("\n📊 6. GENERANDO REPORTE FINAL...")
        self.generate_encoding_report()

    def create_test_files(self):
        """Crea archivos de prueba con diferentes encodings"""
        print("Creando archivos de prueba...")
        
        # Contenido con caracteres problemáticos
        test_content = """Documento de Prueba - Encoding UTF-8
        
Caracteres con acentos: áéíóú ÁÉÍÓÚ ñÑ
Caracteres especiales: ¿¡ "comillas" 'apostrofes' –guiones—
Emojis: 🚀 📄 ✅ ❌ 🔥 💡 🎯 📊
Caracteres Unicode: 游戏 中文 العربية русский
Símbolos: © ® ™ € £ ¥ § ¶ † ‡ • …

Este archivo contiene múltiples tipos de caracteres que pueden
causar problemas de encoding en conversiones de archivos.
"""
        
        # 1. Archivo UTF-8 (correcto)
        utf8_file = self.temp_dir / "test_utf8.txt"
        utf8_file.write_text(test_content, encoding='utf-8')
        print(f"  ✅ Creado: {utf8_file.name} (UTF-8)")
        
        # 2. Archivo Latin-1 (problemático)
        latin1_file = self.temp_dir / "test_latin1.txt"
        try:
            # Solo caracteres que Latin-1 puede manejar
            latin1_content = "Documento con acentos: áéíóú ÁÉÍÓÚ ñÑ\nCaracteres especiales: ¿¡\nEste archivo está en Latin-1"
            latin1_file.write_text(latin1_content, encoding='latin-1')
            print(f"  ✅ Creado: {latin1_file.name} (Latin-1)")
        except Exception as e:
            print(f"  ❌ Error creando Latin-1: {e}")
        
        # 3. Archivo Windows-1252 (problemático)
        win1252_file = self.temp_dir / "test_win1252.txt"
        try:
            win1252_content = "Documento Windows-1252\nComillas: 'especiales' y apostrofes\nGuiones: largos y símbolos"
            win1252_file.write_text(win1252_content, encoding='windows-1252')
            print(f"  ✅ Creado: {win1252_file.name} (Windows-1252)")
        except Exception as e:
            print(f"  ❌ Error creando Windows-1252: {e}")
        
        # 4. Archivo con BOM UTF-8
        utf8_bom_file = self.temp_dir / "test_utf8_bom.txt"
        utf8_bom_file.write_text(test_content, encoding='utf-8-sig')
        print(f"  ✅ Creado: {utf8_bom_file.name} (UTF-8 con BOM)")
        
        # 5. Archivo binario corrupto (para probar robustez)
        corrupt_file = self.temp_dir / "test_corrupt.txt"
        corrupt_file.write_bytes(b'\xff\xfe\x00\x00invalid\x80\x81\x82')
        print(f"  ✅ Creado: {corrupt_file.name} (Binario corrupto)")

    def test_cli_normalization(self):
        """Prueba todos los comandos CLI de normalización"""
        print("Probando comandos CLI...")
        
        # Probar --dry-run
        print("  • Probando --dry-run: ", end="")
        try:
            result = subprocess.run([
                sys.executable, "-m", "backend.src.cli",
                str(self.temp_dir / "test_latin1.txt"),
                "--dry-run"
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0 and "latin-1 -> utf-8" in result.stdout:
                print("✅ FUNCIONA")
                self.results['cli_tests']['dry_run'] = 'passed'
                self.results['total_passed'] += 1
            else:
                print(f"❌ FALLO: {result.stderr}")
                self.results['cli_tests']['dry_run'] = 'failed'
                self.results['total_failed'] += 1
        except Exception as e:
            print(f"❌ ERROR: {e}")
            self.results['cli_tests']['dry_run'] = 'error'
            self.results['total_failed'] += 1
        
        # Probar normalización real
        print("  • Probando normalización: ", end="")
        try:
            test_file = self.temp_dir / "test_normalize.txt"
            test_file.write_text("Texto con acentos: áéíóú", encoding='latin-1')
            
            result = subprocess.run([
                sys.executable, "-m", "backend.src.cli",
                str(test_file)
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                # Verificar que se creó backup
                backup_file = test_file.with_suffix(test_file.suffix + ".bak")
                if backup_file.exists():
                    print("✅ FUNCIONA (backup creado)")
                    self.results['cli_tests']['normalize'] = 'passed'
                    self.results['total_passed'] += 1
                else:
                    print("❌ FALLO: No se creó backup")
                    self.results['cli_tests']['normalize'] = 'failed'
                    self.results['total_failed'] += 1
            else:
                print(f"❌ FALLO: {result.stderr}")
                self.results['cli_tests']['normalize'] = 'failed'
                self.results['total_failed'] += 1
        except Exception as e:
            print(f"❌ ERROR: {e}")
            self.results['cli_tests']['normalize'] = 'error'
            self.results['total_failed'] += 1
        
        # Probar --bom
        print("  • Probando --bom: ", end="")
        try:
            test_file = self.temp_dir / "test_bom.txt"
            test_file.write_text("Texto para BOM", encoding='utf-8')
            
            result = subprocess.run([
                sys.executable, "-m", "backend.src.cli",
                str(test_file), "--bom"
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                # Verificar que tiene BOM
                content = test_file.read_bytes()
                if content.startswith(b'\xef\xbb\xbf'):
                    print("✅ FUNCIONA (BOM agregado)")
                    self.results['cli_tests']['bom'] = 'passed'
                    self.results['total_passed'] += 1
                else:
                    print("❌ FALLO: BOM no agregado")
                    self.results['cli_tests']['bom'] = 'failed'
                    self.results['total_failed'] += 1
            else:
                print(f"❌ FALLO: {result.stderr}")
                self.results['cli_tests']['bom'] = 'failed'
                self.results['total_failed'] += 1
        except Exception as e:
            print(f"❌ ERROR: {e}")
            self.results['cli_tests']['bom'] = 'error'
            self.results['total_failed'] += 1
        
        # Probar --undo
        print("  • Probando --undo: ", end="")
        try:
            if (self.temp_dir / "test_normalize.txt.bak").exists():
                result = subprocess.run([
                    sys.executable, "-m", "backend.src.cli",
                    str(self.temp_dir / "test_normalize.txt"), "--undo"
                ], capture_output=True, text=True, timeout=10)
                
                if result.returncode == 0:
                    print("✅ FUNCIONA")
                    self.results['cli_tests']['undo'] = 'passed'
                    self.results['total_passed'] += 1
                else:
                    print(f"❌ FALLO: {result.stderr}")
                    self.results['cli_tests']['undo'] = 'failed'
                    self.results['total_failed'] += 1
            else:
                print("⚠️ SALTADO (no hay backup)")
                self.results['cli_tests']['undo'] = 'skipped'
        except Exception as e:
            print(f"❌ ERROR: {e}")
            self.results['cli_tests']['undo'] = 'error'
            self.results['total_failed'] += 1

    def test_automatic_integration(self):
        """Verifica que la normalización automática funcione en conversiones"""
        print("Probando integración automática...")
        
        # Crear archivo con encoding problemático
        problem_file = self.temp_dir / "test_integration.txt"
        problem_content = "Texto con acentos problemáticos: áéíóú ñÑ"
        problem_file.write_text(problem_content, encoding='latin-1')
        
        print("  • Probando normalización automática en conversión: ", end="")
        
        try:
            # Importar y usar directamente el motor de conversión
            sys.path.append('backend/src')
            from models.conversion import conversion_engine
            
            # Crear archivo de salida temporal
            output_file = self.temp_dir / "test_output.html"
            
            # Realizar conversión (debería normalizar automáticamente)
            success, message = conversion_engine.convert_file(
                str(problem_file), str(output_file), 'txt', 'html'
            )
            
            if success:
                # Verificar que se creó backup durante la normalización
                backup_file = problem_file.with_suffix(problem_file.suffix + ".bak")
                if backup_file.exists():
                    print("✅ FUNCIONA (normalización automática)")
                    self.results['integration_tests']['auto_normalize'] = 'passed'
                    self.results['total_passed'] += 1
                else:
                    print("⚠️ PARCIAL (conversión exitosa, pero sin backup)")
                    self.results['integration_tests']['auto_normalize'] = 'partial'
            else:
                print(f"❌ FALLO: {message}")
                self.results['integration_tests']['auto_normalize'] = 'failed'
                self.results['total_failed'] += 1
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
            self.results['integration_tests']['auto_normalize'] = 'error'
            self.results['total_failed'] += 1

    def test_encoding_logs(self):
        """Verifica que los logs de encoding se generen correctamente"""
        print("Analizando logs de encoding...")
        
        log_file = Path("backend/logs/encoding/encoding_normalizer.log")
        
        print(f"  • Verificando existencia de log: ", end="")
        if log_file.exists():
            print("✅ EXISTE")
            self.results['log_validation']['exists'] = True
            
            # Leer y analizar contenido del log
            print(f"  • Analizando contenido del log: ", end="")
            try:
                with open(log_file, 'r', encoding='utf-8') as f:
                    log_lines = f.readlines()
                
                if log_lines:
                    print(f"✅ {len(log_lines)} entradas")
                    
                    # Analizar última entrada
                    try:
                        last_entry = json.loads(log_lines[-1].strip())
                        print(f"  • Última entrada: {last_entry.get('from')} → {last_entry.get('to')}")
                        self.results['log_validation']['last_entry'] = last_entry
                        self.results['total_passed'] += 1
                    except json.JSONDecodeError:
                        print("  ❌ Formato JSON inválido en log")
                        self.results['total_failed'] += 1
                else:
                    print("⚠️ VACÍO")
                    self.results['log_validation']['empty'] = True
                    
            except Exception as e:
                print(f"❌ ERROR leyendo log: {e}")
                self.results['total_failed'] += 1
        else:
            print("❌ NO EXISTE")
            self.results['log_validation']['exists'] = False
            self.results['total_failed'] += 1

    def test_edge_cases(self):
        """Prueba casos edge que pueden causar 'Bad magic number'"""
        print("Probando casos edge...")
        
        # Caso 1: Archivo con BOM UTF-16
        print("  • Archivo UTF-16 con BOM: ", end="")
        try:
            utf16_file = self.temp_dir / "test_utf16.txt"
            utf16_file.write_text("Texto UTF-16 problemático: áéíóú", encoding='utf-16')
            
            # Intentar normalizar
            sys.path.append('backend/src')
            from encoding_normalizer import normalize_to_utf8
            
            result = normalize_to_utf8(utf16_file)
            
            # Verificar que se normalizó correctamente
            normalized_content = utf16_file.read_text(encoding='utf-8')
            if "áéíóú" in normalized_content:
                print("✅ NORMALIZADO")
                self.results['edge_cases']['utf16_bom'] = 'passed'
                self.results['total_passed'] += 1
            else:
                print("❌ CONTENIDO CORRUPTO")
                self.results['edge_cases']['utf16_bom'] = 'failed'
                self.results['total_failed'] += 1
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
            self.results['edge_cases']['utf16_bom'] = 'error'
            self.results['total_failed'] += 1
        
        # Caso 2: Archivo con mojibake
        print("  • Archivo con mojibake: ", end="")
        try:
            mojibake_file = self.temp_dir / "test_mojibake.txt"
            # Simular mojibake común
            mojibake_content = "Texto con mojibake: Ã¡Ã©Ã­Ã³Ãº"
            mojibake_file.write_text(mojibake_content, encoding='utf-8')
            
            # Intentar reparar
            from encoding_normalizer import repair_mojibake
            repaired = repair_mojibake(mojibake_content)
            
            if repaired != mojibake_content:
                print("✅ REPARADO")
                self.results['edge_cases']['mojibake'] = 'passed'
                self.results['total_passed'] += 1
            else:
                print("⚠️ NO DETECTADO")
                self.results['edge_cases']['mojibake'] = 'not_detected'
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
            self.results['edge_cases']['mojibake'] = 'error'
            self.results['total_failed'] += 1
        
        # Caso 3: Archivo binario (debería fallar graciosamente)
        print("  • Archivo binario: ", end="")
        try:
            binary_file = self.temp_dir / "test_binary.txt"
            binary_file.write_bytes(b'\x00\x01\x02\x03\xff\xfe\xfd\xfc')
            
            from encoding_normalizer import detect_encoding
            detected = detect_encoding(binary_file.read_bytes())
            
            print(f"✅ DETECTADO COMO: {detected}")
            self.results['edge_cases']['binary'] = f'detected_as_{detected}'
            self.results['total_passed'] += 1
            
        except Exception as e:
            print(f"❌ ERROR: {e}")
            self.results['edge_cases']['binary'] = 'error'
            self.results['total_failed'] += 1

    def generate_encoding_report(self):
        """Genera reporte final de validación de encoding"""
        print("\n" + "="*60)
        print("📊 REPORTE FINAL - VALIDACIÓN DE ENCODING UTF-8")
        print("="*60)
        
        total_tests = self.results['total_passed'] + self.results['total_failed']
        success_rate = (self.results['total_passed'] / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n📈 ESTADÍSTICAS GENERALES:")
        print(f"   Total de pruebas: {total_tests}")
        print(f"   Exitosas: {self.results['total_passed']}")
        print(f"   Fallidas: {self.results['total_failed']}")
        print(f"   Tasa de éxito: {success_rate:.1f}%")
        
        # Detalles por categoría
        print(f"\n🖥️ PRUEBAS CLI:")
        for test, status in self.results['cli_tests'].items():
            icon = "✅" if status == 'passed' else "❌" if status == 'failed' else "⚠️"
            print(f"   {icon} {test}: {status}")
        
        print(f"\n🔄 INTEGRACIÓN AUTOMÁTICA:")
        for test, status in self.results['integration_tests'].items():
            icon = "✅" if status == 'passed' else "❌" if status == 'failed' else "⚠️"
            print(f"   {icon} {test}: {status}")
        
        print(f"\n⚠️ CASOS EDGE:")
        for test, status in self.results['edge_cases'].items():
            icon = "✅" if status == 'passed' else "❌" if status == 'failed' else "⚠️"
            print(f"   {icon} {test}: {status}")
        
        print(f"\n📋 VALIDACIÓN DE LOGS:")
        for test, status in self.results['log_validation'].items():
            icon = "✅" if status else "❌"
            print(f"   {icon} {test}: {status}")
        
        # Recomendaciones
        print(f"\n💡 RECOMENDACIONES:")
        if success_rate >= 80:
            print("   • Sistema de encoding funcionando correctamente")
            print("   • Continuar con pruebas de conversión completas")
        else:
            print("   • Revisar fallos en normalización")
            print("   • Verificar instalación de chardet")
            print("   • Comprobar permisos de archivos")
        
        # Guardar reporte
        report_file = "encoding_validation_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Reporte guardado en: {report_file}")

def main():
    """Función principal"""
    tester = EncodingValidationTester()
    tester.run_comprehensive_encoding_tests()

if __name__ == "__main__":
    main()
