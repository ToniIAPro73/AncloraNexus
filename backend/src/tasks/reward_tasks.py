import logging
from datetime import datetime, timedelta
from typing import Dict, Any

from src.models import db
from src.models.user import User
from src.models.file import File
from src.models.reward_system import Achievement
from src.services.reward_service import reward_service

logger = logging.getLogger(__name__)

class RewardTasks:
    """Tareas automáticas para el sistema de recompensas"""
    
    @staticmethod
    def initialize_default_achievements() -> Dict[str, Any]:
        """Inicializa los logros por defecto del sistema"""
        try:
            logger.info("Inicializando logros por defecto")
            
            # Verificar si ya existen logros
            existing_count = Achievement.query.count()
            if existing_count > 0:
                return {'message': f'Ya existen {existing_count} logros en el sistema'}
            
            # Definir logros por defecto
            default_achievements = [
                {
                    'id': 'first_conversion',
                    'name': 'Primer Paso',
                    'description': 'Completa tu primera conversión',
                    'icon': '🎯',
                    'category': 'milestone',
                    'points_reward': 50,
                    'rarity': 'common'
                },
                {
                    'id': 'conversion_veteran',
                    'name': 'Veterano Converter',
                    'description': 'Completa 10 conversiones',
                    'icon': '⭐',
                    'category': 'milestone',
                    'points_reward': 100,
                    'rarity': 'common'
                },
                {
                    'id': 'conversion_expert',
                    'name': 'Experto en Conversión',
                    'description': 'Completa 50 conversiones',
                    'icon': '🏆',
                    'category': 'milestone',
                    'points_reward': 250,
                    'rarity': 'uncommon'
                },
                {
                    'id': 'conversion_master',
                    'name': 'Maestro de Conversiones',
                    'description': 'Completa 100 conversiones',
                    'icon': '👑',
                    'category': 'milestone',
                    'points_reward': 500,
                    'rarity': 'rare'
                },
                {
                    'id': 'conversion_legend',
                    'name': 'Leyenda Digital',
                    'description': 'Completa 500 conversiones',
                    'icon': '💎',
                    'category': 'milestone',
                    'points_reward': 1000,
                    'rarity': 'legendary'
                },
                {
                    'id': 'week_streak',
                    'name': 'Semana Perfecta',
                    'description': 'Mantén una racha de 7 días',
                    'icon': '🔥',
                    'category': 'streak',
                    'points_reward': 150,
                    'rarity': 'common'
                },
                {
                    'id': 'month_streak',
                    'name': 'Mes Imparable',
                    'description': 'Mantén una racha de 30 días',
                    'icon': '🚀',
                    'category': 'streak',
                    'points_reward': 750,
                    'rarity': 'rare'
                },
                {
                    'id': 'level_5_master',
                    'name': 'Maestro de Formatos',
                    'description': 'Alcanza el nivel 5',
                    'icon': '🎖️',
                    'category': 'level',
                    'points_reward': 200,
                    'rarity': 'uncommon'
                },
                {
                    'id': 'level_10_legend',
                    'name': 'Emperador de Conversiones',
                    'description': 'Alcanza el nivel 10',
                    'icon': '👑',
                    'category': 'level',
                    'points_reward': 1000,
                    'rarity': 'legendary'
                },
                {
                    'id': 'format_explorer',
                    'name': 'Explorador de Formatos',
                    'description': 'Convierte a 10 formatos diferentes',
                    'icon': '🗺️',
                    'category': 'exploration',
                    'points_reward': 200,
                    'rarity': 'uncommon'
                },
                {
                    'id': 'big_file_handler',
                    'name': 'Domador de Gigantes',
                    'description': 'Convierte un archivo de más de 100MB',
                    'icon': '🐘',
                    'category': 'special',
                    'points_reward': 100,
                    'rarity': 'uncommon'
                },
                {
                    'id': 'speed_demon',
                    'name': 'Demonio de la Velocidad',
                    'description': 'Completa 5 conversiones en una hora',
                    'icon': '⚡',
                    'category': 'speed',
                    'points_reward': 150,
                    'rarity': 'uncommon'
                },
                {
                    'id': 'early_adopter',
                    'name': 'Adoptador Temprano',
                    'description': 'Uno de los primeros 100 usuarios',
                    'icon': '🌟',
                    'category': 'special',
                    'points_reward': 500,
                    'rarity': 'rare'
                },
                {
                    'id': 'social_sharer',
                    'name': 'Embajador Social',
                    'description': 'Comparte Anclora en redes sociales',
                    'icon': '📢',
                    'category': 'social',
                    'points_reward': 75,
                    'rarity': 'common'
                },
                {
                    'id': 'feedback_provider',
                    'name': 'Voz de la Comunidad',
                    'description': 'Proporciona feedback valioso',
                    'icon': '💬',
                    'category': 'community',
                    'points_reward': 100,
                    'rarity': 'common'
                }
            ]
            
            # Crear logros en la base de datos
            created_count = 0
            for ach_data in default_achievements:
                achievement = Achievement(
                    id=ach_data['id'],
                    name=ach_data['name'],
                    description=ach_data['description'],
                    icon=ach_data['icon'],
                    category=ach_data['category'],
                    points_reward=ach_data['points_reward'],
                    rarity=ach_data['rarity']
                )
                
                db.session.add(achievement)
                created_count += 1
            
            db.session.commit()
            
            logger.info(f"Creados {created_count} logros por defecto")
            
            return {
                'message': f'Inicializados {created_count} logros por defecto',
                'achievements_created': created_count
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error inicializando logros por defecto: {str(e)}")
            return {'error': str(e)}
    
    @staticmethod
    def process_conversion_rewards(file_id: str) -> Dict[str, Any]:
        """Procesa recompensas por conversión completada"""
        try:
            file_record = File.query.get(file_id)
            
            if not file_record or not file_record.user_id:
                return {'message': 'Archivo no encontrado o usuario anónimo'}
            
            if file_record.conversion_status != 'completed':
                return {'message': 'Conversión no completada'}
            
            user_id = file_record.user_id
            
            # Otorgar puntos por conversión completada
            result = reward_service.award_points(
                user_id=user_id,
                action='conversion_completed',
                metadata={
                    'file_id': file_id,
                    'source_format': file_record.original_format,
                    'target_format': file_record.target_format,
                    'file_size_mb': file_record.file_size_mb
                }
            )
            
            # Verificar si es la primera conversión
            conversion_count = File.query.filter_by(
                user_id=user_id,
                conversion_status='completed'
            ).count()
            
            if conversion_count == 1:
                first_conversion_result = reward_service.award_points(
                    user_id=user_id,
                    action='first_conversion',
                    metadata={'first_file_id': file_id}
                )
                
                if first_conversion_result['success']:
                    result['first_conversion_bonus'] = first_conversion_result
            
            logger.info(f"Recompensas procesadas para conversión {file_id}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error procesando recompensas de conversión: {str(e)}")
            return {'error': str(e)}
    
    @staticmethod
    def update_daily_streaks() -> Dict[str, Any]:
        """Actualiza las rachas diarias de todos los usuarios"""
        try:
            logger.info("Actualizando rachas diarias de usuarios")
            
            active_users = User.query.filter_by(is_active=True).all()
            
            streaks_updated = 0
            streaks_broken = 0
            milestone_rewards = 0
            
            for user in active_users:
                try:
                    old_streak = user.current_streak
                    user.update_activity_streak()
                    
                    if user.current_streak != old_streak:
                        if user.current_streak == 0:
                            streaks_broken += 1
                        else:
                            streaks_updated += 1
                            
                            # Verificar hitos de racha
                            if user.current_streak % 7 == 0:  # Múltiplos de 7 días
                                milestone_result = reward_service.award_points(
                                    user_id=user.id,
                                    action='streak_milestone',
                                    metadata={
                                        'streak_days': user.current_streak,
                                        'milestone_type': f'{user.current_streak}_day_streak'
                                    }
                                )
                                
                                if milestone_result['success']:
                                    milestone_rewards += 1
                    
                except Exception as e:
                    logger.error(f"Error actualizando racha del usuario {user.id}: {str(e)}")
            
            db.session.commit()
            
            stats = {
                'users_processed': len(active_users),
                'streaks_updated': streaks_updated,
                'streaks_broken': streaks_broken,
                'milestone_rewards_awarded': milestone_rewards,
                'execution_time': datetime.utcnow().isoformat()
            }
            
            logger.info(f"Actualización de rachas completada: {stats}")
            return stats
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error actualizando rachas diarias: {str(e)}")
            return {'error': str(e)}
    
    @staticmethod
    def check_challenge_completions() -> Dict[str, Any]:
        """Verifica y procesa completaciones de desafíos"""
        try:
            logger.info("Verificando completaciones de desafíos")
            
            # Obtener desafíos activos
            now = datetime.utcnow()
            active_challenges = db.session.query(Challenge).filter(
                Challenge.start_date <= now,
                Challenge.end_date >= now,
                Challenge.is_active == True
            ).all()
            
            if not active_challenges:
                return {'message': 'No hay desafíos activos'}
            
            # Obtener usuarios activos
            active_users = User.query.filter_by(is_active=True).all()
            
            completions_processed = 0
            rewards_awarded = 0
            
            for challenge in active_challenges:
                for user in active_users:
                    try:
                        # Verificar si el usuario ya completó este desafío
                        existing_completion = UserReward.query.filter(
                            UserReward.user_id == user.id,
                            UserReward.reward_type == 'challenge_completed',
                            UserReward.reward_metadata.contains(f'"challenge_id": "{challenge.id}"')
                        ).first()
                        
                        if existing_completion:
                            continue
                        
                        # Calcular progreso del usuario en el desafío
                        progress = reward_service._calculate_challenge_progress(user.id, challenge)
                        
                        if progress['completed']:
                            # Otorgar recompensa por completar desafío
                            result = reward_service.award_points(
                                user_id=user.id,
                                action='challenge_completed',
                                points=challenge.points_reward,
                                metadata={
                                    'challenge_id': challenge.id,
                                    'challenge_name': challenge.name,
                                    'challenge_type': challenge.challenge_type,
                                    'target_value': challenge.target_value,
                                    'completion_date': datetime.utcnow().isoformat()
                                }
                            )
                            
                            if result['success']:
                                completions_processed += 1
                                rewards_awarded += challenge.points_reward
                                logger.info(f"Usuario {user.id} completó desafío {challenge.id}")
                    
                    except Exception as e:
                        logger.error(f"Error verificando desafío {challenge.id} para usuario {user.id}: {str(e)}")
            
            db.session.commit()
            
            stats = {
                'active_challenges': len(active_challenges),
                'users_checked': len(active_users),
                'completions_processed': completions_processed,
                'total_rewards_awarded': rewards_awarded,
                'execution_time': datetime.utcnow().isoformat()
            }
            
            logger.info(f"Verificación de desafíos completada: {stats}")
            return stats
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error verificando completaciones de desafíos: {str(e)}")
            return {'error': str(e)}
    
    @staticmethod
    def cleanup_expired_challenges() -> Dict[str, Any]:
        """Limpia desafíos expirados"""
        try:
            logger.info("Limpiando desafíos expirados")
            
            now = datetime.utcnow()
            
            # Marcar desafíos expirados como inactivos
            expired_challenges = Challenge.query.filter(
                Challenge.end_date < now,
                Challenge.is_active == True
            ).all()
            
            for challenge in expired_challenges:
                challenge.is_active = False
            
            db.session.commit()
            
            stats = {
                'expired_challenges': len(expired_challenges),
                'execution_time': datetime.utcnow().isoformat()
            }
            
            logger.info(f"Limpieza de desafíos expirados completada: {stats}")
            return stats
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error limpiando desafíos expirados: {str(e)}")
            return {'error': str(e)}
    
    @staticmethod
    def generate_reward_analytics() -> Dict[str, Any]:
        """Genera analíticas del sistema de recompensas"""
        try:
            logger.info("Generando analíticas de recompensas")
            
            # Estadísticas generales
            total_users = User.query.count()
            active_users = User.query.filter_by(is_active=True).count()
            total_rewards = UserReward.query.count()
            total_points_awarded = db.session.query(
                db.func.sum(UserReward.points_awarded)
            ).scalar() or 0
            
            # Top usuarios por puntos
            top_users = User.query.order_by(User.total_points.desc()).limit(10).all()
            
            # Estadísticas por tipo de recompensa
            reward_type_stats = db.session.query(
                UserReward.reward_type,
                db.func.count(UserReward.id).label('count'),
                db.func.sum(UserReward.points_awarded).label('total_points')
            ).group_by(UserReward.reward_type).all()
            
            # Logros más populares
            achievement_stats = db.session.query(
                UserAchievement.achievement_id,
                db.func.count(UserAchievement.id).label('unlock_count')
            ).group_by(UserAchievement.achievement_id).order_by(
                db.func.count(UserAchievement.id).desc()
            ).limit(10).all()
            
            analytics = {
                'overview': {
                    'total_users': total_users,
                    'active_users': active_users,
                    'total_rewards_given': total_rewards,
                    'total_points_awarded': int(total_points_awarded),
                    'average_points_per_user': round(total_points_awarded / max(1, active_users), 2)
                },
                'top_users': [
                    {
                        'user_id': user.id,
                        'username': f"{user.first_name} {user.last_name[0]}." if user.last_name else user.first_name,
                        'total_points': user.total_points,
                        'level': user.level,
                        'current_streak': user.current_streak
                    }
                    for user in top_users
                ],
                'reward_types': [
                    {
                        'type': stat.reward_type,
                        'count': stat.count,
                        'total_points': int(stat.total_points)
                    }
                    for stat in reward_type_stats
                ],
                'popular_achievements': [
                    {
                        'achievement_id': stat.achievement_id,
                        'unlock_count': stat.unlock_count
                    }
                    for stat in achievement_stats
                ],
                'generated_at': datetime.utcnow().isoformat()
            }
            
            logger.info("Analíticas de recompensas generadas exitosamente")
            return analytics
            
        except Exception as e:
            logger.error(f"Error generando analíticas de recompensas: {str(e)}")
            return {'error': str(e)}

# Instancia global de tareas de recompensas
reward_tasks = RewardTasks()

