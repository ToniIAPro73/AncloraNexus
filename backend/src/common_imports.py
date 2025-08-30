# ================================
# ANCLORA Nexus - CENTRALIZED IMPORTS
# Fase 3: OptimizaciÃ³n de imports
# ================================

"""
Imports centralizados para evitar redundancia
y mejorar el mantenimiento del cÃ³digo.
"""

# === FLASK CORE ===
from flask import (
    Flask, Blueprint, request, jsonify, 
    send_file, send_from_directory
)
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, jwt_required, get_jwt_identity,
    create_access_token, verify_jwt_in_request
)
from flask_sqlalchemy import SQLAlchemy

# === STANDARD LIBRARY ===
import os
import sys
import tempfile
import uuid
import shutil
import hashlib
import logging
from datetime import datetime, timedelta
from pathlib import Path

# === THIRD PARTY ===
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

# === PROJECT IMPORTS ===
from src.config import get_config, ALLOWED_EXTENSIONS, UPLOAD_FOLDER, OUTPUT_FOLDER

# === TYPE HINTS ===
from typing import Optional, Tuple, Dict, List, Any

__all__ = [
    # Flask
    'Flask', 'Blueprint', 'request', 'jsonify', 'send_file', 'send_from_directory',
    'CORS', 'JWTManager', 'jwt_required', 'get_jwt_identity', 'create_access_token',
    'SQLAlchemy',
    
    # Standard library
    'os', 'sys', 'tempfile', 'uuid', 'shutil', 'hashlib', 'logging',
    'datetime', 'timedelta', 'Path',
    
    # Third party
    'secure_filename', 'generate_password_hash', 'check_password_hash',
    
    # Project
    'get_config', 'ALLOWED_EXTENSIONS', 'UPLOAD_FOLDER', 'OUTPUT_FOLDER',
    
    # Types
    'Optional', 'Tuple', 'Dict', 'List', 'Any'
]

