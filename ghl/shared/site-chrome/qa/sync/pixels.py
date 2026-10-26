#!/usr/bin/env python3
"""Compare unmodified Main CTA source/port captures; no image normalization."""
import json
from pathlib import Path
from PIL import Image, ImageChops

out = Path(__file__).parent / 'output'
rows = []
for source in sorted(out.glob('main-cta-source-*.png')):
    reference = Image.open(source).convert('RGB')
    for variant in ('inline', 'hosted'):
        name = source.name.replace('source', variant)
        port = Image.open(out / name).convert('RGB')
        assert port.size == reference.size, name
        difference = ImageChops.difference(reference, port)
        red, green, blue = difference.split()
        maximum = ImageChops.lighter(ImageChops.lighter(red, green), blue)
        histogram = maximum.histogram()
        rows.append(dict(source=source.name, port=name, size=reference.size,
                         changedOver24=sum(histogram[25:]), changedAny=sum(histogram[1:]),
                         pixels=reference.width * reference.height,
                         maxChannel=maximum.getextrema()[1]))
assert len(rows) == 32, 'Run the complete Main CTA viewport matrix first'
(out / 'main-pixels.json').write_text(json.dumps(rows, indent=2) + '\n')
print(json.dumps(dict(pairs=len(rows), exact=sum(r['changedAny'] == 0 for r in rows),
                      maxChangedOver24=max(r['changedOver24'] for r in rows))))
