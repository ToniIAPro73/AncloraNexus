from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from src.models.user import User, db
from datetime import datetime, timedelta
import re
import secrets

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Valida formato de email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Valida que la contraseña sea segura"""
    if len(password) < 8:
        return False, "La contraseña debe tener al menos 8 caracteres"
    if not re.search(r'[A-Z]', password):
        return False, "La contraseña debe tener al menos una mayúscula"
    if not re.search(r'[a-z]', password):
        return False, "La contraseña debe tener al menos una minúscula"
    if not re.search(r'\d', password):
        return False, "La contraseña debe tener al menos un número"
    return True, "Contraseña válida"

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registro de nuevo usuario"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['email', 'password', 'full_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'El campo {field} es requerido'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        full_name = data['full_name'].strip()
        
        # Validar email
        if not validate_email(email):
            return jsonify({'error': 'Formato de email inválido'}), 400
        
        # Validar contraseña
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Verificar si el usuario ya existe
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'El email ya está registrado'}), 409
        
        # Crear nuevo usuario
        user = User(
            email=email,
            full_name=full_name,
            plan='FREE',
            credits=10  # Créditos iniciales gratuitos
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Crear token de acceso
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=7)
        )
        
        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Inicio de sesión"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email y contraseña son requeridos'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Buscar usuario
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Cuenta desactivada'}), 401
        
        # Actualizar último login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Crear token de acceso
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=7)
        )
        
        return jsonify({
            'message': 'Inicio de sesión exitoso',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Genera un token de recuperación y envía (simulado) un enlace"""
    try:
        data = request.get_json()
        email = (data.get('email') or '').lower().strip()
        if not email:
            return jsonify({'error': 'Email es requerido'}), 400

        user = User.query.filter_by(email=email).first()

        # Siempre respondemos positivamente para evitar enumeración de usuarios
        if not user:
            return jsonify({'message': 'Si el email está registrado se enviará un enlace'}), 200

        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expiration = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()

        reset_link = f"{request.host_url.rstrip('/')}/reset-password?token={token}"
        # Simulación de envío de correo
        print(f"Password reset link for {user.email}: {reset_link}")

        return jsonify({'message': 'Se ha enviado un enlace de recuperación'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Verifica el token y actualiza la contraseña"""
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')

        if not token or not new_password:
            return jsonify({'error': 'Token y nueva contraseña son requeridos'}), 400

        user = User.query.filter_by(reset_token=token).first()
        if not user or not user.reset_token_expiration or user.reset_token_expiration < datetime.utcnow():
            return jsonify({'error': 'Token inválido o expirado'}), 400

        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'error': message}), 400

        user.set_password(new_password)
        user.reset_token = None
        user.reset_token_expiration = None
        user.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({'message': 'Contraseña restablecida exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obtener perfil del usuario autenticado"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Actualizar perfil del usuario"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        
        # Actualizar campos permitidos
        if 'full_name' in data:
            user.full_name = data['full_name'].strip()
        
        if 'email' in data:
            new_email = data['email'].lower().strip()
            if new_email != user.email:
                if not validate_email(new_email):
                    return jsonify({'error': 'Formato de email inválido'}), 400
                
                # Verificar que el nuevo email no esté en uso
                existing_user = User.query.filter_by(email=new_email).first()
                if existing_user and existing_user.id != user.id:
                    return jsonify({'error': 'El email ya está en uso'}), 409
                
                user.email = new_email
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Perfil actualizado exitosamente',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Cambiar contraseña del usuario"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Contraseña actual y nueva son requeridas'}), 400
        
        # Verificar contraseña actual
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Contraseña actual incorrecta'}), 401
        
        # Validar nueva contraseña
        is_valid, message = validate_password(data['new_password'])
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Actualizar contraseña
        user.set_password(data['new_password'])
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Contraseña actualizada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@auth_bp.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    """Verificar si el token es válido"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Token inválido'}), 401
        
        return jsonify({
            'valid': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Token inválido'}), 401

