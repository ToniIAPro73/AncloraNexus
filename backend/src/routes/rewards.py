from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from src.models import db
from src.models.user import User
from src.models.reward_system import UserReward, Challenge, Achievement, UserAchievement
from src.services.reward_service import reward_service

rewards_bp = Blueprint('rewards', __name__)

@rewards_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_reward_profile():
    """Obtener perfil completo de recompensas del usuario"""
    try:
        current_user_id = get_jwt_identity()
        
        progress = reward_service.get_user_progress(current_user_id)
        
        if 'error' in progress:
            return jsonify({'error': progress['error']}), 404
        
        return jsonify({'profile': progress}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo perfil de recompensas: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@rewards_bp.route('/award-points', methods=['POST'])
@jwt_required()
def award_points_manual():
    """Otorgar puntos manualmente (para testing o acciones especiales)"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        action = data.get('action', 'manual_award')
        points = data.get('points')
        metadata = data.get('metadata', {})
        
        if not points or points <= 0:
            return jsonify({'error': 'Puntos válidos requeridos'}), 400
        
        result = reward_service.award_points(
            user_id=current_user_id,
            action=action,
            points=points,
            metadata=metadata
        )
        
        if result['success']:
            return jsonify({
                'message': 'Puntos otorgados exitosamente',
                'result': result
            }), 200
        else:
            return jsonify({'error': result['error']}), 400
        
    except Exception as e:
        current_app.logger.error(f"Error otorgando puntos: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@rewards_bp.route('/daily-login', methods=['POST'])
@jwt_required()
def record_daily_login():
    """Registrar inicio de sesión diario y otorgar puntos"""
    try:
        current_user_id = get_jwt_identity()
        
        result = reward_service.award_points(
            user_id=current_user_id,
            action='daily_login'
        )
        
        if result['success']:
            return jsonify({
                'message': 'Inicio de sesión diario registrado',
                'result': result
            }), 200
        else:
            # Si ya se registró hoy, no es un error crítico
            return jsonify({
                'message': 'Inicio de sesión ya registrado hoy',
                'error': result['error']
            }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error registrando inicio de sesión: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@rewards_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Obtener tabla de líderes"""
    try:
        period = request.args.get('period', 'all_time')
        limit = min(request.args.get('limit', 50, type=int), 100)
        
        leaderboard = reward_service.get_leaderboard(period=period, limit=limit)
        
        if 'error' in leaderboard:
            return jsonify({'error': leaderboard['error']}), 500
        
        return jsonify(leaderboard), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo tabla de líderes: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@rewards_bp.route('/challenges', methods=['GET'])
@jwt_required()
def get_user_challenges():
    """Obtener desafíos activos para el usuario"""
    try:
        current_user_id = get_jwt_identity()
        
        challenges = reward_service.get_active_challenges(user_id=current_user_id)
        
        if 'error' in challenges:
            return jsonify({'error': challenges['error']}), 500
        
        return jsonify(challenges), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo desafíos: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@rewards_bp.route('/challenges/public', methods=['GET'])
def get_public_challenges():
    """Obtener desafíos activos (sin progreso de usuario)"""
    try:
        challenges = reward_service.get_active_challenges()
        
        if 'error' in challenges:
            return jsonify({'error': challenges['error']}), 500
        
        return jsonify(challenges), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo desafíos públicos: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@rewards_bp.route('/achievements', methods=['GET'])
def get_all_achievements():
    """Obtener todos los logros disponibles"""
    try:
        achievements = Achievement.query.filter_by(is_active=True).all()
        
        # Obtener logros del usuario si está autenticado
        user_achievements = []
        try:
            current_user_id = get_jwt_identity()
            user_achievements = [ua.achievement_id for ua in UserAchievement.query.filter_by(user_id=current_user_id).all()]
        except:
            pass
        
        achievements_data = []
        for achievement in achievements:
            ach_data = achievement.to_dict()
            ach_data['unlocked'] = achievement.id in user_achievements
            achievements_data.append(ach_data)
        
        return jsonify({
            'achievements': achievements_data,
            'total_available': len(achievements_data),
            'user_unlocked': len(user_achievements) if user_achievements else 0
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo logros: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@rewards_bp.route('/history', methods=['GET'])
@jwt_required()
def get_reward_history():
    """Obtener historial de recompensas del usuario"""
    try:
        current_user_id = get_jwt_identity()
        
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        # Filtro por tipo de recompensa
        reward_type = request.args.get('type')
        
        rewards_query = UserReward.query.filter_by(
            user_id=current_user_id
        ).order_by(UserReward.created_at.desc())
        
        if reward_type:
            rewards_query = rewards_query.filter_by(reward_type=reward_type)
        
        # Paginación
        rewards_paginated = rewards_query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'rewards': [reward.to_dict() for reward in rewards_paginated.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': rewards_paginated.total,
                'pages': rewards_paginated.pages,
                'has_next': rewards_paginated.has_next,
                'has_prev': rewards_paginated.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo historial de recompensas: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@rewards_bp.route('/redeem-credits', methods=['POST'])
@jwt_required()
def redeem_points_for_credits():
    """Canjear puntos por créditos de conversión"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        points_to_redeem = data.get('points', 0)
        
        if points_to_redeem <= 0:
            return jsonify({'error': 'Puntos válidos requeridos'}), 400
        
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        if user.total_points < points_to_redeem:
            return jsonify({'error': 'Puntos insuficientes'}), 400
        
        # Tasa de conversión: 100 puntos = 1 crédito
        credits_to_award = points_to_redeem // 100
        
        if credits_to_award <= 0:
            return jsonify({'error': 'Mínimo 100 puntos requeridos para canjear'}), 400
        
        # Deducir puntos y otorgar créditos
        user.total_points -= (credits_to_award * 100)
        user.conversion_credits += credits_to_award
        
        # Crear registro de canje
        reward = UserReward(
            user_id=current_user_id,
            reward_type='points_redeemed',
            points_awarded=-(credits_to_award * 100),
            description=f'Canjeados {credits_to_award * 100} puntos por {credits_to_award} créditos'
        )
        reward.set_metadata({
            'credits_awarded': credits_to_award,
            'exchange_rate': '100 puntos = 1 crédito'
        })
        
        db.session.add(reward)
        db.session.commit()
        
        return jsonify({
            'message': 'Puntos canjeados exitosamente',
            'points_redeemed': credits_to_award * 100,
            'credits_awarded': credits_to_award,
            'remaining_points': user.total_points,
            'total_credits': user.conversion_credits
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error canjeando puntos: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@rewards_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_reward_statistics():
    """Obtener estadísticas de recompensas del usuario"""
    try:
        current_user_id = get_jwt_identity()
        
        # Estadísticas de puntos por tipo
        reward_stats = db.session.query(
            UserReward.reward_type,
            db.func.sum(UserReward.points_awarded).label('total_points'),
            db.func.count(UserReward.id).label('count')
        ).filter_by(user_id=current_user_id).group_by(UserReward.reward_type).all()
        
        # Estadísticas por mes (últimos 6 meses)
        monthly_stats = db.session.query(
            db.func.date_trunc('month', UserReward.created_at).label('month'),
            db.func.sum(UserReward.points_awarded).label('points')
        ).filter(
            UserReward.user_id == current_user_id,
            UserReward.created_at >= datetime.utcnow() - timedelta(days=180)
        ).group_by(db.func.date_trunc('month', UserReward.created_at)).all()
        
        # Logros recientes
        recent_achievements = UserAchievement.query.filter_by(
            user_id=current_user_id
        ).order_by(UserAchievement.unlocked_at.desc()).limit(5).all()
        
        stats = {
            'points_by_type': [
                {
                    'type': stat.reward_type,
                    'total_points': int(stat.total_points),
                    'count': stat.count
                }
                for stat in reward_stats
            ],
            'monthly_progress': [
                {
                    'month': stat.month.strftime('%Y-%m'),
                    'points': int(stat.points)
                }
                for stat in monthly_stats
            ],
            'recent_achievements': [
                {
                    'achievement_id': ach.achievement_id,
                    'unlocked_at': ach.unlocked_at.isoformat()
                }
                for ach in recent_achievements
            ]
        }
        
        return jsonify({'statistics': stats}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error obteniendo estadísticas de recompensas: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

# Rutas administrativas para gestión de recompensas
@rewards_bp.route('/admin/create-challenge', methods=['POST'])
@jwt_required()
def create_challenge():
    """Crear un nuevo desafío (solo administradores)"""
    try:
        # Verificar permisos de administrador
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Permisos de administrador requeridos'}), 403
        
        data = request.get_json()
        
        challenge = Challenge(
            name=data.get('name'),
            description=data.get('description'),
            challenge_type=data.get('challenge_type'),
            target_value=data.get('target_value'),
            points_reward=data.get('points_reward'),
            start_date=datetime.fromisoformat(data.get('start_date')),
            end_date=datetime.fromisoformat(data.get('end_date'))
        )
        
        db.session.add(challenge)
        db.session.commit()
        
        return jsonify({
            'message': 'Desafío creado exitosamente',
            'challenge': challenge.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creando desafío: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@rewards_bp.route('/admin/weekly-challenges', methods=['POST'])
@jwt_required()
def create_weekly_challenges():
    """Crear desafíos semanales automáticamente (solo administradores)"""
    try:
        # Verificar permisos de administrador
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Permisos de administrador requeridos'}), 403
        
        result = reward_service.create_weekly_challenges()
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 500
        
        return jsonify(result), 201
        
    except Exception as e:
        current_app.logger.error(f"Error creando desafíos semanales: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

