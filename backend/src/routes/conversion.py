from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from src.services.conversion_engine import conversion_engine
from src.models import db
from src.models.file import File

conversion_bp = Blueprint('conversion', __name__)

@conversion_bp.route('/supported-formats', methods=['GET'])
def get_supported_formats():
    """Obtener formatos de conversión soportados"""
    try:
        formats = conversion_engine.get_supported_formats()
        return jsonify(formats), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo formatos soportados: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@conversion_bp.route('/estimate-time', methods=['POST'])
def estimate_conversion_time():
    """Estimar tiempo de conversión"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Datos requeridos'}), 400
        
        source_format = data.get('source_format', '').lower().strip()
        target_format = data.get('target_format', '').lower().strip()
        file_size_mb = data.get('file_size_mb', 1)
        
        if not source_format or not target_format:
            return jsonify({'error': 'Formatos de origen y destino requeridos'}), 400
        
        if not conversion_engine.is_conversion_supported(source_format, target_format):
            return jsonify({'error': 'Conversión no soportada'}), 400
        
        estimated_seconds = conversion_engine.estimate_conversion_time(
            file_size_mb, source_format, target_format
        )
        
        return jsonify({
            'estimated_time_seconds': estimated_seconds,
            'estimated_time_minutes': round(estimated_seconds / 60, 1),
            'source_format': source_format,
            'target_format': target_format,
            'file_size_mb': file_size_mb
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error estimando tiempo de conversión: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@conversion_bp.route('/start/<file_id>', methods=['POST'])
def start_conversion(file_id):
    """Iniciar conversión de un archivo específico"""
    try:
        result = conversion_engine.start_conversion(file_id)
        
        if result['success']:
            return jsonify({
                'message': 'Conversión iniciada exitosamente',
                'result': result
            }), 200
        else:
            return jsonify({'error': result['error']}), 400
        
    except Exception as e:
        current_app.logger.error(f"Error iniciando conversión: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@conversion_bp.route('/status/<file_id>', methods=['GET'])
def get_conversion_status(file_id):
    """Obtener estado de conversión de un archivo"""
    try:
        result = conversion_engine.get_conversion_status(file_id)
        
        if result['success']:
            return jsonify(result['status']), 200
        else:
            return jsonify({'error': result['error']}), 404
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo estado de conversión: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@conversion_bp.route('/cancel/<file_id>', methods=['POST'])
def cancel_conversion(file_id):
    """Cancelar conversión en progreso"""
    try:
        # Obtener user_id si está autenticado
        user_id = None
        try:
            user_id = get_jwt_identity()
        except:
            pass
        
        result = conversion_engine.cancel_conversion(file_id, user_id)
        
        if result['success']:
            return jsonify({'message': result['message']}), 200
        else:
            return jsonify({'error': result['error']}), 400
        
    except Exception as e:
        current_app.logger.error(f"Error cancelando conversión: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@conversion_bp.route('/queue/status', methods=['GET'])
def get_queue_status():
    """Obtener estado de la cola de conversiones"""
    try:
        # Estadísticas de la cola
        pending_count = File.query.filter_by(conversion_status='pending').count()
        processing_count = File.query.filter_by(conversion_status='processing').count()
        completed_today = File.query.filter(
            File.conversion_status == 'completed',
            File.conversion_completed_at >= datetime.utcnow().date()
        ).count()
        failed_today = File.query.filter(
            File.conversion_status == 'failed',
            File.created_at >= datetime.utcnow().date()
        ).count()
        
        # Tiempo promedio de conversión (últimas 100 conversiones)
        recent_conversions = File.query.filter(
            File.conversion_status == 'completed',
            File.conversion_started_at.isnot(None),
            File.conversion_completed_at.isnot(None)
        ).order_by(File.conversion_completed_at.desc()).limit(100).all()
        
        avg_conversion_time = 0
        if recent_conversions:
            total_time = sum([
                (conv.conversion_completed_at - conv.conversion_started_at).total_seconds()
                for conv in recent_conversions
            ])
            avg_conversion_time = total_time / len(recent_conversions)
        
        queue_status = {
            'pending_conversions': pending_count,
            'processing_conversions': processing_count,
            'completed_today': completed_today,
            'failed_today': failed_today,
            'average_conversion_time_seconds': round(avg_conversion_time, 1),
            'queue_health': 'healthy' if pending_count < 50 else 'busy',
            'estimated_wait_time_seconds': pending_count * avg_conversion_time if avg_conversion_time > 0 else 0
        }
        
        return jsonify({'queue': queue_status}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo estado de cola: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@conversion_bp.route('/stats/formats', methods=['GET'])
def get_format_statistics():
    """Obtener estadísticas de uso de formatos"""
    try:
        # Estadísticas por formato de origen
        source_stats = db.session.query(
            File.original_format,
            db.func.count(File.id).label('count')
        ).group_by(File.original_format).all()
        
        # Estadísticas por formato de destino
        target_stats = db.session.query(
            File.target_format,
            db.func.count(File.id).label('count')
        ).group_by(File.target_format).all()
        
        # Conversiones más populares
        popular_conversions = db.session.query(
            File.original_format,
            File.target_format,
            db.func.count(File.id).label('count')
        ).group_by(File.original_format, File.target_format).order_by(
            db.func.count(File.id).desc()
        ).limit(10).all()
        
        stats = {
            'source_formats': [
                {'format': stat.original_format, 'count': stat.count}
                for stat in source_stats
            ],
            'target_formats': [
                {'format': stat.target_format, 'count': stat.count}
                for stat in target_stats
            ],
            'popular_conversions': [
                {
                    'from': conv.original_format,
                    'to': conv.target_format,
                    'count': conv.count
                }
                for conv in popular_conversions
            ]
        }
        
        return jsonify({'statistics': stats}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo estadísticas de formatos: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

