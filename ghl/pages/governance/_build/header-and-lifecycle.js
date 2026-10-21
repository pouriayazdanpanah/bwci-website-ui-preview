// Dev-only QA for the port: the GovNav section bar across duplicate execution, a GHL-style re-render,
// configured routes and live resizes.   NODE_PATH=$(npm root -g) node header-and-lifecycle.js <previewDirUrl>
// (header, drawer, config, hostile host and re-render of the shared chrome are covered by
//  ghl/shared/site-chrome/qa/chrome-behaviour.js and chrome-lifecycle.js)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const base = process.argv[2].replace(/\/?$/, '/');
const INLINE = fs.readFileSync(path.resolve(__dirname, '..', 'governance.inline.ghl.html'), 'utf8');

const nav = () => {
  const n = document.querySelector('#bwci-governance nav[aria-label="Governance sections"]');
  const list = n.querySelector('ul'), sel = n.querySelector('select');
  return (list.hidden ? 'select' : 'list') + ' ' + [...n.querySelectorAll('ul a')].map((a) => a.getAttribute('href')).join(',') + ' | ' +
    [...n.querySelectorAll('option')].map((o) => o.value).join(',') + ' | card ' + document.querySelector('#gov-board a').getAttribute('href') + ' | sel#' + sel.selectedIndex;
};

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const res = {};
  const run = async (name, html, fn, opts) => {
    const page = await browser.newPage(Object.assign({ viewport: { width: 1440, height: 900 } }, opts || {}));
    page.on('pageerror', (e) => errors.push(name + ': ' + String(e)));
    await page.route(base + 'variant.html', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
    await page.goto(base + 'variant.html', { waitUntil: 'networkidle' });
    res[name] = await fn(page);
    await page.close();
  };
  const host = (block, twice) => '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0">' +
    block + (twice ? '<script>' + block.slice(block.lastIndexOf('<script>') + 8, block.lastIndexOf('</script>')) + '</script>' : '') + '</body></html>';
  const withLinks = INLINE.replace(/"governance": "#"/, '"governance": "/governance"').replace(/"governanceBoard": "#"/, '"governanceBoard": "/governance-board"').replace(/"leadership": "#"/, '"leadership": "/leadership"');

  await run('configured routes', host(withLinks), (page) => page.evaluate(nav));
  // duplicate execution, then a GHL re-render (root replaced by a copy), then live resizes on the new root
  await run('duplicate + re-render + resize', host(INLINE, true), async (page) => {
    const r = {};
    r.instances = await page.evaluate(() => [document.querySelectorAll('#bwci-governance[data-gov-init]').length, Object.keys(window).filter((k) => /^__bwci/.test(k)).length]);
    await page.evaluate(() => { const old = document.getElementById('bwci-governance'); const c = old.cloneNode(true); c.removeAttribute('data-gov-init'); old.replaceWith(c); });
    await page.evaluate(() => window.scrollBy(0, 5)); await page.waitForTimeout(250);
    r.reattached = await page.evaluate(() => window.__bwciGovernance && window.__bwciGovernance.root === document.getElementById('bwci-governance'));
    await page.setViewportSize({ width: 600, height: 900 }); await page.waitForTimeout(200);
    r.at600 = await page.evaluate(nav);
    await page.setViewportSize({ width: 1100, height: 900 }); await page.waitForTimeout(200);
    r.at1100 = await page.evaluate(nav);
    return r;
  });
  // the select navigates to the configured route (here a real page: the plain preview)
  await run('select navigates', host(INLINE.replace(/"governanceBoard": "#"/, '"governanceBoard": "' + base + 'plain.html#gov-board"')), async (page) => {
    await page.locator('nav[aria-label="Governance sections"] select').selectOption({ index: 1 });
    await page.waitForURL(/plain\.html#gov-board$/, { timeout: 5000 }).catch(() => {});
    return page.url().replace(base, '');
  }, { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
