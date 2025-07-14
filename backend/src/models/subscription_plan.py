from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import json

db = SQLAlchemy()

class SubscriptionPlan(db.Model):
    __tablename__ = 'subscription_plans'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    
    # Precios
    price_monthly = db.Column(db.Numeric(10, 2), nullable=False)
    price_yearly = db.Column(db.Numeric(10, 2))
    currency = db.Column(db.String(3), default='EUR')
    
    # Límites y características
    max_conversions_monthly = db.Column(db.Integer)  # None = ilimitado
    max_file_size_mb = db.Column(db.Integer, nullable=False)
    file_retention_hours = db.Column(db.Integer, nullable=False)
    max_simultaneous_conversions = db.Column(db.Integer, default=1)
    
    # Funcionalidades booleanas
    api_access = db.Column(db.Boolean, default=False)
    batch_conversion = db.Column(db.Boolean, default=False)
    priority_processing = db.Column(db.Boolean, default=False)
    advanced_formats = db.Column(db.Boolean, default=False)
    
    # Funcionalidades adicionales (JSON)
    features = db.Column(db.Text, default='[]')
    
    # Estado
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones se configuran después de importar todos los modelos
    # subscriptions = db.relationship('UserSubscription', backref='plan', lazy=True)
    
    def __repr__(self):
        return f'<SubscriptionPlan {self.name}>'
    
    def get_features(self):
        """Obtiene las características como lista"""
        try:
            return json.loads(self.features)
        except:
            return []
    
    def set_features(self, features_list):
        """Establece las características"""
        self.features = json.dumps(features_list)
    
    def add_feature(self, feature):
        """Agrega una característica"""
        features = self.get_features()
        if feature not in features:
            features.append(feature)
            self.set_features(features)
    
    def remove_feature(self, feature):
        """Elimina una característica"""
        features = self.get_features()
        if feature in features:
            features.remove(feature)
            self.set_features(features)
    
    @property
    def yearly_discount_percentage(self):
        """Calcula el porcentaje de descuento anual"""
        if self.price_yearly and self.price_monthly:
            monthly_yearly = float(self.price_monthly) * 12
            yearly_price = float(self.price_yearly)
            discount = (monthly_yearly - yearly_price) / monthly_yearly * 100
            return round(discount, 1)
        return 0
    
    def to_dict(self):
        """Convierte el plan a diccionario"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price_monthly': float(self.price_monthly) if self.price_monthly else None,
            'price_yearly': float(self.price_yearly) if self.price_yearly else None,
            'currency': self.currency,
            'yearly_discount_percentage': self.yearly_discount_percentage,
            'max_conversions_monthly': self.max_conversions_monthly,
            'max_file_size_mb': self.max_file_size_mb,
            'file_retention_hours': self.file_retention_hours,
            'file_retention_days': round(self.file_retention_hours / 24, 1),
            'max_simultaneous_conversions': self.max_simultaneous_conversions,
            'api_access': self.api_access,
            'batch_conversion': self.batch_conversion,
            'priority_processing': self.priority_processing,
            'advanced_formats': self.advanced_formats,
            'features': self.get_features(),
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

