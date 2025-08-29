import os
import sys
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Añadir la ruta del proyecto al path de Python
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

try:
    from src.models.user import db, User
    from src.main import app
    logger.info("Módulos importados correctamente")
except Exception as e:
    logger.error(f"Error al importar módulos: {e}")
    sys.exit(1)

def create_test_user():
    """Crea un usuario de prueba"""
    try:
        with app.app_context():
            try:
                # Verificar si el usuario ya existe
                user = User.query.filter_by(email='ancloratest@dominio.com').first()
                
                if user:
                    logger.info("El usuario de prueba ya existe")
                    # Actualizar la contraseña
                    user.set_password('Alcloratest123')
                    db.session.commit()
                    logger.info("Contraseña actualizada")
                else:
                    # Crear el usuario
                    new_user = User(
                        email='ancloratest@dominio.com',
                        full_name='Usuario de Prueba',
                        plan='PRO',
                        credits=100
                    )
                    new_user.set_password('Alcloratest123')
                    
                    db.session.add(new_user)
                    db.session.commit()
                    logger.info("Usuario de prueba creado correctamente")
            except Exception as e:
                db.session.rollback()
                logger.error(f"Error al crear/actualizar usuario: {e}")
                raise
    except Exception as e:
        logger.error(f"Error con el contexto de la aplicación: {e}")
        raise

if __name__ == "__main__":
    create_test_user()
