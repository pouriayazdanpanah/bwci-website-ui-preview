/* BWCI — Start a Conversation · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js + React) used by design/Start a Conversation.dc.html and its SiteHeader /
   SiteFooter components and bwci-motion.js. Everything is scoped to #bwci-start-a-conversation. The page's own text/x-dc
   component is reproduced below: the four routes as tabs (an accordion on phones), the route in the URL hash, the
   embedded GHL form of each route, the "Choose a different route" button and the spoken route messages.
   Owner decisions (8 November 2026): a route is always open (the page starts on the default route; the source's
   "choose a route" empty state is not used), and each form is the owner's GHL form iframe (the source's mock form
   preview and its review-only success state are not used). */
(function () {
  'use strict';

  /* Editable settings (logo URL, header/footer toggles, the four form links, the default route, the form heights, the
     "showFlags" source prop, footer legal wording, page links) live in the
     <script type="application/json" id="bwci-start-a-conversation-config"> block at the very top of the Custom Code
     paste, not here. */

  var ROOT_ID = 'bwci-start-a-conversation';
  var CONFIG_ID = 'bwci-start-a-conversation-config';
  var INSTANCE_KEY = '__bwciStartAConversation';

  /* ======================= BEHAVIOUR (source values) ======================= */
  var ROUTES = ['smes', 'investors', 'banks', 'partners'];
  var NAMES = { smes: 'SME or project enquiry', investors: 'Investor or capital provider enquiry', banks: 'Bank or financial institution enquiry', partners: 'Strategic partner enquiry' };
  var OPTIONS = {
    phone: '(max-width: 767px)', // routes become an accordion: each form opens under its own card
    scrollBelow: 1024,            // below this width (and above phones) a tap scrolls the form into view
    focusDelay: 380               // ms before "Choose a different route" moves focus, after its smooth scroll
  };

/*@site-chrome*/

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function isPhone() { return !!(window.matchMedia && window.matchMedia(OPTIONS.phone).matches); }
  // a form link is used only as an http(s) address; anything else (unset, "#", a merge field left in place) shows the
  // placeholder
  function formUrl(v) {
    return typeof v === 'string' && /^https?:\/\/[^\s"'<>]+$/i.test(v.trim()) ? v.trim() : '';
  }
  function px(v) { var n = Number(v); return isFinite(n) && n >= 200 && n <= 4000 ? Math.round(n) + 'px' : ''; }

  /* ---------------------------------------------------------------- */
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
    function q(sel) { return root.querySelector(sel); }
    function qa(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

    /* ---------- config: props, forms, links ---------- */
    var cfg = {};
    try {
      var cfgEl = document.getElementById(CONFIG_ID);
      if (cfgEl) cfg = JSON.parse(cfgEl.textContent || '{}') || {};
    } catch (err) { cfg = {}; }
    siteResolveImages(root,cfg);

    /* source prop flags (default true): the "Compliance to approve" badges. A non-boolean value keeps the default. */
    qa('[data-scv-flag]').forEach(function (el) { el.hidden = !(typeof cfg.showFlags === 'boolean' ? cfg.showFlags : true); });

    /* the embedded forms: each route's GHL form link, else the placeholder */
    var forms = cfg.forms && typeof cfg.forms === 'object' ? cfg.forms : {};
    ROUTES.forEach(function (k) {
      var url = formUrl(forms[k]);
      var embed = q('[data-scv-embed="' + k + '"]');
      var frame = q('[data-scv-form="' + k + '"]');
      var ph = q('[data-scv-ph="' + k + '"]');
      if (embed) embed.hidden = !url;
      if (ph) ph.hidden = !!url;
      if (frame) {
        if (url) { if (frame.getAttribute('src') !== url) frame.setAttribute('src', url); }
        else frame.removeAttribute('src');
      }
    });
    // the frame height: the source's 880 px (1180 px on phones) unless the config sets another
    root.style.removeProperty('--embed-h');
    root.style.removeProperty('--embed-h-m');
    if (px(cfg.formHeight)) root.style.setProperty('--embed-h', px(cfg.formHeight));
    if (px(cfg.formHeightPhone)) root.style.setProperty('--embed-h-m', px(cfg.formHeightPhone));

    siteResolveLinks(cfg);
    var links = cfg.links || {};
    qa('a[data-scv-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-scv-link')];
      siteLink(a, typeof v === 'string' && v ? v : a.getAttribute('href'));
    });

    /* ================= THE ROUTES (source text/x-dc component) ================= */
    var tabs = {}, panels = {};
    ROUTES.forEach(function (k) { tabs[k] = q('[data-scv-tab="' + k + '"]'); panels[k] = q('[data-scv-panel="' + k + '"]'); });
    var panelsBox = q('[data-scv-panels]');
    var live = q('[data-scv-live] .scv-i');
    function fromHash() { var h = (window.location.hash || '').replace('#', ''); return ROUTES.indexOf(h) >= 0 ? h : null; }
    // the route at load: the one in the URL hash, else the configured default, else the first
    var route = fromHash() || (ROUTES.indexOf(cfg.defaultRoute) >= 0 ? cfg.defaultRoute : ROUTES[0]);
    function render() {
      ROUTES.forEach(function (k) {
        var onK = k === route;
        if (tabs[k]) { tabs[k].setAttribute('aria-selected', onK ? 'true' : 'false'); tabs[k].setAttribute('tabindex', onK ? '0' : '-1'); }
        if (panels[k]) panels[k].hidden = !onK;
      });
    }
    function say(msg) { if (live) live.textContent = msg; }
    say(''); // a copied live root starts silent
    render();

    function pick(k, tap) {
      var phone = isPhone();
      var el = tabs[k];
      var before = el ? el.getBoundingClientRect().top : 0;
      if (k !== route) { route = k; say(NAMES[k] + ' form open'); render(); }
      // Phone: the form opens directly under the tapped card (accordion), and the tapped card stays exactly where the
      // finger is, even when a form above it closes. A route always stays open, so tapping the open card changes nothing.
      if (tap && phone && el) {
        var d = el.getBoundingClientRect().top - before;
        if (Math.abs(d) > 1) window.scrollBy(0, d);
      } else if (tap && !phone && window.innerWidth < OPTIONS.scrollBelow && panelsBox) {
        panelsBox.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      }
      try { history.replaceState(null, '', '#' + k); } catch (err) { /* sandboxed */ }
    }
    ROUTES.forEach(function (k) {
      on(tabs[k], 'click', function () { pick(k, true); });
      on(tabs[k], 'keydown', function (e) {
        var i = ROUTES.indexOf(k), n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % ROUTES.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + ROUTES.length) % ROUTES.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = ROUTES.length - 1;
        if (n === null) return;
        e.preventDefault();
        pick(ROUTES[n], false);
        if (tabs[ROUTES[n]]) tabs[ROUTES[n]].focus();
      });
    });
    // "Choose a different route": back to the route cards, focus on the open route's card (the source closed the form)
    qa('[data-scv-back]').forEach(function (b) {
      on(b, 'click', function () {
        say('Choose a route.');
        var card = tabs[route] && tabs[route].closest('.scv-sc-card');
        var reduced = prefersReducedMotion();
        if (card) card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        clearTimeout(timers.backFocus);
        timers.backFocus = setTimeout(function () { if (tabs[route]) tabs[route].focus({ preventScroll: true }); }, reduced ? 0 : OPTIONS.focusDelay);
      });
    });
    // a route link from another page (…#investors) or a hash change opens that route
    on(window, 'hashchange', function () { var h = fromHash(); if (h && h !== route) { route = h; render(); } });

    /* ================= SITE HEADER + FOOTER (shared site chrome) ================= */
    var chrome = siteChrome(root, cfg, on, timers);

    /* ================= SHARED SCROLL MOTION (design/bwci-motion.js) =================
       bwci-motion skips sections with id "hero" or class hero / hero-fe; this hero (#scv-top.pg-hero) has neither, so it
       is scanned like the other sections (its content starts on screen and stays untagged). */
    var motion = siteMotion(root, { heroId: null, heroSel: ':not(*)' }, on);

    /* ================= GoHighLevel re-render detection ================= */
    var instance = {
      root: root,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (chrome) chrome.destroy();
        if (motion) motion.destroy();
        clearTimeout(timers.backFocus);
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        delete root.dataset.scvInit;
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
    if (root) root.dataset.scvInit = 'true';
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
