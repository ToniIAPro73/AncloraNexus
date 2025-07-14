from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid

from src.models import db
from src.models.conversion_transaction import ConversionTransaction
from src.models.file import File
from src.models.user import User
from src.services.payment_service import payment_service

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/estimate', methods=['POST'])
def estimate_conversion_price():
    """Estimar precio de conversión"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Datos de conversión requeridos'}), 400
        
        # Validar datos mínimos
        required_fields = ['source_format', 'target_format', 'file_size_mb']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo requerido: {field}'}), 400
        
        result = payment_service.calculate_conversion_price(data)
        
        if result['success']:
            return jsonify({
                'estimated_price': result['price'],
                'currency': result['currency'],
                'breakdown': result['breakdown']
            }), 200
        else:
            return jsonify({'error': result['error']}), 400
        
    except Exception as e:
        current_app.logger.error(f"Error estimando precio: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@payments_bp.route('/pricing-tiers', methods=['GET'])
def get_pricing_tiers():
    """Obtener información de niveles de precios"""
    try:
        tiers = payment_service.get_pricing_tiers()
        return jsonify({'pricing_tiers': tiers}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo niveles de precios: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@payments_bp.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    """Crear intención de pago para conversión individual"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Datos de pago requeridos'}), 400
        
        # Obtener usuario si está autenticado
        user_id = None
        session_id = None
        
        try:
            user_id = get_jwt_identity()
        except:
            session_id = data.get('session_id') or str(uuid.uuid4())
        
        # Obtener datos de conversión
        conversion_request = data.get('conversion_request', {})
        
        result = payment_service.create_payment_intent(
            conversion_request=conversion_request,
            user_id=user_id,
            session_id=session_id
        )
        
        if result['success']:
            return jsonify({
                'client_secret': result['client_secret'],
                'payment_intent_id': result['payment_intent_id'],
                'transaction_id': result['transaction_id'],
                'amount': result['amount'],
                'currency': result['currency'],
                'pricing_breakdown': result['pricing_breakdown']
            }), 201
        else:
            return jsonify({'error': result['error']}), 400
        
    except Exception as e:
        current_app.logger.error(f"Error creando intención de pago: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@payments_bp.route('/confirm-payment', methods=['POST'])
def confirm_payment():
    """Confirmar pago completado"""
    try:
        data = request.get_json()
        transaction_id = data.get('transaction_id')
        payment_method = data.get('payment_method', 'card')
        
        if not transaction_id:
            return jsonify({'error': 'ID de transacción requerido'}), 400
        
        result = payment_service.confirm_payment(transaction_id, payment_method)
        
        if result['success']:
            return jsonify({
                'message': result['message'],
                'transaction': result['transaction']
            }), 200
        else:
            return jsonify({'error': result['error']}), 400
        
    except Exception as e:
        current_app.logger.error(f"Error confirmando pago: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@payments_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_payment_history():
    """Obtener historial de pagos del usuario"""
    try:
        current_user_id = get_jwt_identity()
        
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        transactions_query = ConversionTransaction.query.filter_by(
            user_id=current_user_id
        ).order_by(ConversionTransaction.created_at.desc())
        
        # Filtro por estado
        status = request.args.get('status')
        if status:
            transactions_query = transactions_query.filter_by(payment_status=status)
        
        # Paginación
        transactions_paginated = transactions_query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'transactions': [t.to_dict() for t in transactions_paginated.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': transactions_paginated.total,
                'pages': transactions_paginated.pages,
                'has_next': transactions_paginated.has_next,
                'has_prev': transactions_paginated.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo historial de pagos: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@payments_bp.route('/transactions/<transaction_id>', methods=['GET'])
def get_transaction_details(transaction_id):
    """Obtener detalles de una transacción específica"""
    try:
        transaction = ConversionTransaction.query.get(transaction_id)
        
        if not transaction:
            return jsonify({'error': 'Transacción no encontrada'}), 404
        
        # Verificar permisos
        user_id = None
        session_id = None
        
        try:
            user_id = get_jwt_identity()
        except:
            session_id = request.headers.get('X-Session-ID')
        
        if transaction.user_id and transaction.user_id != user_id:
            return jsonify({'error': 'No tienes permisos para ver esta transacción'}), 403
        
        if transaction.session_id and transaction.session_id != session_id:
            return jsonify({'error': 'No tienes permisos para ver esta transacción'}), 403
        
        return jsonify({'transaction': transaction.to_dict()}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo detalles de transacción: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@payments_bp.route('/refund/<transaction_id>', methods=['POST'])
@jwt_required()
def request_refund(transaction_id):
    """Solicitar reembolso de transacción"""
    try:
        current_user_id = get_jwt_identity()
        transaction = ConversionTransaction.query.get(transaction_id)
        
        if not transaction:
            return jsonify({'error': 'Transacción no encontrada'}), 404
        
        if transaction.user_id != current_user_id:
            return jsonify({'error': 'No tienes permisos para esta transacción'}), 403
        
        data = request.get_json()
        reason = data.get('reason', 'Solicitud del usuario')
        
        result = payment_service.process_refund(transaction_id, reason)
        
        if result['success']:
            return jsonify({
                'message': result['message'],
                'transaction': result['transaction']
            }), 200
        else:
            return jsonify({'error': result['error']}), 400
        
    except Exception as e:
        current_app.logger.error(f"Error procesando reembolso: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@payments_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_payment_statistics():
    """Obtener estadísticas de pagos del usuario"""
    try:
        current_user_id = get_jwt_identity()
        days = request.args.get('days', 30, type=int)
        
        stats = payment_service.get_payment_statistics(user_id=current_user_id, days=days)
        
        if 'error' in stats:
            return jsonify({'error': stats['error']}), 500
        
        return jsonify({'statistics': stats}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo estadísticas de pagos: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@payments_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    """Webhook para eventos de Stripe"""
    try:
        # En una implementación real, aquí se verificaría la firma del webhook
        # y se procesarían los eventos de Stripe
        
        data = request.get_json()
        event_type = data.get('type')
        
        current_app.logger.info(f"Webhook recibido: {event_type}")
        
        if event_type == 'payment_intent.succeeded':
            # Procesar pago exitoso
            payment_intent = data.get('data', {}).get('object', {})
            payment_intent_id = payment_intent.get('id')
            
            if payment_intent_id:
                transaction = ConversionTransaction.query.filter_by(
                    stripe_payment_intent_id=payment_intent_id
                ).first()
                
                if transaction and transaction.payment_status == 'pending':
                    result = payment_service.confirm_payment(transaction.id)
                    if result['success']:
                        current_app.logger.info(f"Pago confirmado via webhook: {transaction.id}")
        
        elif event_type == 'payment_intent.payment_failed':
            # Procesar pago fallido
            payment_intent = data.get('data', {}).get('object', {})
            payment_intent_id = payment_intent.get('id')
            
            if payment_intent_id:
                transaction = ConversionTransaction.query.filter_by(
                    stripe_payment_intent_id=payment_intent_id
                ).first()
                
                if transaction and transaction.payment_status == 'pending':
                    transaction.payment_status = 'failed'
                    transaction.error_message = 'Pago fallido'
                    db.session.commit()
                    current_app.logger.info(f"Pago marcado como fallido via webhook: {transaction.id}")
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error procesando webhook: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

