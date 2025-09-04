# main.py - Script principal para Anclora Nexus Testing Suite
#!/usr/bin/env python3
"""
Anclora Nexus Testing Suite - Sistema de testing robusto y escalable

Este script permite ejecutar el sistema completo de testing para validar
todas las conversiones de Anclora Nexus con más de 600 casos de prueba.

Uso:
    python main.py                          # Interfaz web
    python main.py --cli                   # Interfaz CLI
    python main.py --suite documents      # Suite específica
    python main.py --generate-fixtures    # Solo generar fixtures
    python main.py --quick-test          # Test rápido
"""

import sys
import asyncio
import argparse
import logging
from pathlib import Path
from datetime import datetime
import json

# Agregar src al path
sys.path.insert(0, str(Path(__file__).parent))

from src.config import config, TEST_SUITES_CONFIG
from src.core.test_runner import TestRunner
from src.fixtures.generator import FixtureGenerator
from src.api.anclora_client import AncloraClient
from src.models import create_database
from src.utils.logger import setup_logging
from src.reporters.markdown_reporter import MarkdownReporter

# Colores para terminal
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_banner():
    """Mostrar banner de la aplicación"""
    banner = f"""
{Colors.OKCYAN}
████████████████████████████████████████████████████████████████
██                                                            ██
██  🧪 ANCLORA NEXUS TESTING SUITE v2.0                      ██
██                                                            ██
██  Sistema de testing robusto, exhaustivo y escalable       ██
██  para validar conversiones de archivos inteligentes       ██
██                                                            ██
████████████████████████████████████████████████████████████████
{Colors.ENDC}

{Colors.OKGREEN}✨ Características principales:{Colors.ENDC}
  🧪 600+ casos de prueba distribuidos estratégicamente
  🚀 Ejecución paralela y secuencial inteligente
  📊 Reportes visuales exportables en Markdown/HTML/JSON
  🏭 Generación automática de fixtures
  🔄 Testing de secuencias innovadoras
  💥 Casos de archivos corruptos y edge cases
  📈 Métricas en tiempo real y dashboards
  🌐 Interfaz web visual con Streamlit
"""
    print(banner)

def print_system_info():
    """Mostrar información del sistema"""
    print(f"\n{Colors.OKBLUE}📋 Información del Sistema:{Colors.ENDC}")
    print(f"  🔗 Anclora API: {config.ANCLORA_API_URL}")
    print(f"  👥 Workers paralelos: {config.PARALLEL_WORKERS}")
    print(f"  ⏱️  Timeout: {config.TIMEOUT_SECONDS}s")
    print(f"  📁 Fixtures: {config.FIXTURES_PATH}")
    print(f"  📊 Reportes: {config.REPORTS_PATH}")
    print(f"  🎯 Tasa mínima éxito: {config.MIN_SUCCESS_RATE:.0%}")
    
    # Mostrar suites disponibles
    print(f"\n{Colors.OKBLUE}📋 Suites Disponibles:{Colors.ENDC}")
    for suite_name, suite_config in TEST_SUITES_CONFIG.items():
        priority_emoji = {"critical": "🔥", "high": "⚠️", "medium": "📋", "low": "📝"}
        emoji = priority_emoji.get(suite_config.get('priority', 'medium'), '📋')
        expected_tests = suite_config.get('expected_tests', 0)
        print(f"  {emoji} {suite_name:<12} - {expected_tests:>3} tests - {suite_config.get('priority', 'medium')} priority")

