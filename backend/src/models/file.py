from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import uuid
import json
import os

db = SQLAlchemy()

class File(db.Model):
    __tablename__ = 'files'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='SET NULL'), index=True)
    session_id = db.Column(db.String(255), index=True)  # Para usuarios anónimos
    
    # Información del archivo original
    original_filename = db.Column(db.String(255), nullable=False)
    original_format = db.Column(db.String(20), nullable=False, index=True)
    target_format = db.Column(db.String(20), nullable=False, index=True)
    original_size_bytes = db.Column(db.BigInteger, nullable=False)
    converted_size_bytes = db.Column(db.BigInteger)
    
    # Rutas de almacenamiento
    original_file_path = db.Column(db.Text, nullable=False)
    converted_file_path = db.Column(db.Text)
    
    # Estado de conversión
    conversion_status = db.Column(db.String(50), default='pending', index=True)
    # Posibles estados: pending, processing, completed, failed, expired
    
    conversion_started_at = db.Column(db.DateTime)
    conversion_completed_at = db.Column(db.DateTime)
    
    # Retención y expiración
    expires_at = db.Column(db.DateTime, nullable=False, index=True)
    expiration_notification_sent = db.Column(db.Boolean, default=False)
    
    # Estadísticas de uso
    download_count = db.Column(db.Integer, default=0)
    last_downloaded_at = db.Column(db.DateTime)
    
    # Parámetros de conversión (JSON)
    conversion_parameters = db.Column(db.Text, default='{}')
    
    # Información de error
    error_message = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f'<File {self.original_filename} ({self.original_format} -> {self.target_format})>'
    
    def get_conversion_parameters(self):
        """Obtiene los parámetros de conversión como dict"""
        try:
            return json.loads(self.conversion_parameters)
        except:
            return {}
    
    def set_conversion_parameters(self, parameters):
        """Establece los parámetros de conversión"""
        self.conversion_parameters = json.dumps(parameters)
    
    @property
    def is_expired(self):
        """Verifica si el archivo ha expirado"""
        return datetime.utcnow() > self.expires_at
    
    @property
    def time_until_expiration(self):
        """Tiempo hasta la expiración"""
        if self.is_expired:
            return timedelta(0)
        return self.expires_at - datetime.utcnow()
    
    @property
    def hours_until_expiration(self):
        """Horas hasta la expiración"""
        delta = self.time_until_expiration
        return max(0, delta.total_seconds() / 3600)
    
    @property
    def file_size_mb(self):
        """Tamaño del archivo original en MB"""
        return round(self.original_size_bytes / (1024 * 1024), 2)
    
    @property
    def converted_file_size_mb(self):
        """Tamaño del archivo convertido en MB"""
        if self.converted_size_bytes:
            return round(self.converted_size_bytes / (1024 * 1024), 2)
        return None
    
    @property
    def conversion_type(self):
        """Tipo de conversión basado en formatos"""
        format_categories = {
            'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg'],
            'document': ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
            'audio': ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
            'video': ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm']
        }
        
        source_category = None
        target_category = None
        
        for category, formats in format_categories.items():
            if self.original_format.lower() in formats:
                source_category = category
            if self.target_format.lower() in formats:
                target_category = category
        
        if source_category == target_category:
            return f"{source_category}_to_{target_category}"
        else:
            return "complex_workflow"
    
    def increment_download_count(self):
        """Incrementa el contador de descargas"""
        self.download_count += 1
        self.last_downloaded_at = datetime.utcnow()
    
    def extend_retention(self, hours):
        """Extiende el período de retención"""
        self.expires_at = self.expires_at + timedelta(hours=hours)
        self.expiration_notification_sent = False
    
    def mark_as_expired(self):
        """Marca el archivo como expirado y limpia rutas"""
        self.conversion_status = 'expired'
        
        # Eliminar archivos físicos si existen
        if self.original_file_path and os.path.exists(self.original_file_path):
            try:
                os.remove(self.original_file_path)
            except:
                pass
        
        if self.converted_file_path and os.path.exists(self.converted_file_path):
            try:
                os.remove(self.converted_file_path)
            except:
                pass
        
        # Limpiar rutas en base de datos
        self.original_file_path = None
        self.converted_file_path = None
    
    def to_dict(self, include_paths=False):
        """Convierte el archivo a diccionario"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'session_id': self.session_id,
            'original_filename': self.original_filename,
            'original_format': self.original_format,
            'target_format': self.target_format,
            'original_size_bytes': self.original_size_bytes,
            'converted_size_bytes': self.converted_size_bytes,
            'file_size_mb': self.file_size_mb,
            'converted_file_size_mb': self.converted_file_size_mb,
            'conversion_status': self.conversion_status,
            'conversion_type': self.conversion_type,
            'conversion_started_at': self.conversion_started_at.isoformat() if self.conversion_started_at else None,
            'conversion_completed_at': self.conversion_completed_at.isoformat() if self.conversion_completed_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_expired': self.is_expired,
            'hours_until_expiration': round(self.hours_until_expiration, 1),
            'download_count': self.download_count,
            'last_downloaded_at': self.last_downloaded_at.isoformat() if self.last_downloaded_at else None,
            'conversion_parameters': self.get_conversion_parameters(),
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_paths:
            data.update({
                'original_file_path': self.original_file_path,
                'converted_file_path': self.converted_file_path
            })
        
        return data

