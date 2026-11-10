/* BWCI — global site header · GoHighLevel runtime (vanilla JS, no dependencies).
   One header for every page: paste this block into ONE Custom Code element inside a GoHighLevel Global Section placed
   at the top of each page. The page blocks (built with --global) no longer carry a header.
   What it adds to the shared chrome runtime (dropdowns, drawer, links, logo, stuck state):
   - the header stays pinned as the source's sticky header does: the utility bar scrolls away, then the main bar
     sticks. A sticky element cannot leave its own GoHighLevel section, so the header is position:fixed and the root
     keeps its height in the flow (the placeholder);
   - --util-h / --nav-h are set on <html> (as the source sets them), so each page's sticky bars and anchor offsets
     line up under it;
   - the current page: the page block marks its root with data-bwci-current="<SiteHeader current>" and, when it
     starts, dispatches "bwci:page-ready" on document; the header marks the matching links, dropdown and drawer
     accordion (the source bakes this per page), whichever block runs first;
   - a page block marked data-bwci-under-header (Main: its hero is pulled up under the header) gets a transparent
     placeholder, so the hero shows behind the see-through stuck header as on the page block;
   - "raiseSection": GoHighLevel sections that create their own stacking layer (z-index) would paint later sections
     over a fixed header, so the z-index of those ancestors of this block is raised while it runs, then restored.
   Settings live in the <script type="application/json" id="bwci-site-header-config"> block at the top. */
