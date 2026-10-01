"""Import publishable site files from a Claude Design ZIP."""

import argparse
import re
import subprocess
import sys
import zipfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
DESIGN_ROOT = ROOT / "design"
REQUIRED = {"Main.dc.html", "support.js", "vendor/react.js", "vendor/react-dom.js"}

VIEWPORT = b'<meta name="viewport" content="width=device-width, initial-scale=1">'
HOME_MOBILE_FIX = b"""<style id="preview-home-responsive">
@media (max-width:1023px) {
  .hero-sub blockquote { margin:0; padding:0; border:0; }
  .hero-sub p, .hero-sub p span {
    position:static !important;
    left:auto !important;
    top:auto !important;
    width:auto !important;
    height:auto !important;
    max-width:100% !important;
  }
}
</style>
"""


def normalize_html(name, data):
    if not name.endswith(".dc.html"):
        return data
    if not re.search(rb'<meta\s+name=["\']viewport["\']', data, re.I):
        data, count = re.subn(rb"(<head\b[^>]*>)", lambda m: m.group(1) + b"\n" + VIEWPORT, data, count=1, flags=re.I)
        if count != 1:
            raise ValueError(f"HTML document has no <head>: {name}")
    if name == "Main.dc.html" and b'id="preview-home-responsive"' not in data:
        data, count = re.subn(rb"</head>", lambda m: HOME_MOBILE_FIX + m.group(0), data, count=1, flags=re.I)
        if count != 1:
            raise ValueError("Main.dc.html has no </head>")
    return data


def matches_existing(name, data):
    destination = DESIGN_ROOT / name
    if not destination.is_file():
        return False
    existing = destination.read_bytes()
    if existing == data:
        return True
    # Git autocrlf can check out text as CRLF on Windows while ZIP exports use LF.
    if name.lower().endswith((".html", ".js", ".css", ".svg")):
        return existing.replace(b"\r\n", b"\n") == data.replace(b"\r\n", b"\n")
    return False


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def collect(archive):
    files = {}
    seen = set()
    total_size = 0
    for item in archive.infolist():
        name = item.filename
        path = PurePosixPath(name)
        if (
            name.startswith("/")
            or chr(92) in name
            or any(part in ("", ".", "..") for part in path.parts)
            or ":" in name
        ):
            raise ValueError(f"unsafe ZIP path: {name}")
        if item.is_dir():
            continue
        key = name.casefold()
        if key in seen:
            raise ValueError(f"duplicate ZIP path: {name}")
        seen.add(key)
        publishable = (
            (len(path.parts) == 1 and name.endswith(".dc.html"))
            or name == "support.js"
            or path.parts[0] in {"assets", "vendor"}
        )
        if not publishable:
            continue
        if item.file_size > 20 * 1024 * 1024:
            raise ValueError(f"publishable file exceeds 20 MiB: {name}")
        total_size += item.file_size
        if total_size > 100 * 1024 * 1024:
            raise ValueError("publishable ZIP contents exceed 100 MiB")
        files[name] = normalize_html(name, archive.read(item))
    missing = REQUIRED - files.keys()
    if missing:
        raise ValueError(f"ZIP is missing required files: {', '.join(sorted(missing))}")
    files["index.html"] = files["Main.dc.html"]
    return files


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("zip_path", type=Path, help="Claude Design export ZIP")
    parser.add_argument("--check", action="store_true", help="show changes without writing")
    parser.add_argument(
        "--publish", action="store_true", help="commit imported files and push main to publish Pages"
    )
    args = parser.parse_args()
    if args.check and args.publish:
        parser.error("--check and --publish cannot be combined")
    try:
        if args.publish:
            if git("branch", "--show-current") != "main":
                raise ValueError("--publish must run on the main branch")
            if git("status", "--porcelain"):
                raise ValueError("--publish requires a clean working tree before import")
            git("remote", "get-url", "origin")
            try:
                subprocess.run(
                    ["git", "pull", "--ff-only", "origin", "main"], cwd=ROOT, check=True
                )
            except subprocess.CalledProcessError as exc:
                raise ValueError(
                    "main diverged from origin/main; integrate the remote changes before --publish"
                ) from exc
            if git("rev-parse", "HEAD") != git("rev-parse", "origin/main"):
                raise ValueError(
                    "--publish requires main to match origin/main; review/push local commits first"
                )
        with zipfile.ZipFile(args.zip_path) as archive:
            files = collect(archive)
        changed = sorted(
            name for name, data in files.items()
            if not matches_existing(name, data)
        )
        print(f"{len(files)} publishable files; {len(changed)} changed:")
        for name in changed:
            print(f"  design/{name}")
        if args.check or not changed:
            return 0
        for name in changed:
            destination = DESIGN_ROOT / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(files[name])
        if args.publish:
            subprocess.run(["git", "add", "--", *[f"design/{name}" for name in changed]], cwd=ROOT, check=True)
            subprocess.run(
                ["git", "commit", "-m", "Import Claude Design site export"], cwd=ROOT, check=True
            )
            try:
                subprocess.run(["git", "push", "origin", "main"], cwd=ROOT, check=True)
            except subprocess.CalledProcessError as exc:
                raise ValueError(
                    "import committed locally, but push failed; inspect origin/main "
                    "and integrate remote changes before pushing the local commit"
                ) from exc
            print("Pushed to main. GitHub Pages deployment will start automatically.")
        else:
            print("Imported locally. Review changes, then commit and push main to deploy.")
        return 0
    except (OSError, ValueError, zipfile.BadZipFile, subprocess.CalledProcessError) as exc:
        print(f"Import failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
