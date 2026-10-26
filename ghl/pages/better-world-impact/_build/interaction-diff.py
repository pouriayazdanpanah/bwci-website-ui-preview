#!/usr/bin/env python3
"""Current unchanged-section source/port evidence. Engine is an intentional functional difference."""
import json, math
from pathlib import Path
from PIL import Image, ImageChops

out = Path(__file__).parent / 'qa-output/interaction'
data = json.loads((out / 'visual.json').read_text())
rows = []
for source in [r for r in data['visual'] if r['kind'] == 'source']:
    reference = Image.open(out / source['screenshot']).convert('RGB')
    for variant in ('inline', 'hosted'):
        port = next(r for r in data['visual'] if (r['width'], r['height'], r['kind']) == (source['width'], source['height'], variant))
        image = Image.open(out / port['screenshot']).convert('RGB')
        for i, (a, b) in enumerate(zip(source['sections'], port['sections'])):
            assert a['text'] == b['text'], (a['selector'], variant, 'text')
            for size in ('width', 'height'):
                assert abs(a[size] - b[size]) < .02, (source['width'], a['selector'], size, a[size], b[size])
            def crop(im, box):
                x, y = round(box['x']), round(box['y'])
                return im.crop((x, y, x + round(box['width']), y + round(box['height'])))
            left, right = crop(reference, a), crop(image, b)
            delta = ImageChops.difference(left, right)
            red, green, blue = delta.split()
            hist = ImageChops.lighter(ImageChops.lighter(red, green), blue).histogram()
            changed = sum(hist[25:])
            row = dict(width=source['width'], height=source['height'], variant=variant, section=['hero','approach','methodology','cta'][i], pixels=left.width*left.height, changedAny=sum(hist[1:]), changedOver24=changed)
            rows.append(row)
# Each source case produces two variants times four unchanged sections.
assert len(rows) == len([r for r in data['visual'] if r['kind'] == 'source']) * 8
(out / 'pixels.json').write_text(json.dumps(rows, indent=2) + '\n')
print(json.dumps(dict(pairs=len(rows), exact=sum(r['changedAny'] == 0 for r in rows), maxChangedOver24=max(r['changedOver24'] for r in rows)), indent=2))
