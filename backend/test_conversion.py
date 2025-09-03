#!/usr/bin/env python3
"""Test script para probar conversiones MD→*"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.models.conversions.md_to_pdf import convert as md_to_pdf
from src.models.conversions.md_to_docx import convert as md_to_docx
from src.models.conversions.md_to_txt import convert as md_to_txt

def test_all_md_conversions():
    """Prueba todas las conversiones MD→*"""
    input_file = 'test_md_conversion.md'

    conversions = [
        ('PDF', md_to_pdf, 'test_output.pdf'),
        ('DOCX', md_to_docx, 'test_output.docx'),
        ('TXT', md_to_txt, 'test_output.txt')
    ]

    print("🚀 Probando conversiones MD→* con caracteres Unicode")
    print("=" * 60)

    for format_name, converter, output_file in conversions:
        print(f"\n🔄 Probando MD→{format_name}: {input_file} → {output_file}")

        try:
            success, message = converter(input_file, output_file)

            if success:
                print(f"✅ {format_name}: {message}")
                if os.path.exists(output_file):
                    size = os.path.getsize(output_file)
                    print(f"📄 Archivo generado: {size} bytes")

                    # Verificación específica por formato
                    if format_name == 'PDF':
                        try:
                            from pypdf import PdfReader
                            with open(output_file, 'rb') as f:
                                reader = PdfReader(f)
                                pages = len(reader.pages)
                                print(f"📖 PDF válido con {pages} páginas")
                        except Exception as e:
                            print(f"⚠️ Error verificando PDF: {e}")

                    elif format_name == 'DOCX':
                        try:
                            from docx import Document
                            doc = Document(output_file)
                            paragraphs = len(doc.paragraphs)
                            print(f"📄 DOCX válido con {paragraphs} párrafos")
                        except Exception as e:
                            print(f"⚠️ Error verificando DOCX: {e}")

                    elif format_name == 'TXT':
                        try:
                            with open(output_file, 'r', encoding='utf-8') as f:
                                content = f.read()
                                lines = len(content.split('\n'))
                                print(f"📝 TXT válido con {lines} líneas")
                        except Exception as e:
                            print(f"⚠️ Error verificando TXT: {e}")
                else:
                    print(f"❌ Archivo {format_name} no se generó")
            else:
                print(f"❌ {format_name}: {message}")

        except Exception as e:
            print(f"💥 Error inesperado en {format_name}: {e}")

    print("\n" + "=" * 60)
    print("🏁 Pruebas completadas")

if __name__ == "__main__":
    test_all_md_conversions()
