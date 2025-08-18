import io
from pathlib import Path

import pytest

from src.models import conversion as conversion_module
from src.nexus import encoding_normalizer


@pytest.mark.integration
@pytest.mark.conversion
def test_upload_normalize_convert(client, auth_headers, monkeypatch):
    calls = []

    original = encoding_normalizer.normalize_to_utf8

    def tracker(path):
        calls.append(path)
        return original(path)

    monkeypatch.setattr(conversion_module, "normalize_to_utf8", tracker)

    content = "áéíóú".encode("latin1")
    data = {
        "file": (io.BytesIO(content), "acentos.txt"),
        "target_format": "html",
    }

    resp = client.post(
        "/api/conversion/convert",
        data=data,
        headers=auth_headers,
        content_type="multipart/form-data",
    )

    assert resp.status_code == 200
    assert len(calls) == 1
    bak_path = Path(calls[0]).with_suffix(Path(calls[0]).suffix + ".bak")
    assert bak_path.exists()

    conversion_id = resp.get_json()["conversion"]["id"]
    download_resp = client.get(
        f"/api/conversion/download/{conversion_id}", headers=auth_headers
    )
    assert download_resp.status_code == 200
    download_resp.data.decode("utf-8")

