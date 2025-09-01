# ================================
# ANCLORA NEXUS - AI QUALITY ASSESSMENT
# Sistema de evaluación de calidad con IA
# ================================

import os
import json
import hashlib
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import google.generativeai as genai

@dataclass
class QualityMetrics:
    """Métricas de calidad de conversión"""
    overall_score: float  # 0-100
    text_preservation: float
    layout_preservation: float
    metadata_retention: float
    visual_fidelity: float
    accessibility_score: float
    file_size_efficiency: float
    compatibility_score: float

@dataclass
class ConversionPrediction:
    """Predicción de calidad de conversión"""
    predicted_quality: QualityMetrics
    confidence_level: float  # 0-1
    risk_factors: List[str]
    optimization_suggestions: List[str]
    expected_issues: List[str]
    processing_complexity: str  # 'low', 'medium', 'high'

@dataclass
class SmartRecommendation:
    """Recomendación inteligente de conversión"""
    target_format: str
    use_case: str
    quality_prediction: float
    speed_prediction: float
    cost_efficiency: float
    ai_reasoning: str
    best_for: List[str]
    avoid_if: List[str]

class AIQualityAssessment:
    """Sistema de evaluación de calidad con IA"""
    
    def __init__(self):
        # Configurar Gemini AI
        api_key = os.environ.get('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            self.ai_enabled = True
        else:
            self.model = None
            self.ai_enabled = False
            print("⚠️ Gemini API key not found. Quality assessment will use heuristics.")
        
        # Base de conocimiento de calidad por formato
        self.quality_knowledge_base = {
            'pdf': {
                'strengths': ['layout_preservation', 'universal_compatibility', 'print_ready'],
                'weaknesses': ['limited_editability', 'large_file_size'],
                'best_sources': ['docx', 'html', 'txt'],
                'quality_factors': ['text_clarity', 'image_compression', 'font_embedding']
            },
            'docx': {
                'strengths': ['full_editability', 'rich_formatting', 'collaboration_features'],
                'weaknesses': ['version_compatibility', 'complex_layout_issues'],
                'best_sources': ['txt', 'html', 'rtf'],
                'quality_factors': ['formatting_preservation', 'style_consistency', 'table_integrity']
            },
            'html': {
                'strengths': ['web_compatibility', 'responsive_design', 'accessibility'],
                'weaknesses': ['browser_differences', 'print_limitations'],
                'best_sources': ['md', 'txt', 'docx'],
                'quality_factors': ['semantic_markup', 'css_compatibility', 'mobile_responsiveness']
            },
            'txt': {
                'strengths': ['universal_compatibility', 'small_size', 'fast_processing'],
                'weaknesses': ['no_formatting', 'no_images', 'limited_structure'],
                'best_sources': ['pdf', 'docx', 'html'],
                'quality_factors': ['text_accuracy', 'encoding_preservation', 'line_breaks']
            }
        }

    async def predict_conversion_quality(self, file_path: str, filename: str, 
                                       source_format: str, target_format: str) -> ConversionPrediction:
        """Predice la calidad de conversión usando IA"""
        
        # Análisis técnico del archivo
        file_stats = self._analyze_file_technical_aspects(file_path, source_format)
        
        # Análisis con IA si está disponible
        if self.ai_enabled:
            ai_prediction = await self._predict_with_gemini(
                file_path, filename, source_format, target_format, file_stats
            )
        else:
            ai_prediction = self._predict_with_heuristics(
                source_format, target_format, file_stats
            )
        
        return ai_prediction

    async def generate_smart_recommendations(self, file_path: str, filename: str) -> List[SmartRecommendation]:
        """Genera recomendaciones inteligentes de formato"""
        
        source_format = filename.split('.')[-1].lower()
        file_stats = self._analyze_file_technical_aspects(file_path, source_format)
        
        recommendations = []
        
        # Obtener formatos disponibles
        available_formats = ['pdf', 'docx', 'html', 'txt', 'jpg', 'png']
        
        for target_format in available_formats:
            if target_format == source_format:
                continue
            
            # Generar recomendación para cada formato
            recommendation = await self._generate_format_recommendation(
                source_format, target_format, file_stats
            )
            
            if recommendation:
                recommendations.append(recommendation)
        
        # Ordenar por puntuación combinada
        recommendations.sort(
            key=lambda r: (r.quality_prediction * 0.4 + r.speed_prediction * 0.3 + r.cost_efficiency * 0.3),
            reverse=True
        )
        
        return recommendations[:5]  # Top 5 recomendaciones

    async def _predict_with_gemini(self, file_path: str, filename: str, 
                                 source_format: str, target_format: str, 
                                 file_stats: Dict) -> ConversionPrediction:
        """Predicción de calidad usando Gemini AI"""
        
        try:
            # Extraer muestra de contenido
            content_sample = self._extract_content_for_analysis(file_path, source_format)
            
            prompt = f"""
            Como experto en conversión de documentos, analiza esta conversión y predice la calidad:
            
            ARCHIVO:
            - Nombre: {filename}
            - Formato origen: {source_format}
            - Formato destino: {target_format}
            - Tamaño: {file_stats.get('size_mb', 0):.2f} MB
            - Complejidad detectada: {file_stats.get('complexity', 'medium')}
            
            MUESTRA DE CONTENIDO:
            {content_sample[:1500]}
            
            Proporciona un análisis JSON con:
            {{
                "quality_metrics": {{
                    "overall_score": 0-100,
                    "text_preservation": 0-100,
                    "layout_preservation": 0-100,
                    "metadata_retention": 0-100,
                    "visual_fidelity": 0-100,
                    "accessibility_score": 0-100,
                    "file_size_efficiency": 0-100,
                    "compatibility_score": 0-100
                }},
                "confidence_level": 0-1,
                "risk_factors": ["factor1", "factor2"],
                "optimization_suggestions": ["sugerencia1", "sugerencia2"],
                "expected_issues": ["issue1", "issue2"],
                "processing_complexity": "low|medium|high"
            }}
            
            Responde SOLO con JSON válido.
            """
            
            response = self.model.generate_content(prompt)
            
            # Parsear respuesta
            try:
                ai_data = json.loads(response.text)
                
                return ConversionPrediction(
                    predicted_quality=QualityMetrics(**ai_data['quality_metrics']),
                    confidence_level=ai_data['confidence_level'],
                    risk_factors=ai_data['risk_factors'],
                    optimization_suggestions=ai_data['optimization_suggestions'],
                    expected_issues=ai_data['expected_issues'],
                    processing_complexity=ai_data['processing_complexity']
                )
                
            except (json.JSONDecodeError, KeyError) as e:
                print(f"Error parsing Gemini response: {e}")
                return self._predict_with_heuristics(source_format, target_format, file_stats)
                
        except Exception as e:
            print(f"Error with Gemini prediction: {e}")
            return self._predict_with_heuristics(source_format, target_format, file_stats)

    def _predict_with_heuristics(self, source_format: str, target_format: str, 
                               file_stats: Dict) -> ConversionPrediction:
        """Predicción usando heurísticas cuando IA no está disponible"""
        
        # Matriz de calidad basada en experiencia
        quality_matrix = {
            ('txt', 'pdf'): 85, ('txt', 'html'): 90, ('txt', 'docx'): 80,
            ('md', 'html'): 95, ('md', 'pdf'): 80, ('md', 'txt'): 85,
            ('html', 'pdf'): 85, ('html', 'txt'): 90, ('html', 'docx'): 75,
            ('pdf', 'txt'): 70, ('pdf', 'html'): 65, ('pdf', 'docx'): 60,
            ('docx', 'pdf'): 90, ('docx', 'html'): 85, ('docx', 'txt'): 80,
            ('jpg', 'pdf'): 85, ('png', 'pdf'): 88, ('gif', 'pdf'): 75
        }
        
        base_quality = quality_matrix.get((source_format, target_format), 70)
        
        # Ajustar basado en estadísticas del archivo
        if file_stats.get('size_mb', 0) > 50:
            base_quality -= 10  # Archivos grandes pueden tener problemas
        if file_stats.get('complexity') == 'high':
            base_quality -= 15
        elif file_stats.get('complexity') == 'low':
            base_quality += 10
        
        return ConversionPrediction(
            predicted_quality=QualityMetrics(
                overall_score=base_quality,
                text_preservation=base_quality + 5,
                layout_preservation=base_quality - 10,
                metadata_retention=base_quality - 5,
                visual_fidelity=base_quality,
                accessibility_score=base_quality - 15,
                file_size_efficiency=85.0,
                compatibility_score=90.0
            ),
            confidence_level=0.7,
            risk_factors=self._get_heuristic_risks(source_format, target_format),
            optimization_suggestions=self._get_heuristic_optimizations(source_format, target_format),
            expected_issues=self._get_heuristic_issues(source_format, target_format),
            processing_complexity='medium'
        )

    def _analyze_file_technical_aspects(self, file_path: str, source_format: str) -> Dict[str, Any]:
        """Análisis técnico del archivo"""
        
        stats = os.stat(file_path)
        
        return {
            'size_bytes': stats.st_size,
            'size_mb': stats.st_size / (1024 * 1024),
            'created': datetime.fromtimestamp(stats.st_ctime),
            'modified': datetime.fromtimestamp(stats.st_mtime),
            'complexity': self._assess_file_complexity(file_path, source_format),
            'encoding_quality': self._assess_encoding_quality(file_path, source_format)
        }

    def _assess_file_complexity(self, file_path: str, source_format: str) -> str:
        """Evalúa la complejidad del archivo"""
        
        file_size = os.path.getsize(file_path)
        
        if source_format in ['txt', 'md']:
            if file_size < 10_000:  # < 10KB
                return 'low'
            elif file_size < 100_000:  # < 100KB
                return 'medium'
            else:
                return 'high'
        
        elif source_format in ['pdf', 'docx']:
            if file_size < 500_000:  # < 500KB
                return 'low'
            elif file_size < 5_000_000:  # < 5MB
                return 'medium'
            else:
                return 'high'
        
        return 'medium'

    def _assess_encoding_quality(self, file_path: str, source_format: str) -> float:
        """Evalúa la calidad de codificación"""
        
        if source_format not in ['txt', 'md', 'html', 'rtf']:
            return 1.0  # No aplica para archivos binarios
        
        try:
            with open(file_path, 'rb') as f:
                raw_data = f.read(1024)
            
            # Intentar UTF-8
            try:
                raw_data.decode('utf-8')
                return 1.0
            except UnicodeDecodeError:
                return 0.6  # Codificación legacy
                
        except Exception:
            return 0.3

    def _extract_content_for_analysis(self, file_path: str, source_format: str) -> str:
        """Extrae contenido para análisis IA"""
        
        try:
            if source_format in ['txt', 'md', 'html']:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read(2000)
            elif source_format == 'pdf':
                try:
                    from pypdf import PdfReader
                    reader = PdfReader(file_path)
                    if reader.pages:
                        return reader.pages[0].extract_text()[:2000]
                except:
                    pass
            
            return f"Archivo binario de tipo {source_format}"
            
        except Exception:
            return "Error leyendo contenido"

    async def _generate_format_recommendation(self, source_format: str, target_format: str, 
                                            file_stats: Dict) -> Optional[SmartRecommendation]:
        """Genera recomendación inteligente para un formato específico"""
        
        if not self.ai_enabled:
            return self._generate_heuristic_recommendation(source_format, target_format, file_stats)
        
        try:
            prompt = f"""
            Como experto en conversión de documentos, evalúa esta conversión:
            
            Conversión: {source_format.upper()} → {target_format.upper()}
            Tamaño archivo: {file_stats.get('size_mb', 0):.2f} MB
            Complejidad: {file_stats.get('complexity', 'medium')}
            
            Proporciona análisis JSON:
            {{
                "use_case": "descripción del caso de uso principal",
                "quality_prediction": 0-100,
                "speed_prediction": 0-100,
                "cost_efficiency": 0-100,
                "ai_reasoning": "explicación detallada de por qué es buena/mala opción",
                "best_for": ["caso1", "caso2", "caso3"],
                "avoid_if": ["situacion1", "situacion2"]
            }}
            
            Responde SOLO con JSON válido.
            """
            
            response = self.model.generate_content(prompt)
            ai_data = json.loads(response.text)
            
            return SmartRecommendation(
                target_format=target_format,
                use_case=ai_data['use_case'],
                quality_prediction=ai_data['quality_prediction'],
                speed_prediction=ai_data['speed_prediction'],
                cost_efficiency=ai_data['cost_efficiency'],
                ai_reasoning=ai_data['ai_reasoning'],
                best_for=ai_data['best_for'],
                avoid_if=ai_data['avoid_if']
            )
            
        except Exception as e:
            print(f"Error generating AI recommendation: {e}")
            return self._generate_heuristic_recommendation(source_format, target_format, file_stats)

    def _generate_heuristic_recommendation(self, source_format: str, target_format: str, 
                                         file_stats: Dict) -> SmartRecommendation:
        """Genera recomendación usando heurísticas"""
        
        # Matriz de recomendaciones basada en experiencia
        recommendations = {
            ('txt', 'pdf'): {
                'use_case': 'Documentos para impresión o distribución',
                'quality': 85, 'speed': 90, 'cost': 95,
                'reasoning': 'Conversión directa y eficiente, ideal para documentos simples',
                'best_for': ['Informes', 'Documentación', 'Archivos'],
                'avoid_if': ['Necesitas editar después', 'Contenido muy largo']
            },
            ('md', 'html'): {
                'use_case': 'Publicación web y documentación',
                'quality': 95, 'speed': 95, 'cost': 90,
                'reasoning': 'Conversión nativa, preserva formato y estructura perfectamente',
                'best_for': ['Blogs', 'Documentación técnica', 'Sitios web'],
                'avoid_if': ['Necesitas formato impreso', 'Uso offline']
            },
            ('pdf', 'docx'): {
                'use_case': 'Edición de documentos PDF',
                'quality': 60, 'speed': 70, 'cost': 70,
                'reasoning': 'Conversión compleja, puede perder formato original',
                'best_for': ['Edición básica', 'Extracción de texto'],
                'avoid_if': ['Documentos complejos', 'Layout crítico']
            }
        }
        
        rec_data = recommendations.get((source_format, target_format), {
            'use_case': f'Conversión {source_format} a {target_format}',
            'quality': 75, 'speed': 75, 'cost': 75,
            'reasoning': 'Conversión estándar disponible',
            'best_for': ['Uso general'],
            'avoid_if': ['Requisitos específicos']
        })
        
        return SmartRecommendation(
            target_format=target_format,
            use_case=rec_data['use_case'],
            quality_prediction=rec_data['quality'],
            speed_prediction=rec_data['speed'],
            cost_efficiency=rec_data['cost'],
            ai_reasoning=rec_data['reasoning'],
            best_for=rec_data['best_for'],
            avoid_if=rec_data['avoid_if']
        )

    def _get_heuristic_risks(self, source: str, target: str) -> List[str]:
        """Obtiene factores de riesgo usando heurísticas"""
        
        risks = []
        
        if source == 'pdf' and target in ['docx', 'html']:
            risks.append("Posible pérdida de formato complejo")
            risks.append("Tablas pueden requerir ajuste manual")
        
        if source in ['jpg', 'jpeg'] and target == 'pdf':
            risks.append("Posible pérdida de calidad por compresión")
        
        if source == 'txt' and target in ['pdf', 'docx']:
            risks.append("Sin formato original para preservar")
        
        return risks

    def _get_heuristic_optimizations(self, source: str, target: str) -> List[str]:
        """Obtiene sugerencias de optimización"""
        
        optimizations = []
        
        if target == 'pdf':
            optimizations.append("Usar alta resolución para mejor calidad")
            optimizations.append("Optimizar para impresión si es necesario")
        
        if target in ['html', 'txt']:
            optimizations.append("Preservar codificación UTF-8")
            optimizations.append("Mantener estructura de párrafos")
        
        return optimizations

    def _get_heuristic_issues(self, source: str, target: str) -> List[str]:
        """Obtiene problemas esperados"""
        
        issues = []
        
        if source == 'pdf':
            issues.append("Texto puede aparecer desordenado")
            issues.append("Imágenes pueden perderse")
        
        if target == 'html':
            issues.append("Requiere CSS para formato completo")
        
        return issues

# Instancia global del evaluador de calidad
ai_quality_assessor = AIQualityAssessment()
