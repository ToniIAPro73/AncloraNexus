"""
Módulo de conversiones de Anclora Nexus
Carga automática de todos los plugins de conversión
"""

# Importar TODAS las conversiones para asegurar que se carguen
try:
    # Conversiones de imágenes
    from . import jpg_to_png
    from . import png_to_jpg
    from . import jpg_to_gif
    from . import jpg_to_pdf
    from . import png_to_gif
    from . import png_to_pdf
    from . import png_to_docx  # ✅ NUEVO: PNG→DOCX
    from . import png_to_webp
    from . import gif_to_jpg
    from . import gif_to_png
    from . import gif_to_pdf
    from . import gif_to_mp4
    from . import webp_to_jpg
    from . import tiff_to_jpg
    from . import svg_to_png
    from . import pdf_to_jpg
    from . import pdf_to_png
    from . import pdf_to_gif

    # Conversiones de documentos
    from . import txt_to_pdf
    from . import txt_to_docx
    from . import txt_to_html
    from . import txt_to_doc
    from . import txt_to_markdown
    from . import txt_to_md
    from . import txt_to_odt
    from . import txt_to_rtf
    from . import txt_to_tex
    from . import doc_to_pdf
    from . import doc_to_html
    from . import doc_to_txt
    from . import docx_to_pdf
    from . import docx_to_html
    from . import docx_to_txt
    from . import html_to_pdf
    from . import html_to_txt
    from . import html_to_md
    from . import md_to_html
    from . import md_to_pdf
    from . import md_to_docx
    from . import md_to_txt
    from . import pdf_to_txt
    from . import rtf_to_docx
    from . import odt_to_pdf

    # Conversiones de datos
    from . import csv_to_html
    from . import csv_to_pdf
    from . import json_to_html
    from . import epub_to_html

    # Motor Pandoc
    from . import pandoc_engine

    print("✅ Todos los módulos de conversión cargados correctamente")

except ImportError as e:
    print(f"⚠️  Warning: No se pudieron cargar algunas conversiones: {e}")

__all__ = [
    # Conversiones de imágenes
    'jpg_to_png', 'png_to_jpg', 'jpg_to_gif', 'jpg_to_pdf',
    'png_to_gif', 'png_to_pdf', 'png_to_webp', 'gif_to_jpg',
    'gif_to_png', 'gif_to_pdf', 'gif_to_mp4', 'webp_to_jpg',
    'tiff_to_jpg', 'svg_to_png', 'pdf_to_jpg', 'pdf_to_png', 'pdf_to_gif',

    # Conversiones de documentos
    'txt_to_pdf', 'txt_to_docx', 'txt_to_html', 'txt_to_doc',
    'txt_to_markdown', 'txt_to_md', 'txt_to_odt', 'txt_to_rtf', 'txt_to_tex',
    'doc_to_pdf', 'doc_to_html', 'doc_to_txt', 'docx_to_pdf',
    'docx_to_html', 'docx_to_txt', 'html_to_pdf', 'html_to_txt',
    'html_to_md', 'md_to_html', 'md_to_pdf', 'md_to_docx', 'md_to_txt',
    'pdf_to_txt', 'rtf_to_docx', 'odt_to_pdf',

    # Conversiones de datos
    'csv_to_html', 'csv_to_pdf', 'json_to_html', 'epub_to_html',

    # Motor Pandoc
    'pandoc_engine'
]