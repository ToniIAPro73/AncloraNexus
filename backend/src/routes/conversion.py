from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from src.models.user import User, Conversion, CreditTransaction, db
from src.models.conversion import conversion_engine, validate_and_classify
from src.models.conversion_history import ConversionHistory
from src.models.conversion_log import ConversionLog
import os
import tempfile
import uuid
from datetime import datetime
import time
import hashlib
import shutil
from pathlib import Path
from src.ws import emit_progress

conversion_bp = Blueprint('conversion', __name__)

UPLOAD_FOLDER = '/tmp/anclora_uploads'
OUTPUT_FOLDER = '/tmp/anclora_outputs'
BACKUP_FOLDER = Path(__file__).resolve().parents[2] / 'backups'

# Crear directorios si no existen
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
BACKUP_FOLDER.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif',
    'html', 'md', 'rtf', 'odt', 'tex'
}

def allowed_file(filename):
    """Verifica si el archivo tiene una extensión permitida"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@conversion_bp.route('/supported-formats', methods=['GET'])
def get_supported_formats():
    """Obtiene todos los formatos soportados"""
    return jsonify({
        'supported_conversions': conversion_engine.supported_conversions,
        'allowed_extensions': list(ALLOWED_EXTENSIONS)
    }), 200

@conversion_bp.route('/analyze-file', methods=['POST'])
@jwt_required()
def analyze_file():
    """Analiza un archivo y proporciona recomendaciones"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar que se subió un archivo
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó ningún archivo'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipo de archivo no soportado'}), 400
        
        # Guardar archivo temporalmente
        filename = secure_filename(file.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}_{filename}")
        file.save(temp_path)
        
        try:
            classification = validate_and_classify(temp_path)
            # Validar archivo
            is_valid, message = conversion_engine.validate_file(temp_path)
            if not is_valid:
                return jsonify({'error': message, 'classification': classification}), 400

            # Analizar archivo
            analysis = conversion_engine.analyze_file(temp_path, filename)
            analysis['classification'] = classification
            
            # Añadir información de costos
            source_format = analysis['extension']
            cost_info = {}
            for target_format in analysis['supported_formats']:
                cost_info[target_format] = conversion_engine.get_conversion_cost(
                    source_format, target_format
                )
            
            analysis['conversion_costs'] = cost_info
            analysis['user_credits'] = user.credits
            
            return jsonify({
                'analysis': analysis,
                'message': 'Archivo analizado exitosamente'
            }), 200
            
        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@conversion_bp.route('/convert', methods=['POST'])
