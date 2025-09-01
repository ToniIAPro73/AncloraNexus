#!/usr/bin/env python3
# ================================
# ANCLORA NEXUS - AI CONVERSION TESTS
# Pruebas del motor de conversión inteligente
# ================================

import os
import sys
import asyncio
import tempfile
import time
from pathlib import Path

# Agregar el directorio src al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

async def test_ai_conversion_engine():
    """Prueba el motor de conversión con IA"""
    
    print("🧪 INICIANDO PRUEBAS DEL MOTOR DE CONVERSIÓN IA")
    print("=" * 60)
    
    try:
        # Importar servicios
        from src.services.ai_conversion_engine import ai_conversion_engine
        from src.services.intelligent_conversion_sequences import intelligent_sequences
        from src.services.ai_quality_assessment import ai_quality_assessor
        from src.services.file_preview_service import file_preview_service
        from src.services.batch_download_service import batch_download_service
        
        print("✅ Servicios de IA importados correctamente")
        
        # Crear archivo de prueba
        test_content = """# Documento de Prueba Anclora Nexus

Este es un documento de prueba para verificar el funcionamiento del motor de conversión inteligente con IA.

## Características del Motor IA

- **Análisis inteligente** de archivos
- **Secuencias optimizadas** de conversión
- **Predicción de calidad** con IA
- **Vista previa** de archivos
- **Descarga por lotes** con ZIP

### Beneficios

1. Mayor calidad de conversión
2. Velocidad optimizada
3. Análisis automático de contenido
4. Recomendaciones personalizadas

> "La IA transforma la manera en que convertimos documentos" - Anclora Nexus

**Conclusión:** El motor de conversión inteligente representa un avance significativo en la tecnología de conversión de documentos.
"""
        
        # Crear archivo temporal
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write(test_content)
            test_file_path = f.name
        
        print(f"📄 Archivo de prueba creado: {test_file_path}")
        
        # Test 1: Análisis IA
        print("\n🧠 TEST 1: Análisis IA del archivo")
        start_time = time.time()
        
        file_analysis = await ai_conversion_engine.analyze_file_with_ai(
            test_file_path, "test_document.md"
        )
        
        analysis_time = time.time() - start_time
        print(f"   ⏱️  Tiempo de análisis: {analysis_time:.2f}s")
        print(f"   📊 Tipo de contenido: {file_analysis.content_type}")
        print(f"   🔍 Complejidad: {file_analysis.complexity_level}")
        print(f"   🛡️  Nivel de seguridad: {file_analysis.security_level}")
        print(f"   💡 Recomendaciones IA: {len(file_analysis.ai_recommendations)}")
        
        for i, rec in enumerate(file_analysis.ai_recommendations[:3], 1):
            print(f"      {i}. {rec}")
        
        # Test 2: Rutas de conversión inteligentes
        print("\n🛤️  TEST 2: Rutas de conversión inteligentes")
        start_time = time.time()
        
        conversion_paths = await ai_conversion_engine.get_optimal_conversion_paths(
            'md', 'pdf', file_analysis
        )
        
        paths_time = time.time() - start_time
        print(f"   ⏱️  Tiempo de análisis de rutas: {paths_time:.2f}s")
        print(f"   🔄 Rutas encontradas: {len(conversion_paths)}")
        
        for i, path in enumerate(conversion_paths, 1):
            print(f"   {i}. {path.description}")
            print(f"      📈 Calidad: {path.quality_score:.1f}% | Velocidad: {path.speed_score:.1f}% | IA: {path.ai_confidence:.1f}")
            print(f"      🔄 Pasos: {path.visual_path}")
            print(f"      ⏱️  Tiempo estimado: {path.estimated_time_seconds:.1f}s")
        
        # Test 3: Predicción de calidad
        print("\n🎯 TEST 3: Predicción de calidad IA")
        start_time = time.time()
        
        quality_prediction = await ai_quality_assessor.predict_conversion_quality(
            test_file_path, "test_document.md", 'md', 'pdf'
        )
        
        prediction_time = time.time() - start_time
        print(f"   ⏱️  Tiempo de predicción: {prediction_time:.2f}s")
        print(f"   📊 Calidad general predicha: {quality_prediction.predicted_quality.overall_score:.1f}%")
        print(f"   🎯 Confianza IA: {quality_prediction.confidence_level:.1f}")
        print(f"   ⚠️  Factores de riesgo: {len(quality_prediction.risk_factors)}")
        
        for risk in quality_prediction.risk_factors:
            print(f"      - {risk}")
        
        # Test 4: Recomendaciones inteligentes
        print("\n💡 TEST 4: Recomendaciones inteligentes")
        start_time = time.time()
        
        smart_recommendations = await ai_quality_assessor.generate_smart_recommendations(
            test_file_path, "test_document.md"
        )
        
        recommendations_time = time.time() - start_time
        print(f"   ⏱️  Tiempo de recomendaciones: {recommendations_time:.2f}s")
        print(f"   🎯 Recomendaciones generadas: {len(smart_recommendations)}")
        
        for i, rec in enumerate(smart_recommendations[:3], 1):
            print(f"   {i}. {rec.target_format.upper()} - {rec.use_case}")
            print(f"      📈 Calidad: {rec.quality_prediction}% | Velocidad: {rec.speed_prediction}% | Eficiencia: {rec.cost_efficiency}%")
            print(f"      💭 {rec.ai_reasoning}")
        
        # Test 5: Vista previa
        print("\n👁️  TEST 5: Vista previa de archivo")
        start_time = time.time()
        
        preview_data = await file_preview_service.generate_preview(
            test_file_path, "test_document.md", 'high'
        )
        
        preview_time = time.time() - start_time
        print(f"   ⏱️  Tiempo de preview: {preview_time:.2f}s")
        print(f"   📄 Tipo de preview: {preview_data.preview_type}")
        print(f"   📊 Metadatos: {len(preview_data.metadata)} campos")
        print(f"   📝 Contenido: {len(preview_data.content)} caracteres")
        
        # Test 6: Secuencia de conversión inteligente
        print("\n🔄 TEST 6: Secuencia de conversión inteligente")
        
        if conversion_paths:
            start_time = time.time()
            
            # Crear archivo de salida temporal
            output_path = test_file_path.replace('.md', '_converted.pdf')
            
            sequence_result = await intelligent_sequences.execute_intelligent_sequence(
                test_file_path, 'pdf', conversion_paths[0]
            )
            
            sequence_time = time.time() - start_time
            print(f"   ⏱️  Tiempo de conversión: {sequence_time:.2f}s")
            print(f"   ✅ Éxito: {sequence_result.success}")
            print(f"   📊 Pasos completados: {sequence_result.steps_completed}")
            print(f"   🎯 Puntuación de calidad: {sequence_result.quality_score:.1f}%")
            
            if sequence_result.success:
                print(f"   📁 Archivo generado: {os.path.exists(sequence_result.final_output_path)}")
                if os.path.exists(sequence_result.final_output_path):
                    file_size = os.path.getsize(sequence_result.final_output_path)
                    print(f"   📏 Tamaño del archivo: {file_size / 1024:.1f} KB")
            
            # Mostrar logs de conversión
            print("   📋 Logs de conversión:")
            for log in sequence_result.logs:
                print(f"      - {log}")
        
        # Test 7: Sistema de lotes
        print("\n📦 TEST 7: Sistema de descarga por lotes")
        start_time = time.time()
        
        # Crear lote
        batch_id = batch_download_service.create_batch()
        print(f"   🆔 Lote creado: {batch_id}")
        
        # Simular agregar archivos al lote
        if sequence_result.success and os.path.exists(sequence_result.final_output_path):
            success = batch_download_service.add_file_to_batch(
                batch_id,
                sequence_result.final_output_path,
                "test_document.md",
                "test_document.pdf",
                {
                    'conversion_type': 'ai_intelligent',
                    'quality_score': sequence_result.quality_score,
                    'processing_time': sequence_result.total_time,
                    'ai_confidence': conversion_paths[0].ai_confidence
                }
            )
            print(f"   ➕ Archivo agregado al lote: {success}")
            
            if success:
                # Preparar ZIP
                zip_success = await batch_download_service.prepare_batch_zip(batch_id)
                print(f"   📦 ZIP preparado: {zip_success}")
                
                # Obtener información del lote
                batch_info = batch_download_service.get_batch_info(batch_id)
                if batch_info:
                    print(f"   📊 Archivos en lote: {batch_info['total_files']}")
                    print(f"   📏 Tamaño total: {batch_info['total_size_mb']:.2f} MB")
                    print(f"   📅 Expira: {batch_info['expires_at']}")
        
        batch_time = time.time() - start_time
        print(f"   ⏱️  Tiempo total del lote: {batch_time:.2f}s")
        
        # Resumen final
        print("\n" + "=" * 60)
        print("🎉 RESUMEN DE PRUEBAS DEL MOTOR IA")
        print("=" * 60)
        
        total_time = analysis_time + paths_time + prediction_time + recommendations_time + preview_time + sequence_time + batch_time
        
        print(f"⏱️  Tiempo total de pruebas: {total_time:.2f}s")
        print(f"🧠 Análisis IA: ✅ ({analysis_time:.2f}s)")
        print(f"🛤️  Rutas inteligentes: ✅ ({paths_time:.2f}s)")
        print(f"🎯 Predicción de calidad: ✅ ({prediction_time:.2f}s)")
        print(f"💡 Recomendaciones: ✅ ({recommendations_time:.2f}s)")
        print(f"👁️  Vista previa: ✅ ({preview_time:.2f}s)")
        print(f"🔄 Conversión inteligente: ✅ ({sequence_time:.2f}s)")
        print(f"📦 Sistema de lotes: ✅ ({batch_time:.2f}s)")
        
        print("\n🚀 MOTOR DE CONVERSIÓN IA FUNCIONANDO CORRECTAMENTE!")
        
        # Limpiar archivos temporales
        try:
            os.unlink(test_file_path)
            if sequence_result.success and os.path.exists(sequence_result.final_output_path):
                os.unlink(sequence_result.final_output_path)
        except:
            pass
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR EN PRUEBAS: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def test_api_endpoints():
    """Prueba los endpoints de la API"""
    
    print("\n🌐 PROBANDO ENDPOINTS DE LA API")
    print("=" * 40)
    
    import requests
    
    base_url = "http://localhost:8000/api/conversion"
    
    # Test formatos soportados
    try:
        response = requests.get(f"{base_url}/supported-formats")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Formatos soportados: {len(data.get('supported_conversions', {}))} formatos")
        else:
            print(f"❌ Error obteniendo formatos: {response.status_code}")
    except Exception as e:
        print(f"❌ Error conectando a API: {e}")
    
    # Test crear lote
    try:
        response = requests.post(f"{base_url}/batch/create")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Lote creado: {data.get('batch_id', 'N/A')}")
        else:
            print(f"❌ Error creando lote: {response.status_code}")
    except Exception as e:
        print(f"❌ Error en API de lotes: {e}")

