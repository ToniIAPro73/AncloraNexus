from datetime import datetime
from .user import db

class ConversionLog(db.Model):
    __tablename__ = 'conversion_logs'

    id = db.Column(db.Integer, primary_key=True)
    conversion_id = db.Column(db.Integer, db.ForeignKey('conversions.id'), nullable=False)
    file_hash = db.Column(db.String(64), nullable=False)
    output_path = db.Column(db.String(255), nullable=False)
    backup_path = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    conversion = db.relationship('Conversion', backref=db.backref('log', uselist=False, cascade='all, delete-orphan'))

