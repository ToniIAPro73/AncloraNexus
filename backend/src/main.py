import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.conversion import conversion_bp
from src.routes.credits import credits_bp
from datetime import timedelta

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configuración de seguridad
secret_key = os.environ.get('SECRET_KEY')
jwt_secret_key = os.environ.get('JWT_SECRET_KEY')
if not secret_key or not jwt_secret_key:
    raise RuntimeError('SECRET_KEY and JWT_SECRET_KEY must be set as environment variables')

app.config['SECRET_KEY'] = secret_key
app.config['JWT_SECRET_KEY'] = jwt_secret_key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

# Configuración de CORS para permitir requests del frontend
CORS(app, 
     origins=['http://localhost:3000', 'http://localhost:5173', '*'],
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'])

# Configuración de JWT
jwt = JWTManager(app)

# Configuración de base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'models/database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar base de datos
db.init_app(app)

# Registrar blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(conversion_bp, url_prefix='/api/conversion')
app.register_blueprint(credits_bp, url_prefix='/api/credits')

# Crear tablas de base de datos
with app.app_context():
    db.create_all()

# Manejador de errores JWT
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token expirado'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Token inválido'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Token de autorización requerido'}), 401

# Ruta de salud del API
@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de verificación de salud del API"""
    return jsonify({
        'status': 'healthy',
        'service': 'Anclora Metaform API',
        'version': '1.0.0',
        'message': 'API funcionando correctamente'
    }), 200

# Ruta de información del API
@app.route('/api/info', methods=['GET'])
def api_info():
    """Información general del API"""
    return jsonify({
        'name': 'Anclora Metaform API',
        'version': '1.0.0',
        'description': 'API para conversión inteligente de archivos',
        'endpoints': {
            'auth': '/api/auth',
            'conversions': '/api/conversion',
            'credits': '/api/credits',
            'users': '/api/users'
        },
        'features': [
            'Autenticación JWT',
            'Sistema de créditos',
            'Conversión de archivos',
            'Gestión de usuarios',
            'Historial de conversiones'
        ]
    }), 200

# Servir archivos estáticos del frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return jsonify({'error': 'Frontend no configurado'}), 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return jsonify({
                'message': 'Anclora Metaform API',
                'status': 'running',
                'frontend': 'not_configured',
                'api_docs': '/api/info'
            }), 200

# Manejador de errores global
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint no encontrado'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Error interno del servidor'}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Solicitud inválida'}), 400

if __name__ == '__main__':
    print("🚀 Iniciando Anclora Metaform API...")
    print("📍 API disponible en: http://localhost:8000/api")
    print("🔍 Información del API: http://localhost:8000/api/info")
    print("❤️  Verificación de salud: http://localhost:8000/api/health")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=8000, debug=True)

