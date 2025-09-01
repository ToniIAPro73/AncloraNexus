"""
Sistema de Validación Estricta de Archivos para Anclora Nexus
Implementa verificación de magic numbers, signatures y integridad
"""
import os
import hashlib
import zipfile
import mimetypes
from pathlib import Path
from typing import Dict, Tuple, Optional, List

class FileValidator:
    """Validador estricto de archivos con verificación de signatures"""
    
    def __init__(self):
        # Magic numbers / signatures para cada tipo de archivo
        self.file_signatures = {
            # Documentos
            'pdf': [b'%PDF'],
            'docx': [b'PK\x03\x04'],  # ZIP-based
            'doc': [b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1'],  # OLE2
            'rtf': [b'{\\rtf1'],
            'odt': [b'PK\x03\x04'],  # ZIP-based
            'epub': [b'PK\x03\x04'],  # ZIP-based
            
            # Imágenes
            'jpg': [b'\xff\xd8\xff'],
            'jpeg': [b'\xff\xd8\xff'],
            'png': [b'\x89PNG\r\n\x1a\n'],
            'gif': [b'GIF87a', b'GIF89a'],
            'webp': [b'RIFF'],  # Seguido de WEBP
            'tiff': [b'II*\x00', b'MM\x00*'],
            'tif': [b'II*\x00', b'MM\x00*'],
            'bmp': [b'BM'],
            'svg': [b'<?xml', b'<svg'],
            
            # Texto y datos
            'txt': [],  # Sin signature específica
            'html': [b'<!DOCTYPE', b'<html', b'<HTML'],
            'xml': [b'<?xml'],
            'json': [b'{', b'['],
            'csv': [],  # Sin signature específica
            'md': [],  # Sin signature específica
            'rst': [],  # Sin signature específica
            'tex': [b'\\documentclass', b'\\begin{document}'],
        }
        
        # Validaciones específicas para archivos ZIP-based
        self.zip_validations = {
            'docx': {
                'required_files': ['[Content_Types].xml', 'word/document.xml'],
                'content_type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            },
            'epub': {
                'required_files': ['META-INF/container.xml', 'mimetype'],
                'content_type': 'application/epub+zip'
            },
            'odt': {
                'required_files': ['META-INF/manifest.xml', 'content.xml'],
                'content_type': 'application/vnd.oasis.opendocument.text'
            }
        }

    def validate_file_comprehensive(self, file_path: str, declared_extension: str) -> Tuple[bool, str, Dict]:
        """Validación completa de archivo con múltiples verificaciones"""
        file_path = Path(file_path)
        
        if not file_path.exists():
            return False, "El archivo no existe", {}
        
        if file_path.stat().st_size == 0:
            return False, "El archivo está vacío", {}
        
        # Leer primeros bytes para signature
        try:
            with open(file_path, 'rb') as f:
                header = f.read(512)  # Leer primeros 512 bytes
        except Exception as e:
            return False, f"No se puede leer el archivo: {str(e)}", {}
        
        validation_results = {
            'file_size': file_path.stat().st_size,
            'declared_extension': declared_extension.lower(),
            'signature_valid': False,
            'extension_matches_content': False,
            'integrity_check': False,
            'additional_info': {}
        }
        
        # 1. Verificar signature/magic number
        signature_valid, detected_type = self._verify_signature(header, declared_extension)
        validation_results['signature_valid'] = signature_valid
        validation_results['detected_type'] = detected_type
        
        if not signature_valid:
            return False, f"El archivo no es un {declared_extension.upper()} válido. Detectado como: {detected_type}", validation_results
        
        # 2. Verificar consistencia extensión-contenido
        extension_matches = self._verify_extension_consistency(header, declared_extension)
        validation_results['extension_matches_content'] = extension_matches
        
        if not extension_matches:
            return False, f"La extensión .{declared_extension} no coincide con el contenido del archivo", validation_results
        
        # 3. Verificaciones específicas por tipo
        integrity_valid, integrity_message = self._verify_file_integrity(file_path, declared_extension)
        validation_results['integrity_check'] = integrity_valid
        validation_results['integrity_message'] = integrity_message
        
        if not integrity_valid:
            return False, integrity_message, validation_results
        
        # 4. Calcular checksum para integridad
        validation_results['md5_checksum'] = self._calculate_md5(file_path)
        
        return True, "Archivo válido y verificado", validation_results

    def _verify_signature(self, header: bytes, extension: str) -> Tuple[bool, str]:
        """Verifica signature/magic number del archivo"""
        extension = extension.lower()
        
        # Archivos sin signature específica (texto plano)
        if extension in ['txt', 'csv', 'md', 'rst']:
            # Verificar que sea texto válido
            try:
                header.decode('utf-8', errors='strict')
                return True, extension
            except UnicodeDecodeError:
                # Intentar otros encodings comunes
                for enc in ['latin-1', 'windows-1252', 'iso-8859-1']:
                    try:
                        header.decode(enc)
                        return True, f"{extension}_with_{enc}"
                    except UnicodeDecodeError:
                        continue
                return False, "binary_or_corrupted"
        
        # Verificar signatures específicas
        signatures = self.file_signatures.get(extension, [])
        
        for signature in signatures:
            if header.startswith(signature):
                # Verificaciones adicionales para algunos formatos
                if extension == 'webp':
                    # WEBP debe tener 'WEBP' después de 'RIFF'
                    if b'WEBP' in header[:20]:
                        return True, extension
                else:
                    return True, extension
        
        # Si no coincide, intentar detectar qué tipo es realmente
        detected_type = self._detect_actual_type(header)
        return False, detected_type

    def _detect_actual_type(self, header: bytes) -> str:
        """Detecta el tipo real del archivo basado en su header"""
        for file_type, signatures in self.file_signatures.items():
            for signature in signatures:
                if header.startswith(signature):
                    if file_type == 'webp' and b'WEBP' not in header[:20]:
                        continue
                    return file_type
        
        # Verificar si es texto
        try:
            header.decode('utf-8')
            return "text_file"
        except UnicodeDecodeError:
            return "unknown_binary"

    def _verify_extension_consistency(self, header: bytes, extension: str) -> bool:
        """Verifica que la extensión coincida con el contenido"""
        extension = extension.lower()
        
        # Para archivos ZIP-based, verificar que sea realmente ZIP
        if extension in ['docx', 'epub', 'odt']:
            return header.startswith(b'PK\x03\x04')
        
        # Para imágenes, verificar signature específica
        if extension in ['jpg', 'jpeg']:
            return header.startswith(b'\xff\xd8\xff')
        elif extension == 'png':
            return header.startswith(b'\x89PNG\r\n\x1a\n')
        elif extension == 'gif':
            return header.startswith(b'GIF87a') or header.startswith(b'GIF89a')
        elif extension == 'pdf':
            return header.startswith(b'%PDF')
        
        # Para archivos de texto, verificar que sea decodificable
        if extension in ['txt', 'html', 'csv', 'json', 'md', 'rst']:
            try:
                header.decode('utf-8', errors='strict')
                return True
            except UnicodeDecodeError:
                # Intentar otros encodings
                for enc in ['latin-1', 'windows-1252']:
                    try:
                        header.decode(enc)
                        return True
                    except UnicodeDecodeError:
                        continue
                return False
        
        return True  # Por defecto, asumir consistencia

    def _verify_file_integrity(self, file_path: Path, extension: str) -> Tuple[bool, str]:
        """Verifica integridad específica por tipo de archivo"""
        extension = extension.lower()
        
        try:
            # Verificaciones para archivos ZIP-based
            if extension in self.zip_validations:
                return self._verify_zip_integrity(file_path, extension)
            
            # Verificaciones para PDF
            elif extension == 'pdf':
                return self._verify_pdf_integrity(file_path)
            
            # Verificaciones para imágenes
            elif extension in ['jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff', 'bmp']:
                return self._verify_image_integrity(file_path)
            
            # Verificaciones para archivos de datos
            elif extension == 'csv':
                return self._verify_csv_integrity(file_path)
            
            elif extension == 'json':
                return self._verify_json_integrity(file_path)
            
            # Para otros archivos, verificación básica
            else:
                return True, "Verificación básica exitosa"
                
        except Exception as e:
            return False, f"Error en verificación de integridad: {str(e)}"

    def _verify_zip_integrity(self, file_path: Path, extension: str) -> Tuple[bool, str]:
        """Verifica integridad de archivos ZIP-based (DOCX, EPUB, ODT)"""
        try:
            with zipfile.ZipFile(file_path, 'r') as zf:
                # Verificar que el ZIP no esté corrupto
                bad_file = zf.testzip()
                if bad_file:
                    return False, f"Archivo ZIP corrupto: {bad_file}"
                
                # Verificar archivos requeridos específicos
                if extension in self.zip_validations:
                    required_files = self.zip_validations[extension]['required_files']
                    file_list = zf.namelist()
                    
                    for required_file in required_files:
                        if required_file not in file_list:
                            return False, f"Archivo {extension.upper()} incompleto: falta {required_file}"
                
                return True, f"Archivo {extension.upper()} válido"
                
        except zipfile.BadZipFile:
            return False, f"El archivo no es un ZIP válido (requerido para {extension.upper()})"
        except Exception as e:
            return False, f"Error verificando {extension.upper()}: {str(e)}"

    def _verify_pdf_integrity(self, file_path: Path) -> Tuple[bool, str]:
        """Verifica integridad de archivos PDF"""
        try:
            from pypdf import PdfReader
            
            with open(file_path, 'rb') as f:
                reader = PdfReader(f)
                
                # Verificar que tenga al menos una página
                if len(reader.pages) == 0:
                    return False, "El archivo PDF no contiene páginas"
                
                # Intentar leer la primera página
                first_page = reader.pages[0]
                text = first_page.extract_text()
                
                return True, f"PDF válido con {len(reader.pages)} páginas"
                
        except Exception as e:
            return False, f"PDF corrupto o inválido: {str(e)}"

    def _verify_image_integrity(self, file_path: Path) -> Tuple[bool, str]:
        """Verifica integridad de archivos de imagen"""
        try:
            from PIL import Image
            
            with Image.open(file_path) as img:
                # Verificar que la imagen se puede cargar
                img.verify()
                
                # Reabrir para obtener información (verify() cierra la imagen)
                with Image.open(file_path) as img2:
                    width, height = img2.size
                    mode = img2.mode
                    
                    if width == 0 or height == 0:
                        return False, "Imagen con dimensiones inválidas"
                    
                    return True, f"Imagen válida: {width}x{height}, modo {mode}"
                    
        except Exception as e:
            return False, f"Imagen corrupta o inválida: {str(e)}"

    def _verify_csv_integrity(self, file_path: Path) -> Tuple[bool, str]:
        """Verifica integridad de archivos CSV"""
        try:
            import csv
            
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                # Leer muestra para detectar delimitador
                sample = f.read(1024)
                f.seek(0)
                
                sniffer = csv.Sniffer()
                delimiter = sniffer.sniff(sample).delimiter
                
                # Leer primeras filas para verificar consistencia
                reader = csv.reader(f, delimiter=delimiter)
                rows = []
                for i, row in enumerate(reader):
                    rows.append(row)
                    if i >= 10:  # Solo primeras 10 filas
                        break
                
                if not rows:
                    return False, "Archivo CSV vacío"
                
                # Verificar consistencia de columnas
                if len(rows) > 1:
                    first_row_cols = len(rows[0])
                    inconsistent_rows = []
                    
                    for i, row in enumerate(rows[1:], 1):
                        if len(row) != first_row_cols:
                            inconsistent_rows.append(i + 1)
                    
                    if inconsistent_rows and len(inconsistent_rows) > len(rows) * 0.3:
                        return False, f"CSV con estructura inconsistente en filas: {inconsistent_rows[:5]}"
                
                return True, f"CSV válido: {len(rows)} filas, {len(rows[0])} columnas, delimitador '{delimiter}'"
                
        except Exception as e:
            return False, f"CSV inválido: {str(e)}"

    def _verify_json_integrity(self, file_path: Path) -> Tuple[bool, str]:
        """Verifica integridad de archivos JSON"""
        try:
            import json
            
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Verificar que se pudo parsear
            data_type = type(data).__name__
            
            if isinstance(data, dict):
                return True, f"JSON válido: objeto con {len(data)} propiedades"
            elif isinstance(data, list):
                return True, f"JSON válido: array con {len(data)} elementos"
            else:
                return True, f"JSON válido: tipo {data_type}"
                
        except json.JSONDecodeError as e:
            return False, f"JSON inválido: {str(e)}"
        except Exception as e:
            return False, f"Error leyendo JSON: {str(e)}"

    def _calculate_md5(self, file_path: Path) -> str:
        """Calcula checksum MD5 del archivo"""
        hash_md5 = hashlib.md5()
        try:
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception:
            return "error_calculating_checksum"

    def get_file_analysis(self, file_path: str, declared_extension: str) -> Dict:
        """Análisis completo del archivo con recomendaciones"""
        is_valid, message, details = self.validate_file_comprehensive(file_path, declared_extension)
        
        analysis = {
            'is_valid': is_valid,
            'validation_message': message,
            'details': details,
            'recommendations': [],
            'risk_level': 'low'
        }
        
        # Generar recomendaciones basadas en validación
        if not is_valid:
            analysis['risk_level'] = 'high'
            analysis['recommendations'].extend([
                'Verificar que el archivo no esté corrupto',
                'Intentar con una copia nueva del archivo original',
                'Verificar que la extensión del archivo sea correcta'
            ])
        
        # Recomendaciones específicas por tipo
        if declared_extension.lower() == 'csv' and is_valid:
            analysis['recommendations'].append('Se detectó estructura CSV válida')
        
        if declared_extension.lower() in ['docx', 'epub', 'odt'] and is_valid:
            analysis['recommendations'].append('Archivo ZIP-based verificado correctamente')
        
        # Advertencias por tamaño
        file_size_mb = details.get('file_size', 0) / (1024 * 1024)
        if file_size_mb > 50:
            analysis['risk_level'] = 'medium'
            analysis['recommendations'].append(f'Archivo grande ({file_size_mb:.1f}MB): conversión puede tomar tiempo')
        
        return analysis

# Instancia global del validador
file_validator = FileValidator()
