"""
Monitor de rendimiento para el sistema de conversión inteligente HTML a PDF
Recopila métricas de tiempo, calidad y uso de recursos
"""

import time
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
from dataclasses import dataclass, asdict
from pathlib import Path

logger = logging.getLogger(__name__)

@dataclass
class ConversionMetrics:
    """Métricas de una conversión individual"""
    timestamp: str
    input_file: str
    output_file: str
    html_complexity_score: int
    html_complexity_level: str
    recommended_method: str
    actual_method_used: str
    conversion_duration: float
    input_file_size: int
    output_file_size: int
    success: bool
    error_message: Optional[str] = None
    user_satisfaction: Optional[int] = None  # 1-5 rating if available

class ConversionPerformanceMonitor:
    """Monitor de rendimiento del sistema de conversión"""
    
    def __init__(self, metrics_file: str = "conversion_metrics.json"):
        self.metrics_file = Path(metrics_file)
        self.metrics_data = self._load_metrics()
    
    def _load_metrics(self) -> List[Dict]:
        """Carga métricas existentes desde archivo"""
        if self.metrics_file.exists():
            try:
                with open(self.metrics_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Error cargando métricas: {e}")
                return []
        return []
    
    def _save_metrics(self):
        """Guarda métricas al archivo"""
        try:
            with open(self.metrics_file, 'w', encoding='utf-8') as f:
                json.dump(self.metrics_data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error guardando métricas: {e}")
    
    def record_conversion(self, metrics: ConversionMetrics):
        """Registra métricas de una conversión"""
        self.metrics_data.append(asdict(metrics))
        self._save_metrics()
        logger.info(f"Métricas registradas para {metrics.input_file}")
    
    def get_performance_report(self, days: int = 7) -> Dict:
        """Genera reporte de rendimiento de los últimos N días"""
        
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_metrics = [
            m for m in self.metrics_data 
            if datetime.fromisoformat(m['timestamp']) >= cutoff_date
        ]
        
        if not recent_metrics:
            return {"error": "No hay datos suficientes para generar reporte"}
        
        # Calcular estadísticas generales
        total_conversions = len(recent_metrics)
        successful_conversions = sum(1 for m in recent_metrics if m['success'])
        success_rate = (successful_conversions / total_conversions) * 100
        
        # Estadísticas por método
        method_stats = {}
        for metric in recent_metrics:
            method = metric['actual_method_used']
            if method not in method_stats:
                method_stats[method] = {
                    'count': 0,
                    'success_count': 0,
                    'total_duration': 0,
                    'total_output_size': 0,
                    'complexity_scores': []
                }
            
            stats = method_stats[method]
            stats['count'] += 1
            if metric['success']:
                stats['success_count'] += 1
            stats['total_duration'] += metric['conversion_duration']
            stats['total_output_size'] += metric['output_file_size']
            stats['complexity_scores'].append(metric['html_complexity_score'])
        
        # Calcular promedios por método
        for method, stats in method_stats.items():
            stats['success_rate'] = (stats['success_count'] / stats['count']) * 100
            stats['avg_duration'] = stats['total_duration'] / stats['count']
            stats['avg_output_size'] = stats['total_output_size'] / stats['count']
            stats['avg_complexity'] = sum(stats['complexity_scores']) / len(stats['complexity_scores'])
        
        # Estadísticas por nivel de complejidad
        complexity_stats = {}
        for metric in recent_metrics:
            level = metric['html_complexity_level']
            if level not in complexity_stats:
                complexity_stats[level] = {
                    'count': 0,
                    'avg_duration': 0,
                    'avg_output_size': 0,
                    'most_used_method': {}
                }
            
            complexity_stats[level]['count'] += 1
            complexity_stats[level]['avg_duration'] += metric['conversion_duration']
            complexity_stats[level]['avg_output_size'] += metric['output_file_size']
            
            method = metric['actual_method_used']
            if method not in complexity_stats[level]['most_used_method']:
                complexity_stats[level]['most_used_method'][method] = 0
            complexity_stats[level]['most_used_method'][method] += 1
        
        # Finalizar cálculos de complejidad
        for level, stats in complexity_stats.items():
            stats['avg_duration'] /= stats['count']
            stats['avg_output_size'] /= stats['count']
            # Encontrar método más usado
            most_used = max(stats['most_used_method'].items(), key=lambda x: x[1])
            stats['most_used_method'] = most_used[0]
        
        # Tendencias de rendimiento
        daily_stats = {}
        for metric in recent_metrics:
            date = datetime.fromisoformat(metric['timestamp']).date().isoformat()
            if date not in daily_stats:
                daily_stats[date] = {
                    'conversions': 0,
                    'successful': 0,
                    'total_duration': 0,
                    'avg_complexity': 0
                }
            
            daily_stats[date]['conversions'] += 1
            if metric['success']:
                daily_stats[date]['successful'] += 1
            daily_stats[date]['total_duration'] += metric['conversion_duration']
            daily_stats[date]['avg_complexity'] += metric['html_complexity_score']
        
        # Finalizar estadísticas diarias
        for date, stats in daily_stats.items():
            stats['success_rate'] = (stats['successful'] / stats['conversions']) * 100
            stats['avg_duration'] = stats['total_duration'] / stats['conversions']
            stats['avg_complexity'] /= stats['conversions']
        
        return {
            'period': f"Últimos {days} días",
            'generated_at': datetime.now().isoformat(),
            'summary': {
                'total_conversions': total_conversions,
                'successful_conversions': successful_conversions,
                'success_rate': round(success_rate, 2),
                'avg_duration': round(sum(m['conversion_duration'] for m in recent_metrics) / total_conversions, 2),
                'avg_output_size': round(sum(m['output_file_size'] for m in recent_metrics) / total_conversions, 0)
            },
            'method_performance': {
                method: {
                    'count': stats['count'],
                    'success_rate': round(stats['success_rate'], 2),
                    'avg_duration': round(stats['avg_duration'], 2),
                    'avg_output_size': round(stats['avg_output_size'], 0),
                    'avg_complexity': round(stats['avg_complexity'], 1)
                }
                for method, stats in method_stats.items()
            },
            'complexity_analysis': {
                level: {
                    'count': stats['count'],
                    'avg_duration': round(stats['avg_duration'], 2),
                    'avg_output_size': round(stats['avg_output_size'], 0),
                    'preferred_method': stats['most_used_method']
                }
                for level, stats in complexity_stats.items()
            },
            'daily_trends': daily_stats
        }
    
    def get_method_recommendations(self) -> Dict:
        """Analiza datos históricos para mejorar recomendaciones de métodos"""
        
        if len(self.metrics_data) < 10:
            return {"error": "Datos insuficientes para análisis (mínimo 10 conversiones)"}
        
        # Analizar precisión de recomendaciones por rango de complejidad
        complexity_ranges = {
            'SIMPLE': (0, 30),
            'MODERADA': (31, 70),
            'COMPLEJA': (71, 120),
            'MUY_COMPLEJA': (121, 200)
        }
        
        recommendations = {}
        
        for level, (min_score, max_score) in complexity_ranges.items():
            relevant_metrics = [
                m for m in self.metrics_data
                if min_score <= m['html_complexity_score'] <= max_score
                and m['success']
            ]
            
            if not relevant_metrics:
                continue
            
            # Analizar rendimiento por método en este rango
            method_performance = {}
            for metric in relevant_metrics:
                method = metric['actual_method_used']
                if method not in method_performance:
                    method_performance[method] = {
                        'count': 0,
                        'total_duration': 0,
                        'total_size': 0,
                        'quality_score': 0
                    }
                
                perf = method_performance[method]
                perf['count'] += 1
                perf['total_duration'] += metric['conversion_duration']
                perf['total_size'] += metric['output_file_size']
                # Calcular score de calidad basado en tamaño vs tiempo
                perf['quality_score'] += metric['output_file_size'] / max(metric['conversion_duration'], 0.1)
            
            # Calcular métricas finales y recomendar mejor método
            best_method = None
            best_score = 0
            
            for method, perf in method_performance.items():
                avg_duration = perf['total_duration'] / perf['count']
                avg_size = perf['total_size'] / perf['count']
                avg_quality = perf['quality_score'] / perf['count']
                
                # Score combinado: calidad/tiempo (mayor es mejor)
                combined_score = avg_quality / avg_duration
                
                if combined_score > best_score:
                    best_score = combined_score
                    best_method = method
            
            recommendations[level] = {
                'recommended_method': best_method,
                'sample_size': len(relevant_metrics),
                'method_analysis': {
                    method: {
                        'count': perf['count'],
                        'avg_duration': round(perf['total_duration'] / perf['count'], 2),
                        'avg_output_size': round(perf['total_size'] / perf['count'], 0),
                        'quality_efficiency': round(perf['quality_score'] / perf['count'], 2)
                    }
                    for method, perf in method_performance.items()
                }
            }
        
        return recommendations

def create_performance_monitor() -> ConversionPerformanceMonitor:
    """Factory function para crear monitor de rendimiento"""
    return ConversionPerformanceMonitor()

# Ejemplo de uso
if __name__ == "__main__":
    monitor = create_performance_monitor()
    
    # Simular algunas métricas de ejemplo
    example_metrics = [
        ConversionMetrics(
            timestamp=datetime.now().isoformat(),
            input_file="test.html",
            output_file="test.pdf",
            html_complexity_score=45,
            html_complexity_level="MODERADA",
            recommended_method="weasyprint",
            actual_method_used="playwright",
            conversion_duration=2.5,
            input_file_size=5000,
            output_file_size=150000,
            success=True
        )
    ]
    
    for metrics in example_metrics:
        monitor.record_conversion(metrics)
    
    # Generar reporte
    report = monitor.get_performance_report(days=30)
    print(json.dumps(report, indent=2, ensure_ascii=False))
