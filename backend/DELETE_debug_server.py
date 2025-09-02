#!/usr/bin/env python3
"""
Script de diagnóstico para identificar problemas en el servidor
"""
import os
import sys
from pathlib import Path

# Agregar el directorio src al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_imports():
    """Probar todas las importaciones críticas"""
    print("🔍 Probando importaciones...")
    
    try:
        from flask import Flask
        print("✅ Flask: OK")
    except Exception as e:
        print(f"❌ Flask: {e}")
        return False
    
    try:
        from src.config import get_config
        print("✅ Config: OK")
    except Exception as e:
        print(f"❌ Config: {e}")
        return False
    
    try:
        from src.models.user import db
        print("✅ Database models: OK")
    except Exception as e:
        print(f"❌ Database models: {e}")
        return False
    
    try:
        from src.routes.auth import auth_bp
        print("✅ Auth routes: OK")
    except Exception as e:
        print(f"❌ Auth routes: {e}")
        return False
    
    try:
        from src.routes.conversion import conversion_bp
        print("✅ Conversion routes: OK")
    except Exception as e:
        print(f"❌ Conversion routes: {e}")
        return False
    
    try:
        from src.routes.credits import credits_bp
        print("✅ Credits routes: OK")
    except Exception as e:
        print(f"❌ Credits routes: {e}")
        return False
    
    try:
        from src.routes.user import user_bp
        print("✅ User routes: OK")
    except Exception as e:
        print(f"❌ User routes: {e}")
        return False
    
    return True

def test_basic_app():
    """Crear una aplicación Flask básica para probar"""
    print("\n🚀 Creando aplicación Flask básica...")
    
    try:
        from flask import Flask, jsonify
        
        app = Flask(__name__)
        app.config['SECRET_KEY'] = 'test-key'
        app.config['JWT_SECRET_KEY'] = 'test-jwt-key'
        
        @app.route('/test')
        def test_route():
            return jsonify({"status": "ok", "message": "Test successful"})
        
        print("✅ Aplicación Flask básica creada")
        return app
    except Exception as e:
        print(f"❌ Error creando aplicación: {e}")
        return None

if __name__ == "__main__":
    print("=" * 50)
    print("🔧 DIAGNÓSTICO DEL SERVIDOR ANCLORA NEXUS")
    print("=" * 50)
    
    # Cambiar al directorio correcto
    os.chdir(os.path.dirname(__file__))
    print(f"📁 Directorio de trabajo: {os.getcwd()}")
    
    # Probar importaciones
    if test_imports():
        print("\n✅ Todas las importaciones funcionan correctamente")
        
        # Probar aplicación básica
        app = test_basic_app()
        if app:
            print("\n🎉 Diagnóstico completado - El problema puede estar en la configuración específica")
        else:
            print("\n❌ Error en la creación de la aplicación Flask")
    else:
        print("\n❌ Hay problemas con las importaciones")
    
    print("=" * 50)
