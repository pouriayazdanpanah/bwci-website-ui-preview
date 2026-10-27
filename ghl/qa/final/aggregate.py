#!/usr/bin/env python3
"""Build the durable final-regression index from current, inspectable local evidence."""
import json,re
from pathlib import Path
from datetime import datetime,timezone

here=Path(__file__).parent
out=here/'output'
repo=here.parents[2]
read=lambda p:json.loads(p.read_text())
clean=lambda r:all(not r.get(k,[]) for k in ('errors','console','network'))
static=read(out/'static.json');rebuild=read(out/'reproducibility.json')
assert static['status']==rebuild['status']=='PASS'
chrome=read(out/'chrome.json');focused=read(out/'focused.json');diagnostics=read(out/'source-diagnostics.json')
# Preserve unaffected checks and replace Main's checks with the run after its fit correction.
for run,name,expected in [(chrome,'chrome-targeted.json',6),(focused,'focused-targeted.json',3)]:
 if not (out/name).exists():continue
 target=read(out/name)
 if target['date']<=run['date']:continue
 assert len(target['cases'])==expected and clean(target)
 assert all(r['slug']=='main' and r['status']=='PASS' for r in target['cases'])
 run['cases']=[r for r in run['cases'] if r['slug']!='main']+target['cases']
 run['mainRerunDate']=target['date']

assert len(chrome['cases'])==138 and len(focused['cases'])==9
for run in (chrome,focused):
 assert clean(run)
 assert all(r['status']=='PASS' for r in run['cases'])
assert len(diagnostics['cases'])==6
for r in diagnostics['cases']:
 assert r['status']!='FAIL'
 if r['kind']!='source': assert clean(r)

pages=[];source_diagnostics=[];matrix_count=0;source_pairs=[];variant_pairs=[];section_pairs=[];recoveries=[]
for file in sorted((out/'matrix').glob('*/results.json')):
 d=read(file);slug=d['slug'];expected=22 if slug.startswith('corporate-ir') or slug=='ecosystem' else 19
 assert len(d['cases'])==expected,(slug,'missing matrix cases')
 assert len({(r['width'],r['height']) for r in d['cases']})==expected
 assert not d['errors'] and not d['network'] and not d.get('mountFailure')
 for message in d['console']:
  allowed=(slug=='ecosystem' and '{{p.' in message) or (slug=='platforms' and "reading 'mat'" in message and '/design/support.js' in message)
  assert allowed,(slug,message)
  source_diagnostics.append(dict(slug=slug,message=message))
 for c in d['cases']:
  assert c['status']=='PASS' and len(c['variants'])==3,(slug,c['width'])
  assert all(i['loaded'] for v in c['variants'] for i in v['images'])
  assert all(v['docWidth']<=c['width'] for v in c['variants'])
 matrix_count+=expected
 px=read(file.parent/'pixels.json');assert len(px)==expected*3,(slug,'pixel metrics missing')
 pairs=[r['full'] for r in px if r.get('full') and r['variant']!='hosted-vs-inline']
 variants=[r['full'] for r in px if r.get('full') and r['variant']=='hosted-vs-inline'];assert len(variants)==expected
 sections=[s for r in px for s in r.get('sectionPairs',[])]
 # Only the reviewed interactive engine and narrow wrapping badges may change document height.
 expected_pairs=0 if slug=='better-world-impact' else (34 if slug in ['corporate-ir-company-information','corporate-ir-regulatory'] else expected*2)
 assert len(pairs)==expected_pairs,(slug,'unexpected source/native height mismatch')
 source_pairs.extend(pairs);variant_pairs.extend(variants);section_pairs.extend(sections)
 max_percent=max((r['changedOver24']/r['pixels']*100 for r in pairs),default=0)
 reviewed_limits={'main':.001,'ecosystem':.03,'corporate-ir':.01}
 assert max_percent<=reviewed_limits.get(slug,0),(slug,'source raster difference exceeds reviewed bound',max_percent)
 cases=[dict(width=c['width'],height=c['height'],status=c['status'],sourceHeight=c['variants'][0]['docHeight'],inlineHeight=c['variants'][1]['docHeight'],hostedHeight=c['variants'][2]['docHeight']) for c in d['cases']]
 pages.append(dict(slug=slug,status='PASS',source=d['source']+d['hash'],viewportCases=expected,captures=expected*3,sourceFullPairs=len(pairs),sourceFullExact=sum(r['changedAny']==0 for r in pairs),maxFullOver24Percent=max_percent,hostedInlineExact=sum(r['changedAny']==0 for r in variants),hostedInlineCases=expected,sourceDiagnosticCount=len(d['console']),cases=cases))
 if d.get('recovery'):recoveries.append(dict(slug=slug,**d['recovery']))
