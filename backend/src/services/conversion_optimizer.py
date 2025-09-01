"""
Motor de Optimización de Secuencias de Conversión
Analiza y sugiere secuencias optimizadas para mejorar calidad
"""
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class ConversionPath:
    """Representa una ruta de conversión"""
    steps: List[str]
    total_cost: int
    quality_score: float
    description: str
    advantages: List[str]
    time_estimate: str

class ConversionOptimizer:
    """Optimizador de secuencias de conversión"""
    
    def __init__(self):
        # Matriz de calidad: qué tan buena es cada conversión directa (0-100)
        self.quality_matrix = {
            # Documentos
            ('txt', 'pdf'): 85,
            ('txt', 'docx'): 95,
            ('txt', 'html'): 90,
            ('docx', 'pdf'): 95,
            ('docx', 'html'): 85,
            ('html', 'pdf'): 80,
            ('md', 'html'): 95,
            ('md', 'pdf'): 75,  # Mejor vía HTML
            ('md', 'docx'): 70,  # Mejor vía HTML
            
            # Imágenes
            ('jpg', 'png'): 90,
            ('png', 'jpg'): 85,
            ('webp', 'jpg'): 95,
            ('webp', 'png'): 95,
            ('tiff', 'jpg'): 90,
            ('gif', 'jpg'): 80,
            ('gif', 'png'): 85,
            
            # Datos
            ('csv', 'html'): 95,
            ('csv', 'pdf'): 70,  # Mejor vía HTML
            ('json', 'html'): 90,
            ('json', 'csv'): 85,
            
            # Libros
            ('epub', 'html'): 90,
            ('epub', 'pdf'): 75,  # Mejor vía HTML
            ('epub', 'txt'): 80,
        }
        
        # Secuencias optimizadas conocidas
        self.optimized_sequences = {
            ('md', 'pdf'): {
                'sequence': ['md', 'html', 'pdf'],
                'quality_improvement': 20,
                'cost_multiplier': 1.5,
                'description': 'Conversión vía HTML para mejor formato',
                'advantages': [
                    'Preserva mejor el formato y estructura',
                    'Mantiene enlaces y referencias',
                    'Mejor renderizado de tablas y listas'
                ]
            },
            ('csv', 'pdf'): {
                'sequence': ['csv', 'html', 'pdf'],
                'quality_improvement': 25,
                'cost_multiplier': 1.8,
                'description': 'Conversión vía HTML para tabla estructurada',
                'advantages': [
                    'Genera tabla HTML bien formateada',
                    'Preserva estructura de datos',
                    'Mejor legibilidad y formato'
                ]
            },
            ('epub', 'pdf'): {
                'sequence': ['epub', 'html', 'pdf'],
                'quality_improvement': 15,
                'cost_multiplier': 1.6,
                'description': 'Conversión vía HTML para mejor layout',
                'advantages': [
                    'Mantiene estructura de capítulos',
                    'Preserva formato de texto',
                    'Mejor paginación'
                ]
            },
            ('json', 'pdf'): {
                'sequence': ['json', 'html', 'pdf'],
                'quality_improvement': 30,
                'cost_multiplier': 1.7,
                'description': 'Conversión vía HTML para visualización estructurada',
                'advantages': [
                    'Formato visual atractivo',
                    'Estructura jerárquica clara',
                    'Mejor legibilidad de datos'
                ]
            },
            ('rtf', 'html'): {
                'sequence': ['rtf', 'docx', 'html'],
                'quality_improvement': 18,
                'cost_multiplier': 1.4,
                'description': 'Conversión vía DOCX para mejor compatibilidad',
                'advantages': [
                    'Preserva formato enriquecido',
                    'Mejor manejo de estilos',
                    'Compatibilidad mejorada'
                ]
            }
        }

    def analyze_conversion_options(self, source_format: str, target_format: str, base_cost: int) -> Dict:
        """Analiza opciones de conversión directa vs optimizada"""
        source_format = source_format.lower()
        target_format = target_format.lower()
        
        # Conversión directa
        direct_quality = self.quality_matrix.get((source_format, target_format), 75)
        direct_path = ConversionPath(
            steps=[source_format, target_format],
            total_cost=base_cost,
            quality_score=direct_quality,
            description=f"Conversión directa {source_format.upper()} → {target_format.upper()}",
            advantages=[
                "Conversión rápida",
                "Menor costo en créditos",
                "Proceso simple"
            ],
            time_estimate="30-60 segundos"
        )
        
        # Buscar secuencia optimizada
        optimized_path = None
        sequence_key = (source_format, target_format)
        
        if sequence_key in self.optimized_sequences:
            seq_info = self.optimized_sequences[sequence_key]
            optimized_cost = int(base_cost * seq_info['cost_multiplier'])
            optimized_quality = min(95, direct_quality + seq_info['quality_improvement'])
            
            optimized_path = ConversionPath(
                steps=seq_info['sequence'],
                total_cost=optimized_cost,
                quality_score=optimized_quality,
                description=seq_info['description'],
                advantages=seq_info['advantages'],
                time_estimate="1-2 minutos"
            )
        
        return {
            'direct': {
                'steps': direct_path.steps,
                'cost': direct_path.total_cost,
                'quality': direct_path.quality_score,
                'description': direct_path.description,
                'advantages': direct_path.advantages,
                'time_estimate': direct_path.time_estimate,
                'recommended': optimized_path is None or direct_quality >= 90
            },
            'optimized': {
                'steps': optimized_path.steps if optimized_path else None,
                'cost': optimized_path.total_cost if optimized_path else None,
                'quality': optimized_path.quality_score if optimized_path else None,
                'description': optimized_path.description if optimized_path else None,
                'advantages': optimized_path.advantages if optimized_path else None,
                'time_estimate': optimized_path.time_estimate if optimized_path else None,
                'quality_improvement': seq_info['quality_improvement'] if sequence_key in self.optimized_sequences else 0,
                'cost_increase': optimized_path.total_cost - base_cost if optimized_path else 0,
                'recommended': optimized_path and optimized_path.quality_score > direct_quality + 10
            } if optimized_path else None,
            'recommendation': self._get_recommendation(direct_path, optimized_path)
        }

    def _get_recommendation(self, direct: ConversionPath, optimized: Optional[ConversionPath]) -> Dict:
        """Genera recomendación basada en análisis"""
        if not optimized:
            return {
                'type': 'direct',
                'reason': 'La conversión directa es óptima para este caso',
                'confidence': 'high'
            }
        
        quality_diff = optimized.quality_score - direct.quality_score
        cost_diff = optimized.total_cost - direct.total_cost
        
        if quality_diff >= 20:
            return {
                'type': 'optimized',
                'reason': f'Mejora significativa de calidad (+{quality_diff:.0f}%)',
                'confidence': 'high'
            }
        elif quality_diff >= 10 and cost_diff <= direct.total_cost:
            return {
                'type': 'optimized',
                'reason': f'Mejor calidad con costo razonable (+{quality_diff:.0f}%)',
                'confidence': 'medium'
            }
        else:
            return {
                'type': 'direct',
                'reason': 'La conversión directa ofrece mejor relación calidad/precio',
                'confidence': 'medium'
            }

    def get_format_compatibility_score(self, source_format: str, target_format: str) -> Dict:
        """Obtiene puntuación de compatibilidad entre formatos"""
        source_format = source_format.lower()
        target_format = target_format.lower()
        
        # Matriz de compatibilidad
        compatibility_scores = {
            # Documentos → Documentos (alta compatibilidad)
            ('txt', 'docx'): 95,
            ('txt', 'html'): 90,
            ('docx', 'pdf'): 95,
            ('html', 'pdf'): 85,
            
            # Imágenes → Imágenes (alta compatibilidad)
            ('png', 'jpg'): 90,
            ('webp', 'jpg'): 95,
            ('tiff', 'jpg'): 90,
            
            # Datos → Visualización (media compatibilidad)
            ('csv', 'html'): 95,
            ('json', 'html'): 90,
            ('csv', 'pdf'): 70,
            
            # Cross-category (baja compatibilidad)
            ('txt', 'jpg'): 30,
            ('csv', 'jpg'): 20,
        }
        
        score = compatibility_scores.get((source_format, target_format), 60)
        
        return {
            'score': score,
            'level': 'high' if score >= 85 else 'medium' if score >= 60 else 'low',
            'description': self._get_compatibility_description(score)
        }

    def _get_compatibility_description(self, score: int) -> str:
        """Genera descripción de compatibilidad"""
        if score >= 90:
            return "Excelente compatibilidad - Conversión óptima"
        elif score >= 80:
            return "Buena compatibilidad - Resultado de alta calidad"
        elif score >= 60:
            return "Compatibilidad aceptable - Resultado estándar"
        else:
            return "Compatibilidad limitada - Considere formato alternativo"

# Instancia global del optimizador
conversion_optimizer = ConversionOptimizer()
