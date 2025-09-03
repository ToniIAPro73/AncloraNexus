import pytest
import tempfile
import os
from pathlib import Path
from docx import Document

# Add backend src to Python path
import sys
backend_src = Path(__file__).parent.parent.parent / 'src'
sys.path.insert(0, str(backend_src))

from src.models.conversions.txt_to_docx import convert


class TestTxtToDocxConverter:
    """Tests para el conversor TXT→DOCX"""
    
    def test_convert_txt_to_docx_basic(self):
        """Test básico de conversión TXT→DOCX"""
        input_path = None
        output_path = None
        
        try:
            # Crear archivos temporales
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as input_file:
                input_path = input_file.name
                input_file.write("Título del Documento\n\nEste es el primer párrafo.\n\nEste es el segundo párrafo con caracteres especiales: ñáéíóú")
            
            with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as output_file:
                output_path = output_file.name
            
            # Convertir
            success, message = convert(input_path, output_path)
            
            # Verificar resultado
            assert success is True
            assert "exitosa" in message
            assert os.path.exists(output_path)
            assert os.path.getsize(output_path) > 0
            
            # Verificar contenido del DOCX generado
            doc = Document(output_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            
            # Debe tener al menos el título y los párrafos
            assert len(paragraphs) >= 3
            assert "Título del Documento" in paragraphs[0]  # Título como heading
            assert "primer párrafo" in str(paragraphs)
            assert "segundo párrafo" in str(paragraphs)
            
        finally:
            # Cleanup seguro
            if input_path and os.path.exists(input_path):
                try:
                    os.unlink(input_path)
                except PermissionError:
                    pass
            if output_path and os.path.exists(output_path):
                try:
                    os.unlink(output_path)
                except PermissionError:
                    pass
    
    def test_convert_empty_txt(self):
        """Test conversión de archivo TXT vacío"""
        input_path = None
        output_path = None
        
        try:
            # Crear archivo TXT vacío
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as input_file:
                input_path = input_file.name
                input_file.write("")
            
            with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as output_file:
                output_path = output_file.name
            
            # Convertir
            success, message = convert(input_path, output_path)
            
            # Debe funcionar incluso con archivo vacío
            assert success is True
            assert os.path.exists(output_path)
            
        finally:
            if input_path and os.path.exists(input_path):
                try:
                    os.unlink(input_path)
                except PermissionError:
                    pass
            if output_path and os.path.exists(output_path):
                try:
                    os.unlink(output_path)
                except PermissionError:
                    pass
    
    def test_convert_with_invalid_input(self):
        """Test conversión con archivo de entrada inválido"""
        output_path = None
        
        try:
            with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as output_file:
                output_path = output_file.name
            
            # Intentar convertir archivo inexistente
            success, message = convert("archivo_inexistente.txt", output_path)
            
            # Debe fallar
            assert success is False
            assert "Error" in message
            
        finally:
            if output_path and os.path.exists(output_path):
                try:
                    os.unlink(output_path)
                except PermissionError:
                    pass
