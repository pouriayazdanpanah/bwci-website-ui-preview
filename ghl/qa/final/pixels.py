#!/usr/bin/env python3
"""Raw source/port and hosted/inline differences. No source CSS or pixel alignment is normalized."""
import json, sys
from pathlib import Path
from PIL import Image, ImageChops

root=Path(__file__).parent/'output/matrix'
selected=set(sys.argv[1:])
def difference(a,b):
    delta=ImageChops.difference(a,b)
    r,g,bl=delta.split(); maximum=ImageChops.lighter(ImageChops.lighter(r,g),bl)
    histogram=maximum.histogram()
    return dict(pixels=a.width*a.height,changedAny=sum(histogram[1:]),changedOver24=sum(histogram[25:]),maxChannel=maximum.getextrema()[1])
def crop(image,box):
    x,y=round(box['x']),round(box['y'])
    return image.crop((x,y,x+round(box['width']),y+round(box['height'])))
for file in sorted(root.glob('*/results.json')):
    slug=file.parent.name
    if selected and slug not in selected: continue
    data=json.loads(file.read_text()); expected=22 if slug.startswith('corporate-ir') or slug=='ecosystem' else 19
    if len(data['cases'])!=expected: continue
    results=[]
    for case in data['cases']:
        if len(case['variants'])!=3: continue
        source,inline,hosted=case['variants']
        with Image.open(file.parent/source['screenshot']) as img:
            reference=img.convert('RGB')
        for variant in [inline,hosted]:
            with Image.open(file.parent/variant['screenshot']) as img:
                port=img.convert('RGB')
            item=dict(width=case['width'],height=case['height'],variant=variant['kind'],heightDelta=variant['docHeight']-source['docHeight'],sectionGeometry=[],sectionPairs=[])
            if reference.size==port.size:
                item['full']=difference(reference,port)
            for a,b in zip(source['sections'],variant['sections']):
                item['sectionGeometry'].append(dict(source=a['id'],port=b['id'],delta=[round(b[k]-a[k],4) for k in ['x','y','width','height']]))
                if slug=='better-world-impact' and a['id']=='engine':continue
                if abs(a['width']-b['width'])<.02 and abs(a['height']-b['height'])<.02:
                    item['sectionPairs'].append(dict(section=a['id'],**difference(crop(reference,a),crop(port,b))))
            results.append(item)
        with Image.open(file.parent/inline['screenshot']) as a,Image.open(file.parent/hosted['screenshot']) as b:
            if a.size==b.size: results.append(dict(width=case['width'],height=case['height'],variant='hosted-vs-inline',full=difference(a.convert('RGB'),b.convert('RGB'))))
            else: results.append(dict(width=case['width'],height=case['height'],variant='hosted-vs-inline',sizeMismatch=[a.size,b.size]))
    (file.parent/'pixels.json').write_text(json.dumps(results,indent=2)+'\n')
    full=[r['full'] for r in results if r.get('full') and r['variant']!='hosted-vs-inline']
    variants=[r['full'] for r in results if r.get('full') and r['variant']=='hosted-vs-inline']
    print(json.dumps(dict(slug=slug,cases=len(data['cases']),comparedFull=len(full),exactFull=sum(r['changedAny']==0 for r in full),max24Percent=round(max((r['changedOver24']/r['pixels']*100 for r in full),default=0),5),hostedInlineExact=sum(r['changedAny']==0 for r in variants),hostedInlineCases=len(variants))))
