from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class ConversionTransaction(db.Model):
    __tablename__ = 'conversion_transactions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='SET NULL'), index=True)
    session_id = db.Column(db.String(255), index=True)  # Para usuarios anónimos
    file_id = db.Column(db.String(36), db.ForeignKey('files.id', ondelete='CASCADE'))
    
    # Información de pago
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='EUR')
    
    # Integración con Stripe
    stripe_payment_intent_id = db.Column(db.String(255), unique=True, index=True)
    stripe_charge_id = db.Column(db.String(255), index=True)
    
    # Estado del pago
    payment_status = db.Column(db.String(50), default='pending', index=True)
    # Posibles estados: pending, processing, completed, failed, canceled, refunded
    
    payment_method = db.Column(db.String(50))  # card, paypal, etc.
    
    # Información de reembolso
    refund_amount = db.Column(db.Numeric(10, 2))
    refund_reason = db.Column(db.String(255))
    refunded_at = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    completed_at = db.Column(db.DateTime)
    
    # Relación con archivo
    file = db.relationship('File', backref='transaction', uselist=False)
    
    def __repr__(self):
        return f'<ConversionTransaction {self.id} - {self.amount} {self.currency}>'
    
    @property
    def is_completed(self):
        """Verifica si la transacción está completada"""
        return self.payment_status == 'completed'
    
    @property
    def is_refunded(self):
        """Verifica si la transacción fue reembolsada"""
        return self.payment_status == 'refunded'
    
    @property
    def net_amount(self):
        """Monto neto después de reembolsos"""
        if self.is_refunded and self.refund_amount:
            return float(self.amount) - float(self.refund_amount)
        return float(self.amount)
    
    def process_refund(self, amount=None, reason=None):
        """Procesa un reembolso"""
        if not self.is_completed:
            raise ValueError("No se puede reembolsar una transacción no completada")
        
        if amount is None:
            amount = self.amount
        
        self.refund_amount = amount
        self.refund_reason = reason
        self.refunded_at = datetime.utcnow()
        self.payment_status = 'refunded'
    
    def to_dict(self):
        """Convierte la transacción a diccionario"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_id': self.session_id,
            'file_id': self.file_id,
            'file': self.file.to_dict() if self.file else None,
            'amount': float(self.amount),
            'currency': self.currency,
            'stripe_payment_intent_id': self.stripe_payment_intent_id,
            'stripe_charge_id': self.stripe_charge_id,
            'payment_status': self.payment_status,
            'payment_method': self.payment_method,
            'is_completed': self.is_completed,
            'is_refunded': self.is_refunded,
            'refund_amount': float(self.refund_amount) if self.refund_amount else None,
            'refund_reason': self.refund_reason,
            'refunded_at': self.refunded_at.isoformat() if self.refunded_at else None,
            'net_amount': self.net_amount,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