async def check_system_health():
    """Verificar salud del sistema"""
    print(f"\n{Colors.OKBLUE}🔍 Verificando estado del sistema...{Colors.ENDC}")
    
    issues = []
    warnings = []
    
    # Verificar Anclora Nexus
    try:
        print("  🔌 Conectando con Anclora Nexus...")
        client = AncloraClient(config)
        health = await client.health_check()
        
        if health.get('status') == 'healthy':
            response_time = health.get('response_time_ms', 0)
            version = health.get('version', 'unknown')
            print(f"  {Colors.OKGREEN}✅ Anclora Nexus: CONECTADO ({response_time:.0f}ms, v{version}){Colors.ENDC}")
        else:
            error_msg = health.get('error', 'Estado no saludable')
            print(f"  {Colors.FAIL}❌ Anclora Nexus: {error_msg}{Colors.ENDC}")
            issues.append(f"Anclora Nexus no disponible: {error_msg}")
            
    except Exception as e:
        print(f"  {Colors.FAIL}❌ Anclora Nexus: ERROR DE CONEXIÓN{Colors.ENDC}")
        issues.append(f"No se puede conectar con Anclora Nexus: {e}")
    
    # Verificar fixtures
    print("  📁 Verificando fixtures...")
    fixtures_count = count_fixtures()
    if fixtures_count > 100:
        print(f"  {Colors.OKGREEN}✅ Fixtures: {fixtures_count:,} archivos disponibles{Colors.ENDC}")
    elif fixtures_count > 0:
        print(f"  {Colors.WARNING}⚠️ Fixtures: {fixtures_count:,} archivos (pocos){Colors.ENDC}")
        warnings.append(f"Solo {fixtures_count} fixtures disponibles")
    else:
        print(f"  {Colors.FAIL}❌ Fixtures: NO HAY ARCHIVOS{Colors.ENDC}")
        issues.append("No hay fixtures disponibles - ejecutar generación")
    
    # Verificar base de datos
    print("  🗄️  Verificando base de datos...")
    try:
        engine, Session = create_database(config.DATABASE_URL)
        print(f"  {Colors.OKGREEN}✅ Base de datos: CONECTADA{Colors.ENDC}")
    except Exception as e:
        print(f"  {Colors.FAIL}❌ Base de datos: {e}{Colors.ENDC}")
        issues.append(f"Problema con base de datos: {e}")
    
    # Verificar directorios
    print("  📂 Verificando directorios...")
    for path_name, path in [("Fixtures", config.FIXTURES_PATH), ("Reports", config.REPORTS_PATH), ("Logs", config.LOGS_PATH)]:
        if path.exists():
            print(f"    {Colors.OKGREEN}✅ {path_name}: {path}{Colors.ENDC}")
        else:
            print(f"    {Colors.WARNING}⚠️ {path_name}: {path} (será creado){Colors.ENDC}")
            path.mkdir(parents=True, exist_ok=True)
    
    # Resumen
    if issues:
        print(f"\n{Colors.FAIL}❌ PROBLEMAS CRÍTICOS ENCONTRADOS:{Colors.ENDC}")
        for issue in issues:
            print(f"  • {issue}")
        return False
    elif warnings:
        print(f"\n{Colors.WARNING}⚠️ ADVERTENCIAS:{Colors.ENDC}")
        for warning in warnings:
            print(f"  • {warning}")
        print(f"\n{Colors.OKGREEN}✅ Sistema funcional con advertencias{Colors.ENDC}")
        return True
    else:
        print(f"\n{Colors.OKGREEN}✅ SISTEMA COMPLETAMENTE SALUDABLE{Colors.ENDC}")
        return True

def count_fixtures() -> int:
    """Contar fixtures disponibles"""
    try:
        if not config.FIXTURES_PATH.exists():
            return 0
        return sum(1 for _ in config.FIXTURES_PATH.rglob("*") if _.is_file() and _.suffix in ['.txt', '.docx', '.html', '.png', '.jpg', '.csv', '.json'])
    except:
        return 0

async def run_fixtures_generation(selected_categories: list = None):
    """Ejecutar generación de fixtures"""
    print(f"\n{Colors.OKCYAN}🏭 GENERANDO FIXTURES{Colors.ENDC}")
    
    try:
        generator = FixtureGenerator(config.FIXTURES_PATH)
        
        print("  📁 Creando estructura de directorios...")
        generator._create_directory_structure()
        
        print("  🏭 Iniciando generación masiva...")
        result = generator.generate_all_fixtures()
        
        stats = result['stats']
        duration = (stats['end_time'] - stats['start_time']).total_seconds()
        
        print(f"\n{Colors.OKGREEN}🎉 GENERACIÓN COMPLETADA:{Colors.ENDC}")
        print(f"  ✅ Exitosos: {stats['successful']:,}")
        print(f"  ❌ Fallidos: {stats['failed']:,}")
        print(f"  ⏱️  Duración: {duration:.1f} segundos")
        print(f"  📋 Manifiesto: {result['manifest_path']}")
        
        # Mostrar breakdown por categoría
        print(f"\n{Colors.OKBLUE}📊 Breakdown por categoría:{Colors.ENDC}")
        for category, files in result['generated_files'].items():
            count = len(files)
            total_size = sum(f['size_bytes'] for f in files)
            print(f"  📁 {category:<12}: {count:>3} archivos ({total_size / 1024 / 1024:.1f} MB)")
        
        return True
        
    except Exception as e:
        print(f"{Colors.FAIL}❌ Error durante generación: {e}{Colors.ENDC}")
        return False

