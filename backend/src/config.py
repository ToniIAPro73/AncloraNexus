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
UPLOAD_FOLDER = '/tmp/anclora_uploads'
OUTPUT_FOLDER = '/tmp/anclora_outputs'
BACKUP_FOLDER = BACKEND_ROOT / 'backups'

# === ALLOWED FILE EXTENSIONS ===
ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'doc', 'docx', 'jpg', 'jpeg', 
    'png', 'gif', 'svg', 'webp', 'rtf', 'odt', 
    'tex', 'md', 'html'
}

# === FLASK CONFIGURATION ===
class Config:
    """Base configuration class"""
    
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-jwt-secret'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///anclora.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS
    ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:5173').split(',')
    
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

