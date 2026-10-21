/* BWCI — The Better World Ecosystem · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js + React) used by the Ecosystem design page and its
   SiteHeader component. Everything is scoped to #bwci-ecosystem. */
(function () {
  'use strict';

  /* Editable settings (hero image URL, header/footer toggles, loop lens + interval, page links) live in
     the <script type="application/json" id="bwci-ecosystem-config"> block at the very top of the
     Custom Code paste, not here. */

  /* ======================= BEHAVIOUR (source values) ======================= */
  var OPTIONS = {
    loopWideMin: 900,           // loop board width at which the 1120x740 canvas is used (else ring + card)
    loopCanvasW: 1120,
    loopCanvasH: 740,
    loopIntervalSec: 4,         // default autoplay step, overridable by config.loop.intervalSec
    loopVisibleThreshold: 0.15, // share of the loop section that must be on screen for autoplay to advance
    revealThreshold: 0.15
  };

  var ROOT_ID = 'bwci-ecosystem';
  var CONFIG_ID = 'bwci-ecosystem-config';
  var INSTANCE_KEY = '__bwciEcosystem';

  /* ---------- loop content (source: LPN + lpSeq) ---------- */
  var LOOP_SEQ = { full: [0, 1, 2, 3, 4], sme: [0, 1, 3, 4], investor: [1, 2, 3, 4], partner: [1, 3, 4] };
  var LOOP_STEPS = [
    { key: 'Need', who: 'A business or impact project', title: 'It starts with a real need', body: 'A growing business or project identifies a specific need, such as working capital, growth finance or a supply-chain gap. The need comes first, not a product.' },
    { key: 'Structure', who: 'The Financial Engine', title: 'The right structure is designed', body: "BWCI's Financial Engine assesses the need and designs a structure that fits it. The structure may be debt, equity, trade finance or a combination." },
    { key: 'Capital', who: 'Investors & capital providers', title: 'Capital is mobilised around the need', body: 'Institutional and wholesale capital can be brought in through appropriately authorised vehicles, matched to the structure rather than forced into a standard product.' },
    { key: 'Delivery', who: 'Platforms & authorised entities', title: 'Delivered by the responsible entity', body: 'Delivery sits with the relevant platform or authorised entity, which carries responsibility for any regulated activity. BWCI does not provide regulated services itself.' },
    { key: 'Return', who: 'The whole network', title: 'Returns and learning flow back', body: 'Returns go to capital providers. What each engagement teaches strengthens the next one. The business stays independent throughout.' }
  ];

  /* ---------- participants content (source: PARTS) ---------- */
  var PARTS = [
    { code: 'G1', title: 'Businesses & Impact Projects', rel: 'The reason the ecosystem exists.', fields: [['They bring', 'Real economic activity, commercial knowledge and demand grounded in real needs.'], ['They may gain', 'Potential access to capital structured around their needs, shared capability and connections to other businesses in the network.']] },
    { code: 'G2', title: 'Investors & Capital Providers', rel: 'Capital partners, participating on their own terms.', fields: [['They bring', 'Institutional, wholesale and impact capital.'], ['They may gain', 'Access to a pipeline of real-economy opportunities, structures designed around real needs and transparent governance and reporting.']] },
    { code: 'G3', title: 'Platforms & Institutions', rel: 'The delivery layer, each with its own mandate.', fields: [['They bring', 'Specialist capability and regulatory authorisation where required '], ['They may gain', 'Shared infrastructure, a steady flow of relevant engagements and lower duplication of operating costs.']] },
    { code: 'G4', title: 'Strategic Partners', rel: 'Enablers, independent and aligned.', partner: true, fields: [['They bring', 'Technology, expertise, distribution and market access.'], ['They may gain', 'Long-term relationships across the network and a role in shaping how it develops.']] }
  ];

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
/*@site-chrome*/

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function scrollBehavior() { return prefersReducedMotion() ? 'auto' : 'smooth'; }
  function setText(el, value) { if (el && el.textContent !== value) el.textContent = value; }

  /* ---------------------------------------------------------------- */
  function init(root) {
    var ac = typeof AbortController === 'function' ? new AbortController() : null;
    var cleanups = [];
    var timers = {};
    var observers = [];
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
    function q(sel) { return root.querySelector(sel); }
    function qa(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

    root.classList.add('eco-js'); // enables the scroll-reveal start state (content stays visible without JS)

    /* ---------- config: image, links, toggles, loop ---------- */
    var cfg = {};
    try {
      var cfgEl = document.getElementById(CONFIG_ID);
      if (cfgEl) cfg = JSON.parse(cfgEl.textContent || '{}') || {};
    } catch (err) { cfg = {}; }
    var links = cfg.links || {};
    qa('[data-eco-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-eco-link')];
      if (typeof v === 'string' && v) a.setAttribute('href', v);
    });
    var heroImg = q('[data-eco-asset="ecosystemHeroImage"]');
    var heroUrl = cfg.ecosystemHeroImage;
    // the untouched placeholder is skipped so it never produces a 404 request
    if (heroImg && typeof heroUrl === 'string' && heroUrl && heroUrl.indexOf('REPLACE-WITH') === -1) heroImg.src = heroUrl;
    var loopCfg = cfg.loop || {};

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
      try { if (history.pushState) history.pushState(null, '', '#' + id); } catch (err) { /* sandboxed */ }
    });

    /* ================= SITE HEADER + FOOTER (shared site chrome) ================= */
    var chrome = siteChrome(root, cfg, on, timers);

    /* ================= SCROLL REVEAL (.rv → .rv-in once, 15% visible) ================= */
    var reveals = qa('.rv');
    if (typeof IntersectionObserver !== 'function') {
      reveals.forEach(function (el) { el.classList.add('rv-in'); });
    } else {
      var rvIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('rv-in'); rvIO.unobserve(en.target); }
        });
      }, { threshold: OPTIONS.revealThreshold });
      reveals.forEach(function (el) { rvIO.observe(el); });
      observers.push(rvIO);
    }

    /* ================= SHARED SCROLL MOTION (design/bwci-motion.js) ================= */
    var motion = siteMotion(root, { heroId: 'eco-hero', heroSel: '.eco-hero' }, on);

    /* ================= 02 · ECOSYSTEM LOOP ================= */
    var loopSec = q('[data-eco-loop]');
    var loop = null;
    if (loopSec) {
      loop = (function () {
        var measureEl = q('[data-eco-lp-measure]');
        var wideEl = q('[data-eco-lp-wide]');
        var narrowEl = q('[data-eco-lp-narrow]');
        var canvasEl = q('[data-eco-lp-canvas]');
        var lensBtns = qa('[data-eco-lens]');
        var nodes = qa('[data-eco-lp-node]');
        var dots = qa('[data-eco-lp-dot]');
        var plays = qa('[data-eco-lp-play]');
        var progs = qa('[data-eco-lp-prog]');
        var eyebrows = qa('[data-eco-lp-eyebrow]');
        var titles = qa('[data-eco-lp-title]');
        var bodies = qa('[data-eco-lp-body]');
        var whoEl = q('[data-eco-lp-who]');
        var hintEl = q('[data-eco-lp-hint]');
        var platEl = q('[data-eco-lp-plat]');

        var lens = LOOP_SEQ[loopCfg.defaultLens] ? loopCfg.defaultLens : 'full';
        var step = LOOP_SEQ[lens][0];
        var playing = !prefersReducedMotion();
        var visible = true;
        var width = 1200; // source initial state before the first measurement
        var intervalSec = Number(loopCfg.intervalSec);
        if (!(intervalSec >= 1 && intervalSec <= 60)) intervalSec = OPTIONS.loopIntervalSec;

        function render() {
          var seq = LOOP_SEQ[lens];
          lensBtns.forEach(function (b) {
            var sel = b.getAttribute('data-eco-lens') === lens;
            b.classList.toggle('eco-on', sel);
            b.setAttribute('aria-selected', sel ? 'true' : 'false');
          });
          nodes.forEach(function (n) {
            var i = Number(n.getAttribute('data-eco-lp-node'));
            var act = i === step;
            n.classList.toggle('is-on', act);
            n.classList.toggle('is-dim', !act && seq.indexOf(i) !== -1);
            n.classList.toggle('is-off', !act && seq.indexOf(i) === -1);
            n.setAttribute('aria-pressed', act ? 'true' : 'false');
          });
          dots.forEach(function (d) {
            var i = Number(d.getAttribute('data-eco-lp-dot'));
            d.hidden = seq.indexOf(i) === -1;
            d.classList.toggle('eco-on', i === step);
          });
          plays.forEach(function (b) { b.hidden = playing; });
          progs.forEach(function (p) { p.hidden = !playing; });
          var s = LOOP_STEPS[step];
          eyebrows.forEach(function (el) { setText(el, 'Step ' + pad2(step + 1) + ' · ' + s.key); });
          titles.forEach(function (el) { setText(el, s.title); });
          bodies.forEach(function (el) { setText(el, s.body); });
          setText(whoEl, s.who);
          setText(hintEl, playing ? 'Auto-playing' : 'Paused');
          if (platEl) platEl.hidden = step !== 3;
        }
        function layout() {
          var w = measureEl.clientWidth;
          if (w) width = w;
          var wide = width >= OPTIONS.loopWideMin;
          var scale = Math.min(1, width / OPTIONS.loopCanvasW);
          wideEl.hidden = !wide;
          narrowEl.hidden = wide;
          wideEl.style.height = Math.round(OPTIONS.loopCanvasH * scale) + 'px';
          canvasEl.style.transform = 'translateX(-50%) scale(' + scale + ')';
        }
        function pick(i) { step = i; playing = false; render(); }
        function tick() {
          if (!guardConnected()) return;
          if (!playing || !visible || document.hidden) return;
          var seq = LOOP_SEQ[lens];
          step = seq[(seq.indexOf(step) + 1) % seq.length];
          render();
        }

        lensBtns.forEach(function (b) {
          on(b, 'click', function () {
            lens = b.getAttribute('data-eco-lens');
            step = LOOP_SEQ[lens][0];
            playing = true;
            render();
          });
        });
        nodes.forEach(function (n) { on(n, 'click', function () { pick(Number(n.getAttribute('data-eco-lp-node'))); }); });
        dots.forEach(function (d) { on(d, 'click', function () { pick(Number(d.getAttribute('data-eco-lp-dot'))); }); });
        plays.forEach(function (b) { on(b, 'click', function () { playing = true; render(); }); });

        if (typeof ResizeObserver === 'function') {
          var ro = new ResizeObserver(function () { layout(); });
          ro.observe(measureEl);
          observers.push(ro);
        } else {
          on(window, 'resize', layout, { passive: true });
        }
        if (typeof IntersectionObserver === 'function') {
          var visIO = new IntersectionObserver(function (entries) {
            visible = entries[entries.length - 1].isIntersecting;
          }, { threshold: OPTIONS.loopVisibleThreshold });
          visIO.observe(loopSec);
          observers.push(visIO);
        }
        timers.loop = setInterval(tick, intervalSec * 1000);
        // Port addition: CSS reduced-motion rules cannot stop the SVG (SMIL) dots travelling round the
        // loop, so they are frozen here when the visitor asks for reduced motion.
        if (prefersReducedMotion()) {
          qa('.lp-svg, .lp-ring__svg').forEach(function (svg) { if (svg.pauseAnimations) svg.pauseAnimations(); });
        }
        layout();
        render();
        return { layout: layout };
      })();
    }

    /* ================= 04 · CONNECTION MECHANICS ================= */
    var mechItems = qa('[data-eco-mech-item]');
    var mechDiagram = q('[data-eco-mech-diagram]');
    var mech = 0;
    function mechPick(i) {
      if (i === mech) return;
      mech = i;
      mechItems.forEach(function (b, j) { b.classList.toggle('cm-item--on', j === i); });
      if (mechDiagram) mechDiagram.setAttribute('data-mech', String(i));
    }
    mechItems.forEach(function (b, i) {
      var pick = function () { mechPick(i); };
      on(b, 'click', pick);
      on(b, 'mouseenter', pick);
      on(b, 'focus', pick);
    });

    /* ================= 05 · PARTICIPANTS ================= */
    var partNodes = qa('[data-eco-part]');
    var partSpokes = qa('[data-eco-part-spoke]');
    var partPorts = qa('[data-eco-part-port]');
    var partPanel = q('[data-eco-part-panel]');
    var partRel = q('[data-eco-part-rel]');
    var partFields = {
      code: q('[data-eco-part-code]'), title: q('[data-eco-part-title]'), rel: q('[data-eco-part-reltext]'),
      l0: q('[data-eco-part-l0]'), t0: q('[data-eco-part-t0]'), l1: q('[data-eco-part-l1]'), t1: q('[data-eco-part-t1]')
    };
    var part = 0;
    function partPick(i) {
      if (i === part) return;
      part = i;
      partNodes.forEach(function (n, j) {
        n.classList.toggle('pt-node--on', j === i);
        n.setAttribute('aria-pressed', j === i ? 'true' : 'false');
      });
      partSpokes.forEach(function (s, j) { s.classList.toggle('pt-spoke--on', j === i); });
      partPorts.forEach(function (p, j) { p.classList.toggle('pt-port--on', j === i); });
      var P = PARTS[i];
      setText(partFields.code, P.code);
      setText(partFields.title, P.title);
      setText(partFields.rel, P.rel);
      setText(partFields.l0, P.fields[0][0]);
      setText(partFields.t0, P.fields[0][1]);
      setText(partFields.l1, P.fields[1][0]);
      setText(partFields.t1, P.fields[1][1]);
      if (partRel) partRel.classList.toggle('pt-rel--partner', !!P.partner);
      if (partPanel) {
        // source re-mounts the panel (React key), which replays its fade-up entrance
        partPanel.style.animation = 'none';
        void partPanel.offsetWidth;
        partPanel.style.animation = '';
      }
    }
    partNodes.forEach(function (n, i) {
      var pick = function () { partPick(i); };
      on(n, 'mouseenter', pick);
      on(n, 'click', pick);
      on(n, 'focus', pick);
    });

    /* ================= shared scroll / resize ================= */
    var instance;
    function guardConnected() {
      if (root.isConnected) return true;
      // GoHighLevel re-rendered the widget: tear down and attach to the new root.
      instance.destroy();
      requestAnimationFrame(boot);
      return false;
    }
    // the header keeps its own scroll/resize listeners (shared site chrome); these only detect a re-render
    on(window, 'scroll', guardConnected, { passive: true });
    on(window, 'resize', guardConnected, { passive: true });
    on(window, 'orientationchange', guardConnected, { passive: true });

    instance = {
      root: root,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (chrome) chrome.destroy();
        if (motion) motion.destroy();
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        observers.forEach(function (o) { o.disconnect(); });
        clearInterval(timers.loop);
        delete root.dataset.ecoInit;
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
      if (prev.root === root && root.dataset.ecoInit === 'true') return true;   // already running
      prev.destroy();                                                           // stale (re-rendered) instance
    }
    root.dataset.ecoInit = 'true';
    window[INSTANCE_KEY] = init(root);
    return true;
  }

  if (!boot()) {
    var observer = null;
    var stopTimer = null;
    var tryBoot = function () {
      if (boot()) {
        if (observer) observer.disconnect();
        clearTimeout(stopTimer);
        document.removeEventListener('DOMContentLoaded', tryBoot);
      }
    };
    document.addEventListener('DOMContentLoaded', tryBoot);
    if (typeof MutationObserver === 'function') {
      observer = new MutationObserver(tryBoot);
      observer.observe(document.documentElement, { childList: true, subtree: true });
      stopTimer = setTimeout(function () { observer.disconnect(); }, 20000);
    }
  }
})();
