from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
import uuid
import json

db = SQLAlchemy()

class UserReward(db.Model):
    __tablename__ = 'user_rewards'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Tipo de recompensa
    reward_type = db.Column(db.String(50), nullable=False, index=True)
    # Tipos: conversion_points, referral_bonus, achievement_unlock, level_up, monthly_credits
    
    # Valores
    points_awarded = db.Column(db.Integer, default=0)
    credits_awarded = db.Column(db.Integer, default=0)
    
    # Descripción y contexto
    description = db.Column(db.String(255))
    reward_metadata = db.Column(db.Text, default='{}')  # JSON con información adicional
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f'<UserReward {self.user_id} - {self.reward_type}>'
    
    def get_metadata(self):
        """Obtiene los metadatos como dict"""
        try:
            return json.loads(self.reward_metadata)
        except:
            return {}
    
    def set_metadata(self, data):
        """Establece los metadatos"""
        self.reward_metadata = json.dumps(data)
    
    def to_dict(self):
        """Convierte la recompensa a diccionario"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'reward_type': self.reward_type,
            'points_awarded': self.points_awarded,
            'credits_awarded': self.credits_awarded,
            'description': self.description,
            'metadata': self.get_metadata(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Challenge(db.Model):
    __tablename__ = 'challenges'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Tipo y configuración del desafío
    challenge_type = db.Column(db.String(50), nullable=False, index=True)
    # Tipos: volume_challenge, streak_challenge, try_new_format, referral_challenge
    
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    
    # Objetivos y progreso
    target_value = db.Column(db.Integer, nullable=False)
    current_progress = db.Column(db.Integer, default=0)
    
    # Recompensas
    reward_points = db.Column(db.Integer, default=0)
    reward_credits = db.Column(db.Integer, default=0)
    
    # Estado y fechas
    status = db.Column(db.String(20), default='active', index=True)
    # Estados: active, completed, expired, abandoned
    
    start_date = db.Column(db.Date, default=date.today)
    end_date = db.Column(db.Date, nullable=False, index=True)
    completed_at = db.Column(db.DateTime)
    
    # Configuración adicional
    challenge_config = db.Column(db.Text, default='{}')  # JSON con configuración específica
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Challenge {self.title} - {self.user_id}>'
    
    def get_challenge_config(self):
        """Obtiene la configuración como dict"""
        try:
            return json.loads(self.challenge_config)
        except:
            return {}
    
    def set_challenge_config(self, config):
        """Establece la configuración"""
        self.challenge_config = json.dumps(config)
    
    @property
    def progress_percentage(self):
        """Porcentaje de progreso del desafío"""
        if self.target_value == 0:
            return 100
        return min(100, (self.current_progress / self.target_value) * 100)
    
    @property
    def is_completed(self):
        """Verifica si el desafío está completado"""
        return self.status == 'completed' or self.current_progress >= self.target_value
    
    @property
    def is_expired(self):
        """Verifica si el desafío ha expirado"""
        return date.today() > self.end_date and self.status != 'completed'
    
    def update_progress(self, increment=1):
        """Actualiza el progreso del desafío"""
        self.current_progress += increment
        
        if self.current_progress >= self.target_value and self.status == 'active':
            self.complete_challenge()
    
    def complete_challenge(self):
        """Marca el desafío como completado y otorga recompensas"""
        if self.status != 'active':
            return False
        
        self.status = 'completed'
        self.completed_at = datetime.utcnow()
        
        # Otorgar recompensas al usuario
        if self.reward_points > 0 or self.reward_credits > 0:
            from .user import User
            user = User.query.get(self.user_id)
            if user:
                user.add_points(self.reward_points)
                user.free_credits += self.reward_credits
                
                # Crear registro de recompensa
                reward = UserReward(
                    user_id=self.user_id,
                    reward_type='challenge_completion',
                    points_awarded=self.reward_points,
                    credits_awarded=self.reward_credits,
                    description=f"Desafío completado: {self.title}"
                )
                reward.set_metadata({
                    'challenge_id': self.id,
                    'challenge_type': self.challenge_type
                })
                db.session.add(reward)
        
        return True
    
    def to_dict(self):
        """Convierte el desafío a diccionario"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'challenge_type': self.challenge_type,
            'title': self.title,
            'description': self.description,
            'target_value': self.target_value,
            'current_progress': self.current_progress,
            'progress_percentage': round(self.progress_percentage, 1),
            'reward_points': self.reward_points,
            'reward_credits': self.reward_credits,
            'status': self.status,
            'is_completed': self.is_completed,
            'is_expired': self.is_expired,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'challenge_config': self.get_challenge_config(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Achievement(db.Model):
    __tablename__ = 'achievements'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Información del logro
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    icon = db.Column(db.String(255))  # URL o nombre del icono
    category = db.Column(db.String(50), index=True)
    
    # Dificultad y recompensas
    difficulty = db.Column(db.String(20), default='easy')  # easy, medium, hard, legendary
    reward_points = db.Column(db.Integer, default=0)
    reward_credits = db.Column(db.Integer, default=0)
    
    # Criterios de desbloqueo
    unlock_criteria = db.Column(db.Text, nullable=False)  # JSON con criterios
    
    # Estado
    is_active = db.Column(db.Boolean, default=True)
    is_hidden = db.Column(db.Boolean, default=False)  # Logros secretos
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Achievement {self.name}>'
    
    def get_unlock_criteria(self):
        """Obtiene los criterios de desbloqueo como dict"""
        try:
            return json.loads(self.unlock_criteria)
        except:
            return {}
    
    def set_unlock_criteria(self, criteria):
        """Establece los criterios de desbloqueo"""
        self.unlock_criteria = json.dumps(criteria)
    
    def to_dict(self):
        """Convierte el logro a diccionario"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'category': self.category,
            'difficulty': self.difficulty,
            'reward_points': self.reward_points,
            'reward_credits': self.reward_credits,
            'unlock_criteria': self.get_unlock_criteria(),
            'is_active': self.is_active,
            'is_hidden': self.is_hidden,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class UserAchievement(db.Model):
    __tablename__ = 'user_achievements'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    achievement_id = db.Column(db.String(36), db.ForeignKey('achievements.id', ondelete='CASCADE'), nullable=False)
    
    # Información del desbloqueo
    unlocked_at = db.Column(db.DateTime, default=datetime.utcnow)
    progress_when_unlocked = db.Column(db.Text, default='{}')  # JSON con progreso al momento del desbloqueo
    
    # Relaciones
    user = db.relationship('User', backref='user_achievements')
    achievement = db.relationship('Achievement', backref='user_achievements')
    
    # Índice único para evitar duplicados
    __table_args__ = (db.UniqueConstraint('user_id', 'achievement_id', name='unique_user_achievement'),)
    
    def __repr__(self):
        return f'<UserAchievement {self.user_id} - {self.achievement.name if self.achievement else "Unknown"}>'
    
    def get_progress_when_unlocked(self):
        """Obtiene el progreso al momento del desbloqueo"""
        try:
            return json.loads(self.progress_when_unlocked)
        except:
            return {}
    
    def set_progress_when_unlocked(self, progress):
        """Establece el progreso al momento del desbloqueo"""
        self.progress_when_unlocked = json.dumps(progress)
    
    def to_dict(self):
        """Convierte el logro de usuario a diccionario"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'achievement': self.achievement.to_dict() if self.achievement else None,
            'unlocked_at': self.unlocked_at.isoformat() if self.unlocked_at else None,
            'progress_when_unlocked': self.get_progress_when_unlocked()
        }

