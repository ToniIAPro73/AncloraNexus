import json
import re
from pathlib import Path
from datetime import datetime, timezone

import chardet

# Patrones de mojibake más completos
MOJIBAKE_RE = re.compile(r"Ã[¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]|Ãƒ|Ã‚|Ã¢â‚¬")

BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = BASE_DIR / "logs" / "encoding"
LOG_FILE = LOG_DIR / "encoding_normalizer.log"


def detect_encoding(raw_bytes: bytes) -> str:
    """Detect the encoding of the given raw bytes using chardet with fallbacks."""
    if not raw_bytes:
        return "utf-8"

    # CRÍTICO: Detectar archivos binarios primero para evitar corrupción
    if is_binary_file(raw_bytes):
        return "binary"  # Marcar como binario para evitar normalización

    # Verificar BOM primero
    if raw_bytes.startswith(b'\xef\xbb\xbf'):
        return "utf-8-sig"
    elif raw_bytes.startswith(b'\xff\xfe'):
        return "utf-16-le"
    elif raw_bytes.startswith(b'\xfe\xff'):
        return "utf-16-be"
    elif raw_bytes.startswith(b'\xff\xfe\x00\x00'):
        return "utf-32-le"
    elif raw_bytes.startswith(b'\x00\x00\xfe\xff'):
        return "utf-32-be"

    # Usar chardet para detección
    result = chardet.detect(raw_bytes)
    detected = result.get("encoding")
    confidence = result.get("confidence", 0)

    # Si la confianza es baja, intentar validaciones adicionales
    if confidence < 0.7:
        # Intentar decodificar como UTF-8 primero
        try:
            raw_bytes.decode('utf-8')
            return "utf-8"
        except UnicodeDecodeError:
            pass

        # Intentar encodings comunes
        for encoding in ['windows-1252', 'iso-8859-1', 'latin-1']:
            try:
                raw_bytes.decode(encoding)
                return encoding
            except UnicodeDecodeError:
                continue

    return detected or "utf-8"

def is_binary_file(raw_bytes: bytes) -> bool:
    """Detecta si un archivo es binario y no debe ser normalizado"""
    if not raw_bytes:
        return False

    # Detectar archivos ZIP (DOCX, EPUB, ODT, etc.)
    if raw_bytes.startswith(b'PK\x03\x04') or raw_bytes.startswith(b'PK\x05\x06'):
        return True

    # Detectar archivos PDF
    if raw_bytes.startswith(b'%PDF'):
        return True

    # Detectar imágenes
    image_signatures = [
        b'\xff\xd8\xff',  # JPEG
        b'\x89PNG\r\n\x1a\n',  # PNG
        b'GIF87a', b'GIF89a',  # GIF
        b'RIFF',  # WEBP (y otros RIFF)
        b'II*\x00', b'MM\x00*',  # TIFF
        b'BM',  # BMP
    ]

    for signature in image_signatures:
        if raw_bytes.startswith(signature):
            return True

    # Detectar archivos con muchos null bytes (probablemente binarios)
    null_ratio = raw_bytes.count(b'\x00') / len(raw_bytes)
    if null_ratio > 0.1:  # Más del 10% null bytes
        return True

    # Detectar caracteres de control excesivos
    control_chars = sum(1 for b in raw_bytes[:1024] if b < 32 and b not in [9, 10, 13])
    if control_chars > len(raw_bytes[:1024]) * 0.3:  # Más del 30% caracteres de control
        return True

    return False


def repair_mojibake(text: str) -> str:
    """Attempt to repair common mojibake issues with multiple strategies."""
    if not text:
        return text

    # Estrategia 1: Detectar patrones de mojibake comunes
    if MOJIBAKE_RE.search(text):
        try:
            # Intentar decodificar como latin1 y recodificar como utf-8
            repaired = text.encode("latin1").decode("utf-8")
            return repaired
        except Exception:
            pass

    # Estrategia 2: Reparaciones específicas de mojibake común
    mojibake_fixes = {
        'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
        'ÃÁ': 'Á', 'ÃÉ': 'É', 'ÃÍ': 'Í', 'ÃÓ': 'Ó', 'ÃÚ': 'Ú',
        'Ã±': 'ñ', 'ÃÑ': 'Ñ',
        'Ã¿': 'ÿ', 'Ã¼': 'ü', 'Ã¶': 'ö', 'Ã¤': 'ä',
        'â€œ': '"', 'â€': '"', 'â€™': "'", 'â€˜': "'",
        'â€"': '–', 'â€"': '—', 'â€¦': '…',
        'Â': '', 'Â ': ' '  # Espacios no separables mal codificados
    }

    repaired_text = text
    for mojibake, correct in mojibake_fixes.items():
        repaired_text = repaired_text.replace(mojibake, correct)

    # Estrategia 3: Intentar múltiples decodificaciones
    if repaired_text == text:
        for encoding_pair in [('windows-1252', 'utf-8'), ('iso-8859-1', 'utf-8')]:
            try:
                test_repaired = text.encode(encoding_pair[0]).decode(encoding_pair[1])
                if test_repaired != text and not MOJIBAKE_RE.search(test_repaired):
                    repaired_text = test_repaired
                    break
            except Exception:
                continue

    return repaired_text


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

    # CRÍTICO: No normalizar archivos binarios
    if detected == "binary":
        entry = {
            "path": str(file_path),
            "backup": None,
            "from": "binary",
            "to": "binary",
            "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
            "action": "skipped_binary"
        }
        _log_entry(entry)
        return entry

    # Proceder con normalización solo para archivos de texto
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

