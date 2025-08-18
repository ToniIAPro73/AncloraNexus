import io
import pytest
from src.models.user import User, db


@pytest.mark.integration
@pytest.mark.conversion
class TestConversionProgress:
    def test_conversion_status_updates(self, client, auth_headers, app):
        """Debe actualizar el estado de la conversión"""
        # Crear un usuario con créditos suficientes
        with app.app_context():
            user = User.query.filter_by(email='integration@example.com').first()
            user.credits = 100
            db.session.commit()

        data = {
            'file': (io.BytesIO(b'hello world'), 'test.txt'),
            'target_format': 'pdf'
        }
        resp = client.post(
            '/api/conversion/convert',
            data=data,
            headers=auth_headers,
            content_type='multipart/form-data'
        )
        assert resp.status_code == 200
        result = resp.get_json()
        conversion_id = result['conversion']['id']

        # Verificar estado inicial
        resp = client.get(f'/api/conversion/status/{conversion_id}', headers=auth_headers)
        assert resp.status_code == 200
        status_result = resp.get_json()
        assert status_result['status'] in ['pending', 'processing', 'completed']

    def test_conversion_history(self, client, auth_headers):
        """Debe mantener un historial de conversiones"""
        resp = client.get('/api/conversion/history', headers=auth_headers)
        assert resp.status_code == 200
        history = resp.get_json()
        assert isinstance(history, list)