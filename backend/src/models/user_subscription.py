from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class UserSubscription(db.Model):
    __tablename__ = 'user_subscriptions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    plan_id = db.Column(db.String(36), db.ForeignKey('subscription_plans.id'), nullable=False)
    
    # Integración con Stripe
    stripe_subscription_id = db.Column(db.String(255), unique=True, index=True)
    stripe_customer_id = db.Column(db.String(255), index=True)
    
    # Estado de la suscripción
    status = db.Column(db.String(50), nullable=False, default='active', index=True)
    # Posibles estados: active, past_due, canceled, unpaid, trialing, incomplete
    
    # Períodos de facturación
    current_period_start = db.Column(db.DateTime, nullable=False)
    current_period_end = db.Column(db.DateTime, nullable=False, index=True)
    
    # Cancelación
    cancel_at_period_end = db.Column(db.Boolean, default=False)
    canceled_at = db.Column(db.DateTime)
    cancellation_reason = db.Column(db.String(255))
    
    # Período de prueba
    trial_start = db.Column(db.DateTime)
    trial_end = db.Column(db.DateTime)
    
    # Uso mensual
    conversions_used_this_month = db.Column(db.Integer, default=0)
    month_reset_date = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<UserSubscription {self.user_id} - {self.plan.name if self.plan else "Unknown"}>'
    
    @property
    def is_active(self):
        """Verifica si la suscripción está activa"""
        return self.status == 'active' and datetime.utcnow() <= self.current_period_end
    
    @property
    def is_trial(self):
        """Verifica si está en período de prueba"""
        if not self.trial_start or not self.trial_end:
            return False
        now = datetime.utcnow()
        return self.trial_start <= now <= self.trial_end
    
    @property
    def days_until_renewal(self):
        """Días hasta la renovación"""
        if self.current_period_end:
            delta = self.current_period_end - datetime.utcnow()
            return max(0, delta.days)
        return 0
    
    @property
    def conversions_remaining_this_month(self):
        """Conversiones restantes este mes"""
        if not self.plan or self.plan.max_conversions_monthly is None:
            return None  # Ilimitado
        
        used = self.conversions_used_this_month or 0
        return max(0, self.plan.max_conversions_monthly - used)
    
    def reset_monthly_usage(self):
        """Resetea el uso mensual"""
        self.conversions_used_this_month = 0
        self.month_reset_date = datetime.utcnow()
    
    def increment_conversions_used(self, count=1):
        """Incrementa el contador de conversiones usadas"""
        if self.conversions_used_this_month is None:
            self.conversions_used_this_month = 0
        self.conversions_used_this_month += count
    
    def can_convert(self):
        """Verifica si puede realizar más conversiones"""
        if not self.is_active:
            return False, "Suscripción no activa"
        
        if self.plan.max_conversions_monthly is None:
            return True, "Conversiones ilimitadas"
        
        remaining = self.conversions_remaining_this_month
        if remaining is None or remaining > 0:
            return True, f"Conversiones restantes: {remaining}"
        
        return False, "Límite mensual de conversiones alcanzado"
    
    def to_dict(self):
        """Convierte la suscripción a diccionario"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan': self.plan.to_dict() if self.plan else None,
            'stripe_subscription_id': self.stripe_subscription_id,
            'stripe_customer_id': self.stripe_customer_id,
            'status': self.status,
            'is_active': self.is_active,
            'is_trial': self.is_trial,
            'current_period_start': self.current_period_start.isoformat() if self.current_period_start else None,
            'current_period_end': self.current_period_end.isoformat() if self.current_period_end else None,
            'days_until_renewal': self.days_until_renewal,
            'cancel_at_period_end': self.cancel_at_period_end,
            'canceled_at': self.canceled_at.isoformat() if self.canceled_at else None,
            'cancellation_reason': self.cancellation_reason,
            'trial_start': self.trial_start.isoformat() if self.trial_start else None,
            'trial_end': self.trial_end.isoformat() if self.trial_end else None,
            'conversions_used_this_month': self.conversions_used_this_month,
            'conversions_remaining_this_month': self.conversions_remaining_this_month,
            'month_reset_date': self.month_reset_date.isoformat() if self.month_reset_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

