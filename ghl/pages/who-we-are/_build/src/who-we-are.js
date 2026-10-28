/* BWCI — Who We Are · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js + React) used by design/Who We Are.dc.html and its SiteHeader /
   Breadcrumb / PersonCard / SiteFooter components, bwci-people.js, image-slot.js and bwci-motion.js.
   Everything is scoped to #bwci-who-we-are. The page's own text/x-dc component lights the Financial Engine strip
   once it is 45 % visible and lets a mouse or pen drag the mobile leadership carousel; both are reproduced below. */
(function () {
  'use strict';

  /* Editable settings (logo and portrait image URLs, header/footer toggles, footer legal wording, page links)
     live in the <script type="application/json" id="bwci-who-we-are-config"> block at the very top of the Custom
     Code paste, not here. The hero image is "whoWeAreHeroImage". */

  var ROOT_ID = 'bwci-who-we-are';
  var CONFIG_ID = 'bwci-who-we-are-config';
  var INSTANCE_KEY = '__bwciWhoWeAre';

/*@site-chrome*/

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function scrollBehavior() { return prefersReducedMotion() ? 'auto' : 'smooth'; }

  /* ---------------------------------------------------------------- */
  function init(root) {
    var ac = typeof AbortController === 'function' ? new AbortController() : null;
    var cleanups = [];
    var timers = {};
    function on(target, type, fn, opts) {
      var o = opts || {};
      if (ac) {
        o = Object.assign({}, o, { signal: ac.signal });
        target.addEventListener(type, fn, o);
      } else {
        target.addEventListener(type, fn, o);
        cleanups.push(function () { target.removeEventListener(type, fn, o); });
      }
    }
    function qa(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

    /* ---------- config: links ---------- */
    var cfg = {};
    try {
      var cfgEl = document.getElementById(CONFIG_ID);
      if (cfgEl) cfg = JSON.parse(cfgEl.textContent || '{}') || {};
    } catch (err) { cfg = {}; }
    siteResolveImages(root,cfg);

    /* ---------- hero image (source: ./assets/hero-globe.png): the configured URL, else no image ---------- */
    qa('img[data-who-asset="whoWeAreHeroImage"]').forEach(function (img) {
      var url = cfg.whoWeAreHeroImage;
      var valid = siteImageAvailable(url);
      img.hidden = !valid;
      if (valid) { if (img.getAttribute('src') !== url) img.src = url; }
      else img.removeAttribute('src');
    });

    siteResolveLinks(cfg);
    var links = cfg.links || {};
    qa('a[data-who-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-who-link')];
      siteLink(a, typeof v === 'string' && v ? v : a.getAttribute('href'));
    });

    /* ---------- in-page anchors: smooth scroll (source used html{scroll-behavior:smooth}) ---------- */
    on(root, 'click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a || !root.contains(a)) return;
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target || !root.contains(target)) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
      // as a native fragment jump does: focus moves to the (non-focusable) target, i.e. off the link
      if (document.activeElement && root.contains(document.activeElement) && target.tabIndex < 0) document.activeElement.blur();
      try { if (history.pushState) history.pushState(null, '', '#' + id); } catch (err) { /* sandboxed */ }
    });

    /* ---------- How we work: the engine strip lights once it is 45 % visible (source componentDidMount) ----------
       A copied live root starts unlit again, as the source does on mount; without IntersectionObserver it is lit. */
    var engine = root.querySelector('[data-who-engine]');
    var io = null;
    if (engine) {
      engine.classList.remove('who-lit');
      if (typeof IntersectionObserver !== 'function') engine.classList.add('who-lit');
      else {
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('who-lit'); io.disconnect(); } });
        }, { threshold: 0.45 });
        io.observe(engine);
      }
    }

    /* ---------- Leadership: drag the mobile carousel (source _drag) ----------
       Below 768 px the list is a scroll-snap row. A mouse or pen (not touch, which swipes natively) drags it once
       it overflows: the drag starts after 6 px, the release snaps smoothly to the nearest card (card width + the
       14 px gap), and the click that ends a drag does not follow the card link. */
    var drag = root.querySelector('[data-who-drag]');
    if (drag) {
      drag.classList.remove('who-is-drag');
      var down = false, moved = false, x0 = 0, s0 = 0;
      on(drag, 'pointerdown', function (e) {
        if (e.pointerType === 'touch' || drag.scrollWidth <= drag.clientWidth) return;
        down = true; moved = false; x0 = e.clientX; s0 = drag.scrollLeft;
      });
      on(drag, 'pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - x0;
        if (!moved && Math.abs(dx) > 6) { moved = true; drag.setPointerCapture(e.pointerId); drag.classList.add('who-is-drag'); }
        if (moved) drag.scrollLeft = s0 - dx;
      });
      var up = function () {
        if (!down) return;
        down = false;
        drag.classList.remove('who-is-drag');
        if (moved) {
          var w = (drag.firstElementChild && drag.firstElementChild.offsetWidth + 14) || 1;
          drag.scrollTo({ left: Math.round(drag.scrollLeft / w) * w, behavior: 'smooth' });
        }
      };
      on(drag, 'pointerup', up);
      on(drag, 'pointercancel', up);
      on(drag, 'click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
      on(drag, 'dragstart', function (e) { e.preventDefault(); });
    }

    /* ================= SITE HEADER + FOOTER, PERSON CARDS (shared site chrome) ================= */
    var chrome = siteChrome(root, cfg, on, timers);
    var people = sitePeople(root, cfg, on);

    /* ================= SHARED SCROLL MOTION (design/bwci-motion.js) =================
       bwci-motion skips the source hero (class "hero"), here #who-top.who-hero. */
    var motion = siteMotion(root, { heroId: 'who-top', heroSel: '.who-hero' }, on);

    /* ================= GoHighLevel re-render detection ================= */
    var instance;
    function guardConnected() { return root.isConnected; }

    instance = {
      root: root,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (chrome) chrome.destroy();
        if (people) people.destroy();
        if (motion) motion.destroy();
        if (io) io.disconnect();
        if (drag) drag.classList.remove('who-is-drag');
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        delete root.dataset.whoInit;
        if (window[INSTANCE_KEY] === instance) window[INSTANCE_KEY] = null;
      }
    };
    return instance;
  }

  // One owner per block: repeated execution reuses it; replacements tear down immediately, including
  // when GHL removes an ancestor without a scroll/resize event. No polling or continuous frames.
  var previous = window[INSTANCE_KEY];
  if (previous && !previous.destroyed && typeof previous.boot === 'function') { previous.boot(); return; }
  if (previous && typeof previous.destroy === 'function') previous.destroy();
  var pending = window[INSTANCE_KEY + 'Pending'];
  if (pending && typeof pending.destroy === 'function') pending.destroy();
  var app = { root: null, instance: null, observer: null, frame: null, destroyed: false };
  function boot() {
    if (app.destroyed) return;
    var root = document.getElementById(ROOT_ID);
    if (root === app.root && app.instance) return;
    if (app.instance) app.instance.destroy();
    app.root = root;
    if (root) root.dataset.whoInit = 'true';
    app.instance = root ? init(root) : null;
  }
  app.boot = boot;
  app.destroy = function () {
    if (app.destroyed) return;
    app.destroyed = true;
    if (app.observer) app.observer.disconnect();
    cancelAnimationFrame(app.frame);
    if (app.instance) app.instance.destroy();
    window.removeEventListener('pagehide', pagehide);
    document.removeEventListener('DOMContentLoaded', boot);
    app.root = null;
    app.instance = null;
    if (window[INSTANCE_KEY] === app) delete window[INSTANCE_KEY];
  };
  function pagehide(e) { if (!e.persisted) app.destroy(); }
  window[INSTANCE_KEY] = app;
  boot();
  app.observer = new MutationObserver(function () {
    if (app.root && app.root.isConnected) return;
    if (app.frame !== null) return;
    app.frame = requestAnimationFrame(function () { app.frame = null; boot(); });
  });
  app.observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  window.addEventListener('pagehide', pagehide);
})();
