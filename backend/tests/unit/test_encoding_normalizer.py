import json
from pathlib import Path

import pytest

from src.encoding_normalizer import (
    detect_encoding,
    normalize_to_utf8,
    repair_mojibake,
)


def test_detect_encoding():
    data = "áéíóú".encode("utf-16")
    assert detect_encoding(data).lower().startswith("utf-16")


def test_repair_mojibake():
    bad = "España".encode("utf-8").decode("latin1")  # -> 'EspaÃ±a'
    assert repair_mojibake(bad) == "España"


def test_normalize_to_utf8(tmp_path):
    file_path = tmp_path / "sample.txt"
    file_path.write_bytes("áéíóú".encode("utf-16"))

    # ensure log clean
    log_file = Path(__file__).resolve().parents[2] / "logs/encoding/encoding_normalizer.log"
    if log_file.exists():
        log_file.unlink()

    entry = normalize_to_utf8(file_path)
    assert file_path.read_text(encoding="utf-8") == "áéíóú"
    assert Path(entry["backup"]).exists()


    with log_file.open() as fh:
        last = json.loads(fh.readlines()[-1])
    assert last["path"] == str(file_path)


@pytest.mark.parametrize(
    "encoding,text,expected_substring",
    [
        ("utf-16", "áéíóú", "utf-16"),
        ("latin1", "canción número", "iso-8859"),
        ("utf-8-sig", "hola", "utf-8"),
    ],
)
def test_detect_encoding_multiple(encoding, text, expected_substring):
    """Detects several common encodings."""
    sample = text.encode(encoding)
    detected = detect_encoding(sample).lower()
    assert expected_substring in detected


@pytest.mark.parametrize(
    "encoding,text",
    [
        ("utf-16", "áéíóú"),
        ("latin1", "canción número"),
        ("utf-8-sig", "hola"),
    ],
)
def test_normalize_to_utf8_multiple(tmp_path, encoding, text):
    """Normalizes files from multiple encodings to UTF-8."""
    file_path = tmp_path / f"sample_{encoding}.txt"
    file_path.write_bytes(text.encode(encoding))

    entry = normalize_to_utf8(file_path)
    assert file_path.read_text(encoding="utf-8") == text
    assert Path(entry["backup"]).exists()