async def run_testing_suite(selected_suites: list = None, quick_test: bool = False):
    """Ejecutar suite de testing"""
    
    if quick_test:
        print(f"\n{Colors.OKCYAN}🧪 EJECUTANDO TEST RÁPIDO{Colors.ENDC}")
        max_tests = 20
    else:
        print(f"\n{Colors.OKCYAN}🚀 EJECUTANDO SUITE COMPLETA DE TESTING{Colors.ENDC}")
        max_tests = None
    
    # Configurar callbacks para mostrar progreso
    def progress_callback(progress: float, message: str):
        bar_length = 40
        filled_length = int(bar_length * progress)
        bar = '█' * filled_length + '░' * (bar_length - filled_length)
        print(f"\r  📊 [{bar}] {progress:.1%} - {message}", end="", flush=True)
    
    def status_callback(message: str):
        print(f"\n  🔄 {message}")
    
    try:
        runner = TestRunner(config)
        runner.set_progress_callback(progress_callback)
        runner.set_status_callback(status_callback)
        
        # Ejecutar tests
        if quick_test:
            result = await runner.run_quick_test(max_tests)
        else:
            result = await runner.run_all_suites(selected_suites)
        
        print(f"\n\n{Colors.OKGREEN}🎉 EJECUCIÓN COMPLETADA:{Colors.ENDC}")
        
        # Mostrar estadísticas generales
        stats = result.overall_stats
        print(f"  🧪 Tests totales: {stats.total_tests:,}")
        print(f"  ✅ Exitosos: {stats.total_passed:,}")
        print(f"  ❌ Fallidos: {stats.total_failed:,}")
        print(f"  ⏭️ Omitidos: {stats.total_skipped:,}")
        print(f"  🎯 Tasa de éxito: {stats.overall_success_rate:.1%}")
        print(f"  ⏱️  Duración: {stats.execution_time:.1f} segundos")
        
        # Mostrar resultados por suite
        print(f"\n{Colors.OKBLUE}📊 Resultados por Suite:{Colors.ENDC}")
        for suite_name, suite_result in result.suite_results.items():
            success_color = Colors.OKGREEN if suite_result.success_rate >= 0.85 else Colors.WARNING if suite_result.success_rate >= 0.5 else Colors.FAIL
            print(f"  {success_color}• {suite_name:<12}: {suite_result.success_rate:.1%} ({suite_result.passed_tests}/{suite_result.total_tests}){Colors.ENDC}")
        
        # Mostrar tests fallidos si los hay
        failed_tests = []
        for suite_result in result.suite_results.values():
            for test_result in suite_result.test_results:
                if not test_result.success and test_result.error_message:
                    failed_tests.append((test_result.test_case.name, test_result.error_message))
        
        if failed_tests and len(failed_tests) <= 10:  # Mostrar solo si son pocos
            print(f"\n{Colors.FAIL}❌ Tests Fallidos:{Colors.ENDC}")
            for test_name, error in failed_tests[:5]:  # Máximo 5
                print(f"  • {test_name}: {error[:60]}...")
        
        # Validar resultado
        if stats.overall_success_rate >= config.MIN_SUCCESS_RATE:
            print(f"\n{Colors.OKGREEN}🏆 ÉXITO: Tasa de éxito por encima del mínimo ({config.MIN_SUCCESS_RATE:.0%}){Colors.ENDC}")
            return True
        else:
            print(f"\n{Colors.FAIL}⚠️ ADVERTENCIA: Tasa de éxito por debajo del mínimo ({config.MIN_SUCCESS_RATE:.0%}){Colors.ENDC}")
            return False
        
    except KeyboardInterrupt:
        print(f"\n\n{Colors.WARNING}⏹️ Ejecución cancelada por usuario{Colors.ENDC}")
        return False
    except Exception as e:
        print(f"\n{Colors.FAIL}❌ Error durante testing: {e}{Colors.ENDC}")
        return False

