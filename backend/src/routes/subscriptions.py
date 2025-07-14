from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from src.models import db
from src.models.subscription_plan import SubscriptionPlan
from src.models.user_subscription import UserSubscription
from src.models.user import User

subscriptions_bp = Blueprint('subscriptions', __name__)

@subscriptions_bp.route('/plans', methods=['GET'])
def get_subscription_plans():
    """Obtener todos los planes de suscripción disponibles"""
    try:
        plans = SubscriptionPlan.query.filter_by(is_active=True).all()
        
        return jsonify({
            'plans': [plan.to_dict() for plan in plans]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo planes: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@subscriptions_bp.route('/plans/<plan_id>', methods=['GET'])
def get_subscription_plan(plan_id):
    """Obtener detalles de un plan específico"""
    try:
        plan = SubscriptionPlan.query.get(plan_id)
        
        if not plan or not plan.is_active:
            return jsonify({'error': 'Plan no encontrado'}), 404
        
        return jsonify({'plan': plan.to_dict()}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo plan: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@subscriptions_bp.route('/current', methods=['GET'])
@jwt_required()
def get_current_subscription():
    """Obtener suscripción actual del usuario"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        subscription = user.current_subscription
        
        if not subscription:
            return jsonify({
                'subscription': None,
                'message': 'Usuario sin suscripción activa'
            }), 200
        
        return jsonify({
            'subscription': subscription.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo suscripción actual: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@subscriptions_bp.route('/usage', methods=['GET'])
@jwt_required()
def get_subscription_usage():
    """Obtener uso actual de la suscripción"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        subscription = user.current_subscription
        
        if not subscription:
            return jsonify({'error': 'Usuario sin suscripción activa'}), 404
        
        # Calcular uso adicional
        from src.models.file import File
        from datetime import date
        
        current_month_start = date.today().replace(day=1)
        monthly_conversions = File.query.filter(
            File.user_id == current_user_id,
            File.created_at >= current_month_start,
            File.conversion_status == 'completed'
        ).count()
        
        usage = {
            'plan': subscription.plan.to_dict(),
            'conversions_used_this_month': monthly_conversions,
            'conversions_limit': subscription.plan.max_conversions_monthly,
            'conversions_remaining': subscription.conversions_remaining_this_month,
            'file_retention_hours': subscription.plan.file_retention_hours,
            'max_file_size_mb': subscription.plan.max_file_size_mb,
            'features': subscription.plan.get_features(),
            'period_end': subscription.current_period_end.isoformat() if subscription.current_period_end else None,
            'days_until_renewal': subscription.days_until_renewal
        }
        
        return jsonify({'usage': usage}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo uso de suscripción: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@subscriptions_bp.route('/history', methods=['GET'])
@jwt_required()
def get_subscription_history():
    """Obtener historial de suscripciones del usuario"""
    try:
        current_user_id = get_jwt_identity()
        
        subscriptions = UserSubscription.query.filter_by(
            user_id=current_user_id
        ).order_by(UserSubscription.created_at.desc()).all()
        
        return jsonify({
            'subscriptions': [sub.to_dict() for sub in subscriptions]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo historial de suscripciones: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@subscriptions_bp.route('/cancel', methods=['POST'])
@jwt_required()
def cancel_subscription():
    """Cancelar suscripción actual"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        subscription = user.current_subscription
        
        if not subscription:
            return jsonify({'error': 'No hay suscripción activa para cancelar'}), 404
        
        data = request.get_json()
        reason = data.get('reason', 'Usuario solicitó cancelación')
        cancel_immediately = data.get('cancel_immediately', False)
        
        if cancel_immediately:
            # Cancelar inmediatamente
            subscription.status = 'canceled'
            subscription.canceled_at = datetime.utcnow()
            subscription.current_period_end = datetime.utcnow()
        else:
            # Cancelar al final del período actual
            subscription.cancel_at_period_end = True
            subscription.canceled_at = datetime.utcnow()
        
        subscription.cancellation_reason = reason
        db.session.commit()
        
        # En una implementación real, aquí se cancelaría en Stripe
        
        return jsonify({
            'message': 'Suscripción cancelada exitosamente',
            'subscription': subscription.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error cancelando suscripción: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@subscriptions_bp.route('/reactivate', methods=['POST'])
@jwt_required()
def reactivate_subscription():
    """Reactivar suscripción cancelada"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        subscription = user.current_subscription
        
        if not subscription:
            return jsonify({'error': 'No hay suscripción para reactivar'}), 404
        
        if not subscription.cancel_at_period_end:
            return jsonify({'error': 'La suscripción no está programada para cancelación'}), 400
        
        # Reactivar suscripción
        subscription.cancel_at_period_end = False
        subscription.cancellation_reason = None
        db.session.commit()
        
        # En una implementación real, aquí se reactivaría en Stripe
        
        return jsonify({
            'message': 'Suscripción reactivada exitosamente',
            'subscription': subscription.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error reactivando suscripción: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

