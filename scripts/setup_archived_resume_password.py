"""Set archived résumé password: update site config hash and encrypt archive files."""
from __future__ import annotations

import hashlib
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "data" / "site-config.json"
RESUMES = ROOT / "asset" / "Resumes"
ARCHIVE = RESUMES / "archive"

ARCHIVED_FILES = [
    "Elvis_Segbeaya_Principal_Solutions_Architect_Resume_v2.docx",
    "ELVIS_SEGBEAYA_3.3.23.pdf",
    "Elvis_Data_Analyst_Resume_22.pdf",
]


def sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def encrypt_pdf(source: Path, dest: Path, password: str) -> None:
    from pypdf import PdfReader, PdfWriter

    reader = PdfReader(str(source))
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    writer.encrypt(user_password=password)
    with dest.open("wb") as handle:
        writer.write(handle)


def encrypt_docx(source: Path, dest: Path, password: str) -> None:
    import msoffcrypto

    with source.open("rb") as plain:
        office = msoffcrypto.OfficeFile(plain)
        with dest.open("wb") as encrypted:
            office.encrypt(password, encrypted)


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: python scripts/setup_archived_resume_password.py \"your-password\"")
        sys.exit(1)

    password = sys.argv[1].strip()
    if len(password) < 8:
        print("Password must be at least 8 characters.")
        sys.exit(1)

    ARCHIVE.mkdir(parents=True, exist_ok=True)

    for name in ARCHIVED_FILES:
        source = RESUMES / name
        if not source.exists():
            print(f"Missing source file: {source}")
            sys.exit(1)

        dest = ARCHIVE / name
        temp = ARCHIVE / f".{name}.tmp"

        if name.lower().endswith(".pdf"):
            encrypt_pdf(source, temp, password)
        elif name.lower().endswith(".docx"):
            encrypt_docx(source, temp, password)
        else:
            print(f"Unsupported file type: {name}")
            sys.exit(1)

        shutil.move(str(temp), str(dest))
        if source.parent == RESUMES:
            source.unlink()
        print(f"Encrypted: archive/{name}")

    config: dict = {}
    if CONFIG_PATH.exists():
        config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))

    config.setdefault("archivedResumes", {})
    config["archivedResumes"]["passwordHash"] = sha256_hex(password)

    CONFIG_PATH.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {CONFIG_PATH.relative_to(ROOT)} with password hash.")
    print("Archived résumés are now password-protected on the site and in the files themselves.")


if __name__ == "__main__":
    main()
