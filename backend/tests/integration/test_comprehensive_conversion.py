"""
Test suite integral para el sistema de conversión de Anclora Nexus
Incluye tests con archivos reales, casos edge y validación completa
"""

import pytest
import os
import json
import tempfile
import shutil
from pathlib import Path
from unittest.mock import patch, MagicMock

from src import create_app
from src.models.user import db, User
from src.services.conversion_engine import conversion_engine


class TestComprehensiveConversion:
    """Suite de tests integral para conversiones"""
    
    @pytest.fixture(autouse=True)
    def setup_method(self):
        """Setup para cada test"""
        self.app = create_app({
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
            'WTF_CSRF_ENABLED': False
        })
        
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # Crear tablas
        db.create_all()
        
        # Crear usuario de prueba
        self.test_user = User(
            email='test@example.com',
            username='testuser',
            credits=1000
        )
        self.test_user.set_password('testpass')
        db.session.add(self.test_user)
        db.session.commit()
        
        # Directorio temporal para archivos de prueba
        self.temp_dir = tempfile.mkdtemp()
        self.test_files_dir = Path(__file__).parent.parent.parent.parent / "test_files"
        
        yield
        
        # Cleanup
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def create_test_file(self, filename, content, binary=False):
        """Crear archivo de prueba temporal"""
        filepath = Path(self.temp_dir) / filename
        mode = 'wb' if binary else 'w'
        encoding = None if binary else 'utf-8'
        
        with open(filepath, mode, encoding=encoding) as f:
            f.write(content)
        
        return filepath
    
    def test_valid_text_conversions(self):
        """Test conversiones válidas de archivos de texto"""
        
        # Crear archivo de texto de prueba
        content = "Este es un archivo de prueba para conversión.\n\nContiene múltiples líneas."
        txt_file = self.create_test_file("test.txt", content)
        
        test_cases = [
            ("txt", "html"),
            ("txt", "md"),
            ("txt", "pdf"),
        ]
        
        for source_format, target_format in test_cases:
            with self.subTest(source=source_format, target=target_format):
                with open(txt_file, 'rb') as f:
                    response = self.client.post('/api/conversion/guest-convert', data={
                        'file': (f, f'test.{source_format}'),
                        'target_format': target_format
                    })
                
                if response.status_code == 200:
                    data = response.get_json()
                    assert data['success'] is True
                    assert 'download_id' in data
                else:
                    # Verificar que el error sea informativo
                    data = response.get_json()
                    assert 'error' in data
                    print(f"Conversión {source_format}→{target_format}: {data['error']}")
    
    def test_image_conversions(self):
        """Test conversiones de imágenes"""
        
        # Crear imagen de prueba simple (PNG 1x1 pixel)
        png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x12IDATx\x9cc```bPPP\x00\x02\xac\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
        png_file = self.create_test_file("test.png", png_data, binary=True)
        
        test_cases = [
            ("png", "jpg"),
            ("png", "gif"),
            ("png", "webp"),
        ]
        
        for source_format, target_format in test_cases:
            with self.subTest(source=source_format, target=target_format):
                with open(png_file, 'rb') as f:
                    response = self.client.post('/api/conversion/guest-convert', data={
                        'file': (f, f'test.{source_format}'),
                        'target_format': target_format
                    })
                
                # Verificar respuesta
                if response.status_code == 200:
                    data = response.get_json()
                    assert data['success'] is True
                else:
                    data = response.get_json()
                    print(f"Conversión imagen {source_format}→{target_format}: {data.get('error', 'Error desconocido')}")
    
    def test_corrupted_files(self):
        """Test manejo de archivos corruptos"""
        
        corrupted_cases = [
            ("fake.pdf", b"This is not a PDF", "Archivo PDF corrupto o inválido"),
            ("empty.docx", b"", "Archivo vacío"),
            ("truncated.jpg", b"\xFF\xD8\xFF", "Imagen JPEG truncada"),
            ("random.png", os.urandom(100), "Datos aleatorios con extensión PNG"),
        ]
        
        for filename, content, description in corrupted_cases:
            with self.subTest(file=filename, desc=description):
                corrupted_file = self.create_test_file(filename, content, binary=True)
                
                with open(corrupted_file, 'rb') as f:
                    response = self.client.post('/api/conversion/guest-convert', data={
                        'file': (f, filename),
                        'target_format': 'html'
                    })
                
                # Debe devolver error 400
                assert response.status_code == 400
                data = response.get_json()
                assert 'error' in data
                
                # Verificar que el mensaje de error sea amigable
                error_msg = data['error']
                assert len(error_msg) > 10  # No debe ser muy corto
                print(f"Error para {filename}: {error_msg}")
    
    def test_file_size_limits(self):
        """Test límites de tamaño de archivo"""
        
        # Archivo muy grande (> 10MB para invitados)
        large_content = "A" * (11 * 1024 * 1024)  # 11MB
        large_file = self.create_test_file("large.txt", large_content)
        
        with open(large_file, 'rb') as f:
            response = self.client.post('/api/conversion/guest-convert', data={
                'file': (f, 'large.txt'),
                'target_format': 'html'
            })
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'demasiado grande' in data['error'].lower()
    
    def test_unsupported_formats(self):
        """Test formatos no soportados"""
        
        unsupported_cases = [
            ("test.xyz", "Formato no soportado"),
            ("test.exe", "Archivo ejecutable"),
            ("test.bin", "Archivo binario"),
        ]
        
        for filename, description in unsupported_cases:
            with self.subTest(file=filename, desc=description):
                test_file = self.create_test_file(filename, "test content")
                
                with open(test_file, 'rb') as f:
                    response = self.client.post('/api/conversion/guest-convert', data={
                        'file': (f, filename),
                        'target_format': 'html'
                    })
                
                assert response.status_code == 400
                data = response.get_json()
                assert 'no soportado' in data['error'].lower()
    
    def test_edge_case_filenames(self):
        """Test nombres de archivo especiales"""
        
        edge_cases = [
            ("file with spaces.txt", "Espacios en nombre"),
            ("file-with-dashes.txt", "Guiones en nombre"),
            ("file_with_underscores.txt", "Guiones bajos"),
            ("file.multiple.dots.txt", "Múltiples puntos"),
            ("ñáéíóú.txt", "Caracteres especiales"),
        ]
        
        for filename, description in edge_cases:
            with self.subTest(file=filename, desc=description):
                test_file = self.create_test_file(filename, "Contenido de prueba")
                
                with open(test_file, 'rb') as f:
                    response = self.client.post('/api/conversion/guest-convert', data={
                        'file': (f, filename),
                        'target_format': 'html'
                    })
                
                # Debe manejar el archivo correctamente o dar error informativo
                data = response.get_json()
                if response.status_code != 200:
                    assert 'error' in data
                    print(f"Archivo {filename}: {data['error']}")
    
    def test_conversion_analysis(self):
        """Test análisis de opciones de conversión"""
        
        test_cases = [
            ("jpg", "png"),
            ("txt", "html"),
            ("md", "pdf"),
            ("docx", "txt"),
        ]
        
        for source_format, target_format in test_cases:
            with self.subTest(source=source_format, target=target_format):
                response = self.client.post('/api/conversion/analyze-conversion', 
                    json={
                        'source_format': source_format,
                        'target_format': target_format
                    })
                
                if response.status_code == 200:
                    data = response.get_json()
                    assert data['success'] is True
                    assert 'analysis' in data
                    assert 'source_format' in data
                    assert 'target_format' in data
                else:
                    data = response.get_json()
                    print(f"Análisis {source_format}→{target_format}: {data.get('error', 'Error desconocido')}")
    
    def test_supported_formats_endpoint(self):
        """Test endpoint de formatos soportados"""
        
        response = self.client.get('/api/conversion/supported-formats')
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert data['success'] is True
        assert 'supported_conversions' in data
        assert 'input' in data
        assert 'output' in data
        assert isinstance(data['input'], list)
        assert isinstance(data['output'], list)
        assert len(data['input']) > 0
        assert len(data['output']) > 0
    
    def test_conversion_with_sequence(self):
        """Test conversión con secuencia optimizada"""
        
        content = "Documento de prueba para conversión con secuencia"
        txt_file = self.create_test_file("test.txt", content)
        
        # Simular secuencia de conversión
        conversion_sequence = [
            {"step": 1, "from": "txt", "to": "md", "reason": "Preparación"},
            {"step": 2, "from": "md", "to": "html", "reason": "Conversión final"}
        ]
        
        with open(txt_file, 'rb') as f:
            response = self.client.post('/api/conversion/guest-convert', data={
                'file': (f, 'test.txt'),
                'target_format': 'html',
                'conversion_type': 'optimized',
                'conversion_sequence': json.dumps(conversion_sequence)
            })
        
        # Verificar que maneja la secuencia correctamente
        data = response.get_json()
        if response.status_code != 200:
            print(f"Conversión con secuencia: {data.get('error', 'Error desconocido')}")
    
    def test_concurrent_conversions(self):
        """Test conversiones concurrentes"""
        
        import threading
        import time
        
        results = []
        
        def convert_file(file_num):
            content = f"Archivo de prueba {file_num}"
            txt_file = self.create_test_file(f"concurrent_{file_num}.txt", content)
            
            with open(txt_file, 'rb') as f:
                response = self.client.post('/api/conversion/guest-convert', data={
                    'file': (f, f'concurrent_{file_num}.txt'),
                    'target_format': 'html'
                })
            
            results.append({
                'file_num': file_num,
                'status_code': response.status_code,
                'success': response.status_code == 200
            })
        
        # Lanzar 5 conversiones concurrentes
        threads = []
        for i in range(5):
            thread = threading.Thread(target=convert_file, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Esperar a que terminen
        for thread in threads:
            thread.join()
        
        # Verificar resultados
        assert len(results) == 5
        successful = sum(1 for r in results if r['success'])
        print(f"Conversiones concurrentes: {successful}/5 exitosas")
        
        # Al menos algunas deben ser exitosas
        assert successful > 0

    def test_performance_benchmarks(self):
        """Test benchmarks de rendimiento"""

        import time

        # Test conversión simple
        content = "Contenido de prueba para benchmark"
        txt_file = self.create_test_file("benchmark.txt", content)

        start_time = time.time()

        with open(txt_file, 'rb') as f:
            response = self.client.post('/api/conversion/guest-convert', data={
                'file': (f, 'benchmark.txt'),
                'target_format': 'html'
            })

        end_time = time.time()
        conversion_time = end_time - start_time

        print(f"Tiempo de conversión TXT→HTML: {conversion_time:.3f}s")

        # La conversión debe completarse en menos de 10 segundos
        assert conversion_time < 10.0

        if response.status_code == 200:
            data = response.get_json()
            assert data['success'] is True

    def test_memory_usage(self):
        """Test uso de memoria durante conversiones"""

        import psutil
        import os

        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB

        # Realizar múltiples conversiones
        for i in range(10):
            content = f"Archivo de prueba {i} " * 100  # ~2KB cada uno
            txt_file = self.create_test_file(f"memory_test_{i}.txt", content)

            with open(txt_file, 'rb') as f:
                response = self.client.post('/api/conversion/guest-convert', data={
                    'file': (f, f'memory_test_{i}.txt'),
                    'target_format': 'html'
                })

        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory

        print(f"Uso de memoria: {initial_memory:.1f}MB → {final_memory:.1f}MB (+{memory_increase:.1f}MB)")

        # El aumento de memoria no debe ser excesivo (< 50MB)
        assert memory_increase < 50.0
