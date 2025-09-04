# src/mocks/mock_anclora_client.py - Mock completo del cliente Anclora Nexus
import random
import time
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List
from dataclasses import dataclass
import json
import hashlib
from datetime import datetime, timedelta

from src.api.anclora_client import ConversionResponse
from src.config import TestingConfig, SUPPORTED_CONVERSIONS

class MockAncloraClient:
    """Mock del cliente Anclora Nexus para testing sin servidor real"""
    
    def __init__(self, config: TestingConfig):
        self.config = config
        self.base_url = config.ANCLORA_API_URL
        self.mock_mode = True
        self.conversion_history = []
        self.failure_rate = 0.15  # 15% de fallos simulados
        self.slow_conversion_rate = 0.1  # 10% conversiones lentas
        
        # Simular estado del servidor
        self.server_status = "healthy"
        self.server_version = "2.0.0"
        self.response_time_base = 50  # ms base
        
        # Conversiones que fallarán intencionalmente
        self.problematic_conversions = [
            ("pdf", "docx"),  # Conversión compleja
            ("gif", "mp4"),   # Requiere FFmpeg
            ("svg", "pdf"),   # Renderizado complejo
        ]
        
        # Archivos que causarán errores específicos
        self.error_patterns = {
            "corrupted": "File appears to be corrupted or invalid",
            "huge": "File size exceeds maximum limit",
            "empty": "Empty file cannot be converted", 
            "invalid": "Unsupported file format or structure",
            "timeout": "Conversion timed out"
        }
        
        print("🎭 MockAncloraClient inicializado - Modo simulación activado")
    
    async def health_check(self) -> Dict[str, Any]:
        """Simular verificación de salud del servidor"""
        # Simular latencia de red
        await asyncio.sleep(random.uniform(0.01, 0.1))
        
        # Simular problemas ocasionales del servidor
        if random.random() < 0.05:  # 5% de problemas
            return {
                'status': 'unhealthy',
                'error': 'Service temporarily unavailable',
                'response_time_ms': random.uniform(5000, 10000)
            }
        
        response_time = self.response_time_base + random.uniform(-20, 50)
        
        return {
            'status': self.server_status,
            'response_time_ms': response_time,
            'version': self.server_version,
            'timestamp': datetime.now().isoformat(),
            'details': {
                'active_conversions': random.randint(0, 5),
                'total_conversions_today': random.randint(100, 1000),
                'server_load': random.uniform(0.1, 0.8),
                'available_formats': len(SUPPORTED_CONVERSIONS)
            }
        }
    
    def authenticate(self) -> bool:
        """Simular autenticación"""
        # Simular delay de autenticación
        time.sleep(random.uniform(0.1, 0.3))
        
        # Simular fallos ocasionales de auth
        if random.random() < 0.02:  # 2% de fallos
            return False
        
        return True
    
    def get_supported_conversions(self) -> Dict[str, List[str]]:
        """Retornar conversiones soportadas (reales + algunas extras simuladas)"""
        supported = SUPPORTED_CONVERSIONS.copy()
        
        # Agregar algunas conversiones "futuras" simuladas
        supported['xlsx'] = ['csv', 'json', 'pdf', 'html']
        supported['mp4'] = ['gif', 'jpg']
        supported['webp'] = ['png', 'jpg']
        
        return supported
    
    def convert_file(
        self, 
        file_path: Path, 
        source_format: str, 
        target_format: str,
        timeout: Optional[int] = None,
        quality_params: Optional[Dict[str, Any]] = None
    ) -> ConversionResponse:
        """Simular conversión de archivo"""
        
        start_time = time.time()
        conversion_timeout = timeout or self.config.TIMEOUT_SECONDS
        
        # Verificar archivo de entrada
        if not file_path.exists():
            return ConversionResponse(
                success=False,
                error_message=f"Archivo no encontrado: {file_path}",
                execution_time=0.1
            )
        
        file_size_input = file_path.stat().st_size
        
        # Detectar casos especiales por nombre de archivo
        filename = file_path.stem.lower()
        
        # Simular errores específicos según patrones en el nombre
        for pattern, error_msg in self.error_patterns.items():
            if pattern in filename:
                return ConversionResponse(
                    success=False,
                    error_message=error_msg,
                    execution_time=random.uniform(0.5, 2.0),
                    file_size_input=file_size_input
                )
        
        # Simular conversiones problemáticas
        if (source_format, target_format) in self.problematic_conversions:
            if random.random() < 0.4:  # 40% de fallo para conversiones problemáticas
                return ConversionResponse(
                    success=False,
                    error_message=f"Conversion {source_format}→{target_format} failed: Complex format conversion error",
                    execution_time=random.uniform(5.0, 15.0),
                    file_size_input=file_size_input
                )
        
        # Simular tasa de fallo general
        if random.random() < self.failure_rate:
            error_types = [
                "Internal conversion error",
                "Temporary service unavailable", 
                "File format not fully supported",
                "Memory allocation failed",
                "External dependency error"
            ]
            return ConversionResponse(
                success=False,
                error_message=random.choice(error_types),
                execution_time=random.uniform(1.0, 8.0),
                file_size_input=file_size_input
            )
        
        # Simular tiempo de conversión realista
        base_time = self._calculate_conversion_time(file_size_input, source_format, target_format)
        
        # Simular conversiones lentas ocasionales
        if random.random() < self.slow_conversion_rate:
            base_time *= random.uniform(3.0, 8.0)
        
        # Verificar timeout
        if base_time > conversion_timeout:
            return ConversionResponse(
                success=False,
                error_message=f"Conversion timed out after {conversion_timeout} seconds",
                execution_time=conversion_timeout,
                file_size_input=file_size_input
            )
        
        # Simular delay de conversión
        time.sleep(min(base_time, 2.0))  # Máximo 2s de delay real para testing
        
        # Generar archivo de salida simulado
        output_file = self._create_mock_output_file(file_path, target_format)
        
        # Simular métricas de calidad
        quality_metrics = self._generate_quality_metrics(source_format, target_format, file_size_input)
        
        execution_time = time.time() - start_time
        
        # Registrar conversión en historial
        self.conversion_history.append({
            'timestamp': datetime.now(),
            'source_format': source_format,
            'target_format': target_format,
            'file_size': file_size_input,
            'execution_time': execution_time,
            'success': True
        })
        
        return ConversionResponse(
            success=True,
            conversion_id=self._generate_conversion_id(),
            output_file_path=output_file,
            execution_time=execution_time,
            file_size_input=file_size_input,
            file_size_output=output_file.stat().st_size if output_file.exists() else None,
            quality_metrics=quality_metrics
        )
    
    def convert_sequence(
        self,
        file_path: Path,
        conversion_steps: List[Tuple[str, str]],
        timeout: Optional[int] = None
    ) -> ConversionResponse:
        """Simular conversión en secuencia"""
        
        total_timeout = timeout or (self.config.TIMEOUT_SECONDS * len(conversion_steps))
        start_time = time.time()
        current_file = file_path
        
        # Simular cada paso de la secuencia
        for i, (source_fmt, target_fmt) in enumerate(conversion_steps):
            
            # Verificar timeout
            elapsed = time.time() - start_time
            if elapsed > total_timeout:
                return ConversionResponse(
                    success=False,
                    error_message="Sequence conversion timed out",
                    execution_time=elapsed
                )
            
            # Simular conversión del paso
            step_result = self.convert_file(current_file, source_fmt, target_fmt, timeout=60)
            
            if not step_result.success:
                return ConversionResponse(
                    success=False,
                    error_message=f"Sequence failed at step {i+1}: {step_result.error_message}",
                    execution_time=time.time() - start_time
                )
            
            # Actualizar archivo para siguiente paso
            current_file = step_result.output_file_path
        
        return ConversionResponse(
            success=True,
            output_file_path=current_file,
            execution_time=time.time() - start_time,
            file_size_input=file_path.stat().st_size,
            file_size_output=current_file.stat().st_size if current_file.exists() else None
        )
    
    def _calculate_conversion_time(self, file_size: int, source: str, target: str) -> float:
        """Calcular tiempo de conversión realista basado en complejidad"""
        
        # Tiempo base por formato (segundos por MB)
        complexity_factors = {
            # Documentos
            'txt': 0.1, 'html': 0.2, 'md': 0.1,
            'docx': 0.5, 'pdf': 1.0, 'rtf': 0.3,
            
            # Imágenes  
            'png': 0.2, 'jpg': 0.15, 'gif': 0.3,
            'svg': 0.4, 'webp': 0.25, 'tiff': 0.35,
            
            # Datos
            'csv': 0.05, 'json': 0.05, 'xlsx': 0.3
        }
        
        # Factor de conversión entre formatos
        conversion_complexity = {
            ('pdf', 'docx'): 3.0,   # Muy complejo
            ('gif', 'mp4'): 2.5,    # Requiere FFmpeg
            ('svg', 'pdf'): 2.0,    # Renderizado
            ('html', 'pdf'): 1.5,   # Renderizado web
            ('docx', 'pdf'): 1.2,   # Estándar
            ('txt', 'pdf'): 0.8,    # Simple
        }
        
        # Calcular tiempo base
        file_size_mb = file_size / (1024 * 1024)
        source_factor = complexity_factors.get(source, 0.5)
        target_factor = complexity_factors.get(target, 0.5)
        conversion_factor = conversion_complexity.get((source, target), 1.0)
        
        base_time = file_size_mb * (source_factor + target_factor) * conversion_factor
        
        # Agregar variabilidad realista
        base_time += random.uniform(0.2, 1.5)  # Overhead del sistema
        base_time *= random.uniform(0.8, 1.4)  # Variabilidad de rendimiento
        
        return max(0.1, base_time)  # Mínimo 0.1 segundos
    
    def _create_mock_output_file(self, input_file: Path, target_format: str) -> Path:
        """Crear archivo de salida simulado"""
        from src.config import config
        
        output_dir = config.REPORTS_PATH / "mock_converted_files"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generar nombre único
        timestamp = int(time.time())
        output_file = output_dir / f"{input_file.stem}_converted_{timestamp}.{target_format}"
        
        # Crear archivo simulado con contenido básico
        self._generate_mock_file_content(output_file, target_format, input_file.stat().st_size)
        
        return output_file
    
    def _generate_mock_file_content(self, output_file: Path, target_format: str, original_size: int):
        """Generar contenido simulado para archivo convertido"""
        
        # Calcular tamaño simulado (con variabilidad realista)
        size_factors = {
            'pdf': random.uniform(0.7, 1.5),   # PDF puede comprimir o expandir
            'jpg': random.uniform(0.3, 0.8),   # JPEG comprime mucho
            'png': random.uniform(0.8, 1.2),   # PNG menos compresión
            'docx': random.uniform(0.5, 2.0),  # Word puede variar mucho
            'html': random.uniform(0.6, 1.4),  # HTML con markup
            'txt': random.uniform(0.2, 0.5),   # Texto plano comprime
            'csv': random.uniform(0.4, 0.8),   # Datos estructurados
            'json': random.uniform(0.6, 1.3),  # JSON con estructura
        }
        
        target_size = int(original_size * size_factors.get(target_format, 1.0))
        target_size = max(100, target_size)  # Mínimo 100 bytes
        
        # Generar contenido según formato
        if target_format in ['txt', 'csv', 'html', 'json']:
            # Archivo de texto
            content = f"Mock converted file to {target_format}\n"
            content += "Generated by MockAncloraClient\n"
            content += f"Original size: {original_size} bytes\n"
            content += f"Target size: {target_size} bytes\n"
            content += "Mock content: " + "A" * (target_size - len(content.encode()) - 50)
            
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(content[:target_size])
        else:
            # Archivo binario simulado
            mock_binary = b"MOCK" + b"\x00" * (target_size - 4)
            with open(output_file, 'wb') as f:
                f.write(mock_binary)
    
    def _generate_quality_metrics(self, source: str, target: str, file_size: int) -> Dict[str, Any]:
        """Generar métricas de calidad simuladas"""
        
        # Calidad base por tipo de conversión
        base_quality = {
            ('txt', 'pdf'): 0.95,   # Conversión simple
            ('docx', 'pdf'): 0.90,  # Conversión común
            ('html', 'pdf'): 0.85,  # Renderizado web
            ('pdf', 'docx'): 0.75,  # Conversión compleja
            ('svg', 'png'): 0.88,   # Rasterización
            ('gif', 'mp4'): 0.82,   # Video encoding
        }
        
        quality_score = base_quality.get((source, target), 0.85)
        quality_score += random.uniform(-0.1, 0.1)  # Variabilidad
        quality_score = max(0.0, min(1.0, quality_score))  # Clamp 0-1
        
        return {
            'quality_score': quality_score,
            'conversion_accuracy': quality_score + random.uniform(-0.05, 0.05),
            'format_compliance': random.uniform(0.85, 1.0),
            'size_efficiency': random.uniform(0.7, 0.95),
            'processing_time_rating': random.uniform(0.8, 1.0),
            'metadata_preservation': random.choice([True, False]),
            'warning_count': random.randint(0, 3),
            'estimated_fidelity': f"{quality_score * 100:.1f}%"
        }
    
    def _generate_conversion_id(self) -> str:
        """Generar ID único para conversión"""
        timestamp = str(int(time.time()))
        random_part = ''.join(random.choices('abcdef0123456789', k=8))
        return f"mock_{timestamp}_{random_part}"
    
    def get_conversion_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas de conversiones simuladas"""
        if not self.conversion_history:
            return {"message": "No conversions performed yet"}
        
        total_conversions = len(self.conversion_history)
        successful = sum(1 for c in self.conversion_history if c['success'])
        
        avg_time = sum(c['execution_time'] for c in self.conversion_history) / total_conversions
        
        format_stats = {}
        for conv in self.conversion_history:
            pair = f"{conv['source_format']}→{conv['target_format']}"
            if pair not in format_stats:
                format_stats[pair] = {'count': 0, 'avg_time': 0}
            format_stats[pair]['count'] += 1
        
        return {
            'total_conversions': total_conversions,
            'successful_conversions': successful,
            'success_rate': successful / total_conversions,
            'average_conversion_time': avg_time,
            'format_statistics': format_stats,
            'server_status': self.server_status,
            'mock_mode': True
        }
    
    # Métodos de contexto para testing
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        pass
    
    # Métodos para control del mock
    def set_failure_rate(self, rate: float):
        """Configurar tasa de fallos simulados"""
        self.failure_rate = max(0.0, min(1.0, rate))
    
    def set_server_status(self, status: str):
        """Configurar estado del servidor simulado"""
        self.server_status = status
    
    def add_problematic_conversion(self, source: str, target: str):
        """Agregar conversión problemática"""
        if (source, target) not in self.problematic_conversions:
            self.problematic_conversions.append((source, target))
    
    def clear_history(self):
        """Limpiar historial de conversiones"""
        self.conversion_history.clear()

# Factory function para facilitar uso
def create_mock_client(config: TestingConfig) -> MockAncloraClient:
    """Crear instancia de cliente mock"""
    return MockAncloraClient(config)

if __name__ == "__main__":
    # Demo del mock
    import asyncio
    from src.config import config
    
    async def demo():
        print("🎭 Demo MockAncloraClient")
        
        client = MockAncloraClient(config)
        
        # Test health check
        health = await client.health_check()
        print(f"Health: {health}")
        
        # Test conversion (necesita un archivo real para demo)
        # En testing real usarías fixtures generados
        print("\n📊 Estadísticas simuladas:")
        stats = client.get_conversion_stats()
        print(json.dumps(stats, indent=2))
    
    asyncio.run(demo())