"""
API de Monitoreo para Dashboard de Producción
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
import logging

try:
    from ...services.production_monitoring import get_monitor, log_user_feedback
    MONITORING_AVAILABLE = True
except ImportError:
    MONITORING_AVAILABLE = False

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/monitoring", tags=["Production Monitoring"])

class UserFeedback(BaseModel):
    """Modelo para feedback de usuario"""
    conversion_id: str
    rating: int  # 1-5
    feedback: Optional[str] = ""

@router.get("/health")
async def get_system_health():
    """
    Obtiene estado de salud del sistema
    """
    if not MONITORING_AVAILABLE:
        raise HTTPException(status_code=500, detail="Monitoreo no disponible")
    
    try:
        monitor = get_monitor()
        report = monitor.get_performance_report(hours=1)  # Última hora
        
        if "error" in report:
            return {
                "status": "unknown",
                "message": report["error"],
                "timestamp": datetime.now().isoformat()
            }
        
        # Determinar estado de salud
        success_rate = report["summary"]["success_rate"]
        avg_duration = report["summary"]["avg_duration_seconds"]
        
        if success_rate >= 95 and avg_duration <= 10:
            status = "excellent"
            color = "green"
        elif success_rate >= 90 and avg_duration <= 30:
            status = "good"
            color = "green"
        elif success_rate >= 80 and avg_duration <= 60:
            status = "warning"
            color = "yellow"
        else:
            status = "critical"
            color = "red"
        
        return {
            "status": status,
            "color": color,
            "success_rate": success_rate,
            "avg_response_time": avg_duration,
            "total_conversions": report["summary"]["total_conversions"],
            "timestamp": datetime.now().isoformat(),
            "message": f"Sistema {status} - {success_rate:.1f}% éxito, {avg_duration:.1f}s promedio"
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo salud del sistema: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance-report")
async def get_performance_report(hours: int = Query(24, ge=1, le=168)):
    """
    Obtiene reporte de rendimiento detallado
    """
    if not MONITORING_AVAILABLE:
        raise HTTPException(status_code=500, detail="Monitoreo no disponible")
    
    try:
        monitor = get_monitor()
        report = monitor.get_performance_report(hours=hours)
        
        if "error" in report:
            raise HTTPException(status_code=404, detail=report["error"])
        
        return {
            "success": True,
            "report": report
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generando reporte: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics-dashboard")
async def get_metrics_dashboard():
    """
    Dashboard completo de métricas para frontend
    """
    if not MONITORING_AVAILABLE:
        raise HTTPException(status_code=500, detail="Monitoreo no disponible")
    
    try:
        monitor = get_monitor()
        
        # Reportes para diferentes períodos
        last_hour = monitor.get_performance_report(hours=1)
        last_24h = monitor.get_performance_report(hours=24)
        last_week = monitor.get_performance_report(hours=168)
        
        # Métricas en tiempo real
        recent_events = list(monitor.recent_events)[-10:]  # Últimos 10 eventos
        
        dashboard_data = {
            "timestamp": datetime.now().isoformat(),
            "real_time": {
                "recent_conversions": [
                    {
                        "id": event.conversion_id,
                        "type": f"{event.input_format}→{event.output_format}",
                        "duration": event.duration_seconds,
                        "success": event.success,
                        "method": event.method_used,
                        "timestamp": event.timestamp
                    }
                    for event in recent_events
                ],
                "active_conversions": 0,  # TODO: Implementar contador real
                "queue_size": 0  # TODO: Implementar contador real
            },
            "periods": {
                "last_hour": last_hour if "error" not in last_hour else None,
                "last_24h": last_24h if "error" not in last_24h else None,
                "last_week": last_week if "error" not in last_week else None
            },
            "alerts": self._get_recent_alerts(),
            "top_conversions": self._get_top_conversion_types(monitor),
            "performance_trends": self._calculate_performance_trends(monitor)
        }
        
        return {
            "success": True,
            "dashboard": dashboard_data
        }
        
    except Exception as e:
        logger.error(f"Error generando dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user-feedback")
async def submit_user_feedback(feedback: UserFeedback):
    """
    Registra feedback de usuario sobre una conversión
    """
    if not MONITORING_AVAILABLE:
        raise HTTPException(status_code=500, detail="Monitoreo no disponible")
    
    try:
        # Validar rating
        if not 1 <= feedback.rating <= 5:
            raise HTTPException(status_code=400, detail="Rating debe estar entre 1 y 5")
        
        # Registrar feedback
        log_user_feedback(feedback.conversion_id, feedback.rating, feedback.feedback)
        
        return {
            "success": True,
            "message": "Feedback registrado exitosamente",
            "conversion_id": feedback.conversion_id,
            "rating": feedback.rating
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registrando feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversion-stats")
async def get_conversion_statistics(
    hours: int = Query(24, ge=1, le=168),
    format_filter: Optional[str] = Query(None, description="Filtrar por formato (ej: 'html→pdf')")
):
    """
    Estadísticas detalladas de conversiones
    """
    if not MONITORING_AVAILABLE:
        raise HTTPException(status_code=500, detail="Monitoreo no disponible")
    
    try:
        monitor = get_monitor()
        
        # Filtrar eventos por período
        from datetime import timedelta
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        filtered_events = [
            event for event in monitor.recent_events
            if datetime.fromisoformat(event.timestamp) >= cutoff_time
        ]
        
        # Aplicar filtro de formato si se especifica
        if format_filter:
            filtered_events = [
                event for event in filtered_events
                if f"{event.input_format}→{event.output_format}" == format_filter
            ]
        
        if not filtered_events:
            return {
                "success": True,
                "stats": {
                    "total_conversions": 0,
                    "message": "No hay datos para el período especificado"
                }
            }
        
        # Calcular estadísticas
        total = len(filtered_events)
        successful = sum(1 for e in filtered_events if e.success)
        
        # Estadísticas por método
        method_stats = {}
        for event in filtered_events:
            method = event.method_used
            if method not in method_stats:
                method_stats[method] = {
                    "count": 0,
                    "success": 0,
                    "total_time": 0,
                    "avg_file_size": 0
                }
            
            stats = method_stats[method]
            stats["count"] += 1
            if event.success:
                stats["success"] += 1
            stats["total_time"] += event.duration_seconds
            stats["avg_file_size"] += event.file_size_mb
        
        # Finalizar cálculos
        for method, stats in method_stats.items():
            stats["success_rate"] = (stats["success"] / stats["count"]) * 100
            stats["avg_time"] = stats["total_time"] / stats["count"]
            stats["avg_file_size"] /= stats["count"]
        
        # Distribución por tamaño de archivo
        size_distribution = {
            "small": sum(1 for e in filtered_events if e.file_size_mb < 1),
            "medium": sum(1 for e in filtered_events if 1 <= e.file_size_mb < 10),
            "large": sum(1 for e in filtered_events if e.file_size_mb >= 10)
        }
        
        # Distribución por tiempo de respuesta
        time_distribution = {
            "fast": sum(1 for e in filtered_events if e.duration_seconds < 5),
            "normal": sum(1 for e in filtered_events if 5 <= e.duration_seconds < 30),
            "slow": sum(1 for e in filtered_events if e.duration_seconds >= 30)
        }
        
        return {
            "success": True,
            "stats": {
                "period_hours": hours,
                "format_filter": format_filter,
                "total_conversions": total,
                "success_rate": (successful / total) * 100,
                "method_performance": method_stats,
                "size_distribution": size_distribution,
                "time_distribution": time_distribution,
                "avg_duration": sum(e.duration_seconds for e in filtered_events) / total,
                "avg_file_size": sum(e.file_size_mb for e in filtered_events) / total
            }
        }
        
    except Exception as e:
        logger.error(f"Error calculando estadísticas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts")
async def get_recent_alerts(limit: int = Query(50, ge=1, le=100)):
    """
    Obtiene alertas recientes del sistema
    """
    try:
        alerts = self._get_recent_alerts(limit)
        return {
            "success": True,
            "alerts": alerts,
            "count": len(alerts)
        }
    except Exception as e:
        logger.error(f"Error obteniendo alertas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _get_recent_alerts(limit: int = 10) -> List[Dict]:
    """Obtiene alertas recientes del archivo de logs"""
    try:
        import json
        alerts = []
        
        if os.path.exists("logs/alerts.json"):
            with open("logs/alerts.json", 'r', encoding='utf-8') as f:
                for line in f:
                    try:
                        alert = json.loads(line.strip())
                        alerts.append(alert)
                    except:
                        continue
        
        # Ordenar por timestamp y limitar
        alerts.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        return alerts[:limit]
        
    except Exception as e:
        logger.error(f"Error leyendo alertas: {e}")
        return []

def _get_top_conversion_types(monitor) -> List[Dict]:
    """Obtiene tipos de conversión más populares"""
    try:
        conversion_counts = {}
        
        for event in monitor.recent_events:
            conv_type = f"{event.input_format}→{event.output_format}"
            if conv_type not in conversion_counts:
                conversion_counts[conv_type] = {
                    "count": 0,
                    "success": 0,
                    "avg_time": 0,
                    "total_time": 0
                }
            
            stats = conversion_counts[conv_type]
            stats["count"] += 1
            if event.success:
                stats["success"] += 1
            stats["total_time"] += event.duration_seconds
        
        # Calcular promedios y ordenar
        for conv_type, stats in conversion_counts.items():
            stats["success_rate"] = (stats["success"] / stats["count"]) * 100
            stats["avg_time"] = stats["total_time"] / stats["count"]
            del stats["total_time"]  # No necesario en respuesta
        
        # Ordenar por popularidad
        sorted_conversions = sorted(
            conversion_counts.items(),
            key=lambda x: x[1]["count"],
            reverse=True
        )
        
        return [
            {"type": conv_type, **stats}
            for conv_type, stats in sorted_conversions[:10]
        ]
        
    except Exception as e:
        logger.error(f"Error calculando top conversiones: {e}")
        return []

def _calculate_performance_trends(monitor) -> Dict:
    """Calcula tendencias de rendimiento"""
    try:
        if len(monitor.recent_events) < 10:
            return {"insufficient_data": True}
        
        # Dividir eventos en dos mitades para comparar
        events = list(monitor.recent_events)
        mid_point = len(events) // 2
        
        first_half = events[:mid_point]
        second_half = events[mid_point:]
        
        # Calcular métricas para cada mitad
        def calc_metrics(event_list):
            if not event_list:
                return {"success_rate": 0, "avg_time": 0}
            
            success_rate = (sum(1 for e in event_list if e.success) / len(event_list)) * 100
            avg_time = sum(e.duration_seconds for e in event_list) / len(event_list)
            
            return {"success_rate": success_rate, "avg_time": avg_time}
        
        first_metrics = calc_metrics(first_half)
        second_metrics = calc_metrics(second_half)
        
        # Calcular tendencias
        success_trend = second_metrics["success_rate"] - first_metrics["success_rate"]
        time_trend = second_metrics["avg_time"] - first_metrics["avg_time"]
        
        return {
            "success_rate_trend": success_trend,
            "response_time_trend": time_trend,
            "trend_direction": "improving" if success_trend > 0 and time_trend < 0 else "declining" if success_trend < 0 or time_trend > 0 else "stable"
        }
        
    except Exception as e:
        logger.error(f"Error calculando tendencias: {e}")
        return {"error": str(e)}

import os
