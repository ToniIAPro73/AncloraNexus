"""
Motor de Conversión Mejorado para Anclora Nexus
Integra Pandoc, sistema de créditos avanzado y formatos expandidos
"""
import os
import importlib
import pkgutil
import tempfile
from collections import deque
from pathlib import Path

from src.ws import emit_progress, Phase
from src.encoding_normalizer import normalize_to_utf8
from src.models.user import Conversion, CreditTransaction

# Importar sistema de créditos
try:
    from src.services.credit_system import credit_calculator
    CREDIT_SYSTEM_AVAILABLE = True
except ImportError:
    CREDIT_SYSTEM_AVAILABLE = False

# Importar motor Pandoc
try:
    from src.models.conversions.pandoc_engine import pandoc_engine
    PANDOC_AVAILABLE = True
except ImportError:
    PANDOC_AVAILABLE = False

TEXT_EXTENSIONS = {
    'txt', 'md', 'html', 'rtf', 'odt', 'doc', 'docx', 'tex', 'rst', 'epub', 'json', 'csv'
}

class EnhancedConversionEngine:
    """Motor de conversión mejorado con Pandoc y sistema de créditos"""

    def __init__(self):
        self.name = 'Anclora Nexus Enhanced Conversion Engine'
        self.version = '2.0.0'

        # Conversiones soportadas expandidas con costos en créditos
        self.supported_conversions = {
            'txt': {
                'html': 1, 'pdf': 1, 'doc': 2, 'docx': 2, 'md': 1,
                'rtf': 1, 'odt': 2, 'tex': 3, 'epub': 4, 'json': 2
            },
            'md': {
                'html': 1, 'pdf': 2, 'txt': 1, 'docx': 3, 'epub': 4,
                'rtf': 2, 'odt': 3, 'tex': 3, 'json': 2
            },
            'html': {
                'pdf': 2, 'txt': 1, 'md': 1, 'docx': 3, 'epub': 4,
                'rtf': 2, 'odt': 3, 'json': 2
            },
            'rtf': {
                'docx': 2, 'html': 2, 'pdf': 3, 'txt': 1, 'md': 2,
                'odt': 3, 'epub': 4
            },
            'odt': {
                'docx': 3, 'html': 3, 'pdf': 4, 'txt': 2, 'md': 2,
                'rtf': 2, 'epub': 5
            },
            'epub': {
                'html': 3, 'pdf': 4, 'txt': 2, 'md': 2, 'docx': 4,
                'rtf': 3, 'odt': 4
            },
            'csv': {
                'html': 2, 'json': 1, 'xlsx': 3, 'pdf': 3, 'txt': 1
            },
            'json': {
                'html': 2, 'csv': 1, 'txt': 1, 'pdf': 3, 'xlsx': 3
            },
            'pdf': {
                'jpg': 3, 'png': 3, 'gif': 3, 'txt': 4
            },
            'jpg': {
                'png': 1, 'pdf': 3, 'gif': 2, 'webp': 2
            },
            'png': {
                'jpg': 1, 'pdf': 3, 'gif': 2, 'webp': 2, 'tiff': 2
            },
            'gif': {
                'jpg': 1, 'png': 1, 'pdf': 3, 'mp4': 4
            },
            'webp': {
                'jpg': 1, 'png': 1, 'pdf': 3, 'gif': 2
            },
            'tiff': {
                'jpg': 2, 'png': 2, 'pdf': 3, 'gif': 2
            },
            'svg': {
                'png': 2, 'jpg': 2, 'pdf': 3
            },
            'doc': {
                'pdf': 4, 'txt': 3, 'html': 4, 'docx': 2
            },
            'docx': {
                'pdf': 4, 'txt': 3, 'html': 4, 'rtf': 2, 'odt': 3
            }
        }

        # Registro dinámico de plugins
        self.conversion_methods = {}
        self.load_plugins()

        # Integración con servicios de IA
        self.ai_enabled = True
        self.quality_threshold = 0.8
        self.enable_intelligent_sequences = True

    def load_plugins(self):
        """Carga todos los plugins de conversión disponibles incluyendo Pandoc"""
        # Cargar plugins tradicionales
        package = importlib.import_module('src.models.conversions')
        package_path = Path(package.__file__).parent
        for _, name, _ in pkgutil.iter_modules([str(package_path)]):
            if name == 'pandoc_engine':  # Saltar el motor Pandoc
                continue
            try:
                module = importlib.import_module(f'{package.__name__}.{name}')
                conv = getattr(module, 'CONVERSION', None)
                func = getattr(module, 'convert', None)
                if conv and func:
                    self.conversion_methods[tuple(map(str.lower, conv))] = func
            except Exception as e:
                print(f"Error cargando plugin {name}: {e}")

        # Cargar conversiones Pandoc si está disponible
        if PANDOC_AVAILABLE:
            self.load_pandoc_conversions()

    def load_pandoc_conversions(self):
        """Carga conversiones Pandoc dinámicamente"""
        try:
            from src.models.conversions.pandoc_engine import PANDOC_CONVERSIONS
            for conversion_tuple, convert_func in PANDOC_CONVERSIONS.items():
                # Solo agregar si no existe una conversión nativa
                if conversion_tuple not in self.conversion_methods:
                    self.conversion_methods[conversion_tuple] = convert_func
        except Exception as e:
            print(f"Error cargando conversiones Pandoc: {e}")

    def get_conversion_cost_advanced(self, source_format, target_format, file_size=0, quality='standard'):
        """Calcula costo usando el sistema de créditos avanzado"""
        if CREDIT_SYSTEM_AVAILABLE:
            credits, details = credit_calculator.calculate_credits(
                source_format, target_format, file_size, quality
            )
            return credits, details
        else:
            # Fallback al sistema básico
            return self.get_conversion_cost(source_format, target_format), {}

    def get_conversion_estimate_full(self, source_format, target_format, file_size=0, quality='standard'):
        """Proporciona estimación completa con recomendaciones"""
        if CREDIT_SYSTEM_AVAILABLE:
            return credit_calculator.get_conversion_estimate(
                source_format, target_format, file_size, quality
            )
        else:
            # Estimación básica
            cost = self.get_conversion_cost(source_format, target_format)
            return {
                'credits_required': cost,
                'estimated_time_seconds': 5,
                'calculation_details': {'base_credits': cost},
                'recommendations': []
            }

    def get_supported_formats(self, source_format):
        """Obtiene formatos soportados incluyendo Pandoc"""
        base_formats = list(self.supported_conversions.get(source_format.lower(), {}).keys())
        
        # Agregar formatos Pandoc si está disponible
        if PANDOC_AVAILABLE:
            pandoc_formats = []
            for (src, tgt) in self.conversion_methods.keys():
                if src == source_format.lower():
                    pandoc_formats.append(tgt)
            
            # Combinar y eliminar duplicados
            all_formats = list(set(base_formats + pandoc_formats))
            return sorted(all_formats)
        
        return base_formats

    def get_conversion_cost(self, source_format, target_format):
        """Calcula el costo en créditos de una conversión (método original)"""
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
        """Analiza un archivo y genera recomendaciones mejoradas"""
        file_extension = filename.split('.')[-1].lower()
        file_size = os.path.getsize(file_path)
        
        # Obtener formatos soportados (incluyendo Pandoc)
        supported_formats = self.get_supported_formats(file_extension)
        
        analysis = {
            'filename': filename,
            'extension': file_extension,
            'size': file_size,
            'supported_formats': supported_formats,
            'recommendations': [],
            'credit_estimates': {}
        }
        
        # Generar estimaciones de créditos para formatos populares
        popular_targets = ['pdf', 'html', 'docx', 'txt']
        for target in popular_targets:
            if target in supported_formats:
                if CREDIT_SYSTEM_AVAILABLE:
                    estimate = credit_calculator.get_conversion_estimate(
                        file_extension, target, file_size
                    )
                    analysis['credit_estimates'][target] = estimate
                else:
                    cost = self.get_conversion_cost(file_extension, target)
                    analysis['credit_estimates'][target] = {'credits_required': cost}
        
        # Recomendaciones inteligentes basadas en tipo de archivo
        analysis['recommendations'] = self._generate_smart_recommendations(
            file_extension, file_size, supported_formats
        )
        
        return analysis

    def _generate_smart_recommendations(self, extension, file_size, supported_formats):
        """Genera recomendaciones inteligentes basadas en contexto"""
        recommendations = []
        
        if extension == 'txt':
            recommendations.extend([
                'Para documentos formales → PDF (preserva formato)',
                'Para web → HTML (mejor visualización)',
                'Para colaboración → DOCX (editable)'
            ])
        elif extension == 'md':
            recommendations.extend([
                'Para publicación web → HTML (renderizado completo)',
                'Para documentos → PDF (formato final)',
                'Para e-books → EPUB (lectura digital)'
            ])
        elif extension == 'csv':
            recommendations.extend([
                'Para visualización → HTML (tabla interactiva)',
                'Para análisis → JSON (estructura de datos)',
                'Para reportes → PDF (presentación formal)'
            ])
        elif extension in ['jpg', 'png']:
            recommendations.extend([
                'Para documentos → PDF (integración)',
                'Para web → WEBP (optimización)',
                'Para impresión → TIFF (alta calidad)'
            ])
        elif extension == 'epub':
            recommendations.extend([
                'Para lectura web → HTML (navegador)',
                'Para impresión → PDF (formato físico)',
                'Para edición → DOCX (modificable)'
            ])
        
        # Recomendaciones basadas en tamaño
        if file_size > 50 * 1024 * 1024:  # > 50MB
            recommendations.append('⚠️ Archivo grande: considera calidad estándar para menor costo')
        
        return recommendations

# Instancia mejorada del motor de conversión
enhanced_conversion_engine = EnhancedConversionEngine()