assert len(pages)==23 and matrix_count==458
assert all(p['hostedInlineExact']==p['hostedInlineCases'] for p in pages),'Native variants must match pixel-for-pixel with identical fixture assets'
for p in pages:
 if p['sourceFullExact']!=p['sourceFullPairs']:assert p['slug'] in ['main','ecosystem','corporate-ir'],'Unreviewed source raster difference: '+p['slug']

profiles=[read(p) for p in sorted((out/'profiles').glob('*.json'))]
assert len(profiles)==7
for p in profiles:
 assert len(p['cases'])==18 and all(c['status']=='PASS' for c in p['cases']) and clean(p),p['slug']
 assert len(p['states'])==12
profile_cases=sum(len(p['cases']) for p in profiles)

traces=[]
for file in sorted((out/'traces').glob('*/results.json')):
 d=read(file);assert len(d['runs'])==2 and all(r['status']=='PASS' for r in d['runs'])
 comparison=read(file.parent/'comparison.json');assert comparison['sourceLines']==comparison['portLines']
 for delta in comparison['differences']:
  label,a=delta['source'];other,b=delta['port'];assert label==other
  if d['slug']=='main':assert label in ['ix pass-through','ix Tab']
  elif d['slug']=='governance-board':assert label in ['tab after cards','band link hover']
  elif d['slug']=='governance-leadership':assert label=='tab after cards'
  elif d['slug']=='investors-partners':
   assert isinstance(a,dict) and isinstance(b,dict)
   assert {k:v for k,v in a.items() if k not in ['pp','focus']}=={k:v for k,v in b.items() if k not in ['pp','focus']}
   assert re.sub(r'\.pp-item--on','',a['focus'])==re.sub(r'\.pp-item--on','',b['focus'])
  else:raise AssertionError((d['slug'],'unclassified trace difference',delta))
 traces.append(dict(slug=d['slug'],status='PASS',pairedStates=comparison['sourceLines'],rawDifferences=comparison['differences']))
assert len(traces)==9

ir=[]
for slug in ['corporate-ir','corporate-ir-company-information','corporate-ir-reports-documents','corporate-ir-shareholders','corporate-ir-regulatory','corporate-ir-legal-notices','better-world-impact']:
 d=read(repo/'ghl/pages'/slug/'_build/qa-output/checks.json')
 assert all(c['status']=='PASS' for c in d['checks'])
 assert not d['errors'] and not d['consoleErrors'] and not d['unexpectedNetwork']
 ir.append(dict(slug=slug,date=d['date'],checks=d['checks']))
impact=read(repo/'ghl/pages/better-world-impact/_build/qa-output/interaction/behavior.json')
assert len(impact['cases'])==56 and all(c['status']=='PASS' for c in impact['cases']) and clean(impact)
shared=read(repo/'ghl/shared/site-chrome/qa/sync/output/browser.json');deferred=read(repo/'ghl/shared/site-chrome/qa/sync/output/deferred.json')
assert len(shared['cases'])==92 and all(c['status']=='PASS' for c in shared['cases'])
assert not shared['errors'] and not shared['consoleErrors'] and not shared['network']
assert len(deferred['cases'])==23 and all(c['status']=='PASS' for c in deferred['cases']) and not deferred['errors']

# Additional native URL/config contract and exact source/native image geometry diagnostics.
config_text=(out/'platform-config-url.log').read_text();config_values,end=json.JSONDecoder().raw_decode(config_text)
assert config_text[end:].strip()=='errors []'
assert len(config_values)==10
assert config_values['default (inline image)']==dict(header=True,footer=True,img='data:image/png;base64, 2020x778',links=28)
assert config_values['hosted placeholder']==dict(imgSrc=None,placeholderRequested=False)
assert config_values['hosted real URL']['img']=='plat-hero-rails.png 2020x778'
assert not config_values['showHeader/showFooter false']['header'] and not config_values['showHeader/showFooter false']['footer']
assert config_values['broken JSON']['directoryWorks']=='1 of 6'
assert config_values['links override']==['ecosystem=https://example.com/eco','startConversation=/contact']
assert config_values['url: initial read keeps URL']['url']=='variant.html?utm_source=a%2Cb&maturity=Operating#plt-directory'
url_updates=config_values['url: updates own params only']
assert all('utm_source=a%2Cb&x=1' in v and v.endswith('#top') for v in url_updates['steps'])
assert url_updates['hostState']==dict(host='state') and url_updates['histLen']==2
assert config_values['url: unknown values ignored']['res']=='3 of 6'
assert config_values['url: syncUrl false']['url']=='variant.html?relationship=Group%20Build'
image_geometry=read(out/'image-geometry.json');assert len(image_geometry['cases'])==6 and clean(image_geometry)
image_max_delta=0
for c in image_geometry['cases']:
 assert c['status']=='PASS'
 ref=next(x for x in image_geometry['cases'] if x['kind']=='source' and x['width']==c['width'])
 for a,b in zip(c['images'],ref['images']):
  assert a['frame']==b['frame'] and a['natural']==b['natural']
  image_max_delta=max(image_max_delta,max(abs(x-y) for x,y in zip(a['image'],b['image'])))
