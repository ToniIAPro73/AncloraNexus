# src/routes/ai_analysis.py - Endpoints para análisis IA de contenido
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import tempfile
import os
from pathlib import Path
import json
from datetime import datetime

from ..services.ai_content_analyzer import AIContentAnalyzer, ContentAnalysis

ai_analysis_bp = Blueprint('ai_analysis', __name__)

# Instancia global del analizador
analyzer = AIContentAnalyzer()

@ai_analysis_bp.route("/analyze-file", methods=["POST"])
@jwt_required()
def analyze_uploaded_file():
    """
    Analizar archivo subido y generar recomendaciones inteligentes
    """
    try:
        current_user_id = get_jwt_identity()

        # Validar que se subió un archivo
        if 'file' not in request.files:
            return jsonify({"error": "No se encontró archivo"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "Nombre de archivo requerido"}), 400

        # Crear archivo temporal
        filename = secure_filename(file.filename)
        temp_file_path = None

        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(filename).suffix) as temp_file:
            file.save(temp_file_path := temp_file.name)
        
        try:
            # Realizar análisis IA
            analysis = analyzer.analyze_file(temp_file_path)

            # Convertir análisis a diccionario para respuesta JSON
            response_data = {
                'success': True,
                'filename': filename,
                'analysis': {
                    'file_type': analysis.file_type,
                    'content_type': analysis.content_type,
                    'complexity_score': analysis.complexity_score,
                    'quality_score': analysis.quality_score,
                    'size_mb': round(analysis.size_mb, 2),
                    'content_stats': {
                        'page_count': analysis.page_count,
                        'word_count': analysis.word_count,
                        'image_count': analysis.image_count,
                        'table_count': analysis.table_count,
                        'has_forms': analysis.has_forms,
                        'has_hyperlinks': analysis.has_hyperlinks,
                        'has_embedded_media': analysis.has_embedded_media,
                        'text_to_image_ratio': round(analysis.text_to_image_ratio, 2)
                    },
                    'recommendations': {
                        'formats': analysis.recommended_formats,
                        'optimizations': analysis.optimization_suggestions,
                        'quality_issues': analysis.quality_issues
                    },
                    'metadata': analysis.metadata
                },
                'timestamp': datetime.now().isoformat()
            }

            return jsonify(response_data)

        finally:
            # Limpiar archivo temporal
            if temp_file_path and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    except Exception as e:
        current_app.logger.error(f"Error analizando archivo: {str(e)}")
        return jsonify({
            "error": f"Error analizando archivo: {str(e)}"
        }), 500

# Endpoint adicional para análisis por ruta (futuro)
@ai_analysis_bp.route("/analyze-by-path", methods=["POST"])
@jwt_required()
def analyze_file_by_path():
    """
    Analizar archivo existente por ruta (para archivos ya en el servidor)
    """
    return jsonify({"message": "Endpoint en desarrollo"}), 501
