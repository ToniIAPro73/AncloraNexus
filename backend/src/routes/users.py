from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from src.models import db
from src.models.user import User
from src.utils.validators import validate_email

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obtener perfil del usuario actual"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo perfil: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Actualizar perfil del usuario"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        
        # Actualizar campos permitidos
        if 'first_name' in data:
            user.first_name = data['first_name'].strip()
        
        if 'last_name' in data:
            user.last_name = data['last_name'].strip()
        
        if 'preferred_language' in data:
            if data['preferred_language'] in ['es', 'en', 'fr', 'de', 'it']:
                user.preferred_language = data['preferred_language']
        
        if 'timezone' in data:
            user.timezone = data['timezone']
        
        if 'notification_preferences' in data:
            user.set_notification_preferences(data['notification_preferences'])
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Perfil actualizado exitosamente',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error actualizando perfil: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@users_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """Obtener estadísticas del usuario"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Calcular estadísticas
        from src.models.file import File
        from src.models.conversion_transaction import ConversionTransaction
        from sqlalchemy import func
        
        # Conversiones totales
        total_conversions = File.query.filter_by(user_id=current_user_id).count()
        
        # Conversiones este mes
        from datetime import date
        current_month_start = date.today().replace(day=1)
        monthly_conversions = File.query.filter(
            File.user_id == current_user_id,
            File.created_at >= current_month_start
        ).count()
        
        # Formatos más utilizados
        format_stats = db.session.query(
            File.target_format,
            func.count(File.id).label('count')
        ).filter_by(user_id=current_user_id).group_by(File.target_format).all()
        
        # Dinero gastado en conversiones individuales
        total_spent = db.session.query(
            func.sum(ConversionTransaction.amount)
        ).filter_by(
            user_id=current_user_id,
            payment_status='completed'
        ).scalar() or 0
        
        stats = {
            'total_conversions': total_conversions,
            'monthly_conversions': monthly_conversions,
            'total_points': user.total_points,
            'current_level': user.level,
            'current_streak': user.current_streak,
            'longest_streak': user.longest_streak,
            'free_credits': user.free_credits,
            'total_spent': float(total_spent),
            'favorite_formats': [{'format': f[0], 'count': f[1]} for f in format_stats[:5]],
            'member_since': user.created_at.isoformat() if user.created_at else None
        }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo estadísticas: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@users_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Cambiar contraseña del usuario"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Contraseña actual y nueva contraseña requeridas'}), 400
        
        # Verificar contraseña actual
        if not user.check_password(current_password):
            return jsonify({'error': 'Contraseña actual incorrecta'}), 400
        
        # Validar nueva contraseña
        from src.utils.validators import validate_password
        password_validation = validate_password(new_password)
        if not password_validation['valid']:
            return jsonify({'error': password_validation['message']}), 400
        
        # Actualizar contraseña
        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Contraseña actualizada exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error cambiando contraseña: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@users_bp.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Eliminar cuenta del usuario"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        password = data.get('password')
        
        if not password:
            return jsonify({'error': 'Contraseña requerida para eliminar cuenta'}), 400
        
        # Verificar contraseña
        if not user.check_password(password):
            return jsonify({'error': 'Contraseña incorrecta'}), 400
        
        # Eliminar archivos físicos del usuario
        from src.models.file import File
        user_files = File.query.filter_by(user_id=current_user_id).all()
        for file in user_files:
            file.mark_as_expired()
        
        # Eliminar usuario (las relaciones se eliminan en cascada)
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Cuenta eliminada exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error eliminando cuenta: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

