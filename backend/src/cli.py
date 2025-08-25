import argparse
from pathlib import Path

from .encoding_normalizer import detect_encoding, normalize_to_utf8, repair_mojibake, undo_normalization


def main():
    parser = argparse.ArgumentParser(description="Normalize file encodings to UTF-8")
    parser.add_argument("paths", nargs="+", help="Files to process")
    parser.add_argument("--bom", action="store_true", help="Write UTF-8 BOM")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without modifying files")
    parser.add_argument("--undo", action="store_true", help="Restore files from backups")
    args = parser.parse_args()

    for path_str in args.paths:
        path = Path(path_str)
        if args.undo:
            success = undo_normalization(path)
            if success:
                print(f"Restored {path}")
            else:
                print(f"No backup for {path}")
            continue

        if args.dry_run:
            raw = path.read_bytes()
            enc = detect_encoding(raw)
            text = raw.decode(enc or "utf-8", errors="ignore")
            repaired = repair_mojibake(text)
            target = "utf-8-sig" if args.bom else "utf-8"
            print(f"{path}: {enc} -> {target}")
            if repaired != text:
                print("  (mojibake repaired)")
            continue

        normalize_to_utf8(path, bom=args.bom)
        print(f"Normalized {path}")


if __name__ == "__main__":  # pragma: no cover
    main()
