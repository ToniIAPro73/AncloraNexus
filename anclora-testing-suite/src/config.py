# src/config.py - Configuración principal de la aplicación
import os
from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class TestingConfig(BaseSettings):
    """Configuración principal del sistema de testing"""
    
    # Conexión con Anclora Nexus
    ANCLORA_API_URL: str = Field(default="http://localhost:8000")
    ANCLORA_API_KEY: Optional[str] = Field(default=None)
    ANCLORA_TEST_USER: str = Field(default="test@ancloranexus.com")
    ANCLORA_TEST_PASSWORD: str = Field(default="")
    
    # Configuración de testing
    PARALLEL_WORKERS: int = Field(default=4, ge=1, le=16)
    TIMEOUT_SECONDS: int = Field(default=300, ge=30, le=3600)
    RETRY_ATTEMPTS: int = Field(default=3, ge=1, le=10)
    
    # Rutas del sistema
    FIXTURES_PATH: Path = Field(default=Path("./fixtures"))
    REPORTS_PATH: Path = Field(default=Path("./reports"))
    LOGS_PATH: Path = Field(default=Path("./logs"))
    
    # Base de datos
    DATABASE_URL: str = Field(default="sqlite:///testing_metrics.db")
    
    # Reporting
    EXPORT_FORMATS: List[str] = Field(default=["markdown", "html", "json"])
    REPORT_LEVEL: str = Field(default="detailed")
    MIN_SUCCESS_RATE: float = Field(default=0.85, ge=0.0, le=1.0)
    
    # UI Configuration
    UI_HOST: str = Field(default="localhost")
    UI_PORT: int = Field(default=8501)
    UI_THEME: str = Field(default="light")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Conversiones soportadas por Anclora Nexus (basadas en arquitectura)
SUPPORTED_CONVERSIONS = {
    # Documentos - 20 conversiones según arquitectura
    'docx': ['html', 'pdf', 'txt'],
    'doc': ['html', 'pdf', 'txt'],
    'html': ['md', 'txt', 'pdf'],
    'md': ['html', 'pdf', 'txt', 'docx'],
    'txt': ['docx', 'html', 'md', 'pdf', 'rtf', 'doc', 'odt', 'tex'],
    'pdf': ['txt', 'png', 'jpg', 'gif'],
    'rtf': ['docx'],
    'odt': ['pdf'],
    'epub': ['html'],
    
    # Imágenes - 15 conversiones según arquitectura
    'png': ['jpg', 'gif', 'pdf', 'webp', 'docx'],
    'jpg': ['png', 'gif', 'pdf'],
    'gif': ['png', 'jpg', 'pdf', 'mp4'],
    'webp': ['jpg'],
    'tiff': ['jpg'],
    'svg': ['png'],
    
    # Datos - 7 conversiones según arquitectura
    'csv': ['html', 'pdf', 'svg'],
    'json': ['html'],
}

# Conversiones críticas faltantes (del análisis competitivo)
MISSING_CRITICAL_CONVERSIONS = {
    'csv': ['xlsx', 'json'],
    'xlsx': ['csv', 'json', 'pdf', 'html'],
    'pdf': ['docx'],
    'docx': ['md'],
    'svg': ['pdf', 'jpg'],
    'jpg': ['docx'],
    'webp': ['png'],
    'json': ['pdf', 'docx'],
    'gif': ['webp'],
    'mp4': ['gif']
}

# Configuración de test suites
TEST_SUITES_CONFIG = {
    "documents": {
        "priority": "high",
        "timeout": 120,
        "retry_attempts": 3,
        "parallel": True,
        "expected_tests": 290,
        "formats": ["docx", "doc", "pdf", "txt", "html", "md", "rtf", "odt", "epub"]
    },
    "images": {
        "priority": "high",
        "timeout": 60,
        "retry_attempts": 2,
        "parallel": True,
        "expected_tests": 190,
        "formats": ["png", "jpg", "gif", "webp", "svg", "tiff"]
    },
    "data": {
        "priority": "medium",
        "timeout": 90,
        "retry_attempts": 3,
        "parallel": True,
        "expected_tests": 45,
        "formats": ["csv", "json", "xlsx"]
    },
    "media": {
        "priority": "medium",
        "timeout": 180,
        "retry_attempts": 2,
        "parallel": False,
        "expected_tests": 30,
        "formats": ["gif", "mp4"]
    },
    "sequential": {
        "priority": "critical",
        "timeout": 300,
        "retry_attempts": 1,
        "parallel": False,
        "expected_tests": 115,
        "description": "Tests de secuencias innovadoras según análisis competitivo"
    },
    "integration": {
        "priority": "critical",
        "timeout": 600,
        "retry_attempts": 1,
        "parallel": False,
        "expected_tests": 80,
        "description": "Tests de carga, límites y recuperación"
    }
}

# Instancia global de configuración
config = TestingConfig()