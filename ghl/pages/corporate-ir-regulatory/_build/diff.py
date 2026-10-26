#!/usr/bin/env python3
"""Compare QA's matching source/plain/hosted captures. Requires Pillow; development only."""
import json
from pathlib import Path
from PIL import Image, ImageChops

folder = Path(__file__).parent / 'qa-output'
rows = []
for reference_file in sorted(folder.glob('reference-*.png')):
    reference = Image.open(reference_file).convert('RGB')
    raw = Image.open(folder / reference_file.name.replace('reference-', 'source-')).convert('RGB')
    for kind in ['plain', 'hosted']:
        target = folder / reference_file.name.replace('reference-', kind + '-')
        actual = Image.open(target).convert('RGB')
        if reference.size != actual.size:
            raise SystemExit('Reference dimensions differ: ' + str(target))
        diff = ImageChops.difference(reference, actual)
        changed = sum(pixel != (0, 0, 0) for pixel in diff.get_flattened_data())
        raw_changed = None
        if raw.size == actual.size:
            raw_changed = sum(pixel != (0, 0, 0) for pixel in ImageChops.difference(raw, actual).get_flattened_data())
        row = dict(capture=target.name, changed_pixels=changed,
                   percent=round(changed / (actual.width * actual.height) * 100, 6), bbox=diff.getbbox(),
                   raw_source_size=list(raw.size), output_size=list(actual.size), raw_changed_pixels=raw_changed,
                   raw_note='Original comparison differs where approval-badge wrapping changes content height' if raw_changed != 0 else 'Pixel-identical to unmodified source')
        rows.append(row)
        print(json.dumps(row))
(folder / 'pixel-diff.json').write_text(json.dumps(rows, indent=2) + '\n')
if any(row['changed_pixels'] for row in rows):
    raise SystemExit('Unexpected difference against documented-correction reference')
