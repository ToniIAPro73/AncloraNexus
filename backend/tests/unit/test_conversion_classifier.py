import os
import tempfile
from src.models.conversion import validate_and_classify


def write_bytes(path, data):
    with open(path, 'wb') as f:
        f.write(data)


def test_validate_and_classify_valid(tmp_path):
    p = tmp_path / "valid.txt"
    p.write_text("hola mundo", encoding="utf-8")
    assert validate_and_classify(str(p)) == "valid"


def test_validate_and_classify_mojibake(tmp_path):
    p = tmp_path / "mojibake.txt"
    data = "cafÃ©".encode("latin-1")  # bytes invalidos en utf-8
    write_bytes(str(p), data)
    assert validate_and_classify(str(p)) == "salvageable"


def test_validate_and_classify_corrupt(tmp_path):
    p = tmp_path / "corrupt.bin"
    write_bytes(str(p), b"\xff\x00" * 50)
    assert validate_and_classify(str(p)) == "unsalvageable"
