from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    
    # Plan y crÃ©ditos
    plan = db.Column(db.String(20), default='FREE', nullable=False)  # FREE, BASIC, PRO, ENTERPRISE
    credits = db.Column(db.Integer, default=10, nullable=False)
    
    # EstadÃ­sticas de uso
    total_conversions = db.Column(db.Integer, default=0, nullable=False)
    credits_used_today = db.Column(db.Integer, default=0, nullable=False)
    credits_used_this_month = db.Column(db.Integer, default=0, nullable=False)
    last_reset_date = db.Column(db.Date, default=datetime.utcnow().date())
    
    # Metadatos
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expiration = db.Column(db.DateTime, nullable=True)
    
    # Relaciones
    conversions = db.relationship('Conversion', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.email}>'

    def set_password(self, password):
        """Hash y guarda la contraseÃ±a"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        """Verifica la contraseÃ±a"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def consume_credits(self, amount):
        """Consume crÃ©ditos si hay suficientes disponibles"""
        if self.credits >= amount:
            self.credits -= amount
            self.credits_used_today += amount
            self.credits_used_this_month += amount
            self.total_conversions += 1
            return True
        return False

    def add_credits(self, amount):
        """AÃ±ade crÃ©ditos al usuario"""
        self.credits += amount

    def reset_daily_usage(self):
        """Resetea el uso diario de crÃ©ditos"""
        self.credits_used_today = 0
        self.last_reset_date = datetime.utcnow().date()

    def get_plan_info(self):
        """Retorna informaciÃ³n del plan actual"""
        plans = {
            'FREE': {
                'name': 'Gratuito',
                'monthly_credits': 10,
                'daily_limit': 5,
                'features': ['Conversiones bÃ¡sicas', 'Soporte por email']
            },
            'BASIC': {
                'name': 'BÃ¡sico',
                'price': 9.99,
                'monthly_credits': 100,
                'daily_limit': 50,
                'features': ['Todas las conversiones', 'Soporte prioritario', 'Sin marca de agua']
            },
            'PRO': {
                'name': 'Profesional',
                'price': 29.99,
                'monthly_credits': 500,
                'daily_limit': 200,
                'features': ['Conversiones ilimitadas', 'API access', 'Workflows personalizados']
            },
            'ENTERPRISE': {
                'name': 'Empresarial',
                'price': 99.99,
                'monthly_credits': 2000,
                'daily_limit': 1000,
                'features': ['Todo incluido', 'Soporte dedicado', 'IntegraciÃ³n personalizada']
            }
        }
        return plans.get(self.plan, plans['FREE'])

    def to_dict(self, include_sensitive=False):
        """Convierte el usuario a diccionario"""
        data = {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'plan': self.plan,
            'credits': self.credits,
            'total_conversions': self.total_conversions,
            'credits_used_today': self.credits_used_today,
            'credits_used_this_month': self.credits_used_this_month,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active,
            'plan_info': self.get_plan_info()
        }
        
        if include_sensitive:
            data['password_hash'] = self.password_hash
            
        return data


class Conversion(db.Model):
    __tablename__ = 'conversions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # InformaciÃ³n del archivo
    original_filename = db.Column(db.String(255), nullable=False)
    original_format = db.Column(db.String(10), nullable=False)
    target_format = db.Column(db.String(10), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)  # en bytes
    
    # InformaciÃ³n de la conversiÃ³n
    conversion_type = db.Column(db.String(50), nullable=False)  # ej: "txt-html"
    credits_used = db.Column(db.Integer, nullable=False)
    processing_time = db.Column(db.Float)  # en segundos
    
    # Estado y resultado
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending, completed, failed
    error_message = db.Column(db.Text)
    output_filename = db.Column(db.String(255))
    
    # Metadatos
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    completed_at = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<Conversion {self.original_filename} -> {self.target_format}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'original_filename': self.original_filename,
            'original_format': self.original_format,
            'target_format': self.target_format,
            'file_size': self.file_size,
            'conversion_type': self.conversion_type,
            'credits_used': self.credits_used,
            'processing_time': self.processing_time,
            'status': self.status,
            'error_message': self.error_message,
            'output_filename': self.output_filename,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class CreditTransaction(db.Model):
    __tablename__ = 'credit_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # InformaciÃ³n de la transacciÃ³n
    amount = db.Column(db.Integer, nullable=False)  # positivo para aÃ±adir, negativo para consumir
    transaction_type = db.Column(db.String(20), nullable=False)  # purchase, conversion, bonus, refund
    description = db.Column(db.String(255))
    
    # Referencia a conversiÃ³n si aplica
    conversion_id = db.Column(db.Integer, db.ForeignKey('conversions.id'))
    
    # Metadatos
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f'<CreditTransaction {self.amount} credits for user {self.user_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': self.amount,
            'transaction_type': self.transaction_type,
            'description': self.description,
            'conversion_id': self.conversion_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


