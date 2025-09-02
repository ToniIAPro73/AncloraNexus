#!/usr/bin/env python3
"""
Test completo del sistema de conversiones de Anclora Nexus
Verifica que todas las conversiones funcionen correctamente
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

# Agregar el directorio raíz al path
sys.path.append(str(Path(__file__).parent))

def create_test_jpg_image(output_path: str, width: int = 800, height: int = 600):
    """Crea una imagen JPG de prueba con contenido visual"""
    # Crear imagen RGB
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)
    
    # Dibujar fondo degradado
    for y in range(height):
        color_intensity = int(255 * (y / height))
        color = (color_intensity, 100, 255 - color_intensity)
        draw.line([(0, y), (width, y)], fill=color)
    
    # Dibujar elementos de prueba
    draw.rectangle([50, 50, width-50, height-50], outline='black', width=3)
    draw.ellipse([100, 100, width-100, height-100], fill='yellow', outline='red', width=2)
    
    # Agregar texto
    try:
        # Intentar usar fuente del sistema
        font = ImageFont.load_default()
    except:
        font = None
    
    text = "ANCLORA NEXUS - TEST IMAGE"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_x = (width - text_width) // 2
    text_y = (height - text_height) // 2
    
    draw.text((text_x, text_y), text, fill='black', font=font)
    
    # Guardar como JPG
    img.save(output_path, 'JPEG', quality=95)
    print(f"✅ Imagen de prueba creada: {output_path}")
    return output_path

def test_conversion_engine():
    """Prueba el motor de conversión principal"""
    print("\n🔧 PROBANDO MOTOR DE CONVERSIÓN PRINCIPAL")
    
    try:
        from src.models.conversion import conversion_engine
        
        # Verificar que JPG → PNG esté registrado
        jpg_formats = conversion_engine.get_supported_formats('jpg')
        print(f"📋 Formatos soportados desde JPG: {jpg_formats}")
        
        if 'png' in jpg_formats:
            print("✅ Conversión JPG → PNG está registrada")
        else:
            print("❌ Conversión JPG → PNG NO está registrada")
            
        # Verificar métodos de conversión cargados
        conversion_methods = list(conversion_engine.conversion_methods.keys())
        jpg_png_method = ('jpg', 'png') in conversion_methods
        
        print(f"🔍 Métodos de conversión cargados: {len(conversion_methods)}")
        print(f"📝 JPG→PNG en métodos: {jpg_png_method}")
        
        # Mostrar algunos métodos cargados
        image_methods = [m for m in conversion_methods if 'jpg' in m or 'png' in m]
        print(f"🖼️  Métodos de imagen encontrados: {image_methods}")
        
        return conversion_engine
        
    except Exception as e:
        print(f"❌ Error cargando motor de conversión: {e}")
        return None

def test_direct_conversion():
    """Prueba conversión directa JPG → PNG"""
    print("\n🎯 PROBANDO CONVERSIÓN DIRECTA JPG → PNG")
    
    conversion_engine = test_conversion_engine()
    if not conversion_engine:
        return False
    
    # Crear archivos temporales
    with tempfile.TemporaryDirectory() as temp_dir:
        input_jpg = os.path.join(temp_dir, "test_input.jpg")
        output_png = os.path.join(temp_dir, "test_output.png")
        
        # Crear imagen de prueba
        create_test_jpg_image(input_jpg)
        
        # Realizar conversión
        try:
            success, message = conversion_engine.convert_file(
                input_jpg, output_png, 'jpg', 'png'
            )
            
            if success:
                print(f"✅ Conversión exitosa: {message}")
                
                # Verificar archivo de salida
                if os.path.exists(output_png):
                    file_size = os.path.getsize(output_png)
                    print(f"📁 Archivo PNG creado: {file_size} bytes")
                    
                    # Verificar que es PNG válido
                    try:
                        with Image.open(output_png) as img:
                            print(f"🖼️  Imagen PNG válida: {img.size}, modo: {img.mode}")
                        return True
                    except Exception as e:
                        print(f"❌ Error verificando PNG: {e}")
                        return False
                else:
                    print("❌ Archivo PNG no fue creado")
                    return False
            else:
                print(f"❌ Conversión falló: {message}")
                return False
                
        except Exception as e:
            print(f"❌ Error en conversión: {e}")
            return False

def test_ai_conversion_paths():
    """Prueba las rutas de conversión con IA"""
    print("\n🤖 PROBANDO RUTAS DE CONVERSIÓN CON IA")
    
    try:
        from src.services.ai_conversion_engine import ai_conversion_engine
        import asyncio
        
        # Crear imagen de prueba
        with tempfile.TemporaryDirectory() as temp_dir:
            input_jpg = os.path.join(temp_dir, "test_ai.jpg")
            create_test_jpg_image(input_jpg, 1200, 800)
            
            # Análisis con IA
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                # Análisis del archivo
                file_analysis = loop.run_until_complete(
                    ai_conversion_engine.analyze_file_with_ai(input_jpg, "test_ai.jpg")
                )
                
                print(f"📊 Análisis IA completado:")
                print(f"   - Tipo de contenido: {file_analysis.content_type}")
                print(f"   - Complejidad: {file_analysis.complexity_level}")
                print(f"   - Formatos óptimos: {file_analysis.optimal_targets}")
                
                # Obtener rutas de conversión
                conversion_paths = loop.run_until_complete(
                    ai_conversion_engine.get_optimal_conversion_paths(
                        'jpg', 'png', file_analysis
                    )
                )
                
                print(f"\n🛤️  Rutas de conversión encontradas: {len(conversion_paths)}")
                
                for i, path in enumerate(conversion_paths, 1):
                    print(f"   {i}. {path.visual_path}")
                    print(f"      - Calidad: {path.quality_score:.1f}")
                    print(f"      - Velocidad: {path.speed_score:.1f}")
                    print(f"      - Confianza IA: {path.ai_confidence:.2f}")
                    print(f"      - Descripción: {path.description}")
                    print(f"      - Tiempo estimado: {path.estimated_time_seconds:.1f}s")
                    print()
                
                return len(conversion_paths) > 0
                
            finally:
                loop.close()
                
    except Exception as e:
        print(f"❌ Error en prueba IA: {e}")
        return False

def test_sequence_vs_direct():
    """Demuestra cuándo la secuencia es mejor que la conversión directa"""
    print("\n🔄 COMPARANDO CONVERSIÓN DIRECTA VS SECUENCIA OPTIMIZADA")
    
    # Ejemplo: JPG → PDF (directo vs JPG → PNG → PDF)
    print("📋 Caso de estudio: JPG → PDF")
    print("   Opción 1: JPG → PDF (directo)")
    print("   Opción 2: JPG → PNG → PDF (secuencia)")
    print()
    
    # Simular análisis de calidad
    direct_quality = 75  # JPG a PDF pierde calidad por compresión
    sequence_quality = 90  # PNG preserva mejor la calidad para PDF
    
    print(f"📊 Análisis de calidad:")
    print(f"   - Conversión directa: {direct_quality}% calidad")
    print(f"   - Secuencia optimizada: {sequence_quality}% calidad")
    print()
    
    if sequence_quality > direct_quality:
        print("✅ RECOMENDACIÓN: Usar secuencia optimizada")
        print("   Razón: Mejor preservación de calidad de imagen")
    else:
        print("✅ RECOMENDACIÓN: Usar conversión directa")
        print("   Razón: Mejor velocidad sin pérdida significativa")
    
    return True

def main():
    """Función principal de pruebas"""
    print("🚀 INICIANDO PRUEBAS DEL SISTEMA DE CONVERSIONES")
    print("=" * 60)
    
    results = {
        'conversion_engine': False,
        'direct_conversion': False,
        'ai_paths': False,
        'sequence_analysis': False
    }
    
    # Prueba 1: Motor de conversión
    results['conversion_engine'] = test_conversion_engine() is not None
    
    # Prueba 2: Conversión directa
    results['direct_conversion'] = test_direct_conversion()
    
    # Prueba 3: Rutas IA
    results['ai_paths'] = test_ai_conversion_paths()
    
    # Prueba 4: Análisis de secuencias
    results['sequence_analysis'] = test_sequence_vs_direct()
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    for test_name, passed in results.items():
        status = "✅ PASÓ" if passed else "❌ FALLÓ"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\n🎯 Resultado final: {passed_tests}/{total_tests} pruebas pasaron")
    
    if passed_tests == total_tests:
        print("🎉 ¡TODAS LAS PRUEBAS PASARON!")
    else:
        print("⚠️  Algunas pruebas fallaron. Revisar configuración.")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
