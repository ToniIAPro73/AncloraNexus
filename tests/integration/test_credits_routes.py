import pytest
<<<<<<< HEAD
from flask_jwt_extended import create_access_token
from src.models.user import User, db


@pytest.fixture
def mock_transaction(monkeypatch):
    """Evita que se persistan transacciones reales."""
    class DummyTransaction:
        def __init__(self, user_id, amount, transaction_type, description, conversion_id=None):
            self.user_id = user_id
            self.amount = amount
            self.transaction_type = transaction_type
            self.description = description
            self.conversion_id = conversion_id

        def to_dict(self):
            return {
                'user_id': self.user_id,
                'amount': self.amount,
                'transaction_type': self.transaction_type,
                'description': self.description,
                'conversion_id': self.conversion_id,
            }

    from src.routes import credits

    monkeypatch.setattr(credits, 'CreditTransaction', DummyTransaction)

    original_add = credits.db.session.add

    def add_no_transaction(obj):
        if isinstance(obj, DummyTransaction):
            return None
        return original_add(obj)

    monkeypatch.setattr(credits.db.session, 'add', add_no_transaction)
=======
>>>>>>> main


@pytest.mark.integration
@pytest.mark.credits
class TestCreditsRoutes:
    def test_get_balance(self, client, auth_headers):
        resp = client.get('/api/credits/balance', headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['credits'] == 10

<<<<<<< HEAD
    def test_purchase_credits(self, client, auth_headers, mock_transaction):
=======
    def test_purchase_credits(self, client, auth_headers):
>>>>>>> main
        resp = client.post('/api/credits/purchase', json={'amount': 50}, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['new_balance'] == 60
<<<<<<< HEAD

    def test_purchase_insufficient_balance(self, client, auth_headers, mock_transaction, monkeypatch):
        def fail_add_credits(self, amount):
            raise ValueError('Saldo insuficiente')

        monkeypatch.setattr('src.routes.credits.User.add_credits', fail_add_credits)
        resp = client.post('/api/credits/purchase', json={'amount': 50}, headers=auth_headers)
        assert resp.status_code == 500
        assert 'Saldo insuficiente' in resp.get_json()['error']

    def test_gift_credits(self, client, app, auth_headers, mock_transaction):
        # Crear usuario administrador
        with app.app_context():
            admin = User(email='admin@example.com', full_name='Admin', plan='ENTERPRISE')
            admin.set_password('Password1')
            db.session.add(admin)
            db.session.commit()
            token = create_access_token(identity=str(admin.id))

        headers = {'Authorization': f'Bearer {token}'}
        resp = client.post(
            '/api/credits/gift',
            json={'recipient_email': 'integration@example.com', 'amount': 5},
            headers=headers,
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['recipient_new_balance'] == 15

    def test_upgrade_plan(self, client, app, auth_headers, mock_transaction):
        resp = client.post('/api/credits/upgrade-plan', json={'plan': 'BASIC'}, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['new_plan'] == 'BASIC'
        assert data['new_balance'] == 100

        with app.app_context():
            user = User.query.filter_by(email='integration@example.com').first()
            assert user.plan == 'BASIC'
            assert user.credits == 100

    def test_upgrade_plan_invalid(self, client, auth_headers):
        resp = client.post('/api/credits/upgrade-plan', json={'plan': 'PREMIUM'}, headers=auth_headers)
        assert resp.status_code == 400
        assert 'valid_plans' in resp.get_json()

    def test_usage_stats(self, client, auth_headers):
        resp = client.get('/api/credits/usage-stats', headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'current_balance' in data
        assert 'usage_summary' in data
        assert 'daily_usage' in data
=======
>>>>>>> main
