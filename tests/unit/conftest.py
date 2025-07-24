import pytest
import sys
import os

# Añadir el directorio backend al path para imports
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'backend')
sys.path.insert(0, backend_path)

from flask import Flask
from src.models.user import db, User
from datetime import datetime


@pytest.fixture
def app():
    """Fixture para crear la aplicación Flask para testing"""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'test-secret-key'
    
    # Inicializar la base de datos
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Fixture para el cliente de pruebas"""
    return app.test_client()


@pytest.fixture
def user_data():
    """Fixture con datos de usuario de prueba"""
    return {
        'email': 'test@example.com',
        'full_name': 'Test User',
        'plan': 'FREE',
        'credits': 10
    }


@pytest.fixture
def user(app, user_data):
    """Fixture para crear un usuario de prueba"""
    with app.app_context():
        user = User(
            email=user_data['email'],
            full_name=user_data['full_name'],
            plan=user_data['plan'],
            credits=user_data['credits']
        )
        user.set_password('testpassword123')
        db.session.add(user)
        db.session.commit()
        return user