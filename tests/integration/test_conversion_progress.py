import io
import pytest

from src.ws import socketio


@pytest.mark.integration
class TestConversionProgress:
    def test_conversion_emits_progress_events(self, app, client, auth_headers):
        socketio.init_app(app)
        sio_client = socketio.test_client(app, flask_test_client=client)

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

        received = [e['args'][0] for e in sio_client.get_received() if e['name'] == 'conversion_progress']
        expected = [
            {'conversion_id': conversion_id, 'phase': 'preprocess', 'percent': 0},
            {'conversion_id': conversion_id, 'phase': 'preprocess', 'percent': 100},
            {'conversion_id': conversion_id, 'phase': 'convert', 'percent': 0},
            {'conversion_id': conversion_id, 'phase': 'convert', 'percent': 100},
            {'conversion_id': conversion_id, 'phase': 'postprocess', 'percent': 0},
            {'conversion_id': conversion_id, 'phase': 'postprocess', 'percent': 100},
        ]
        assert received == expected

        sio_client.disconnect()
