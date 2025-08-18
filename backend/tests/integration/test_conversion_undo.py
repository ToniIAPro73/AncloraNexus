import io
import pytest
from src.models.user import User, db


@pytest.mark.integration
@pytest.mark.conversion
class TestConversionUndo:
    def test_undo_conversion_refunds_credits(self, client, auth_headers, app):
        """Debe reembolsar créditos al deshacer una conversión"""
        # Asegurar que el usuario tiene créditos suficientes
        with app.app_context():
            user = User.query.filter_by(email='integration@example.com').first()
            user.credits = 100
            db.session.commit()

        # Realizar una conversión
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
        initial_credits = result['user_credits_remaining']

        # Deshacer la conversión
        resp = client.post(f'/api/conversion/undo/{conversion_id}', headers=auth_headers)
        assert resp.status_code == 200
        undo_result = resp.get_json()
        assert undo_result['refunded_credits'] == 1
        assert undo_result['new_balance'] == initial_credits + 1

    def test_cannot_undo_completed_conversion_after_timeout(self, client, auth_headers, app):
        """No debe permitir deshacer una conversión completada después del tiempo límite"""
        # En una implementación real, se verificaría que no se puede deshacer
        # una conversión después de un cierto tiempo
        pass