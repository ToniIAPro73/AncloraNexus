import logging
from datetime import datetime, timedelta
from typing import Dict, Any

from src.models import db
from src.models.file import File
from src.models.user import User
from src.services.file_manager import file_manager
from src.utils.email import send_file_expiration_warning

logger = logging.getLogger(__name__)

class CleanupTasks:
    """Tareas de limpieza automática para el sistema"""
    
    @staticmethod
    def cleanup_expired_files() -> Dict[str, Any]:
        """Tarea principal de limpieza de archivos expirados"""
        try:
            logger.info("Iniciando limpieza de archivos expirados")
            
            # Ejecutar limpieza usando el file manager
            cleanup_stats = file_manager.cleanup_expired_files()
            
            # Limpiar archivos huérfanos también
            orphan_stats = file_manager.cleanup_orphaned_files()
            
            # Combinar estadísticas
            total_stats = {
                'expired_files': cleanup_stats,
                'orphaned_files': orphan_stats,
                'total_files_deleted': cleanup_stats.get('files_deleted', 0) + orphan_stats.get('orphaned_files', 0),
                'total_space_freed_mb': cleanup_stats.get('space_freed_mb', 0) + orphan_stats.get('space_freed_mb', 0),
                'execution_time': datetime.utcnow().isoformat()
            }
            
            logger.info(f"Limpieza completada: {total_stats}")
            return total_stats
            
        except Exception as e:
            logger.error(f"Error en limpieza de archivos: {str(e)}")
            return {'error': str(e)}
    
    @staticmethod
    def send_expiration_warnings() -> Dict[str, Any]:
        """Envía advertencias de expiración a usuarios"""
        try:
            logger.info("Enviando advertencias de expiración")
            
            # Obtener archivos que expiran en las próximas 24 horas
            expiring_files = file_manager.get_files_expiring_soon(hours_threshold=24)
            
            warnings_sent = 0
            errors = 0
            
            for file_info in expiring_files:
                try:
                    if file_info['user_id']:  # Solo para usuarios registrados
                        send_file_expiration_warning(file_info['user_id'], file_info['file_id'])
                        warnings_sent += 1
                except Exception as e:
                    logger.error(f"Error enviando advertencia para archivo {file_info['file_id']}: {str(e)}")
                    errors += 1
            
            stats = {
                'files_expiring_soon': len(expiring_files),
                'warnings_sent': warnings_sent,
                'errors': errors,
                'execution_time': datetime.utcnow().isoformat()
            }
            
            logger.info(f"Advertencias de expiración enviadas: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Error enviando advertencias de expiración: {str(e)}")
            return {'error': str(e)}
    
    @staticmethod
    def cleanup_old_sessions() -> Dict[str, Any]:
        """Limpia sesiones anónimas antiguas"""
        try:
            logger.info("Limpiando sesiones anónimas antiguas")
            
            # Eliminar archivos de sesiones anónimas de más de 7 días
            cutoff_date = datetime.utcnow() - timedelta(days=7)
            
            old_session_files = File.query.filter(
                File.user_id.is_(None),
                File.session_id.isnot(None),
                File.created_at < cutoff_date
            ).all()
            
            files_deleted = 0
            space_freed_mb = 0
            
            for file_record in old_session_files:
                try:
                    # Eliminar archivos físicos
                    if file_record.original_file_path:
                        file_manager.delete_file(file_record.original_file_path)
                        space_freed_mb += file_record.original_size_bytes / (1024 * 1024)
                    
                    if file_record.converted_file_path:
                        file_manager.delete_file(file_record.converted_file_path)
                        space_freed_mb += (file_record.converted_size_bytes or 0) / (1024 * 1024)
                    
                    # Eliminar registro de base de datos
                    db.session.delete(file_record)
                    files_deleted += 1
                    
                except Exception as e:
                    logger.error(f"Error eliminando archivo de sesión {file_record.id}: {str(e)}")
            
            db.session.commit()
            
            stats = {
                'old_session_files_deleted': files_deleted,
                'space_freed_mb': round(space_freed_mb, 2),
                'cutoff_date': cutoff_date.isoformat(),
                'execution_time': datetime.utcnow().isoformat()
            }
            
            logger.info(f"Limpieza de sesiones antiguas completada: {stats}")
            return stats
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error limpiando sesiones antiguas: {str(e)}")
            return {'error': str(e)}
    
    @staticmethod
    def update_user_activity_streaks() -> Dict[str, Any]:
        """Actualiza las rachas de actividad de los usuarios"""
        try:
            logger.info("Actualizando rachas de actividad de usuarios")
            
            # Obtener todos los usuarios activos
            active_users = User.query.filter_by(is_active=True).all()
            
            streaks_updated = 0
            streaks_broken = 0
            
            for user in active_users:
                try:
                    old_streak = user.current_streak
                    user.update_activity_streak()
                    
                    if user.current_streak != old_streak:
                        if user.current_streak == 0:
                            streaks_broken += 1
                        else:
                            streaks_updated += 1
                    
                except Exception as e:
                    logger.error(f"Error actualizando racha del usuario {user.id}: {str(e)}")
            
            db.session.commit()
            
            stats = {
                'users_processed': len(active_users),
                'streaks_updated': streaks_updated,
                'streaks_broken': streaks_broken,
                'execution_time': datetime.utcnow().isoformat()
            }
            
            logger.info(f"Actualización de rachas completada: {stats}")
            return stats
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error actualizando rachas de actividad: {str(e)}")
            return {'error': str(e)}
    
    @staticmethod
    def generate_storage_report() -> Dict[str, Any]:
        """Genera reporte de uso de almacenamiento"""
        try:
            logger.info("Generando reporte de almacenamiento")
            
            # Obtener estadísticas de almacenamiento
            storage_stats = file_manager.get_storage_stats()
            
            # Estadísticas adicionales por usuario
            user_stats = db.session.query(
                File.user_id,
                db.func.count(File.id).label('file_count'),
                db.func.sum(File.original_size_bytes + db.func.coalesce(File.converted_size_bytes, 0)).label('total_size')
            ).filter_by(is_deleted=False).group_by(File.user_id).all()
            
            # Top usuarios por uso de espacio
            top_users = sorted(
                [(stat.user_id, stat.file_count, stat.total_size or 0) for stat in user_stats],
                key=lambda x: x[2],
                reverse=True
            )[:10]
            
            # Estadísticas por formato
            format_stats = db.session.query(
                File.target_format,
                db.func.count(File.id).label('conversion_count'),
                db.func.sum(File.converted_size_bytes).label('total_size')
            ).filter_by(is_deleted=False).group_by(File.target_format).all()
            
            report = {
                'storage_overview': storage_stats,
                'top_users_by_storage': [
                    {
                        'user_id': user_id,
                        'file_count': file_count,
                        'total_size_mb': round((total_size or 0) / (1024 * 1024), 2)
                    }
                    for user_id, file_count, total_size in top_users
                ],
                'format_statistics': [
                    {
                        'format': stat.target_format,
                        'conversion_count': stat.conversion_count,
                        'total_size_mb': round((stat.total_size or 0) / (1024 * 1024), 2)
                    }
                    for stat in format_stats
                ],
                'generated_at': datetime.utcnow().isoformat()
            }
            
            logger.info("Reporte de almacenamiento generado exitosamente")
            return report
            
        except Exception as e:
            logger.error(f"Error generando reporte de almacenamiento: {str(e)}")
            return {'error': str(e)}
    
    @staticmethod
    def run_daily_maintenance() -> Dict[str, Any]:
        """Ejecuta todas las tareas de mantenimiento diario"""
        try:
            logger.info("Iniciando mantenimiento diario")
            
            maintenance_results = {
                'start_time': datetime.utcnow().isoformat(),
                'tasks': {}
            }
            
            # Ejecutar todas las tareas de mantenimiento
            tasks = [
                ('cleanup_expired_files', CleanupTasks.cleanup_expired_files),
                ('send_expiration_warnings', CleanupTasks.send_expiration_warnings),
                ('cleanup_old_sessions', CleanupTasks.cleanup_old_sessions),
                ('update_user_streaks', CleanupTasks.update_user_activity_streaks),
                ('storage_report', CleanupTasks.generate_storage_report)
            ]
            
            for task_name, task_function in tasks:
                try:
                    logger.info(f"Ejecutando tarea: {task_name}")
                    result = task_function()
                    maintenance_results['tasks'][task_name] = {
                        'status': 'success',
                        'result': result
                    }
                except Exception as e:
                    logger.error(f"Error en tarea {task_name}: {str(e)}")
                    maintenance_results['tasks'][task_name] = {
                        'status': 'error',
                        'error': str(e)
                    }
            
            maintenance_results['end_time'] = datetime.utcnow().isoformat()
            maintenance_results['duration_seconds'] = (
                datetime.fromisoformat(maintenance_results['end_time']) - 
                datetime.fromisoformat(maintenance_results['start_time'])
            ).total_seconds()
            
            logger.info(f"Mantenimiento diario completado: {maintenance_results}")
            return maintenance_results
            
        except Exception as e:
            logger.error(f"Error en mantenimiento diario: {str(e)}")
            return {'error': str(e)}

# Instancia global de tareas de limpieza
cleanup_tasks = CleanupTasks()

