"""
Módulo de conversiones de Anclora Nexus
Carga automática de todos los plugins de conversión
"""

# Importar nuevas conversiones para asegurar que se carguen
try:
    from . import rtf_to_docx
    from . import epub_to_html
    from . import csv_to_html
    from . import json_to_html
    from . import webp_to_jpg
    from . import tiff_to_jpg
    from . import odt_to_pdf
    from . import pandoc_engine
except ImportError as e:
    print(f"Warning: No se pudieron cargar algunas conversiones nuevas: {e}")

__all__ = [
    'rtf_to_docx', 'epub_to_html', 'csv_to_html', 'json_to_html',
    'webp_to_jpg', 'tiff_to_jpg', 'odt_to_pdf', 'pandoc_engine'
]