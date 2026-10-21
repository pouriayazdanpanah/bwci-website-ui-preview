/* BWCI - Governance profile: Professor Richard A. Werner - standalone native runtime.
   Replaces the Claude Design runtime (support.js + React) used by the profile design page and its SiteHeader /
   Breadcrumb / GovNav / PersonCard / SiteFooter components, bwci-people.js, image-slot.js and bwci-motion.js.
   Everything is scoped to #bwci-profile-richard-werner. The page's own text/x-dc script only reveals .sr elements,
   which this page does not have, so it has no equivalent here. */
(function () {
  'use strict';

  /* Editable settings (logo and portrait image URLs, header/footer toggles, footer legal wording, page links)
     live in the <script type="application/json" id="bwci-profile-richard-werner-config"> block at the very top of the Custom
     Code paste, not here. */

  var ROOT_ID = 'bwci-profile-richard-werner';
  var CONFIG_ID = 'bwci-profile-richard-werner-config';
  var INSTANCE_KEY = '__bwciProfileRichardWerner';

/*@site-chrome*/

/*@profile*/

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
    var profile = siteProfile(root, on);
    var links = cfg.links || {};
    qa('a[data-prw-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-prw-link')];
      if (typeof v === 'string' && v) a.setAttribute('href', v);
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

    /* ================= SITE HEADER + FOOTER, GOVERNANCE SECTION BAR (shared site chrome) ================= */
    var chrome = siteChrome(root, cfg, on, timers);
    var govnav = siteGovNav(root, cfg, on);
    var people = sitePeople(root, cfg, on);

    /* ================= SHARED SCROLL MOTION (design/bwci-motion.js) =================
       bwci-motion skips sections with id "hero" or class hero / hero-fe; this hero (#top.pg-hero) has
       neither, so it is scanned like the other sections (its content starts on screen and stays untagged). */
    var motion = siteMotion(root, { heroId: null, heroSel: ':not(*)' }, on);

    /* ================= GoHighLevel re-render detection ================= */
    var instance;
    function guardConnected() {
      if (root.isConnected) return true;
      // GoHighLevel re-rendered the widget: tear down and attach to the new root.
      instance.destroy();
      requestAnimationFrame(boot);
      return false;
    }
    // Tear down promptly when GHL removes or replaces the Custom Code root.
    var parentObserver = typeof MutationObserver === 'function' ? new MutationObserver(guardConnected) : null;
    if (parentObserver && root.parentNode) parentObserver.observe(root.parentNode, {childList: true});
    // the header keeps its own scroll/resize listeners (shared site chrome); these only detect a re-render
    on(window, 'scroll', guardConnected, { passive: true });
    on(window, 'resize', guardConnected, { passive: true });
    on(window, 'orientationchange', guardConnected, { passive: true });

    instance = {
      root: root,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (parentObserver) parentObserver.disconnect();
        if (profile) profile.destroy();
        if (chrome) chrome.destroy();
        if (govnav) govnav.destroy();
        if (people) people.destroy();
        if (motion) motion.destroy();
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        delete root.dataset.prwInit;
        if (window[INSTANCE_KEY] === instance) window[INSTANCE_KEY] = null;
      }
    };
    return instance;
  }

  /* ---------------- boot + duplicate-initialisation guard ---------------- */
  function boot() {
    var root = document.getElementById(ROOT_ID);
    if (!root) return false;
    var prev = window[INSTANCE_KEY];
    if (prev && !prev.destroyed) {
      if (prev.root === root && root.dataset.prwInit === 'true') return true;   // already running
      prev.destroy();                                                           // stale (re-rendered) instance
    }
    root.dataset.prwInit = 'true';
    window[INSTANCE_KEY] = init(root);
    return true;
  }

  // A host may run the block before inserting markup. Only one pending bootstrap survives re-execution.
  var pendingKey = INSTANCE_KEY + 'Pending';
  if (window[pendingKey]) window[pendingKey].destroy();
  if (!boot()) {
    var observer = null, stopTimer = null;
    var pending = {
      destroy: function () {
        if (observer) observer.disconnect();
        clearTimeout(stopTimer);
        document.removeEventListener('DOMContentLoaded', tryBoot);
        if (window[pendingKey] === pending) delete window[pendingKey];
      }
    };
    var tryBoot = function () { if (boot()) pending.destroy(); };
    window[pendingKey] = pending;
    document.addEventListener('DOMContentLoaded', tryBoot);
    if (typeof MutationObserver === 'function') {
      observer = new MutationObserver(tryBoot);
      observer.observe(document.documentElement, {childList: true, subtree: true});
    }
    stopTimer = setTimeout(pending.destroy, 20000);
  }
})();
