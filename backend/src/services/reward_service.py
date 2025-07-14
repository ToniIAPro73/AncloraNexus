import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import random

from src.models import db
from src.models.user import User
from src.models.file import File
from src.models.reward_system import UserReward, Challenge, Achievement, UserAchievement
from src.models.conversion_transaction import ConversionTransaction

logger = logging.getLogger(__name__)

class RewardService:
    """Servicio de recompensas y gamificación para Anclora Converter"""
    
    def __init__(self):
        self.point_values = {
            'conversion_completed': 10,
            'daily_login': 5,
            'first_conversion': 50,
            'streak_milestone': 25,
            'challenge_completed': 100,
            'achievement_unlocked': 200,
            'referral_signup': 500,
            'payment_conversion': 10,  # Por cada EUR gastado
            'feedback_provided': 15,
            'social_share': 20
        }
        
        self.level_thresholds = [
            {'level': 1, 'min_points': 0, 'title': 'Novato Converter'},
            {'level': 2, 'min_points': 100, 'title': 'Explorador Digital'},
            {'level': 3, 'min_points': 300, 'title': 'Convertidor Hábil'},
            {'level': 4, 'min_points': 600, 'title': 'Maestro de Formatos'},
            {'level': 5, 'min_points': 1000, 'title': 'Experto en Conversión'},
            {'level': 6, 'min_points': 1500, 'title': 'Gurú de Archivos'},
            {'level': 7, 'min_points': 2500, 'title': 'Leyenda Digital'},
            {'level': 8, 'min_points': 4000, 'title': 'Campeón Converter'},
            {'level': 9, 'min_points': 6000, 'title': 'Maestro Supremo'},
            {'level': 10, 'min_points': 10000, 'title': 'Emperador de Conversiones'}
        ]
    
    def award_points(self, user_id: str, action: str, points: Optional[int] = None, metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """Otorga puntos a un usuario por una acción específica"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'success': False, 'error': 'Usuario no encontrado'}
            
            # Calcular puntos a otorgar
            points_to_award = points or self.point_values.get(action, 0)
            
            if points_to_award <= 0:
                return {'success': False, 'error': 'Puntos inválidos'}
            
            # Verificar si ya se otorgaron puntos por esta acción hoy (para acciones diarias)
            daily_actions = ['daily_login', 'feedback_provided']
            if action in daily_actions:
                today = datetime.utcnow().date()
                existing_reward = UserReward.query.filter(
                    UserReward.user_id == user_id,
                    UserReward.reward_type == action,
                    db.func.date(UserReward.created_at) == today
                ).first()
                
                if existing_reward:
                    return {'success': False, 'error': 'Puntos ya otorgados hoy para esta acción'}
            
            # Otorgar puntos al usuario
            old_level = user.level
            user.add_points(points_to_award)
            
            # Crear registro de recompensa
            reward = UserReward(
                user_id=user_id,
                reward_type=action,
                points_awarded=points_to_award,
                description=self._get_action_description(action, points_to_award)
            )
            
            if metadata:
                reward.set_metadata(metadata)
            
            db.session.add(reward)
            
            # Verificar si subió de nivel
            level_up = user.level > old_level
            new_achievements = []
            
            if level_up:
                new_achievements.extend(self._check_level_achievements(user))
            
            # Verificar otros logros
            new_achievements.extend(self._check_action_achievements(user, action))
            
            db.session.commit()
            
            result = {
                'success': True,
                'points_awarded': points_to_award,
                'total_points': user.total_points,
                'level': user.level,
                'level_up': level_up,
                'new_achievements': [ach.to_dict() for ach in new_achievements]
            }
            
            if level_up:
                result['level_title'] = self._get_level_title(user.level)
            
            logger.info(f"Puntos otorgados al usuario {user_id}: {points_to_award} por {action}")
            
            return result
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error otorgando puntos: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _get_action_description(self, action: str, points: int) -> str:
        """Obtiene la descripción de una acción de recompensa"""
        descriptions = {
            'conversion_completed': f'Conversión completada (+{points} puntos)',
            'daily_login': f'Inicio de sesión diario (+{points} puntos)',
            'first_conversion': f'Primera conversión realizada (+{points} puntos)',
            'streak_milestone': f'Racha de actividad alcanzada (+{points} puntos)',
            'challenge_completed': f'Desafío completado (+{points} puntos)',
            'achievement_unlocked': f'Logro desbloqueado (+{points} puntos)',
            'referral_signup': f'Referido registrado (+{points} puntos)',
            'payment_conversion': f'Conversión pagada (+{points} puntos)',
            'feedback_provided': f'Feedback proporcionado (+{points} puntos)',
            'social_share': f'Compartido en redes sociales (+{points} puntos)'
        }
        
        return descriptions.get(action, f'Acción realizada (+{points} puntos)')
    
    def _get_level_title(self, level: int) -> str:
        """Obtiene el título correspondiente a un nivel"""
        for threshold in reversed(self.level_thresholds):
            if level >= threshold['level']:
                return threshold['title']
        return 'Novato Converter'
    
    def _check_level_achievements(self, user: User) -> List[UserAchievement]:
        """Verifica y otorga logros por nivel alcanzado"""
        new_achievements = []
        
        level_achievements = {
            5: 'level_5_master',
            10: 'level_10_legend'
        }
        
        if user.level in level_achievements:
            achievement_id = level_achievements[user.level]
            if not self._user_has_achievement(user.id, achievement_id):
                achievement = self._award_achievement(user.id, achievement_id)
                if achievement:
                    new_achievements.append(achievement)
        
        return new_achievements
    
    def _check_action_achievements(self, user: User, action: str) -> List[UserAchievement]:
        """Verifica y otorga logros por acciones específicas"""
        new_achievements = []
        
        # Logros por número de conversiones
        if action == 'conversion_completed':
            conversion_count = File.query.filter_by(
                user_id=user.id,
                conversion_status='completed'
            ).count()
            
            conversion_achievements = {
                1: 'first_conversion',
                10: 'conversion_veteran',
                50: 'conversion_expert',
                100: 'conversion_master',
                500: 'conversion_legend'
            }
            
            if conversion_count in conversion_achievements:
                achievement_id = conversion_achievements[conversion_count]
                if not self._user_has_achievement(user.id, achievement_id):
                    achievement = self._award_achievement(user.id, achievement_id)
                    if achievement:
                        new_achievements.append(achievement)
        
        # Logros por racha de actividad
        if user.current_streak >= 7 and user.current_streak % 7 == 0:
            streak_weeks = user.current_streak // 7
            if streak_weeks == 1 and not self._user_has_achievement(user.id, 'week_streak'):
                achievement = self._award_achievement(user.id, 'week_streak')
                if achievement:
                    new_achievements.append(achievement)
            elif streak_weeks == 4 and not self._user_has_achievement(user.id, 'month_streak'):
                achievement = self._award_achievement(user.id, 'month_streak')
                if achievement:
                    new_achievements.append(achievement)
        
        return new_achievements
    
    def _user_has_achievement(self, user_id: str, achievement_id: str) -> bool:
        """Verifica si un usuario ya tiene un logro específico"""
        return UserAchievement.query.filter_by(
            user_id=user_id,
            achievement_id=achievement_id
        ).first() is not None
    
    def _award_achievement(self, user_id: str, achievement_id: str) -> Optional[UserAchievement]:
        """Otorga un logro específico a un usuario"""
        try:
            achievement = Achievement.query.get(achievement_id)
            if not achievement:
                return None
            
            user_achievement = UserAchievement(
                user_id=user_id,
                achievement_id=achievement_id
            )
            
            db.session.add(user_achievement)
            
            # Otorgar puntos bonus por el logro
            self.award_points(user_id, 'achievement_unlocked', achievement.points_reward)
            
            logger.info(f"Logro otorgado al usuario {user_id}: {achievement_id}")
            
            return user_achievement
            
        except Exception as e:
            logger.error(f"Error otorgando logro: {str(e)}")
            return None
    
    def get_user_progress(self, user_id: str) -> Dict[str, Any]:
        """Obtiene el progreso completo de un usuario"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'Usuario no encontrado'}
            
            # Información de nivel
            current_level_info = None
            next_level_info = None
            
            for threshold in self.level_thresholds:
                if user.level == threshold['level']:
                    current_level_info = threshold
                elif user.level + 1 == threshold['level']:
                    next_level_info = threshold
                    break
            
            # Progreso hacia el siguiente nivel
            progress_to_next = 0
            if next_level_info:
                points_needed = next_level_info['min_points'] - (current_level_info['min_points'] if current_level_info else 0)
                points_earned = user.total_points - (current_level_info['min_points'] if current_level_info else 0)
                progress_to_next = min(100, (points_earned / points_needed) * 100) if points_needed > 0 else 100
            
            # Logros del usuario
            user_achievements = UserAchievement.query.filter_by(user_id=user_id).all()
            achievements_data = []
            
            for user_ach in user_achievements:
                achievement = Achievement.query.get(user_ach.achievement_id)
                if achievement:
                    achievements_data.append({
                        'id': achievement.id,
                        'name': achievement.name,
                        'description': achievement.description,
                        'icon': achievement.icon,
                        'points_reward': achievement.points_reward,
                        'unlocked_at': user_ach.unlocked_at.isoformat()
                    })
            
            # Recompensas recientes
            recent_rewards = UserReward.query.filter_by(
                user_id=user_id
            ).order_by(UserReward.created_at.desc()).limit(10).all()
            
            # Estadísticas de actividad
            total_conversions = File.query.filter_by(
                user_id=user_id,
                conversion_status='completed'
            ).count()
            
            total_spent = db.session.query(
                db.func.sum(ConversionTransaction.amount)
            ).filter_by(
                user_id=user_id,
                payment_status='completed'
            ).scalar() or 0
            
            return {
                'user_info': {
                    'level': user.level,
                    'total_points': user.total_points,
                    'current_streak': user.current_streak,
                    'longest_streak': user.longest_streak
                },
                'level_info': {
                    'current': current_level_info,
                    'next': next_level_info,
                    'progress_percentage': round(progress_to_next, 1)
                },
                'achievements': {
                    'unlocked': achievements_data,
                    'total_unlocked': len(achievements_data),
                    'total_available': Achievement.query.count()
                },
                'recent_rewards': [reward.to_dict() for reward in recent_rewards],
                'statistics': {
                    'total_conversions': total_conversions,
                    'total_spent_eur': round(total_spent, 2),
                    'member_since': user.created_at.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo progreso de usuario: {str(e)}")
            return {'error': str(e)}
    
    def get_leaderboard(self, period: str = 'all_time', limit: int = 50) -> Dict[str, Any]:
        """Obtiene la tabla de líderes"""
        try:
            # Filtro por período
            query = User.query.filter_by(is_active=True)
            
            if period == 'weekly':
                start_date = datetime.utcnow() - timedelta(days=7)
                # Para período semanal, necesitaríamos puntos por semana
                # Por simplicidad, usaremos puntos totales
                query = query.order_by(User.total_points.desc())
            elif period == 'monthly':
                start_date = datetime.utcnow() - timedelta(days=30)
                query = query.order_by(User.total_points.desc())
            else:  # all_time
                query = query.order_by(User.total_points.desc())
            
            leaders = query.limit(limit).all()
            
            leaderboard_data = []
            for i, user in enumerate(leaders, 1):
                leaderboard_data.append({
                    'rank': i,
                    'user_id': user.id,
                    'username': f"{user.first_name} {user.last_name[0]}." if user.last_name else user.first_name,
                    'level': user.level,
                    'level_title': self._get_level_title(user.level),
                    'total_points': user.total_points,
                    'current_streak': user.current_streak,
                    'achievements_count': UserAchievement.query.filter_by(user_id=user.id).count()
                })
            
            return {
                'period': period,
                'leaderboard': leaderboard_data,
                'total_users': len(leaderboard_data),
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo tabla de líderes: {str(e)}")
            return {'error': str(e)}
    
    def create_weekly_challenges(self) -> Dict[str, Any]:
        """Crea desafíos semanales automáticamente"""
        try:
            # Verificar si ya existen desafíos para esta semana
            start_of_week = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            start_of_week -= timedelta(days=start_of_week.weekday())
            end_of_week = start_of_week + timedelta(days=7)
            
            existing_challenges = Challenge.query.filter(
                Challenge.start_date >= start_of_week,
                Challenge.end_date <= end_of_week
            ).count()
            
            if existing_challenges > 0:
                return {'message': 'Desafíos ya existen para esta semana'}
            
            # Plantillas de desafíos
            challenge_templates = [
                {
                    'name': 'Convertidor Activo',
                    'description': 'Completa 10 conversiones esta semana',
                    'challenge_type': 'conversion_count',
                    'target_value': 10,
                    'points_reward': 150
                },
                {
                    'name': 'Explorador de Formatos',
                    'description': 'Convierte archivos a 5 formatos diferentes',
                    'challenge_type': 'format_variety',
                    'target_value': 5,
                    'points_reward': 200
                },
                {
                    'name': 'Racha Semanal',
                    'description': 'Mantén una racha de 7 días consecutivos',
                    'challenge_type': 'daily_streak',
                    'target_value': 7,
                    'points_reward': 250
                },
                {
                    'name': 'Archivos Grandes',
                    'description': 'Convierte 3 archivos de más de 50MB',
                    'challenge_type': 'large_files',
                    'target_value': 3,
                    'points_reward': 180
                }
            ]
            
            # Seleccionar 3 desafíos aleatorios
            selected_challenges = random.sample(challenge_templates, 3)
            
            created_challenges = []
            for template in selected_challenges:
                challenge = Challenge(
                    name=template['name'],
                    description=template['description'],
                    challenge_type=template['challenge_type'],
                    target_value=template['target_value'],
                    points_reward=template['points_reward'],
                    start_date=start_of_week,
                    end_date=end_of_week
                )
                
                db.session.add(challenge)
                created_challenges.append(challenge)
            
            db.session.commit()
            
            logger.info(f"Creados {len(created_challenges)} desafíos semanales")
            
            return {
                'message': f'Creados {len(created_challenges)} desafíos semanales',
                'challenges': [ch.to_dict() for ch in created_challenges]
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creando desafíos semanales: {str(e)}")
            return {'error': str(e)}
    
    def get_active_challenges(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Obtiene los desafíos activos"""
        try:
            now = datetime.utcnow()
            
            active_challenges = Challenge.query.filter(
                Challenge.start_date <= now,
                Challenge.end_date >= now,
                Challenge.is_active == True
            ).all()
            
            challenges_data = []
            for challenge in active_challenges:
                challenge_info = challenge.to_dict()
                
                # Si se proporciona user_id, calcular progreso
                if user_id:
                    progress = self._calculate_challenge_progress(user_id, challenge)
                    challenge_info['user_progress'] = progress
                
                challenges_data.append(challenge_info)
            
            return {
                'active_challenges': challenges_data,
                'total_active': len(challenges_data)
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo desafíos activos: {str(e)}")
            return {'error': str(e)}
    
    def _calculate_challenge_progress(self, user_id: str, challenge: Challenge) -> Dict[str, Any]:
        """Calcula el progreso de un usuario en un desafío específico"""
        try:
            progress = 0
            completed = False
            
            if challenge.challenge_type == 'conversion_count':
                # Contar conversiones en el período del desafío
                count = File.query.filter(
                    File.user_id == user_id,
                    File.conversion_status == 'completed',
                    File.created_at >= challenge.start_date,
                    File.created_at <= challenge.end_date
                ).count()
                
                progress = min(count, challenge.target_value)
                completed = count >= challenge.target_value
            
            elif challenge.challenge_type == 'format_variety':
                # Contar formatos únicos convertidos
                formats = db.session.query(File.target_format).filter(
                    File.user_id == user_id,
                    File.conversion_status == 'completed',
                    File.created_at >= challenge.start_date,
                    File.created_at <= challenge.end_date
                ).distinct().count()
                
                progress = min(formats, challenge.target_value)
                completed = formats >= challenge.target_value
            
            elif challenge.challenge_type == 'daily_streak':
                # Verificar racha actual del usuario
                user = User.query.get(user_id)
                if user:
                    progress = min(user.current_streak, challenge.target_value)
                    completed = user.current_streak >= challenge.target_value
            
            elif challenge.challenge_type == 'large_files':
                # Contar archivos grandes convertidos
                count = File.query.filter(
                    File.user_id == user_id,
                    File.conversion_status == 'completed',
                    File.file_size_mb >= 50,
                    File.created_at >= challenge.start_date,
                    File.created_at <= challenge.end_date
                ).count()
                
                progress = min(count, challenge.target_value)
                completed = count >= challenge.target_value
            
            return {
                'current_progress': progress,
                'target_value': challenge.target_value,
                'progress_percentage': round((progress / challenge.target_value) * 100, 1),
                'completed': completed
            }
            
        except Exception as e:
            logger.error(f"Error calculando progreso de desafío: {str(e)}")
            return {
                'current_progress': 0,
                'target_value': challenge.target_value,
                'progress_percentage': 0,
                'completed': False,
                'error': str(e)
            }

# Instancia global del servicio de recompensas
reward_service = RewardService()

