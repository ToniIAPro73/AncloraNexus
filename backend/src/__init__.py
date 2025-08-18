from flask import Flask
from flask_jwt_extended import JWTManager

from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.conversion import conversion_bp
from src.routes.credits import credits_bp


def create_app(config=None):
    app = Flask(__name__)
    app.config.update(
        SECRET_KEY="test-secret",
        JWT_SECRET_KEY="test-secret",
        SQLALCHEMY_DATABASE_URI="sqlite:///:memory:",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_IDENTITY_CLAIM="id",
    )
    if config:
        app.config.update(config)

    db.init_app(app)
    JWTManager(app)

    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(conversion_bp, url_prefix="/api/conversion")
    app.register_blueprint(credits_bp, url_prefix="/api/credits")

    return app
