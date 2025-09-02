#!/usr/bin/env python3
"""
Sistema integral de testing para Anclora Nexus
Ejecuta todos los tests y genera reportes completos
"""

import os
import sys
import json
import time
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# Rutas base
BASE_DIR = Path(__file__).parent.parent
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"
REPORTS_DIR = BASE_DIR / "test_reports"

class TestRunner:
    """Ejecutor integral de tests"""
    
    def __init__(self):
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'backend': {},
            'frontend': {},
            'integration': {},
            'summary': {}
        }
        
        # Crear directorio de reportes
        REPORTS_DIR.mkdir(exist_ok=True)
    
    def run_backend_tests(self) -> Dict[str, Any]:
        """Ejecutar tests del backend"""
        print("🧪 Ejecutando tests del backend...")
        
        os.chdir(BACKEND_DIR)
        
        # Tests unitarios
        print("  📋 Tests unitarios...")
        unit_result = self._run_pytest("tests/unit", "backend_unit")
        
        # Tests de integración
        print("  🔗 Tests de integración...")
        integration_result = self._run_pytest("tests/integration", "backend_integration")
        
        # Tests de conversión integral
        print("  🔄 Tests de conversión integral...")
        conversion_result = self._run_pytest("tests/integration/test_comprehensive_conversion.py", "backend_conversion")
        
        backend_results = {
            'unit': unit_result,
            'integration': integration_result,
            'conversion': conversion_result,
            'total_time': unit_result['time'] + integration_result['time'] + conversion_result['time'],
            'total_tests': unit_result['tests'] + integration_result['tests'] + conversion_result['tests'],
            'total_passed': unit_result['passed'] + integration_result['passed'] + conversion_result['passed'],
            'total_failed': unit_result['failed'] + integration_result['failed'] + conversion_result['failed']
        }
        
        backend_results['success_rate'] = (
            backend_results['total_passed'] / backend_results['total_tests'] * 100
            if backend_results['total_tests'] > 0 else 0
        )
        
        return backend_results
    
    def run_frontend_tests(self) -> Dict[str, Any]:
        """Ejecutar tests del frontend"""
        print("🎨 Ejecutando tests del frontend...")
        
        os.chdir(FRONTEND_DIR)
        
        # Tests unitarios con Vitest
        print("  📋 Tests unitarios...")
        unit_result = self._run_vitest("run", "frontend_unit")
        
        # Tests de componentes
        print("  🧩 Tests de componentes...")
        component_result = self._run_vitest("run src/components/__tests__", "frontend_components")
        
        # Tests de accesibilidad
        print("  ♿ Tests de accesibilidad...")
        a11y_result = self._run_vitest("run --config vitest.a11y.config.ts", "frontend_a11y")
        
        frontend_results = {
            'unit': unit_result,
            'components': component_result,
            'accessibility': a11y_result,
            'total_time': unit_result['time'] + component_result['time'] + a11y_result['time'],
            'total_tests': unit_result['tests'] + component_result['tests'] + a11y_result['tests'],
            'total_passed': unit_result['passed'] + component_result['passed'] + a11y_result['passed'],
            'total_failed': unit_result['failed'] + component_result['failed'] + a11y_result['failed']
        }
        
        frontend_results['success_rate'] = (
            frontend_results['total_passed'] / frontend_results['total_tests'] * 100
            if frontend_results['total_tests'] > 0 else 0
        )
        
        return frontend_results
    
    def run_integration_tests(self) -> Dict[str, Any]:
        """Ejecutar tests de integración completa"""
        print("🔗 Ejecutando tests de integración completa...")
        
        # Tests end-to-end (simulados por ahora)
        e2e_result = {
            'tests': 0,
            'passed': 0,
            'failed': 0,
            'time': 0,
            'details': "E2E tests no implementados aún"
        }
        
        # Tests de carga de archivos reales
        print("  📁 Tests con archivos reales...")
        file_test_result = self._run_file_tests()
        
        integration_results = {
            'e2e': e2e_result,
            'file_tests': file_test_result,
            'total_time': e2e_result['time'] + file_test_result['time'],
            'total_tests': e2e_result['tests'] + file_test_result['tests'],
            'total_passed': e2e_result['passed'] + file_test_result['passed'],
            'total_failed': e2e_result['failed'] + file_test_result['failed']
        }
        
        integration_results['success_rate'] = (
            integration_results['total_passed'] / integration_results['total_tests'] * 100
            if integration_results['total_tests'] > 0 else 0
        )
        
        return integration_results
    
    def _run_pytest(self, path: str, report_name: str) -> Dict[str, Any]:
        """Ejecutar pytest y parsear resultados"""
        start_time = time.time()
        
        try:
            # Ejecutar pytest con output JSON
            cmd = [
                sys.executable, "-m", "pytest", 
                path, 
                "--json-report", 
                f"--json-report-file={REPORTS_DIR}/{report_name}.json",
                "-v"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300, encoding='utf-8', errors='replace')
            
            end_time = time.time()
            
            # Parsear resultados
            try:
                with open(REPORTS_DIR / f"{report_name}.json") as f:
                    report_data = json.load(f)
                
                return {
                    'tests': report_data['summary']['total'],
                    'passed': report_data['summary']['passed'],
                    'failed': report_data['summary']['failed'],
                    'time': end_time - start_time,
                    'details': report_data,
                    'stdout': result.stdout,
                    'stderr': result.stderr
                }
            except (FileNotFoundError, KeyError):
                # Fallback si no hay reporte JSON
                return self._parse_pytest_output(result.stdout, end_time - start_time)
                
        except subprocess.TimeoutExpired:
            return {
                'tests': 0,
                'passed': 0,
                'failed': 1,
                'time': 300,
                'details': "Test timeout",
                'error': "Tests excedieron el tiempo límite"
            }
        except Exception as e:
            return {
                'tests': 0,
                'passed': 0,
                'failed': 1,
                'time': time.time() - start_time,
                'details': str(e),
                'error': f"Error ejecutando tests: {e}"
            }
    
    def _run_vitest(self, args: str, report_name: str) -> Dict[str, Any]:
        """Ejecutar Vitest y parsear resultados"""
        start_time = time.time()
        
        try:
            cmd = f"npm run test {args} -- --reporter=json --outputFile={REPORTS_DIR}/{report_name}.json"
            
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=300, encoding='utf-8', errors='replace')
            
            end_time = time.time()
            
            # Parsear resultados de Vitest
            try:
                with open(REPORTS_DIR / f"{report_name}.json") as f:
                    report_data = json.load(f)
                
                return {
                    'tests': report_data.get('numTotalTests', 0),
                    'passed': report_data.get('numPassedTests', 0),
                    'failed': report_data.get('numFailedTests', 0),
                    'time': end_time - start_time,
                    'details': report_data,
                    'stdout': result.stdout,
                    'stderr': result.stderr
                }
            except (FileNotFoundError, KeyError):
                return self._parse_vitest_output(result.stdout, end_time - start_time)
                
        except subprocess.TimeoutExpired:
            return {
                'tests': 0,
                'passed': 0,
                'failed': 1,
                'time': 300,
                'details': "Test timeout"
            }
        except Exception as e:
            return {
                'tests': 0,
                'passed': 0,
                'failed': 1,
                'time': time.time() - start_time,
                'details': str(e)
            }
    
    def _run_file_tests(self) -> Dict[str, Any]:
        """Ejecutar tests con archivos reales"""
        start_time = time.time()
        
        # Generar archivos de prueba si no existen
        if not (BASE_DIR / "test_files").exists():
            print("    📁 Generando archivos de prueba...")
            try:
                subprocess.run([sys.executable, str(BASE_DIR / "scripts/generate_test_files.py")],
                             check=True, timeout=60, encoding='utf-8', errors='replace')
            except Exception as e:
                return {
                    'tests': 1,
                    'passed': 0,
                    'failed': 1,
                    'time': time.time() - start_time,
                    'error': f"Error generando archivos de prueba: {e}"
                }
        
        # Ejecutar tests con archivos reales
        os.chdir(BACKEND_DIR)
        return self._run_pytest("tests/integration/test_comprehensive_conversion.py::TestComprehensiveConversion::test_valid_text_conversions", "file_tests")
    
    def _parse_pytest_output(self, output: str, time_taken: float) -> Dict[str, Any]:
        """Parsear output de pytest manualmente"""
        lines = output.split('\n')
        
        tests = passed = failed = 0
        
        for line in lines:
            if 'passed' in line and 'failed' in line:
                # Línea de resumen: "5 passed, 2 failed in 10.5s"
                parts = line.split()
                for i, part in enumerate(parts):
                    if part == 'passed':
                        passed = int(parts[i-1])
                    elif part == 'failed':
                        failed = int(parts[i-1])
                tests = passed + failed
                break
        
        return {
            'tests': tests,
            'passed': passed,
            'failed': failed,
            'time': time_taken,
            'details': output
        }
    
    def _parse_vitest_output(self, output: str, time_taken: float) -> Dict[str, Any]:
        """Parsear output de Vitest manualmente"""
        lines = output.split('\n')
        
        tests = passed = failed = 0
        
        for line in lines:
            if 'Test Files' in line or 'Tests' in line:
                # Buscar patrones como "Tests  5 passed (5)"
                if 'passed' in line:
                    parts = line.split()
                    for i, part in enumerate(parts):
                        if part == 'passed':
                            try:
                                passed = int(parts[i-1])
                            except (ValueError, IndexError):
                                pass
                if 'failed' in line:
                    parts = line.split()
                    for i, part in enumerate(parts):
                        if part == 'failed':
                            try:
                                failed = int(parts[i-1])
                            except (ValueError, IndexError):
                                pass
        
        tests = passed + failed
        
        return {
            'tests': tests,
            'passed': passed,
            'failed': failed,
            'time': time_taken,
            'details': output
        }
    
    def generate_report(self) -> None:
        """Generar reporte final"""
        print("\n📊 Generando reporte final...")
        
        # Calcular totales
        total_tests = (
            self.results['backend'].get('total_tests', 0) +
            self.results['frontend'].get('total_tests', 0) +
            self.results['integration'].get('total_tests', 0)
        )
        
        total_passed = (
            self.results['backend'].get('total_passed', 0) +
            self.results['frontend'].get('total_passed', 0) +
            self.results['integration'].get('total_passed', 0)
        )
        
        total_failed = (
            self.results['backend'].get('total_failed', 0) +
            self.results['frontend'].get('total_failed', 0) +
            self.results['integration'].get('total_failed', 0)
        )
        
        total_time = (
            self.results['backend'].get('total_time', 0) +
            self.results['frontend'].get('total_time', 0) +
            self.results['integration'].get('total_time', 0)
        )
        
        success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
        
        self.results['summary'] = {
            'total_tests': total_tests,
            'total_passed': total_passed,
            'total_failed': total_failed,
            'total_time': total_time,
            'success_rate': success_rate,
            'status': 'PASS' if total_failed == 0 else 'FAIL'
        }
        
        # Guardar reporte completo
        report_file = REPORTS_DIR / f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(self.results, f, indent=2, default=str)
        
        # Generar reporte HTML
        self._generate_html_report(report_file)
        
        print(f"📄 Reporte guardado en: {report_file}")
    
    def _generate_html_report(self, json_file: Path) -> None:
        """Generar reporte HTML"""
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Anclora Nexus - Test Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        .header {{ background: #059669; color: white; padding: 20px; border-radius: 8px; }}
        .summary {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }}
        .card {{ background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; }}
        .pass {{ border-left-color: #10b981; }}
        .fail {{ border-left-color: #ef4444; }}
        .details {{ margin: 20px 0; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
        th {{ background-color: #f8f9fa; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Anclora Nexus - Test Report</h1>
        <p>Generado: {self.results['timestamp']}</p>
    </div>
    
    <div class="summary">
        <div class="card {'pass' if self.results['summary']['status'] == 'PASS' else 'fail'}">
            <h3>Estado General</h3>
            <p><strong>{self.results['summary']['status']}</strong></p>
            <p>Tasa de éxito: {self.results['summary']['success_rate']:.1f}%</p>
        </div>
        
        <div class="card">
            <h3>Tests Totales</h3>
            <p><strong>{self.results['summary']['total_tests']}</strong></p>
            <p>✅ {self.results['summary']['total_passed']} pasaron</p>
            <p>❌ {self.results['summary']['total_failed']} fallaron</p>
        </div>
        
        <div class="card">
            <h3>Tiempo Total</h3>
            <p><strong>{self.results['summary']['total_time']:.2f}s</strong></p>
        </div>
    </div>
    
    <div class="details">
        <h2>Detalles por Categoría</h2>
        
        <h3>🔧 Backend</h3>
        <table>
            <tr><th>Categoría</th><th>Tests</th><th>Pasaron</th><th>Fallaron</th><th>Tiempo</th></tr>
            <tr><td>Unitarios</td><td>{self.results['backend'].get('unit', {}).get('tests', 0)}</td><td>{self.results['backend'].get('unit', {}).get('passed', 0)}</td><td>{self.results['backend'].get('unit', {}).get('failed', 0)}</td><td>{self.results['backend'].get('unit', {}).get('time', 0):.2f}s</td></tr>
            <tr><td>Integración</td><td>{self.results['backend'].get('integration', {}).get('tests', 0)}</td><td>{self.results['backend'].get('integration', {}).get('passed', 0)}</td><td>{self.results['backend'].get('integration', {}).get('failed', 0)}</td><td>{self.results['backend'].get('integration', {}).get('time', 0):.2f}s</td></tr>
            <tr><td>Conversión</td><td>{self.results['backend'].get('conversion', {}).get('tests', 0)}</td><td>{self.results['backend'].get('conversion', {}).get('passed', 0)}</td><td>{self.results['backend'].get('conversion', {}).get('failed', 0)}</td><td>{self.results['backend'].get('conversion', {}).get('time', 0):.2f}s</td></tr>
        </table>
        
        <h3>🎨 Frontend</h3>
        <table>
            <tr><th>Categoría</th><th>Tests</th><th>Pasaron</th><th>Fallaron</th><th>Tiempo</th></tr>
            <tr><td>Unitarios</td><td>{self.results['frontend'].get('unit', {}).get('tests', 0)}</td><td>{self.results['frontend'].get('unit', {}).get('passed', 0)}</td><td>{self.results['frontend'].get('unit', {}).get('failed', 0)}</td><td>{self.results['frontend'].get('unit', {}).get('time', 0):.2f}s</td></tr>
            <tr><td>Componentes</td><td>{self.results['frontend'].get('components', {}).get('tests', 0)}</td><td>{self.results['frontend'].get('components', {}).get('passed', 0)}</td><td>{self.results['frontend'].get('components', {}).get('failed', 0)}</td><td>{self.results['frontend'].get('components', {}).get('time', 0):.2f}s</td></tr>
            <tr><td>Accesibilidad</td><td>{self.results['frontend'].get('accessibility', {}).get('tests', 0)}</td><td>{self.results['frontend'].get('accessibility', {}).get('passed', 0)}</td><td>{self.results['frontend'].get('accessibility', {}).get('failed', 0)}</td><td>{self.results['frontend'].get('accessibility', {}).get('time', 0):.2f}s</td></tr>
        </table>
    </div>
</body>
</html>
        """
        
        html_file = json_file.with_suffix('.html')
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"📊 Reporte HTML: {html_file}")
    
    def run_all_tests(self) -> None:
        """Ejecutar todos los tests"""
        print("🚀 Iniciando suite completa de tests de Anclora Nexus...\n")
        
        # Ejecutar tests del backend
        self.results['backend'] = self.run_backend_tests()
        
        # Ejecutar tests del frontend
        self.results['frontend'] = self.run_frontend_tests()
        
        # Ejecutar tests de integración
        self.results['integration'] = self.run_integration_tests()
        
        # Generar reporte
        self.generate_report()
        
        # Mostrar resumen
        self._print_summary()
    
    def _print_summary(self) -> None:
        """Imprimir resumen en consola"""
        summary = self.results['summary']
        
        print("\n" + "="*60)
        print("📊 RESUMEN DE TESTS")
        print("="*60)
        print(f"Estado: {'✅ PASS' if summary['status'] == 'PASS' else '❌ FAIL'}")
        print(f"Tests totales: {summary['total_tests']}")
        print(f"Pasaron: {summary['total_passed']}")
        print(f"Fallaron: {summary['total_failed']}")
        print(f"Tasa de éxito: {summary['success_rate']:.1f}%")
        print(f"Tiempo total: {summary['total_time']:.2f}s")
        print("="*60)
        
        if summary['total_failed'] > 0:
            print("❌ Algunos tests fallaron. Revisa el reporte para más detalles.")
            sys.exit(1)
        else:
            print("✅ ¡Todos los tests pasaron exitosamente!")


def main():
    """Función principal"""
    runner = TestRunner()
    runner.run_all_tests()


if __name__ == "__main__":
    main()
