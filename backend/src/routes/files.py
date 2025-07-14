from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, jwt_required
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import os
import uuid

from src.models import db
from src.models.file import File
from src.models.user import User
from src.utils.validators import validate_file_upload, validate_conversion_request

files_bp = Blueprint('files', __name__)

@files_bp.route('/upload', methods=['POST'])
def upload_file():
    """Subir archivo para conversión"""
    try:
        # Verificar si hay archivo
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó archivo'}), 400
        
        file = request.files['file']
        target_format = request.form.get('target_format', '').lower().strip()
        quality = request.form.get('quality', 'standard')
        
        # Obtener usuario si está autenticado
        user_id = None
        session_id = None
        
        try:
            user_id = get_jwt_identity()
        except:
            # Usuario anónimo, generar session_id
            session_id = str(uuid.uuid4())
        
        # Validar archivo
        file_validation = validate_file_upload(file)
        if not file_validation['valid']:
            return jsonify({'error': file_validation['message']}), 400
        
        source_format = file_validation['extension']
        
        # Validar conversión
        conversion_validation = validate_conversion_request(source_format, target_format)
        if not conversion_validation['valid']:
            return jsonify({'error': conversion_validation['message']}), 400
        
        # Verificar límites del usuario
        if user_id:
            user = User.query.get(user_id)
            if user and user.current_subscription:
                can_convert, message = user.current_subscription.can_convert()
                if not can_convert:
                    return jsonify({'error': message}), 403
                
                # Verificar tamaño de archivo
                max_size = user.current_subscription.plan.max_file_size_mb
                if file.content_length and file.content_length > max_size * 1024 * 1024:
                    return jsonify({'error': f'El archivo excede el tamaño máximo de {max_size}MB para tu plan'}), 413
        
        # Crear directorio de subida si no existe
        upload_dir = current_app.config.get('UPLOAD_FOLDER', '/tmp/anclora_uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generar nombre único para el archivo
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{secure_filename(file.filename)}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Guardar archivo
        file.save(file_path)
        file_size = os.path.getsize(file_path)
        
        # Determinar tiempo de retención
        retention_hours = 2  # Por defecto para usuarios anónimos
        if user_id:
            user = User.query.get(user_id)
            if user and user.current_subscription:
                retention_hours = user.current_subscription.plan.file_retention_hours
            else:
                retention_hours = 24  # Plan gratuito por defecto
        
        expires_at = datetime.utcnow() + timedelta(hours=retention_hours)
        
        # Crear registro en base de datos
        file_record = File(
            user_id=user_id,
            session_id=session_id,
            original_filename=file.filename,
            original_format=source_format,
            target_format=target_format,
            original_size_bytes=file_size,
            original_file_path=file_path,
            expires_at=expires_at
        )
        
        # Establecer parámetros de conversión
        conversion_params = {
            'quality': quality,
            'timestamp': timestamp
        }
        file_record.set_conversion_parameters(conversion_params)
        
        db.session.add(file_record)
        db.session.commit()
        
        # Actualizar contador de conversiones si es usuario con suscripción
        if user_id and user and user.current_subscription:
            user.current_subscription.increment_conversions_used()
            user.update_activity_streak()
            db.session.commit()
        
        # En una implementación real, aquí se iniciaría el proceso de conversión asíncrono
        # Por ahora, simularemos que la conversión se completa inmediatamente
        file_record.conversion_status = 'completed'
        file_record.conversion_started_at = datetime.utcnow()
        file_record.conversion_completed_at = datetime.utcnow()
        file_record.converted_file_path = file_path  # En realidad sería el archivo convertido
        file_record.converted_size_bytes = file_size  # En realidad sería el tamaño del archivo convertido
        db.session.commit()
        
        return jsonify({
            'message': 'Archivo subido y convertido exitosamente',
            'file': file_record.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error subiendo archivo: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@files_bp.route('/history', methods=['GET'])
@jwt_required()
def get_file_history():
    """Obtener historial de archivos del usuario"""
    try:
        current_user_id = get_jwt_identity()
        
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        files_query = File.query.filter_by(user_id=current_user_id).order_by(File.created_at.desc())
        
        # Filtros opcionales
        status = request.args.get('status')
        if status:
            files_query = files_query.filter_by(conversion_status=status)
        
        format_filter = request.args.get('format')
        if format_filter:
            files_query = files_query.filter_by(target_format=format_filter.lower())
        
        # Paginación
        files_paginated = files_query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'files': [file.to_dict() for file in files_paginated.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': files_paginated.total,
                'pages': files_paginated.pages,
                'has_next': files_paginated.has_next,
                'has_prev': files_paginated.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo historial de archivos: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@files_bp.route('/<file_id>', methods=['GET'])
def get_file_info(file_id):
    """Obtener información de un archivo específico"""
    try:
        file_record = File.query.get(file_id)
        
        if not file_record:
            return jsonify({'error': 'Archivo no encontrado'}), 404
        
        # Verificar permisos
        user_id = None
        session_id = None
        
        try:
            user_id = get_jwt_identity()
        except:
            session_id = request.headers.get('X-Session-ID')
        
        if file_record.user_id and file_record.user_id != user_id:
            return jsonify({'error': 'No tienes permisos para acceder a este archivo'}), 403
        
        if file_record.session_id and file_record.session_id != session_id:
            return jsonify({'error': 'No tienes permisos para acceder a este archivo'}), 403
        
        return jsonify({'file': file_record.to_dict()}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo información de archivo: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@files_bp.route('/<file_id>/download', methods=['GET'])
def download_file(file_id):
    """Descargar archivo convertido"""
    try:
        file_record = File.query.get(file_id)
        
        if not file_record:
            return jsonify({'error': 'Archivo no encontrado'}), 404
        
        if file_record.is_expired:
            return jsonify({'error': 'El archivo ha expirado'}), 410
        
        if file_record.conversion_status != 'completed':
            return jsonify({'error': 'La conversión aún no ha terminado'}), 202
        
        # Verificar permisos
        user_id = None
        session_id = None
        
        try:
            user_id = get_jwt_identity()
        except:
            session_id = request.headers.get('X-Session-ID')
        
        if file_record.user_id and file_record.user_id != user_id:
            return jsonify({'error': 'No tienes permisos para descargar este archivo'}), 403
        
        if file_record.session_id and file_record.session_id != session_id:
            return jsonify({'error': 'No tienes permisos para descargar este archivo'}), 403
        
        # Verificar que el archivo existe
        if not file_record.converted_file_path or not os.path.exists(file_record.converted_file_path):
            return jsonify({'error': 'Archivo convertido no encontrado'}), 404
        
        # Incrementar contador de descargas
        file_record.increment_download_count()
        db.session.commit()
        
        # Generar nombre de descarga
        base_name = os.path.splitext(file_record.original_filename)[0]
        download_name = f"{base_name}.{file_record.target_format}"
        
        return send_file(
            file_record.converted_file_path,
            as_attachment=True,
            download_name=download_name
        )
        
    except Exception as e:
        current_app.logger.error(f"Error descargando archivo: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@files_bp.route('/<file_id>/extend', methods=['POST'])
@jwt_required()
def extend_file_retention(file_id):
    """Extender retención de archivo (requiere créditos o pago)"""
    try:
        current_user_id = get_jwt_identity()
        file_record = File.query.get(file_id)
        
        if not file_record:
            return jsonify({'error': 'Archivo no encontrado'}), 404
        
        if file_record.user_id != current_user_id:
            return jsonify({'error': 'No tienes permisos para este archivo'}), 403
        
        data = request.get_json()
        hours_to_extend = data.get('hours', 24)
        
        if hours_to_extend <= 0 or hours_to_extend > 168:  # Máximo 7 días
            return jsonify({'error': 'Horas de extensión inválidas (1-168)'}), 400
        
        # Calcular costo en créditos (1 crédito = 24 horas)
        credits_needed = max(1, hours_to_extend // 24)
        
        user = User.query.get(current_user_id)
        if user.free_credits < credits_needed:
            return jsonify({
                'error': f'Créditos insuficientes. Necesitas {credits_needed} créditos, tienes {user.free_credits}'
            }), 402
        
        # Extender retención
        file_record.extend_retention(hours_to_extend)
        
        # Descontar créditos
        user.free_credits -= credits_needed
        
        db.session.commit()
        
        return jsonify({
            'message': f'Retención extendida por {hours_to_extend} horas',
            'file': file_record.to_dict(),
            'credits_used': credits_needed,
            'remaining_credits': user.free_credits
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error extendiendo retención: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@files_bp.route('/<file_id>', methods=['DELETE'])
@jwt_required()
def delete_file(file_id):
    """Eliminar archivo manualmente"""
    try:
        current_user_id = get_jwt_identity()
        file_record = File.query.get(file_id)
        
        if not file_record:
            return jsonify({'error': 'Archivo no encontrado'}), 404
        
        if file_record.user_id != current_user_id:
            return jsonify({'error': 'No tienes permisos para eliminar este archivo'}), 403
        
        # Marcar como expirado (elimina archivos físicos)
        file_record.mark_as_expired()
        db.session.commit()
        
        return jsonify({'message': 'Archivo eliminado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error eliminando archivo: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