(function () {
  'use strict';

  var ROOT_ID = 'bwci-site-header';
  var CONFIG_ID = 'bwci-site-header-config';
  var INSTANCE_KEY = '__bwciSiteHeader';
  var SECTION_Z = '999'; // raised z-index of the block's layered ancestors (above page sections, below chat widgets)

/*@site-chrome*/

  function init(root) {
    var ac = typeof AbortController === 'function' ? new AbortController() : null;
    var cleanups = [];
    var timers = {};
    function on(target, type, fn, opts) {
      if (!target) return;
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

    var cfg = {};
    try {
      var cfgEl = document.getElementById(CONFIG_ID);
      if (cfgEl) cfg = JSON.parse(cfgEl.textContent || '{}') || {};
    } catch (err) { cfg = {}; }
    siteResolveImages(root, cfg);
    siteResolveLinks(cfg);

    /* ---------- current page (data-bwci-current on the page block's root) ---------- */
    var current = null;
    function clearCurrent() {
      qa('[data-bwh-c][aria-current], [data-bwh-dd-btn][aria-current]').forEach(function (el) { el.removeAttribute('aria-current'); });
      qa('[data-bwh-acc]').forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'false');
        var panel = root.querySelector('[data-bwh-acc-panel="' + btn.getAttribute('data-bwh-acc') + '"]');
        if (panel) panel.hidden = true;
      });
    }
    function applyCurrent() {
      var marker = document.querySelector('[data-bwci-current]');
      // a page whose content runs up under the header (Main's hero): the placeholder must not cover it
      root.classList.toggle('bwh-under', !!(marker && marker.hasAttribute('data-bwci-under-header')));
      var key = marker && marker.getAttribute('data-bwci-current');
      if (!key || key === current) return;
      clearCurrent();
      current = key;
      qa('[data-bwh-c]').forEach(function (el) { if (el.getAttribute('data-bwh-c') === key) el.setAttribute('aria-current', 'page'); });
      qa('[data-bwh-cg]').forEach(function (el) {
        if ((' ' + el.getAttribute('data-bwh-cg') + ' ').indexOf(' ' + key + ' ') < 0) return;
        if (el.hasAttribute('data-bwh-dd-btn')) el.setAttribute('aria-current', 'page');
        else if (el.hasAttribute('data-bwh-acc')) {
          // source: a drawer accordion starts open when it holds the current page
          el.setAttribute('aria-expanded', 'true');
          var panel = root.querySelector('[data-bwh-acc-panel="' + el.getAttribute('data-bwh-acc') + '"]');
          if (panel) panel.hidden = false;
        }
      });
    }
    // start from the unmarked state (also for markup copied from a running instance), then mark the page already
    // in the document; a page block that starts later announces itself with "bwci:page-ready"
    clearCurrent();
    applyCurrent();
    on(document, 'bwci:page-ready', applyCurrent);

    /* ================= SITE HEADER (shared site chrome) ================= */
    var chrome = siteChrome(root, cfg, on, timers);

    /* a header link to a section of the page being viewed (Main's "The Platform Today": home + #bwci-today) becomes
       a plain in-page jump, as on the page blocks, instead of a navigation to the same address */
    qa('a[data-bwh-link]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.indexOf('#') <= 0) return;
      try {
        var u = new URL(href, location.href);
        if (u.hash && u.origin === location.origin && u.pathname.replace(/\/+$/, '') === location.pathname.replace(/\/+$/, '') && u.search === location.search) a.setAttribute('href', u.hash);
      } catch (err) { /* not a URL */ }
    });

    /* ---------- pinned header: fixed host, in-flow placeholder, sizes on <html> ---------- */
    var host = root.querySelector('[data-bwh-hdr-host]');
    var hdr = root.querySelector('[data-bwh-hdr]');
    var util = root.querySelector('[data-bwh-hdr-util]');
    var html = document.documentElement;
    var prevVars = { util: html.style.getPropertyValue('--util-h'), nav: html.style.getPropertyValue('--nav-h') };
    var setVars = null;
    var raised = [];
    var ro = null;
    var utilH = 0, lastTop = null;
    function place() {
      // source: sticky at top = -(utility bar height); the header follows the placeholder until then
      var t = Math.max(root.getBoundingClientRect().top, -utilH);
      if (t !== lastTop) { lastTop = t; host.style.top = t + 'px'; }
    }
    function measure() {
      utilH = util ? util.offsetHeight : 0;
      var h = hdr.offsetHeight;
      root.style.height = h + 'px';
      var r = root.getBoundingClientRect();
      host.style.left = r.left + 'px';
      host.style.width = r.width + 'px';
      setVars = { util: utilH + 'px', nav: h + 'px' };
      html.style.setProperty('--util-h', setVars.util);
      html.style.setProperty('--nav-h', setVars.nav);
      lastTop = null;
      place();
    }
    if (host && hdr) {
      if (cfg.raiseSection !== false) {
        for (var el = root.parentElement; el && el !== document.body && el !== html; el = el.parentElement) {
          var cs = getComputedStyle(el);
          if (cs.zIndex !== 'auto') {
            raised.push([el, el.style.getPropertyValue('z-index'), el.style.getPropertyPriority('z-index')]);
            el.style.setProperty('z-index', SECTION_Z, 'important');
          }
          if ((cs.transform && cs.transform !== 'none') || (cs.filter && cs.filter !== 'none') || (cs.perspective && cs.perspective !== 'none') ||
            /paint|layout|strict|content/.test(cs.contain || '') || /transform|filter/.test(cs.willChange || '')) {
            // a fixed element is positioned inside such an ancestor instead of the viewport
            if (window.console && console.warn) console.warn('BWCI header: a parent section has transform/filter/contain; the header may not stay pinned.', el);
          }
        }
      }
      root.classList.add('bwh-fixed');
      measure();
      on(window, 'scroll', place, { passive: true });
      on(window, 'resize', measure);
      if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(function () { measure(); }); ro.observe(hdr); }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!instance.destroyed) measure(); });
    }

    var instance = {
      root: root,
      applyCurrent: applyCurrent,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (chrome) chrome.destroy();
        if (ro) ro.disconnect();
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        raised.forEach(function (r) { r[0].style.setProperty('z-index', r[1], r[2]); if (!r[1]) r[0].style.removeProperty('z-index'); });
        // restore <html> only where these values are still ours
        if (setVars && html.style.getPropertyValue('--util-h') === setVars.util) { if (prevVars.util) html.style.setProperty('--util-h', prevVars.util); else html.style.removeProperty('--util-h'); }
        if (setVars && html.style.getPropertyValue('--nav-h') === setVars.nav) { if (prevVars.nav) html.style.setProperty('--nav-h', prevVars.nav); else html.style.removeProperty('--nav-h'); }
        root.classList.remove('bwh-fixed');
        root.classList.remove('bwh-under');
        root.style.removeProperty('height');
        if (host) { host.style.removeProperty('top'); host.style.removeProperty('left'); host.style.removeProperty('width'); }
        delete root.dataset.bwhInit;
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
  var app = { root: null, instance: null, observer: null, frame: null, destroyed: false };
  function boot() {
    if (app.destroyed) return;
    var root = document.getElementById(ROOT_ID);
    if (root === app.root && app.instance) { app.instance.applyCurrent(); return; } // DOMContentLoaded: page parsed
    if (app.instance) app.instance.destroy();
    app.root = root;
    if (root) root.dataset.bwhInit = 'true';
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
