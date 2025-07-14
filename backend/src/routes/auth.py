from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timedelta
import uuid
import re

from src.models import db
from src.models.user import User
from src.utils.email import send_verification_email, send_password_reset_email
from src.utils.validators import validate_email, validate_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registro de nuevo usuario"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email y contraseña son requeridos'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        
        # Validar email
        if not validate_email(email):
            return jsonify({'error': 'Formato de email inválido'}), 400
        
        # Validar contraseña
        password_validation = validate_password(password)
        if not password_validation['valid']:
            return jsonify({'error': password_validation['message']}), 400
        
        # Verificar si el usuario ya existe
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'El email ya está registrado'}), 409
        
        # Crear nuevo usuario
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            email_verification_token=str(uuid.uuid4())
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Enviar email de verificación (en desarrollo, solo log)
        try:
            send_verification_email(user)
        except Exception as e:
            current_app.logger.warning(f"No se pudo enviar email de verificación: {str(e)}")
        
        # Crear tokens
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                'user_level': user.level,
                'plan_id': None,
                'free_credits': user.free_credits,
                'permissions': ['basic_conversion']
            }
        )
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'verification_required': True
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error en registro: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Inicio de sesión"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email y contraseña son requeridos'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Buscar usuario
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Cuenta desactivada'}), 401
        
        # Actualizar último login y racha de actividad
        user.last_login = datetime.utcnow()
        user.update_activity_streak()
        db.session.commit()
        
        # Obtener permisos basados en suscripción
        permissions = ['basic_conversion']
        plan_id = None
        
        if user.current_subscription and user.current_subscription.is_active:
            plan_id = user.current_subscription.plan_id
            permissions.extend(['unlimited_conversion', 'file_history'])
            
            if user.current_subscription.plan.api_access:
                permissions.append('api_access')
            if user.current_subscription.plan.batch_conversion:
                permissions.append('batch_conversion')
            if user.current_subscription.plan.priority_processing:
                permissions.append('priority_processing')
        
        # Crear tokens
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                'user_level': user.level,
                'plan_id': plan_id,
                'free_credits': user.free_credits,
                'permissions': permissions
            }
        )
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Inicio de sesión exitoso',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error en login: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Renovar token de acceso"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Usuario no válido'}), 401
        
        # Obtener permisos actualizados
        permissions = ['basic_conversion']
        plan_id = None
        
        if user.current_subscription and user.current_subscription.is_active:
            plan_id = user.current_subscription.plan_id
            permissions.extend(['unlimited_conversion', 'file_history'])
            
            if user.current_subscription.plan.api_access:
                permissions.append('api_access')
            if user.current_subscription.plan.batch_conversion:
                permissions.append('batch_conversion')
            if user.current_subscription.plan.priority_processing:
                permissions.append('priority_processing')
        
        # Crear nuevo token de acceso
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                'user_level': user.level,
                'plan_id': plan_id,
                'free_credits': user.free_credits,
                'permissions': permissions
            }
        )
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error en refresh: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    """Verificar email con token"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token requerido'}), 400
        
        user = User.query.filter_by(email_verification_token=token).first()
        
        if not user:
            return jsonify({'error': 'Token inválido o expirado'}), 400
        
        user.email_verified = True
        user.email_verification_token = None
        db.session.commit()
        
        return jsonify({'message': 'Email verificado exitosamente'}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error en verificación de email: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Solicitar reset de contraseña"""
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        
        if not email or not validate_email(email):
            return jsonify({'error': 'Email válido requerido'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if user:
            # Generar token de reset
            user.password_reset_token = str(uuid.uuid4())
            user.password_reset_expires = datetime.utcnow() + timedelta(hours=1)
            db.session.commit()
            
            # Enviar email (en desarrollo, solo log)
            try:
                send_password_reset_email(user)
            except Exception as e:
                current_app.logger.warning(f"No se pudo enviar email de reset: {str(e)}")
        
        # Siempre devolver éxito por seguridad
        return jsonify({'message': 'Si el email existe, recibirás instrucciones para resetear tu contraseña'}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error en forgot password: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Resetear contraseña con token"""
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')
        
        if not token or not new_password:
            return jsonify({'error': 'Token y nueva contraseña requeridos'}), 400
        
        # Validar nueva contraseña
        password_validation = validate_password(new_password)
        if not password_validation['valid']:
            return jsonify({'error': password_validation['message']}), 400
        
        user = User.query.filter_by(password_reset_token=token).first()
        
        if not user or not user.password_reset_expires or user.password_reset_expires < datetime.utcnow():
            return jsonify({'error': 'Token inválido o expirado'}), 400
        
        # Actualizar contraseña
        user.set_password(new_password)
        user.password_reset_token = None
        user.password_reset_expires = None
        db.session.commit()
        
        return jsonify({'message': 'Contraseña actualizada exitosamente'}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error en reset password: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Obtener información del usuario actual"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo usuario actual: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Cerrar sesión (invalidar token)"""
    try:
        # En una implementación completa, aquí se agregaría el token a una blacklist
        # Por ahora, solo confirmamos el logout
        return jsonify({'message': 'Sesión cerrada exitosamente'}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error en logout: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

