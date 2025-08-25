import os
from pathlib import Path
import chardet
from src.models.conversion import conversion_engine


def test_text_file_normalized_before_conversion(tmp_path):
    content = "áéíóú"
    input_path = tmp_path / "sample.txt"
    input_path.write_bytes(content.encode("latin-1"))
    output_path = tmp_path / "sample.html"

    success, _ = conversion_engine.convert_file(
        str(input_path), str(output_path), "txt", "html"
    )

    assert success
    # Ensure backup created by normalizer exists
    backup_path = tmp_path / "sample.txt.bak"
    assert backup_path.exists()

    # Verify file has been normalized to UTF-8
    raw = input_path.read_bytes()
    detected = chardet.detect(raw).get("encoding", "").lower()
    assert detected.startswith("utf")
