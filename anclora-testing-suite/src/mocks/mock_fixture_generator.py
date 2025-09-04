# src/mocks/mock_fixture_generator.py - Mock del generador de fixtures
import random
import string
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Tuple
import json
import hashlib

class MockFixtureGenerator:
    """Mock del generador de fixtures para testing rápido sin archivos reales"""
    
    def __init__(self, fixtures_path: Path):
        self.fixtures_path = fixtures_path
        self.generated_files = {}
        self.generation_stats = {
            "total_generated": 0,
            "successful": 0,
            "failed": 0,
            "start_time": None,
            "end_time": None,
            "categories": {}
        }
        
        # Patrones de contenido simulado
        self.content_templates = {
            'documents': {
                'txt': "Mock document content for testing.\nGenerated: {timestamp}\nSize: {size} bytes\nType: {doc_type}",
                'html': '<html><head><title>Mock Document</title></head><body><h1>Test Document</h1><p>Generated: {timestamp}</p></body></html>',
                'md': '# Mock Markdown Document\n\nGenerated: {timestamp}\n\n## Content\nThis is a mock markdown file for testing purposes.',
                'csv': 'name,value,date\nTest Item 1,100,2025-09-03\nTest Item 2,200,2025-09-04\nTest Item 3,300,2025-09-05',
                'json': '{{"title": "Mock JSON", "generated": "{timestamp}", "data": [{{"id": 1, "value": 100}}]}}'
            },
            'images': {
                # Para imágenes usaremos archivos muy pequeños con headers básicos
                'png': b'\x89PNG\r\n\x1a\n' + b'\x00' * 100,  # PNG header + datos
                'jpg': b'\xff\xd8\xff\xe0' + b'\x00' * 100,  # JPEG header + datos
                'gif': b'GIF89a' + b'\x00' * 100,  # GIF header + datos
                'svg': '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/></svg>'
            },
            'data': {
                'csv': 'id,name,category,value\n1,Item A,Test,100\n2,Item B,Mock,200\n3,Item C,Data,300',
                'json': '{{"metadata": {{"generated": "{timestamp}", "type": "mock_data"}}, "items": [1, 2, 3, 4, 5]}}',
                'xlsx': b'PK\x03\x04' + b'\x00' * 200  # ZIP header simulando Excel
            }
        }
    
    def generate_all_fixtures(self) -> Dict[str, Any]:
        """Simular generación completa de fixtures"""
        self.generation_stats["start_time"] = datetime.now()
        
        print("🎭 MockFixtureGenerator: Simulando generación de fixtures...")
        
        # Simular generación por categoría
        categories_to_generate = [
            ("documents", 290),
            ("images", 190),
            ("data", 45),
            ("media", 30),
            ("corrupted", 50),
            ("sequential", 115),
            ("edge_cases", 40)
        ]
        
        total_to_generate = sum(count for _, count in categories_to_generate)
        
        for category, count in categories_to_generate:
            self.generation_stats["categories"][category] = self._simulate_category_generation(category, count)
        
        # Calcular estadísticas finales
        self.generation_stats["end_time"] = datetime.now()
        self.generation_stats["total_generated"] = sum(
            cat["files_generated"] for cat in self.generation_stats["categories"].values()
        )
        self.generation_stats["successful"] = sum(
            cat["successful"] for cat in self.generation_stats["categories"].values()
        )
        self.generation_stats["failed"] = sum(
            cat["failed"] for cat in self.generation_stats["categories"].values()
        )
        
        # Generar manifiesto simulado
        manifest_data = self._generate_mock_manifest()
        
        return {
            "stats": self.generation_stats,
            "generated_files": self.generated_files,
            "manifest_path": self.fixtures_path / "manifest.json",
            "manifest_data": manifest_data
        }
    
    def _simulate_category_generation(self, category: str, target_count: int) -> Dict[str, Any]:
        """Simular generación de una categoría específica"""
        
        # Crear directorio si no existe
        category_path = self.fixtures_path / category
        category_path.mkdir(parents=True, exist_ok=True)
        
        # Simular generación de archivos
        files_generated = []
        successful = 0
        failed = 0
        
        # Determinar formatos según categoría
        if category == "documents":
            formats = ["txt", "docx", "html", "md", "pdf", "rtf"]
        elif category == "images":
            formats = ["png", "jpg", "gif", "svg", "webp"]
        elif category == "data":
            formats = ["csv", "json", "xlsx"]
        elif category in ["media", "sequential", "corrupted", "edge_cases"]:
            formats = ["txt", "png", "csv"]  # Formatos básicos para casos especiales
        else:
            formats = ["txt"]
        
        # Generar archivos simulados
        files_per_format = max(1, target_count // len(formats))
        
        for format_type in formats:
            for i in range(files_per_format):
                if len(files_generated) >= target_count:
                    break
                
                # Simular éxito/fallo ocasional
                if random.random() < 0.95:  # 95% de éxito
                    file_info = self._create_mock_file(category_path, format_type, i, category)
                    files_generated.append(file_info)
                    successful += 1
                else:
                    failed += 1
        
        self.generated_files[category] = files_generated
        
        return {
            "files_generated": len(files_generated),
            "successful": successful,
            "failed": failed,
            "target_count": target_count,
            "completion_rate": len(files_generated) / target_count,
            "formats_used": formats
        }
    
    def _create_mock_file(self, category_path: Path, format_type: str, index: int, category: str) -> Dict[str, Any]:
        """Crear un archivo mock individual"""
        
        # Generar nombre único
        if category == "corrupted":
            filename = f"corrupted_{format_type}_{random.choice(['truncated', 'invalid', 'empty'])}_{index}.{format_type}"
        elif category == "sequential":
            sequence_type = random.choice(['json_csv_xlsx', 'html_md_docx', 'svg_png_pdf'])
            filename = f"seq_{sequence_type}_{format_type}_{index}.{format_type}"
        elif category == "edge_cases":
            edge_type = random.choice(['huge', 'tiny', 'unicode', 'special_chars'])
            filename = f"edge_{edge_type}_{format_type}_{index}.{format_type}"
        else:
            size_category = random.choice(['small', 'medium', 'large'])
            filename = f"{format_type}_{size_category}_{index+1}.{format_type}"
        
        file_path = category_path / filename
        
        # Generar contenido según formato
        content, file_size = self._generate_mock_content(format_type, category, index)
        
        # "Escribir" archivo (simulado - solo creamos la entrada)
        # En un mock real podrías decidir si crear archivos físicos o no
        
        # Calcular checksum simulado
        checksum = hashlib.md5(f"{filename}_{content}".encode()).hexdigest()
        
        file_info = {
            "filename": filename,
            "path": str(file_path),
            "size_bytes": file_size,
            "checksum": checksum,
            "format": format_type,
            "category": category,
            "generated_at": datetime.now().isoformat(),
            "mock_content": True
        }
        
        return file_info
    
    def _generate_mock_content(self, format_type: str, category: str, index: int) -> Tuple[str, int]:
        """Generar contenido simulado para un archivo"""
        
        timestamp = datetime.now().isoformat()
        
        # Determinar plantilla de contenido
        if category == "documents" and format_type in self.content_templates["documents"]:
            template = self.content_templates["documents"][format_type]
        elif category == "images" and format_type in self.content_templates["images"]:
            template = self.content_templates["images"][format_type]
        elif category == "data" and format_type in self.content_templates["data"]:
            template = self.content_templates["data"][format_type]
        else:
            # Contenido genérico
            template = f"Mock {format_type} file for {category} testing. Generated: {timestamp}"
        
        # Generar tamaños realistas
        if category == "edge_cases":
            if "tiny" in str(index):
                size = random.randint(1, 100)  # Archivos muy pequeños
            elif "huge" in str(index):
                size = random.randint(50_000_000, 100_000_000)  # 50-100MB
            else:
                size = random.randint(1000, 10000)
        else:
            # Tamaños normales por formato
            size_ranges = {
                'txt': (500, 50_000),
                'html': (1_000, 100_000), 
                'md': (500, 20_000),
                'csv': (200, 500_000),
                'json': (100, 100_000),
                'docx': (5_000, 2_000_000),
                'pdf': (10_000, 10_000_000),
                'png': (1_000, 5_000_000),
                'jpg': (2_000, 8_000_000),
                'gif': (500, 2_000_000),
                'svg': (500, 50_000)
            }
            
            min_size, max_size = size_ranges.get(format_type, (1000, 10000))
            size = random.randint(min_size, max_size)
        
        # Formatear contenido
        if isinstance(template, str):
            try:
                content = template.format(
                    timestamp=timestamp,
                    size=size,
                    doc_type=category,
                    index=index
                )
            except:
                content = template  # Usar template sin formatear si falla
        else:
            content = str(template)  # Convertir bytes a string para el mock
        
        # Ajustar contenido al tamaño objetivo
        if len(content) < size:
            padding = "A" * (size - len(content) - 50) + "\n[END]"
            content += padding
        else:
            content = content[:size]
        
        return content, len(content.encode('utf-8', errors='ignore'))
    
    def _generate_mock_manifest(self) -> Dict[str, Any]:
        """Generar manifiesto simulado"""
        
        total_files = sum(len(files) for files in self.generated_files.values())
        total_size = sum(
            sum(f["size_bytes"] for f in files)
            for files in self.generated_files.values()
        )
        
        manifest = {
            "generator": "MockFixtureGenerator",
            "version": "1.0.0-mock",
            "generated_at": datetime.now().isoformat(),
            "mock_mode": True,
            "stats": self.generation_stats,
            "categories": {},
            "summary": {
                "total_files": total_files,
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "categories_generated": len(self.generated_files)
            }
        }
        
        # Agregar información por categoría
        for category, files in self.generated_files.items():
            category_size = sum(f["size_bytes"] for f in files)
            manifest["categories"][category] = {
                "file_count": len(files),
                "total_size_bytes": category_size,
                "formats_distribution": self._calculate_format_distribution(files),
                "files": files  # Incluir lista completa para referencia
            }
        
        # Simular escritura del manifiesto
        manifest_path = self.fixtures_path / "manifest.json"
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            with open(manifest_path, 'w', encoding='utf-8') as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)
            print(f"📋 Mock manifest written to: {manifest_path}")
        except Exception as e:
            print(f"⚠️ Could not write mock manifest: {e}")
        
        return manifest
    
    def _calculate_format_distribution(self, files: List[Dict[str, Any]]) -> Dict[str, int]:
        """Calcular distribución de formatos en una categoría"""
        distribution = {}
        for file_info in files:
            format_type = file_info.get("format", "unknown")
            distribution[format_type] = distribution.get(format_type, 0) + 1
        return distribution
    
    # Métodos para control del mock
    
    def set_failure_rate(self, rate: float):
        """Configurar tasa de fallos en generación"""
        self.failure_rate = max(0.0, min(1.0, rate))
    
    def get_generation_summary(self) -> Dict[str, Any]:
        """Obtener resumen de la generación simulada"""
        return {
            "mock_mode": True,
            "total_categories": len(self.generated_files),
            "total_files_simulated": sum(len(files) for files in self.generated_files.values()),
            "categories": list(self.generated_files.keys()),
            "generation_stats": self.generation_stats,
            "fixtures_path": str(self.fixtures_path)
        }
    
    def simulate_file_exists(self, file_path: Path) -> bool:
        """Simular verificación de existencia de archivo"""
        # Buscar en archivos generados simulados
        for category_files in self.generated_files.values():
            for file_info in category_files:
                if Path(file_info["path"]) == file_path:
                    return True
        return False
    
    def get_simulated_file_info(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """Obtener información de archivo simulado"""
        for category_files in self.generated_files.values():
            for file_info in category_files:
                if Path(file_info["path"]) == file_path:
                    return file_info
        return None

# Factory functions

def create_mock_generator(fixtures_path: Path) -> MockFixtureGenerator:
    """Crear instancia de generador mock"""
    return MockFixtureGenerator(fixtures_path)

def generate_quick_mock_fixtures(fixtures_path: Path, categories: List[str] = None) -> Dict[str, Any]:
    """Generar fixtures mock rápidamente para categorías específicas"""
    generator = MockFixtureGenerator(fixtures_path)
    
    if categories:
        # Simular solo categorías específicas
        original_method = generator.generate_all_fixtures
        
        def limited_generation():
            result = {"stats": {}, "generated_files": {}, "manifest_data": {}}
            
            for category in categories:
                if category == "documents":
                    count = 50  # Reducido para testing rápido
                elif category == "images":
                    count = 30
                else:
                    count = 20
                
                cat_result = generator._simulate_category_generation(category, count)
                result["stats"][category] = cat_result
            
            return result
        
        return limited_generation()
    else:
        return generator.generate_all_fixtures()

if __name__ == "__main__":
    # Demo del mock generator
    import tempfile
    from pathlib import Path
    
    print("🎭 Demo MockFixtureGenerator")
    
    # Usar directorio temporal para demo
    with tempfile.TemporaryDirectory() as temp_dir:
        fixtures_path = Path(temp_dir) / "mock_fixtures"
        
        generator = MockFixtureGenerator(fixtures_path)
        
        print("🏭 Generating mock fixtures...")
        result = generator.generate_all_fixtures()
        
        print(f"\n📊 Generation Results:")
        print(f"  Total files: {result['stats']['successful']:,}")
        print(f"  Categories: {len(result['generated_files'])}")
        
        for category, files in result['generated_files'].items():
            print(f"  📁 {category}: {len(files)} files")
        
        print(f"\n📋 Manifest: {result['manifest_path']}")
        
        # Test file simulation
        if result['generated_files']:
            first_category = list(result['generated_files'].keys())[0]
            if result['generated_files'][first_category]:
                test_file_info = result['generated_files'][first_category][0]
                test_path = Path(test_file_info['path'])
                
                print(f"\n🧪 Testing file simulation:")
                print(f"  File: {test_path}")
                print(f"  Exists (simulated): {generator.simulate_file_exists(test_path)}")
                print(f"  Info: {generator.get_simulated_file_info(test_path)}")