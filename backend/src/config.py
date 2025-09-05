# ================================
# ANCLORA Nexus - CENTRALIZED CONFIGURATION
# Fase 3: Arquitectura optimizada
# ================================

import os
from datetime import timedelta
from pathlib import Path

# === PROJECT PATHS ===
PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = PROJECT_ROOT / 'backend'
FRONTEND_ROOT = PROJECT_ROOT / 'frontend'
DOCS_ROOT = PROJECT_ROOT / 'docs'

# === UPLOAD & OUTPUT DIRECTORIES ===
import tempfile
import platform

# Usar rutas apropiadas según el sistema operativo
if platform.system() == 'Windows':
    TEMP_BASE = os.path.join(tempfile.gettempdir(), 'anclora')
    UPLOAD_FOLDER = os.path.join(TEMP_BASE, 'uploads')
    OUTPUT_FOLDER = os.path.join(TEMP_BASE, 'outputs')
else:
    UPLOAD_FOLDER = '/tmp/anclora_uploads'
    OUTPUT_FOLDER = '/tmp/anclora_outputs'

# Crear directorios si no existen
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
BACKUP_FOLDER = BACKEND_ROOT / 'backups'
DATA_DIR = BACKEND_ROOT / '.data'
os.makedirs(DATA_DIR, exist_ok=True)

# === ALLOWED FILE EXTENSIONS ===
ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'doc', 'docx', 'jpg', 'jpeg', 
    'png', 'gif', 'svg', 'webp', 'rtf', 'odt', 
    'tex', 'md', 'html'
}

# === FLASK CONFIGURATION ===
def _parse_origins(origins: str) -> list:
    """Parse comma-separated origins, strip spaces and ignore '*' for safety."""
    parts = [o.strip() for o in (origins or '').split(',')]
    return [o for o in parts if o and o != '*']


class Config:
    """Base configuration class"""
    
    # App
    APP_NAME = 'Anclora Nexus API'
    APP_VERSION = os.environ.get('APP_VERSION', '2.0.0')
    
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-jwt-secret'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Database
    _db_path = (DATA_DIR / 'anclora.db').resolve()
    _db_uri_default = f"sqlite:///{str(_db_path).replace('\\\\','/').replace('\\','/')}"
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or _db_uri_default
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS
    ALLOWED_ORIGINS = _parse_origins(
        os.environ.get('ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')
    )
    CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    CORS_HEADERS = ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
    
    # File uploads
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file size
    
    # External services
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

# === CONFIGURATION SELECTOR ===
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on environment"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])

