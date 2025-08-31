import json
import re
from pathlib import Path
from datetime import datetime, timezone

import chardet

MOJIBAKE_RE = re.compile(r"Ãƒ|Ã‚|Ã¢â‚¬")

BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = BASE_DIR / "logs" / "encoding"
LOG_FILE = LOG_DIR / "encoding_normalizer.log"


def detect_encoding(raw_bytes: bytes) -> str:
    """Detect the encoding of the given raw bytes using chardet."""
    result = chardet.detect(raw_bytes)
    return result.get("encoding") or "utf-8"


def repair_mojibake(text: str) -> str:
    """Attempt to repair common mojibake issues."""
    if MOJIBAKE_RE.search(text):
        try:
            return text.encode("latin1").decode("utf-8")
        except Exception:
            return text
    return text


def _log_entry(entry: dict) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    with LOG_FILE.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry) + "\n")


def normalize_to_utf8(path, bom: bool = False) -> dict:
    """Normalize the file at ``path`` to UTF-8 encoding.

    Parameters
    ----------
    path: str or Path
        Path to the file to normalize.
    bom: bool
        If True, write a UTF-8 BOM.

    Returns
    -------
    dict
        The log entry describing the normalization.
    """
    file_path = Path(path)
    raw = file_path.read_bytes()
    detected = detect_encoding(raw)
    text = raw.decode(detected or "utf-8", errors="replace")
    repaired = repair_mojibake(text)
    encoded = repaired.encode("utf-8-sig" if bom else "utf-8")

    backup_path = file_path.with_suffix(file_path.suffix + ".bak")
    backup_path.write_bytes(raw)
    file_path.write_bytes(encoded)

    entry = {
        "path": str(file_path),
        "backup": str(backup_path),
        "from": detected,
        "to": "utf-8-sig" if bom else "utf-8",
        "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
    }
    _log_entry(entry)
    return entry


def undo_normalization(path) -> bool:
    """Restore a file from its backup if available."""
    file_path = Path(path)
    backup_path = file_path.with_suffix(file_path.suffix + ".bak")
    if not backup_path.exists():
        return False
    original = backup_path.read_bytes()
    file_path.write_bytes(original)
    backup_path.unlink()
    entry = {
        "path": str(file_path),
        "action": "undo",
        "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
    }
    _log_entry(entry)
    return True

