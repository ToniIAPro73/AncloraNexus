import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify # type: ignore
from flask_jwt_extended import JWTManager # type: ignore
from flask_cors import CORS # type: ignore
from flask_migrate import Migrate # type: ignore

# Importar configuración
from src.config import config

# Importar modelos y base de datos
from src.models import db

def create_app(config_name='development'):
    app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
    
    # Cargar configuración
    app.config.from_object(config[config_name])
    
    # Inicializar extensiones
    db.init_app(app)
    jwt = JWTManager(app)
    migrate = Migrate(app, db)
    
    # Configurar CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Importar y registrar blueprints después de inicializar la app
    from src.routes.auth import auth_bp
    from src.routes.users import users_bp
    from src.routes.subscriptions import subscriptions_bp
    from src.routes.files import files_bp
    from src.routes.conversion import conversion_bp
    from src.routes.payments import payments_bp
    from src.routes.rewards import rewards_bp
    from src.routes.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(subscriptions_bp, url_prefix='/api/subscriptions')
    app.register_blueprint(files_bp, url_prefix='/api/files')
    app.register_blueprint(conversion_bp, url_prefix='/api/conversion')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(rewards_bp, url_prefix='/api/rewards')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Crear tablas en contexto de aplicación
    with app.app_context():
        db.create_all()
        
        # Crear planes de suscripción por defecto si no existen
        try:
            from src.models.subscription_plan import SubscriptionPlan
            if SubscriptionPlan.query.count() == 0:
                create_default_subscription_plans()
                app.logger.info("Planes de suscripción por defecto creados")
        except Exception as e:
            app.logger.warning(f"No se pudieron crear planes por defecto: {str(e)}")
        
        # Inicializar logros por defecto si no existen
        try:
            from src.tasks.reward_tasks import reward_tasks
            result = reward_tasks.initialize_default_achievements()
            if 'achievements_created' in result:
                app.logger.info(f"Logros inicializados: {result['achievements_created']}")
        except Exception as e:
            app.logger.warning(f"No se pudieron inicializar logros: {str(e)}")
    
    # Ruta de estado de la API
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'Anclora Backend API funcionando correctamente',
            'version': '1.0.0'
        }), 200
    
    # Ruta para servir archivos estáticos (frontend)
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        static_folder_path = app.static_folder
        if static_folder_path is None:
            return jsonify({'message': 'Anclora Backend API', 'status': 'running'}), 200

        if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
            return send_from_directory(static_folder_path, path)
        else:
            index_path = os.path.join(static_folder_path, 'index.html')
            if os.path.exists(index_path):
                return send_from_directory(static_folder_path, 'index.html')
            else:
                return jsonify({'message': 'Anclora Backend API', 'status': 'running'}), 200
    
    return app

def create_default_subscription_plans():
    """Crea los planes de suscripción por defecto"""
    from src.models.subscription_plan import SubscriptionPlan
    
    plans = [
        {
            'name': 'Explorador Plus',
            'description': 'Plan gratuito con conversiones limitadas',
            'price_monthly': 0.00,
            'price_yearly': 0.00,
            'max_conversions_monthly': 50,
            'max_file_size_mb': 25,
            'file_retention_hours': 24,
            'max_simultaneous_conversions': 1,
            'api_access': False,
            'batch_conversion': False,
            'priority_processing': False,
            'advanced_formats': False,
            'features': ['Conversiones básicas', 'Formatos populares', 'Soporte por email']
        },
        {
            'name': 'Professional IA',
            'description': 'Para profesionales que necesitan conversiones regulares',
            'price_monthly': 34.99,
            'price_yearly': 29.74 * 12,  # 15% descuento
            'max_conversions_monthly': None,  # Ilimitado
            'max_file_size_mb': 100,
            'file_retention_hours': 168,  # 7 días
            'max_simultaneous_conversions': 3,
            'api_access': True,
            'batch_conversion': True,
            'priority_processing': False,
            'advanced_formats': True,
            'features': ['Conversiones ilimitadas', 'Todos los formatos', 'API access', 'Conversión por lotes', 'Soporte prioritario']
        },
        {
            'name': 'Business Pro',
            'description': 'Para equipos y empresas medianas',
            'price_monthly': 89.99,
            'price_yearly': 76.49 * 12,  # 15% descuento
            'max_conversions_monthly': None,  # Ilimitado
            'max_file_size_mb': 500,
            'file_retention_hours': 360,  # 15 días
            'max_simultaneous_conversions': 10,
            'api_access': True,
            'batch_conversion': True,
            'priority_processing': True,
            'advanced_formats': True,
            'features': ['Todo de Professional', 'Archivos hasta 500MB', 'Procesamiento prioritario', 'Retención 15 días', 'Soporte 24/7']
        },
        {
            'name': 'Enterprise',
            'description': 'Para grandes empresas con necesidades específicas',
            'price_monthly': 249.99,
            'price_yearly': 212.49 * 12,  # 15% descuento
            'max_conversions_monthly': None,  # Ilimitado
            'max_file_size_mb': 2048,  # 2GB
            'file_retention_hours': 720,  # 30 días
            'max_simultaneous_conversions': 50,
            'api_access': True,
            'batch_conversion': True,
            'priority_processing': True,
            'advanced_formats': True,
            'features': ['Todo de Business Pro', 'Archivos hasta 2GB', 'Retención 30 días', 'SLA garantizado', 'Gestor de cuenta dedicado', 'Integración personalizada']
        }
    ]
    
    for plan_data in plans:
        features = plan_data.pop('features')
        plan = SubscriptionPlan(**plan_data)
        plan.set_features(features)
        db.session.add(plan)
    
    db.session.commit()

# Crear la aplicación
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

