"""
Motor de Rutas Inteligente para Anclora Nexus
Encuentra automáticamente la mejor ruta de conversión entre formatos
"""

import logging
from typing import List, Dict, Tuple, Optional, Set
from dataclasses import dataclass
from pathlib import Path
import networkx as nx
import json
import os

@dataclass
class ConversionRoute:
    """Representa una ruta de conversión"""
    source_format: str
    target_format: str
    steps: List[Tuple[str, str]]  # Lista de (formato_origen, formato_destino)
    estimated_time: float  # Tiempo estimado en segundos
    quality_score: float  # Puntuación de calidad (0-1)
    complexity: int  # Número de pasos
    description: str  # Descripción legible de la ruta

@dataclass
class ConversionMetrics:
    """Métricas de una conversión específica"""
    success_rate: float  # Tasa de éxito (0-1)
    avg_time: float  # Tiempo promedio en segundos
    quality_rating: float  # Calificación de calidad (0-1)
    file_size_ratio: float  # Ratio de tamaño de archivo resultante
    popularity: int  # Número de veces utilizada

class IntelligentRouter:
    """Motor de rutas inteligente para conversiones"""
    
    def __init__(self):
        self.conversion_graph = nx.DiGraph()
        self.conversion_metrics: Dict[Tuple[str, str], ConversionMetrics] = {}
        self.format_priorities: Dict[str, int] = {}
        self.quality_weights = {
            'direct_conversion': 1.0,
            'two_step_conversion': 0.8,
            'three_step_conversion': 0.6,
            'four_plus_step': 0.4
        }
        self._initialize_graph()
        self._load_metrics()
    
    def _initialize_graph(self):
        """Inicializar el grafo de conversiones con todas las conversiones disponibles"""
        try:
            # Importar el motor de conversiones existente
            from src.models.conversion import conversion_engine
            
            # Agregar todas las conversiones como aristas en el grafo
            for (source, target), converter in conversion_engine.conversion_methods.items():
                self.conversion_graph.add_edge(
                    source, target,
                    converter=converter,
                    weight=1.0,  # Peso base
                    direct=True
                )
                
                logging.info(f"Agregada conversión directa: {source} → {target}")
            
            # Establecer prioridades de formato basadas en popularidad y utilidad
            self._set_format_priorities()
            
        except Exception as e:
            logging.error(f"Error inicializando grafo de conversiones: {e}")
    
    def _set_format_priorities(self):
        """Establecer prioridades de formato basadas en popularidad y utilidad"""
        self.format_priorities = {
            # Formatos de alta prioridad (más utilizados/útiles)
            'pdf': 10,
            'docx': 9,
            'xlsx': 9,
            'png': 8,
            'jpg': 8,
            'html': 8,
            'json': 7,
            'csv': 7,
            'txt': 6,
            'md': 6,
            
            # Formatos de prioridad media
            'svg': 5,
            'webp': 5,
            'gif': 4,
            'rtf': 4,
            'odt': 3,
            'epub': 3,
            
            # Formatos de baja prioridad
            'tiff': 2,
            'mp4': 2,
            'doc': 1,
        }
    
    def _load_metrics(self):
        """Cargar métricas históricas de conversiones"""
        try:
            metrics_file = Path("data/conversion_metrics.json")
            if metrics_file.exists():
                with open(metrics_file, 'r') as f:
                    data = json.load(f)
                    
                for key, metrics_data in data.items():
                    source, target = key.split('→')
                    self.conversion_metrics[(source, target)] = ConversionMetrics(**metrics_data)
            else:
                # Inicializar con métricas por defecto
                self._initialize_default_metrics()
                
        except Exception as e:
            logging.warning(f"Error cargando métricas: {e}")
            self._initialize_default_metrics()
    
    def _initialize_default_metrics(self):
        """Inicializar métricas por defecto para conversiones conocidas"""
        default_metrics = {
            # Conversiones de alta calidad
            ('png', 'jpg'): ConversionMetrics(0.98, 2.0, 0.95, 0.7, 100),
            ('jpg', 'png'): ConversionMetrics(0.98, 2.5, 0.90, 1.3, 80),
            ('csv', 'xlsx'): ConversionMetrics(0.95, 3.0, 0.98, 2.5, 150),
            ('xlsx', 'csv'): ConversionMetrics(0.95, 4.0, 0.95, 0.3, 120),
            ('html', 'pdf'): ConversionMetrics(0.90, 8.0, 0.85, 1.2, 200),
            ('md', 'html'): ConversionMetrics(0.98, 1.5, 0.95, 1.8, 90),
            
            # Conversiones complejas
            ('pdf', 'docx'): ConversionMetrics(0.75, 15.0, 0.70, 1.5, 300),
            ('svg', 'png'): ConversionMetrics(0.92, 5.0, 0.90, 3.0, 60),
            ('webp', 'png'): ConversionMetrics(0.96, 3.0, 0.92, 1.4, 40),
        }
        
        self.conversion_metrics.update(default_metrics)
    
    def find_best_route(self, source_format: str, target_format: str, 
                       max_steps: int = 4, prefer_quality: bool = True) -> Optional[ConversionRoute]:
        """
        Encontrar la mejor ruta de conversión entre dos formatos
        
        Args:
            source_format: Formato de origen
            target_format: Formato de destino
            max_steps: Máximo número de pasos permitidos
            prefer_quality: Si priorizar calidad sobre velocidad
            
        Returns:
            ConversionRoute con la mejor ruta encontrada o None si no existe
        """
        try:
            # Normalizar formatos
            source_format = self._normalize_format(source_format)
            target_format = self._normalize_format(target_format)
            
            # Verificar si los formatos existen en el grafo
            if source_format not in self.conversion_graph.nodes:
                return None
            if target_format not in self.conversion_graph.nodes:
                return None
            
            # Buscar todas las rutas posibles
            all_routes = self._find_all_routes(source_format, target_format, max_steps)
            
            if not all_routes:
                return None
            
            # Evaluar y clasificar rutas
            evaluated_routes = []
            for route_steps in all_routes:
                route = self._evaluate_route(route_steps, prefer_quality)
                if route:
                    evaluated_routes.append(route)
            
            if not evaluated_routes:
                return None
            
            # Ordenar por puntuación (mejor primero)
            evaluated_routes.sort(key=lambda r: r.quality_score, reverse=True)
            
            return evaluated_routes[0]
            
        except Exception as e:
            logging.error(f"Error encontrando ruta {source_format}→{target_format}: {e}")
            return None
    
    def _find_all_routes(self, source: str, target: str, max_steps: int) -> List[List[Tuple[str, str]]]:
        """Encontrar todas las rutas posibles entre dos formatos"""
        try:
            all_routes = []
            
            # Usar NetworkX para encontrar todos los caminos simples
            for path in nx.all_simple_paths(self.conversion_graph, source, target, cutoff=max_steps):
                if len(path) <= max_steps + 1:  # +1 porque path incluye nodos, no aristas
                    # Convertir path de nodos a lista de aristas (pasos de conversión)
                    route_steps = []
                    for i in range(len(path) - 1):
                        route_steps.append((path[i], path[i + 1]))
                    all_routes.append(route_steps)
            
            return all_routes
            
        except Exception as e:
            logging.error(f"Error buscando rutas: {e}")
            return []
    
    def _evaluate_route(self, route_steps: List[Tuple[str, str]], prefer_quality: bool) -> Optional[ConversionRoute]:
        """Evaluar una ruta específica y calcular su puntuación"""
        try:
            if not route_steps:
                return None
            
            source_format = route_steps[0][0]
            target_format = route_steps[-1][1]
            complexity = len(route_steps)
            
            # Calcular métricas agregadas
            total_time = 0.0
            total_quality = 1.0
            min_success_rate = 1.0
            
            for step in route_steps:
                metrics = self.conversion_metrics.get(step)
                if metrics:
                    total_time += metrics.avg_time
                    total_quality *= metrics.quality_rating
                    min_success_rate = min(min_success_rate, metrics.success_rate)
                else:
                    # Métricas por defecto para conversiones sin historial
                    total_time += 5.0  # 5 segundos por defecto
                    total_quality *= 0.8  # Calidad reducida por falta de datos
                    min_success_rate = min(min_success_rate, 0.7)
            
            # Aplicar penalizaciones por complejidad
            complexity_penalty = self.quality_weights.get(
                f'{complexity}_step_conversion',
                self.quality_weights['four_plus_step']
            )
            
            # Calcular puntuación final
            if prefer_quality:
                quality_score = (total_quality * complexity_penalty * min_success_rate * 0.7 + 
                               (1.0 / max(total_time, 1.0)) * 0.3)
            else:
                quality_score = ((1.0 / max(total_time, 1.0)) * 0.7 + 
                               total_quality * complexity_penalty * min_success_rate * 0.3)
            
            # Crear descripción legible
            description = self._create_route_description(route_steps)
            
            return ConversionRoute(
                source_format=source_format,
                target_format=target_format,
                steps=route_steps,
                estimated_time=total_time,
                quality_score=quality_score,
                complexity=complexity,
                description=description
            )
            
        except Exception as e:
            logging.error(f"Error evaluando ruta: {e}")
            return None
    
    def _create_route_description(self, route_steps: List[Tuple[str, str]]) -> str:
        """Crear descripción legible de la ruta"""
        try:
            if len(route_steps) == 1:
                return f"Conversión directa: {route_steps[0][0].upper()} → {route_steps[0][1].upper()}"
            
            formats = [route_steps[0][0]]
            for step in route_steps:
                formats.append(step[1])
            
            route_str = " → ".join(f.upper() for f in formats)
            return f"Conversión en {len(route_steps)} pasos: {route_str}"
            
        except Exception:
            return "Ruta de conversión"
    
    def _normalize_format(self, format_str: str) -> str:
        """Normalizar formato de archivo"""
        format_mapping = {
            'jpeg': 'jpg',
            'tiff': 'tif',
            'markdown': 'md',
            'text': 'txt',
        }
        
        normalized = format_str.lower().strip()
        return format_mapping.get(normalized, normalized)
    
    def get_all_possible_targets(self, source_format: str, max_steps: int = 3) -> List[Dict]:
        """Obtener todos los formatos de destino posibles desde un formato origen"""
        try:
            source_format = self._normalize_format(source_format)
            
            if source_format not in self.conversion_graph.nodes:
                return []
            
            possible_targets = []
            
            # Encontrar todos los nodos alcanzables
            reachable = nx.single_source_shortest_path_length(
                self.conversion_graph, source_format, cutoff=max_steps
            )
            
            for target_format, steps in reachable.items():
                if target_format != source_format:
                    route = self.find_best_route(source_format, target_format, max_steps)
                    if route:
                        possible_targets.append({
                            'format': target_format,
                            'steps': steps,
                            'estimated_time': route.estimated_time,
                            'quality_score': route.quality_score,
                            'description': route.description,
                            'priority': self.format_priorities.get(target_format, 0)
                        })
            
            # Ordenar por prioridad y calidad
            possible_targets.sort(key=lambda x: (x['priority'], x['quality_score']), reverse=True)
            
            return possible_targets
            
        except Exception as e:
            logging.error(f"Error obteniendo targets posibles: {e}")
            return []
    
    def update_conversion_metrics(self, source: str, target: str, 
                                success: bool, time_taken: float, quality_rating: float = None):
        """Actualizar métricas de conversión basadas en resultados reales"""
        try:
            key = (source, target)
            
            if key in self.conversion_metrics:
                metrics = self.conversion_metrics[key]
                
                # Actualizar métricas con promedio móvil
                alpha = 0.1  # Factor de aprendizaje
                
                if success:
                    metrics.success_rate = metrics.success_rate * (1 - alpha) + alpha
                else:
                    metrics.success_rate = metrics.success_rate * (1 - alpha)
                
                metrics.avg_time = metrics.avg_time * (1 - alpha) + time_taken * alpha
                
                if quality_rating is not None:
                    metrics.quality_rating = metrics.quality_rating * (1 - alpha) + quality_rating * alpha
                
                metrics.popularity += 1
                
            else:
                # Crear nuevas métricas
                self.conversion_metrics[key] = ConversionMetrics(
                    success_rate=1.0 if success else 0.0,
                    avg_time=time_taken,
                    quality_rating=quality_rating or 0.8,
                    file_size_ratio=1.0,
                    popularity=1
                )
            
            # Guardar métricas actualizadas
            self._save_metrics()
            
        except Exception as e:
            logging.error(f"Error actualizando métricas: {e}")
    
    def _save_metrics(self):
        """Guardar métricas en archivo"""
        try:
            os.makedirs("data", exist_ok=True)
            metrics_data = {}
            
            for (source, target), metrics in self.conversion_metrics.items():
                key = f"{source}→{target}"
                metrics_data[key] = {
                    'success_rate': metrics.success_rate,
                    'avg_time': metrics.avg_time,
                    'quality_rating': metrics.quality_rating,
                    'file_size_ratio': metrics.file_size_ratio,
                    'popularity': metrics.popularity
                }
            
            with open("data/conversion_metrics.json", 'w') as f:
                json.dump(metrics_data, f, indent=2)
                
        except Exception as e:
            logging.error(f"Error guardando métricas: {e}")

# Instancia global del router inteligente
intelligent_router = IntelligentRouter()
