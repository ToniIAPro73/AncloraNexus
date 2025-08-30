import pytest
import bcrypt
from datetime import datetime, date
from src.models.user import User, db


class TestUserPasswordMethods:
    """Pruebas para los mÃ©todos de contraseÃ±a de la clase User"""
    
    def test_set_password_hashes_correctly(self, app, user_data):
        """Prueba que set_password hashea la contraseÃ±a correctamente"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name']
            )
            password = 'testpassword123'
            user.set_password(password)
            
            # Verificar que la contraseÃ±a se ha hasheado
            assert user.password_hash is not None
            assert user.password_hash != password
            assert len(user.password_hash) > 0
            
            # Verificar que el hash es vÃ¡lido usando bcrypt directamente
            assert bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8'))
    
    def test_set_password_with_special_characters(self, app, user_data):
        """Prueba que set_password funciona con caracteres especiales"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name']
            )
            password = 'test@Pass#123$%^&*()'
            user.set_password(password)
            
            # Verificar que funciona con caracteres especiales
            assert user.check_password(password) is True
            assert user.check_password('wrongpassword') is False
    
    def test_check_password_validates_correct_password(self, app, user_data):
        """Prueba que check_password devuelve True para una contraseÃ±a correcta"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name']
            )
            password = 'testpassword123'
            user.set_password(password)
            
            # Verificar que la contraseÃ±a correcta devuelve True
            assert user.check_password(password) is True
    
    def test_check_password_rejects_wrong_password(self, app, user_data):
        """Prueba que check_password devuelve False para una contraseÃ±a incorrecta"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name']
            )
            user.set_password('testpassword123')
            
            # Verificar que una contraseÃ±a incorrecta devuelve False
            assert user.check_password('wrongpassword') is False
            assert user.check_password('') is False
            assert user.check_password('test') is False
    
    def test_password_hashing_is_different_each_time(self, app, user_data):
        """Prueba que el mismo password genera hashes diferentes cada vez"""
        with app.app_context():
            user1 = User(
                email='user1@example.com',
                full_name='User One'
            )
            user2 = User(
                email='user2@example.com',
                full_name='User Two'
            )
            
            password = 'samepassword123'
            user1.set_password(password)
            user2.set_password(password)
            
            # Los hashes deberÃ­an ser diferentes (bcrypt usa salt aleatorio)
            assert user1.password_hash != user2.password_hash
            
            # Pero ambos deberÃ­an validar la misma contraseÃ±a
            assert user1.check_password(password) is True
            assert user2.check_password(password) is True
    
    def test_password_with_unicode_characters(self, app, user_data):
        """Prueba que set_password funciona con caracteres Unicode"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name']
            )
            password = 'contraseÃ±a123-Ã±Ã¡Ã©Ã­Ã³Ãº-ðŸ”’'
            user.set_password(password)
            
            # Verificar que funciona con caracteres Unicode
            assert user.check_password(password) is True
            assert user.check_password('wrongpassword') is False


class TestUserCreditsMethods:
    """Pruebas para los mÃ©todos de crÃ©ditos de la clase User"""
    
    def test_consume_credits_with_sufficient_balance(self, app, user_data):
        """Prueba que consume_credits resta los crÃ©ditos correctamente cuando hay saldo suficiente"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name'],
                credits=10,
                credits_used_today=2,
                credits_used_this_month=5,
                total_conversions=3
            )
            
            initial_credits = user.credits
            initial_used_today = user.credits_used_today
            initial_used_month = user.credits_used_this_month
            initial_conversions = user.total_conversions
            amount_to_consume = 3
            
            # Consumir crÃ©ditos
            result = user.consume_credits(amount_to_consume)
            
            # Verificar que la operaciÃ³n fue exitosa
            assert result is True
            
            # Verificar que los crÃ©ditos se restaron correctamente
            assert user.credits == initial_credits - amount_to_consume
            
            # Verificar que las estadÃ­sticas se actualizaron
            assert user.credits_used_today == initial_used_today + amount_to_consume
            assert user.credits_used_this_month == initial_used_month + amount_to_consume
            assert user.total_conversions == initial_conversions + 1
    
    def test_consume_credits_exact_balance(self, app, user_data):
        """Prueba que consume_credits funciona cuando se consumen exactamente todos los crÃ©ditos"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name'],
                credits=5,
                credits_used_today=0,
                credits_used_this_month=0,
                total_conversions=0
            )
            
            # Consumir exactamente todos los crÃ©ditos
            result = user.consume_credits(5)
            
            # Verificar que la operaciÃ³n fue exitosa
            assert result is True
            assert user.credits == 0
            assert user.credits_used_today == 5
            assert user.credits_used_this_month == 5
            assert user.total_conversions == 1
    
    def test_consume_credits_zero_amount(self, app, user_data):
        """Prueba que consume_credits funciona correctamente con cantidad cero"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name'],
                credits=10,
                credits_used_today=2,
                credits_used_this_month=5,
                total_conversions=3
            )
            
            initial_credits = user.credits
            initial_used_today = user.credits_used_today
            initial_used_month = user.credits_used_this_month
            initial_conversions = user.total_conversions
            
            # Consumir 0 crÃ©ditos
            result = user.consume_credits(0)
            
            # Verificar que la operaciÃ³n fue exitosa
            assert result is True
            assert user.credits == initial_credits
            assert user.credits_used_today == initial_used_today
            assert user.credits_used_this_month == initial_used_month
            assert user.total_conversions == initial_conversions + 1  # Se cuenta como conversiÃ³n
    
    def test_consume_credits_insufficient_balance(self, app, user_data):
        """Prueba que consume_credits devuelve False cuando no hay saldo suficiente"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name'],
                credits=5,
                credits_used_today=2,
                credits_used_this_month=10,
                total_conversions=5
            )
            
            initial_credits = user.credits
            initial_used_today = user.credits_used_today
            initial_used_month = user.credits_used_this_month
            initial_conversions = user.total_conversions
            amount_to_consume = 10  # MÃ¡s de lo que tiene disponible
            
            # Intentar consumir mÃ¡s crÃ©ditos de los disponibles
            result = user.consume_credits(amount_to_consume)
            
            # Verificar que la operaciÃ³n fallÃ³
            assert result is False
            
            # Verificar que nada cambiÃ³
            assert user.credits == initial_credits
            assert user.credits_used_today == initial_used_today
            assert user.credits_used_this_month == initial_used_month
            assert user.total_conversions == initial_conversions
    
    def test_add_credits_increases_balance_correctly(self, app, user_data):
        """Prueba que add_credits aÃ±ade los crÃ©ditos correctamente"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name'],
                credits=10
            )
            
            initial_credits = user.credits
            credits_to_add = 25
            
            # AÃ±adir crÃ©ditos
            user.add_credits(credits_to_add)
            
            # Verificar que los crÃ©ditos se aÃ±adieron correctamente
            assert user.credits == initial_credits + credits_to_add
    
    def test_add_credits_with_zero(self, app, user_data):
        """Prueba que add_credits funciona correctamente con cero crÃ©ditos"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name'],
                credits=10
            )
            
            initial_credits = user.credits
            
            # AÃ±adir cero crÃ©ditos
            user.add_credits(0)
            
            # Verificar que no cambia nada
            assert user.credits == initial_credits
    
    def test_add_credits_with_large_amount(self, app, user_data):
        """Prueba que add_credits funciona con cantidades grandes"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name'],
                credits=10
            )
            
            initial_credits = user.credits
            large_amount = 10000
            
            # AÃ±adir gran cantidad de crÃ©ditos
            user.add_credits(large_amount)
            
            # Verificar que se aÃ±adieron correctamente
            assert user.credits == initial_credits + large_amount


