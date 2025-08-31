import os
import sys
from pathlib import Path

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import logging

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from prometheus_flask_exporter import PrometheusMetrics

from src.config import get_config
from src.models.user import db
from src.routes.auth import auth_bp
from src.routes.conversion import conversion_bp
from src.routes.credits import credits_bp
from src.routes.user import user_bp
from src.ws import socketio

# Cargar variables de entorno tanto desde la raÃ­z del proyecto como desde backend/
BASE_DIR = Path(__file__).resolve().parent.parent
env_file_1 = BASE_DIR.parent / ".env"
env_file_2 = BASE_DIR / ".env"

print(f"Intentando cargar .env desde: {env_file_1}")
print(f"Archivo existe: {env_file_1.exists()}")
print(f"Intentando cargar .env desde: {env_file_2}")
print(f"Archivo existe: {env_file_2.exists()}")

load_dotenv(env_file_1)
load_dotenv(env_file_2)

# Debug: mostrar variables de entorno cargadas
print("=== VARIABLES DE ENTORNO CARGADAS ===")
print(f"PORT: {os.environ.get('PORT', 'NO SET')}")
print(f"SECRET_KEY: {'SET' if os.environ.get('SECRET_KEY') else 'NO SET'}")
print(f"JWT_SECRET_KEY: {'SET' if os.environ.get('JWT_SECRET_KEY') else 'NO SET'}")
print(f"ALLOWED_ORIGINS: {os.environ.get('ALLOWED_ORIGINS', 'NO SET')}")
print("=====================================")

# Configure Flask to serve the built frontend from the dist directory
app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")

# Aplicar configuraciÃ³n centralizada
config_class = get_config()
app.config.from_object(config_class)

# ConfiguraciÃ³n de logging
log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=getattr(logging, log_level, logging.INFO))
logging.getLogger("werkzeug").setLevel(logging.WARNING)
metrics = PrometheusMetrics(app)
metrics.info("app_info", "Anclora Nexus API", version="2.0.0")

# Validar configuraciÃ³n crÃ­tica
if not app.config.get("SECRET_KEY") or not app.config.get("JWT_SECRET_KEY"):
    raise RuntimeError("SECRET_KEY and JWT_SECRET_KEY must be set in configuration")

# ConfiguraciÃ³n de CORS
CORS(
    app,
    origins=app.config["ALLOWED_ORIGINS"],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
)

# Inicializar SocketIO
socketio.init_app(app, cors_allowed_origins=app.config["ALLOWED_ORIGINS"])

# ConfiguraciÃ³n de JWT
jwt = JWTManager(app)

# ConfiguraciÃ³n de base de datos
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"sqlite:///{os.path.join(os.path.dirname(__file__), 'models/database', 'app.db')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Inicializar base de datos
db.init_app(app)

# Registrar blueprints
app.register_blueprint(user_bp, url_prefix="/api")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(conversion_bp, url_prefix="/api/conversion")
app.register_blueprint(credits_bp, url_prefix="/api/credits")

# Crear tablas de base de datos
with app.app_context():
    db.create_all()


# Registro de solicitudes
@app.before_request
def log_request():
    app.logger.info("%s %s", request.method, request.path)


@app.after_request
def log_response(response):
    app.logger.info("%s %s -> %s", request.method, request.path, response.status_code)
    return response


# Manejador de errores JWT
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "Token expirado"}), 401


@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"error": "Token invÃ¡lido"}), 401


@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({"error": "Token de autorizaciÃ³n requerido"}), 401


# Ruta de salud del API
@app.route("/api/health", methods=["GET"])
def health_check():
    """Endpoint de verificaciÃ³n de salud del API"""
    return (
        jsonify(
            {
                "status": "healthy",
                "service": "Anclora Nexus API",
                "version": "1.0.0",
                "message": "API funcionando correctamente",
            }
        ),
        200,
    )


# Ruta de informaciÃ³n del API
@app.route("/api/info", methods=["GET"])
def api_info():
    """InformaciÃ³n general del API"""
    return (
        jsonify(
            {
                "name": "Anclora Nexus API",
                "version": "1.0.0",
                "description": "API para conversiÃ³n inteligente de archivos",
                "endpoints": {
                    "auth": "/api/auth",
                    "conversions": "/api/conversion",
                    "credits": "/api/credits",
                    "users": "/api/users",
                },
                "features": [
                    "AutenticaciÃ³n JWT",
                    "Sistema de crÃ©ditos",
                    "ConversiÃ³n de archivos",
                    "GestiÃ³n de usuarios",
                    "Historial de conversiones",
                ],
            }
        ),
        200,
    )


# Servir archivos estÃ¡ticos del frontend
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return jsonify({"error": "Frontend no configurado"}), 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, "index.html")
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, "index.html")
        else:
            return (
                jsonify(
                    {
                        "message": "Anclora Nexus API",
                        "status": "running",
                        "frontend": "not_configured",
                        "api_docs": "/api/info",
                    }
                ),
                200,
            )


# Manejador de errores global
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint no encontrado"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Error interno del servidor"}), 500


@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Solicitud invÃ¡lida"}), 400


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print("Iniciando Anclora Nexus API...")
    print(f"API disponible en: http://localhost:{port}/api")
    print(f"InformaciÃ³n del API: http://localhost:{port}/api/info")
    print(f"VerificaciÃ³n de salud: http://localhost:{port}/api/health")
    print("=" * 50)
    app.run(host="0.0.0.0", port=port, debug=True)

