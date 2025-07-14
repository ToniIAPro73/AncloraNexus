from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Importar modelos en orden correcto para evitar dependencias circulares
from .user import User
from .subscription_plan import SubscriptionPlan
from .user_subscription import UserSubscription
from .file import File
from .conversion_transaction import ConversionTransaction
from .reward_system import UserReward, Challenge, Achievement, UserAchievement

# Configurar relaciones después de importar todos los modelos
def configure_relationships():
    """Configura las relaciones entre modelos después de que todos estén definidos"""
    pass

# Llamar después de importar todos los modelos
configure_relationships()

