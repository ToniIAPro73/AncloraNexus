from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from src.models.user import User, Conversion, CreditTransaction, db
from src.models.conversion import conversion_engine

# Importar motor mejorado si está disponible
try:
    from src.models.conversion_engine_enhanced import enhanced_conversion_engine
    ENHANCED_ENGINE_AVAILABLE = True
except ImportError:
    ENHANCED_ENGINE_AVAILABLE = False

# Importar sistema de créditos
try:
    from src.services.credit_system import credit_calculator
    CREDIT_SYSTEM_AVAILABLE = True
except ImportError:
    CREDIT_SYSTEM_AVAILABLE = False

# Importar sistemas de validación y mensajes
try:
    from src.services.file_validator import file_validator
    from src.services.integrity_checker import integrity_checker
    from src.services.error_messages import error_translator
    VALIDATION_SYSTEMS_AVAILABLE = True
except ImportError:
    VALIDATION_SYSTEMS_AVAILABLE = False

# Importar optimizador de conversiones
try:
    from src.services.conversion_optimizer import conversion_optimizer
    OPTIMIZER_AVAILABLE = True
except ImportError:
    OPTIMIZER_AVAILABLE = False, validate_and_classify
from src.models.conversion_history import ConversionHistory
from src.models.conversion_log import ConversionLog
import os
import uuid
from datetime import datetime
import time
import hashlib
import shutil
from pathlib import Path
from src.ws import emit_progress, Phase
# Importar motor de IA si está disponible
try:
    from src.services.ai_conversion_engine import ai_conversion_engine
    AI_ENGINE_AVAILABLE = True
except ImportError:
    AI_ENGINE_AVAILABLE = False
    ai_conversion_engine = None
from src.services.intelligent_conversion_sequences import intelligent_sequences
from src.services.ai_quality_assessment import ai_quality_assessor
from src.services.file_preview_service import file_preview_service
from src.services.batch_download_service import batch_download_service

conversion_bp = Blueprint('conversion', __name__)

# Use Windows-compatible paths
import tempfile
TEMP_DIR = tempfile.gettempdir()
UPLOAD_FOLDER = os.path.join(TEMP_DIR, 'anclora_uploads')
OUTPUT_FOLDER = os.path.join(TEMP_DIR, 'anclora_outputs')
BACKUP_FOLDER = Path(__file__).resolve().parents[2] / 'backups'

# Crear directorios si no existen
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
BACKUP_FOLDER.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif',
    'html', 'md', 'rtf', 'odt', 'tex', 'epub', 'csv', 'json',
    'webp', 'tiff', 'tif', 'rst', 'svg', 'bmp'
}

