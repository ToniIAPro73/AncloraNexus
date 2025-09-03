"""
Procesador de Secuencias Inteligentes para Anclora Nexus
Ejecuta conversiones complejas de múltiples pasos automáticamente
"""

import logging
import os
import tempfile
import time
import uuid
from typing import List, Dict, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import json
from datetime import datetime

from .intelligent_routing import intelligent_router, ConversionRoute
from .intelligent_cache import intelligent_cache
from .ai_file_analyzer import ai_file_analyzer

@dataclass
class SequenceStep:
    """Representa un paso en una secuencia de conversión"""
    step_number: int
    source_format: str
    target_format: str
    input_file: str
    output_file: str
    status: str  # 'pending', 'processing', 'completed', 'failed'
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    error_message: Optional[str] = None
    file_size_before: Optional[int] = None
    file_size_after: Optional[int] = None

@dataclass
class ConversionSequence:
    """Representa una secuencia completa de conversión"""
    sequence_id: str
    source_format: str
    target_format: str
    original_file: str
    final_output: str
    route: ConversionRoute
    steps: List[SequenceStep]
    status: str  # 'pending', 'processing', 'completed', 'failed', 'cancelled'
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    total_time: Optional[float] = None
    success_rate: float = 0.0
    metadata: Dict[str, Any] = None

