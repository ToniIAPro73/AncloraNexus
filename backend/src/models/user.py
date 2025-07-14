from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import bcrypt
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    avatar_url = db.Column(db.Text)
    
    # Verificación de email
    email_verified = db.Column(db.Boolean, default=False)
    email_verification_token = db.Column(db.String(255), index=True)
    
    # Reset de contraseña
    password_reset_token = db.Column(db.String(255), index=True)
    password_reset_expires = db.Column(db.DateTime)
    
    # Preferencias
    preferred_language = db.Column(db.String(10), default='es')
    timezone = db.Column(db.String(50), default='Europe/Madrid')
    notification_preferences = db.Column(db.Text, default='{"email": true, "browser": true}')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Estado
    is_active = db.Column(db.Boolean, default=True)
    oauth_providers = db.Column(db.Text, default='[]')
    
    # Sistema de recompensas
    level = db.Column(db.Integer, default=1)
    total_points = db.Column(db.Integer, default=0)
    free_credits = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    last_activity_date = db.Column(db.Date)
    
    # Relaciones se configuran después de importar todos los modelos
    # subscriptions = db.relationship('UserSubscription', backref='user', lazy=True, cascade='all, delete-orphan')
    # files = db.relationship('File', backref='user', lazy=True)
    # transactions = db.relationship('ConversionTransaction', backref='user', lazy=True)
    # rewards = db.relationship('UserReward', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def set_password(self, password):
        """Establece la contraseña hasheada"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        """Verifica la contraseña"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def get_notification_preferences(self):
        """Obtiene las preferencias de notificación como dict"""
        try:
            return json.loads(self.notification_preferences)
        except:
            return {"email": True, "browser": True}
    
    def set_notification_preferences(self, preferences):
        """Establece las preferencias de notificación"""
        self.notification_preferences = json.dumps(preferences)
    
    def get_oauth_providers(self):
        """Obtiene los proveedores OAuth como lista"""
        try:
            return json.loads(self.oauth_providers)
        except:
            return []
    
    def add_oauth_provider(self, provider):
        """Agrega un proveedor OAuth"""
        providers = self.get_oauth_providers()
        if provider not in providers:
            providers.append(provider)
            self.oauth_providers = json.dumps(providers)
    
    @property
    def current_subscription(self):
        """Obtiene la suscripción activa actual"""
        # Importación local para evitar dependencias circulares
        from src.models.user_subscription import UserSubscription
        return UserSubscription.query.filter_by(
            user_id=self.id,
            status='active'
        ).first()
    
    @property
    def full_name(self):
        """Obtiene el nombre completo"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        else:
            return self.email.split('@')[0]
    
    def update_activity_streak(self):
        """Actualiza la racha de actividad del usuario"""
        from datetime import date, timedelta
        
        today = date.today()
        
        if self.last_activity_date is None:
            # Primera actividad
            self.current_streak = 1
            self.longest_streak = 1
            self.last_activity_date = today
        elif self.last_activity_date == today:
            # Ya tuvo actividad hoy, no cambiar racha
            return
        elif self.last_activity_date == today - timedelta(days=1):
            # Actividad consecutiva
            self.current_streak += 1
            self.longest_streak = max(self.longest_streak, self.current_streak)
            self.last_activity_date = today
        else:
            # Se rompió la racha
            self.current_streak = 1
            self.last_activity_date = today
    
    def add_points(self, points):
        """Agrega puntos y actualiza nivel si es necesario"""
        self.total_points += points
        self.update_level()
    
    def update_level(self):
        """Actualiza el nivel basado en puntos totales"""
        level_thresholds = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000, 50000]
        
        for level, threshold in enumerate(level_thresholds, 1):
            if self.total_points >= threshold:
                self.level = level
            else:
                break
    
    def to_dict(self, include_sensitive=False):
        """Convierte el usuario a diccionario"""
        data = {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'avatar_url': self.avatar_url,
            'email_verified': self.email_verified,
            'preferred_language': self.preferred_language,
            'timezone': self.timezone,
            'notification_preferences': self.get_notification_preferences(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active,
            'oauth_providers': self.get_oauth_providers(),
            'level': self.level,
            'total_points': self.total_points,
            'free_credits': self.free_credits,
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'current_subscription': self.current_subscription.to_dict() if self.current_subscription else None
        }
        
        if include_sensitive:
            data.update({
                'email_verification_token': self.email_verification_token,
                'password_reset_token': self.password_reset_token,
                'password_reset_expires': self.password_reset_expires.isoformat() if self.password_reset_expires else None
            })
        
        return data

