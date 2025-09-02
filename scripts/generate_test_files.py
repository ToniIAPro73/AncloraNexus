#!/usr/bin/env python3
"""
Script para generar archivos de prueba para el sistema de testing integral
"""

import os
import json
import random
import string
from pathlib import Path
from PIL import Image, ImageDraw
import io

# Rutas base
BASE_DIR = Path(__file__).parent.parent
TEST_FILES_DIR = BASE_DIR / "test_files"

def create_directories():
    """Crear estructura de directorios"""
    dirs = [
        "valid/small",
        "valid/medium", 
        "valid/large",
        "corrupted",
        "edge_cases",
        "formats/images",
        "formats/documents",
        "formats/text",
        "generated"
    ]
    
    for dir_path in dirs:
        (TEST_FILES_DIR / dir_path).mkdir(parents=True, exist_ok=True)
    
    print("✅ Estructura de directorios creada")

def generate_text_files():
    """Generar archivos de texto de diferentes tamaños"""
    
    # Texto base
    lorem_ipsum = """Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."""
    
    # Archivo pequeño (< 1KB)
    small_content = lorem_ipsum[:200]
    with open(TEST_FILES_DIR / "valid/small/test_small.txt", "w", encoding="utf-8") as f:
        f.write(small_content)
    
    # Archivo mediano (~10KB)
    medium_content = lorem_ipsum * 20
    with open(TEST_FILES_DIR / "valid/medium/test_medium.txt", "w", encoding="utf-8") as f:
        f.write(medium_content)
    
    # Archivo grande (~100KB)
    large_content = lorem_ipsum * 200
    with open(TEST_FILES_DIR / "valid/large/test_large.txt", "w", encoding="utf-8") as f:
        f.write(large_content)
    
    print("✅ Archivos de texto generados")

def generate_json_files():
    """Generar archivos JSON de prueba"""
    
    # JSON simple
    simple_data = {
        "name": "Test Document",
        "version": "1.0",
        "data": ["item1", "item2", "item3"]
    }
    
    with open(TEST_FILES_DIR / "valid/small/test_simple.json", "w") as f:
        json.dump(simple_data, f, indent=2)
    
    # JSON complejo
    complex_data = {
        "users": [
            {"id": i, "name": f"User {i}", "email": f"user{i}@test.com", 
             "data": {"score": random.randint(1, 100), "active": random.choice([True, False])}}
            for i in range(100)
        ],
        "metadata": {
            "total": 100,
            "generated": "2025-09-02",
            "version": "2.0"
        }
    }
    
    with open(TEST_FILES_DIR / "valid/medium/test_complex.json", "w") as f:
        json.dump(complex_data, f, indent=2)
    
    print("✅ Archivos JSON generados")

def generate_html_files():
    """Generar archivos HTML de prueba"""
    
    # HTML simple
    simple_html = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Document</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        p { line-height: 1.6; }
    </style>
</head>
<body>
    <h1>Documento de Prueba</h1>
    <p>Este es un documento HTML de prueba para el sistema de conversión.</p>
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
    </ul>
</body>
</html>"""
    
    with open(TEST_FILES_DIR / "valid/small/test_simple.html", "w", encoding="utf-8") as f:
        f.write(simple_html)
    
    print("✅ Archivos HTML generados")

def generate_markdown_files():
    """Generar archivos Markdown de prueba"""
    
    markdown_content = """# Documento de Prueba

Este es un **documento Markdown** de prueba para el sistema de conversión.

## Características

