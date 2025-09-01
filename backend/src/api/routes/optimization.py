"""
API de Optimización para Dashboard de Rendimiento
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
import logging

try:
    from ...services.intelligent_optimization import get_optimizer
    OPTIMIZATION_AVAILABLE = True
except ImportError:
    OPTIMIZATION_AVAILABLE = False

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/optimization", tags=["Intelligent Optimization"])

class ConversionTask(BaseModel):
    """Modelo para tarea de conversión paralela"""
    task_id: str
    input_path: str
    output_path: str
    priority: Optional[int] = 1

@router.get("/status")
async def get_optimization_status():
    """
    Obtiene estado del sistema de optimización
    """
    if not OPTIMIZATION_AVAILABLE:
        raise HTTPException(status_code=500, detail="Sistema de optimización no disponible")
    
    try:
        optimizer = get_optimizer()
        report = optimizer.get_optimization_report()
        
        return {
            "success": True,
            "status": "active",
            "report": report,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo estado de optimización: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cache-stats")
async def get_cache_statistics():
    """
    Estadísticas detalladas del cache
    """
    if not OPTIMIZATION_AVAILABLE:
        raise HTTPException(status_code=500, detail="Sistema de optimización no disponible")
    
    try:
        optimizer = get_optimizer()
        
        # Estadísticas del cache
        cache_entries = len(optimizer.cache)
        total_accesses = sum(entry.access_count for entry in optimizer.cache.values())
        
        # Análisis por tamaño de archivo
        size_distribution = {"small": 0, "medium": 0, "large": 0}
        for entry in optimizer.cache.values():
            size_mb = entry.file_size / (1024 * 1024)
            if size_mb < 1:
                size_distribution["small"] += 1
            elif size_mb < 10:
                size_distribution["medium"] += 1
            else:
                size_distribution["large"] += 1
        
        # Entradas más accedidas
        top_entries = sorted(
            optimizer.cache.values(),
            key=lambda x: x.access_count,
            reverse=True
        )[:10]
        
        top_accessed = [
            {
                "file_hash": entry.file_hash[:8] + "...",
                "access_count": entry.access_count,
                "file_size_mb": round(entry.file_size / (1024 * 1024), 2),
                "last_accessed": entry.last_accessed,
                "complexity_level": entry.analysis_result.get("complexity_level", "unknown")
            }
            for entry in top_entries
        ]
        
        return {
            "success": True,
            "cache_stats": {
                "total_entries": cache_entries,
                "total_accesses": total_accesses,
                "avg_accesses_per_entry": round(total_accesses / max(cache_entries, 1), 2),
                "size_distribution": size_distribution,
                "hit_rate": round(
                    (optimizer.metrics.cache_hits / 
                     max(optimizer.metrics.cache_hits + optimizer.metrics.cache_misses, 1)) * 100, 2
                ),
                "top_accessed_files": top_accessed
            }
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas de cache: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/parallel-conversion")
async def submit_parallel_conversion(tasks: List[ConversionTask]):
    """
    Envía múltiples conversiones para procesamiento paralelo
    """
    if not OPTIMIZATION_AVAILABLE:
        raise HTTPException(status_code=500, detail="Sistema de optimización no disponible")
    
    try:
        if not tasks:
            raise HTTPException(status_code=400, detail="No se proporcionaron tareas")
        
        if len(tasks) > 20:
            raise HTTPException(status_code=400, detail="Máximo 20 tareas por lote")
        
        optimizer = get_optimizer()
        
        # Convertir a formato interno
        conversion_tasks = [
            {
                "task_id": task.task_id,
                "input_path": task.input_path,
                "output_path": task.output_path,
                "priority": task.priority
            }
            for task in tasks
        ]
        
        # Ejecutar conversiones en paralelo
        results = await optimizer.parallel_conversion(conversion_tasks)
        
        # Procesar resultados
        successful = sum(1 for r in results if r.get("success", False))
        
        return {
            "success": True,
            "message": f"Procesadas {len(results)} conversiones ({successful} exitosas)",
            "results": results,
            "summary": {
                "total_tasks": len(results),
                "successful": successful,
                "failed": len(results) - successful,
                "success_rate": round((successful / len(results)) * 100, 2)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en conversión paralela: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance-trends")
async def get_performance_trends(
    conversion_type: Optional[str] = Query(None, description="Filtrar por tipo de conversión"),
    days: int = Query(7, ge=1, le=30, description="Días de historial")
):
    """
    Obtiene tendencias de rendimiento
    """
    if not OPTIMIZATION_AVAILABLE:
        raise HTTPException(status_code=500, detail="Sistema de optimización no disponible")
    
    try:
        optimizer = get_optimizer()
        
        # Filtrar historial por tipo si se especifica
        if conversion_type:
            if conversion_type not in optimizer.performance_history:
                raise HTTPException(status_code=404, detail=f"No hay datos para {conversion_type}")
            
            history_data = {conversion_type: optimizer.performance_history[conversion_type]}
        else:
            history_data = optimizer.performance_history
        
        # Procesar tendencias
        trends = {}
        for conv_type, history in history_data.items():
            if not history:
                continue
            
            # Filtrar por días
            from datetime import timedelta
            cutoff_date = datetime.now() - timedelta(days=days)
            
            recent_history = [
                h for h in history
                if datetime.fromisoformat(h["timestamp"]) >= cutoff_date
            ]
            
            if len(recent_history) < 2:
                continue
            
            # Calcular tendencias
            durations = [h["duration_seconds"] for h in recent_history]
            complexities = [h["complexity_score"] for h in recent_history]
            file_sizes = [h["file_size_mb"] for h in recent_history]
            
            # Dividir en dos mitades para comparar
            mid_point = len(recent_history) // 2
            first_half = recent_history[:mid_point]
            second_half = recent_history[mid_point:]
            
            first_avg_duration = sum(h["duration_seconds"] for h in first_half) / len(first_half)
            second_avg_duration = sum(h["duration_seconds"] for h in second_half) / len(second_half)
            
            duration_trend = second_avg_duration - first_avg_duration
            
            trends[conv_type] = {
                "total_samples": len(recent_history),
                "avg_duration": round(sum(durations) / len(durations), 2),
                "avg_complexity": round(sum(complexities) / len(complexities), 1),
                "avg_file_size": round(sum(file_sizes) / len(file_sizes), 2),
                "duration_trend": round(duration_trend, 2),
                "trend_direction": "improving" if duration_trend < -0.5 else "declining" if duration_trend > 0.5 else "stable",
                "min_duration": round(min(durations), 2),
                "max_duration": round(max(durations), 2),
                "performance_consistency": round(
                    1 - (max(durations) - min(durations)) / max(sum(durations) / len(durations), 0.1), 2
                )
            }
        
        return {
            "success": True,
            "period_days": days,
            "conversion_type_filter": conversion_type,
            "trends": trends,
            "summary": {
                "total_conversion_types": len(trends),
                "improving_types": sum(1 for t in trends.values() if t["trend_direction"] == "improving"),
                "declining_types": sum(1 for t in trends.values() if t["trend_direction"] == "declining"),
                "stable_types": sum(1 for t in trends.values() if t["trend_direction"] == "stable")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo tendencias: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/adaptive-thresholds")
async def get_adaptive_thresholds():
    """
    Obtiene umbrales adaptativos actuales
    """
    if not OPTIMIZATION_AVAILABLE:
        raise HTTPException(status_code=500, detail="Sistema de optimización no disponible")
    
    try:
        optimizer = get_optimizer()
        
        return {
            "success": True,
            "thresholds": optimizer.adaptive_thresholds.copy(),
            "config": {
                "auto_adjust_enabled": optimizer.config["thresholds"]["auto_adjust"],
                "learning_rate": optimizer.config["thresholds"]["learning_rate"],
                "min_samples": optimizer.config["thresholds"]["min_samples"]
            },
            "adjustments_made": optimizer.metrics.threshold_adjustments,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo umbrales adaptativos: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clear-cache")
async def clear_optimization_cache():
    """
    Limpia el cache de optimización
    """
    if not OPTIMIZATION_AVAILABLE:
        raise HTTPException(status_code=500, detail="Sistema de optimización no disponible")
    
    try:
        optimizer = get_optimizer()
        
        entries_before = len(optimizer.cache)
        optimizer.cache.clear()
        optimizer._save_cache()
        
        return {
            "success": True,
            "message": f"Cache limpiado: {entries_before} entradas eliminadas",
            "entries_removed": entries_before,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error limpiando cache: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/optimization-recommendations")
async def get_optimization_recommendations():
    """
    Obtiene recomendaciones de optimización basadas en datos históricos
    """
    if not OPTIMIZATION_AVAILABLE:
        raise HTTPException(status_code=500, detail="Sistema de optimización no disponible")
    
    try:
        optimizer = get_optimizer()
        report = optimizer.get_optimization_report()
        
        recommendations = []
        
        # Recomendaciones basadas en cache
        cache_hit_rate = report["cache"]["hit_rate"]
        if cache_hit_rate < 50:
            recommendations.append({
                "type": "cache",
                "priority": "high",
                "title": "Baja tasa de aciertos de cache",
                "description": f"Tasa actual: {cache_hit_rate}%. Considerar aumentar TTL o revisar patrones de uso.",
                "action": "Revisar configuración de cache"
            })
        elif cache_hit_rate > 80:
            recommendations.append({
                "type": "cache",
                "priority": "low",
                "title": "Excelente rendimiento de cache",
                "description": f"Tasa actual: {cache_hit_rate}%. El cache está funcionando óptimamente.",
                "action": "Mantener configuración actual"
            })
        
        # Recomendaciones basadas en paralelización
        if report["parallel"]["completed_parallel"] < 10:
            recommendations.append({
                "type": "parallel",
                "priority": "medium",
                "title": "Bajo uso de paralelización",
                "description": "Considerar usar conversiones paralelas para lotes grandes.",
                "action": "Implementar procesamiento batch"
            })
        
        # Recomendaciones basadas en umbrales
        if report["thresholds"]["adjustments_made"] == 0:
            recommendations.append({
                "type": "thresholds",
                "priority": "low",
                "title": "Umbrales no se han ajustado",
                "description": "Los umbrales adaptativos no han cambiado. Puede indicar configuración estable o falta de datos.",
                "action": "Monitorear más tiempo o revisar configuración"
            })
        
        # Recomendaciones generales
        if report["performance"]["total_conversions"] > 1000:
            recommendations.append({
                "type": "performance",
                "priority": "medium",
                "title": "Alto volumen de conversiones",
                "description": f"{report['performance']['total_conversions']} conversiones procesadas. Considerar optimizaciones adicionales.",
                "action": "Revisar métricas de rendimiento detalladas"
            })
        
        return {
            "success": True,
            "recommendations": recommendations,
            "total_recommendations": len(recommendations),
            "high_priority": sum(1 for r in recommendations if r["priority"] == "high"),
            "medium_priority": sum(1 for r in recommendations if r["priority"] == "medium"),
            "low_priority": sum(1 for r in recommendations if r["priority"] == "low"),
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generando recomendaciones: {e}")
        raise HTTPException(status_code=500, detail=str(e))