class TestUserUtilityMethods:
    """Pruebas para mÃ©todos utilitarios de la clase User"""
    
    def test_reset_daily_usage_sets_zero(self, app, user_data):
        """Prueba que reset_daily_usage resetea el uso diario a cero"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name'],
                credits_used_today=15,
                last_reset_date=date(2024, 1, 1)
            )
            
            # Resetear uso diario
            user.reset_daily_usage()
            
            # Verificar que el uso diario se resetÃ³
            assert user.credits_used_today == 0
            assert user.last_reset_date == datetime.utcnow().date()
    
    def test_get_plan_info_returns_correct_data(self, app, user_data):
        """Prueba que get_plan_info devuelve la informaciÃ³n correcta del plan"""
        with app.app_context():
            # Probar plan FREE
            user_free = User(
                email=user_data['email'],
                full_name=user_data['full_name'],
                plan='FREE'
            )
            
            plan_info = user_free.get_plan_info()
            assert plan_info['name'] == 'Gratuito'
            assert plan_info['monthly_credits'] == 10
            assert plan_info['daily_limit'] == 5
            assert 'Conversiones bÃ¡sicas' in plan_info['features']
            
            # Probar plan BASIC
            user_basic = User(
                email='basic@example.com',
                full_name='Basic User',
                plan='BASIC'
            )
            
            plan_info = user_basic.get_plan_info()
            assert plan_info['name'] == 'BÃ¡sico'
            assert plan_info['price'] == 9.99
            assert plan_info['monthly_credits'] == 100
            assert plan_info['daily_limit'] == 50
            
            # Probar plan PRO
            user_pro = User(
                email='pro@example.com',
                full_name='Pro User',
                plan='PRO'
            )
            
            plan_info = user_pro.get_plan_info()
            assert plan_info['name'] == 'Profesional'
            assert plan_info['price'] == 29.99
            assert plan_info['monthly_credits'] == 500
            assert plan_info['daily_limit'] == 200
            
            # Probar plan ENTERPRISE
            user_enterprise = User(
                email='enterprise@example.com',
                full_name='Enterprise User',
                plan='ENTERPRISE'
            )
            
            plan_info = user_enterprise.get_plan_info()
            assert plan_info['name'] == 'Empresarial'
            assert plan_info['price'] == 99.99
            assert plan_info['monthly_credits'] == 2000
            assert plan_info['daily_limit'] == 1000
            
            # Probar plan invÃ¡lido (deberÃ­a devolver FREE por defecto)
            user_invalid = User(
                email='invalid@example.com',
                full_name='Invalid User',
                plan='INVALID_PLAN'
            )
            
            plan_info = user_invalid.get_plan_info()
            assert plan_info['name'] == 'Gratuito'  # Plan FREE por defecto


class TestUserModelIntegration:
    """Pruebas de integraciÃ³n para la clase User"""
    
    def test_user_creation_with_defaults(self, app):
        """Prueba que un usuario se cree con valores por defecto correctos"""
        with app.app_context():
            user = User(
                email='test@example.com',
                full_name='Test User'
            )
            user.set_password('password123')
            db.session.add(user)
            db.session.commit()
            
            # Verificar valores por defecto
            assert user.plan == 'FREE'
            assert user.credits == 10
            assert user.total_conversions == 0
            assert user.credits_used_today == 0
            assert user.credits_used_this_month == 0
            assert user.is_active is True
            assert user.created_at is not None
            assert user.updated_at is not None
    
    def test_user_repr_method(self, app, user_data):
        """Prueba que el mÃ©todo __repr__ funciona correctamente"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name']
            )
            
            # Verificar representaciÃ³n string
            expected_repr = f'<User {user_data["email"]}>'
            assert repr(user) == expected_repr
            assert str(user) == expected_repr
    
    def test_user_to_dict_method(self, app, user_data):
        """Prueba que el mÃ©todo to_dict funciona correctamente"""
        with app.app_context():
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name'],
                plan='BASIC',
                credits=50,
                total_conversions=5
            )
            user.set_password('password123')
            db.session.add(user)
            db.session.commit()
            
            # Probar sin informaciÃ³n sensible
            user_dict = user.to_dict()
            
            assert user_dict['email'] == user_data['email']
            assert user_dict['full_name'] == user_data['full_name']
            assert user_dict['plan'] == 'BASIC'
            assert user_dict['credits'] == 50
            assert user_dict['total_conversions'] == 5
            assert 'password_hash' not in user_dict
            assert 'plan_info' in user_dict
            
            # Probar con informaciÃ³n sensible
            user_dict_sensitive = user.to_dict(include_sensitive=True)
            assert 'password_hash' in user_dict_sensitive
            assert user_dict_sensitive['password_hash'] == user.password_hash
