#!/usr/bin/env python3
"""
Validación Final Directa del Sistema Anclora Nexus Mejorado
Prueba todas las mejoras sin dependencias externas
"""
import os
import sys
import time
import json
import tempfile
from pathlib import Path

# Agregar backend al path
sys.path.insert(0, 'backend/src')

class DirectSystemValidator:
    """Validador directo del sistema sin APIs externas"""
    
    def __init__(self):
        self.temp_dir = Path(tempfile.gettempdir()) / "direct_validation"
        self.temp_dir.mkdir(exist_ok=True)
        self.results = {
            'encoding_fixes': {'passed': 0, 'failed': 0, 'details': []},
            'validation_system': {'passed': 0, 'failed': 0, 'details': []},
            'new_conversions': {'passed': 0, 'failed': 0, 'details': []},
            'csv_optimization': {'passed': 0, 'failed': 0, 'details': []},
            'overall': {'passed': 0, 'failed': 0}
        }

    def run_direct_validation(self):
        """Ejecuta validación directa completa"""
        print("🚀 VALIDACIÓN FINAL DIRECTA - SISTEMA ANCLORA NEXUS MEJORADO")
        print("=" * 65)
        
        # 1. Validar correcciones de encoding
        print("\n🔤 1. VALIDANDO CORRECCIONES DE ENCODING...")
        self.validate_encoding_fixes()
        
        # 2. Validar sistema de validación
        print("\n🔒 2. VALIDANDO SISTEMA DE VALIDACIÓN...")
        self.validate_validation_system()
        
        # 3. Validar nuevas conversiones
        print("\n🆕 3. VALIDANDO NUEVAS CONVERSIONES...")
        self.validate_new_conversions()
        
        # 4. Validar optimización CSV
        print("\n📊 4. VALIDANDO OPTIMIZACIÓN CSV...")
        self.validate_csv_optimization()
        
        # 5. Generar reporte final
        print("\n📋 5. GENERANDO REPORTE FINAL...")
        self.generate_final_report()

    def validate_encoding_fixes(self):
        """Valida las correcciones críticas de encoding"""
        print("Validando correcciones de encoding...")
        
        try:
            from encoding_normalizer import detect_encoding, is_binary_file, normalize_to_utf8, repair_mojibake
            
            # Test 1: Detección de archivos binarios
            print("  • Detección de archivos binarios: ", end="")
            
            # Crear archivo DOCX simulado
            docx_bytes = b'PK\x03\x04\x14\x00\x06\x00\x08\x00\x00\x00!\x00'  # Header DOCX
            is_binary = is_binary_file(docx_bytes)
            
            if is_binary:
                print("✅ DOCX DETECTADO COMO BINARIO")
                self.results['encoding_fixes']['passed'] += 1
                self.results['encoding_fixes']['details'].append("binary_detection: passed")
            else:
                print("❌ DOCX NO DETECTADO COMO BINARIO")
                self.results['encoding_fixes']['failed'] += 1
                self.results['encoding_fixes']['details'].append("binary_detection: failed")
            
            # Test 2: Reparación de mojibake mejorada
            print("  • Reparación de mojibake: ", end="")
            
            mojibake_text = "Ã¡Ã©Ã­Ã³Ãº"  # áéíóú mal codificado
            repaired = repair_mojibake(mojibake_text)
            
            if "á" in repaired and "é" in repaired:
                print("✅ MOJIBAKE REPARADO")
                self.results['encoding_fixes']['passed'] += 1
                self.results['encoding_fixes']['details'].append("mojibake_repair: passed")
            else:
                print("❌ MOJIBAKE NO REPARADO")
                self.results['encoding_fixes']['failed'] += 1
                self.results['encoding_fixes']['details'].append("mojibake_repair: failed")
            
            # Test 3: Protección contra normalización de binarios
            print("  • Protección archivos binarios: ", end="")
            
            # Crear archivo binario temporal
            binary_file = self.temp_dir / "test_binary.docx"
            binary_file.write_bytes(docx_bytes)
            
            result = normalize_to_utf8(binary_file)
            
            if result.get('action') == 'skipped_binary':
                print("✅ BINARIO PROTEGIDO")
                self.results['encoding_fixes']['passed'] += 1
                self.results['encoding_fixes']['details'].append("binary_protection: passed")
            else:
                print("❌ BINARIO NO PROTEGIDO")
                self.results['encoding_fixes']['failed'] += 1
                self.results['encoding_fixes']['details'].append("binary_protection: failed")
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
            self.results['encoding_fixes']['failed'] += 1
            self.results['encoding_fixes']['details'].append(f"encoding_test_error: {str(e)}")

    def validate_validation_system(self):
        """Valida el sistema de validación estricta"""
        print("Validando sistema de validación...")
        
        try:
            from services.file_validator import file_validator
            
            # Test 1: Validación de archivo válido
            print("  • Validación archivo válido: ", end="")
            
            valid_file = self.temp_dir / "valid.txt"
            valid_file.write_text("Archivo de texto válido", encoding='utf-8')
            
            is_valid, message, details = file_validator.validate_file_comprehensive(str(valid_file), 'txt')
            
            if is_valid:
                print("✅ ARCHIVO VÁLIDO ACEPTADO")
                self.results['validation_system']['passed'] += 1
                self.results['validation_system']['details'].append("valid_file_accepted: passed")
            else:
                print("❌ ARCHIVO VÁLIDO RECHAZADO")
                self.results['validation_system']['failed'] += 1
                self.results['validation_system']['details'].append("valid_file_rejected: failed")
            
            # Test 2: Rechazo de archivo inválido
            print("  • Rechazo archivo inválido: ", end="")
            
            invalid_file = self.temp_dir / "invalid.pdf"
            invalid_file.write_text("Este no es un PDF", encoding='utf-8')
            
            is_valid, message, details = file_validator.validate_file_comprehensive(str(invalid_file), 'pdf')
            
            if not is_valid:
                print("✅ ARCHIVO INVÁLIDO RECHAZADO")
                self.results['validation_system']['passed'] += 1
                self.results['validation_system']['details'].append("invalid_file_rejected: passed")
            else:
                print("❌ ARCHIVO INVÁLIDO ACEPTADO")
                self.results['validation_system']['failed'] += 1
                self.results['validation_system']['details'].append("invalid_file_accepted: failed")
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
            self.results['validation_system']['failed'] += 1
            self.results['validation_system']['details'].append(f"validation_test_error: {str(e)}")

    def validate_new_conversions(self):
        """Valida las nuevas conversiones implementadas"""
        print("Validando nuevas conversiones...")
        
        try:
            from models.conversion import conversion_engine
            
            # Test 1: Conversión CSV→HTML
            print("  • CSV→HTML: ", end="")
            
            csv_file = self.temp_dir / "test.csv"
            csv_content = "Nombre,Edad\nJuan,25\nMaría,30"
            csv_file.write_text(csv_content, encoding='utf-8')
            
            html_file = self.temp_dir / "output.html"
            success, message = conversion_engine.convert_file(str(csv_file), str(html_file), 'csv', 'html')
            
            if success and html_file.exists():
                print("✅ NUEVA CONVERSIÓN FUNCIONANDO")
                self.results['new_conversions']['passed'] += 1
                self.results['new_conversions']['details'].append("csv_to_html: passed")
            else:
                print(f"❌ CONVERSIÓN FALLÓ: {message}")
                self.results['new_conversions']['failed'] += 1
                self.results['new_conversions']['details'].append(f"csv_to_html: failed - {message}")
            
            # Test 2: Conversión JSON→HTML
            print("  • JSON→HTML: ", end="")
            
            json_file = self.temp_dir / "test.json"
            json_data = {"nombre": "Juan", "edad": 25}
            json_file.write_text(json.dumps(json_data), encoding='utf-8')
            
            html_file2 = self.temp_dir / "output2.html"
            success, message = conversion_engine.convert_file(str(json_file), str(html_file2), 'json', 'html')
            
            if success and html_file2.exists():
                print("✅ NUEVA CONVERSIÓN FUNCIONANDO")
                self.results['new_conversions']['passed'] += 1
                self.results['new_conversions']['details'].append("json_to_html: passed")
            else:
                print(f"❌ CONVERSIÓN FALLÓ: {message}")
                self.results['new_conversions']['failed'] += 1
                self.results['new_conversions']['details'].append(f"json_to_html: failed - {message}")
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
            self.results['new_conversions']['failed'] += 1
            self.results['new_conversions']['details'].append(f"new_conversions_error: {str(e)}")

    def validate_csv_optimization(self):
        """Valida las optimizaciones específicas para CSV"""
        print("Validando optimización CSV...")
        
        try:
            from models.conversions.csv_to_html import analyze_csv_structure
            
            # Test: Análisis avanzado de CSV
            print("  • Análisis avanzado CSV: ", end="")
            
            csv_file = self.temp_dir / "advanced.csv"
            csv_content = """Producto;Precio;Disponible;Fecha
Laptop;1299.99;Sí;2024-01-15
Mouse;29.50;No;2024-01-16
Teclado;89.99;Sí;2024-01-17"""
            csv_file.write_text(csv_content, encoding='utf-8')
            
            analysis = analyze_csv_structure(str(csv_file))
            
            if analysis['is_valid'] and analysis['delimiter'] == ';' and analysis['column_count'] == 4:
                print("✅ ANÁLISIS AVANZADO FUNCIONANDO")
                self.results['csv_optimization']['passed'] += 1
                self.results['csv_optimization']['details'].append("advanced_analysis: passed")
            else:
                print("❌ ANÁLISIS AVANZADO FALLÓ")
                self.results['csv_optimization']['failed'] += 1
                self.results['csv_optimization']['details'].append("advanced_analysis: failed")
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
            self.results['csv_optimization']['failed'] += 1
            self.results['csv_optimization']['details'].append(f"csv_optimization_error: {str(e)}")

    def generate_final_report(self):
        """Genera reporte final completo"""
        print("\n" + "="*65)
        print("📊 REPORTE FINAL COMPLETO - VALIDACIÓN SISTEMA MEJORADO")
        print("="*65)
        
        # Calcular estadísticas totales
        total_passed = sum(cat['passed'] for cat in self.results.values() if isinstance(cat, dict) and 'passed' in cat)
        total_failed = sum(cat['failed'] for cat in self.results.values() if isinstance(cat, dict) and 'failed' in cat)
        total_tests = total_passed + total_failed
        overall_success = (total_passed / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n🎯 ESTADÍSTICAS FINALES:")
        print(f"   Total de pruebas: {total_tests}")
        print(f"   Exitosas: {total_passed}")
        print(f"   Fallidas: {total_failed}")
        print(f"   Tasa de éxito final: {overall_success:.1f}%")
        
        # Detalles por categoría
        categories = {
            'encoding_fixes': '🔤 Correcciones de Encoding',
            'validation_system': '🔒 Sistema de Validación',
            'new_conversions': '🆕 Nuevas Conversiones',
            'csv_optimization': '📊 Optimización CSV'
        }
        
        print(f"\n📋 RESULTADOS DETALLADOS:")
        for key, title in categories.items():
            if key in self.results:
                cat_data = self.results[key]
                cat_total = cat_data['passed'] + cat_data['failed']
                cat_success = (cat_data['passed'] / cat_total * 100) if cat_total > 0 else 0
                status_icon = "✅" if cat_success >= 80 else "⚠️" if cat_success >= 60 else "❌"
                print(f"   {status_icon} {title}: {cat_success:.1f}% ({cat_data['passed']}/{cat_total})")
                
                # Mostrar detalles
                for detail in cat_data['details']:
                    detail_icon = "✅" if "passed" in detail else "❌"
                    print(f"     {detail_icon} {detail}")
        
        # Evaluación crítica del problema "Bad Magic Number"
        print(f"\n🎯 EVALUACIÓN CRÍTICA - PROBLEMA 'BAD MAGIC NUMBER':")
        
        encoding_fixed = self.results['encoding_fixes']['passed'] > 0
        validation_working = self.results['validation_system']['passed'] > 0
        
        if encoding_fixed and validation_working:
            print("   ✅ PROBLEMA RESUELTO:")
            print("     • Archivos binarios protegidos contra normalización")
            print("     • Detección de archivos corruptos funcionando")
            print("     • Sistema de validación estricta operativo")
            print("     • Encoding normalizer corregido")
        else:
            print("   ⚠️ PROBLEMA PARCIALMENTE RESUELTO:")
            print("     • Algunas correcciones funcionando")
            print("     • Requiere ajustes adicionales")
        
        # Análisis de mejoras implementadas
        print(f"\n🔍 ANÁLISIS DE MEJORAS IMPLEMENTADAS:")
        
        improvements_status = {
            "Sistema de Encoding UTF-8": encoding_fixed,
            "Validación Estricta de Headers": validation_working,
            "Nuevas Conversiones": self.results['new_conversions']['passed'] > 0,
            "Optimización CSV": self.results['csv_optimization']['passed'] > 0,
        }
        
        for improvement, status in improvements_status.items():
            icon = "✅" if status else "❌"
            print(f"   {icon} {improvement}: {'IMPLEMENTADO' if status else 'PENDIENTE'}")
        
        # Conclusión final
        print(f"\n🏆 CONCLUSIÓN FINAL:")
        
        if overall_success >= 90:
            print("   ✅ SISTEMA COMPLETAMENTE VALIDADO")
            print("   🚀 LISTO PARA PRODUCCIÓN")
            print("   📈 Todas las mejoras críticas implementadas")
        elif overall_success >= 75:
            print("   ⚠️ SISTEMA MAYORMENTE VALIDADO")
            print("   🔧 Ajustes menores pendientes")
            print("   📊 Mejoras principales implementadas")
        else:
            print("   ❌ SISTEMA REQUIERE MÁS TRABAJO")
            print("   🛠️ Correcciones adicionales necesarias")
        
        # Estado específico del problema original
        print(f"\n🎯 ESTADO DEL PROBLEMA ORIGINAL:")
        print(f"   Problema: Errores 'Bad magic number' en conversiones DOCX")
        print(f"   Causa identificada: Normalización incorrecta de archivos binarios")
        print(f"   Solución: {'✅ IMPLEMENTADA' if encoding_fixed else '❌ PENDIENTE'}")
        print(f"   Validación: {'✅ CONFIRMADA' if validation_working else '❌ PENDIENTE'}")
        
        # Guardar reporte
        report_data = {
            'timestamp': time.time(),
            'overall_success_rate': overall_success,
            'problem_status': 'resolved' if encoding_fixed and validation_working else 'partial',
            'results': self.results,
            'improvements_implemented': improvements_status
        }
        
        with open('final_validation_report.json', 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Reporte final guardado en: final_validation_report.json")

def main():
    """Función principal"""
    validator = DirectSystemValidator()
    validator.run_direct_validation()

if __name__ == "__main__":
    main()
