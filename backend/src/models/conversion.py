import os
import importlib
import pkgutil
from pathlib import Path


class ConversionEngine:
    """Motor de conversión de Anclora Metaform"""

    def __init__(self):
        self.name = 'Anclora Metaform Conversion Engine'
        self.version = '1.0.0'

        # Conversiones soportadas y sus costos en créditos
        self.supported_conversions = {
            'txt': {
                'html': 1,
                'pdf': 1,
                'doc': 2,
                'docx': 2,
                'md': 1,
                'rtf': 1,
                'odt': 2,
                'tex': 3
            },
            'pdf': {
                'jpg': 3,
                'png': 3,
                'gif': 3,
                'txt': 4
            },
            'jpg': {
                'png': 1,
                'pdf': 3,
                'gif': 2
            },
            'png': {
                'jpg': 1,
                'pdf': 3,
                'gif': 2,
                'webp': 2
            },
            'gif': {
                'jpg': 1,
                'png': 1,
                'pdf': 3,
                'mp4': 4
            },
            'svg': {
                'png': 2
            },
            'doc': {
                'pdf': 4,
                'txt': 3,
                'html': 4
            },
            'docx': {
                'pdf': 4,
                'txt': 3,
                'html': 4
            }
        }

        # Registro dinámico de plugins
        self.conversion_methods = {}
        self.load_plugins()

    def load_plugins(self):
        """Carga todos los plugins de conversión disponibles."""
        package = importlib.import_module('src.models.conversions')
        package_path = Path(package.__file__).parent
        for _, name, _ in pkgutil.iter_modules([str(package_path)]):
            module = importlib.import_module(f'{package.__name__}.{name}')
            conv = getattr(module, 'CONVERSION', None)
            func = getattr(module, 'convert', None)
            if conv and func:
                self.conversion_methods[tuple(map(str.lower, conv))] = func

    def get_supported_formats(self, source_format):
        """Obtiene los formatos de destino soportados para un formato origen"""
        return list(self.supported_conversions.get(source_format.lower(), {}).keys())

    def get_conversion_cost(self, source_format, target_format):
        """Calcula el costo en créditos de una conversión"""
        source = source_format.lower().replace('.', '')
        target = target_format.lower().replace('.', '')
        return self.supported_conversions.get(source, {}).get(target, 2)

    def validate_file(self, file_path, max_size_mb=100):
        """Valida un archivo antes de la conversión"""
        if not os.path.exists(file_path):
            return False, "El archivo no existe"
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            return False, "El archivo está vacío"
        if file_size > max_size_mb * 1024 * 1024:
            return False, f"El archivo es demasiado grande (máximo {max_size_mb}MB)"
        return True, "Archivo válido"

    def analyze_file(self, file_path, filename):
        """Analiza un archivo y genera recomendaciones"""
        file_extension = filename.split('.')[-1].lower()
        file_size = os.path.getsize(file_path)
        analysis = {
            'filename': filename,
            'extension': file_extension,
            'size': file_size,
            'supported_formats': self.get_supported_formats(file_extension),
            'recommendations': []
        }
        if file_extension == 'txt':
            analysis['recommendations'] = [
                'Para documentos formales, recomendamos PDF',
                'Para web, HTML es la mejor opción',
                'Para desarrolladores, Markdown es ideal'
            ]
        elif file_extension == 'pdf':
            analysis['recommendations'] = [
                'Para edición, convierte a DOC',
                'Para imágenes, JPG o PNG son ideales'
            ]
        elif file_extension in ['jpg', 'png']:
            analysis['recommendations'] = [
                'Para documentos, PDF mantiene la calidad',
                'Para web, considera optimización de tamaño'
            ]
        return analysis

    def convert_file(self, input_path, output_path, source_format, target_format):
        """Realiza la conversión de archivo"""
        try:
            source = source_format.lower()
            target = target_format.lower()
            method = self.conversion_methods.get((source, target))
            if method:
                return method(input_path, output_path)
            return False, f"Conversión {source_format} → {target_format} no implementada aún"
        except Exception as e:
            return False, f"Error durante la conversión: {str(e)}"

    def convert_batch(self, tasks):
        """Procesa un lote de conversiones."""
        results = []
        for task in tasks:
            success, message = self.convert_file(
                task['input_path'],
                task['output_path'],
                task.get('source_format') or task['input_path'].split('.')[-1],
                task['target_format']
            )
            results.append({
                'input_path': task['input_path'],
                'output_path': task['output_path'],
                'success': success,
                'message': message
            })
        return results


conversion_engine = ConversionEngine()
