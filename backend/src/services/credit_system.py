"""
Sistema de Créditos Avanzado para Anclora Nexus
Implementa valoración dinámica basada en 5 factores principales
"""
import os
import time
import json
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional

class CreditCalculator:
    """Calculadora de créditos basada en múltiples factores"""
    
    def __init__(self):
        # Factores de ponderación (suman 100%)
        self.weights = {
            'complexity': 0.35,      # Complejidad computacional
            'processing_time': 0.25, # Tiempo de procesamiento
            'resources': 0.20,       # Recursos de infraestructura
            'value': 0.15,          # Valor añadido percibido
            'demand': 0.05          # Frecuencia de uso y demanda
        }
        
        # Configuraciones de conversión por tipo
        self.conversion_configs = self._load_conversion_configs()
        
        # Multiplicadores dinámicos
        self.size_multipliers = {
            'small': (0, 10 * 1024 * 1024, 1.0),      # < 10MB
            'medium': (10 * 1024 * 1024, 100 * 1024 * 1024, 1.3),  # 10-100MB
            'large': (100 * 1024 * 1024, 1024 * 1024 * 1024, 1.8), # 100MB-1GB
            'xlarge': (1024 * 1024 * 1024, float('inf'), 2.5)       # > 1GB
        }
        
        self.quality_multipliers = {
            'standard': 1.0,
            'high': 1.4,
            'maximum': 2.0
        }
    
    def _load_conversion_configs(self) -> Dict:
        """Carga configuraciones de conversión con valores por defecto"""
        return {
            # Nivel 1: Conversiones Básicas (1-2 créditos base)
            'basic_image': {
                'base_credits': 1.0,
                'complexity': 0.5, 'processing_time': 0.3, 'resources': 0.4,
                'value': 0.6, 'demand': 1.2,
                'conversions': [
                    ('jpg', 'png'), ('png', 'jpg'), ('gif', 'png'), ('webp', 'jpg')
                ]
            },
            'basic_document': {
                'base_credits': 1.0,
                'complexity': 0.8, 'processing_time': 0.5, 'resources': 0.6,
                'value': 0.8, 'demand': 1.1,
                'conversions': [
                    ('txt', 'pdf'), ('txt', 'html'), ('md', 'html')
                ]
            },
            
            # Nivel 2: Conversiones Estándar (3-5 créditos base)
            'standard_document': {
                'base_credits': 3.0,
                'complexity': 1.5, 'processing_time': 1.2, 'resources': 1.0,
                'value': 1.2, 'demand': 1.0,
                'conversions': [
                    ('docx', 'pdf'), ('html', 'pdf'), ('md', 'pdf'), ('csv', 'html')
                ]
            },
            'standard_image': {
                'base_credits': 2.0,
                'complexity': 1.0, 'processing_time': 0.8, 'resources': 0.8,
                'value': 1.0, 'demand': 1.0,
                'conversions': [
                    ('png', 'pdf'), ('jpg', 'pdf'), ('svg', 'png')
                ]
            },
            
            # Nivel 3: Conversiones Avanzadas (6-10 créditos base)
            'advanced_document': {
                'base_credits': 6.0,
                'complexity': 2.5, 'processing_time': 2.0, 'resources': 1.8,
                'value': 1.8, 'demand': 0.9,
                'conversions': [
                    ('epub', 'pdf'), ('rtf', 'docx'), ('odt', 'pdf')
                ]
            },
            'ai_enhanced': {
                'base_credits': 8.0,
                'complexity': 3.0, 'processing_time': 2.5, 'resources': 2.2,
                'value': 2.0, 'demand': 0.8,
                'conversions': [
                    ('any', 'ai_optimized')  # Conversiones con IA
                ]
            },
            
            # Nivel 4: Conversiones Profesionales (11-20 créditos base)
            'professional': {
                'base_credits': 15.0,
                'complexity': 4.0, 'processing_time': 3.5, 'resources': 3.0,
                'value': 2.2, 'demand': 0.7,
                'conversions': [
                    ('video_4k', 'any'), ('audio_professional', 'any')
                ]
            }
        }
    
    def calculate_credits(self, source_format: str, target_format: str, 
                         file_size: int = 0, quality: str = 'standard',
                         ai_enhanced: bool = False) -> Tuple[float, Dict]:
        """Calcula créditos necesarios para una conversión"""
        
        # Encontrar configuración apropiada
        config = self._find_conversion_config(source_format, target_format, ai_enhanced)
        
        # Calcular créditos base usando la fórmula
        base_credits = config['base_credits']
        
        # Aplicar fórmula de factores ponderados
        factor_score = (
            self.weights['complexity'] * config['complexity'] +
            self.weights['processing_time'] * config['processing_time'] +
            self.weights['resources'] * config['resources'] +
            self.weights['value'] * config['value'] +
            self.weights['demand'] * config['demand']
        )
        
        # Calcular créditos con factores
        credits = base_credits * factor_score
        
        # Aplicar multiplicadores
        size_multiplier = self._get_size_multiplier(file_size)
        quality_multiplier = self.quality_multipliers.get(quality, 1.0)
        
        final_credits = credits * size_multiplier * quality_multiplier
        
        # Redondear a 2 decimales
        final_credits = round(final_credits, 2)
        
        # Información detallada del cálculo
        calculation_details = {
            'base_credits': base_credits,
            'factor_score': round(factor_score, 3),
            'size_multiplier': size_multiplier,
            'quality_multiplier': quality_multiplier,
            'final_credits': final_credits,
            'breakdown': {
                'complexity': config['complexity'],
                'processing_time': config['processing_time'],
                'resources': config['resources'],
                'value': config['value'],
                'demand': config['demand']
            }
        }
        
        return final_credits, calculation_details
    
    def _find_conversion_config(self, source: str, target: str, ai_enhanced: bool) -> Dict:
        """Encuentra la configuración apropiada para una conversión"""
        
        # Si es conversión con IA
        if ai_enhanced:
            return self.conversion_configs['ai_enhanced']
        
        # Buscar en configuraciones específicas
        conversion_tuple = (source.lower(), target.lower())
        
        for config_name, config in self.conversion_configs.items():
            if conversion_tuple in config['conversions']:
                return config
        
        # Clasificación automática basada en tipos de archivo
        if source.lower() in ['jpg', 'png', 'gif', 'webp'] and target.lower() in ['jpg', 'png', 'gif', 'webp']:
            return self.conversion_configs['basic_image']
        elif source.lower() in ['txt', 'md'] and target.lower() in ['html', 'pdf']:
            return self.conversion_configs['basic_document']
        elif source.lower() in ['docx', 'html'] and target.lower() == 'pdf':
            return self.conversion_configs['standard_document']
        elif source.lower() in ['epub', 'rtf', 'odt']:
            return self.conversion_configs['advanced_document']
        else:
            # Configuración por defecto para conversiones no clasificadas
            return {
                'base_credits': 2.0,
                'complexity': 1.0, 'processing_time': 1.0, 'resources': 1.0,
                'value': 1.0, 'demand': 1.0
            }
    
    def _get_size_multiplier(self, file_size: int) -> float:
        """Calcula multiplicador basado en tamaño de archivo"""
        for size_range, (min_size, max_size, multiplier) in self.size_multipliers.items():
            if min_size <= file_size < max_size:
                return multiplier
        return 1.0
    
    def get_conversion_estimate(self, source_format: str, target_format: str,
                              file_size: int = 0, quality: str = 'standard') -> Dict:
        """Proporciona estimación completa de conversión"""
        
        credits, details = self.calculate_credits(source_format, target_format, file_size, quality)
        
        # Estimación de tiempo de procesamiento
        estimated_time = self._estimate_processing_time(source_format, target_format, file_size)
        
        return {
            'credits_required': credits,
            'estimated_time_seconds': estimated_time,
            'calculation_details': details,
            'recommendations': self._get_conversion_recommendations(source_format, target_format)
        }
    
    def _estimate_processing_time(self, source: str, target: str, file_size: int) -> int:
        """Estima tiempo de procesamiento en segundos"""
        base_time = 2  # 2 segundos base
        
        # Factor por tipo de conversión
        if target.lower() == 'pdf':
            base_time *= 2
        elif source.lower() in ['epub', 'docx']:
            base_time *= 1.5
        
        # Factor por tamaño de archivo
        size_mb = file_size / (1024 * 1024)
        if size_mb > 10:
            base_time += int(size_mb / 10)
        
        return max(base_time, 1)
    
    def _get_conversion_recommendations(self, source: str, target: str) -> list:
        """Genera recomendaciones para la conversión"""
        recommendations = []
        
        if target.lower() == 'pdf':
            recommendations.append("Para mejor calidad, usa configuración 'high'")
        
        if source.lower() in ['docx', 'odt'] and target.lower() == 'html':
            recommendations.append("La conversión preservará formato básico")
        
        if source.lower() == 'csv':
            recommendations.append("Los datos se mostrarán en formato de tabla")
        
        return recommendations

# Instancia global del calculador de créditos
credit_calculator = CreditCalculator()
