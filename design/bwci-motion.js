/* BWCI shared motion — Main.dc.html's scroll reveal, applied to the inner pages.
   Tags section heads / blocks / card-group children that start below the fold, then
   fades them up once (14px, 700ms, cubic-bezier(.23,1,.32,1), 70ms stagger) — the
   same values as Main's .rv. Uses the `translate` property + a data attribute so it
   never fights an element's own transform or React-managed classes. Content already
   on screen is never hidden. Pairs with Part D of bwci-system.css. */
(function () {
  if (window.__bwMotion || !('IntersectionObserver' in window)) return;
  window.__bwMotion = true;
  document.documentElement.classList.add('bw-motion');

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, d = parseFloat(el.style.getPropertyValue('--bw-d')) || 0;
      io.unobserve(el);
      el.setAttribute('data-bw-rv', 'in');
      setTimeout(function () { el.removeAttribute('data-bw-rv'); el.style.removeProperty('--bw-d'); }, 900 + d * 70);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  var SKIP = '.rv, .rv-in, [aria-hidden="true"], script, style, template, svg';
  function ok(el) {
    if (!(el instanceof HTMLElement) || el.matches(SKIP)) return false;
    if (el.closest('.rv, [data-bw-rv]') || el.querySelector('.rv, [data-bw-rv]')) return false;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || /absolute|fixed|sticky/.test(cs.position) || cs.animationName !== 'none') return false;
    var r = el.getBoundingClientRect();
    if (r.height < 8 || r.top < window.innerHeight * 0.92) return false;
    return true;
  }
  function tag(el, i) {
    if (!ok(el)) return;
    el.style.setProperty('--bw-d', String(Math.min(i, 5)));
    el.setAttribute('data-bw-rv', 'wait');
    io.observe(el);
  }
  function kids(el) {
    return [].filter.call(el.children, function (c) { return c.offsetHeight > 0 && !c.matches('[aria-hidden="true"]'); });
  }
  function group(el) {
    var k = kids(el).filter(function (c) { return c.offsetHeight > 40; });
    if (k.length < 2 || k.length > 8 || !/grid|flex/.test(getComputedStyle(el).display)) return null;
    return k;
  }
  function scan(sec) {
    if (sec.__bwScanned || !sec.offsetHeight) return;
    var box = [].find.call(sec.children, function (c) {
      return c.children.length && !c.matches('[aria-hidden="true"]') && !/absolute|fixed/.test(getComputedStyle(c).position);
    });
    if (!box) return;
    sec.__bwScanned = true;
    var items = kids(box);
    if (items.length === 1 && items[0].children.length > 1) items = kids(items[0]);
    items.forEach(function (it, n) {
      var g = group(it);
      if (g && !it.querySelector('.rv')) g.forEach(function (c, j) { tag(c, j); });
      else tag(it, n);
    });
  }
  function run() {
    document.querySelectorAll('section').forEach(function (s) {
      if (s.id === 'hero' || s.matches('.hero, .hero-fe') || s.parentElement.closest('section')) return;
      scan(s);
    });
  }
  function start() { setTimeout(run, 300); setTimeout(run, 1200); setTimeout(run, 2600); }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();
