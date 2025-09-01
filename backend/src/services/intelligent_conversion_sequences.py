# ================================
# ANCLORA NEXUS - INTELLIGENT CONVERSION SEQUENCES
# Sistema de conversiones secuenciales inteligentes
# ================================

import os
import tempfile
import time
from typing import List, Dict, Tuple, Optional, Any
from dataclasses import dataclass
from pathlib import Path
import asyncio

from src.services.ai_conversion_engine import AIConversionEngine, ConversionPath, FileAnalysis
from src.models.conversion import conversion_engine
from src.ws import emit_progress, Phase

@dataclass
class ConversionStep:
    """Representa un paso en una secuencia de conversión"""
    step_number: int
    source_format: str
    target_format: str
    input_path: str
    output_path: str
    estimated_time: float
    quality_impact: float
    description: str

@dataclass
class SequenceResult:
    """Resultado de una secuencia de conversión"""
    success: bool
    total_time: float
    steps_completed: int
    final_output_path: str
    quality_score: float
    intermediate_files: List[str]
    logs: List[str]
    error_message: Optional[str] = None

class IntelligentConversionSequences:
    """Gestor de secuencias de conversión inteligentes"""
    
    def __init__(self):
        self.ai_engine = AIConversionEngine()
        
        # Secuencias predefinidas optimizadas
        self.quality_sequences = {
            # Documentos: rutas para máxima calidad
            ('doc', 'pdf'): ['html'],  # DOC → HTML → PDF
            ('docx', 'pdf'): ['html'], # DOCX → HTML → PDF
            ('pdf', 'docx'): ['txt'],  # PDF → TXT → DOCX
            ('md', 'pdf'): ['html'],   # MD → HTML → PDF
            ('txt', 'pdf'): ['html'],  # TXT → HTML → PDF (mejor formato)
            
            # Imágenes: rutas para máxima calidad
            ('jpg', 'pdf'): ['png'],   # JPG → PNG → PDF
            ('gif', 'pdf'): ['png'],   # GIF → PNG → PDF
            
            # Conversiones complejas
            ('pdf', 'html'): ['txt'],  # PDF → TXT → HTML
            ('docx', 'html'): ['txt'], # DOCX → TXT → HTML
        }
        
        # Secuencias para velocidad
        self.speed_sequences = {
            # Conversiones directas priorizadas
            ('txt', 'html'): [],
            ('md', 'html'): [],
            ('html', 'txt'): [],
            ('jpg', 'png'): [],
            ('png', 'jpg'): [],
        }

    async def analyze_and_recommend_sequence(self, file_path: str, filename: str, 
                                           target_format: str) -> List[ConversionPath]:
        """Analiza archivo y recomienda secuencias de conversión óptimas"""
        
        # Análisis inteligente del archivo
        file_analysis = await self.ai_engine.analyze_file_with_ai(file_path, filename)
        source_format = filename.split('.')[-1].lower()
        
        # Obtener rutas optimizadas
        optimal_paths = await self.ai_engine.get_optimal_conversion_paths(
            source_format, target_format, file_analysis
        )
        
        # Agregar secuencias inteligentes personalizadas
        custom_sequences = self._generate_custom_sequences(
            source_format, target_format, file_analysis
        )
        
        optimal_paths.extend(custom_sequences)
        
        # Ordenar por puntuación combinada
        optimal_paths.sort(
            key=lambda p: (p.quality_score * 0.4 + p.speed_score * 0.3 + p.ai_confidence * 0.3), 
            reverse=True
        )
        
        return optimal_paths[:3]  # Top 3 opciones

    async def execute_intelligent_sequence(self, file_path: str, target_format: str, 
                                         sequence_path: ConversionPath,
                                         conversion_id: Optional[int] = None,
                                         progress_callback: Optional[callable] = None) -> SequenceResult:
        """Ejecuta una secuencia de conversión inteligente"""
        
        start_time = time.time()
        intermediate_files = []
        logs = []
        
        try:
            source_format = sequence_path.source_format
            steps = [source_format] + sequence_path.intermediate_steps + [target_format]
            total_steps = len(steps) - 1
            
            current_input = file_path
            
            # Ejecutar cada paso de la secuencia
            for i in range(total_steps):
                step_source = steps[i]
                step_target = steps[i + 1]
                step_progress = (i / total_steps) * 100
                
                # Emitir progreso
                if conversion_id:
                    emit_progress(conversion_id, Phase.CONVERT, step_progress)
                if progress_callback:
                    progress_callback(step_progress, f"Paso {i+1}/{total_steps}: {step_source} → {step_target}")
                
                # Preparar archivo de salida
                if i == total_steps - 1:
                    # Último paso: usar ruta final
                    step_output = self._generate_final_output_path(file_path, target_format)
                else:
                    # Paso intermedio: archivo temporal
                    fd, step_output = tempfile.mkstemp(suffix=f'.{step_target}')
                    os.close(fd)
                    intermediate_files.append(step_output)
                
                # Ejecutar conversión del paso
                step_start = time.time()
                success, message = conversion_engine.convert_file(
                    current_input, step_output, step_source, step_target
                )
                step_time = time.time() - step_start
                
                log_entry = f"Paso {i+1}: {step_source} → {step_target} ({step_time:.2f}s) - {message}"
                logs.append(log_entry)
                
                if not success:
                    return SequenceResult(
                        success=False,
                        total_time=time.time() - start_time,
                        steps_completed=i,
                        final_output_path="",
                        quality_score=0.0,
                        intermediate_files=intermediate_files,
                        logs=logs,
                        error_message=f"Error en paso {i+1}: {message}"
                    )
                
                current_input = step_output
            
            # Conversión completada exitosamente
            total_time = time.time() - start_time
            
            # Emitir progreso final
            if conversion_id:
                emit_progress(conversion_id, Phase.CONVERT, 100)
            if progress_callback:
                progress_callback(100, "Conversión completada")
            
            return SequenceResult(
                success=True,
                total_time=total_time,
                steps_completed=total_steps,
                final_output_path=current_input,
                quality_score=sequence_path.quality_score,
                intermediate_files=intermediate_files,
                logs=logs
            )
            
        except Exception as e:
            return SequenceResult(
                success=False,
                total_time=time.time() - start_time,
                steps_completed=0,
                final_output_path="",
                quality_score=0.0,
                intermediate_files=intermediate_files,
                logs=logs,
                error_message=f"Error durante la secuencia: {str(e)}"
            )
        
        finally:
            # Limpiar archivos intermedios
            for temp_file in intermediate_files:
                try:
                    if os.path.exists(temp_file):
                        os.remove(temp_file)
                except Exception as e:
                    print(f"Error limpiando archivo temporal {temp_file}: {e}")

    def _generate_custom_sequences(self, source: str, target: str, 
                                 analysis: FileAnalysis) -> List[ConversionPath]:
        """Genera secuencias personalizadas basadas en análisis IA"""
        
        sequences = []
        
        # Secuencias basadas en el tipo de contenido
        if analysis.content_type == 'document':
            if 'high_quality' in analysis.ai_recommendations:
                # Secuencia de alta calidad para documentos importantes
                if source in ['doc', 'docx'] and target == 'pdf':
                    sequences.append(ConversionPath(
                        source_format=source,
                        target_format=target,
                        intermediate_steps=['html'],
                        quality_score=95.0,
                        speed_score=70.0,
                        cost_credits=6,
                        ai_confidence=0.95,
                        description="🎯 Secuencia IA optimizada para documentos profesionales",
                        estimated_time_seconds=10.0,
                        use_case_optimization='quality'
                    ))
            
            if 'preserve_formatting' in analysis.ai_recommendations:
                # Secuencia para preservar formato
                if source == 'pdf' and target in ['doc', 'docx']:
                    sequences.append(ConversionPath(
                        source_format=source,
                        target_format=target,
                        intermediate_steps=['html'],
                        quality_score=88.0,
                        speed_score=65.0,
                        cost_credits=8,
                        ai_confidence=0.9,
                        description="🎨 Secuencia IA para preservar formato original",
                        estimated_time_seconds=15.0,
                        use_case_optimization='quality'
                    ))
        
        elif analysis.content_type == 'image':
            if analysis.complexity_level == 'complex':
                # Secuencia optimizada para imágenes complejas
                if source in ['jpg', 'jpeg'] and target == 'pdf':
                    sequences.append(ConversionPath(
                        source_format=source,
                        target_format=target,
                        intermediate_steps=['png'],
                        quality_score=92.0,
                        speed_score=75.0,
                        cost_credits=4,
                        ai_confidence=0.85,
                        description="📸 Secuencia IA optimizada para imágenes complejas",
                        estimated_time_seconds=8.0,
                        use_case_optimization='quality'
                    ))
        
        return sequences

    def _generate_final_output_path(self, input_path: str, target_format: str) -> str:
        """Genera ruta para el archivo final"""
        
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        output_dir = os.path.dirname(input_path).replace('uploads', 'outputs')
        
        # Asegurar que el directorio existe
        os.makedirs(output_dir, exist_ok=True)
        
        return os.path.join(output_dir, f"{base_name}.{target_format}")

    def get_sequence_preview(self, sequence_path: ConversionPath) -> Dict[str, Any]:
        """Obtiene vista previa de una secuencia de conversión"""

        steps = [sequence_path.source_format] + sequence_path.intermediate_steps + [sequence_path.target_format]
        visual_path = ' → '.join([s.upper() for s in steps])

        # Agregar visual_path al objeto ConversionPath si no existe
        if not hasattr(sequence_path, 'visual_path'):
            sequence_path.visual_path = visual_path

        return {
            'sequence_id': f"seq_{hash(str(sequence_path))}",
            'steps': steps,
            'total_steps': len(steps) - 1,
            'estimated_time': sequence_path.estimated_time_seconds,
            'quality_score': sequence_path.quality_score,
            'speed_score': sequence_path.speed_score,
            'cost_credits': sequence_path.cost_credits,
            'ai_confidence': sequence_path.ai_confidence,
            'description': sequence_path.description,
            'optimization_type': sequence_path.use_case_optimization,
            'visual_path': visual_path,
            'benefits': self._get_sequence_benefits(sequence_path),
            'warnings': self._get_sequence_warnings(sequence_path)
        }

    def _get_sequence_benefits(self, path: ConversionPath) -> List[str]:
        """Obtiene beneficios de la secuencia"""
        
        benefits = []
        
        if path.quality_score > 90:
            benefits.append("🏆 Calidad superior garantizada")
        if path.speed_score > 85:
            benefits.append("⚡ Conversión rápida")
        if path.ai_confidence > 0.9:
            benefits.append("🤖 Optimizado por IA avanzada")
        if len(path.intermediate_steps) > 0:
            benefits.append("🔄 Proceso multi-etapa para mejor resultado")
        if path.cost_credits <= 3:
            benefits.append("💰 Costo eficiente")
        
        return benefits

    def _get_sequence_warnings(self, path: ConversionPath) -> List[str]:
        """Obtiene advertencias de la secuencia"""
        
        warnings = []
        
        if path.estimated_time_seconds > 20:
            warnings.append("⏱️ Proceso puede tomar más tiempo")
        if path.cost_credits > 8:
            warnings.append("💳 Costo elevado en créditos")
        if len(path.intermediate_steps) > 1:
            warnings.append("🔄 Proceso complejo con múltiples pasos")
        if path.quality_score < 70:
            warnings.append("⚠️ Calidad de resultado puede verse afectada")
        
        return warnings

# Instancia global del gestor de secuencias
intelligent_sequences = IntelligentConversionSequences()
