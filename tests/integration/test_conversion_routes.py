import io
import pytest


@pytest.mark.integration
@pytest.mark.conversion
class TestConversionRoutes:
    def test_convert_txt_to_html(self, client, auth_headers):
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
        result = resp.get_json()
        assert result['conversion']['status'] == 'completed'
        assert result['user_credits_remaining'] == 9
