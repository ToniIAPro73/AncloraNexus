#!/usr/bin/env python3
"""
Servidor Flask simplificado para Anclora Nexus
"""
import os
import sys
from pathlib import Path

# Agregar el directorio src al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Importar componentes
from src.models.user import db
from src.routes.auth import auth_bp
from src.routes.conversion import conversion_bp
from src.routes.credits import credits_bp
from src.routes.user import user_bp

def create_app():
    """Crear y configurar la aplicación Flask"""
    app = Flask(__name__)
    
    # Configuración básica
    app.config.update(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev-secret-key-anclora'),
        JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret-anclora'),
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{os.path.join(os.path.dirname(__file__), 'src/models/database/app.db')}",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_ACCESS_TOKEN_EXPIRES=False  # No expiran para desarrollo
    )
    
    # Configurar CORS
    CORS(app, 
         origins=[
             "http://localhost:5173",
             "http://127.0.0.1:5173",
             "http://localhost:3000",
             "http://localhost:3001"
         ],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "Accept"],
         supports_credentials=True)
    
    # Inicializar JWT
    jwt = JWTManager(app)
    
    # Inicializar base de datos
    db.init_app(app)
    
    # Crear tablas
    with app.app_context():
        try:
            db.create_all()
            print("✅ Base de datos inicializada correctamente")
        except Exception as e:
            print(f"⚠️ Error inicializando base de datos: {e}")
    
    # Registrar blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(conversion_bp, url_prefix="/api/conversion")
    app.register_blueprint(credits_bp, url_prefix="/api/credits")
    app.register_blueprint(user_bp, url_prefix="/api")
    
    # Rutas básicas
    @app.route("/api/health")
    def health_check():
        """Endpoint de verificación de salud"""
        return jsonify({
            "status": "healthy",
            "service": "Anclora Nexus API",
            "version": "2.0.0",
            "message": "API funcionando correctamente"
        })
    
    @app.route("/api/info")
    def api_info():
        """Información del API"""
        return jsonify({
            "name": "Anclora Nexus API",
            "version": "2.0.0",
            "description": "API para conversión inteligente de archivos",
            "endpoints": {
                "auth": "/api/auth",
                "conversions": "/api/conversion",
                "credits": "/api/credits",
                "users": "/api/users",
                "health": "/api/health"
            },
            "features": [
                "Autenticación JWT",
                "Sistema de créditos",
                "Conversión de archivos",
                "Gestión de usuarios",
                "9+ tipos de conversión",
                "Sistema de monitoreo",
                "Optimización inteligente"
            ]
        })
    
    @app.route("/")
    def root():
        """Ruta raíz"""
        return jsonify({
            "message": "Anclora Nexus API",
            "status": "running",
            "version": "2.0.0",
            "api_info": "/api/info",
            "health_check": "/api/health"
        })
    
    # Manejadores de errores JWT
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token expirado"}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Token inválido"}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Token de autorización requerido"}), 401
    
    # Manejadores de errores globales
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Endpoint no encontrado"}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Error interno del servidor"}), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Solicitud inválida"}), 400
    
    return app

if __name__ == "__main__":
    print("🚀 INICIANDO ANCLORA NEXUS API SIMPLIFICADA")
    print("=" * 50)
    
    app = create_app()
    
    port = int(os.environ.get("PORT", 8000))
    
    print(f"✅ API disponible en: http://localhost:{port}")
    print(f"📊 Información del API: http://localhost:{port}/api/info")
    print(f"🏥 Verificación de salud: http://localhost:{port}/api/health")
    print(f"🔐 Autenticación: http://localhost:{port}/api/auth")
    print("=" * 50)
    
    app.run(host="0.0.0.0", port=port, debug=True)
