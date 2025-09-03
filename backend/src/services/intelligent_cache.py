"""
Sistema de Cache Inteligente para Anclora Nexus
Optimiza conversiones reutilizando resultados intermedios y finales
"""

import os
import hashlib
import json
import logging
import time
import shutil
from typing import Dict, Optional, List, Tuple, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
import sqlite3
import threading

@dataclass
class CacheEntry:
    """Entrada del cache de conversiones"""
    cache_key: str
    source_format: str
    target_format: str
    file_hash: str
    file_size: int
    cached_file_path: str
    created_at: datetime
    last_accessed: datetime
    access_count: int
    conversion_time: float
    quality_score: float
    metadata: Dict[str, Any]

class IntelligentCache:
    """Sistema de cache inteligente para conversiones"""
    
    def __init__(self, cache_dir: str = "cache", max_size_gb: float = 5.0, 
                 max_age_days: int = 30):
        self.cache_dir = Path(cache_dir)
        self.max_size_bytes = int(max_size_gb * 1024 * 1024 * 1024)
        self.max_age_days = max_age_days
        self.db_path = self.cache_dir / "cache_index.db"
        self._lock = threading.RLock()
        
        # Crear directorio de cache
        self.cache_dir.mkdir(exist_ok=True)
        
        # Inicializar base de datos
        self._init_database()
        
        # Limpiar cache al inicializar
        self._cleanup_expired_entries()
        
        logging.info(f"Cache inteligente inicializado: {cache_dir} (max: {max_size_gb}GB, {max_age_days} días)")
    
    def _init_database(self):
        """Inicializar base de datos SQLite para el índice del cache"""
        try:
            with sqlite3.connect(str(self.db_path)) as conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS cache_entries (
                        cache_key TEXT PRIMARY KEY,
                        source_format TEXT NOT NULL,
                        target_format TEXT NOT NULL,
                        file_hash TEXT NOT NULL,
                        file_size INTEGER NOT NULL,
                        cached_file_path TEXT NOT NULL,
                        created_at TEXT NOT NULL,
                        last_accessed TEXT NOT NULL,
                        access_count INTEGER DEFAULT 0,
                        conversion_time REAL DEFAULT 0.0,
                        quality_score REAL DEFAULT 0.8,
                        metadata TEXT DEFAULT '{}'
                    )
                ''')
                
                # Índices para optimizar consultas
                conn.execute('CREATE INDEX IF NOT EXISTS idx_file_hash ON cache_entries(file_hash)')
                conn.execute('CREATE INDEX IF NOT EXISTS idx_formats ON cache_entries(source_format, target_format)')
                conn.execute('CREATE INDEX IF NOT EXISTS idx_last_accessed ON cache_entries(last_accessed)')
                
                conn.commit()
                
        except Exception as e:
            logging.error(f"Error inicializando base de datos de cache: {e}")
    
    def _calculate_file_hash(self, file_path: str) -> str:
        """Calcular hash SHA-256 de un archivo"""
        try:
            hash_sha256 = hashlib.sha256()
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_sha256.update(chunk)
            return hash_sha256.hexdigest()
        except Exception as e:
            logging.error(f"Error calculando hash de archivo: {e}")
            return ""
    
    def _generate_cache_key(self, file_hash: str, source_format: str, 
                          target_format: str, parameters: Dict = None) -> str:
        """Generar clave única para el cache"""
        try:
            # Incluir parámetros de conversión en la clave si existen
            params_str = ""
            if parameters:
                # Ordenar parámetros para consistencia
                sorted_params = sorted(parameters.items())
                params_str = json.dumps(sorted_params, sort_keys=True)
            
            cache_data = f"{file_hash}:{source_format}:{target_format}:{params_str}"
            return hashlib.md5(cache_data.encode()).hexdigest()
            
        except Exception as e:
            logging.error(f"Error generando clave de cache: {e}")
            return ""
    
    def get_cached_conversion(self, file_path: str, source_format: str, 
                            target_format: str, parameters: Dict = None) -> Optional[str]:
        """
        Obtener conversión desde el cache si existe
        
        Args:
            file_path: Ruta del archivo original
            source_format: Formato de origen
            target_format: Formato de destino
            parameters: Parámetros de conversión opcionales
            
        Returns:
            Ruta del archivo cacheado o None si no existe
        """
        try:
            with self._lock:
                # Calcular hash del archivo
                file_hash = self._calculate_file_hash(file_path)
                if not file_hash:
                    return None
                
                # Generar clave de cache
                cache_key = self._generate_cache_key(file_hash, source_format, target_format, parameters)
                if not cache_key:
                    return None
                
                # Buscar en la base de datos
                with sqlite3.connect(str(self.db_path)) as conn:
                    cursor = conn.execute(
                        'SELECT cached_file_path, access_count FROM cache_entries WHERE cache_key = ?',
                        (cache_key,)
                    )
                    result = cursor.fetchone()
                    
                    if result:
                        cached_file_path, access_count = result
                        
                        # Verificar que el archivo cacheado existe
                        if os.path.exists(cached_file_path):
                            # Actualizar estadísticas de acceso
                            now = datetime.now().isoformat()
                            conn.execute(
                                'UPDATE cache_entries SET last_accessed = ?, access_count = ? WHERE cache_key = ?',
                                (now, access_count + 1, cache_key)
                            )
                            conn.commit()
                            
                            logging.info(f"Cache HIT: {source_format}→{target_format} (key: {cache_key[:8]}...)")
                            return cached_file_path
                        else:
                            # Archivo cacheado no existe, eliminar entrada
                            conn.execute('DELETE FROM cache_entries WHERE cache_key = ?', (cache_key,))
                            conn.commit()
                            logging.warning(f"Archivo cacheado no encontrado, entrada eliminada: {cached_file_path}")
                
                logging.debug(f"Cache MISS: {source_format}→{target_format}")
                return None
                
        except Exception as e:
            logging.error(f"Error obteniendo conversión cacheada: {e}")
            return None
    
    def cache_conversion(self, original_file: str, converted_file: str, 
                        source_format: str, target_format: str,
                        conversion_time: float = 0.0, quality_score: float = 0.8,
                        parameters: Dict = None, metadata: Dict = None) -> bool:
        """
        Cachear el resultado de una conversión
        
        Args:
            original_file: Ruta del archivo original
            converted_file: Ruta del archivo convertido
            source_format: Formato de origen
            target_format: Formato de destino
            conversion_time: Tiempo que tomó la conversión
            quality_score: Puntuación de calidad (0-1)
            parameters: Parámetros de conversión
            metadata: Metadatos adicionales
            
        Returns:
            True si se cacheó exitosamente
        """
        try:
            with self._lock:
                # Verificar que los archivos existen
                if not os.path.exists(original_file) or not os.path.exists(converted_file):
                    return False
                
                # Calcular hash del archivo original
                file_hash = self._calculate_file_hash(original_file)
                if not file_hash:
                    return False
                
                # Generar clave de cache
                cache_key = self._generate_cache_key(file_hash, source_format, target_format, parameters)
                if not cache_key:
                    return False
                
                # Crear nombre único para el archivo cacheado
                file_extension = Path(converted_file).suffix
                cached_filename = f"{cache_key}{file_extension}"
                cached_file_path = self.cache_dir / cached_filename
                
                # Copiar archivo convertido al cache
                shutil.copy2(converted_file, cached_file_path)
                
                # Obtener información del archivo
                file_size = os.path.getsize(original_file)
                cached_size = os.path.getsize(cached_file_path)
                
                # Preparar metadatos
                cache_metadata = {
                    'original_size': file_size,
                    'cached_size': cached_size,
                    'compression_ratio': cached_size / file_size if file_size > 0 else 1.0,
                    'parameters': parameters or {},
                    'custom_metadata': metadata or {}
                }
                
                # Guardar en la base de datos
                now = datetime.now().isoformat()
                
                with sqlite3.connect(str(self.db_path)) as conn:
                    conn.execute('''
                        INSERT OR REPLACE INTO cache_entries 
                        (cache_key, source_format, target_format, file_hash, file_size,
                         cached_file_path, created_at, last_accessed, access_count,
                         conversion_time, quality_score, metadata)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        cache_key, source_format, target_format, file_hash, file_size,
                        str(cached_file_path), now, now, 0,
                        conversion_time, quality_score, json.dumps(cache_metadata)
                    ))
                    conn.commit()
                
                logging.info(f"Conversión cacheada: {source_format}→{target_format} (key: {cache_key[:8]}..., size: {cached_size} bytes)")
                
                # Verificar límites del cache
                self._enforce_cache_limits()
                
                return True
                
        except Exception as e:
            logging.error(f"Error cacheando conversión: {e}")
            return False
    
    def _enforce_cache_limits(self):
        """Aplicar límites de tamaño y edad del cache"""
        try:
            with sqlite3.connect(str(self.db_path)) as conn:
                # Obtener estadísticas del cache
                cursor = conn.execute('''
                    SELECT SUM(file_size) as total_size, COUNT(*) as total_entries
                    FROM cache_entries
                ''')
                result = cursor.fetchone()
                total_size, total_entries = result if result else (0, 0)
                
                logging.debug(f"Cache stats: {total_entries} entries, {total_size / (1024*1024):.1f} MB")
                
                # Limpiar entradas expiradas
                cutoff_date = (datetime.now() - timedelta(days=self.max_age_days)).isoformat()
                expired_cursor = conn.execute(
                    'SELECT cache_key, cached_file_path FROM cache_entries WHERE created_at < ?',
                    (cutoff_date,)
                )
                expired_entries = expired_cursor.fetchall()
                
                for cache_key, cached_file_path in expired_entries:
                    self._remove_cache_entry(cache_key, cached_file_path, conn)
                
                if expired_entries:
                    logging.info(f"Eliminadas {len(expired_entries)} entradas expiradas del cache")
                
                # Si aún excede el límite de tamaño, eliminar entradas menos utilizadas
                if total_size > self.max_size_bytes:
                    self._cleanup_by_usage(conn, total_size)
                
        except Exception as e:
            logging.error(f"Error aplicando límites de cache: {e}")
    
    def _cleanup_by_usage(self, conn, current_size: int):
        """Limpiar cache por uso (LRU - Least Recently Used)"""
        try:
            target_size = int(self.max_size_bytes * 0.8)  # Reducir al 80% del límite
            size_to_free = current_size - target_size
            
            # Obtener entradas ordenadas por último acceso (menos recientes primero)
            cursor = conn.execute('''
                SELECT cache_key, cached_file_path, file_size
                FROM cache_entries
                ORDER BY last_accessed ASC, access_count ASC
            ''')
            
            freed_size = 0
            removed_count = 0
            
            for cache_key, cached_file_path, file_size in cursor:
                if freed_size >= size_to_free:
                    break
                
                self._remove_cache_entry(cache_key, cached_file_path, conn)
                freed_size += file_size
                removed_count += 1
            
            if removed_count > 0:
                logging.info(f"Cache cleanup: eliminadas {removed_count} entradas, liberados {freed_size / (1024*1024):.1f} MB")
                
        except Exception as e:
            logging.error(f"Error en cleanup por uso: {e}")
    
    def _remove_cache_entry(self, cache_key: str, cached_file_path: str, conn):
        """Eliminar una entrada del cache"""
        try:
            # Eliminar archivo físico
            if os.path.exists(cached_file_path):
                os.remove(cached_file_path)
            
            # Eliminar entrada de la base de datos
            conn.execute('DELETE FROM cache_entries WHERE cache_key = ?', (cache_key,))
            
        except Exception as e:
            logging.warning(f"Error eliminando entrada de cache {cache_key}: {e}")
    
    def _cleanup_expired_entries(self):
        """Limpiar entradas expiradas al inicializar"""
        try:
            with self._lock:
                self._enforce_cache_limits()
        except Exception as e:
            logging.error(f"Error en cleanup inicial: {e}")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas del cache"""
        try:
            with sqlite3.connect(str(self.db_path)) as conn:
                # Estadísticas generales
                cursor = conn.execute('''
                    SELECT 
                        COUNT(*) as total_entries,
                        SUM(file_size) as total_size,
                        AVG(conversion_time) as avg_conversion_time,
                        AVG(quality_score) as avg_quality,
                        SUM(access_count) as total_accesses
                    FROM cache_entries
                ''')
                general_stats = cursor.fetchone()
                
                # Conversiones más populares
                cursor = conn.execute('''
                    SELECT source_format, target_format, COUNT(*) as count, SUM(access_count) as accesses
                    FROM cache_entries
                    GROUP BY source_format, target_format
                    ORDER BY accesses DESC
                    LIMIT 10
                ''')
                popular_conversions = cursor.fetchall()
                
                # Calcular hit rate (aproximado)
                total_accesses = general_stats[4] if general_stats[4] else 0
                total_entries = general_stats[0] if general_stats[0] else 0
                hit_rate = (total_accesses / max(total_entries, 1)) if total_entries > 0 else 0
                
                return {
                    'total_entries': total_entries,
                    'total_size_mb': (general_stats[1] or 0) / (1024 * 1024),
                    'max_size_mb': self.max_size_bytes / (1024 * 1024),
                    'avg_conversion_time': general_stats[2] or 0,
                    'avg_quality_score': general_stats[3] or 0,
                    'total_accesses': total_accesses,
                    'estimated_hit_rate': hit_rate,
                    'max_age_days': self.max_age_days,
                    'popular_conversions': [
                        {
                            'conversion': f"{row[0]}→{row[1]}",
                            'cached_count': row[2],
                            'total_accesses': row[3]
                        }
                        for row in popular_conversions
                    ]
                }
                
        except Exception as e:
            logging.error(f"Error obteniendo estadísticas de cache: {e}")
            return {}
    
    def clear_cache(self, older_than_days: int = None) -> int:
        """
        Limpiar cache completamente o entradas más antiguas que X días
        
        Returns:
            Número de entradas eliminadas
        """
        try:
            with self._lock:
                with sqlite3.connect(str(self.db_path)) as conn:
                    if older_than_days:
                        cutoff_date = (datetime.now() - timedelta(days=older_than_days)).isoformat()
                        cursor = conn.execute(
                            'SELECT cache_key, cached_file_path FROM cache_entries WHERE created_at < ?',
                            (cutoff_date,)
                        )
                    else:
                        cursor = conn.execute('SELECT cache_key, cached_file_path FROM cache_entries')
                    
                    entries_to_remove = cursor.fetchall()
                    
                    for cache_key, cached_file_path in entries_to_remove:
                        self._remove_cache_entry(cache_key, cached_file_path, conn)
                    
                    conn.commit()
                    
                    logging.info(f"Cache limpiado: {len(entries_to_remove)} entradas eliminadas")
                    return len(entries_to_remove)
                    
        except Exception as e:
            logging.error(f"Error limpiando cache: {e}")
            return 0

# Instancia global del cache inteligente
intelligent_cache = IntelligentCache()
