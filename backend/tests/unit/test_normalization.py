import os
import tempfile
from src.models.conversion import conversion_engine


def test_convert_file_invokes_normalizer(monkeypatch):
    calls = []

    def fake_normalize(path, bom=False):
        calls.append(path)
        return {"from": "latin-1", "to": "utf-8"}

    monkeypatch.setattr(
        "src.models.conversion.normalize_to_utf8", fake_normalize
    )

    with tempfile.TemporaryDirectory() as tmp:
        input_path = os.path.join(tmp, "in.txt")
        with open(input_path, "w", encoding="utf-8") as fh:
            fh.write("hola")
        output_path = os.path.join(tmp, "out.pdf")
        success, msg = conversion_engine.convert_file(
            input_path, output_path, "txt", "pdf"
        )

        assert success
        assert calls and calls[0] == input_path
        assert "normalized:latin-1->utf-8" in msg

