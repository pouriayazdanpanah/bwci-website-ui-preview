// Dev-only QA for "02 · Why now, why us" (design export 04715d6): the source's #why against the port's #bwci-why.
//   NODE_PATH=$(npm root -g) node why.js <sourceUrl> <portUrl> <outDir> [w1,w2,...]
// 1. Element screenshots of the section at each width with reduced motion (everything shown at once), for diff.py.
// 2. With motion: the bridge's drawn geometry (each path's d, the circles, the gradient), the build progress (--p) at
//    a series of scroll positions, the state classes, and the final state once complete (pulses running, core glow,
//    the scroll-linked state removed), printed as a trace for a line-by-line diff of source and port.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const routeReact = require('./qa-routes');
const [srcUrl, portUrl, outDir, widthsArg] = process.argv.slice(2);
const widths = (widthsArg || '320,360,375,390,430,768,1024,1280,1366,1440,1600,1920,2560').split(',').map(Number);
const SEL = { src: '#why', port: '#bwci-why' };

(async () => {
  const browser = await chromium.launch();
  const trace = { src: [], port: [] };
  for (const [k, url] of [['src', srcUrl], ['port', portUrl]]) {
    const log = (a, b) => trace[k].push(a.padEnd(26) + ' ' + JSON.stringify(b));
    const errors = [];
    // 1. reduced motion: element screenshots
    for (const w of widths) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
      await routeReact(page);
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts && document.fonts.ready);
      await page.waitForTimeout(2500);
      // compare the section on its own: the sticky site header would cover its top, and the sections above it differ
      // (the port's other sections carry the owner's text), which moves it to a different sub-pixel offset
      await page.addStyleTag({ content: 'header, header *{ visibility:hidden !important; }' });
      await page.evaluate((sel) => document.querySelectorAll('section').forEach((x) => { if (!x.matches(sel)) x.style.display = 'none'; }), SEL[k]);
      const el = page.locator(SEL[k]);
      await el.evaluate((e) => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.waitForTimeout(1500); // the reveals inside the section (.rv) settle
      fs.mkdirSync(path.join(outDir, k), { recursive: true });
      await el.screenshot({ path: path.join(outDir, k, 'w' + w + '.png') });
      log('reduced ' + w, await page.evaluate((s) => { const b = document.querySelector(s + ' .wy-br'); return [b.className.replace(/\bbw-/g, ''), b.style.getPropertyValue('--p') || '-', getComputedStyle(b.querySelector('.wy-pulse')).animationName.replace(/^bw-/, '')]; }, SEL[k]));
      await page.close();
    }
    // 2. motion: geometry, progress while scrolling, final state
    for (const [w, h] of [[1440, 900], [390, 844]]) {
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
      await routeReact(page);
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts && document.fonts.ready);
      await page.waitForTimeout(2500);
      const st = () => page.evaluate((s) => {
        const b = document.querySelector(s + ' .wy-br');
        return [b.className.replace(/\bbw-/g, ''), b.style.getPropertyValue('--p') || '-'];
      }, SEL[k]);
      log('load ' + w, await st());
      log('geometry ' + w, await page.evaluate((s) => [...document.querySelectorAll(s + ' .wy-flow svg')].map((sv) => [sv.getAttribute('viewBox'),
        [...sv.querySelectorAll('.wy-base, .wy-pulse')].map((p) => p.getAttribute('d')).join(' | '),
        [...sv.querySelectorAll('circle')].map((c) => c.getAttribute('cx') + ',' + c.getAttribute('cy')).join(' '),
        ['x1', 'y1', 'x2', 'y2'].map((a) => sv.querySelector('linearGradient').getAttribute(a)).join(',')]), SEL[k]));
      const top = await page.evaluate((s) => document.querySelector(s + ' .wy-br').getBoundingClientRect().top + scrollY, SEL[k]);
      for (const f of [-0.9, -0.6, -0.3, 0, 0.3, 0.6]) {
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.max(0, Math.round(top + f * h)));
        await page.waitForTimeout(300);
        log('scroll ' + w + ' ' + f, await st());
      }
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(top - h)); await page.waitForTimeout(300);
      log('back up ' + w, await st());
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(top + 2 * h)); await page.waitForTimeout(900);
      log('done ' + w, [await st(), await page.evaluate((s) => { const b = document.querySelector(s + ' .wy-br'); const p = b.querySelector('.wy-pulse'); const c = getComputedStyle(p); return [c.animationName.replace(/^bw-/, ''), c.animationDuration, c.animationIterationCount, getComputedStyle(b.querySelector('.wy-core')).opacity]; }, SEL[k])]);
      await page.close();
    }
    trace[k].push('errors'.padEnd(26) + ' ' + JSON.stringify(errors));
  }
  fs.writeFileSync(path.join(outDir, 'trace-src.txt'), trace.src.join('\n') + '\n');
  fs.writeFileSync(path.join(outDir, 'trace-port.txt'), trace.port.join('\n') + '\n');
  console.log(trace.src.join('\n') === trace.port.join('\n') ? 'TRACE IDENTICAL (' + trace.src.length + ' lines)' : 'TRACE DIFFERS: diff ' + outDir + '/trace-src.txt ' + outDir + '/trace-port.txt');
  await browser.close();
})();