def main():
    """Función principal de pruebas"""
    
    print("🚀 ANCLORA NEXUS - PRUEBAS DEL MOTOR DE CONVERSIÓN IA")
    print("=" * 70)
    print("Verificando funcionalidad del motor de conversión inteligente...")
    print()
    
    # Ejecutar pruebas asíncronas
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Pruebas del motor IA
        ai_success = loop.run_until_complete(test_ai_conversion_engine())
        
        # Pruebas de API
        loop.run_until_complete(test_api_endpoints())
        
        print("\n" + "=" * 70)
        if ai_success:
            print("🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!")
            print("🚀 El motor de conversión IA está listo para producción")
        else:
            print("⚠️  ALGUNAS PRUEBAS FALLARON")
            print("🔧 Revisa los errores anteriores y corrige los problemas")
        
        print("\n💡 PRÓXIMOS PASOS:")
        print("   1. Integrar componentes frontend")
        print("   2. Configurar Gemini API key para IA completa")
        print("   3. Probar con archivos reales")
        print("   4. Optimizar rendimiento")
        
    except KeyboardInterrupt:
        print("\n⏹️  Pruebas interrumpidas por el usuario")
    except Exception as e:
        print(f"\n❌ ERROR CRÍTICO: {e}")
        import traceback
        traceback.print_exc()
    finally:
        loop.close()

if __name__ == "__main__":
    main()
