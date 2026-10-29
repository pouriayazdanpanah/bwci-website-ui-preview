// Dev-only: walks the source and port <main> trees (children by index) and reports every element whose box or key
// computed styles differ.
//   NODE_PATH=$(npm root -g) node domdiff.js <sourceUrl> <portUrl> [width] [height] [reduce|<ms>]
//   <ms>: motion on, with every animation paused at that time (as in shoot.js)
const { chromium } = require('playwright');
const [srcUrl, portUrl, wArg, hArg, modeArg] = process.argv.slice(2);
const width = Number(wArg || 1440), height = Number(hArg || 900);
const at = modeArg && modeArg !== 'reduce' ? Number(modeArg) : null;
// source selector -> port selector
const PAIRS = [['main', '#bwci-page-not-found > main']];
const PROPS = ['display', 'position', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'color',
  'background-color', 'background-image', 'background-size', 'mask-image', 'mix-blend-mode', 'filter', 'opacity', 'transform', 'padding', 'margin',
  'border-top-width', 'border-top-style', 'border-top-color', 'border-radius', 'box-shadow', 'text-align', 'text-transform', 'text-wrap',
  'white-space', 'visibility', 'z-index', 'overflow', 'pointer-events', 'user-select', 'cursor', 'gap', 'flex-direction', 'justify-content',
  'align-items', 'transition', 'animation', 'outline-style'];

(async () => {
  const browser = await chromium.launch();
  const grab = async (url, useSrc) => {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: at === null ? 'reduce' : 'no-preference' });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete));
    if (at !== null) await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), at);
    const res = {};
    for (const [s, p] of PAIRS) res[s] = await page.evaluate(([sel, props]) => {
      const root = document.querySelector(sel);
      if (!root) return null;
      const out = [];
      const walk = (el, path) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const st = {};
        props.forEach((k) => { st[k] = cs.getPropertyValue(k); });
        // keyframe names carry the port's nf- prefix (nfFloat → nf-nfFloat)
        st.animation = st.animation.replace(/\bnf-(nf\w+)/g, '$1');
        if (st['text-align'] === 'start') st['text-align'] = 'left';
        // images are compared by their decoded size (the source has blob: URLs, the port data: or hosted URLs)
        const img = el.tagName === 'IMG' ? el.naturalWidth + 'x' + el.naturalHeight : '';
        out.push({ path, tag: el.tagName.toLowerCase(), cls: (el.getAttribute('class') || '').slice(0, 60), img, text: el.children.length ? '' : el.textContent.trim(),
          r: [r.x, r.y + scrollY, r.width, r.height].map((v) => Math.round(v * 100) / 100), st });
        Array.from(el.children).forEach((c, i) => walk(c, path + '>' + i));
      };
      walk(root, sel);
      return out;
    }, [useSrc ? s : p, PROPS]);
    await page.close();
    return res;
  };
  const A = await grab(srcUrl, true);
  const B = await grab(portUrl, false);
  let total = 0;
  for (const [s] of PAIRS) {
    const a = A[s], b = B[s];
    if (!a || !b) { console.log(s, 'missing', !!a, !!b); total++; continue; }
    const diffs = [];
    if (a.length !== b.length) diffs.push(`element count ${a.length} vs ${b.length}`);
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const x = a[i], y = b[i];
      if (x.tag !== y.tag) { diffs.push(`${x.path} tag ${x.tag} vs ${y.tag}`); break; }
      if (x.r.join() !== y.r.join()) diffs.push(`${x.path} <${x.tag} ${x.cls}> box ${x.r} vs ${y.r}`);
      if (x.img !== y.img) diffs.push(`${x.path} <img> ${x.img} vs ${y.img}`);
      if (x.text !== y.text) diffs.push(`${x.path} text "${x.text}" vs "${y.text}"`);
      for (const k of Object.keys(Object.assign({}, x.st, y.st))) {
        if (x.st[k] !== y.st[k]) diffs.push(`${x.path} <${x.tag} ${x.cls}> ${k}: ${x.st[k]}  ->  ${y.st[k]}`);
      }
    }
    total += diffs.length;
    console.log(`== ${s} (${a.length} elements): ${diffs.length} differences`);
    diffs.slice(0, 60).forEach((d) => console.log('   ' + d));
  }
  console.log(`TOTAL ${width}x${height} ${at === null ? 'reduce' : 't=' + at + 'ms'}: ${total}`);
  await browser.close();
})();
