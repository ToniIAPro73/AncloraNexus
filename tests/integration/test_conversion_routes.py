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

    def test_convert_txt_to_md(self, client, auth_headers):
        data = {
            'file': (io.BytesIO(b'hello world'), 'test.txt'),
            'target_format': 'md'
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

    def test_convert_txt_to_rtf(self, client, auth_headers):
        data = {
            'file': (io.BytesIO(b'hello world'), 'test.txt'),
            'target_format': 'rtf'
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
        img = Image.new('RGB', (10, 10), 'red')
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        buf.seek(0)
        data = {
            'file': (buf, 'test.png'),
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
        assert result['user_credits_remaining'] == 8

    def test_convert_gif_to_mp4(self, client, auth_headers):
        img = Image.new('RGB', (10, 10), 'red')
        buf = io.BytesIO()
        img.save(buf, format='GIF')
        buf.seek(0)
        data = {
            'file': (buf, 'test.gif'),
            'target_format': 'mp4'
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
        assert result['user_credits_remaining'] == 6

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
