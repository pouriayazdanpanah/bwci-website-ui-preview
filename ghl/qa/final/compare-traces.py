#!/usr/bin/env python3
import json,re
from pathlib import Path
root=Path(__file__).parent/'output/traces'
def parse(file):
    result=[]
    for line in file.read_text().splitlines():
        match=re.match(r'^(.*?)\s{2,}(.*)$',line)
        if match:
            try: result.append((match[1],json.loads(match[2])))
            except ValueError: pass
    return result
for folder in sorted(root.iterdir()):
    if not (folder/'results.json').exists():continue
    source,port=parse(folder/'source.log'),parse(folder/'port.log')
    differences=[dict(line=i,source=a,port=b) for i,(a,b) in enumerate(zip(source,port)) if a!=b]
    result=dict(sourceLines=len(source),portLines=len(port),differences=differences)
    (folder/'comparison.json').write_text(json.dumps(result,indent=2)+'\n')
    print(folder.name,len(source),len(port),'differences',len(differences))
