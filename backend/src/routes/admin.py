from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from functools import wraps

from src.models import db
from src.models.user import User
from src.models.file import File
from src.services.file_manager import file_manager
from src.tasks.cleanup_tasks import cleanup_tasks

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorador para requerir permisos de administrador"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Permisos de administrador requeridos'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/stats/overview', methods=['GET'])
@admin_required
def get_system_overview():
    """Obtener estadísticas generales del sistema"""
    try:
        # Estadísticas de usuarios
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        users_with_subscriptions = User.query.join(User.subscriptions).count()
        
        # Estadísticas de archivos
        total_files = File.query.count()
        active_files = File.query.filter_by(is_deleted=False).count()
        files_today = File.query.filter(
            File.created_at >= datetime.utcnow().date()
        ).count()
        
        # Estadísticas de conversiones por estado
        conversion_stats = {}
        for status in ['pending', 'processing', 'completed', 'failed', 'cancelled']:
            conversion_stats[status] = File.query.filter_by(conversion_status=status).count()
        
        # Estadísticas de almacenamiento
        storage_stats = file_manager.get_storage_stats()
        
        overview = {
            'users': {
                'total': total_users,
                'active': active_users,
                'with_subscriptions': users_with_subscriptions,
                'subscription_rate': round((users_with_subscriptions / max(1, total_users)) * 100, 1)
            },
            'files': {
                'total': total_files,
                'active': active_files,
                'created_today': files_today
            },
            'conversions': conversion_stats,
            'storage': storage_stats,
            'generated_at': datetime.utcnow().isoformat()
        }
        
        return jsonify({'overview': overview}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo estadísticas del sistema: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@admin_bp.route('/maintenance/cleanup', methods=['POST'])
@admin_required
def run_manual_cleanup():
    """Ejecutar limpieza manual del sistema"""
    try:
        data = request.get_json() or {}
        cleanup_type = data.get('type', 'all')
        
        results = {}
        
        if cleanup_type in ['all', 'expired']:
            results['expired_files'] = cleanup_tasks.cleanup_expired_files()
        
        if cleanup_type in ['all', 'orphaned']:
            results['orphaned_files'] = file_manager.cleanup_orphaned_files()
        
        if cleanup_type in ['all', 'sessions']:
            results['old_sessions'] = cleanup_tasks.cleanup_old_sessions()
        
        if cleanup_type in ['all', 'streaks']:
            results['user_streaks'] = cleanup_tasks.update_user_activity_streaks()
        
        return jsonify({
            'message': 'Limpieza ejecutada exitosamente',
            'results': results
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error en limpieza manual: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@admin_bp.route('/maintenance/storage-report', methods=['GET'])
@admin_required
def get_storage_report():
    """Obtener reporte detallado de almacenamiento"""
    try:
        report = cleanup_tasks.generate_storage_report()
        return jsonify({'report': report}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error generando reporte de almacenamiento: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users_list():
    """Obtener lista de usuarios con paginación"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        # Filtros opcionales
        search = request.args.get('search', '').strip()
        status = request.args.get('status')  # active, inactive
        
        users_query = User.query
        
        if search:
            users_query = users_query.filter(
                (User.email.contains(search)) |
                (User.first_name.contains(search)) |
                (User.last_name.contains(search))
            )
        
        if status == 'active':
            users_query = users_query.filter_by(is_active=True)
        elif status == 'inactive':
            users_query = users_query.filter_by(is_active=False)
        
        users_paginated = users_query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in users_paginated.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': users_paginated.total,
                'pages': users_paginated.pages,
                'has_next': users_paginated.has_next,
                'has_prev': users_paginated.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo lista de usuarios: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@admin_bp.route('/users/<user_id>/toggle-status', methods=['POST'])
@admin_required
def toggle_user_status(user_id):
    """Activar/desactivar usuario"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # No permitir desactivar al propio admin
        current_user_id = get_jwt_identity()
        if user_id == current_user_id:
            return jsonify({'error': 'No puedes desactivar tu propia cuenta'}), 400
        
        user.is_active = not user.is_active
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        action = 'activado' if user.is_active else 'desactivado'
        
        return jsonify({
            'message': f'Usuario {action} exitosamente',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error cambiando estado de usuario: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@admin_bp.route('/files/recent', methods=['GET'])
@admin_required
def get_recent_files():
    """Obtener archivos recientes del sistema"""
    try:
        limit = min(request.args.get('limit', 50, type=int), 200)
        
        recent_files = File.query.order_by(File.created_at.desc()).limit(limit).all()
        
        return jsonify({
            'files': [file.to_dict() for file in recent_files],
            'total_shown': len(recent_files)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo archivos recientes: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@admin_bp.route('/files/<file_id>/force-delete', methods=['DELETE'])
@admin_required
def force_delete_file(file_id):
    """Forzar eliminación de un archivo específico"""
    try:
        file_record = File.query.get(file_id)
        
        if not file_record:
            return jsonify({'error': 'Archivo no encontrado'}), 404
        
        # Eliminar archivos físicos
        deleted_original = False
        deleted_converted = False
        
        if file_record.original_file_path:
            deleted_original = file_manager.delete_file(file_record.original_file_path)
        
        if file_record.converted_file_path:
            deleted_converted = file_manager.delete_file(file_record.converted_file_path)
        
        # Marcar como eliminado en base de datos
        file_record.mark_as_expired()
        db.session.commit()
        
        return jsonify({
            'message': 'Archivo eliminado forzosamente',
            'file_id': file_id,
            'deleted_original': deleted_original,
            'deleted_converted': deleted_converted
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error en eliminación forzosa: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@admin_bp.route('/system/health', methods=['GET'])
@admin_required
def get_system_health():
    """Obtener estado de salud del sistema"""
    try:
        # Verificar base de datos
        db_healthy = True
        try:
            db.session.execute('SELECT 1')
        except:
            db_healthy = False
        
        # Verificar almacenamiento
        storage_stats = file_manager.get_storage_stats()
        storage_healthy = storage_stats.get('filesystem_stats', {}).get('usage_percentage', 0) < 90
        
        # Verificar archivos pendientes
        pending_conversions = File.query.filter_by(conversion_status='pending').count()
        processing_conversions = File.query.filter_by(conversion_status='processing').count()
        
        # Estado general
        overall_healthy = db_healthy and storage_healthy
        
        health_status = {
            'overall_status': 'healthy' if overall_healthy else 'warning',
            'components': {
                'database': 'healthy' if db_healthy else 'unhealthy',
                'storage': 'healthy' if storage_healthy else 'warning',
                'conversion_queue': 'healthy' if pending_conversions < 100 else 'warning'
            },
            'metrics': {
                'pending_conversions': pending_conversions,
                'processing_conversions': processing_conversions,
                'storage_usage_percentage': storage_stats.get('filesystem_stats', {}).get('usage_percentage', 0)
            },
            'checked_at': datetime.utcnow().isoformat()
        }
        
        return jsonify({'health': health_status}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error verificando salud del sistema: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