- Soporte para *texto en cursiva*
- Soporte para **texto en negrita**
- Listas numeradas y con viñetas
- Enlaces: [Anclora Nexus](https://anclora.com)

### Código

```python
def hello_world():
    print("Hello, World!")
```

### Tabla

| Formato | Soportado | Calidad |
|---------|-----------|---------|
| PDF     | ✅        | Alta    |
| DOCX    | ✅        | Alta    |
| HTML    | ✅        | Media   |

> Este es un blockquote de ejemplo.

---

**Nota**: Este archivo es generado automáticamente para testing.
"""
    
    with open(TEST_FILES_DIR / "valid/small/test_document.md", "w", encoding="utf-8") as f:
        f.write(markdown_content)
    
    print("✅ Archivos Markdown generados")

def generate_image_files():
    """Generar imágenes de prueba"""
    
    # Imagen pequeña (100x100)
    img_small = Image.new('RGB', (100, 100), color='red')
    draw = ImageDraw.Draw(img_small)
    draw.text((10, 40), "TEST", fill='white')
    img_small.save(TEST_FILES_DIR / "valid/small/test_small.png")
    
    # Imagen mediana (500x500)
    img_medium = Image.new('RGB', (500, 500), color='blue')
    draw = ImageDraw.Draw(img_medium)
    draw.rectangle([50, 50, 450, 450], fill='yellow', outline='black', width=5)
    draw.text((200, 240), "MEDIUM TEST", fill='black')
    img_medium.save(TEST_FILES_DIR / "valid/medium/test_medium.png")
    
    # Imagen en diferentes formatos
    img_small.save(TEST_FILES_DIR / "formats/images/test.jpg", "JPEG")
    img_small.save(TEST_FILES_DIR / "formats/images/test.png", "PNG")
    img_small.save(TEST_FILES_DIR / "formats/images/test.gif", "GIF")
    
    print("✅ Imágenes generadas")

def generate_corrupted_files():
    """Generar archivos corruptos para testing"""
    
    # Archivo con header incorrecto
    with open(TEST_FILES_DIR / "corrupted/fake_pdf.pdf", "wb") as f:
        f.write(b"This is not a PDF file but has .pdf extension")
    
    # Archivo truncado
    with open(TEST_FILES_DIR / "corrupted/truncated.jpg", "wb") as f:
        f.write(b"\xFF\xD8\xFF\xE0")  # Solo header JPEG, sin datos
    
    # Archivo vacío con extensión
    with open(TEST_FILES_DIR / "corrupted/empty.docx", "wb") as f:
        pass  # Archivo vacío
    
    # Archivo con contenido aleatorio
    with open(TEST_FILES_DIR / "corrupted/random_data.png", "wb") as f:
        f.write(os.urandom(1024))  # 1KB de datos aleatorios
    
    print("✅ Archivos corruptos generados")

def generate_edge_cases():
    """Generar casos edge para testing"""
    
    # Archivo de 0 bytes
    with open(TEST_FILES_DIR / "edge_cases/zero_bytes.txt", "wb") as f:
        pass
    
    # Archivo con nombre muy largo
    long_name = "a" * 200 + ".txt"
    with open(TEST_FILES_DIR / "edge_cases" / long_name, "w") as f:
        f.write("File with very long name")
    
    # Archivo con caracteres especiales
    with open(TEST_FILES_DIR / "edge_cases/special_chars_ñáéíóú.txt", "w", encoding="utf-8") as f:
        f.write("Archivo con caracteres especiales: ñáéíóú 中文 🚀")
    
    # Archivo con solo espacios
    with open(TEST_FILES_DIR / "edge_cases/only_spaces.txt", "w") as f:
        f.write("   \n   \n   \n")
    
    print("✅ Casos edge generados")

def generate_test_manifest():
    """Generar manifiesto con información de todos los archivos de prueba"""

    long_name = "a" * 200 + ".txt"

    manifest = {
        "generated_at": "2025-09-02",
        "version": "1.0",
        "categories": {
            "valid": {
                "small": ["test_small.txt", "test_simple.json", "test_simple.html", "test_document.md", "test_small.png"],
                "medium": ["test_medium.txt", "test_complex.json", "test_medium.png"],
                "large": ["test_large.txt"]
            },
            "corrupted": ["fake_pdf.pdf", "truncated.jpg", "empty.docx", "random_data.png"],
            "edge_cases": ["zero_bytes.txt", long_name, "special_chars_ñáéíóú.txt", "only_spaces.txt"],
            "formats": {
                "images": ["test.jpg", "test.png", "test.gif"]
            }
        },
        "total_files": 0
    }
    
    # Contar archivos
    total = sum(len(files) if isinstance(files, list) else sum(len(f) for f in files.values()) 
                for files in manifest["categories"].values())
    manifest["total_files"] = total
    
    with open(TEST_FILES_DIR / "test_manifest.json", "w") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Manifiesto generado con {total} archivos")

def main():
    """Función principal"""
    print("🚀 Generando archivos de prueba para Anclora Nexus...")
    
    create_directories()
    generate_text_files()
    generate_json_files()
    generate_html_files()
    generate_markdown_files()
    generate_image_files()
    generate_corrupted_files()
    generate_edge_cases()
    generate_test_manifest()
    
    print("\n✅ ¡Todos los archivos de prueba generados exitosamente!")
    print(f"📁 Ubicación: {TEST_FILES_DIR}")

if __name__ == "__main__":
    main()
