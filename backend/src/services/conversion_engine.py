import os
import shutil
import time
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from enum import Enum

from src.models import db
from src.models.file import File
from src.services.file_manager import file_manager

logger = logging.getLogger(__name__)

class ConversionStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ConversionEngine:
    """Motor de conversión de archivos para Anclora Converter"""
    
    def __init__(self):
        self.supported_conversions = self._load_supported_conversions()
    
    def _load_supported_conversions(self) -> Dict[str, list]:
        """Carga las conversiones soportadas"""
        return {
            # Imágenes
            'jpg': ['png', 'gif', 'bmp', 'tiff', 'webp', 'pdf'],
            'jpeg': ['png', 'gif', 'bmp', 'tiff', 'webp', 'pdf'],
            'png': ['jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp', 'pdf'],
            'gif': ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'webp'],
            'bmp': ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'webp', 'pdf'],
            'tiff': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf'],
            'webp': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'pdf'],
            'svg': ['png', 'jpg', 'jpeg', 'pdf'],
            
            # Documentos
            'pdf': ['doc', 'docx', 'txt', 'jpg', 'png'],
            'doc': ['pdf', 'docx', 'txt'],
            'docx': ['pdf', 'doc', 'txt'],
            'txt': ['pdf', 'doc', 'docx'],
            'rtf': ['pdf', 'doc', 'docx', 'txt'],
            'odt': ['pdf', 'doc', 'docx', 'txt'],
            
            # Audio
            'mp3': ['wav', 'flac', 'aac', 'ogg', 'm4a'],
            'wav': ['mp3', 'flac', 'aac', 'ogg', 'm4a'],
            'flac': ['mp3', 'wav', 'aac', 'ogg', 'm4a'],
            'aac': ['mp3', 'wav', 'flac', 'ogg', 'm4a'],
            'ogg': ['mp3', 'wav', 'flac', 'aac', 'm4a'],
            'm4a': ['mp3', 'wav', 'flac', 'aac', 'ogg'],
            
            # Video
            'mp4': ['avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
            'avi': ['mp4', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
            'mov': ['mp4', 'avi', 'wmv', 'flv', 'mkv', 'webm'],
            'wmv': ['mp4', 'avi', 'mov', 'flv', 'mkv', 'webm'],
            'flv': ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'],
            'mkv': ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
            'webm': ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv']
        }
    
    def is_conversion_supported(self, source_format: str, target_format: str) -> bool:
        """Verifica si una conversión es soportada"""
        source_format = source_format.lower().strip()
        target_format = target_format.lower().strip()
        
        return (source_format in self.supported_conversions and 
                target_format in self.supported_conversions[source_format])
    
    def estimate_conversion_time(self, file_size_mb: float, source_format: str, target_format: str) -> int:
        """Estima el tiempo de conversión en segundos"""
        # Factores base por tipo de conversión
        base_times = {
            'image': 2,    # 2 segundos base para imágenes
            'document': 5, # 5 segundos base para documentos
            'audio': 10,   # 10 segundos base para audio
            'video': 30    # 30 segundos base para video
        }
        
        # Determinar tipo de archivo
        format_types = {
            'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg'],
            'document': ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
            'audio': ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
            'video': ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm']
        }
        
        file_type = 'document'  # Por defecto
        for type_name, formats in format_types.items():
            if source_format.lower() in formats:
                file_type = type_name
                break
        
        # Calcular tiempo estimado
        base_time = base_times[file_type]
        size_factor = max(1, file_size_mb / 10)  # Factor por cada 10MB
        
        estimated_seconds = int(base_time * size_factor)
        return max(5, min(estimated_seconds, 300))  # Entre 5 segundos y 5 minutos
    
    def start_conversion(self, file_id: str) -> Dict[str, Any]:
        """Inicia el proceso de conversión de un archivo"""
        try:
            file_record = File.query.get(file_id)
            
            if not file_record:
                return {'success': False, 'error': 'Archivo no encontrado'}
            
            if file_record.conversion_status != 'pending':
                return {'success': False, 'error': f'El archivo ya está en estado: {file_record.conversion_status}'}
            
            # Verificar que la conversión es soportada
            if not self.is_conversion_supported(file_record.original_format, file_record.target_format):
                file_record.conversion_status = 'failed'
                file_record.error_message = 'Conversión no soportada'
                db.session.commit()
                return {'success': False, 'error': 'Conversión no soportada'}
            
            # Verificar que el archivo original existe
            if not os.path.exists(file_record.original_file_path):
                file_record.conversion_status = 'failed'
                file_record.error_message = 'Archivo original no encontrado'
                db.session.commit()
                return {'success': False, 'error': 'Archivo original no encontrado'}
            
            # Actualizar estado a procesando
            file_record.conversion_status = 'processing'
            file_record.conversion_started_at = datetime.utcnow()
            
            # Estimar tiempo de conversión
            estimated_time = self.estimate_conversion_time(
                file_record.file_size_mb,
                file_record.original_format,
                file_record.target_format
            )
            file_record.estimated_completion_time = datetime.utcnow().timestamp() + estimated_time
            
            db.session.commit()
            
            # En una implementación real, aquí se enviaría a una cola de procesamiento
            # Por ahora, simularemos la conversión inmediatamente
            result = self._simulate_conversion(file_record)
            
            return result
            
        except Exception as e:
            logger.error(f"Error iniciando conversión: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _simulate_conversion(self, file_record: File) -> Dict[str, Any]:
        """Simula el proceso de conversión (para desarrollo)"""
        try:
            # Simular tiempo de procesamiento
            processing_time = min(3, self.estimate_conversion_time(
                file_record.file_size_mb,
                file_record.original_format,
                file_record.target_format
            ))
            
            logger.info(f"Simulando conversión de {file_record.original_format} a {file_record.target_format} por {processing_time}s")
            time.sleep(processing_time)
            
            # Generar ruta para archivo convertido
            original_path = file_record.original_file_path
            base_name = os.path.splitext(original_path)[0]
            converted_path = f"{base_name}_converted.{file_record.target_format}"
            
            # Simular conversión copiando el archivo original
            # En una implementación real, aquí se usarían librerías de conversión específicas
            shutil.copy2(original_path, converted_path)
            
            # Obtener información del archivo convertido
            converted_info = file_manager.get_file_info(converted_path)
            
            # Actualizar registro en base de datos
            file_record.conversion_status = 'completed'
            file_record.conversion_completed_at = datetime.utcnow()
            file_record.converted_file_path = converted_path
            file_record.converted_size_bytes = converted_info['size_bytes']
            
            # Simular diferentes tamaños según el tipo de conversión
            if file_record.target_format in ['jpg', 'jpeg']:
                # JPG suele ser más pequeño
                file_record.converted_size_bytes = int(file_record.original_size_bytes * 0.7)
            elif file_record.target_format == 'png':
                # PNG suele ser más grande
                file_record.converted_size_bytes = int(file_record.original_size_bytes * 1.2)
            elif file_record.target_format == 'pdf':
                # PDF puede variar mucho
                file_record.converted_size_bytes = int(file_record.original_size_bytes * 0.9)
            
            db.session.commit()
            
            logger.info(f"Conversión completada exitosamente: {file_record.id}")
            
            return {
                'success': True,
                'file_id': file_record.id,
                'conversion_time_seconds': processing_time,
                'original_size_mb': file_record.file_size_mb,
                'converted_size_mb': round(file_record.converted_size_bytes / (1024 * 1024), 2)
            }
            
        except Exception as e:
            # Marcar conversión como fallida
            file_record.conversion_status = 'failed'
            file_record.error_message = str(e)
            db.session.commit()
            
            logger.error(f"Error en conversión simulada: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def cancel_conversion(self, file_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Cancela una conversión en progreso"""
        try:
            file_record = File.query.get(file_id)
            
            if not file_record:
                return {'success': False, 'error': 'Archivo no encontrado'}
            
            # Verificar permisos si se proporciona user_id
            if user_id and file_record.user_id != user_id:
                return {'success': False, 'error': 'No tienes permisos para cancelar esta conversión'}
            
            if file_record.conversion_status not in ['pending', 'processing']:
                return {'success': False, 'error': f'No se puede cancelar conversión en estado: {file_record.conversion_status}'}
            
            # Cancelar conversión
            file_record.conversion_status = 'cancelled'
            file_record.error_message = 'Conversión cancelada por el usuario'
            
            db.session.commit()
            
            logger.info(f"Conversión cancelada: {file_record.id}")
            
            return {'success': True, 'message': 'Conversión cancelada exitosamente'}
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error cancelando conversión: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_conversion_status(self, file_id: str) -> Dict[str, Any]:
        """Obtiene el estado actual de una conversión"""
        try:
            file_record = File.query.get(file_id)
            
            if not file_record:
                return {'success': False, 'error': 'Archivo no encontrado'}
            
            status_info = {
                'file_id': file_record.id,
                'status': file_record.conversion_status,
                'progress_percentage': file_record.conversion_progress,
                'started_at': file_record.conversion_started_at.isoformat() if file_record.conversion_started_at else None,
                'completed_at': file_record.conversion_completed_at.isoformat() if file_record.conversion_completed_at else None,
                'estimated_completion': file_record.estimated_completion_time,
                'error_message': file_record.error_message
            }
            
            # Calcular tiempo restante estimado
            if file_record.conversion_status == 'processing' and file_record.estimated_completion_time:
                remaining_seconds = max(0, file_record.estimated_completion_time - datetime.utcnow().timestamp())
                status_info['estimated_remaining_seconds'] = int(remaining_seconds)
            
            return {'success': True, 'status': status_info}
            
        except Exception as e:
            logger.error(f"Error obteniendo estado de conversión: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_supported_formats(self) -> Dict[str, Any]:
        """Obtiene la lista de formatos soportados"""
        return {
            'supported_conversions': self.supported_conversions,
            'format_categories': {
                'images': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg'],
                'documents': ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
                'audio': ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
                'video': ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm']
            },
            'total_conversions': sum(len(targets) for targets in self.supported_conversions.values())
        }

# Instancia global del motor de conversión
conversion_engine = ConversionEngine()

