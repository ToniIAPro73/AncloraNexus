from datetime import datetime
from .user import db

class ConversionHistory(db.Model):
    __tablename__ = 'conversion_history'

    id = db.Column(db.Integer, primary_key=True)
    conversion_id = db.Column(db.Integer, db.ForeignKey('conversions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    original_filename = db.Column(db.String(255), nullable=False)
    original_format = db.Column(db.String(10), nullable=False)
    target_format = db.Column(db.String(10), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)

    conversion_type = db.Column(db.String(50), nullable=False)
    credits_used = db.Column(db.Integer, nullable=False)
    processing_time = db.Column(db.Float)

    status = db.Column(db.String(20), nullable=False)
    error_message = db.Column(db.Text)
    output_filename = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    completed_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.conversion_id,
            'conversion_id': self.conversion_id,
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
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
        }
