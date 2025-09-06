# src/core/test_runner.py - Motor principal de testing para Anclora Nexus
import asyncio
import time
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional, Callable
import json

from src.config import config, TEST_SUITES_CONFIG, SUPPORTED_CONVERSIONS
from src.models import (
    TestCase, SequentialTestCase, TestResult, TestSuiteResult, 
    TestStatus, TestPriority, OverallStats, TestReport
)
from src.api.anclora_client import AncloraClient, ConversionResponse
from src.suites.test_suite_factory import TestSuiteFactory
from src.reporters.markdown_reporter import MarkdownReporter
from src.utils.progress_tracker import ProgressTracker

logger = logging.getLogger(__name__)

class TestRunner:
    """Motor principal para ejecutar tests de conversión"""
    
    def __init__(self, config_instance=None):
        self.config = config_instance or config
        self.client = AncloraClient(self.config)
        self.suite_factory = TestSuiteFactory(self.config.FIXTURES_PATH)
        self.progress_tracker = ProgressTracker()
        
        # Estado de ejecución
        self.current_execution = None
        self.is_running = False
        self.should_stop = False
        
        # Resultados
        self.overall_stats = OverallStats()
        self.suite_results = {}
        
        # Callbacks para UI
        self.progress_callback: Optional[Callable] = None
        self.status_callback: Optional[Callable] = None
        
        logger.info("🔧 TestRunner inicializado")
    
    def set_progress_callback(self, callback: Callable):
        """Establecer callback para actualizaciones de progreso"""
        self.progress_callback = callback
    
    def set_status_callback(self, callback: Callable):
        """Establecer callback para actualizaciones de estado"""
        self.status_callback = callback
    
    async def run_all_suites(self, selected_suites: Optional[List[str]] = None) -> TestReport:
        """Ejecutar todas las suites seleccionadas"""
        self.overall_stats = OverallStats()
        self.overall_stats.start_time = datetime.now()
        self.suite_results = {}
        self.is_running = True
        self.should_stop = False
        
        logger.info("🚀 Iniciando ejecución completa de testing")
        self._notify_status("🚀 Iniciando ejecución completa...")
        
        try:
            # Verificar prerrequisitos
            if not await self._check_prerequisites():
                raise RuntimeError("Prerrequisitos no cumplidos")
            
            # Determinar suites a ejecutar
            suites_to_run = selected_suites or list(TEST_SUITES_CONFIG.keys())
            logger.info(f"📋 Suites a ejecutar: {', '.join(suites_to_run)}")
            
            # Ejecutar cada suite
            for i, suite_name in enumerate(suites_to_run):
                if self.should_stop:
                    logger.info("⏹️ Ejecución detenida por usuario")
                    break
                
                self._notify_status(f"📋 Ejecutando suite '{suite_name}' ({i+1}/{len(suites_to_run)})")
                logger.info(f"📋 Ejecutando suite: {suite_name}")
                
                suite_result = await self._run_single_suite(suite_name)
                self.suite_results[suite_name] = suite_result
                
                # Actualizar estadísticas generales
                self._update_overall_stats(suite_result)
                
                # Notificar progreso
                progress = (i + 1) / len(suites_to_run)
                self._notify_progress(progress, f"Completado {suite_name}")
            
            # Finalizar estadísticas
            self.overall_stats.end_time = datetime.now()
            self.overall_stats.execution_time = (
                self.overall_stats.end_time - self.overall_stats.start_time
            ).total_seconds()
            
            # Generar reporte
            report = TestReport(
                suite_results=self.suite_results,
                overall_stats=self.overall_stats,
                config_snapshot=self._get_config_snapshot()
            )
            
            # Generar reportes automáticamente
            await self._generate_automatic_reports(report)
            
            logger.info(f"✅ Ejecución completada: {self.overall_stats.overall_success_rate:.1%} de éxito")
            self._notify_status(f"✅ Completado - {self.overall_stats.overall_success_rate:.1%} de éxito")
            
            return report
            
        except Exception as e:
            logger.error(f"❌ Error durante ejecución: {e}")
            self._notify_status(f"❌ Error: {str(e)}")
            raise
        
        finally:
            self.is_running = False
    
    async def run_quick_test(self, max_tests: int = 20) -> TestReport:
        """Ejecutar test rápido con subconjunto limitado"""
        logger.info(f"🧪 Ejecutando test rápido ({max_tests} tests)")
        self._notify_status(f"🧪 Iniciando test rápido...")
        
        # Seleccionar tests representativos
        quick_suites = ["documents", "images"]  # Suites más importantes
        
        # Temporalmente limitar número de tests por suite
        original_config = {}
        for suite_name in quick_suites:
            if suite_name in TEST_SUITES_CONFIG:
                original_config[suite_name] = TEST_SUITES_CONFIG[suite_name]["expected_tests"]
                TEST_SUITES_CONFIG[suite_name]["expected_tests"] = min(
                    max_tests // len(quick_suites),
                    original_config[suite_name]
                )
        
        try:
            result = await self.run_all_suites(quick_suites)
            return result
        finally:
            # Restaurar configuración original
            for suite_name, original_count in original_config.items():
                TEST_SUITES_CONFIG[suite_name]["expected_tests"] = original_count
    
    async def _run_single_suite(self, suite_name: str) -> TestSuiteResult:
        """Ejecutar una suite individual"""
        suite_config = TEST_SUITES_CONFIG.get(suite_name, {})
        suite_result = TestSuiteResult(suite_name=suite_name)
        
        start_time = time.time()
        
        try:
            # Generar casos de test para la suite
            test_cases = self.suite_factory.generate_test_cases_for_suite(suite_name)
            suite_result.total_tests = len(test_cases)
            
            logger.info(f"📊 Suite '{suite_name}': {len(test_cases)} tests generados")
            
            if not test_cases:
                logger.warning(f"⚠️ No se generaron tests para suite '{suite_name}'")
                return suite_result
            
            # Determinar si ejecutar en paralelo
            use_parallel = suite_config.get("parallel", True) and len(test_cases) > 4
            
            if use_parallel:
                test_results = await self._run_tests_parallel(test_cases, suite_name)
            else:
                test_results = await self._run_tests_sequential(test_cases, suite_name)
            
            # Procesar resultados
            for result in test_results:
                suite_result.test_results.append(result)
                
                if result.success:
                    suite_result.passed_tests += 1
                elif result.status == TestStatus.SKIPPED:
                    suite_result.skipped_tests += 1
                else:
                    suite_result.failed_tests += 1
            
            suite_result.execution_time = time.time() - start_time
            
            logger.info(
                f"✅ Suite '{suite_name}' completada: "
                f"{suite_result.success_rate:.1%} éxito en {suite_result.execution_time:.1f}s"
            )
            
            return suite_result
            
        except Exception as e:
            logger.error(f"❌ Error en suite '{suite_name}': {e}")
            suite_result.execution_time = time.time() - start_time
            return suite_result
    
    async def _run_tests_parallel(self, test_cases: List[TestCase], suite_name: str) -> List[TestResult]:
        """Ejecutar tests en paralelo"""
        logger.info(f"🔄 Ejecutando {len(test_cases)} tests en paralelo (suite: {suite_name})")
        
        results = []
        max_workers = min(self.config.PARALLEL_WORKERS, len(test_cases))
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Crear futures para todos los tests
            future_to_test = {
                executor.submit(self._execute_single_test, test_case): test_case 
                for test_case in test_cases
            }
            
            # Procesar resultados conforme se completan
            completed_count = 0
            for future in as_completed(future_to_test):
                if self.should_stop:
                    logger.info("⏹️ Cancelando tests pendientes...")
                    break
                
                test_case = future_to_test[future]
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    logger.error(f"❌ Error ejecutando test {test_case.name}: {e}")
                    # Crear resultado de error
                    error_result = TestResult(
                        test_id=test_case.id,
                        test_case=test_case,
                        status=TestStatus.FAILED,
                        success=False,
                        error_message=str(e)
                    )
                    results.append(error_result)
                
                completed_count += 1
                progress = completed_count / len(test_cases)
                self._notify_progress(
                    progress, 
                    f"{suite_name}: {completed_count}/{len(test_cases)} completados"
                )
        
        return results
    
    async def _run_tests_sequential(self, test_cases: List[TestCase], suite_name: str) -> List[TestResult]:
        """Ejecutar tests secuencialmente"""
        logger.info(f"🔄 Ejecutando {len(test_cases)} tests secuencialmente (suite: {suite_name})")
        
        results = []
        
        for i, test_case in enumerate(test_cases):
            if self.should_stop:
                logger.info("⏹️ Ejecución secuencial detenida")
                break
            
            try:
                result = self._execute_single_test(test_case)
                results.append(result)
            except Exception as e:
                logger.error(f"❌ Error en test {test_case.name}: {e}")
                error_result = TestResult(
                    test_id=test_case.id,
                    test_case=test_case,
                    status=TestStatus.FAILED,
                    success=False,
                    error_message=str(e)
                )
                results.append(error_result)
            
            # Notificar progreso
            progress = (i + 1) / len(test_cases)
            self._notify_progress(
                progress, 
                f"{suite_name}: {i+1}/{len(test_cases)} completados"
            )
        
        return results
    
    def _execute_single_test(self, test_case: TestCase) -> TestResult:
        """Ejecutar un test individual"""
        result = TestResult(
            test_id=test_case.id,
            test_case=test_case,
            started_at=datetime.now()
        )
        
        try:
            logger.debug(f"🧪 Ejecutando test: {test_case.name}")
            result.status = TestStatus.RUNNING
            
            # Verificar que el archivo de entrada existe
            if not test_case.input_file_path or not test_case.input_file_path.exists():
                result.status = TestStatus.SKIPPED
                result.error_message = f"Archivo de entrada no encontrado: {test_case.input_file_path}"
                logger.warning(f"⏭️ Test omitido: {result.error_message}")
                return result
            
            result.file_size_input = test_case.input_file_path.stat().st_size
            
            # Ejecutar conversión según el tipo de test
            if isinstance(test_case, SequentialTestCase):
                conversion_response = self.client.convert_sequence(
                    test_case.input_file_path,
                    test_case.conversion_steps,
                    timeout=test_case.timeout
                )
            else:
                conversion_response = self.client.convert_file(
                    test_case.input_file_path,
                    test_case.source_format,
                    test_case.target_format,
                    timeout=test_case.timeout
                )
            
            # Procesar respuesta
            result.success = conversion_response.success
            result.execution_time = conversion_response.execution_time
            result.error_message = conversion_response.error_message
            result.output_file_path = conversion_response.output_file_path
            result.file_size_output = conversion_response.file_size_output
            result.quality_metrics = conversion_response.quality_metrics or {}
            
            if result.success:
                result.status = TestStatus.COMPLETED
                logger.debug(f"✅ Test exitoso: {test_case.name} ({result.execution_time:.2f}s)")
                
                # Validaciones adicionales si están habilitadas
                if test_case.validate_quality:
                    self._validate_output_quality(result)
                
                if test_case.expected_output_size_range:
                    self._validate_output_size(result, test_case.expected_output_size_range)
                
            else:
                result.status = TestStatus.FAILED
                logger.debug(f"❌ Test fallido: {test_case.name} - {result.error_message}")
                
                # Para tests que esperan fallar
                if not test_case.expected_success:
                    result.success = True  # Paradójicamente exitoso
                    result.status = TestStatus.COMPLETED
                    logger.debug(f"✅ Fallo esperado confirmado: {test_case.name}")
        
        except Exception as e:
            result.status = TestStatus.FAILED
            result.success = False
            result.error_message = f"Error de ejecución: {str(e)}"
            logger.error(f"❌ Excepción en test {test_case.name}: {e}")
        
        finally:
            result.completed_at = datetime.now()
            if not result.execution_time:
                result.execution_time = (result.completed_at - result.started_at).total_seconds()
        
        return result
    
    def _validate_output_quality(self, result: TestResult):
        """Validar calidad del archivo de salida"""
        try:
            if result.output_file_path and result.output_file_path.exists():
                # Verificaciones básicas de calidad
                file_size = result.output_file_path.stat().st_size
                
                # El archivo no debe estar vacío
                if file_size == 0:
                    result.quality_metrics["empty_file_warning"] = True
                    logger.warning(f"⚠️ Archivo de salida vacío: {result.output_file_path}")
                
                # Comparación de tamaños
                if result.file_size_input and file_size > result.file_size_input * 10:
                    result.quality_metrics["size_expansion_warning"] = True
                    logger.warning(f"⚠️ Archivo de salida muy grande: {file_size/result.file_size_input:.1f}x")
                
                # Verificar formato de archivo
                expected_extension = result.test_case.target_format.lower()
                actual_extension = result.output_file_path.suffix.lower().lstrip('.')
                
                if actual_extension != expected_extension:
                    result.quality_metrics["format_mismatch_warning"] = True
                    logger.warning(f"⚠️ Formato no coincide: esperado {expected_extension}, obtenido {actual_extension}")
                
        except Exception as e:
            logger.error(f"Error validando calidad: {e}")
            result.quality_metrics["quality_validation_error"] = str(e)
    
    def _validate_output_size(self, result: TestResult, size_range: tuple):
        """Validar que el tamaño de salida esté en el rango esperado"""
        if result.file_size_output:
            min_size, max_size = size_range
            if not (min_size <= result.file_size_output <= max_size):
                result.quality_metrics["size_range_violation"] = True
                logger.warning(
                    f"⚠️ Tamaño fuera de rango: {result.file_size_output} bytes "
                    f"(esperado: {min_size}-{max_size})"
                )
    
    async def _check_prerequisites(self) -> bool:
        """Verificar prerrequisitos para la ejecución"""
        issues = []
        
        # Verificar conexión con Anclora Nexus
        try:
            health_status = await self.client.health_check()
            if health_status.get('status') != 'healthy':
                issues.append(f"Anclora Nexus no está saludable: {health_status}")
        except Exception as e:
            issues.append(f"No se puede conectar con Anclora Nexus: {e}")
        
        # Verificar fixtures
        fixtures_path = self.config.FIXTURES_PATH
        if not fixtures_path.exists():
            issues.append("Directorio de fixtures no existe")
        else:
            fixture_count = sum(1 for _ in fixtures_path.rglob("*") if _.is_file())
            if fixture_count < 10:
                issues.append(f"Muy pocos fixtures disponibles: {fixture_count}")
        
        # Verificar configuración
        if self.config.PARALLEL_WORKERS < 1:
            issues.append("Configuración de workers paralelos inválida")
        
        if self.config.TIMEOUT_SECONDS < 30:
            issues.append("Timeout configurado muy bajo")
        
        if issues:
            logger.error("❌ Prerrequisitos no cumplidos:")
            for issue in issues:
                logger.error(f"  - {issue}")
            return False
        
        logger.info("✅ Todos los prerrequisitos cumplidos")
        return True
    
    def _update_overall_stats(self, suite_result: TestSuiteResult):
        """Actualizar estadísticas generales"""
        self.overall_stats.total_tests += suite_result.total_tests
        self.overall_stats.total_passed += suite_result.passed_tests
        self.overall_stats.total_failed += suite_result.failed_tests
        self.overall_stats.total_skipped += suite_result.skipped_tests
    
    async def _generate_automatic_reports(self, report: TestReport):
        """Generar reportes automáticamente"""
        try:
            if "markdown" in self.config.EXPORT_FORMATS:
                markdown_reporter = MarkdownReporter(self.config.REPORTS_PATH)
                await markdown_reporter.generate_report(report)
                logger.info("📄 Reporte Markdown generado")
            
            # Agregar otros formatos según configuración
            if "json" in self.config.EXPORT_FORMATS:
                await self._generate_json_report(report)
            
        except Exception as e:
            logger.error(f"❌ Error generando reportes automáticos: {e}")
    
    async def _generate_json_report(self, report: TestReport):
        """Generar reporte en formato JSON"""
        try:
            report_data = report.to_dict()
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            json_file = self.config.REPORTS_PATH / f"test_report_{timestamp}.json"
            
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2, ensure_ascii=False, default=str)
            
            logger.info(f"📄 Reporte JSON generado: {json_file}")
            
        except Exception as e:
            logger.error(f"❌ Error generando reporte JSON: {e}")
    
    def _get_config_snapshot(self) -> Dict[str, Any]:
        """Obtener snapshot de configuración actual"""
        return {
            "parallel_workers": self.config.PARALLEL_WORKERS,
            "timeout_seconds": self.config.TIMEOUT_SECONDS,
            "retry_attempts": self.config.RETRY_ATTEMPTS,
            "export_formats": self.config.EXPORT_FORMATS,
            "anclora_api_url": self.config.ANCLORA_API_URL,
            "min_success_rate": self.config.MIN_SUCCESS_RATE
        }
    
    def _notify_progress(self, progress: float, message: str):
        """Notificar progreso a callback si existe"""
        if self.progress_callback:
            try:
                self.progress_callback(progress, message)
            except Exception as e:
                logger.error(f"Error en callback de progreso: {e}")
    
    def _notify_status(self, message: str):
        """Notificar estado a callback si existe"""
        if self.status_callback:
            try:
                self.status_callback(message)
            except Exception as e:
                logger.error(f"Error en callback de estado: {e}")
    
    def stop_execution(self):
        """Detener ejecución actual"""
        logger.info("🛑 Solicitando detener ejecución...")
        self.should_stop = True
        self._notify_status("🛑 Deteniendo ejecución...")
    
    def get_execution_status(self) -> Dict[str, Any]:
        """Obtener estado actual de ejecución"""
        return {
            "is_running": self.is_running,
            "should_stop": self.should_stop,
            "overall_stats": self.overall_stats.to_dict() if self.overall_stats else None,
            "completed_suites": list(self.suite_results.keys()),
            "current_execution": self.current_execution
        }

# Funciones de conveniencia para uso simple
async def run_all_tests(config_instance=None) -> TestReport:
    """Función de conveniencia para ejecutar todos los tests"""
    runner = TestRunner(config_instance)
    return await runner.run_all_suites()

async def run_quick_test(max_tests: int = 20, config_instance=None) -> TestReport:
    """Función de conveniencia para ejecutar test rápido"""
    runner = TestRunner(config_instance)
    return await runner.run_quick_test(max_tests)

if __name__ == "__main__":
    # Permitir ejecución directa para testing
    import asyncio
    import logging
    
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    
    async def main():
        runner = TestRunner()
        
        # Ejecutar test rápido
        print("🚀 Ejecutando test rápido...")
        result = await runner.run_quick_test(10)
        
        print(f"\n✅ Test completado:")
        print(f"Tests totales: {result.overall_stats.total_tests}")
        print(f"Exitosos: {result.overall_stats.total_passed}")
        print(f"Fallidos: {result.overall_stats.total_failed}")
        print(f"Tasa de éxito: {result.overall_stats.overall_success_rate:.1%}")
        print(f"Tiempo: {result.overall_stats.execution_time:.1f}s")
    
    asyncio.run(main())