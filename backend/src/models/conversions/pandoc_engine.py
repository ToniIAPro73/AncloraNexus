"""
Motor de conversión Pandoc para Anclora Nexus
Proporciona soporte para formatos avanzados usando pypandoc
"""
import os
import tempfile
import subprocess
from pathlib import Path

# Verificar si pypandoc está disponible
try:
    import pypandoc
    PANDOC_AVAILABLE = True
except ImportError:
    PANDOC_AVAILABLE = False

class PandocEngine:
    """Motor de conversión usando Pandoc para formatos avanzados"""
    
    def __init__(self):
        self.supported_formats = {
            # Formatos de entrada que Pandoc puede leer
            'input': {
                'md', 'markdown', 'rst', 'tex', 'latex', 'html', 'docx', 
                'odt', 'epub', 'org', 'textile', 'mediawiki', 'twiki',
                'opml', 'rtf', 'json', 'csv'
            },
            # Formatos de salida que Pandoc puede generar
            'output': {
                'html', 'html5', 'latex', 'tex', 'pdf', 'docx', 'odt',
                'epub', 'epub3', 'fb2', 'rtf', 'org', 'textile', 
                'mediawiki', 'rst', 'asciidoc', 'man', 'json', 'plain'
            }
        }
        
        # Mapeo de extensiones a formatos Pandoc
        self.extension_mapping = {
            'md': 'markdown',
            'rst': 'rst',
            'tex': 'latex',
            'html': 'html',
            'htm': 'html',
            'docx': 'docx',
            'odt': 'odt',
            'epub': 'epub',
            'rtf': 'rtf',
            'txt': 'plain',
            'json': 'json',
            'csv': 'csv'
        }
    
    def is_supported_conversion(self, source_ext, target_ext):
        """Verifica si una conversión es soportada por Pandoc"""
        if not PANDOC_AVAILABLE:
            return False
        
        source_format = self.extension_mapping.get(source_ext.lower())
        target_format = self.extension_mapping.get(target_ext.lower())
        
        return (source_format in self.supported_formats['input'] and 
                target_format in self.supported_formats['output'])
    
    def convert_with_pandoc(self, input_path, output_path, source_ext, target_ext, 
                           extra_args=None, filters=None):
        """Realiza conversión usando Pandoc"""
        try:
            if not PANDOC_AVAILABLE:
                return False, "Pandoc no está disponible en el sistema"
            
            # Mapear extensiones a formatos Pandoc
            source_format = self.extension_mapping.get(source_ext.lower(), source_ext.lower())
            target_format = self.extension_mapping.get(target_ext.lower(), target_ext.lower())
            
            # Configurar argumentos adicionales
            pandoc_args = []
            if extra_args:
                pandoc_args.extend(extra_args)
            
            # Configurar filtros si se proporcionan
            if filters:
                for filter_name in filters:
                    pandoc_args.extend(['--filter', filter_name])
            
            # Configuraciones específicas por formato
            if target_format == 'pdf':
                pandoc_args.extend([
                    '--pdf-engine=xelatex',  # Mejor soporte Unicode
                    '--variable', 'geometry:margin=1in'
                ])
            elif target_format == 'epub':
                pandoc_args.extend([
                    '--epub-cover-image=default_cover.png',
                    '--epub-metadata=metadata.xml'
                ])
            elif target_format == 'docx':
                pandoc_args.extend([
                    '--reference-doc=reference.docx'  # Si existe
                ])
            
            # Realizar conversión
            pypandoc.convert_file(
                input_path,
                target_format,
                outputfile=output_path,
                format=source_format,
                extra_args=pandoc_args
            )
            
            # Verificar que el archivo se creó correctamente
            if not os.path.exists(output_path):
                return False, "Error: No se pudo generar el archivo de salida"
            
            if os.path.getsize(output_path) == 0:
                return False, "Error: El archivo generado está vacío"
            
            return True, f"Conversión {source_ext}→{target_ext} exitosa con Pandoc"
            
        except Exception as e:
            return False, f"Error en conversión Pandoc {source_ext}→{target_ext}: {str(e)}"
    
    def get_pandoc_version(self):
        """Obtiene la versión de Pandoc instalada"""
        try:
            if PANDOC_AVAILABLE:
                return pypandoc.get_pandoc_version()
            else:
                return None
        except:
            return None
    
    def install_pandoc(self):
        """Instala Pandoc automáticamente si no está disponible"""
        try:
            if not PANDOC_AVAILABLE:
                pypandoc.download_pandoc()
                return True, "Pandoc instalado exitosamente"
            else:
                return True, "Pandoc ya está disponible"
        except Exception as e:
            return False, f"Error instalando Pandoc: {str(e)}"

# Instancia global del motor Pandoc
pandoc_engine = PandocEngine()

def create_pandoc_conversion(source_ext, target_ext, extra_args=None, filters=None):
    """Factory function para crear conversiones Pandoc dinámicamente"""
    
    def convert(input_path, output_path):
        return pandoc_engine.convert_with_pandoc(
            input_path, output_path, source_ext, target_ext, extra_args, filters
        )
    
    return convert

# Conversiones Pandoc predefinidas para formatos prioritarios
PANDOC_CONVERSIONS = {
    # Documentos avanzados
    ('rtf', 'docx'): create_pandoc_conversion('rtf', 'docx'),
    ('rtf', 'html'): create_pandoc_conversion('rtf', 'html'),
    ('rtf', 'pdf'): create_pandoc_conversion('rtf', 'pdf'),
    ('odt', 'docx'): create_pandoc_conversion('odt', 'docx'),
    ('odt', 'html'): create_pandoc_conversion('odt', 'html'),
    ('odt', 'pdf'): create_pandoc_conversion('odt', 'pdf'),
    
    # E-books
    ('epub', 'html'): create_pandoc_conversion('epub', 'html'),
    ('epub', 'pdf'): create_pandoc_conversion('epub', 'pdf'),
    ('epub', 'docx'): create_pandoc_conversion('epub', 'docx'),
    
    # Formatos técnicos
    ('rst', 'html'): create_pandoc_conversion('rst', 'html'),
    ('rst', 'pdf'): create_pandoc_conversion('rst', 'pdf'),
    ('tex', 'html'): create_pandoc_conversion('tex', 'html'),
    ('tex', 'pdf'): create_pandoc_conversion('tex', 'pdf'),
    
    # Datos estructurados
    ('json', 'html'): create_pandoc_conversion('json', 'html'),
    ('csv', 'html'): create_pandoc_conversion('csv', 'html'),
}