assert image_max_delta==0
# Source photos are embedded in the source slot state, not separate design/assets files.
import base64
slot_state=read(repo/'design/image-slots.state.json')
for key in ['home-who-photo','home-impact-1','home-impact-2','home-impact-3','home-impact-4']:
 assert (repo/'ghl/pages/main/assets'/(key+'.webp')).read_bytes()==base64.b64decode(slot_state[key]['u'].split(',',1)[1])
initial_matrix_failures=[]
for f in (out/'matrix').glob('*/attempts/*.json'):
 d=read(f)
 if d.get('mountFailure') or any(c['status']=='FAIL' for c in d['cases']):
  initial_matrix_failures.append(dict(slug=d['slug'],date=d['date'],mountFailure=d.get('mountFailure'),failedCases=[dict(width=c['width'],height=c['height'],error=c['error']) for c in d['cases'] if c['status']=='FAIL']))

result=dict(date=datetime.now(timezone.utc).isoformat(),baseline='7ddc04f85fed7fc457d5d25fc2d42e834d15807f',status='PASS',scope='Final local regression of all 23 GHL pages, including the Main fitted-image correction. Matching fallback fonts; publication is separate.',productionFix=dict(page='main',behavior='Use the source fitted image box after sizing instead of applying CSS cover a second time',files=['ghl/pages/main/main.ghl.html','ghl/pages/main/main.inline.ghl.html']),
 coverage=dict(pages=23,outputVariants=46,viewportCases=matrix_count,captures=matrix_count*3,chromeCases=138,profileCases=profile_cases,profileEntrySnapshots=84,sharedLifecycleCases=92,deferredCases=23,impactInteractionCases=56,pageChecks=sum(len(r['checks']) for r in ir),pairedLegacyStates=sum(t['pairedStates'] for t in traces),focusedCases=9),
 static=static,reproducibility=dict(status='PASS',builds=rebuild['builds'],outputs=rebuild['outputs'],changed=rebuild['changed']),pages=pages,
 pixels=dict(sourceFullPairs=len(source_pairs),sourceFullExact=sum(r['changedAny']==0 for r in source_pairs),hostedInlinePairs=len(variant_pairs),hostedInlineExact=sum(r['changedAny']==0 for r in variant_pairs),sectionPairs=len(section_pairs),sectionExact=sum(r['changedAny']==0 for r in section_pairs)),
 profileResults=[dict(slug=p['slug'],status='PASS',cases=p['cases']) for p in profiles],chrome=dict(status='PASS',cases=chrome['cases']),focused=focused,traces=traces,pageChecks=ir,
 impact=dict(status='PASS',cases=56,date=impact['date']),shared=dict(status='PASS',cases=92,date=shared['date']),deferred=dict(status='PASS',cases=23,date=deferred['date']),
 sourceOnlyDiagnostics=dict(observed=source_diagnostics,attribution=diagnostics),matrixRecoveries=recoveries,initialMatrixFailures=initial_matrix_failures,platformConfigURL=dict(status='PASS',cases=10,values=config_values),mainImageGeometry=dict(status='PASS',cases=6,maxCSSPixelDelta=image_max_delta,sourceAssetBytes='Identical for all five saved source slots'),
 visualReview=dict(phoneHeroPairs=23,desktopHeroPairs=10,rasterObservations=['Main: remaining differences occur within fitted Impact photographs; only two pixels exceed a 24-channel delta in the 1024px pair.','Ecosystem: largest above-threshold difference is confined to two horizontal border rows at 963px.','Corporate IR Overview: small Section-label glyph raster difference at 1024px.'],intentionalDifferences=['Interactive Impact engine instead of the static exported figure','Long Company/Regulatory approval badges wrap on phones instead of clipping','Claude image-slot editor controls are omitted from native Tab order']),
 driverCorrections=['Related Board cards exclude the current Board member; wait for the actual source-derived count, not a universal three.','Center galleries outside sticky chrome before testing drags.','Wait for the final hover opacity instead of sampling a transition frame.','Visit pending reveals and current viewport image regions before full-page captures; recapture timeouts/corrupt headless raster output on fresh pages.'],
 limits=['Live GHL installation and wrapper behavior NOT VERIFIED','Actual Google Fonts delivery/layout NOT VERIFIED','Physical-device behavior NOT VERIFIED','Published URLs/SEO and approved business content NOT VERIFIED','Source-only export diagnostics and documented intentional source differences are retained; design files unchanged'])
(here/'results.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(dict(status='PASS',coverage=result['coverage'],pixels=result['pixels']),indent=2))
