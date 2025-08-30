import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.user import db
from src.main import app
from sqlalchemy import text

def add_missing_columns():
    """AÃ±ade las columnas que faltan en la tabla users"""
    with app.app_context():
        try:
            # Verificar si la columna reset_token existe
            db.session.execute(text("SELECT reset_token FROM users LIMIT 1"))
            print("La columna reset_token ya existe")
        except Exception as e:
            print(f"Error al verificar reset_token: {e}")
            # AÃ±adir la columna reset_token
            db.session.execute(text("ALTER TABLE users ADD COLUMN reset_token TEXT"))
            print("Columna reset_token aÃ±adida")
        
        try:
            # Verificar si la columna reset_token_expiration existe
            db.session.execute(text("SELECT reset_token_expiration FROM users LIMIT 1"))
            print("La columna reset_token_expiration ya existe")
        except Exception as e:
            print(f"Error al verificar reset_token_expiration: {e}")
            # AÃ±adir la columna reset_token_expiration
            db.session.execute(text("ALTER TABLE users ADD COLUMN reset_token_expiration TIMESTAMP"))
            print("Columna reset_token_expiration aÃ±adida")
        
        # Confirmar los cambios
        db.session.commit()
        print("Base de datos actualizada correctamente")

if __name__ == "__main__":
    add_missing_columns()

