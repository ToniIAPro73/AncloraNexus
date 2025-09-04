# src/api/anclora_client.py - Cliente para interactuar con Anclora Nexus
import aiohttp
import asyncio
import requests
import time
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List
import logging
import json
from dataclasses import dataclass

from src.config import TestingConfig
from src.models import TestResult, TestStatus

logger = logging.getLogger(__name__)

@dataclass
class ConversionResponse:
    """Respuesta de conversión de Anclora Nexus"""
    success: bool
    conversion_id: Optional[str] = None
    output_file_path: Optional[Path] = None
    execution_time: float = 0.0
    file_size_input: Optional[int] = None
    file_size_output: Optional[int] = None
    error_message: Optional[str] = None
    quality_metrics: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.quality_metrics is None:
            self.quality_metrics = {}

class AncloraClient:
    """Cliente para interactuar con la API de Anclora Nexus"""
    
    def __init__(self, config: TestingConfig):
        self.config = config
        self.base_url = config.ANCLORA_API_URL.rstrip('/')
        self.session = requests.Session()
        self.auth_token = None
        self.logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")
        
        # Configurar headers por defecto
        self.session.headers.update({
            'User-Agent': 'Anclora-Testing-Suite/1.0',
            'Content-Type': 'application/json'
        })
        
        # Configurar autenticación si está disponible
        if config.ANCLORA_API_KEY:
            self.session.headers['Authorization'] = f'Bearer {config.ANCLORA_API_KEY}'
    
    async def health_check(self) -> Dict[str, Any]:
        """Verificar estado de salud de Anclora Nexus"""
        try:
            start_time = time.time()
            response = self.session.get(f'{self.base_url}/api/health', timeout=10)
            response_time = (time.time() - start_time) * 1000  # en ms
            
            if response.status_code == 200:
                health_data = response.json() if response.content else {}
                return {
                    'status': 'healthy',
                    'response_time_ms': response_time,
                    'version': health_data.get('version', 'unknown'),
                    'timestamp': health_data.get('timestamp'),
                    'details': health_data
                }
            else:
                return {
                    'status': 'unhealthy',
                    'response_time_ms': response_time,
                    'error': f'HTTP {response.status_code}',
                    'details': response.text[:200] if response.text else None
                }
                
        except requests.exceptions.Timeout:
            return {
                'status': 'timeout',
                'error': 'Request timed out after 10 seconds'
            }
        except requests.exceptions.ConnectionError:
            return {
                'status': 'unreachable',
                'error': 'Cannot connect to Anclora Nexus API'
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def authenticate(self) -> bool:
        """Autenticar con Anclora Nexus si es necesario"""
        if self.config.ANCLORA_API_KEY:
            # Ya tenemos API key, no necesitamos autenticar
            return True
        
        if not self.config.ANCLORA_TEST_USER or not self.config.ANCLORA_TEST_PASSWORD:
            self.logger.warning("No se proporcionaron credenciales de autenticación")
            return False
        
        try:
            auth_data = {
                'email': self.config.ANCLORA_TEST_USER,
                'password': self.config.ANCLORA_TEST_PASSWORD
            }
            
            response = self.session.post(
                f'{self.base_url}/api/auth/login',
                json=auth_data,
                timeout=30
            )
            
            if response.status_code == 200:
                auth_result = response.json()
                self.auth_token = auth_result.get('access_token')
                
                if self.auth_token:
                    self.session.headers['Authorization'] = f'Bearer {self.auth_token}'
                    self.logger.info("✅ Autenticación exitosa con Anclora Nexus")
                    return True
                else:
                    self.logger.error("❌ Token de acceso no recibido")
                    return False
            else:
                self.logger.error(f"❌ Error de autenticación: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Error durante autenticación: {e}")
            return False
    
    def get_supported_conversions(self) -> Dict[str, List[str]]:
        """Obtener conversiones soportadas por Anclora Nexus"""
        try:
            response = self.session.get(f'{self.base_url}/api/conversion/formats', timeout=30)
            
            if response.status_code == 200:
                return response.json().get('supported_conversions', {})
            else:
                self.logger.warning(f"No se pudieron obtener conversiones soportadas: HTTP {response.status_code}")
                # Fallback a conversiones conocidas
                from src.config import SUPPORTED_CONVERSIONS
                return SUPPORTED_CONVERSIONS
                
        except Exception as e:
            self.logger.error(f"Error obteniendo conversiones soportadas: {e}")
            from src.config import SUPPORTED_CONVERSIONS
            return SUPPORTED_CONVERSIONS
    
    def convert_file(
        self, 
        file_path: Path, 
        source_format: str, 
        target_format: str,
        timeout: Optional[int] = None,
        quality_params: Optional[Dict[str, Any]] = None
    ) -> ConversionResponse:
        """Convertir un archivo usando Anclora Nexus"""
        
        conversion_timeout = timeout or self.config.TIMEOUT_SECONDS
        start_time = time.time()
        
        try:
            # Verificar que el archivo existe
            if not file_path.exists():
                return ConversionResponse(
                    success=False,
                    error_message=f"Archivo no encontrado: {file_path}"
                )
            
            file_size_input = file_path.stat().st_size
            
            # Preparar archivos para upload
            with open(file_path, 'rb') as f:
                files = {
                    'file': (file_path.name, f, self._get_mime_type(source_format))
                }
                
                # Datos de conversión
                data = {
                    'target_format': target_format,
                    'source_format': source_format
                }
                
                # Agregar parámetros de calidad si se proporcionan
                if quality_params:
                    data.update(quality_params)
                
                # Realizar conversión
                response = self.session.post(
                    f'{self.base_url}/api/conversion/convert',
                    files=files,
                    data=data,
                    timeout=conversion_timeout
                )
            
            execution_time = time.time() - start_time
            
            if response.status_code == 200:
                # Conversión exitosa - descargar resultado
                result_data = response.json()
                conversion_id = result_data.get('conversion_id')
                
                # Descargar archivo convertido
                download_response = self.session.get(
                    f'{self.base_url}/api/conversion/download/{conversion_id}',
                    timeout=60
                )
                
                if download_response.status_code == 200:
                    # Guardar archivo convertido
                    output_file = self._save_converted_file(
                        download_response.content,
                        file_path.stem,
                        target_format
                    )
                    
                    return ConversionResponse(
                        success=True,
                        conversion_id=conversion_id,
                        output_file_path=output_file,
                        execution_time=execution_time,
                        file_size_input=file_size_input,
                        file_size_output=output_file.stat().st_size if output_file else None,
                        quality_metrics=result_data.get('quality_metrics', {})
                    )
                else:
                    return ConversionResponse(
                        success=False,
                        error_message=f"Error descargando resultado: HTTP {download_response.status_code}",
                        execution_time=execution_time
                    )
            
            elif response.status_code == 400:
                # Error de cliente - conversión no soportada o archivo inválido
                error_data = response.json() if response.content else {}
                return ConversionResponse(
                    success=False,
                    error_message=error_data.get('message', 'Error de validación'),
                    execution_time=execution_time
                )
            
            elif response.status_code == 413:
                # Archivo demasiado grande
                return ConversionResponse(
                    success=False,
                    error_message="Archivo demasiado grande",
                    execution_time=execution_time
                )
            
            elif response.status_code == 429:
                # Rate limit excedido
                return ConversionResponse(
                    success=False,
                    error_message="Límite de rate alcanzado - intentar más tarde",
                    execution_time=execution_time
                )
            
            elif response.status_code == 500:
                # Error del servidor
                return ConversionResponse(
                    success=False,
                    error_message="Error interno del servidor de Anclora Nexus",
                    execution_time=execution_time
                )
            
            else:
                # Otro error HTTP
                return ConversionResponse(
                    success=False,
                    error_message=f"Error HTTP {response.status_code}: {response.text[:100]}",
                    execution_time=execution_time
                )
                
        except requests.exceptions.Timeout:
            execution_time = time.time() - start_time
            return ConversionResponse(
                success=False,
                error_message=f"Timeout después de {conversion_timeout} segundos",
                execution_time=execution_time
            )
        
        except requests.exceptions.ConnectionError:
            execution_time = time.time() - start_time
            return ConversionResponse(
                success=False,
                error_message="Error de conexión con Anclora Nexus",
                execution_time=execution_time
            )
        
        except Exception as e:
            execution_time = time.time() - start_time
            return ConversionResponse(
                success=False,
                error_message=f"Error inesperado: {str(e)}",
                execution_time=execution_time
            )
    
    def convert_sequence(
        self,
        file_path: Path,
        conversion_steps: List[Tuple[str, str]],
        timeout: Optional[int] = None
    ) -> ConversionResponse:
        """Convertir archivo usando secuencia de conversiones"""
        
        total_timeout = timeout or (self.config.TIMEOUT_SECONDS * len(conversion_steps))
        start_time = time.time()
        current_file = file_path
        intermediate_files = []
        
        try:
            for i, (source_fmt, target_fmt) in enumerate(conversion_steps):
                self.logger.info(f"🔄 Paso {i+1}/{len(conversion_steps)}: {source_fmt} → {target_fmt}")
                
                # Calcular timeout para este paso
                remaining_time = total_timeout - (time.time() - start_time)
                step_timeout = min(remaining_time, self.config.TIMEOUT_SECONDS)
                
                if step_timeout <= 0:
                    return ConversionResponse(
                        success=False,
                        error_message="Timeout en secuencia de conversión",
                        execution_time=time.time() - start_time
                    )
                
                # Ejecutar conversión del paso
                step_result = self.convert_file(
                    current_file, 
                    source_fmt, 
                    target_fmt, 
                    timeout=int(step_timeout)
                )
                
                if not step_result.success:
                    return ConversionResponse(
                        success=False,
                        error_message=f"Error en paso {i+1}: {step_result.error_message}",
                        execution_time=time.time() - start_time
                    )
                
                # Actualizar archivo actual para siguiente paso
                if step_result.output_file_path:
                    current_file = step_result.output_file_path
                    intermediate_files.append(current_file)
                
            # Retornar resultado final
            final_execution_time = time.time() - start_time
            
            return ConversionResponse(
                success=True,
                output_file_path=current_file,
                execution_time=final_execution_time,
                file_size_input=file_path.stat().st_size,
                file_size_output=current_file.stat().st_size if current_file else None
            )
            
        except Exception as e:
            return ConversionResponse(
                success=False,
                error_message=f"Error en secuencia: {str(e)}",
                execution_time=time.time() - start_time
            )
        
        finally:
            # Limpiar archivos intermedios opcionales
            # (comentado para preservar para debugging)
            # for temp_file in intermediate_files[:-1]:  # Preservar último archivo
            #     try:
            #         temp_file.unlink()
            #     except:
            #         pass
            pass
    
    def _get_mime_type(self, format_name: str) -> str:
        """Obtener MIME type para formato de archivo"""
        mime_types = {
            'txt': 'text/plain',
            'html': 'text/html',
            'md': 'text/markdown',
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'doc': 'application/msword',
            'rtf': 'application/rtf',
            'odt': 'application/vnd.oasis.opendocument.text',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
            'csv': 'text/csv',
            'json': 'application/json',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
        return mime_types.get(format_name.lower(), 'application/octet-stream')
    
    def _save_converted_file(
        self, 
        content: bytes, 
        base_name: str, 
        target_format: str
    ) -> Path:
        """Guardar archivo convertido en directorio temporal"""
        from src.config import config
        
        output_dir = config.REPORTS_PATH / "converted_files"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = int(time.time())
        output_file = output_dir / f"{base_name}_{timestamp}.{target_format}"
        
        with open(output_file, 'wb') as f:
            f.write(content)
        
        return output_file
    
    def __enter__(self):
        """Context manager entry"""
        if self.authenticate():
            return self
        else:
            raise RuntimeError("No se pudo autenticar con Anclora Nexus")
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.session.close()

# Cliente asíncrono para operaciones paralelas
class AsyncAncloraClient:
    """Cliente asíncrono para Anclora Nexus"""
    
    def __init__(self, config: TestingConfig):
        self.config = config
        self.base_url = config.ANCLORA_API_URL.rstrip('/')
        self.auth_token = None
        
    async def health_check(self) -> Dict[str, Any]:
        """Verificar estado de salud de forma asíncrona"""
        async with aiohttp.ClientSession() as session:
            try:
                start_time = time.time()
                async with session.get(
                    f'{self.base_url}/api/health', 
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    response_time = (time.time() - start_time) * 1000
                    
                    if response.status == 200:
                        data = await response.json()
                        return {
                            'status': 'healthy',
                            'response_time_ms': response_time,
                            'version': data.get('version', 'unknown'),
                            'details': data
                        }
                    else:
                        return {
                            'status': 'unhealthy',
                            'response_time_ms': response_time,
                            'error': f'HTTP {response.status}'
                        }
            except asyncio.TimeoutError:
                return {'status': 'timeout', 'error': 'Request timed out'}
            except Exception as e:
                return {'status': 'error', 'error': str(e)}