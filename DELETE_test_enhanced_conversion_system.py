#!/usr/bin/env python3
"""
Suite de Pruebas Exhaustiva para Sistema de Conversión Mejorado
Valida todas las nuevas funcionalidades y mejoras implementadas
"""
import os
import sys
import time
import json
import requests
import tempfile
from pathlib import Path

# Configuración del servidor
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

class EnhancedConversionTester:
    """Tester para el sistema de conversión mejorado"""
    
    def __init__(self):
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'conversions': {},
            'new_formats': {},
            'credit_system': {},
            'pandoc_integration': {},
            'performance': {}
        }
        
        # Nuevos formatos a probar
        self.new_formats_tests = [
            ('rtf', 'docx'), ('epub', 'html'), ('csv', 'html'), 
            ('json', 'html'), ('webp', 'jpg'), ('tiff', 'jpg'),
            ('odt', 'pdf'), ('rst', 'html')
        ]
        
        # Conversiones problemáticas a re-probar
        self.fixed_conversions = [
            ('docx', 'pdf'), ('docx', 'html'), ('docx', 'txt'),
            ('html', 'pdf')  # Unicode fix
        ]

    def run_comprehensive_tests(self):
        """Ejecuta suite completa de pruebas"""
        print("🚀 INICIANDO PRUEBAS EXHAUSTIVAS DEL SISTEMA MEJORADO")
        print("=" * 60)
        
        # 1. Probar conversiones corregidas
        print("\n📋 1. PROBANDO CONVERSIONES CORREGIDAS...")
        self.test_fixed_conversions()
        
        # 2. Probar nuevos formatos
        print("\n🆕 2. PROBANDO NUEVOS FORMATOS...")
        self.test_new_formats()
        
        # 3. Probar sistema de créditos
        print("\n💰 3. PROBANDO SISTEMA DE CRÉDITOS...")
        self.test_credit_system()
        
        # 4. Probar integración Pandoc
        print("\n🔧 4. PROBANDO INTEGRACIÓN PANDOC...")
        self.test_pandoc_integration()
        
        # 5. Pruebas de rendimiento
        print("\n⚡ 5. PRUEBAS DE RENDIMIENTO...")
        self.test_performance()
        
        # 6. Generar reporte final
        print("\n📊 6. GENERANDO REPORTE FINAL...")
        self.generate_final_report()

    def test_fixed_conversions(self):
        """Prueba las conversiones que fueron corregidas"""
        print("Probando conversiones corregidas...")
        
        for source_ext, target_ext in self.fixed_conversions:
            print(f"  • {source_ext.upper()} → {target_ext.upper()}: ", end="")
            
            try:
                # Crear archivo de prueba
                test_file = self.create_test_file(source_ext)
                
                # Realizar conversión
                success, result = self.test_conversion(test_file, source_ext, target_ext)
                
                if success:
                    print("✅ CORREGIDO")
                    self.results['passed'] += 1
                else:
                    print(f"❌ FALLO: {result}")
                    self.results['failed'] += 1
                
                self.results['conversions'][f"{source_ext}→{target_ext}"] = {
                    'status': 'passed' if success else 'failed',
                    'message': result
                }
                
                # Limpiar archivo temporal
                if os.path.exists(test_file):
                    os.remove(test_file)
                    
            except Exception as e:
                print(f"❌ ERROR: {str(e)}")
                self.results['failed'] += 1
            
            self.results['total_tests'] += 1

    def test_new_formats(self):
        """Prueba los nuevos formatos implementados"""
        print("Probando nuevos formatos...")
        
        for source_ext, target_ext in self.new_formats_tests:
            print(f"  • {source_ext.upper()} → {target_ext.upper()}: ", end="")
            
            try:
                # Crear archivo de prueba
                test_file = self.create_test_file(source_ext)
                
                # Realizar conversión
                success, result = self.test_conversion(test_file, source_ext, target_ext)
                
                if success:
                    print("✅ NUEVO FORMATO")
                    self.results['passed'] += 1
                else:
                    print(f"❌ FALLO: {result}")
                    self.results['failed'] += 1
                
                self.results['new_formats'][f"{source_ext}→{target_ext}"] = {
                    'status': 'passed' if success else 'failed',
                    'message': result
                }
                
                # Limpiar archivo temporal
                if os.path.exists(test_file):
                    os.remove(test_file)
                    
            except Exception as e:
                print(f"❌ ERROR: {str(e)}")
                self.results['failed'] += 1
            
            self.results['total_tests'] += 1

    def test_credit_system(self):
        """Prueba el sistema de créditos mejorado"""
        print("Probando sistema de créditos...")
        
        test_cases = [
            ('txt', 'pdf', 1024, 'standard'),      # Conversión básica
            ('docx', 'pdf', 5*1024*1024, 'high'),  # Conversión estándar con calidad alta
            ('epub', 'html', 50*1024*1024, 'standard'), # Conversión avanzada archivo grande
        ]
        
        for source, target, file_size, quality in test_cases:
            print(f"  • Calculando créditos {source.upper()}→{target.upper()}: ", end="")
            
            try:
                # Probar endpoint de estimación de créditos
                response = requests.post(f"{API_BASE}/conversion/estimate", json={
                    'source_format': source,
                    'target_format': target,
                    'file_size': file_size,
                    'quality': quality
                })
                
                if response.status_code == 200:
                    data = response.json()
                    credits = data.get('credits_required', 0)
                    print(f"✅ {credits} créditos")
                    
                    self.results['credit_system'][f"{source}→{target}"] = {
                        'credits': credits,
                        'file_size_mb': round(file_size / (1024*1024), 2),
                        'quality': quality,
                        'details': data.get('calculation_details', {})
                    }
                else:
                    print(f"❌ Error HTTP {response.status_code}")
                    self.results['failed'] += 1
                    
            except Exception as e:
                print(f"❌ ERROR: {str(e)}")
                self.results['failed'] += 1
            
            self.results['total_tests'] += 1

    def test_pandoc_integration(self):
        """Prueba la integración con Pandoc"""
        print("Probando integración Pandoc...")
        
        # Verificar si Pandoc está disponible
        try:
            response = requests.get(f"{API_BASE}/system/pandoc-status")
            if response.status_code == 200:
                pandoc_status = response.json()
                print(f"  • Estado Pandoc: {'✅ Disponible' if pandoc_status.get('available') else '❌ No disponible'}")
                
                if pandoc_status.get('version'):
                    print(f"  • Versión: {pandoc_status['version']}")
                
                self.results['pandoc_integration']['status'] = pandoc_status
            else:
                print("  • ❌ No se pudo verificar estado de Pandoc")
                
        except Exception as e:
            print(f"  • ❌ Error verificando Pandoc: {str(e)}")

    def test_performance(self):
        """Prueba el rendimiento del sistema"""
        print("Probando rendimiento...")
        
        # Probar conversión rápida
        start_time = time.time()
        test_file = self.create_test_file('txt')
        success, result = self.test_conversion(test_file, 'txt', 'html')
        end_time = time.time()
        
        processing_time = end_time - start_time
        print(f"  • Conversión TXT→HTML: {processing_time:.2f}s")
        
        self.results['performance']['txt_to_html'] = {
            'time_seconds': round(processing_time, 2),
            'success': success
        }
        
        # Limpiar
        if os.path.exists(test_file):
            os.remove(test_file)

    def create_test_file(self, extension):
        """Crea archivos de prueba para diferentes formatos"""
        temp_dir = tempfile.gettempdir()
        
        if extension == 'txt':
            file_path = os.path.join(temp_dir, f"test_enhanced.{extension}")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write("Documento de prueba mejorado\n\nEste es un archivo de prueba para el sistema mejorado de Anclora Nexus.\n\nCaracterísticas:\n- Soporte Unicode: áéíóú ñ\n- Emojis: 🚀 📄 ✅\n- Caracteres especiales: 'quotes' apostrophes –dashes—")
        
        elif extension == 'csv':
            file_path = os.path.join(temp_dir, f"test_enhanced.{extension}")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write("Nombre,Edad,Ciudad,Puntuación\n")
                f.write("Juan Pérez,25,Madrid,95.5\n")
                f.write("María García,30,Barcelona,87.2\n")
                f.write("José López,28,Valencia,92.1\n")
        
        elif extension == 'json':
            file_path = os.path.join(temp_dir, f"test_enhanced.{extension}")
            data = {
                "título": "Datos de Prueba",
                "descripción": "Archivo JSON para pruebas del sistema mejorado",
                "usuarios": [
                    {"nombre": "Ana", "edad": 25, "activo": True},
                    {"nombre": "Carlos", "edad": 30, "activo": False}
                ],
                "configuración": {
                    "idioma": "es",
                    "zona_horaria": "Europe/Madrid",
                    "características": ["unicode", "emojis", "acentos"]
                }
            }
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        
        elif extension == 'html':
            file_path = os.path.join(temp_dir, f"test_enhanced.{extension}")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write("""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Documento de Prueba Mejorado</title>
</head>
<body>
    <h1>Sistema Anclora Nexus Mejorado</h1>
    <p>Este documento contiene caracteres especiales: áéíóú ñ</p>
    <p>Y emojis: 🚀 📄 ✅ 游戏</p>
    <ul>
        <li>Soporte Unicode completo</li>
        <li>Integración Pandoc</li>
        <li>Sistema de créditos avanzado</li>
    </ul>
</body>
</html>""")
        
        else:
            # Para otros formatos, crear archivo TXT básico
            file_path = os.path.join(temp_dir, f"test_enhanced.txt")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write("Archivo de prueba básico para formato no implementado")
        
        return file_path

    def test_conversion(self, input_file, source_ext, target_ext):
        """Prueba una conversión específica"""
        try:
            # Preparar archivo para upload
            with open(input_file, 'rb') as f:
                files = {'file': (f"test.{source_ext}", f, 'application/octet-stream')}
                data = {'target_format': target_ext}
                
                # Realizar conversión
                response = requests.post(f"{API_BASE}/conversion/guest-convert", 
                                       files=files, data=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    # Probar descarga
                    download_id = result.get('download_id')
                    if download_id:
                        download_response = requests.get(
                            f"{API_BASE}/conversion/guest-download/{download_id}",
                            timeout=10
                        )
                        if download_response.status_code == 200:
                            return True, "Conversión y descarga exitosas"
                        else:
                            return False, f"Error en descarga: {download_response.status_code}"
                    else:
                        return False, "No se recibió download_id"
                else:
                    return False, result.get('message', 'Error desconocido')
            else:
                return False, f"Error HTTP {response.status_code}"
                
        except requests.exceptions.Timeout:
            return False, "Timeout en conversión"
        except Exception as e:
            return False, f"Error: {str(e)}"

    def generate_final_report(self):
        """Genera reporte final completo"""
        print("\n" + "="*60)
        print("📊 REPORTE FINAL DEL SISTEMA MEJORADO")
        print("="*60)
        
        # Estadísticas generales
        total = self.results['total_tests']
        passed = self.results['passed']
        failed = self.results['failed']
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"\n📈 ESTADÍSTICAS GENERALES:")
        print(f"   Total de pruebas: {total}")
        print(f"   Exitosas: {passed}")
        print(f"   Fallidas: {failed}")
        print(f"   Tasa de éxito: {success_rate:.1f}%")
        
        # Objetivo de 90%+ alcanzado?
        if success_rate >= 90:
            print(f"   🎯 ¡OBJETIVO ALCANZADO! Tasa de éxito ≥ 90%")
        else:
            print(f"   ⚠️ Objetivo pendiente: {90 - success_rate:.1f}% para alcanzar 90%")
        
        # Detalles por categoría
        print(f"\n🔧 CONVERSIONES CORREGIDAS:")
        for conversion, details in self.results['conversions'].items():
            status_icon = "✅" if details['status'] == 'passed' else "❌"
            print(f"   {status_icon} {conversion}: {details['message']}")
        
        print(f"\n🆕 NUEVOS FORMATOS:")
        for conversion, details in self.results['new_formats'].items():
            status_icon = "✅" if details['status'] == 'passed' else "❌"
            print(f"   {status_icon} {conversion}: {details['message']}")
        
        # Recomendaciones finales
        print(f"\n💡 RECOMENDACIONES:")
        if success_rate >= 90:
            print("   • Sistema listo para producción")
            print("   • Implementar monitoreo continuo")
            print("   • Considerar expansión a más formatos")
        else:
            print("   • Revisar conversiones fallidas")
            print("   • Implementar más validaciones")
            print("   • Considerar fallbacks adicionales")
        
        # Guardar reporte en archivo
        report_data = {
            'timestamp': time.time(),
            'success_rate': success_rate,
            'results': self.results
        }
        
        with open('enhanced_system_test_report.json', 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Reporte guardado en: enhanced_system_test_report.json")

def main():
    """Función principal"""
    print("🔍 Verificando que el servidor esté ejecutándose...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code != 200:
            print("❌ Error: El servidor no está respondiendo correctamente")
            return
    except:
        print("❌ Error: No se puede conectar al servidor en http://localhost:5000")
        print("   Asegúrate de que el backend esté ejecutándose")
        return
    
    print("✅ Servidor detectado. Iniciando pruebas...")
    
    # Ejecutar pruebas
    tester = EnhancedConversionTester()
    tester.run_comprehensive_tests()

if __name__ == "__main__":
    main()
