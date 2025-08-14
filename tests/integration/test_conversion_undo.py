import io
import os
import pytest

from src.models.conversion_log import ConversionLog


@pytest.mark.integration
@pytest.mark.conversion
class TestConversionUndo:
    def test_undo_restores_original(self, client, auth_headers, app):
        data = {
            'file': (io.BytesIO(b'hello world'), 'test.txt'),
            'target_format': 'html'
        }
        resp = client.post(
            '/api/conversion/convert',
            data=data,
            headers=auth_headers,
            content_type='multipart/form-data'
        )
        assert resp.status_code == 200
        conversion_id = resp.get_json()['conversion']['id']

        with app.app_context():
            log = ConversionLog.query.filter_by(conversion_id=conversion_id).first()
            assert log is not None
            output_path = log.output_path
            backup_path = log.backup_path

        # El archivo convertido debe contener HTML
        with open(output_path, 'r') as f:
            converted = f.read()
        assert '<html' in converted.lower()

        # Ejecutar undo
        resp = client.delete(f'/api/conversion/conversions/{conversion_id}', headers=auth_headers)
        assert resp.status_code == 200

        # El archivo restaurado debe coincidir con el original
        with open(output_path, 'r') as f:
            restored = f.read()
        assert restored == 'hello world'

        # El backup permanece disponible
        assert os.path.exists(backup_path)
