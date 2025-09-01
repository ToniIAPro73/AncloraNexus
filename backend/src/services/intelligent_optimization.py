"""
Sistema de Optimización Inteligente para Anclora Nexus
Cache de análisis, paralelización y ajuste automático de umbrales
"""

import json
import os
import time
import hashlib
import asyncio
import concurrent.futures
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
import logging
from pathlib import Path
import threading
from collections import defaultdict

logger = logging.getLogger(__name__)

@dataclass
class CacheEntry:
    """Entrada de cache para análisis de complejidad"""
    file_hash: str
    file_size: int
    analysis_result: Dict
    timestamp: str
    access_count: int = 0
    last_accessed: str = None

@dataclass
class OptimizationMetrics:
    """Métricas de optimización"""
    cache_hits: int = 0
    cache_misses: int = 0
    parallel_conversions: int = 0
    threshold_adjustments: int = 0
    avg_response_time: float = 0.0
    total_conversions: int = 0

class IntelligentOptimizer:
    """Sistema de optimización inteligente"""
    
    def __init__(self, cache_file: str = "optimization_cache.json"):
        self.cache_file = cache_file
        self.cache = self._load_cache()
        self.metrics = OptimizationMetrics()
        
        # Configuración de optimización
        self.config = {
            "cache": {
                "max_entries": 1000,
                "ttl_hours": 24,
                "cleanup_interval_minutes": 60
            },
            "parallel": {
                "max_workers": 4,
                "queue_size": 50,
                "timeout_seconds": 300
            },
            "thresholds": {
                "auto_adjust": True,
                "learning_rate": 0.1,
                "min_samples": 10
            }
        }
        
        # Thread pool para conversiones paralelas
        self.executor = concurrent.futures.ThreadPoolExecutor(
            max_workers=self.config["parallel"]["max_workers"]
        )
        
        # Queue para conversiones pendientes
        self.conversion_queue = asyncio.Queue(
            maxsize=self.config["parallel"]["queue_size"]
        )
        
        # Umbrales adaptativos
        self.adaptive_thresholds = {
            "complexity_simple": 30,
            "complexity_moderate": 70,
            "complexity_complex": 120,
            "response_time_fast": 5.0,
            "response_time_slow": 30.0,
            "file_size_small": 1.0,  # MB
            "file_size_large": 10.0  # MB
        }
        
        # Historial para ajuste de umbrales
        self.performance_history = defaultdict(list)
        
        # Iniciar limpieza automática de cache
        self._start_cache_cleanup()
    
    def _load_cache(self) -> Dict[str, CacheEntry]:
        """Carga cache desde archivo"""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    cache_data = json.load(f)
                    return {
                        key: CacheEntry(**entry) 
                        for key, entry in cache_data.items()
                    }
            except Exception as e:
                logger.warning(f"Error cargando cache: {e}")
                return {}
        return {}
    
    def _save_cache(self):
        """Guarda cache a archivo"""
        try:
            cache_data = {
                key: asdict(entry) 
                for key, entry in self.cache.items()
            }
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(cache_data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error guardando cache: {e}")
    
    def get_file_hash(self, file_path: str) -> str:
        """Calcula hash de archivo para cache"""
        try:
            hasher = hashlib.md5()
            with open(file_path, 'rb') as f:
                # Leer en chunks para archivos grandes
                for chunk in iter(lambda: f.read(4096), b""):
                    hasher.update(chunk)
            
            # Incluir timestamp de modificación para detectar cambios
            mtime = os.path.getmtime(file_path)
            hasher.update(str(mtime).encode())
            
            return hasher.hexdigest()
        except Exception as e:
            logger.error(f"Error calculando hash: {e}")
            return str(time.time())  # Fallback
    
    def get_cached_analysis(self, file_path: str) -> Optional[Dict]:
        """Obtiene análisis desde cache si existe"""
        try:
            file_hash = self.get_file_hash(file_path)
            
            if file_hash in self.cache:
                entry = self.cache[file_hash]
                
                # Verificar TTL
                cache_time = datetime.fromisoformat(entry.timestamp)
                ttl_hours = self.config["cache"]["ttl_hours"]
                
                if datetime.now() - cache_time < timedelta(hours=ttl_hours):
                    # Cache hit
                    entry.access_count += 1
                    entry.last_accessed = datetime.now().isoformat()
                    self.metrics.cache_hits += 1
                    
                    logger.info(f"Cache HIT para {file_path} (accesos: {entry.access_count})")
                    return entry.analysis_result
                else:
                    # Cache expirado
                    del self.cache[file_hash]
            
            # Cache miss
            self.metrics.cache_misses += 1
            logger.info(f"Cache MISS para {file_path}")
            return None
            
        except Exception as e:
            logger.error(f"Error accediendo cache: {e}")
            return None
    
    def cache_analysis(self, file_path: str, analysis_result: Dict):
        """Guarda análisis en cache"""
        try:
            file_hash = self.get_file_hash(file_path)
            file_size = os.path.getsize(file_path)
            
            entry = CacheEntry(
                file_hash=file_hash,
                file_size=file_size,
                analysis_result=analysis_result,
                timestamp=datetime.now().isoformat(),
                access_count=1,
                last_accessed=datetime.now().isoformat()
            )
            
            self.cache[file_hash] = entry
            
            # Limpiar cache si excede límite
            if len(self.cache) > self.config["cache"]["max_entries"]:
                self._cleanup_cache()
            
            # Guardar cache
            self._save_cache()
            
            logger.info(f"Análisis cacheado para {file_path}")
            
        except Exception as e:
            logger.error(f"Error guardando en cache: {e}")
    
    def _cleanup_cache(self):
        """Limpia entradas antiguas del cache"""
        try:
            # Ordenar por último acceso y eliminar las más antiguas
            sorted_entries = sorted(
                self.cache.items(),
                key=lambda x: (x[1].last_accessed or x[1].timestamp)
            )
            
            # Mantener solo las más recientes
            max_entries = self.config["cache"]["max_entries"]
            entries_to_keep = sorted_entries[-max_entries:]
            
            self.cache = dict(entries_to_keep)
            
            logger.info(f"Cache limpiado: {len(entries_to_keep)} entradas mantenidas")
            
        except Exception as e:
            logger.error(f"Error limpiando cache: {e}")
    
    def _start_cache_cleanup(self):
        """Inicia limpieza automática de cache"""
        def cleanup_loop():
            while True:
                try:
                    # Limpiar entradas expiradas
                    current_time = datetime.now()
                    ttl_hours = self.config["cache"]["ttl_hours"]
                    expired_keys = []
                    
                    for key, entry in self.cache.items():
                        entry_time = datetime.fromisoformat(entry.timestamp)
                        if current_time - entry_time > timedelta(hours=ttl_hours):
                            expired_keys.append(key)
                    
                    for key in expired_keys:
                        del self.cache[key]
                    
                    if expired_keys:
                        logger.info(f"Cache: {len(expired_keys)} entradas expiradas eliminadas")
                        self._save_cache()
                    
                    # Esperar intervalo configurado
                    interval_minutes = self.config["cache"]["cleanup_interval_minutes"]
                    time.sleep(interval_minutes * 60)
                    
                except Exception as e:
                    logger.error(f"Error en limpieza automática: {e}")
                    time.sleep(300)  # 5 minutos de espera en caso de error
        
        cleanup_thread = threading.Thread(target=cleanup_loop, daemon=True)
        cleanup_thread.start()
        logger.info("Limpieza automática de cache iniciada")
    
    async def parallel_conversion(self, conversion_tasks: List[Dict]) -> List[Dict]:
        """Ejecuta conversiones en paralelo"""
        try:
            if not conversion_tasks:
                return []
            
            logger.info(f"Iniciando {len(conversion_tasks)} conversiones en paralelo")
            
            # Crear futures para todas las tareas
            futures = []
            for task in conversion_tasks:
                future = self.executor.submit(
                    self._execute_conversion_task,
                    task
                )
                futures.append(future)
            
            # Esperar resultados con timeout
            timeout = self.config["parallel"]["timeout_seconds"]
            results = []
            
            for future in concurrent.futures.as_completed(futures, timeout=timeout):
                try:
                    result = future.result()
                    results.append(result)
                    self.metrics.parallel_conversions += 1
                except Exception as e:
                    logger.error(f"Error en conversión paralela: {e}")
                    results.append({
                        "success": False,
                        "error": str(e)
                    })
            
            logger.info(f"Conversiones paralelas completadas: {len(results)} resultados")
            return results
            
        except concurrent.futures.TimeoutError:
            logger.error("Timeout en conversiones paralelas")
            return [{"success": False, "error": "Timeout"} for _ in conversion_tasks]
        except Exception as e:
            logger.error(f"Error en conversiones paralelas: {e}")
            return [{"success": False, "error": str(e)} for _ in conversion_tasks]
    
    def _execute_conversion_task(self, task: Dict) -> Dict:
        """Ejecuta una tarea de conversión individual"""
        try:
            # Importar aquí para evitar dependencias circulares
            from ..models.conversions.html_to_pdf import convert
            
            input_path = task["input_path"]
            output_path = task["output_path"]
            
            start_time = time.time()
            success, message = convert(input_path, output_path)
            duration = time.time() - start_time
            
            return {
                "task_id": task.get("task_id"),
                "success": success,
                "message": message,
                "duration": duration,
                "input_path": input_path,
                "output_path": output_path
            }
            
        except Exception as e:
            return {
                "task_id": task.get("task_id"),
                "success": False,
                "error": str(e),
                "input_path": task.get("input_path"),
                "output_path": task.get("output_path")
            }
    
    def record_performance(self, conversion_type: str, file_size_mb: float, 
                          duration_seconds: float, complexity_score: int):
        """Registra rendimiento para ajuste automático de umbrales"""
        
        performance_data = {
            "timestamp": datetime.now().isoformat(),
            "conversion_type": conversion_type,
            "file_size_mb": file_size_mb,
            "duration_seconds": duration_seconds,
            "complexity_score": complexity_score
        }
        
        self.performance_history[conversion_type].append(performance_data)
        
        # Mantener solo últimas 100 entradas por tipo
        if len(self.performance_history[conversion_type]) > 100:
            self.performance_history[conversion_type] = \
                self.performance_history[conversion_type][-100:]
        
        # Ajustar umbrales si hay suficientes datos
        if (len(self.performance_history[conversion_type]) >= 
            self.config["thresholds"]["min_samples"]):
            self._adjust_thresholds(conversion_type)
    
    def _adjust_thresholds(self, conversion_type: str):
        """Ajusta umbrales basado en datos históricos"""
        
        if not self.config["thresholds"]["auto_adjust"]:
            return
        
        try:
            history = self.performance_history[conversion_type]
            learning_rate = self.config["thresholds"]["learning_rate"]
            
            # Calcular percentiles de rendimiento
            durations = [h["duration_seconds"] for h in history]
            complexities = [h["complexity_score"] for h in history]
            
            durations.sort()
            complexities.sort()
            
            # Ajustar umbrales de tiempo de respuesta
            p25_duration = durations[len(durations) // 4]
            p75_duration = durations[3 * len(durations) // 4]
            
            # Ajuste gradual de umbrales
            current_fast = self.adaptive_thresholds["response_time_fast"]
            current_slow = self.adaptive_thresholds["response_time_slow"]
            
            new_fast = current_fast + (p25_duration - current_fast) * learning_rate
            new_slow = current_slow + (p75_duration - current_slow) * learning_rate
            
            # Aplicar ajustes si son significativos
            if abs(new_fast - current_fast) > 0.5:
                self.adaptive_thresholds["response_time_fast"] = new_fast
                self.metrics.threshold_adjustments += 1
                logger.info(f"Umbral 'fast' ajustado: {current_fast:.1f}s → {new_fast:.1f}s")
            
            if abs(new_slow - current_slow) > 1.0:
                self.adaptive_thresholds["response_time_slow"] = new_slow
                self.metrics.threshold_adjustments += 1
                logger.info(f"Umbral 'slow' ajustado: {current_slow:.1f}s → {new_slow:.1f}s")
            
            # Ajustar umbrales de complejidad
            p33_complexity = complexities[len(complexities) // 3]
            p66_complexity = complexities[2 * len(complexities) // 3]
            
            current_moderate = self.adaptive_thresholds["complexity_moderate"]
            current_complex = self.adaptive_thresholds["complexity_complex"]
            
            new_moderate = current_moderate + (p33_complexity - current_moderate) * learning_rate
            new_complex = current_complex + (p66_complexity - current_complex) * learning_rate
            
            if abs(new_moderate - current_moderate) > 5:
                self.adaptive_thresholds["complexity_moderate"] = new_moderate
                self.metrics.threshold_adjustments += 1
                logger.info(f"Umbral 'moderate' ajustado: {current_moderate} → {new_moderate:.0f}")
            
            if abs(new_complex - current_complex) > 10:
                self.adaptive_thresholds["complexity_complex"] = new_complex
                self.metrics.threshold_adjustments += 1
                logger.info(f"Umbral 'complex' ajustado: {current_complex} → {new_complex:.0f}")
            
        except Exception as e:
            logger.error(f"Error ajustando umbrales: {e}")
    
    def get_optimization_report(self) -> Dict:
        """Genera reporte de optimización"""
        
        cache_hit_rate = 0
        if self.metrics.cache_hits + self.metrics.cache_misses > 0:
            cache_hit_rate = (self.metrics.cache_hits / 
                            (self.metrics.cache_hits + self.metrics.cache_misses)) * 100
        
        return {
            "timestamp": datetime.now().isoformat(),
            "cache": {
                "entries": len(self.cache),
                "hit_rate": round(cache_hit_rate, 2),
                "hits": self.metrics.cache_hits,
                "misses": self.metrics.cache_misses,
                "max_entries": self.config["cache"]["max_entries"]
            },
            "parallel": {
                "max_workers": self.config["parallel"]["max_workers"],
                "completed_parallel": self.metrics.parallel_conversions,
                "queue_size": self.config["parallel"]["queue_size"]
            },
            "thresholds": {
                "auto_adjust_enabled": self.config["thresholds"]["auto_adjust"],
                "adjustments_made": self.metrics.threshold_adjustments,
                "current_thresholds": self.adaptive_thresholds.copy()
            },
            "performance": {
                "total_conversions": self.metrics.total_conversions,
                "avg_response_time": self.metrics.avg_response_time,
                "conversion_types_tracked": len(self.performance_history)
            }
        }

# Instancia global del optimizador
_optimizer_instance = None

def get_optimizer() -> IntelligentOptimizer:
    """Obtiene instancia singleton del optimizador"""
    global _optimizer_instance
    if _optimizer_instance is None:
        _optimizer_instance = IntelligentOptimizer()
    return _optimizer_instance

# Funciones de conveniencia
def get_cached_analysis(file_path: str) -> Optional[Dict]:
    """Función de conveniencia para obtener análisis cacheado"""
    return get_optimizer().get_cached_analysis(file_path)

def cache_analysis(file_path: str, analysis_result: Dict):
    """Función de conveniencia para cachear análisis"""
    get_optimizer().cache_analysis(file_path, analysis_result)

def record_performance(conversion_type: str, file_size_mb: float, 
                      duration_seconds: float, complexity_score: int):
    """Función de conveniencia para registrar rendimiento"""
    get_optimizer().record_performance(
        conversion_type, file_size_mb, duration_seconds, complexity_score
    )

# Ejemplo de uso
if __name__ == "__main__":
    optimizer = get_optimizer()
    
    # Simular uso de cache
    print("=== SISTEMA DE OPTIMIZACIÓN INTELIGENTE ===")
    print(f"Cache inicializado con {len(optimizer.cache)} entradas")
    print(f"Configuración: {optimizer.config}")
    
    # Generar reporte
    report = optimizer.get_optimization_report()
    print("\nReporte de optimización:")
    print(json.dumps(report, indent=2, ensure_ascii=False))
