import io
import pytest
from PIL import Image


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

    def test_convert_png_to_webp(self, client, auth_headers):
        img_bytes = io.BytesIO()
        Image.new('RGB', (10, 10), color='blue').save(img_bytes, format='PNG')
        img_bytes.seek(0)
        data = {
            'file': (img_bytes, 'test.png'),
            'target_format': 'webp'
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

    def test_convert_svg_to_png(self, client, auth_headers):
        svg_data = b'<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>'
        data = {
            'file': (io.BytesIO(svg_data), 'test.svg'),
            'target_format': 'png'
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
        assert result['user_credits_remaining'] == 8

    def test_convert_mp4_to_gif(self, client, auth_headers):
        data = {
            'file': (io.BytesIO(b'fake mp4 data'), 'test.mp4'),
            'target_format': 'gif'
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
        assert result['user_credits_remaining'] == 5
