#!/usr/bin/env python3
"""Compare QA's matching source/plain/hosted captures. Requires Pillow; development only."""
import json
from pathlib import Path
from PIL import Image, ImageChops

folder = Path(__file__).parent / 'qa-output'
rows = []
for source in sorted(folder.glob('source-*.png')):
    reference = Image.open(source).convert('RGB')
    for kind in ['plain', 'hosted']:
        target = folder / source.name.replace('source-', kind + '-')
        if not target.exists():
            raise SystemExit('Missing capture: ' + str(target))
        actual = Image.open(target).convert('RGB')
        if reference.size != actual.size:
            raise SystemExit('Image dimensions differ: ' + str(target))
        diff = ImageChops.difference(reference, actual)
        changed = sum(pixel != (0, 0, 0) for pixel in diff.get_flattened_data())
        row = dict(capture=target.name, changed_pixels=changed,
                   percent=round(changed / (actual.width * actual.height) * 100, 6),
                   bbox=diff.getbbox())
        rows.append(row)
        print(json.dumps(row))
(folder / 'pixel-diff.json').write_text(json.dumps(rows, indent=2) + '\n')
