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
    """Valida que la contraseÃ±a sea segura"""
    if len(password) < 8:
        return False, "La contraseÃ±a debe tener al menos 8 caracteres"
    if not re.search(r'[A-Z]', password):
        return False, "La contraseÃ±a debe tener al menos una mayÃºscula"
    if not re.search(r'[a-z]', password):
        return False, "La contraseÃ±a debe tener al menos una minÃºscula"
    if not re.search(r'\d', password):
        return False, "La contraseÃ±a debe tener al menos un nÃºmero"
    return True, "ContraseÃ±a vÃ¡lida"

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
            return jsonify({'error': 'Formato de email invÃ¡lido'}), 400
        
        # Validar contraseÃ±a
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Verificar si el usuario ya existe
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'El email ya estÃ¡ registrado'}), 409
        
        # Crear nuevo usuario
        user = User(
            email=email,
            full_name=full_name,
            plan='FREE',
            credits=10  # CrÃ©ditos iniciales gratuitos
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
    """Inicio de sesiÃ³n"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email y contraseÃ±a son requeridos'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Buscar usuario
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Credenciales invÃ¡lidas'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Cuenta desactivada'}), 401
        
        # Actualizar Ãºltimo login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Crear token de acceso
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=7)
        )
        
        return jsonify({
            'message': 'Inicio de sesiÃ³n exitoso',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Genera un token de recuperaciÃ³n y envÃ­a (simulado) un enlace"""
    try:
        data = request.get_json()
        email = (data.get('email') or '').lower().strip()
        if not email:
            return jsonify({'error': 'Email es requerido'}), 400

        user = User.query.filter_by(email=email).first()

        # Siempre respondemos positivamente para evitar enumeraciÃ³n de usuarios
        if not user:
            return jsonify({'message': 'Si el email estÃ¡ registrado se enviarÃ¡ un enlace'}), 200

        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expiration = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()

        reset_link = f"{request.host_url.rstrip('/')}/reset-password?token={token}"
        # SimulaciÃ³n de envÃ­o de correo
        print(f"Password reset link for {user.email}: {reset_link}")

        return jsonify({'message': 'Se ha enviado un enlace de recuperaciÃ³n'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Verifica el token y actualiza la contraseÃ±a"""
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')

        if not token or not new_password:
            return jsonify({'error': 'Token y nueva contraseÃ±a son requeridos'}), 400

        user = User.query.filter_by(reset_token=token).first()
        if not user or not user.reset_token_expiration or user.reset_token_expiration < datetime.utcnow():
            return jsonify({'error': 'Token invÃ¡lido o expirado'}), 400

        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'error': message}), 400

        user.set_password(new_password)
        user.reset_token = None
        user.reset_token_expiration = None
        user.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({'message': 'ContraseÃ±a restablecida exitosamente'}), 200
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
                    return jsonify({'error': 'Formato de email invÃ¡lido'}), 400
                
                # Verificar que el nuevo email no estÃ© en uso
                existing_user = User.query.filter_by(email=new_email).first()
                if existing_user and existing_user.id != user.id:
                    return jsonify({'error': 'El email ya estÃ¡ en uso'}), 409
                
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
    """Cambiar contraseÃ±a del usuario"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'ContraseÃ±a actual y nueva son requeridas'}), 400
        
        # Verificar contraseÃ±a actual
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'ContraseÃ±a actual incorrecta'}), 401
        
        # Validar nueva contraseÃ±a
        is_valid, message = validate_password(data['new_password'])
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Actualizar contraseÃ±a
        user.set_password(data['new_password'])
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'ContraseÃ±a actualizada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@auth_bp.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    """Verificar si el token es vÃ¡lido"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Token invÃ¡lido'}), 401
        
        return jsonify({
            'valid': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Token invÃ¡lido'}), 401


