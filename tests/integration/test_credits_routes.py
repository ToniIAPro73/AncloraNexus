import io
import pytest
from flask_jwt_extended import create_access_token
from src.models.user import User, db


@pytest.mark.integration
@pytest.mark.credits
class TestCreditsRoutes:
    def test_get_balance(self, client, auth_headers):
        resp = client.get('/api/credits/balance', headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['credits'] == 10

    def test_purchase_credits(self, client, auth_headers):
        resp = client.post('/api/credits/purchase', json={'amount': 50}, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['new_balance'] == 60

    def test_gift_credits(self, client, app):
        with app.app_context():
            admin = User(email='admin@example.com', full_name='Admin User', plan='ENTERPRISE', credits=100)
            admin.set_password('Password1')
            recipient = User(email='friend@example.com', full_name='Friend', credits=0)
            recipient.set_password('Password1')
            db.session.add_all([admin, recipient])
            db.session.commit()
            token = create_access_token(identity=str(admin.id))

        headers = {'Authorization': f'Bearer {token}'}
        payload = {'recipient_email': 'friend@example.com', 'amount': 5}
        resp = client.post('/api/credits/gift', json=payload, headers=headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['recipient_new_balance'] == 5

    def test_gift_credits_insufficient_permissions(self, client, auth_headers):
        """Non-enterprise users cannot gift credits"""
        payload = {'recipient_email': 'friend@example.com', 'amount': 5}
        resp = client.post('/api/credits/gift', json=payload, headers=auth_headers)
        assert resp.status_code == 403
        data = resp.get_json()
        assert data['error'] == 'Permisos insuficientes'

    def test_upgrade_plan(self, client, auth_headers):
        resp = client.post('/api/credits/upgrade-plan', json={'plan': 'BASIC'}, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['new_plan'] == 'BASIC'
        assert data['new_balance'] == 100

    def test_upgrade_plan_invalid(self, client, auth_headers):
        resp = client.post('/api/credits/upgrade-plan', json={'plan': 'PREMIUM'}, headers=auth_headers)
        assert resp.status_code == 400
        data = resp.get_json()
        assert data['error'] == 'Plan inválido'

    def test_upgrade_plan_same_plan(self, client, auth_headers):
        """Cannot upgrade to the current active plan"""
        resp = client.post('/api/credits/upgrade-plan', json={'plan': 'FREE'}, headers=auth_headers)
        assert resp.status_code == 400
        data = resp.get_json()
        assert data['error'] == 'Ya tienes este plan activo'

    def test_usage_stats(self, client, auth_headers):
        resp = client.get('/api/credits/usage-stats', headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['current_balance'] == 10

    def test_usage_stats_user_not_found(self, client, app):
        with app.app_context():
            token = create_access_token(identity='9999')
        headers = {'Authorization': f'Bearer {token}'}
        resp = client.get('/api/credits/usage-stats', headers=headers)
        assert resp.status_code == 404
        data = resp.get_json()
        assert data['error'] == 'Usuario no encontrado'

    def test_insufficient_credits(self, client, auth_headers, app):
        with app.app_context():
            user = User.query.filter_by(email='integration@example.com').first()
            user.credits = 0
            db.session.commit()

        data = {
            'file': (io.BytesIO(b'hello'), 'test.txt'),
            'target_format': 'html'
        }
        resp = client.post(
            '/api/conversion/convert',
            data=data,
            headers=auth_headers,
            content_type='multipart/form-data'
        )
        assert resp.status_code == 402
        result = resp.get_json()
        assert result['error'] == 'Créditos insuficientes'
