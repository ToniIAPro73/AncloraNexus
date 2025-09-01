# ================================
# ANCLORA NEXUS - BATCH DOWNLOAD SERVICE
# Sistema de descarga por lotes con ZIP
# ================================

import os
import zipfile
import tempfile
import uuid
import time
import json
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path

@dataclass
class BatchItem:
    """Elemento de descarga por lotes"""
    file_id: str
    original_filename: str
    converted_filename: str
    file_path: str
    conversion_info: Dict[str, Any]
    file_size: int
    added_at: datetime

@dataclass
class BatchDownload:
    """Descarga por lotes"""
    batch_id: str
    items: List[BatchItem]
    zip_path: str
    total_size: int
    created_at: datetime
    expires_at: datetime
    status: str  # 'preparing', 'ready', 'expired', 'error'
    download_count: int = 0

class BatchDownloadService:
    """Servicio de descarga por lotes"""
    
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
        self.batch_dir = os.path.join(self.temp_dir, 'anclora_batches')
        self.active_batches: Dict[str, BatchDownload] = {}
        self.max_batch_size = 100 * 1024 * 1024  # 100MB máximo por lote
        self.max_files_per_batch = 20
        self.batch_expiry_hours = 24
        
        # Crear directorio de lotes
        os.makedirs(self.batch_dir, exist_ok=True)

    def create_batch(self, user_id: Optional[str] = None) -> str:
        """Crea un nuevo lote de descarga"""
        
        batch_id = f"batch_{uuid.uuid4().hex[:12]}"
        
        batch = BatchDownload(
            batch_id=batch_id,
            items=[],
            zip_path="",
            total_size=0,
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(hours=self.batch_expiry_hours),
            status='preparing'
        )
        
        self.active_batches[batch_id] = batch
        return batch_id

    def add_file_to_batch(self, batch_id: str, file_path: str, original_filename: str, 
                         converted_filename: str, conversion_info: Dict[str, Any]) -> bool:
        """Agrega archivo al lote"""
        
        if batch_id not in self.active_batches:
            return False
        
        batch = self.active_batches[batch_id]
        
        # Verificar límites
        if len(batch.items) >= self.max_files_per_batch:
            return False
        
        if not os.path.exists(file_path):
            return False
        
        file_size = os.path.getsize(file_path)
        if batch.total_size + file_size > self.max_batch_size:
            return False
        
        # Agregar archivo al lote
        item = BatchItem(
            file_id=str(uuid.uuid4()),
            original_filename=original_filename,
            converted_filename=converted_filename,
            file_path=file_path,
            conversion_info=conversion_info,
            file_size=file_size,
            added_at=datetime.now()
        )
        
        batch.items.append(item)
        batch.total_size += file_size
        
        return True

    async def prepare_batch_zip(self, batch_id: str, progress_callback: Optional[callable] = None) -> bool:
        """Prepara el archivo ZIP del lote"""
        
        if batch_id not in self.active_batches:
            return False
        
        batch = self.active_batches[batch_id]
        
        if batch.status != 'preparing':
            return False
        
        try:
            # Crear archivo ZIP
            zip_filename = f"{batch_id}.zip"
            zip_path = os.path.join(self.batch_dir, zip_filename)
            
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                total_files = len(batch.items)
                
                # Agregar cada archivo al ZIP
                for i, item in enumerate(batch.items):
                    if os.path.exists(item.file_path):
                        # Usar nombre convertido para el archivo en el ZIP
                        arcname = item.converted_filename
                        
                        # Evitar nombres duplicados
                        counter = 1
                        original_arcname = arcname
                        while arcname in [info.filename for info in zipf.filelist]:
                            name, ext = os.path.splitext(original_arcname)
                            arcname = f"{name}_{counter}{ext}"
                            counter += 1
                        
                        zipf.write(item.file_path, arcname)
                        
                        # Callback de progreso
                        if progress_callback:
                            progress = ((i + 1) / total_files) * 100
                            progress_callback(progress, f"Agregando {arcname} al ZIP")
                
                # Agregar archivo de información del lote
                batch_info = {
                    'batch_id': batch_id,
                    'created_at': batch.created_at.isoformat(),
                    'total_files': len(batch.items),
                    'total_size_mb': batch.total_size / (1024 * 1024),
                    'conversions': [
                        {
                            'original': item.original_filename,
                            'converted': item.converted_filename,
                            'conversion_info': item.conversion_info
                        } for item in batch.items
                    ],
                    'generated_by': 'Anclora Nexus - Tu Contenido, Reinventado',
                    'website': 'https://anclora.com'
                }
                
                zipf.writestr('ANCLORA_BATCH_INFO.json', json.dumps(batch_info, indent=2))
            
            # Actualizar estado del lote
            batch.zip_path = zip_path
            batch.status = 'ready'
            
            return True
            
        except Exception as e:
            batch.status = 'error'
            print(f"Error preparando ZIP del lote {batch_id}: {e}")
            return False

    def get_batch_info(self, batch_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene información del lote"""
        
        if batch_id not in self.active_batches:
            return None
        
        batch = self.active_batches[batch_id]
        
        # Verificar si ha expirado
        if datetime.now() > batch.expires_at:
            batch.status = 'expired'
        
        return {
            'batch_id': batch_id,
            'status': batch.status,
            'total_files': len(batch.items),
            'total_size_mb': batch.total_size / (1024 * 1024),
            'created_at': batch.created_at.isoformat(),
            'expires_at': batch.expires_at.isoformat(),
            'download_count': batch.download_count,
            'files': [
                {
                    'file_id': item.file_id,
                    'original_filename': item.original_filename,
                    'converted_filename': item.converted_filename,
                    'file_size_mb': item.file_size / (1024 * 1024),
                    'conversion_info': item.conversion_info
                } for item in batch.items
            ]
        }

    def get_batch_zip_path(self, batch_id: str) -> Optional[str]:
        """Obtiene la ruta del ZIP del lote"""
        
        if batch_id not in self.active_batches:
            return None
        
        batch = self.active_batches[batch_id]
        
        # Verificar estado y expiración
        if batch.status != 'ready' or datetime.now() > batch.expires_at:
            return None
        
        if not os.path.exists(batch.zip_path):
            return None
        
        # Incrementar contador de descargas
        batch.download_count += 1
        
        return batch.zip_path

    def cleanup_expired_batches(self):
        """Limpia lotes expirados"""
        
        current_time = datetime.now()
        expired_batches = []
        
        for batch_id, batch in self.active_batches.items():
            if current_time > batch.expires_at:
                expired_batches.append(batch_id)
                
                # Eliminar archivo ZIP si existe
                if batch.zip_path and os.path.exists(batch.zip_path):
                    try:
                        os.remove(batch.zip_path)
                    except Exception as e:
                        print(f"Error eliminando ZIP expirado {batch.zip_path}: {e}")
        
        # Remover lotes expirados de memoria
        for batch_id in expired_batches:
            del self.active_batches[batch_id]
        
        return len(expired_batches)

    def get_batch_statistics(self) -> Dict[str, Any]:
        """Obtiene estadísticas de lotes"""
        
        total_batches = len(self.active_batches)
        ready_batches = sum(1 for b in self.active_batches.values() if b.status == 'ready')
        total_files = sum(len(b.items) for b in self.active_batches.values())
        total_size_mb = sum(b.total_size for b in self.active_batches.values()) / (1024 * 1024)
        
        return {
            'total_batches': total_batches,
            'ready_batches': ready_batches,
            'preparing_batches': total_batches - ready_batches,
            'total_files': total_files,
            'total_size_mb': round(total_size_mb, 2),
            'average_files_per_batch': round(total_files / max(total_batches, 1), 1)
        }

    def remove_file_from_batch(self, batch_id: str, file_id: str) -> bool:
        """Remueve archivo específico del lote"""
        
        if batch_id not in self.active_batches:
            return False
        
        batch = self.active_batches[batch_id]
        
        # Buscar y remover archivo
        for i, item in enumerate(batch.items):
            if item.file_id == file_id:
                removed_item = batch.items.pop(i)
                batch.total_size -= removed_item.file_size
                return True
        
        return False

    def clear_batch(self, batch_id: str) -> bool:
        """Limpia completamente un lote"""
        
        if batch_id not in self.active_batches:
            return False
        
        batch = self.active_batches[batch_id]
        
        # Eliminar archivo ZIP si existe
        if batch.zip_path and os.path.exists(batch.zip_path):
            try:
                os.remove(batch.zip_path)
            except Exception as e:
                print(f"Error eliminando ZIP {batch.zip_path}: {e}")
        
        # Remover del diccionario
        del self.active_batches[batch_id]
        return True

# Instancia global del servicio de descarga por lotes
batch_download_service = BatchDownloadService()
