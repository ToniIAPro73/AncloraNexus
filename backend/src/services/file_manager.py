import os
import shutil
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from werkzeug.utils import secure_filename
import mimetypes
import logging

from src.models import db
from src.models.file import File
from src.models.user import User

logger = logging.getLogger(__name__)

class FileManager:
    """Gestor de archivos para Anclora Converter"""
    
    def __init__(self, upload_folder: str = '/tmp/anclora_uploads'):
        self.upload_folder = upload_folder
        self.ensure_upload_directory()
    
    def ensure_upload_directory(self):
        """Asegura que el directorio de subida existe"""
        os.makedirs(self.upload_folder, exist_ok=True)
        
        # Crear subdirectorios por fecha para organización
        today = datetime.utcnow().strftime('%Y/%m/%d')
        daily_folder = os.path.join(self.upload_folder, today)
        os.makedirs(daily_folder, exist_ok=True)
    
    def generate_file_path(self, original_filename: str, user_id: Optional[str] = None) -> str:
        """Genera una ruta única para el archivo"""
        # Usar fecha actual para organizar archivos
        today = datetime.utcnow().strftime('%Y/%m/%d')
        timestamp = datetime.utcnow().strftime('%H%M%S_%f')
        
        # Generar hash único basado en contenido y timestamp
        unique_id = hashlib.md5(f"{timestamp}_{original_filename}_{user_id or 'anonymous'}".encode()).hexdigest()[:8]
        
        # Crear nombre seguro
        safe_filename = secure_filename(original_filename)
        name, ext = os.path.splitext(safe_filename)
        
        # Construir ruta final
        filename = f"{timestamp}_{unique_id}_{name}{ext}"
        return os.path.join(self.upload_folder, today, filename)
    
    def save_uploaded_file(self, file, target_path: str) -> Dict[str, Any]:
        """Guarda un archivo subido y retorna información del archivo"""
        try:
            # Crear directorio si no existe
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            
            # Guardar archivo
            file.save(target_path)
            
            # Obtener información del archivo
            file_info = self.get_file_info(target_path)
            file_info['saved_path'] = target_path
            
            logger.info(f"Archivo guardado exitosamente: {target_path}")
            return file_info
            
        except Exception as e:
            logger.error(f"Error guardando archivo: {str(e)}")
            raise Exception(f"Error guardando archivo: {str(e)}")
    
    def get_file_info(self, file_path: str) -> Dict[str, Any]:
        """Obtiene información detallada de un archivo"""
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Archivo no encontrado: {file_path}")
            
            stat = os.stat(file_path)
            mime_type, _ = mimetypes.guess_type(file_path)
            
            return {
                'size_bytes': stat.st_size,
                'size_mb': round(stat.st_size / (1024 * 1024), 2),
                'mime_type': mime_type,
                'created_at': datetime.fromtimestamp(stat.st_ctime),
                'modified_at': datetime.fromtimestamp(stat.st_mtime),
                'extension': os.path.splitext(file_path)[1].lower().lstrip('.'),
                'exists': True
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo información de archivo: {str(e)}")
            return {'exists': False, 'error': str(e)}
    
    def delete_file(self, file_path: str) -> bool:
        """Elimina un archivo físico del sistema"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Archivo eliminado: {file_path}")
                return True
            else:
                logger.warning(f"Archivo no encontrado para eliminar: {file_path}")
                return False
                
        except Exception as e:
            logger.error(f"Error eliminando archivo: {str(e)}")
            return False
    
    def cleanup_expired_files(self) -> Dict[str, int]:
        """Limpia archivos expirados del sistema"""
        try:
            # Obtener archivos expirados de la base de datos
            expired_files = File.query.filter(
                File.expires_at <= datetime.utcnow(),
                File.is_deleted == False
            ).all()
            
            stats = {
                'files_processed': 0,
                'files_deleted': 0,
                'space_freed_mb': 0,
                'errors': 0
            }
            
            for file_record in expired_files:
                stats['files_processed'] += 1
                
                try:
                    # Eliminar archivo original
                    if file_record.original_file_path:
                        if self.delete_file(file_record.original_file_path):
                            stats['space_freed_mb'] += file_record.original_size_bytes / (1024 * 1024)
                    
                    # Eliminar archivo convertido
                    if file_record.converted_file_path:
                        if self.delete_file(file_record.converted_file_path):
                            stats['space_freed_mb'] += (file_record.converted_size_bytes or 0) / (1024 * 1024)
                    
                    # Marcar como eliminado en base de datos
                    file_record.mark_as_expired()
                    stats['files_deleted'] += 1
                    
                except Exception as e:
                    logger.error(f"Error procesando archivo expirado {file_record.id}: {str(e)}")
                    stats['errors'] += 1
            
            # Confirmar cambios en base de datos
            db.session.commit()
            
            stats['space_freed_mb'] = round(stats['space_freed_mb'], 2)
            logger.info(f"Limpieza completada: {stats}")
            
            return stats
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error en limpieza de archivos: {str(e)}")
            return {'error': str(e)}
    
    def cleanup_orphaned_files(self) -> Dict[str, int]:
        """Limpia archivos físicos que no tienen registro en base de datos"""
        try:
            stats = {
                'files_scanned': 0,
                'orphaned_files': 0,
                'space_freed_mb': 0,
                'errors': 0
            }
            
            # Escanear directorio de uploads
            for root, dirs, files in os.walk(self.upload_folder):
                for filename in files:
                    file_path = os.path.join(root, filename)
                    stats['files_scanned'] += 1
                    
                    try:
                        # Verificar si el archivo existe en base de datos
                        file_record = File.query.filter(
                            (File.original_file_path == file_path) |
                            (File.converted_file_path == file_path)
                        ).first()
                        
                        if not file_record:
                            # Archivo huérfano, eliminar
                            file_size = os.path.getsize(file_path)
                            if self.delete_file(file_path):
                                stats['orphaned_files'] += 1
                                stats['space_freed_mb'] += file_size / (1024 * 1024)
                        
                    except Exception as e:
                        logger.error(f"Error procesando archivo {file_path}: {str(e)}")
                        stats['errors'] += 1
            
            stats['space_freed_mb'] = round(stats['space_freed_mb'], 2)
            logger.info(f"Limpieza de huérfanos completada: {stats}")
            
            return stats
            
        except Exception as e:
            logger.error(f"Error en limpieza de archivos huérfanos: {str(e)}")
            return {'error': str(e)}
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas de almacenamiento"""
        try:
            # Estadísticas de base de datos
            total_files = File.query.count()
            active_files = File.query.filter_by(is_deleted=False).count()
            expired_files = File.query.filter(
                File.expires_at <= datetime.utcnow(),
                File.is_deleted == False
            ).count()
            
            # Calcular espacio usado
            total_size_query = db.session.query(
                db.func.sum(File.original_size_bytes + db.func.coalesce(File.converted_size_bytes, 0))
            ).filter_by(is_deleted=False).scalar()
            
            total_size_mb = (total_size_query or 0) / (1024 * 1024)
            
            # Estadísticas del sistema de archivos
            disk_usage = shutil.disk_usage(self.upload_folder)
            
            return {
                'database_stats': {
                    'total_files': total_files,
                    'active_files': active_files,
                    'expired_files': expired_files,
                    'total_size_mb': round(total_size_mb, 2)
                },
                'filesystem_stats': {
                    'upload_folder': self.upload_folder,
                    'total_space_gb': round(disk_usage.total / (1024**3), 2),
                    'used_space_gb': round(disk_usage.used / (1024**3), 2),
                    'free_space_gb': round(disk_usage.free / (1024**3), 2),
                    'usage_percentage': round((disk_usage.used / disk_usage.total) * 100, 1)
                }
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas de almacenamiento: {str(e)}")
            return {'error': str(e)}
    
    def extend_file_retention(self, file_id: str, hours: int, user_id: str) -> Dict[str, Any]:
        """Extiende la retención de un archivo específico"""
        try:
            file_record = File.query.get(file_id)
            
            if not file_record:
                return {'success': False, 'error': 'Archivo no encontrado'}
            
            if file_record.user_id != user_id:
                return {'success': False, 'error': 'No tienes permisos para este archivo'}
            
            if file_record.is_expired:
                return {'success': False, 'error': 'El archivo ya ha expirado'}
            
            # Extender retención
            old_expiry = file_record.expires_at
            file_record.extend_retention(hours)
            
            db.session.commit()
            
            return {
                'success': True,
                'old_expiry': old_expiry.isoformat(),
                'new_expiry': file_record.expires_at.isoformat(),
                'hours_extended': hours
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error extendiendo retención: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_files_expiring_soon(self, hours_threshold: int = 24) -> List[Dict[str, Any]]:
        """Obtiene archivos que expirarán pronto"""
        try:
            threshold_time = datetime.utcnow() + timedelta(hours=hours_threshold)
            
            expiring_files = File.query.filter(
                File.expires_at <= threshold_time,
                File.expires_at > datetime.utcnow(),
                File.is_deleted == False
            ).all()
            
            return [
                {
                    'file_id': f.id,
                    'user_id': f.user_id,
                    'filename': f.original_filename,
                    'expires_at': f.expires_at.isoformat(),
                    'hours_until_expiration': f.hours_until_expiration
                }
                for f in expiring_files
            ]
            
        except Exception as e:
            logger.error(f"Error obteniendo archivos que expiran pronto: {str(e)}")
            return []

# Instancia global del gestor de archivos
file_manager = FileManager()

