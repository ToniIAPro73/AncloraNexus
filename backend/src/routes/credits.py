from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User, CreditTransaction, db
from datetime import datetime, timedelta
from sqlalchemy import func

credits_bp = Blueprint('credits', __name__)

@credits_bp.route('/balance', methods=['GET'])
@jwt_required()
def get_credit_balance():
    """Obtiene el balance actual de crÃ©ditos del usuario"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'credits': user.credits,
            'credits_used_today': user.credits_used_today,
            'credits_used_this_month': user.credits_used_this_month,
            'total_conversions': user.total_conversions,
            'plan': user.plan,
            'plan_info': user.get_plan_info()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@credits_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_credit_transactions():
    """Obtiene el historial de transacciones de crÃ©ditos"""
    try:
        user_id = get_jwt_identity()
        
        # ParÃ¡metros de paginaciÃ³n
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Filtros opcionales
        transaction_type = request.args.get('type')
        
        query = CreditTransaction.query.filter_by(user_id=user_id)
        
        if transaction_type:
            query = query.filter_by(transaction_type=transaction_type)
        
        transactions = query.order_by(CreditTransaction.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'transactions': [trans.to_dict() for trans in transactions.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': transactions.total,
                'pages': transactions.pages,
                'has_next': transactions.has_next,
                'has_prev': transactions.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@credits_bp.route('/purchase', methods=['POST'])
@jwt_required()
def purchase_credits():
    """Compra crÃ©ditos adicionales (simulado para desarrollo)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        
        if not data.get('amount') or not isinstance(data['amount'], int) or data['amount'] <= 0:
            return jsonify({'error': 'Cantidad de crÃ©ditos invÃ¡lida'}), 400
        
        amount = data['amount']
        
        # Paquetes de crÃ©ditos disponibles
        credit_packages = {
            50: 4.99,
            100: 9.99,
            250: 19.99,
            500: 39.99,
            1000: 74.99
        }
        
        if amount not in credit_packages:
            return jsonify({
                'error': 'Paquete de crÃ©ditos no disponible',
                'available_packages': credit_packages
            }), 400
        
        # En un entorno real, aquÃ­ se procesarÃ­a el pago
        # Por ahora, simulamos una compra exitosa
        
        # AÃ±adir crÃ©ditos al usuario
        user.add_credits(amount)
        
        # Registrar transacciÃ³n
        transaction = CreditTransaction(
            user_id=user.id,
            amount=amount,
            transaction_type='purchase',
            description=f'Compra de {amount} crÃ©ditos por â‚¬{credit_packages[amount]}'
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': f'Compra exitosa de {amount} crÃ©ditos',
            'credits_added': amount,
            'new_balance': user.credits,
            'transaction': transaction.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@credits_bp.route('/gift', methods=['POST'])
@jwt_required()
def gift_credits():
    """Regala crÃ©ditos a otro usuario (funciÃ³n administrativa)"""
    try:
        user_id = get_jwt_identity()
        admin_user = User.query.get(user_id)
        
        # Solo administradores pueden regalar crÃ©ditos
        # En un entorno real, verificarÃ­as roles/permisos
        if not admin_user or admin_user.plan != 'ENTERPRISE':
            return jsonify({'error': 'Permisos insuficientes'}), 403
        
        data = request.get_json()
        
        if not data.get('recipient_email') or not data.get('amount'):
            return jsonify({'error': 'Email del destinatario y cantidad son requeridos'}), 400
        
        recipient = User.query.filter_by(email=data['recipient_email'].lower()).first()
        if not recipient:
            return jsonify({'error': 'Usuario destinatario no encontrado'}), 404
        
        amount = data['amount']
        if not isinstance(amount, int) or amount <= 0:
            return jsonify({'error': 'Cantidad invÃ¡lida'}), 400
        
        # AÃ±adir crÃ©ditos al destinatario
        recipient.add_credits(amount)
        
        # Registrar transacciÃ³n
        transaction = CreditTransaction(
            user_id=recipient.id,
            amount=amount,
            transaction_type='bonus',
            description=f'CrÃ©ditos regalo de {admin_user.email}'
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': f'Regalo de {amount} crÃ©ditos enviado exitosamente',
            'recipient': recipient.email,
            'credits_gifted': amount,
            'recipient_new_balance': recipient.credits
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@credits_bp.route('/upgrade-plan', methods=['POST'])
@jwt_required()
def upgrade_plan():
    """Actualiza el plan de suscripciÃ³n del usuario"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        new_plan = data.get('plan', '').upper()
        
        valid_plans = ['FREE', 'BASIC', 'PRO', 'ENTERPRISE']
        if new_plan not in valid_plans:
            return jsonify({
                'error': 'Plan invÃ¡lido',
                'valid_plans': valid_plans
            }), 400
        
        if new_plan == user.plan:
            return jsonify({'error': 'Ya tienes este plan activo'}), 400
        
        # CrÃ©ditos mensuales por plan
        plan_credits = {
            'FREE': 10,
            'BASIC': 100,
            'PRO': 500,
            'ENTERPRISE': 2000
        }
        
        old_plan = user.plan
        user.plan = new_plan
        
        # Si es un upgrade, aÃ±adir crÃ©ditos del nuevo plan
        if plan_credits[new_plan] > plan_credits[old_plan]:
            credits_to_add = plan_credits[new_plan] - plan_credits[old_plan]
            user.add_credits(credits_to_add)
            
            # Registrar transacciÃ³n
            transaction = CreditTransaction(
                user_id=user.id,
                amount=credits_to_add,
                transaction_type='bonus',
                description=f'Upgrade de plan {old_plan} â†’ {new_plan}'
            )
            db.session.add(transaction)
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': f'Plan actualizado exitosamente de {old_plan} a {new_plan}',
            'old_plan': old_plan,
            'new_plan': new_plan,
            'new_balance': user.credits,
            'plan_info': user.get_plan_info()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@credits_bp.route('/usage-stats', methods=['GET'])
@jwt_required()
def get_usage_stats():
    """Obtiene estadÃ­sticas detalladas de uso de crÃ©ditos"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # EstadÃ­sticas de los Ãºltimos 30 dÃ­as
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # CrÃ©ditos usados por dÃ­a (Ãºltimos 30 dÃ­as)
        daily_usage = db.session.query(
            func.date(CreditTransaction.created_at).label('date'),
            func.sum(func.abs(CreditTransaction.amount)).label('credits_used')
        ).filter(
            CreditTransaction.user_id == user_id,
            CreditTransaction.transaction_type == 'conversion',
            CreditTransaction.created_at >= thirty_days_ago
        ).group_by(func.date(CreditTransaction.created_at)).all()
        
        # CrÃ©ditos por tipo de conversiÃ³n
        conversion_usage = db.session.query(
            CreditTransaction.description,
            func.sum(func.abs(CreditTransaction.amount)).label('credits_used'),
            func.count(CreditTransaction.id).label('count')
        ).filter(
            CreditTransaction.user_id == user_id,
            CreditTransaction.transaction_type == 'conversion',
            CreditTransaction.created_at >= thirty_days_ago
        ).group_by(CreditTransaction.description).all()
        
        return jsonify({
            'current_balance': user.credits,
            'plan_info': user.get_plan_info(),
            'usage_summary': {
                'credits_used_today': user.credits_used_today,
                'credits_used_this_month': user.credits_used_this_month,
                'total_conversions': user.total_conversions
            },
            'daily_usage': [
                {
                    'date': str(usage[0]),
                    'credits_used': int(usage[1]) if usage[1] else 0
                }
                for usage in daily_usage
            ],
            'conversion_usage': [
                {
                    'conversion_type': usage[0],
                    'credits_used': int(usage[1]) if usage[1] else 0,
                    'count': int(usage[2]) if usage[2] else 0
                }
                for usage in conversion_usage
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@credits_bp.route('/packages', methods=['GET'])
def get_credit_packages():
    """Obtiene los paquetes de crÃ©ditos disponibles para compra"""
    packages = [
        {
            'credits': 50,
            'price': 4.99,
            'price_per_credit': 0.10,
            'popular': False,
            'description': 'Perfecto para uso ocasional'
        },
        {
            'credits': 100,
            'price': 9.99,
            'price_per_credit': 0.10,
            'popular': True,
            'description': 'Ideal para profesionales'
        },
        {
            'credits': 250,
            'price': 19.99,
            'price_per_credit': 0.08,
            'popular': False,
            'description': 'Para uso intensivo'
        },
        {
            'credits': 500,
            'price': 39.99,
            'price_per_credit': 0.08,
            'popular': False,
            'description': 'Para equipos pequeÃ±os'
        },
        {
            'credits': 1000,
            'price': 74.99,
            'price_per_credit': 0.07,
            'popular': False,
            'description': 'Para empresas'
        }
    ]
    
    return jsonify({
        'packages': packages,
        'currency': 'EUR'
    }), 200


