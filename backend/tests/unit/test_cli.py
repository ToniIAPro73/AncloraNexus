import os
import subprocess
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[2]


def run_cli(args):
    """Execute the encoding CLI with given arguments."""
    env = os.environ.copy()
    env["PYTHONPATH"] = str(BACKEND_DIR / "src")
    return subprocess.run(
        ["python", "-m", "src.cli", *args],
        cwd=str(BACKEND_DIR),
        capture_output=True,
        text=True,
        env=env,
        check=True,
    )


def test_dry_run(tmp_path):
    sample = tmp_path / "sample.txt"
    sample.write_text("hello", encoding="utf-8")

    result = run_cli(["--dry-run", str(sample)])
    assert "->" in result.stdout
    assert sample.read_text(encoding="utf-8") == "hello"
    backup = sample.with_suffix(sample.suffix + ".bak")
    assert not backup.exists()


def test_bom(tmp_path):
    sample = tmp_path / "sample.txt"
    sample.write_text("hola", encoding="utf-8")

    result = run_cli(["--bom", str(sample)])
    assert "Normalized" in result.stdout
    backup = sample.with_suffix(sample.suffix + ".bak")
    assert backup.exists()
    assert sample.read_bytes().startswith(b"\xef\xbb\xbf")


def test_undo(tmp_path):
    sample = tmp_path / "sample.txt"
    original = "data"
    sample.write_text(original, encoding="utf-8")

    run_cli([str(sample)])  # create backup
    backup = sample.with_suffix(sample.suffix + ".bak")
    assert backup.exists()

    result = run_cli(["--undo", str(sample)])
    assert "Restored" in result.stdout
    assert not backup.exists()
    assert sample.read_text(encoding="utf-8") == original

