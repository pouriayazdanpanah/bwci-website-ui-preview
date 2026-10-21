// Dev-only: walks source and port DOM trees section by section (children by index) and reports every
// element whose box or key computed styles differ.
//   NODE_PATH=$(npm root -g) node domdiff.js <sourceUrl> <portUrl> [width] [height] [motion|reduce]
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const [srcUrl, portUrl, wArg, hArg, motionArg] = process.argv.slice(2);
const width = Number(wArg || 1440), height = Number(hArg || 900);
const reducedMotion = motionArg === 'motion' ? 'no-preference' : 'reduce';
// source selector -> port selector
const PAIRS = [
  ['#top', '#gvb-top'], ['nav[aria-label="Governance sections"]', 'nav[aria-label="Governance sections"]'], ['#board', '#gvb-board'],
  ['#framework-link', '#gvb-framework-link'], ['footer.sft', 'footer.gvb-sft'], ['header.hdr', 'header.gvb-hdr'],
];
const PROPS = ['display', 'position', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'color',
  'background-color', 'background-image', 'opacity', 'transform', 'padding', 'margin', 'border-top-width', 'border-top-style',
  'border-top-color', 'border-radius', 'box-shadow', 'text-align', 'text-transform', 'white-space', 'visibility', 'z-index', 'overflow'];

(async () => {
  const browser = await chromium.launch();
  const grab2 = async (url, useSrc) => {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion });
    await routeReact(page);
    await page.goto(url, { waitUntil: 'networkidle' });
    // settle the shared scroll motion (see shoot.js)
    await page.waitForTimeout(3000);
    await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.6);
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 60)); }
      await new Promise((r) => setTimeout(r, 1800));
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(600);
    const res = {};
    for (const [s, p] of PAIRS) res[s] = await page.evaluate(([sel, props]) => {
      const root = document.querySelector(sel);
      if (!root) return null;
      const out = [];
      const walk = (el, path) => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none') return; // content the source only mounts on demand (drawer, other loop layout)
        const r = el.getBoundingClientRect();
        const st = {};
        props.forEach((k) => { st[k] = cs.getPropertyValue(k); });
        if (st['text-align'] === 'start') st['text-align'] = 'left';
        ['::before', '::after'].forEach((pe) => {
          const c = getComputedStyle(el, pe);
          if (c.content && c.content !== 'none' && c.content !== 'normal') st[pe] = [c.content, c.width, c.height, c.opacity, c.transform, c.backgroundColor, c.top, c.left].join('|');
        });
        // <image-slot> (source) and div.gvb-slot (port) are the same box; their insides differ (shadow DOM vs frame +
        // img, compared by behaviour.js); <option> content is text in the port (the source nests a span)
        const slot = el.tagName === 'IMAGE-SLOT' || el.classList.contains('gvb-slot');
        out.push({ path, tag: slot ? 'slot' : el.tagName.toLowerCase(), cls: (el.getAttribute('class') || '').slice(0, 60), r: [r.x, r.y + scrollY, r.width, r.height].map((v) => Math.round(v * 2) / 2), st });
        if (!slot && el.tagName !== 'OPTION') Array.from(el.children).forEach((c, i) => walk(c, path + '>' + i));
      };
      walk(root, sel);
      return out;
    }, [useSrc ? s : p, PROPS]);
    await page.close();
    return res;
  };
  const A = await grab2(srcUrl, true);
  const B = await grab2(portUrl, false);
  let total = 0;
  for (const [s] of PAIRS) {
    const a = A[s], b = B[s];
    if (!a || !b) { console.log(s, 'missing', !!a, !!b); continue; }
    const diffs = [];
    if (a.length !== b.length) diffs.push(`element count ${a.length} vs ${b.length}`);
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const x = a[i], y = b[i];
      if (x.tag !== y.tag) { diffs.push(`${x.path} tag ${x.tag} vs ${y.tag}`); break; }
      if (x.r.join() !== y.r.join()) diffs.push(`${x.path} <${x.tag} ${x.cls}> box ${x.r} vs ${y.r}`);
      for (const k of Object.keys(Object.assign({}, x.st, y.st))) {
        if (x.st[k] !== y.st[k]) diffs.push(`${x.path} <${x.tag} ${x.cls}> ${k}: ${x.st[k]}  ->  ${y.st[k]}`);
      }
    }
    total += diffs.length;
    console.log(`== ${s}: ${diffs.length} differences`);
    diffs.slice(0, 12).forEach((d) => console.log('   ' + d));
  }
  console.log('TOTAL', total);
  await browser.close();
})();
