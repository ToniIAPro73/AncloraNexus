import os
import sys
import pytest

from flask import Flask
from flask_jwt_extended import JWTManager

# Añadir backend al path
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'backend')
sys.path.insert(0, backend_path)

from src.models.user import db, User
from src.routes.auth import auth_bp
from src.routes.credits import credits_bp
from src.routes.conversion import conversion_bp
from flask_jwt_extended import create_access_token


@pytest.fixture
def app():
    """Aplicación Flask configurada para pruebas de integración"""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'test-secret-key'
    app.config['JWT_SECRET_KEY'] = 'test-jwt-secret'

    db.init_app(app)
    JWTManager(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(credits_bp, url_prefix='/api/credits')
    app.register_blueprint(conversion_bp, url_prefix='/api/conversion')

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(client, app):
    """Registra un usuario y genera un token de acceso"""
    user_data = {
        'email': 'integration@example.com',
        'password': 'Password1',
        'full_name': 'Integration User'
    }
    client.post('/api/auth/register', json=user_data)
    with app.app_context():
        user = User.query.filter_by(email=user_data['email']).first()
        token = create_access_token(identity=str(user.id))
    return {'Authorization': f'Bearer {token}'}