def allowed_file(filename):
    """Verifica si el archivo tiene una extensiÃ³n permitida"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@conversion_bp.route('/supported-formats', methods=['GET'])
def get_supported_formats():
    """Obtiene todos los formatos soportados"""
    try:
        # Obtener formatos del motor de conversión
        supported = conversion_engine.get_all_supported_formats()

        return jsonify({
            'success': True,
            'supported_conversions': conversion_engine.supported_conversions,
            'input': sorted(list(supported['input'])),
            'output': sorted(list(supported['output'])),
            'total_input': len(supported['input']),
            'total_output': len(supported['output']),
            'allowed_extensions': list(ALLOWED_EXTENSIONS),
            'new_formats': ['csv', 'json', 'epub', 'rtf', 'odt', 'webp', 'tiff', 'bmp']
        }), 200

    except Exception as e:
        return jsonify({'error': f'Error obteniendo formatos: {str(e)}'}), 500

# Alias para compatibilidad
@conversion_bp.route('/formats', methods=['GET'])
def get_formats_alias():
    """Alias para /supported-formats"""
    return get_supported_formats()

@conversion_bp.route('/analyze-conversion', methods=['POST'])
def analyze_conversion():
    """Analiza opciones de conversión directa vs optimizada"""
    try:
        data = request.get_json()
        source_format = data.get('source_format', '').lower()
        target_format = data.get('target_format', '').lower()

        if not source_format or not target_format:
            return jsonify({'error': 'Se requieren source_format y target_format'}), 400

        # Verificar que la conversión sea soportada
        if source_format not in conversion_engine.supported_conversions:
            return jsonify({'error': f'Formato de origen {source_format} no soportado'}), 400

        if target_format not in conversion_engine.supported_conversions.get(source_format, {}):
            return jsonify({'error': f'Conversión {source_format}→{target_format} no soportada'}), 400

        # Obtener costo base
        base_cost = conversion_engine.supported_conversions[source_format][target_format]

        # Análisis de opciones si el optimizador está disponible
        if OPTIMIZER_AVAILABLE:
            analysis = conversion_optimizer.analyze_conversion_options(source_format, target_format, base_cost)
            compatibility = conversion_optimizer.get_format_compatibility_score(source_format, target_format)

            return jsonify({
                'success': True,
                'source_format': source_format,
                'target_format': target_format,
                'analysis': analysis,
                'compatibility': compatibility,
                'has_optimized_sequence': analysis.get('optimized') is not None
            })
        else:
            # Análisis básico sin optimizador
            return jsonify({
                'success': True,
                'source_format': source_format,
                'target_format': target_format,
                'analysis': {
                    'direct': {
                        'cost': base_cost,
                        'quality': 75,
                        'description': f'Conversión directa {source_format.upper()} → {target_format.upper()}',
                        'recommended': True
                    }
                },
                'has_optimized_sequence': False
            })

    except Exception as e:
        return jsonify({'error': f'Error analizando conversión: {str(e)}'}), 500

@conversion_bp.route('/guest-convert', methods=['POST'])
def guest_convert_file():
    """Convierte un archivo sin autenticación (para usuarios invitados)"""
    try:
        # Verificar archivo
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó ningún archivo'}), 400

        file = request.files['file']
        target_format = request.form.get('target_format')
        conversion_type = request.form.get('conversion_type', 'direct')  # 'direct' o 'optimized'
        conversion_sequence = request.form.get('conversion_sequence')  # JSON string con secuencia

        if not file.filename or not target_format:
            return jsonify({'error': 'Archivo y formato destino son requeridos'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipo de archivo no soportado'}), 400

        # Validar tamaño del archivo (máximo 10MB para invitados)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)

        max_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_size:
            return jsonify({'error': 'Archivo demasiado grande. Máximo 10MB para invitados'}), 400

        # Obtener información del archivo
        filename = secure_filename(file.filename)
        source_format = filename.rsplit('.', 1)[1].lower()

        # Validar que la conversión sea soportada
        if source_format not in conversion_engine.supported_conversions:
            return jsonify({'error': f'Formato de origen {source_format} no soportado'}), 400

        if target_format not in conversion_engine.supported_conversions.get(source_format, {}):
            return jsonify({'error': f'Conversión {source_format} → {target_format} no soportada'}), 400

        # Guardar archivo de entrada
        input_path = os.path.join(UPLOAD_FOLDER, f"guest_{uuid.uuid4()}_{filename}")
        file.save(input_path)

        try:
            # VALIDACIÓN ESTRICTA INTEGRADA
            if VALIDATION_SYSTEMS_AVAILABLE:
                # 1. Validación completa del archivo
                is_valid, validation_message, validation_details = file_validator.validate_file_comprehensive(
                    input_path, source_format
                )

                if not is_valid:
                    # Limpiar archivo temporal
                    if os.path.exists(input_path):
                        os.remove(input_path)

                    # Generar mensaje de error amigable
                    error_info = error_translator.get_validation_error_message(validation_message, source_format)
                    formatted_error = error_translator.format_error_response(error_info)

                    return jsonify({
                        'success': False,
                        'error': formatted_error,
                        'error_code': error_info['error_code'],
                        'validation_details': validation_details
                    }), 400

                # 2. Verificación de integridad pre-conversión
                integrity_valid, integrity_message, integrity_details = integrity_checker.pre_conversion_check(
                    input_path, source_format, target_format
                )

                if not integrity_valid:
                    # Limpiar archivo temporal
                    if os.path.exists(input_path):
                        os.remove(input_path)

                    error_info = error_translator.translate_error(integrity_message, source_format, target_format)
                    formatted_error = error_translator.format_error_response(error_info)

                    return jsonify({
                        'success': False,
                        'error': formatted_error,
                        'error_code': error_info['error_code'],
                        'integrity_details': integrity_details
                    }), 400
            # Preparar archivo de salida
            output_filename = f"{filename.rsplit('.', 1)[0]}.{target_format}"
            output_path = os.path.join(OUTPUT_FOLDER, f"guest_{uuid.uuid4()}_{output_filename}")

            # Realizar conversión (directa o con secuencia)
            start_time = time.time()

            # Información adicional para el resultado
            conversion_info = {
                'type': conversion_type,
                'sequence': None
            }

            if conversion_type == 'optimized' and conversion_sequence:
                # Procesar secuencia optimizada
                import json
                try:
                    sequence_steps = json.loads(conversion_sequence)
                    conversion_info['sequence'] = sequence_steps
                    # Por ahora, usar conversión directa pero registrar la secuencia
                    # TODO: Implementar conversión por pasos en el futuro
                    success, message = conversion_engine.convert_file(
                        input_path, output_path, source_format, target_format
                    )
                except json.JSONDecodeError:
                    # Si hay error en JSON, usar conversión directa
                    conversion_info['type'] = 'direct'
                    success, message = conversion_engine.convert_file(
                        input_path, output_path, source_format, target_format
                    )
            else:
                # Conversión directa
                success, message = conversion_engine.convert_file(
                    input_path, output_path, source_format, target_format
                )

            processing_time = time.time() - start_time

            if success and os.path.exists(output_path):
                # Extraer el ID del nombre del archivo generado
                filename_parts = os.path.basename(output_path).split('_')
                if len(filename_parts) >= 2 and filename_parts[0] == 'guest':
                    download_id = filename_parts[1]
                else:
                    # Fallback: crear nuevo ID y renombrar archivo
                    download_id = str(uuid.uuid4())
                    new_output_path = os.path.join(OUTPUT_FOLDER, f"guest_{download_id}_{output_filename}")
                    shutil.move(output_path, new_output_path)

                return jsonify({
                    'success': True,
                    'message': 'Conversión completada exitosamente',
                    'download_id': download_id,
                    'output_filename': output_filename,
                    'processing_time': round(processing_time, 2),
                    'file_size': os.path.getsize(output_path),
                    'download_url': f'/api/conversion/guest-download/{download_id}',
                    'conversion_type': conversion_info['type'],
                    'conversion_sequence': conversion_info['sequence']
                }), 200
            else:
                # Usar traductor de errores si está disponible
                if VALIDATION_SYSTEMS_AVAILABLE:
                    error_info = error_translator.translate_error(message, source_format, target_format)
                    formatted_error = error_translator.format_error_response(error_info)

                    return jsonify({
                        'success': False,
                        'error': formatted_error,
                        'error_code': error_info['error_code'],
                        'technical_details': message
                    }), 500
                else:
                    return jsonify({
                        'success': False,
                        'error': f'Error en la conversión: {message}'
                    }), 500

        except Exception as e:
            # Usar traductor de errores si está disponible
            if VALIDATION_SYSTEMS_AVAILABLE:
                error_info = error_translator.translate_error(str(e), source_format, target_format)
                formatted_error = error_translator.format_error_response(error_info)

                return jsonify({
                    'success': False,
                    'error': formatted_error,
                    'error_code': error_info['error_code'],
                    'technical_details': str(e)
                }), 500
            else:
                return jsonify({
                    'error': f'Error durante la conversión: {str(e)}'
                }), 500

        finally:
            # Limpiar archivo de entrada
            if os.path.exists(input_path):
                os.remove(input_path)

    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@conversion_bp.route('/analyze-file', methods=['POST'])
@jwt_required()
def analyze_file():
    """Analiza un archivo y proporciona recomendaciones"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar que se subiÃ³ un archivo
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionÃ³ ningÃºn archivo'}), 400
        
        file = request.files['file']
        if not file.filename or file.filename == '':
            return jsonify({'error': 'No se seleccionÃ³ ningÃºn archivo'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipo de archivo no soportado'}), 400
        
        # Guardar archivo temporalmente
        filename = secure_filename(file.filename or "")
        temp_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}_{filename}")
        file.save(temp_path)
        
        try:
            classification = validate_and_classify(temp_path)
            # Validar archivo
            is_valid, message = conversion_engine.validate_file(temp_path)
            if not is_valid:
                return jsonify({'error': message, 'classification': classification}), 400

            # Analizar archivo
            analysis = conversion_engine.analyze_file(temp_path, filename)
            analysis['classification'] = classification
            
            # AÃ±adir informaciÃ³n de costos
            source_format = analysis['extension']
            cost_info = {}
            for target_format in analysis['supported_formats']:
                cost_info[target_format] = conversion_engine.get_conversion_cost(
                    source_format, target_format
                )
            
            analysis['conversion_costs'] = cost_info
            analysis['user_credits'] = user.credits
            
            return jsonify({
                'analysis': analysis,
                'message': 'Archivo analizado exitosamente'
            }), 200
            
        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@conversion_bp.route('/convert', methods=['POST'])
@jwt_required()
def convert_file():
    """Convierte un archivo al formato especificado"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar archivo
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionÃ³ ningÃºn archivo'}), 400
        
        file = request.files['file']
        target_format = request.form.get('target_format')
        
        if not file.filename or not target_format:
            return jsonify({'error': 'Archivo y formato destino son requeridos'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipo de archivo no soportado'}), 400
        
        # Obtener formato origen
        filename = secure_filename(file.filename)
        source_format = filename.rsplit('.', 1)[1].lower()
        
        # Verificar que la conversiÃ³n estÃ© soportada
        if target_format not in conversion_engine.get_supported_formats(source_format):
            return jsonify({'error': f'ConversiÃ³n {source_format} â†’ {target_format} no soportada'}), 400
        
        # Calcular costo
        credits_needed = conversion_engine.get_conversion_cost(source_format, target_format)
        
        # Verificar crÃ©ditos suficientes
        if user.credits < credits_needed:
            return jsonify({
                'error': 'CrÃ©ditos insuficientes',
                'credits_needed': credits_needed,
                'credits_available': user.credits
            }), 402
        
        # Guardar archivo de entrada
        input_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}_{filename}")
        file.save(input_path)
        
        # Crear registro de conversiÃ³n
        conversion = Conversion(
            user_id=user.id,
            original_filename=filename,
            original_format=source_format,
            target_format=target_format,
            file_size=os.path.getsize(input_path),
            conversion_type=f"{source_format}-{target_format}",
            credits_used=credits_needed,
            status='pending'
        )
        
        db.session.add(conversion)
        db.session.flush()  # Para obtener el ID
        emit_progress(conversion.id, Phase.PREPROCESS, 0)

        try:
            emit_progress(conversion.id, Phase.PREPROCESS, 100)
            emit_progress(conversion.id, Phase.CONVERT, 0)

            # Preparar archivo de salida
            output_filename = f"{filename.rsplit('.', 1)[0]}.{target_format}"
            output_path = os.path.join(OUTPUT_FOLDER, f"{uuid.uuid4()}_{output_filename}")

            # Realizar conversiÃ³n
            start_time = time.time()
            success, message = conversion_engine.convert_file(
                input_path, output_path, source_format, target_format
            )
            emit_progress(conversion.id, Phase.CONVERT, 100)
            emit_progress(conversion.id, Phase.POSTPROCESS, 0)
            processing_time = time.time() - start_time
            
            if success:
                # Guardar hash del archivo original y crear backup
                with open(input_path, 'rb') as f:
                    original_hash = hashlib.sha256(f.read()).hexdigest()
                backup_filename = f"{conversion.id}_{filename}"
                backup_path = BACKUP_FOLDER / backup_filename
                shutil.copy(input_path, backup_path)

                # Consumir crÃ©ditos
                user.consume_credits(credits_needed)

                # Registrar transacciÃ³n de crÃ©ditos
                transaction = CreditTransaction(
                    user_id=user.id,
                    amount=-credits_needed,
                    transaction_type='conversion',
                    description=f'ConversiÃ³n {source_format} â†’ {target_format}',
                    conversion_id=conversion.id
                )
                db.session.add(transaction)

                # Registrar log de conversiÃ³n
                log = ConversionLog(
                    conversion_id=conversion.id,
                    file_hash=original_hash,
                    output_path=output_path,
                    backup_path=str(backup_path)
                )
                db.session.add(log)

                # Actualizar conversiÃ³n
                conversion.status = 'completed'
                conversion.processing_time = processing_time
                conversion.completed_at = datetime.utcnow()
                conversion.output_filename = output_filename
                db.session.commit()
                emit_progress(conversion.id, Phase.POSTPROCESS, 100)

                return jsonify({
                    'message': 'ConversiÃ³n completada exitosamente',
                    'conversion': conversion.to_dict(),
                    'download_url': f'/api/download/{conversion.id}',
                    'user_credits_remaining': user.credits
                }), 200
                
            else:
                # Error en conversiÃ³n
                conversion.status = 'failed'
                conversion.error_message = message
                conversion.processing_time = processing_time
                conversion.completed_at = datetime.utcnow()
                db.session.commit()
                emit_progress(conversion.id, Phase.POSTPROCESS, 100)

                return jsonify({
                    'error': f'Error en la conversiÃ³n: {message}',
                    'conversion': conversion.to_dict()
                }), 500
                
        except Exception as e:
            # Error durante el proceso
            conversion.status = 'failed'
            conversion.error_message = str(e)
            processing_time = time.time() - start_time if 'start_time' in locals() else None
            conversion.processing_time = processing_time
            conversion.completed_at = datetime.utcnow()
            db.session.commit()
            emit_progress(conversion.id, Phase.POSTPROCESS, 100)

            return jsonify({
                'error': f'Error durante la conversiÃ³n: {str(e)}',
                'conversion': conversion.to_dict()
            }), 500
            
        finally:
            # Limpiar archivos temporales
            if os.path.exists(input_path):
                os.remove(input_path)
                
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500


@conversion_bp.route('/conversions/<int:conversion_id>', methods=['DELETE'])
@jwt_required()
def undo_conversion(conversion_id):
    """Restaura el archivo original desde el backup"""
    try:
        user_id = get_jwt_identity()
        conversion = Conversion.query.filter_by(id=conversion_id, user_id=user_id).first()
        if not conversion:
            return jsonify({'error': 'ConversiÃ³n no encontrada'}), 404

        log = ConversionLog.query.filter_by(conversion_id=conversion_id).first()
        if not log or not os.path.exists(log.backup_path):
            return jsonify({'error': 'Backup no disponible'}), 404

        shutil.copy(log.backup_path, log.output_path)

        return jsonify({'message': 'ConversiÃ³n revertida', 'conversion_id': conversion_id}), 200
    except Exception as e:
        return jsonify({'error': f'Error al restaurar: {str(e)}'}), 500

@conversion_bp.route('/download/<int:conversion_id>', methods=['GET'])
@jwt_required()
def download_file(conversion_id):
    """Descarga el archivo convertido"""
    try:
        user_id = get_jwt_identity()
        
        # Buscar conversiÃ³n
        conversion = Conversion.query.filter_by(
            id=conversion_id,
            user_id=user_id
        ).first()
        
        if not conversion:
            return jsonify({'error': 'ConversiÃ³n no encontrada'}), 404
        
        if conversion.status != 'completed':
            return jsonify({'error': 'La conversiÃ³n no estÃ¡ completada'}), 400
        
        # Buscar archivo de salida
        output_path = os.path.join(OUTPUT_FOLDER, f"*_{conversion.output_filename}")
        import glob
        files = glob.glob(output_path)
        
        if not files or not os.path.exists(files[0]):
            return jsonify({'error': 'Archivo no encontrado o expirado'}), 404
        
        return send_file(
            files[0],
            as_attachment=True,
            download_name=conversion.output_filename
        )

    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@conversion_bp.route('/guest-download/<download_id>', methods=['GET'])
def guest_download_file(download_id):
    """Descarga archivo convertido para invitados"""
    try:
        # Buscar archivos que coincidan con el patrón de invitado
        import glob
        pattern = os.path.join(OUTPUT_FOLDER, f"guest_{download_id}_*")
        files = glob.glob(pattern)

        if not files:
            # Intentar buscar con patrón más amplio
            pattern2 = os.path.join(OUTPUT_FOLDER, f"*{download_id}*")
            files = glob.glob(pattern2)

        if not files or not os.path.exists(files[0]):
            # Debug: listar archivos en el directorio
            all_files = os.listdir(OUTPUT_FOLDER) if os.path.exists(OUTPUT_FOLDER) else []
            print(f"DEBUG: Buscando {download_id}, archivos disponibles: {all_files[:5]}")
            return jsonify({'error': 'Archivo no encontrado o expirado'}), 404

        file_path = files[0]
        filename = os.path.basename(file_path)

        # Limpiar nombre del archivo
        if filename.startswith('guest_'):
            parts = filename.split('_', 2)
            if len(parts) >= 3:
                filename = parts[2]

        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@conversion_bp.route('/ai-analyze', methods=['POST'])
def ai_analyze_file():
    """Análisis inteligente de archivo con IA"""
    if not AI_ENGINE_AVAILABLE:
        return jsonify({'error': 'Motor de IA no disponible. Instale: pip install google-generativeai'}), 503

    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó ningún archivo'}), 400

        file = request.files['file']
        if not file.filename:
            return jsonify({'error': 'Nombre de archivo requerido'}), 400

        # Guardar archivo temporal para análisis
        filename = secure_filename(file.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, f"analyze_{uuid.uuid4()}_{filename}")
        file.save(temp_path)

        try:
            # Análisis inteligente con IA (usando asyncio para ejecutar funciones async)
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                file_analysis = loop.run_until_complete(
                    ai_conversion_engine.analyze_file_with_ai(temp_path, filename)
                )

                # Generar recomendaciones inteligentes
                smart_recommendations = loop.run_until_complete(
                    ai_quality_assessor.generate_smart_recommendations(temp_path, filename)
                )
            finally:
                loop.close()

            return jsonify({
                'success': True,
                'analysis': {
                    'file_type': file_analysis.file_type,
                    'content_type': file_analysis.content_type,
                    'complexity_level': file_analysis.complexity_level,
                    'quality_indicators': file_analysis.quality_indicators,
                    'metadata_richness': file_analysis.metadata_richness,
                    'security_level': file_analysis.security_level,
                    'ai_recommendations': file_analysis.ai_recommendations,
                    'optimal_targets': file_analysis.optimal_targets
                },
                'smart_recommendations': [
                    {
                        'target_format': rec.target_format,
                        'use_case': rec.use_case,
                        'quality_prediction': rec.quality_prediction,
                        'speed_prediction': rec.speed_prediction,
                        'cost_efficiency': rec.cost_efficiency,
                        'ai_reasoning': rec.ai_reasoning,
                        'best_for': rec.best_for,
                        'avoid_if': rec.avoid_if
                    } for rec in smart_recommendations
                ],
                'message': 'Análisis IA completado exitosamente'
            }), 200

        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        return jsonify({'error': f'Error en análisis IA: {str(e)}'}), 500

@conversion_bp.route('/ai-conversion-paths', methods=['POST'])
def get_ai_conversion_paths():
    """Obtiene rutas de conversión optimizadas con IA"""
    if not AI_ENGINE_AVAILABLE:
        return jsonify({'error': 'Motor de IA no disponible. Instale: pip install google-generativeai'}), 503

    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó ningún archivo'}), 400

        file = request.files['file']
        target_format = request.form.get('target_format')

        if not file.filename or not target_format:
            return jsonify({'error': 'Archivo y formato destino son requeridos'}), 400

        # Guardar archivo temporal
        filename = secure_filename(file.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, f"paths_{uuid.uuid4()}_{filename}")
        file.save(temp_path)

        try:
            # Análisis del archivo (usando asyncio)
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                file_analysis = loop.run_until_complete(
                    ai_conversion_engine.analyze_file_with_ai(temp_path, filename)
                )
                source_format = filename.split('.')[-1].lower()

                # Obtener rutas optimizadas
                optimal_paths = loop.run_until_complete(
                    ai_conversion_engine.get_optimal_conversion_paths(
                        source_format, target_format, file_analysis
                    )
                )
            finally:
                loop.close()

            # Generar vista previa de secuencias
            sequence_previews = []
            for path in optimal_paths:
                preview = intelligent_sequences.get_sequence_preview(path)
                sequence_previews.append(preview)

            return jsonify({
                'success': True,
                'source_format': source_format,
                'target_format': target_format,
                'file_analysis': {
                    'content_type': file_analysis.content_type,
                    'complexity_level': file_analysis.complexity_level,
                    'ai_recommendations': file_analysis.ai_recommendations
                },
                'conversion_paths': sequence_previews,
                'message': 'Rutas de conversión IA generadas exitosamente'
            }), 200

        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        return jsonify({'error': f'Error generando rutas IA: {str(e)}'}), 500

@conversion_bp.route('/ai-convert-intelligent', methods=['POST'])
def ai_convert_intelligent():
    """Conversión inteligente con secuencias optimizadas por IA"""
    if not AI_ENGINE_AVAILABLE:
        return jsonify({'error': 'Motor de IA no disponible. Instale: pip install google-generativeai'}), 503

    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó ningún archivo'}), 400

        file = request.files['file']
        target_format = request.form.get('target_format')
        sequence_id = request.form.get('sequence_id')  # ID de secuencia seleccionada
        optimization_type = request.form.get('optimization', 'balanced')  # 'quality', 'speed', 'balanced'

        if not file.filename or not target_format:
            return jsonify({'error': 'Archivo y formato destino son requeridos'}), 400

        # Validar archivo
        filename = secure_filename(file.filename)
        source_format = filename.split('.')[-1].lower()

        # Guardar archivo de entrada
        input_path = os.path.join(UPLOAD_FOLDER, f"ai_{uuid.uuid4()}_{filename}")
        file.save(input_path)

        try:
            # Análisis inteligente del archivo (usando asyncio)
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                file_analysis = loop.run_until_complete(
                    ai_conversion_engine.analyze_file_with_ai(input_path, filename)
                )

                # Obtener rutas de conversión optimizadas
                conversion_paths = loop.run_until_complete(
                    intelligent_sequences.analyze_and_recommend_sequence(
                        input_path, filename, target_format
                    )
                )
            finally:
                loop.close()

            if not conversion_paths:
                return jsonify({'error': 'No se encontraron rutas de conversión válidas'}), 400

            # Seleccionar ruta basada en optimización solicitada
            selected_path = None
            if sequence_id:
                # Buscar secuencia específica por ID
                for path in conversion_paths:
                    if f"seq_{hash(str(path))}" == sequence_id:
                        selected_path = path
                        break

            if not selected_path:
                # Seleccionar automáticamente basado en tipo de optimización
                if optimization_type == 'quality':
                    selected_path = max(conversion_paths, key=lambda p: p.quality_score)
                elif optimization_type == 'speed':
                    selected_path = max(conversion_paths, key=lambda p: p.speed_score)
                else:  # balanced
                    selected_path = max(conversion_paths, key=lambda p:
                        (p.quality_score * 0.5 + p.speed_score * 0.3 + p.ai_confidence * 0.2))

            # Ejecutar secuencia inteligente (usando asyncio)
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                sequence_result = loop.run_until_complete(
                    intelligent_sequences.execute_intelligent_sequence(
                        input_path, target_format, selected_path
                    )
                )
            finally:
                loop.close()

            if sequence_result.success:
                # Generar ID único para descarga
                download_id = str(uuid.uuid4())
                output_filename = f"{filename.rsplit('.', 1)[0]}.{target_format}"

                # Mover archivo final a directorio de salida
                final_output_path = os.path.join(OUTPUT_FOLDER, f"ai_{download_id}_{output_filename}")
                shutil.move(sequence_result.final_output_path, final_output_path)

                return jsonify({
                    'success': True,
                    'message': 'Conversión IA completada exitosamente',
                    'download_id': download_id,
                    'output_filename': output_filename,
                    'processing_time': sequence_result.total_time,
                    'quality_score': sequence_result.quality_score,
                    'steps_completed': sequence_result.steps_completed,
                    'optimization_used': optimization_type,
                    'sequence_description': selected_path.description,
                    'ai_confidence': selected_path.ai_confidence,
                    'conversion_logs': sequence_result.logs,
                    'download_url': f'/api/conversion/ai-download/{download_id}',
                    'file_size': os.path.getsize(final_output_path)
                }), 200
            else:
                return jsonify({
                    'error': f'Error en conversión IA: {sequence_result.error_message}',
                    'steps_completed': sequence_result.steps_completed,
                    'logs': sequence_result.logs
                }), 500

        finally:
            # Limpiar archivo de entrada
            if os.path.exists(input_path):
                os.remove(input_path)

    except Exception as e:
        return jsonify({'error': f'Error interno en conversión IA: {str(e)}'}), 500

@conversion_bp.route('/ai-download/<download_id>', methods=['GET'])
def ai_download_file(download_id):
    """Descarga archivo convertido con IA"""
    try:
        import glob
        pattern = os.path.join(OUTPUT_FOLDER, f"ai_{download_id}_*")
        files = glob.glob(pattern)

        if not files or not os.path.exists(files[0]):
            return jsonify({'error': 'Archivo no encontrado o expirado'}), 404

        file_path = files[0]
        filename = os.path.basename(file_path).split('_', 2)[-1]  # Remover prefijo ai_uuid_

        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@conversion_bp.route('/preview', methods=['POST'])
def generate_file_preview():
    """Genera vista previa de archivo"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó ningún archivo'}), 400

        file = request.files['file']
        preview_quality = request.form.get('quality', 'medium')  # 'low', 'medium', 'high'

        if not file.filename:
            return jsonify({'error': 'Nombre de archivo requerido'}), 400

        # Validar tamaño para preview (máximo 20MB)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)

        max_preview_size = 20 * 1024 * 1024  # 20MB
        if file_size > max_preview_size:
            return jsonify({'error': 'Archivo demasiado grande para preview. Máximo 20MB'}), 400

        # Guardar archivo temporal
        filename = secure_filename(file.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, f"preview_{uuid.uuid4()}_{filename}")
        file.save(temp_path)

        try:
            # Obtener capacidades de preview
            capabilities = file_preview_service.get_preview_capabilities(filename)

            # Generar preview (usando asyncio)
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                preview_data = loop.run_until_complete(
                    file_preview_service.generate_preview(temp_path, filename, preview_quality)
                )
            finally:
                loop.close()

            return jsonify({
                'success': True,
                'preview': {
                    'type': preview_data.preview_type,
                    'content': preview_data.content,
                    'metadata': preview_data.metadata,
                    'page_count': preview_data.page_count,
                    'dimensions': preview_data.dimensions,
                    'quality': preview_data.preview_quality
                },
                'file_info': preview_data.file_info,
                'capabilities': capabilities,
                'message': 'Preview generado exitosamente'
            }), 200

        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        return jsonify({'error': f'Error generando preview: {str(e)}'}), 500

@conversion_bp.route('/batch/create', methods=['POST'])
def create_batch_download():
    """Crea un nuevo lote de descarga"""
    try:
        batch_id = batch_download_service.create_batch()

        return jsonify({
            'success': True,
            'batch_id': batch_id,
            'message': 'Lote de descarga creado exitosamente'
        }), 200

    except Exception as e:
        return jsonify({'error': f'Error creando lote: {str(e)}'}), 500

@conversion_bp.route('/batch/<batch_id>/add', methods=['POST'])
def add_file_to_batch(batch_id):
    """Agrega archivo convertido al lote"""
    try:
        data = request.get_json()

        required_fields = ['file_path', 'original_filename', 'converted_filename', 'conversion_info']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Campos requeridos: file_path, original_filename, converted_filename, conversion_info'}), 400

        success = batch_download_service.add_file_to_batch(
            batch_id,
            data['file_path'],
            data['original_filename'],
            data['converted_filename'],
            data['conversion_info']
        )

        if success:
            batch_info = batch_download_service.get_batch_info(batch_id)
            return jsonify({
                'success': True,
                'batch_info': batch_info,
                'message': 'Archivo agregado al lote exitosamente'
            }), 200
        else:
            return jsonify({'error': 'No se pudo agregar archivo al lote (límites excedidos o lote no encontrado)'}), 400

    except Exception as e:
        return jsonify({'error': f'Error agregando archivo al lote: {str(e)}'}), 500

@conversion_bp.route('/batch/<batch_id>/prepare', methods=['POST'])
async def prepare_batch_zip(batch_id):
    """Prepara el ZIP del lote para descarga"""
    try:
        def progress_callback(progress, message):
            # Aquí podrías emitir progreso via WebSocket si es necesario
            print(f"Batch {batch_id}: {progress:.1f}% - {message}")

        success = await batch_download_service.prepare_batch_zip(batch_id, progress_callback)

        if success:
            batch_info = batch_download_service.get_batch_info(batch_id)
            return jsonify({
                'success': True,
                'batch_info': batch_info,
                'download_url': f'/api/conversion/batch/{batch_id}/download',
                'message': 'Lote preparado para descarga'
            }), 200
        else:
            return jsonify({'error': 'No se pudo preparar el lote'}), 400

    except Exception as e:
        return jsonify({'error': f'Error preparando lote: {str(e)}'}), 500

@conversion_bp.route('/batch/<batch_id>/download', methods=['GET'])
def download_batch_zip(batch_id):
    """Descarga el ZIP del lote"""
    try:
        zip_path = batch_download_service.get_batch_zip_path(batch_id)

        if not zip_path:
            return jsonify({'error': 'Lote no encontrado, no está listo o ha expirado'}), 404

        return send_file(
            zip_path,
            as_attachment=True,
            download_name=f"anclora_batch_{batch_id}.zip"
        )

    except Exception as e:
        return jsonify({'error': f'Error descargando lote: {str(e)}'}), 500

@conversion_bp.route('/batch/<batch_id>/info', methods=['GET'])
def get_batch_info(batch_id):
    """Obtiene información del lote"""
    try:
        batch_info = batch_download_service.get_batch_info(batch_id)

        if not batch_info:
            return jsonify({'error': 'Lote no encontrado'}), 404

        return jsonify({
            'success': True,
            'batch_info': batch_info
        }), 200

    except Exception as e:
        return jsonify({'error': f'Error obteniendo información del lote: {str(e)}'}), 500

@conversion_bp.route('/batch/stats', methods=['GET'])
def get_batch_statistics():
    """Obtiene estadísticas de lotes"""
    try:
        stats = batch_download_service.get_batch_statistics()

        return jsonify({
            'success': True,
            'statistics': stats
        }), 200

    except Exception as e:
        return jsonify({'error': f'Error obteniendo estadísticas: {str(e)}'}), 500

@conversion_bp.route('/history', methods=['GET'])
@jwt_required()
def get_conversion_history():
    """Obtiene el historial de conversiones del usuario"""
    try:
        user_id = get_jwt_identity()

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        conv_type = request.args.get('type')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        search = request.args.get('search')

        query = ConversionHistory.query.filter_by(user_id=user_id)
        if conv_type:
            query = query.filter(ConversionHistory.conversion_type == conv_type)
        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date)
                query = query.filter(ConversionHistory.created_at >= start_dt)
            except ValueError:
                pass
        if end_date:
            try:
                end_dt = datetime.fromisoformat(end_date)
                query = query.filter(ConversionHistory.created_at <= end_dt)
            except ValueError:
                pass
        if search:
            query = query.filter(ConversionHistory.original_filename.ilike(f"%{search}%"))

        conversions = query.order_by(ConversionHistory.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify({
            'conversions': [conv.to_dict() for conv in conversions.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': conversions.total,
                'pages': conversions.pages,
                'has_next': conversions.has_next,
                'has_prev': conversions.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@conversion_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_conversion_stats():
    """Obtiene estadÃ­sticas de conversiones del usuario"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # EstadÃ­sticas bÃ¡sicas
        total_conversions = Conversion.query.filter_by(user_id=user_id).count()
        successful_conversions = Conversion.query.filter_by(
            user_id=user_id, status='completed'
        ).count()
        failed_conversions = Conversion.query.filter_by(
            user_id=user_id, status='failed'
        ).count()
        
        # Conversiones por formato
        from sqlalchemy import func
        format_stats = db.session.query(
            Conversion.conversion_type,
            func.count(Conversion.id).label('count')
        ).filter_by(user_id=user_id, status='completed')\
         .group_by(Conversion.conversion_type)\
         .all()
        
        return jsonify({
            'user_stats': {
                'total_conversions': user.total_conversions,
                'credits_remaining': user.credits,
                'credits_used_today': user.credits_used_today,
                'credits_used_this_month': user.credits_used_this_month,
                'plan': user.plan,
                'plan_info': user.get_plan_info()
            },
            'conversion_stats': {
                'total': total_conversions,
                'successful': successful_conversions,
                'failed': failed_conversions,
                'success_rate': (successful_conversions / total_conversions * 100) if total_conversions > 0 else 0
            },
            'format_stats': [
                {'conversion_type': stat[0], 'count': stat[1]}
                for stat in format_stats
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@conversion_bp.route('/estimate', methods=['POST'])
def estimate_conversion():
    """Estima créditos necesarios para una conversión"""
    try:
        data = request.get_json()
        source_format = data.get('source_format', '').lower()
        target_format = data.get('target_format', '').lower()
        file_size = data.get('file_size', 0)
        quality = data.get('quality', 'standard')

        if not source_format or not target_format:
            return jsonify({'error': 'Formatos source_format y target_format requeridos'}), 400

        # Usar motor mejorado si está disponible
        if ENHANCED_ENGINE_AVAILABLE:
            estimate = enhanced_conversion_engine.get_conversion_estimate_full(
                source_format, target_format, file_size, quality
            )
        elif CREDIT_SYSTEM_AVAILABLE:
            credits, details = credit_calculator.calculate_credits(
                source_format, target_format, file_size, quality
            )
            estimate = {
                'credits_required': credits,
                'calculation_details': details,
                'estimated_time_seconds': 5,
                'recommendations': []
            }
        else:
            # Fallback básico
            cost = conversion_engine.get_conversion_cost(source_format, target_format)
            estimate = {
                'credits_required': cost,
                'estimated_time_seconds': 5,
                'calculation_details': {'base_credits': cost},
                'recommendations': []
            }

        return jsonify({
            'success': True,
            'estimate': estimate
        })

    except Exception as e:
        return jsonify({'error': f'Error calculando estimación: {str(e)}'}), 500

@conversion_bp.route('/csv-preview', methods=['POST'])
def csv_preview():
    """Genera preview de archivo CSV antes de conversión"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó archivo'}), 400

        file = request.files['file']
        if not file.filename or not file.filename.lower().endswith('.csv'):
            return jsonify({'error': 'Se requiere un archivo CSV'}), 400

        # Guardar archivo temporalmente
        filename = secure_filename(file.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, f"preview_{uuid.uuid4()}_{filename}")
        file.save(temp_path)

        try:
            # Importar función de análisis CSV
            sys.path.insert(0, 'src/models/conversions')
            from csv_to_html import analyze_csv_structure

            # Analizar estructura CSV
            analysis = analyze_csv_structure(temp_path)

            if not analysis['is_valid']:
                return jsonify({
                    'success': False,
                    'error': f"CSV inválido: {analysis['error']}"
                }), 400

            # Generar preview
            preview_data = {
                'success': True,
                'analysis': {
                    'row_count': analysis['row_count'],
                    'column_count': analysis['column_count'],
                    'delimiter': analysis['delimiter'],
                    'encoding': analysis['encoding'],
                    'has_header': analysis['has_header'],
                    'data_types': analysis['data_types']
                },
                'preview': analysis['preview'],
                'recommendations': [
                    f"Se detectaron {analysis['row_count']} filas y {analysis['column_count']} columnas",
                    f"Delimitador detectado: '{analysis['delimiter']}'",
                    f"Codificación: {analysis['encoding']}",
                    "La conversión generará una tabla HTML interactiva" if analysis['row_count'] > 0 else ""
                ]
            }

            return jsonify(preview_data)

        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        return jsonify({'error': f'Error generando preview: {str(e)}'}), 500



@conversion_bp.route('/system/pandoc-status', methods=['GET'])
def pandoc_status():
    """Verifica el estado de Pandoc en el sistema"""
    try:
        # Verificar si Pandoc está disponible
        pandoc_available = False
        pandoc_version = None

        try:
            from src.models.conversions.pandoc_engine import pandoc_engine
            pandoc_available = True
            pandoc_version = pandoc_engine.get_pandoc_version()
        except ImportError:
            pass

        return jsonify({
            'available': pandoc_available,
            'version': pandoc_version,
            'supported_formats': {
                'input': list(pandoc_engine.supported_formats['input']) if pandoc_available else [],
                'output': list(pandoc_engine.supported_formats['output']) if pandoc_available else []
            }
        })

    except Exception as e:
        return jsonify({'error': f'Error verificando Pandoc: {str(e)}'}), 500