def run_web_interface():
    """Ejecutar interfaz web con Streamlit"""
    print(f"\n{Colors.OKCYAN}🌐 INICIANDO INTERFAZ WEB{Colors.ENDC}")
    
    try:
        import subprocess
        import sys
        
        # Ejecutar Streamlit
        cmd = [sys.executable, "-m", "streamlit", "run", "src/ui/main.py", 
               "--server.port", str(config.UI_PORT), 
               "--server.address", config.UI_HOST]
        
        print(f"  🚀 Iniciando servidor en http://{config.UI_HOST}:{config.UI_PORT}")
        print(f"  📝 Comando: {' '.join(cmd)}")
        
        subprocess.run(cmd)
        
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}⏹️ Servidor web detenido{Colors.ENDC}")
    except Exception as e:
        print(f"\n{Colors.FAIL}❌ Error iniciando interfaz web: {e}{Colors.ENDC}")
        print(f"  💡 Asegúrate de que Streamlit esté instalado: pip install streamlit")

async def main():
    """Función principal"""
    parser = argparse.ArgumentParser(
        description="Anclora Nexus Testing Suite - Sistema de testing robusto y escalable",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  python main.py                              # Interfaz web (por defecto)
  python main.py --cli                       # Interfaz CLI
  python main.py --check-health              # Solo verificar sistema
  python main.py --generate-fixtures         # Solo generar fixtures
  python main.py --suite documents images    # Ejecutar suites específicas
  python main.py --quick-test               # Test rápido (20 tests)
  python main.py --all-suites               # Todos los tests
        """
    )
    
    # Opciones principales
    parser.add_argument("--cli", action="store_true", help="Usar interfaz de línea de comandos")
    parser.add_argument("--check-health", action="store_true", help="Solo verificar estado del sistema")
    parser.add_argument("--generate-fixtures", action="store_true", help="Generar fixtures de testing")
    parser.add_argument("--quick-test", action="store_true", help="Ejecutar test rápido")
    parser.add_argument("--all-suites", action="store_true", help="Ejecutar todas las suites")
    
    # Configuración de testing
    parser.add_argument("--suite", nargs="+", choices=list(TEST_SUITES_CONFIG.keys()), help="Suites específicas a ejecutar")
    parser.add_argument("--workers", type=int, help="Número de workers paralelos")
    parser.add_argument("--timeout", type=int, help="Timeout en segundos")
    parser.add_argument("--formats", nargs="+", choices=["markdown", "html", "json"], help="Formatos de reporte")
    
    # Opciones de logging
    parser.add_argument("--verbose", "-v", action="store_true", help="Logging verbose")
    parser.add_argument("--quiet", "-q", action="store_true", help="Logging mínimo")
    
    args = parser.parse_args()
    
    # Configurar logging
    log_level = "DEBUG" if args.verbose else "ERROR" if args.quiet else "INFO"
    log_file = config.LOGS_PATH / "testing_lab.log" if config.LOGS_PATH else None
    setup_logging(log_level, log_file)
    
    # Aplicar configuraciones de línea de comandos
    if args.workers:
        config.PARALLEL_WORKERS = args.workers
    if args.timeout:
        config.TIMEOUT_SECONDS = args.timeout
    if args.formats:
        config.EXPORT_FORMATS = args.formats
    
    # Mostrar banner siempre
    print_banner()
    
    # Verificar configuración básica
    print_system_info()
    
    # Verificar salud del sistema
    if args.check_health:
        system_healthy = await check_system_health()
        sys.exit(0 if system_healthy else 1)
    
    # Generar fixtures si se solicita
    if args.generate_fixtures:
        success = await run_fixtures_generation()
        sys.exit(0 if success else 1)
    
    # Verificar salud antes de continuar
    system_healthy = await check_system_health()
    if not system_healthy and not args.cli:
        print(f"\n{Colors.FAIL}❌ Sistema no saludable. Use --check-health para más detalles{Colors.ENDC}")
        sys.exit(1)
    
    # Determinar modo de operación
    if args.cli or args.quick_test or args.all_suites or args.suite:
        # Modo CLI
        if args.quick_test:
            success = await run_testing_suite(quick_test=True)
        elif args.all_suites:
            success = await run_testing_suite()
        elif args.suite:
            success = await run_testing_suite(args.suite)
        else:
            print(f"\n{Colors.OKBLUE}🔧 Modo CLI - Selecciona una acción{Colors.ENDC}")
            sys.exit(0)
        
        sys.exit(0 if success else 1)
    else:
        # Modo interfaz web (por defecto)
        run_web_interface()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}👋 ¡Hasta luego!{Colors.ENDC}")
        sys.exit(0)
    except Exception as e:
        print(f"\n{Colors.FAIL}💥 Error crítico: {e}{Colors.ENDC}")
        sys.exit(1)