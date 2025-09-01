"""
Sistema de Monitoreo en Producción para Anclora Nexus
Logs de rendimiento, alertas por fallos, métricas de satisfacción
"""

import logging
import json
import time
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import threading
from collections import defaultdict, deque

# Email imports (optional)
try:
    import smtplib
    from email.mime.text import MimeText
    from email.mime.multipart import MimeMultipart
    EMAIL_AVAILABLE = True
except ImportError:
    EMAIL_AVAILABLE = False
    logging.warning("Email functionality not available")

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/anclora_nexus.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

@dataclass
class ConversionEvent:
    """Evento de conversión para monitoreo"""
    timestamp: str
    conversion_id: str
    input_format: str
    output_format: str
    file_size_mb: float
    duration_seconds: float
    method_used: str
    success: bool
    error_message: Optional[str] = None
    user_id: Optional[str] = None
    user_satisfaction: Optional[int] = None  # 1-5 rating

@dataclass
class SystemMetrics:
    """Métricas del sistema"""
    timestamp: str
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    active_conversions: int
    queue_size: int
    response_time_avg: float

class ProductionMonitor:
    """Monitor de producción para Anclora Nexus"""
    
    def __init__(self, config_file: str = "monitoring_config.json"):
        self.config = self._load_config(config_file)
        self.metrics_file = "logs/production_metrics.json"
        self.events_file = "logs/conversion_events.json"
        
        # Buffers en memoria para análisis rápido
        self.recent_events = deque(maxlen=1000)  # Últimos 1000 eventos
        self.system_metrics = deque(maxlen=288)  # 24 horas (cada 5 min)
        self.error_counts = defaultdict(int)
        
        # Contadores de alertas para evitar spam
        self.alert_cooldowns = {}
        
        # Crear directorio de logs si no existe
        os.makedirs("logs", exist_ok=True)
        
        # Iniciar monitoreo en background
        self._start_background_monitoring()
    
    def _load_config(self, config_file: str) -> Dict:
        """Carga configuración de monitoreo"""
        default_config = {
            "alerts": {
                "email_enabled": False,
                "email_smtp_server": "smtp.gmail.com",
                "email_smtp_port": 587,
                "email_username": "",
                "email_password": "",
                "email_recipients": [],
                "cooldown_minutes": 30
            },
            "thresholds": {
                "error_rate_threshold": 0.1,  # 10% error rate
                "response_time_threshold": 30.0,  # 30 segundos
                "cpu_threshold": 80.0,  # 80% CPU
                "memory_threshold": 80.0,  # 80% memoria
                "disk_threshold": 90.0,  # 90% disco
                "queue_size_threshold": 50  # 50 conversiones en cola
            },
            "monitoring": {
                "metrics_interval_seconds": 300,  # 5 minutos
                "cleanup_days": 30,  # Limpiar logs > 30 días
                "performance_window_hours": 24  # Ventana de análisis
            }
        }
        
        if os.path.exists(config_file):
            try:
                with open(config_file, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                    # Merge con configuración por defecto
                    default_config.update(user_config)
            except Exception as e:
                logger.warning(f"Error cargando config: {e}, usando defaults")
        
        return default_config
    
    def log_conversion_event(self, event: ConversionEvent):
        """Registra evento de conversión"""
        try:
            # Añadir a buffer en memoria
            self.recent_events.append(event)
            
            # Guardar a archivo
            self._append_to_file(self.events_file, asdict(event))
            
            # Analizar para alertas
            self._analyze_conversion_event(event)
            
            # Log estructurado
            logger.info(
                f"CONVERSION: {event.conversion_id} | "
                f"{event.input_format}→{event.output_format} | "
                f"{event.duration_seconds:.2f}s | "
                f"{event.file_size_mb:.1f}MB | "
                f"{'SUCCESS' if event.success else 'FAILED'} | "
                f"Method: {event.method_used}"
            )
            
        except Exception as e:
            logger.error(f"Error logging conversion event: {e}")
    
    def log_system_metrics(self, metrics: SystemMetrics):
        """Registra métricas del sistema"""
        try:
            # Añadir a buffer en memoria
            self.system_metrics.append(metrics)
            
            # Guardar a archivo
            self._append_to_file("logs/system_metrics.json", asdict(metrics))
            
            # Analizar para alertas
            self._analyze_system_metrics(metrics)
            
            # Log cada 15 minutos para no saturar
            if int(time.time()) % 900 == 0:  # Cada 15 min
                logger.info(
                    f"SYSTEM: CPU {metrics.cpu_usage:.1f}% | "
                    f"MEM {metrics.memory_usage:.1f}% | "
                    f"DISK {metrics.disk_usage:.1f}% | "
                    f"Queue: {metrics.queue_size} | "
                    f"Active: {metrics.active_conversions}"
                )
                
        except Exception as e:
            logger.error(f"Error logging system metrics: {e}")
    
    def record_user_satisfaction(self, conversion_id: str, rating: int, feedback: str = ""):
        """Registra satisfacción del usuario"""
        try:
            satisfaction_data = {
                "timestamp": datetime.now().isoformat(),
                "conversion_id": conversion_id,
                "rating": rating,
                "feedback": feedback
            }
            
            self._append_to_file("logs/user_satisfaction.json", satisfaction_data)
            
            logger.info(f"USER_SATISFACTION: {conversion_id} | Rating: {rating}/5")
            
            # Actualizar evento correspondiente si existe
            for event in reversed(self.recent_events):
                if event.conversion_id == conversion_id:
                    event.user_satisfaction = rating
                    break
                    
        except Exception as e:
            logger.error(f"Error recording user satisfaction: {e}")
    
    def _analyze_conversion_event(self, event: ConversionEvent):
        """Analiza evento para detectar problemas"""
        
        # Incrementar contador de errores si falló
        if not event.success:
            error_key = f"{event.input_format}→{event.output_format}"
            self.error_counts[error_key] += 1
        
        # Alerta por tiempo de respuesta alto
        if event.duration_seconds > self.config["thresholds"]["response_time_threshold"]:
            self._send_alert(
                "HIGH_RESPONSE_TIME",
                f"Conversión lenta: {event.duration_seconds:.1f}s para {event.input_format}→{event.output_format}",
                {"event": asdict(event)}
            )
        
        # Alerta por fallo de conversión
        if not event.success:
            self._send_alert(
                "CONVERSION_FAILED",
                f"Conversión falló: {event.input_format}→{event.output_format} - {event.error_message}",
                {"event": asdict(event)}
            )
        
        # Calcular tasa de error reciente
        recent_failures = sum(1 for e in list(self.recent_events)[-100:] if not e.success)
        if recent_failures > 10:  # Más de 10 fallos en últimas 100 conversiones
            error_rate = recent_failures / min(len(self.recent_events), 100)
            if error_rate > self.config["thresholds"]["error_rate_threshold"]:
                self._send_alert(
                    "HIGH_ERROR_RATE",
                    f"Tasa de error alta: {error_rate:.1%} en últimas conversiones",
                    {"error_rate": error_rate, "recent_failures": recent_failures}
                )
    
    def _analyze_system_metrics(self, metrics: SystemMetrics):
        """Analiza métricas del sistema para alertas"""
        
        thresholds = self.config["thresholds"]
        
        # Alerta por CPU alto
        if metrics.cpu_usage > thresholds["cpu_threshold"]:
            self._send_alert(
                "HIGH_CPU",
                f"Uso de CPU alto: {metrics.cpu_usage:.1f}%",
                {"metrics": asdict(metrics)}
            )
        
        # Alerta por memoria alta
        if metrics.memory_usage > thresholds["memory_threshold"]:
            self._send_alert(
                "HIGH_MEMORY",
                f"Uso de memoria alto: {metrics.memory_usage:.1f}%",
                {"metrics": asdict(metrics)}
            )
        
        # Alerta por disco lleno
        if metrics.disk_usage > thresholds["disk_threshold"]:
            self._send_alert(
                "HIGH_DISK",
                f"Uso de disco alto: {metrics.disk_usage:.1f}%",
                {"metrics": asdict(metrics)}
            )
        
        # Alerta por cola grande
        if metrics.queue_size > thresholds["queue_size_threshold"]:
            self._send_alert(
                "LARGE_QUEUE",
                f"Cola de conversiones grande: {metrics.queue_size} elementos",
                {"metrics": asdict(metrics)}
            )
    
    def _send_alert(self, alert_type: str, message: str, data: Dict = None):
        """Envía alerta si no está en cooldown"""
        
        # Verificar cooldown
        cooldown_key = f"{alert_type}_{hash(message) % 1000}"
        cooldown_minutes = self.config["alerts"]["cooldown_minutes"]
        
        if cooldown_key in self.alert_cooldowns:
            last_sent = self.alert_cooldowns[cooldown_key]
            if datetime.now() - last_sent < timedelta(minutes=cooldown_minutes):
                return  # Aún en cooldown
        
        # Registrar alerta
        alert_data = {
            "timestamp": datetime.now().isoformat(),
            "type": alert_type,
            "message": message,
            "data": data or {}
        }
        
        self._append_to_file("logs/alerts.json", alert_data)
        
        # Log de alerta
        logger.warning(f"ALERT [{alert_type}]: {message}")
        
        # Enviar por email si está configurado y disponible
        if self.config["alerts"]["email_enabled"] and EMAIL_AVAILABLE:
            self._send_email_alert(alert_type, message, data)
        
        # Actualizar cooldown
        self.alert_cooldowns[cooldown_key] = datetime.now()
    
    def _send_email_alert(self, alert_type: str, message: str, data: Dict = None):
        """Envía alerta por email"""
        try:
            config = self.config["alerts"]
            
            msg = MimeMultipart()
            msg['From'] = config["email_username"]
            msg['To'] = ", ".join(config["email_recipients"])
            msg['Subject'] = f"[Anclora Nexus] Alerta: {alert_type}"
            
            body = f"""
Alerta de Anclora Nexus:

Tipo: {alert_type}
Mensaje: {message}
Timestamp: {datetime.now().isoformat()}

Datos adicionales:
{json.dumps(data, indent=2) if data else 'N/A'}

---
Sistema de Monitoreo Anclora Nexus
            """
            
            msg.attach(MimeText(body, 'plain'))
            
            server = smtplib.SMTP(config["email_smtp_server"], config["email_smtp_port"])
            server.starttls()
            server.login(config["email_username"], config["email_password"])
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email alert sent for {alert_type}")
            
        except Exception as e:
            logger.error(f"Error sending email alert: {e}")
    
    def _append_to_file(self, filename: str, data: Dict):
        """Añade datos a archivo JSON línea por línea"""
        try:
            with open(filename, 'a', encoding='utf-8') as f:
                f.write(json.dumps(data, ensure_ascii=False) + '\n')
        except Exception as e:
            logger.error(f"Error writing to {filename}: {e}")
    
    def _start_background_monitoring(self):
        """Inicia monitoreo en background"""
        def monitor_loop():
            while True:
                try:
                    # Recopilar métricas del sistema
                    metrics = self._collect_system_metrics()
                    self.log_system_metrics(metrics)
                    
                    # Limpiar logs antiguos
                    self._cleanup_old_logs()
                    
                    # Esperar intervalo configurado
                    time.sleep(self.config["monitoring"]["metrics_interval_seconds"])
                    
                except Exception as e:
                    logger.error(f"Error in monitoring loop: {e}")
                    time.sleep(60)  # Esperar 1 minuto antes de reintentar
        
        # Iniciar en thread separado
        monitor_thread = threading.Thread(target=monitor_loop, daemon=True)
        monitor_thread.start()
        logger.info("Background monitoring started")
    
    def _collect_system_metrics(self) -> SystemMetrics:
        """Recopila métricas del sistema"""
        try:
            import psutil
            
            return SystemMetrics(
                timestamp=datetime.now().isoformat(),
                cpu_usage=psutil.cpu_percent(interval=1),
                memory_usage=psutil.virtual_memory().percent,
                disk_usage=psutil.disk_usage('/').percent,
                active_conversions=0,  # TODO: Implementar contador real
                queue_size=0,  # TODO: Implementar contador real
                response_time_avg=self._calculate_avg_response_time()
            )
        except ImportError:
            # Fallback si psutil no está disponible
            return SystemMetrics(
                timestamp=datetime.now().isoformat(),
                cpu_usage=0.0,
                memory_usage=0.0,
                disk_usage=0.0,
                active_conversions=0,
                queue_size=0,
                response_time_avg=0.0
            )
    
    def _calculate_avg_response_time(self) -> float:
        """Calcula tiempo de respuesta promedio reciente"""
        if not self.recent_events:
            return 0.0
        
        recent_times = [e.duration_seconds for e in list(self.recent_events)[-50:]]
        return sum(recent_times) / len(recent_times) if recent_times else 0.0
    
    def _cleanup_old_logs(self):
        """Limpia logs antiguos"""
        try:
            cleanup_days = self.config["monitoring"]["cleanup_days"]
            cutoff_date = datetime.now() - timedelta(days=cleanup_days)
            
            # TODO: Implementar limpieza de archivos de log antiguos
            # Por ahora solo log la intención
            if int(time.time()) % 86400 == 0:  # Una vez al día
                logger.info(f"Log cleanup: removing entries older than {cleanup_days} days")
                
        except Exception as e:
            logger.error(f"Error in log cleanup: {e}")
    
    def get_performance_report(self, hours: int = 24) -> Dict:
        """Genera reporte de rendimiento"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            # Filtrar eventos recientes
            recent_events = [
                e for e in self.recent_events 
                if datetime.fromisoformat(e.timestamp) >= cutoff_time
            ]
            
            if not recent_events:
                return {"error": "No hay datos suficientes"}
            
            # Calcular estadísticas
            total_conversions = len(recent_events)
            successful_conversions = sum(1 for e in recent_events if e.success)
            success_rate = (successful_conversions / total_conversions) * 100
            
            avg_duration = sum(e.duration_seconds for e in recent_events) / total_conversions
            avg_file_size = sum(e.file_size_mb for e in recent_events) / total_conversions
            
            # Estadísticas por método
            method_stats = defaultdict(lambda: {"count": 0, "success": 0, "avg_time": 0})
            for event in recent_events:
                stats = method_stats[event.method_used]
                stats["count"] += 1
                if event.success:
                    stats["success"] += 1
                stats["avg_time"] += event.duration_seconds
            
            # Finalizar cálculos por método
            for method, stats in method_stats.items():
                stats["success_rate"] = (stats["success"] / stats["count"]) * 100
                stats["avg_time"] /= stats["count"]
            
            # Satisfacción del usuario
            satisfaction_ratings = [e.user_satisfaction for e in recent_events if e.user_satisfaction]
            avg_satisfaction = sum(satisfaction_ratings) / len(satisfaction_ratings) if satisfaction_ratings else None
            
            return {
                "period_hours": hours,
                "generated_at": datetime.now().isoformat(),
                "summary": {
                    "total_conversions": total_conversions,
                    "success_rate": round(success_rate, 2),
                    "avg_duration_seconds": round(avg_duration, 2),
                    "avg_file_size_mb": round(avg_file_size, 2),
                    "avg_user_satisfaction": round(avg_satisfaction, 2) if avg_satisfaction else None
                },
                "method_performance": dict(method_stats),
                "top_errors": dict(self.error_counts),
                "system_health": "good" if success_rate > 95 else "warning" if success_rate > 90 else "critical"
            }
            
        except Exception as e:
            logger.error(f"Error generating performance report: {e}")
            return {"error": str(e)}

# Instancia global del monitor
_monitor_instance = None

def get_monitor() -> ProductionMonitor:
    """Obtiene instancia singleton del monitor"""
    global _monitor_instance
    if _monitor_instance is None:
        _monitor_instance = ProductionMonitor()
    return _monitor_instance

# Funciones de conveniencia
def log_conversion(conversion_id: str, input_format: str, output_format: str,
                  file_size_mb: float, duration_seconds: float, method_used: str,
                  success: bool, error_message: str = None, user_id: str = None):
    """Función de conveniencia para logging de conversiones"""
    event = ConversionEvent(
        timestamp=datetime.now().isoformat(),
        conversion_id=conversion_id,
        input_format=input_format,
        output_format=output_format,
        file_size_mb=file_size_mb,
        duration_seconds=duration_seconds,
        method_used=method_used,
        success=success,
        error_message=error_message,
        user_id=user_id
    )
    get_monitor().log_conversion_event(event)

def log_user_feedback(conversion_id: str, rating: int, feedback: str = ""):
    """Función de conveniencia para logging de satisfacción"""
    get_monitor().record_user_satisfaction(conversion_id, rating, feedback)

# Ejemplo de uso
if __name__ == "__main__":
    # Simular algunos eventos
    monitor = get_monitor()
    
    # Conversión exitosa
    log_conversion(
        conversion_id="test-001",
        input_format="docx",
        output_format="pdf",
        file_size_mb=2.5,
        duration_seconds=3.2,
        method_used="playwright",
        success=True
    )
    
    # Conversión fallida
    log_conversion(
        conversion_id="test-002",
        input_format="xlsx",
        output_format="csv",
        file_size_mb=10.0,
        duration_seconds=45.0,
        method_used="pandas",
        success=False,
        error_message="File too large"
    )
    
    # Feedback de usuario
    log_user_feedback("test-001", 5, "Excelente calidad!")
    
    # Generar reporte
    report = monitor.get_performance_report(hours=1)
    print(json.dumps(report, indent=2, ensure_ascii=False))