@jwt_required()
def convert_file():
    """Convierte un archivo al formato especificado"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar archivo
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó ningún archivo'}), 400
        
        file = request.files['file']
        target_format = request.form.get('target_format')
        
        if not file.filename or not target_format:
            return jsonify({'error': 'Archivo y formato destino son requeridos'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipo de archivo no soportado'}), 400
        
        # Obtener formato origen
        filename = secure_filename(file.filename)
        source_format = filename.rsplit('.', 1)[1].lower()
        
        # Verificar que la conversión esté soportada
        if target_format not in conversion_engine.get_supported_formats(source_format):
            return jsonify({'error': f'Conversión {source_format} → {target_format} no soportada'}), 400
        
        # Calcular costo
        credits_needed = conversion_engine.get_conversion_cost(source_format, target_format)
        
        # Verificar créditos suficientes
        if user.credits < credits_needed:
            return jsonify({
                'error': 'Créditos insuficientes',
                'credits_needed': credits_needed,
                'credits_available': user.credits
            }), 402
        
        # Guardar archivo de entrada
        input_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}_{filename}")
        file.save(input_path)
        
        # Crear registro de conversión
        conversion = Conversion(
            user_id=user.id,
            original_filename=filename,
            original_format=source_format,
            target_format=target_format,
            file_size=os.path.getsize(input_path),
            conversion_type=f"{source_format}-{target_format}",
            credits_used=credits_needed,
            status='pending'
        )
        
        db.session.add(conversion)
        db.session.flush()  # Para obtener el ID
        emit_progress(conversion.id, Phase.PREPROCESS, 0)

        try:
            emit_progress(conversion.id, Phase.PREPROCESS, 100)
            emit_progress(conversion.id, Phase.CONVERT, 0)

            # Preparar archivo de salida
            output_filename = f"{filename.rsplit('.', 1)[0]}.{target_format}"
            output_path = os.path.join(OUTPUT_FOLDER, f"{uuid.uuid4()}_{output_filename}")

            # Realizar conversión
            start_time = time.time()
            success, message = conversion_engine.convert_file(
                input_path, output_path, source_format, target_format
            )
            emit_progress(conversion.id, Phase.CONVERT, 100)
            emit_progress(conversion.id, Phase.POSTPROCESS, 0)
            processing_time = time.time() - start_time
            
            if success:
                # Guardar hash del archivo original y crear backup
                with open(input_path, 'rb') as f:
                    original_hash = hashlib.sha256(f.read()).hexdigest()
                backup_filename = f"{conversion.id}_{filename}"
                backup_path = BACKUP_FOLDER / backup_filename
                shutil.copy(input_path, backup_path)

                # Consumir créditos
                user.consume_credits(credits_needed)

                # Registrar transacción de créditos
                transaction = CreditTransaction(
                    user_id=user.id,
                    amount=-credits_needed,
                    transaction_type='conversion',
                    description=f'Conversión {source_format} → {target_format}',
                    conversion_id=conversion.id
                )
                db.session.add(transaction)

                # Registrar log de conversión
                log = ConversionLog(
                    conversion_id=conversion.id,
                    file_hash=original_hash,
                    output_path=output_path,
                    backup_path=str(backup_path)
                )
                db.session.add(log)

                # Actualizar conversión
                conversion.status = 'completed'
                conversion.processing_time = processing_time
                conversion.completed_at = datetime.utcnow()
                conversion.output_filename = output_filename
                db.session.commit()
                emit_progress(conversion.id, Phase.POSTPROCESS, 100)

                return jsonify({
                    'message': 'Conversión completada exitosamente',
                    'conversion': conversion.to_dict(),
                    'download_url': f'/api/download/{conversion.id}',
                    'user_credits_remaining': user.credits
                }), 200
                
            else:
                # Error en conversión
                conversion.status = 'failed'
                conversion.error_message = message
                conversion.processing_time = processing_time
                conversion.completed_at = datetime.utcnow()
                db.session.commit()
                emit_progress(conversion.id, Phase.POSTPROCESS, 100)

                return jsonify({
                    'error': f'Error en la conversión: {message}',
                    'conversion': conversion.to_dict()
                }), 500
                
        except Exception as e:
            # Error durante el proceso
            conversion.status = 'failed'
            conversion.error_message = str(e)
            processing_time = time.time() - start_time if 'start_time' in locals() else None
            conversion.processing_time = processing_time
            conversion.completed_at = datetime.utcnow()
            db.session.commit()
            emit_progress(conversion.id, Phase.POSTPROCESS, 100)

            return jsonify({
                'error': f'Error durante la conversión: {str(e)}',
                'conversion': conversion.to_dict()
            }), 500
            
        finally:
            # Limpiar archivos temporales
            if os.path.exists(input_path):
                os.remove(input_path)
                
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500


@conversion_bp.route('/conversions/<int:conversion_id>', methods=['DELETE'])
@jwt_required()
def undo_conversion(conversion_id):
    """Restaura el archivo original desde el backup"""
    try:
        user_id = get_jwt_identity()
        conversion = Conversion.query.filter_by(id=conversion_id, user_id=user_id).first()
        if not conversion:
            return jsonify({'error': 'Conversión no encontrada'}), 404

        log = ConversionLog.query.filter_by(conversion_id=conversion_id).first()
        if not log or not os.path.exists(log.backup_path):
            return jsonify({'error': 'Backup no disponible'}), 404

        shutil.copy(log.backup_path, log.output_path)

        return jsonify({'message': 'Conversión revertida', 'conversion_id': conversion_id}), 200
    except Exception as e:
        return jsonify({'error': f'Error al restaurar: {str(e)}'}), 500

@conversion_bp.route('/download/<int:conversion_id>', methods=['GET'])
@jwt_required()
def download_file(conversion_id):
    """Descarga el archivo convertido"""
    try:
        user_id = get_jwt_identity()
        
        # Buscar conversión
        conversion = Conversion.query.filter_by(
            id=conversion_id,
            user_id=user_id
        ).first()
        
        if not conversion:
            return jsonify({'error': 'Conversión no encontrada'}), 404
        
        if conversion.status != 'completed':
            return jsonify({'error': 'La conversión no está completada'}), 400
        
        # Buscar archivo de salida
        output_path = os.path.join(OUTPUT_FOLDER, f"*_{conversion.output_filename}")
        import glob
        files = glob.glob(output_path)
        
        if not files or not os.path.exists(files[0]):
            return jsonify({'error': 'Archivo no encontrado o expirado'}), 404
        
        return send_file(
            files[0],
            as_attachment=True,
            download_name=conversion.output_filename
        )
        
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@conversion_bp.route('/history', methods=['GET'])
@jwt_required()
def get_conversion_history():
    """Obtiene el historial de conversiones del usuario"""
    try:
        user_id = get_jwt_identity()

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        conv_type = request.args.get('type')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        search = request.args.get('search')

        query = ConversionHistory.query.filter_by(user_id=user_id)
        if conv_type:
            query = query.filter(ConversionHistory.conversion_type == conv_type)
        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date)
                query = query.filter(ConversionHistory.created_at >= start_dt)
            except ValueError:
                pass
        if end_date:
            try:
                end_dt = datetime.fromisoformat(end_date)
                query = query.filter(ConversionHistory.created_at <= end_dt)
            except ValueError:
                pass
        if search:
            query = query.filter(ConversionHistory.original_filename.ilike(f"%{search}%"))

        conversions = query.order_by(ConversionHistory.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify({
            'conversions': [conv.to_dict() for conv in conversions.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': conversions.total,
                'pages': conversions.pages,
                'has_next': conversions.has_next,
                'has_prev': conversions.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@conversion_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_conversion_stats():
    """Obtiene estadísticas de conversiones del usuario"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Estadísticas básicas
        total_conversions = Conversion.query.filter_by(user_id=user_id).count()
        successful_conversions = Conversion.query.filter_by(
            user_id=user_id, status='completed'
        ).count()
        failed_conversions = Conversion.query.filter_by(
            user_id=user_id, status='failed'
        ).count()
        
        # Conversiones por formato
        from sqlalchemy import func
        format_stats = db.session.query(
            Conversion.conversion_type,
            func.count(Conversion.id).label('count')
        ).filter_by(user_id=user_id, status='completed')\
         .group_by(Conversion.conversion_type)\
         .all()
        
        return jsonify({
            'user_stats': {
                'total_conversions': user.total_conversions,
                'credits_remaining': user.credits,
                'credits_used_today': user.credits_used_today,
                'credits_used_this_month': user.credits_used_this_month,
                'plan': user.plan,
                'plan_info': user.get_plan_info()
            },
            'conversion_stats': {
                'total': total_conversions,
                'successful': successful_conversions,
                'failed': failed_conversions,
                'success_rate': (successful_conversions / total_conversions * 100) if total_conversions > 0 else 0
            },
            'format_stats': [
                {'conversion_type': stat[0], 'count': stat[1]}
                for stat in format_stats
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

