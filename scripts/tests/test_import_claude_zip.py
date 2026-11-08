"""Regression checks for root and folder-wrapped Claude Design exports."""

import importlib.util
import io
from pathlib import Path
import unittest
import zipfile

SPEC = importlib.util.spec_from_file_location(
    "import_claude_zip", Path(__file__).resolve().parents[1] / "import_claude_zip.py"
)
IMPORTER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(IMPORTER)

SITE = {
    "Main.dc.html": b'<html><head><link rel="stylesheet" href="./theme.css"></head><body></body></html>',
    "support.js": b"// runtime",
    "vendor/react.js": b"// React",
    "vendor/react-dom.js": b"// ReactDOM",
    "theme.css": b"body { margin: 0; }",
    "image-slot.js": b"const STATE_FILE = '.image-slots.state.json';",
    ".image-slots.state.json": b'{"images":{}}',
    "assets/hero.png": b"original-image-bytes",
}


def collect(entries):
    data = io.BytesIO()
    with zipfile.ZipFile(data, "w") as archive:
        for name, value in entries:
            archive.writestr(name, value)
    data.seek(0)
    with zipfile.ZipFile(data) as archive:
        return IMPORTER.collect(archive)


class ExportLayoutTests(unittest.TestCase):
    def test_root_and_wrapped_exports_have_identical_outputs(self):
        expected = collect(SITE.items())
        for prefix in ["BWCI-Website-UI/", "Downloads/Version 2/Site/"]:
            with self.subTest(prefix=prefix):
                actual = collect((prefix + name, value) for name, value in SITE.items())
                self.assertEqual(actual, expected)
        self.assertEqual(expected["index.html"], expected["Main.dc.html"])
        self.assertIn(IMPORTER.VIEWPORT, expected["index.html"])
        self.assertEqual(expected["assets/hero.png"], SITE["assets/hero.png"])
        self.assertIn(b"'image-slots.state.json'", expected["image-slot.js"])

    def test_unrelated_files_outside_export_are_ignored(self):
        entries = [("Site/" + name, value) for name, value in SITE.items()]
        entries.append(("notes.txt", b"export notes"))
        self.assertEqual(collect(entries), collect(SITE.items()))

    def test_root_export_retains_priority_over_nested_reference(self):
        entries = list(SITE.items()) + [("Reference/" + name, value) for name, value in SITE.items()]
        self.assertEqual(collect(entries), collect(SITE.items()))

    def test_multiple_nested_exports_are_rejected(self):
        entries = [(prefix + name, value) for prefix in ["First/", "Second/"] for name, value in SITE.items()]
        with self.assertRaisesRegex(ValueError, "multiple complete design exports"):
            collect(entries)

    def test_original_unsafe_paths_are_rejected_before_stripping(self):
        for unsafe in ["Site/../notes.txt", "/Site/notes.txt", "Site\\notes.txt", "C:/Site/notes.txt"]:
            with self.subTest(path=unsafe), self.assertRaisesRegex(ValueError, "unsafe ZIP path"):
                collect([("Site/" + name, value) for name, value in SITE.items()] + [(unsafe, b"bad")])

    def test_case_duplicate_paths_are_rejected(self):
        entries = [("Site/" + name, value) for name, value in SITE.items()]
        with self.assertRaisesRegex(ValueError, "duplicate ZIP path"):
            collect(entries + [("Site/THEME.CSS", b"duplicate")])

    def test_wrapping_does_not_bypass_missing_dependency_check(self):
        entries = [("Site/" + name, value) for name, value in SITE.items() if name != "theme.css"]
        with self.assertRaisesRegex(ValueError, "references missing CSS/JS: theme.css"):
            collect(entries)

    def test_incomplete_exports_still_fail(self):
        entries = [("Site/" + name, value) for name, value in SITE.items() if name != "vendor/react.js"]
        with self.assertRaisesRegex(ValueError, "missing required files"):
            collect(entries)


if __name__ == "__main__":
    unittest.main()
