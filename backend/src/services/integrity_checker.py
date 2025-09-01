"""
Sistema de Verificación de Integridad Pre-conversión
Implementa checksums, validación completa y verificaciones específicas
"""
import os
import hashlib
import tempfile
import zipfile
from pathlib import Path
from typing import Dict, Tuple, List, Optional

class IntegrityChecker:
    """Verificador de integridad de archivos antes de conversión"""
    
    def __init__(self):
        self.max_file_size = 1024 * 1024 * 1024  # 1GB máximo
        self.temp_dir = Path(tempfile.gettempdir()) / "anclora_integrity_checks"
        self.temp_dir.mkdir(exist_ok=True)

    def pre_conversion_check(self, file_path: str, source_format: str, target_format: str) -> Tuple[bool, str, Dict]:
        """Verificación completa antes de conversión"""
        file_path = Path(file_path)
        
        check_results = {
            'file_exists': False,
            'size_valid': False,
            'readable': False,
            'format_valid': False,
            'integrity_valid': False,
            'encoding_safe': False,
            'checksum': None,
            'warnings': [],
            'recommendations': []
        }
        
        # 1. Verificar existencia y acceso
        if not file_path.exists():
            return False, "El archivo no existe o no es accesible", check_results
        
        check_results['file_exists'] = True
        
        # 2. Verificar tamaño
        file_size = file_path.stat().st_size
        if file_size == 0:
            return False, "El archivo está vacío", check_results
        
        if file_size > self.max_file_size:
            return False, f"El archivo es demasiado grande (máximo 1GB)", check_results
        
        check_results['size_valid'] = True
        check_results['file_size_mb'] = round(file_size / (1024 * 1024), 2)
        
        # 3. Verificar legibilidad
        try:
            with open(file_path, 'rb') as f:
                header = f.read(1024)  # Leer header
                f.seek(-min(1024, file_size), 2)  # Ir al final
                footer = f.read(1024)  # Leer footer
            check_results['readable'] = True
        except Exception as e:
            return False, f"No se puede leer el archivo: {str(e)}", check_results
        
        # 4. Verificar formato específico
        format_valid, format_message = self._verify_format_specific(file_path, source_format, header, footer)
        check_results['format_valid'] = format_valid
        check_results['format_message'] = format_message
        
        if not format_valid:
            return False, format_message, check_results
        
        # 5. Verificar integridad completa
        integrity_valid, integrity_message = self._verify_complete_integrity(file_path, source_format)
        check_results['integrity_valid'] = integrity_valid
        check_results['integrity_message'] = integrity_message
        
        if not integrity_valid:
            return False, integrity_message, check_results
        
        # 6. Verificar seguridad de encoding
        encoding_safe, encoding_message = self._verify_encoding_safety(file_path, source_format)
        check_results['encoding_safe'] = encoding_safe
        check_results['encoding_message'] = encoding_message
        
        # 7. Calcular checksum para integridad
        check_results['checksum'] = self._calculate_checksums(file_path)
        
        # 8. Generar advertencias y recomendaciones
        self._generate_warnings_and_recommendations(check_results, source_format, target_format)
        
        return True, "Archivo verificado y listo para conversión", check_results

    def _verify_format_specific(self, file_path: Path, format_type: str, header: bytes, footer: bytes) -> Tuple[bool, str]:
        """Verificaciones específicas por formato"""
        format_type = format_type.lower()
        
        if format_type == 'pdf':
            if not header.startswith(b'%PDF'):
                return False, "El archivo no tiene header PDF válido"
            if not footer.rstrip().endswith(b'%%EOF'):
                return False, "El archivo PDF no tiene terminación válida"
            return True, "PDF con estructura válida"
        
        elif format_type in ['docx', 'epub', 'odt']:
            if not header.startswith(b'PK\x03\x04'):
                return False, f"El archivo no es un ZIP válido (requerido para {format_type.upper()})"
            return True, f"Archivo ZIP-based válido para {format_type.upper()}"
        
        elif format_type in ['jpg', 'jpeg']:
            if not header.startswith(b'\xff\xd8\xff'):
                return False, "El archivo no tiene header JPEG válido"
            if not footer.endswith(b'\xff\xd9'):
                return False, "El archivo JPEG no tiene terminación válida"
            return True, "JPEG con estructura válida"
        
        elif format_type == 'png':
            if not header.startswith(b'\x89PNG\r\n\x1a\n'):
                return False, "El archivo no tiene header PNG válido"
            if not footer.endswith(b'IEND\xaeB`\x82'):
                return False, "El archivo PNG no tiene terminación válida"
            return True, "PNG con estructura válida"
        
        elif format_type == 'gif':
            if not (header.startswith(b'GIF87a') or header.startswith(b'GIF89a')):
                return False, "El archivo no tiene header GIF válido"
            return True, "GIF con estructura válida"
        
        else:
            # Para archivos de texto, verificar que sea decodificable
            try:
                header.decode('utf-8', errors='strict')
                return True, f"Archivo de texto {format_type.upper()} válido"
            except UnicodeDecodeError:
                return True, f"Archivo {format_type.upper()} con encoding no-UTF8 (se normalizará)"

    def _verify_complete_integrity(self, file_path: Path, format_type: str) -> Tuple[bool, str]:
        """Verificación completa de integridad"""
        format_type = format_type.lower()
        
        try:
            if format_type in ['docx', 'epub', 'odt']:
                # Verificar que todo el ZIP se puede leer
                with zipfile.ZipFile(file_path, 'r') as zf:
                    for file_info in zf.filelist:
                        try:
                            zf.read(file_info.filename)
                        except Exception as e:
                            return False, f"Archivo corrupto en ZIP: {file_info.filename}"
                return True, "Integridad ZIP verificada completamente"
            
            elif format_type == 'pdf':
                # Verificar que se puede leer completamente
                from pypdf import PdfReader
                with open(file_path, 'rb') as f:
                    reader = PdfReader(f)
                    for i, page in enumerate(reader.pages):
                        try:
                            page.extract_text()
                        except Exception as e:
                            return False, f"Página {i+1} del PDF corrupta"
                return True, "Integridad PDF verificada completamente"
            
            elif format_type in ['jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff', 'bmp']:
                # Verificar que la imagen se puede procesar completamente
                from PIL import Image
                with Image.open(file_path) as img:
                    img.load()  # Cargar imagen completa
                return True, "Integridad de imagen verificada"
            
            elif format_type == 'json':
                # Verificar que el JSON es válido
                import json
                with open(file_path, 'r', encoding='utf-8') as f:
                    json.load(f)
                return True, "JSON válido y bien formado"
            
            else:
                # Para otros formatos, verificación básica de lectura
                with open(file_path, 'rb') as f:
                    while True:
                        chunk = f.read(8192)
                        if not chunk:
                            break
                return True, "Archivo legible completamente"
                
        except Exception as e:
            return False, f"Error en verificación de integridad: {str(e)}"

    def _verify_encoding_safety(self, file_path: Path, format_type: str) -> Tuple[bool, str]:
        """Verifica que el encoding del archivo es seguro para conversión"""
        format_type = format_type.lower()
        
        # Archivos binarios no necesitan verificación de encoding
        if format_type in ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff', 'bmp', 'docx', 'epub', 'odt']:
            return True, "Archivo binario: encoding no aplicable"
        
        try:
            # Para archivos de texto, verificar encoding
            with open(file_path, 'rb') as f:
                raw_bytes = f.read()
            
            # Intentar decodificar con UTF-8
            try:
                raw_bytes.decode('utf-8')
                return True, "Encoding UTF-8 válido"
            except UnicodeDecodeError:
                # Verificar otros encodings comunes
                for encoding in ['latin-1', 'windows-1252', 'iso-8859-1']:
                    try:
                        raw_bytes.decode(encoding)
                        return True, f"Encoding {encoding} detectado (se normalizará a UTF-8)"
                    except UnicodeDecodeError:
                        continue
                
                return False, "Encoding no reconocido o archivo corrupto"
                
        except Exception as e:
            return False, f"Error verificando encoding: {str(e)}"

    def _calculate_checksums(self, file_path: Path) -> Dict[str, str]:
        """Calcula múltiples checksums para verificación"""
        checksums = {}
        
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            
            checksums['md5'] = hashlib.md5(content).hexdigest()
            checksums['sha256'] = hashlib.sha256(content).hexdigest()
            
        except Exception:
            checksums['md5'] = 'error'
            checksums['sha256'] = 'error'
        
        return checksums

    def _generate_warnings_and_recommendations(self, check_results: Dict, source_format: str, target_format: str):
        """Genera advertencias y recomendaciones específicas"""
        warnings = []
        recommendations = []
        
        # Advertencias por tamaño
        file_size_mb = check_results.get('file_size_mb', 0)
        if file_size_mb > 100:
            warnings.append(f"Archivo muy grande ({file_size_mb}MB): conversión puede ser lenta")
        elif file_size_mb > 50:
            warnings.append(f"Archivo grande ({file_size_mb}MB): considere calidad estándar")
        
        # Recomendaciones por tipo de conversión
        if source_format.lower() == 'csv' and target_format.lower() == 'html':
            recommendations.append("La conversión generará una tabla HTML interactiva")
        
        if source_format.lower() in ['docx', 'odt'] and target_format.lower() == 'pdf':
            recommendations.append("Se preservará el formato del documento original")
        
        if source_format.lower() in ['jpg', 'png'] and target_format.lower() == 'pdf':
            recommendations.append("La imagen se insertará en un documento PDF")
        
        check_results['warnings'] = warnings
        check_results['recommendations'] = recommendations

# Instancia global del verificador de integridad
integrity_checker = IntegrityChecker()
