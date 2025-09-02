#!/usr/bin/env python3
"""
Servidor Flask mínimo para probar conectividad
"""
from flask import Flask, jsonify
from flask_cors import CORS

def create_minimal_app():
    """Crear aplicación Flask mínima"""
    app = Flask(__name__)
    
    # Configuración básica
    app.config['SECRET_KEY'] = 'test-key'
    
    # CORS
    CORS(app, origins=["http://localhost:5173"])
    
    @app.route('/')
    def root():
        return jsonify({
            "message": "Anclora Nexus API - Servidor Mínimo",
            "status": "running",
            "version": "minimal"
        })
    
    @app.route('/api/health')
    def health():
        return jsonify({
            "status": "healthy",
            "service": "Anclora Nexus API",
            "message": "Servidor mínimo funcionando"
        })
    
    @app.route('/test')
    def test():
        return jsonify({
            "test": "ok",
            "message": "Endpoint de prueba funcionando"
        })
    
    return app

if __name__ == "__main__":
    print("🧪 SERVIDOR MÍNIMO ANCLORA NEXUS")
    print("=" * 40)
    
    app = create_minimal_app()
    
    print("✅ Servidor iniciando en puerto 8000")
    print("🔗 http://localhost:8000")
    print("🏥 http://localhost:8000/api/health")
    print("🧪 http://localhost:8000/test")
    print("=" * 40)
    
    app.run(host="0.0.0.0", port=8000, debug=True)
