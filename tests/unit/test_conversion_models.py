import pytest
from src.models.user import User, Conversion, CreditTransaction, db


class TestConversionModel:
    """Pruebas para el modelo Conversion"""

    def test_to_dict_and_defaults(self, app):
        """Conversion.to_dict debe incluir campos básicos y estado por defecto"""
        with app.app_context():
            user = User(email='conv@example.com', full_name='Conv Test')
            user.set_password('pass')
            db.session.add(user)
            db.session.commit()

            conversion = Conversion(
                user_id=user.id,
                original_filename='demo.txt',
                original_format='txt',
                target_format='html',
                file_size=100,
                conversion_type='txt-html',
                credits_used=1,
            )
            db.session.add(conversion)
            db.session.commit()

            data = conversion.to_dict()
            assert data['original_filename'] == 'demo.txt'
            assert data['status'] == 'pending'
            assert data['credits_used'] == 1
            assert data['output_filename'] is None

    def test_repr(self, app):
        with app.app_context():
            user = User(email='repr@example.com', full_name='Repr Test')
            user.set_password('pass')
            db.session.add(user)
            db.session.commit()

            conversion = Conversion(
                user_id=user.id,
                original_filename='file.pdf',
                original_format='pdf',
                target_format='txt',
                file_size=200,
                conversion_type='pdf-txt',
                credits_used=4,
            )
            assert repr(conversion) == '<Conversion file.pdf -> txt>'


class TestCreditTransactionModel:
    """Pruebas para el modelo CreditTransaction"""

    def test_to_dict(self, app):
        with app.app_context():
            user = User(email='credit@example.com', full_name='Credit Test')
            user.set_password('pass')
            db.session.add(user)
            db.session.commit()

            trans = CreditTransaction(
                user_id=user.id,
                amount=-5,
                transaction_type='conversion',
                description='Uso de créditos',
            )
            db.session.add(trans)
            db.session.commit()

            data = trans.to_dict()
            assert data['amount'] == -5
            assert data['transaction_type'] == 'conversion'
            assert data['description'] == 'Uso de créditos'

    def test_repr(self, app):
        with app.app_context():
            user = User(email='repr2@example.com', full_name='Repr2 Test')
            user.set_password('pass')
            db.session.add(user)
            db.session.commit()

            trans = CreditTransaction(
                user_id=user.id,
                amount=10,
                transaction_type='purchase',
            )
            assert repr(trans) == f'<CreditTransaction 10 credits for user {user.id}>'
