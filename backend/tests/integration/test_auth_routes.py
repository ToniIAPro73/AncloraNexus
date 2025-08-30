import pytest


@pytest.mark.integration
@pytest.mark.auth
class TestAuthRoutes:
    def test_register_and_login(self, client):
        """Debe permitir registrar y luego iniciar sesiÃ³n"""
        register_data = {
            'email': 'user@example.com',
            'password': 'Password1',
            'full_name': 'User Example'
        }
        resp = client.post('/api/auth/register', json=register_data)
        assert resp.status_code == 201
        assert 'access_token' in resp.get_json()

        login_data = {'email': 'user@example.com', 'password': 'Password1'}
        resp = client.post('/api/auth/login', json=login_data)
        assert resp.status_code == 200
        assert 'access_token' in resp.get_json()