class SequenceProcessor:
    """Procesador de secuencias de conversión inteligentes"""
    
    def __init__(self):
        self.active_sequences: Dict[str, ConversionSequence] = {}
        self.temp_dir = tempfile.mkdtemp(prefix="anclora_sequences_")
        self.max_concurrent_sequences = 5
        
        # Crear directorio para archivos temporales de secuencias
        os.makedirs(self.temp_dir, exist_ok=True)
        
        logging.info(f"SequenceProcessor inicializado con temp_dir: {self.temp_dir}")
    
    def create_sequence(self, source_format: str, target_format: str, 
                       input_file: str, output_file: str, 
                       prefer_quality: bool = True, max_steps: int = 4) -> Optional[ConversionSequence]:
        """
        Crear una nueva secuencia de conversión
        
        Args:
            source_format: Formato de origen
            target_format: Formato de destino
            input_file: Ruta del archivo de entrada
            output_file: Ruta del archivo de salida final
            prefer_quality: Si priorizar calidad sobre velocidad
            max_steps: Máximo número de pasos permitidos
            
        Returns:
            ConversionSequence creada o None si no es posible
        """
        try:
            # Encontrar la mejor ruta
            route = intelligent_router.find_best_route(
                source_format, target_format, max_steps, prefer_quality
            )
            
            if not route:
                logging.error(f"No se encontró ruta para {source_format}→{target_format}")
                return None
            
            # Generar ID único para la secuencia
            sequence_id = str(uuid.uuid4())
            
            # Crear pasos de la secuencia
            steps = self._create_sequence_steps(route, input_file, output_file, sequence_id)
            
            # Crear secuencia
            sequence = ConversionSequence(
                sequence_id=sequence_id,
                source_format=source_format,
                target_format=target_format,
                original_file=input_file,
                final_output=output_file,
                route=route,
                steps=steps,
                status='pending',
                created_at=datetime.now(),
                metadata={
                    'prefer_quality': prefer_quality,
                    'max_steps': max_steps,
                    'estimated_time': route.estimated_time,
                    'complexity': route.complexity
                }
            )
            
            # Registrar secuencia activa
            self.active_sequences[sequence_id] = sequence
            
            logging.info(f"Secuencia creada: {sequence_id} ({route.description})")
            return sequence
            
        except Exception as e:
            logging.error(f"Error creando secuencia: {e}")
            return None
    
    def _create_sequence_steps(self, route: ConversionRoute, input_file: str, 
                             output_file: str, sequence_id: str) -> List[SequenceStep]:
        """Crear los pasos individuales de la secuencia"""
        try:
            steps = []
            current_input = input_file
            
            for i, (source_fmt, target_fmt) in enumerate(route.steps):
                step_number = i + 1
                
                # Determinar archivo de salida para este paso
                if step_number == len(route.steps):
                    # Último paso - usar archivo de salida final
                    step_output = output_file
                else:
                    # Paso intermedio - crear archivo temporal
                    temp_filename = f"{sequence_id}_step_{step_number}.{target_fmt}"
                    step_output = os.path.join(self.temp_dir, temp_filename)
                
                step = SequenceStep(
                    step_number=step_number,
                    source_format=source_fmt,
                    target_format=target_fmt,
                    input_file=current_input,
                    output_file=step_output,
                    status='pending'
                )
                
                steps.append(step)
                current_input = step_output  # La salida de este paso es la entrada del siguiente
            
            return steps
            
        except Exception as e:
            logging.error(f"Error creando pasos de secuencia: {e}")
            return []
    
    def execute_sequence(self, sequence_id: str) -> bool:
        """
        Ejecutar una secuencia de conversión
        
        Args:
            sequence_id: ID de la secuencia a ejecutar
            
        Returns:
            True si la secuencia se completó exitosamente
        """
        try:
            sequence = self.active_sequences.get(sequence_id)
            if not sequence:
                logging.error(f"Secuencia no encontrada: {sequence_id}")
                return False
            
            if sequence.status != 'pending':
                logging.warning(f"Secuencia {sequence_id} ya está en estado: {sequence.status}")
                return False
            
            # Iniciar secuencia
            sequence.status = 'processing'
            sequence.started_at = datetime.now()
            
            logging.info(f"Iniciando secuencia {sequence_id}: {sequence.route.description}")
            
            # Ejecutar cada paso
            completed_steps = 0
            total_steps = len(sequence.steps)
            
            for step in sequence.steps:
                success = self._execute_step(step, sequence)
                
                if success:
                    completed_steps += 1
                    logging.info(f"Paso {step.step_number}/{total_steps} completado: {step.source_format}→{step.target_format}")
                else:
                    # Fallo en el paso - marcar secuencia como fallida
                    sequence.status = 'failed'
                    logging.error(f"Fallo en paso {step.step_number}: {step.error_message}")
                    break
            
            # Finalizar secuencia
            sequence.completed_at = datetime.now()
            sequence.total_time = (sequence.completed_at - sequence.started_at).total_seconds()
            sequence.success_rate = completed_steps / total_steps
            
            if completed_steps == total_steps:
                sequence.status = 'completed'
                logging.info(f"Secuencia {sequence_id} completada exitosamente en {sequence.total_time:.2f}s")
                
                # Limpiar archivos temporales
                self._cleanup_temp_files(sequence)
                
                # Actualizar métricas del router
                self._update_router_metrics(sequence)
                
                return True
            else:
                logging.error(f"Secuencia {sequence_id} falló. Completados: {completed_steps}/{total_steps}")
                return False
            
        except Exception as e:
            logging.error(f"Error ejecutando secuencia {sequence_id}: {e}")
            if sequence_id in self.active_sequences:
                self.active_sequences[sequence_id].status = 'failed'
            return False
    
    def _execute_step(self, step: SequenceStep, sequence: ConversionSequence) -> bool:
        """Ejecutar un paso individual de la secuencia"""
        try:
            # Verificar que el archivo de entrada existe
            if not os.path.exists(step.input_file):
                step.status = 'failed'
                step.error_message = f"Archivo de entrada no encontrado: {step.input_file}"
                return False
            
            # Marcar paso como en proceso
            step.status = 'processing'
            step.start_time = datetime.now()
            step.file_size_before = os.path.getsize(step.input_file)
            
            # Importar motor de conversiones
            from src.models.conversion import conversion_engine
            
            # Ejecutar conversión
            success, message = conversion_engine.convert_file(
                step.input_file,
                step.output_file,
                step.source_format,
                step.target_format
            )
            
            # Finalizar paso
            step.end_time = datetime.now()
            
            if success:
                step.status = 'completed'
                
                # Verificar que el archivo de salida se creó
                if os.path.exists(step.output_file):
                    step.file_size_after = os.path.getsize(step.output_file)
                    logging.debug(f"Paso completado: {step.source_format}→{step.target_format} ({step.file_size_before}→{step.file_size_after} bytes)")
                    return True
                else:
                    step.status = 'failed'
                    step.error_message = "Archivo de salida no se generó"
                    return False
            else:
                step.status = 'failed'
                step.error_message = message
                return False
            
        except Exception as e:
            step.status = 'failed'
            step.error_message = f"Error ejecutando paso: {str(e)}"
            step.end_time = datetime.now()
            logging.error(f"Error en paso {step.step_number}: {e}")
            return False
    
    def _cleanup_temp_files(self, sequence: ConversionSequence):
        """Limpiar archivos temporales de la secuencia"""
        try:
            for step in sequence.steps[:-1]:  # No limpiar el archivo final
                if step.output_file.startswith(self.temp_dir) and os.path.exists(step.output_file):
                    os.remove(step.output_file)
                    logging.debug(f"Archivo temporal eliminado: {step.output_file}")
        except Exception as e:
            logging.warning(f"Error limpiando archivos temporales: {e}")
    
    def _update_router_metrics(self, sequence: ConversionSequence):
        """Actualizar métricas del router inteligente basadas en los resultados"""
        try:
            for step in sequence.steps:
                if step.status == 'completed' and step.start_time and step.end_time:
                    time_taken = (step.end_time - step.start_time).total_seconds()
                    
                    # Calcular calificación de calidad basada en el ratio de tamaño de archivo
                    quality_rating = None
                    if step.file_size_before and step.file_size_after:
                        size_ratio = step.file_size_after / step.file_size_before
                        # Calificación basada en si el tamaño es razonable
                        if 0.1 <= size_ratio <= 10.0:  # Ratio razonable
                            quality_rating = 0.9
                        elif 0.05 <= size_ratio <= 20.0:  # Ratio aceptable
                            quality_rating = 0.7
                        else:  # Ratio problemático
                            quality_rating = 0.5
                    
                    intelligent_router.update_conversion_metrics(
                        step.source_format,
                        step.target_format,
                        success=True,
                        time_taken=time_taken,
                        quality_rating=quality_rating
                    )
        except Exception as e:
            logging.warning(f"Error actualizando métricas del router: {e}")
    
    def get_sequence_status(self, sequence_id: str) -> Optional[Dict]:
        """Obtener el estado actual de una secuencia"""
        try:
            sequence = self.active_sequences.get(sequence_id)
            if not sequence:
                return None
            
            # Calcular progreso
            completed_steps = sum(1 for step in sequence.steps if step.status == 'completed')
            total_steps = len(sequence.steps)
            progress = (completed_steps / total_steps) * 100 if total_steps > 0 else 0
            
            # Tiempo transcurrido
            elapsed_time = None
            if sequence.started_at:
                end_time = sequence.completed_at or datetime.now()
                elapsed_time = (end_time - sequence.started_at).total_seconds()
            
            return {
                'sequence_id': sequence_id,
                'status': sequence.status,
                'progress': progress,
                'completed_steps': completed_steps,
                'total_steps': total_steps,
                'elapsed_time': elapsed_time,
                'estimated_time': sequence.route.estimated_time,
                'route_description': sequence.route.description,
                'steps': [
                    {
                        'step_number': step.step_number,
                        'conversion': f"{step.source_format}→{step.target_format}",
                        'status': step.status,
                        'error_message': step.error_message
                    }
                    for step in sequence.steps
                ]
            }
            
        except Exception as e:
            logging.error(f"Error obteniendo estado de secuencia: {e}")
            return None
    
    def cancel_sequence(self, sequence_id: str) -> bool:
        """Cancelar una secuencia en ejecución"""
        try:
            sequence = self.active_sequences.get(sequence_id)
            if not sequence:
                return False
            
            if sequence.status in ['completed', 'failed', 'cancelled']:
                return False
            
            sequence.status = 'cancelled'
            sequence.completed_at = datetime.now()
            
            # Limpiar archivos temporales
            self._cleanup_temp_files(sequence)
            
            logging.info(f"Secuencia {sequence_id} cancelada")
            return True
            
        except Exception as e:
            logging.error(f"Error cancelando secuencia: {e}")
            return False
    
    def get_popular_sequences(self, limit: int = 10) -> List[Dict]:
        """Obtener las secuencias más populares/útiles"""
        try:
            # Por ahora, devolver secuencias comunes basadas en prioridades de formato
            popular_sequences = [
                {'source': 'csv', 'target': 'pdf', 'description': 'Datos a documento PDF', 'popularity': 95},
                {'source': 'json', 'target': 'xlsx', 'description': 'API a Excel', 'popularity': 90},
                {'source': 'html', 'target': 'pdf', 'description': 'Web a PDF', 'popularity': 85},
                {'source': 'md', 'target': 'docx', 'description': 'Markdown a Word', 'popularity': 80},
                {'source': 'csv', 'target': 'html', 'description': 'Datos a tabla web', 'popularity': 75},
                {'source': 'xlsx', 'target': 'pdf', 'description': 'Excel a PDF', 'popularity': 70},
                {'source': 'svg', 'target': 'pdf', 'description': 'Gráfico vectorial a PDF', 'popularity': 65},
                {'source': 'json', 'target': 'pdf', 'description': 'Datos JSON a PDF', 'popularity': 60},
            ]
            
            return popular_sequences[:limit]
            
        except Exception as e:
            logging.error(f"Error obteniendo secuencias populares: {e}")
            return []

# Instancia global del procesador de secuencias
sequence_processor = SequenceProcessor()
