/* BWCI — The Financial Engine · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js + React) used by the Financial Engine Claude Design page
   and its SiteHeader component. Everything is scoped to #bwci-financial-engine. */
(function () {
  'use strict';

  /* ======================= CONFIGURATION ======================= */
  // 1) Hero image. Upload the webp to GoHighLevel Media Storage (or any CDN) and paste its URL here.
  var ASSETS = {
    financialEngineImage: '__FE_IMAGE_URL__'
  };
  // 2) Page URLs used by header / footer / CTA links (replace the Claude Design page files).
  //    A link written as data-fe-href="home#trust" resolves to ROUTES.home + "#trust".
  var ROUTES = {
    home: '/',
    ecosystem: '/ecosystem',
    platforms: '/platforms',
    smes: '/smes-projects',
    investors: '/investors-partners',
    contact: '/#cta'            // "Start a Conversation" / "Contact" / "Discuss" targets
  };
  // 3) Behaviour (values mirror the source implementation).
  var OPTIONS = {
    opsLockOffset: 64,          // px from viewport top where the Operating Model locks (source navOffset)
    opsDesktopMin: 1024,        // wheel/keyboard capture + orbit wheel only at >= this width
    opsWheelThreshold: 80,      // accumulated wheel delta needed to advance one stage
    opsTransitionMs: 550,       // cooldown between stage changes
    opsReleaseNudge: 140,       // px scrolled when the lock releases past stage 1 / 7
    opsRearmMs: 450,            // delay before the lock can re-engage after release
    headerDesktopMin: 1200      // header switches to burger/drawer below this width
  };
  /* ============================================================= */

  var ROOT_ID = 'bwci-financial-engine';
  var INSTANCE_KEY = '__bwciFinancialEngine';

  var PR_CONTENT = [
    { label: '01 · The starting point', title: 'Begin with the real constraint.', body: 'A business, place, or sector has a need that existing financial products do not serve well. That need — not whatever product happens to be available — sets the direction.', proof: 'Starting from the need avoids forcing a deal into the wrong financial structure.' },
    { label: '02 · The response', title: 'Make the route fit the need.', body: 'he structure is designed around the business’s commercial reality: its risks, its timeline, its governance needs, and a practical route to delivery.', proof: 'The aim is a structure that fits, not an existing product with a new label' },
    { label: '03 · The delivery perimeter', title: 'Connect the capability that can act.', body: 'BWCI chooses the best delivery route: through a group company, a platform under construction, an independent partner, or financial infrastructure that enables delivery.', proof: 'The route is chosen because it fits the structure, the regulations, and the work involved' },
    { label: '04 · The enabling resource', title: 'Mobilise capital with purpose.', body: 'Capital is matched to the structure, with terms, governance, and risk sharing designed around the activity the capital is meant to fund. ', proof: 'Capital is the means, not the starting point' },
    { label: '05 · The outcome', title: 'Turn the connection into activity.', body: 'Success is measured by tangible outcomes: a viable business, infrastructure that gets built, or a solution that works in practice. ', proof: 'What we learn from each outcome shapes how we design the next structure.' }
  ];
  var OPS_COUNT = 7;
  var ANGLE_STEP = 360 / OPS_COUNT;

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
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
    function q(sel) { return root.querySelector(sel); }
    function qa(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

    /* ---------- assets + routes (single configuration points) ---------- */
    qa('img[data-fe-asset]').forEach(function (img) {
      var url = ASSETS[img.getAttribute('data-fe-asset')];
      if (url && url.indexOf('__FE_') !== 0 && url.indexOf('REPLACE_WITH') === -1 && img.getAttribute('src') !== url) {
        img.setAttribute('src', url);
      }
    });
    qa('a[data-fe-href]').forEach(function (a) {
      var spec = a.getAttribute('data-fe-href');
      var i = spec.indexOf('#');
      var key = i === -1 ? spec : spec.slice(0, i);
      var hash = i === -1 ? '' : spec.slice(i);
      if (Object.prototype.hasOwnProperty.call(ROUTES, key)) a.setAttribute('href', ROUTES[key] + hash);
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
      try { if (history.pushState) history.pushState(null, '', '#' + id); } catch (err) { /* sandboxed */ }
    });

    /* ================= SITE HEADER ================= */
    var header = null;
    var hdrHost = q('.fe-hdr-host');
    var hdr = q('[data-fe-hdr]');
    if (hdr && root.getAttribute('data-show-header') !== 'false') {
      header = (function () {
        var util = q('[data-fe-hdr-util]');
        var dd = q('[data-fe-dd]');
        var ddToggle = q('[data-fe-dd-toggle]');
        var ddPanel = q('[data-fe-dd-panel]');
        var burger = q('[data-fe-menu-open]');
        var menuParts = qa('[data-fe-menu-part]');
        var utilH = 0;
        var stuck = false;
        var ddOpen = false;
        var menuOpen = false;
        var prevBodyOverflow = '';
        var acc = { hiw: true, gov: false };

        function setDd(open) {
          ddOpen = open;
          ddToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
          ddPanel.hidden = !open;
        }
        function setMenu(open) {
          if (open === menuOpen) return;
          menuOpen = open;
          if (open) { prevBodyOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
          else { document.body.style.overflow = prevBodyOverflow; }
          burger.setAttribute('aria-expanded', open ? 'true' : 'false');
          menuParts.forEach(function (el) { el.hidden = !open; });
        }
        function setAcc(key, open) {
          acc[key] = open;
          var btn = q('[data-fe-acc="' + key + '"]');
          var panel = q('[data-fe-acc-panel="' + key + '"]');
          if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
          if (panel) panel.hidden = !open;
        }
        function onScroll() {
          // Source: stuck = window.scrollY > utilH + 2 (header at page top). Measured relative to
          // the widget so it stays correct when GHL content sits above the widget.
          var s = -root.getBoundingClientRect().top > utilH + 2;
          if (s !== stuck) { stuck = s; hdr.classList.toggle('fe-hdr--stuck', s); }
        }
        function measure() {
          utilH = util ? util.offsetHeight : 0;
          root.style.setProperty('--util-h', utilH + 'px');
          root.style.setProperty('--nav-h', hdr.offsetHeight + 'px');
          if (window.innerWidth >= OPTIONS.headerDesktopMin && menuOpen) setMenu(false);
          onScroll();
        }

        on(dd, 'mouseenter', function () {
          clearTimeout(timers.dd);
          if (window.matchMedia && window.matchMedia('(hover:hover)').matches) setDd(true);
        });
        on(dd, 'mouseleave', function () {
          clearTimeout(timers.dd);
          timers.dd = setTimeout(function () { setDd(false); }, 160);
        });
        on(ddToggle, 'click', function () { setDd(!ddOpen); });
        qa('[data-fe-dd-close]').forEach(function (el) { on(el, 'click', function () { setDd(false); }); });
        on(burger, 'click', function () { setMenu(true); });
        qa('[data-fe-menu-close]').forEach(function (el) { on(el, 'click', function () { setMenu(false); }); });
        qa('[data-fe-acc]').forEach(function (btn) {
          on(btn, 'click', function () { var k = btn.getAttribute('data-fe-acc'); setAcc(k, !acc[k]); });
        });
        on(document, 'mousedown', function (e) { if (ddOpen && !dd.contains(e.target)) setDd(false); });
        on(document, 'keydown', function (e) {
          if (e.key === 'Escape') { if (ddOpen) setDd(false); if (menuOpen) setMenu(false); }
        });

        measure();
        requestAnimationFrame(measure);
        return {
          onScroll: onScroll,
          measure: measure,
          destroy: function () { if (menuOpen) setMenu(false); clearTimeout(timers.dd); }
        };
      })();
    } else if (hdrHost) {
      root.style.setProperty('--util-h', '0px');
    }

    /* ================= 01 · OPERATING PRINCIPLE ================= */
    var pr = q('[data-fe-pr]');
    var prActive = 1;
    var prChapters = qa('[data-fe-pr-chapter]');
    var prReading = q('[data-fe-pr-reading]');
    var prFields = {};
    qa('[data-fe-pr-field]').forEach(function (el) { prFields[el.getAttribute('data-fe-pr-field')] = el; });
    function prPick(step) {
      if (step === prActive || step < 1 || step > 5) return;
      prActive = step;
      pr.setAttribute('data-active', String(step));
      prReading.setAttribute('data-num', pad2(step));
      prChapters.forEach(function (b) {
        b.setAttribute('aria-pressed', Number(b.getAttribute('data-fe-pr-chapter')) === step ? 'true' : 'false');
      });
      var item = PR_CONTENT[step - 1];
      ['label', 'title', 'body', 'proof'].forEach(function (k) { if (prFields[k]) prFields[k].textContent = item[k]; });
    }
    prChapters.forEach(function (b) {
      var step = Number(b.getAttribute('data-fe-pr-chapter'));
      var pick = function () { prPick(step); };
      on(b, 'mouseenter', pick);
      on(b, 'focus', pick);
      on(b, 'click', pick);
    });

    /* ================= 02 · OPERATING MODEL ================= */
    var opsViewport = q('[data-fe-ops-viewport]');
    var opsNodes = qa('[data-fe-ops-node]');
    var opsPanels = qa('[data-fe-ops-panel]');
    var opsDots = qa('[data-fe-ops-dot]');
    var opsPrev = q('[data-fe-ops-prev]');
    var opsNext = q('[data-fe-ops-next]');
    var opsNum = q('[data-fe-ops-num]');
    var opsTitle = q('[data-fe-ops-title]');
    var opsLoop = q('[data-fe-ops-loop]');
    var opsTitles = opsPanels.map(function (p) {
      var t = p.querySelector('.ops-panel__title');
      return t ? t.textContent.trim() : '';
    });

    var ops = {
      stage: 0, locked: false, transitioning: false, wheelDelta: 0,
      entryArmed: true, lastTop: null, correctingUntil: 0,
      pendingJump: null, pendingJumpUntil: 0
    };

    function opsRender() {
      var active = ops.stage;
      opsNodes.forEach(function (node, i) {
        var delta = i - active;
        var abs = Math.abs(delta);
        var isActive = delta === 0;
        node.style.setProperty('--stage-total-angle', (delta * ANGLE_STEP).toFixed(2) + 'deg');
        node.style.opacity = abs === 0 ? '1' : (abs === 1 ? '0.7' : '0');
        node.style.pointerEvents = abs <= 1 ? 'auto' : 'none';
        node.classList.toggle('ops-stage-node--active', isActive);
      });
      opsPanels.forEach(function (p, i) { p.classList.toggle('ops-panel--active', i === active); });
      opsDots.forEach(function (d, i) {
        d.classList.toggle('ops-rail-dot--active', i === active);
        d.classList.toggle('ops-rail-dot--done', i < active);
        d.setAttribute('aria-selected', i === active ? 'true' : 'false');
      });
      if (opsNum) opsNum.textContent = pad2(active + 1);
      if (opsTitle) opsTitle.textContent = opsTitles[active];
      if (opsPrev) opsPrev.disabled = active === 0;
      if (opsNext) opsNext.disabled = active === OPS_COUNT - 1;
      if (opsLoop) opsLoop.classList.toggle('ops-loop-note--active', active >= 5);
    }
    function opsSetStage(i) {
      if (i === ops.stage) return;
      ops.stage = i;
      opsRender();
    }
    function opsIsDesktop() { return window.innerWidth >= OPTIONS.opsDesktopMin; }

    function opsEngageLock(direction) {
      ops.locked = true;
      ops.entryArmed = false;
      ops.wheelDelta = 0;
      var initial = direction === 'down' ? 0 : OPS_COUNT - 1;
      // Port fix: a stage chosen by clicking the orbit just before the lock engages is kept.
      if (ops.pendingJump !== null && Date.now() < ops.pendingJumpUntil) initial = ops.pendingJump;
      ops.pendingJump = null;
      opsSetStage(initial);
      // Corrective snap to the lock line (source: a couple of px at most).
      var correction = opsViewport.getBoundingClientRect().top - OPTIONS.opsLockOffset;
      if (Math.abs(correction) > 0.5) {
        ops.correctingUntil = Date.now() + 900;
        window.scrollBy({ top: correction, left: 0, behavior: scrollBehavior() });
      }
    }
    function opsReleaseLock(direction, nudge) {
      ops.locked = false;
      ops.wheelDelta = 0;
      if (nudge) {
        // Hand control back with one real gesture's worth of movement.
        window.scrollBy({ top: direction === 'down' ? OPTIONS.opsReleaseNudge : -OPTIONS.opsReleaseNudge, left: 0, behavior: scrollBehavior() });
      }
      clearTimeout(timers.rearm);
      timers.rearm = setTimeout(function () { ops.entryArmed = true; }, OPTIONS.opsRearmMs);
    }
    function opsGoToStage(next) {
      ops.transitioning = true;
      opsSetStage(next);
      clearTimeout(timers.transition);
      timers.transition = setTimeout(function () { ops.transitioning = false; }, OPTIONS.opsTransitionMs);
    }
    function opsStep(dir) {
      var current = ops.stage;
      if (dir > 0) { if (current >= OPS_COUNT - 1) opsReleaseLock('down', true); else opsGoToStage(current + 1); }
      else { if (current <= 0) opsReleaseLock('up', true); else opsGoToStage(current - 1); }
    }

    // Passive watcher: detects the moment the section's top edge crosses the lock line.
    function opsCheckEntry() {
      if (!opsViewport || !opsIsDesktop()) return;
      var top = opsViewport.getBoundingClientRect().top;
      if (ops.locked) {
        // Port safety: if the page was moved by something other than the wheel
        // (scrollbar drag, touch, anchor link, find-in-page) release the lock so it
        // cannot keep capturing the wheel/keys while the section is off-screen.
        if (Date.now() > ops.correctingUntil && Math.abs(top - OPTIONS.opsLockOffset) > 120) {
          opsReleaseLock(top > OPTIONS.opsLockOffset ? 'up' : 'down', false);
          ops.lastTop = top;
        }
        return;
      }
      var prevTop = ops.lastTop === null ? top : ops.lastTop;
      var scrollingDown = top <= prevTop;
      ops.lastTop = top;
      if (!ops.entryArmed) return;
      var off = OPTIONS.opsLockOffset;
      if (scrollingDown && prevTop > off && top <= off) opsEngageLock('down');
      else if (!scrollingDown && prevTop < off && top >= off) opsEngageLock('up');
    }

    // Non-passive wheel capture: while locked this is the ONLY thing that changes the stage.
    function opsOnWheel(e) {
      if (!ops.locked) return;
      if (!opsIsDesktop()) { ops.locked = false; return; }
      e.preventDefault();
      if (ops.transitioning) return;
      var dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16; else if (e.deltaMode === 2) dy *= window.innerHeight;
      ops.wheelDelta += dy;
      if (ops.wheelDelta > OPTIONS.opsWheelThreshold) { ops.wheelDelta = 0; opsStep(1); }
      else if (ops.wheelDelta < -OPTIONS.opsWheelThreshold) { ops.wheelDelta = 0; opsStep(-1); }
    }
    // Keyboard: secondary capture path with the same lock/release semantics.
    function opsOnKey(e) {
      if (!ops.locked) return;
      var t = e.target;
      var tag = (t && t.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
      var k = e.key;
      var down = k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Spacebar';
      var up = k === 'ArrowUp' || k === 'PageUp';
      if (!down && !up) return;
      e.preventDefault();
      if (ops.transitioning) return;
      opsStep(down ? 1 : -1);
    }
    function opsJump(i) {
      if (ops.locked) {
        if (ops.transitioning) return;
        opsGoToStage(i);
      } else {
        opsSetStage(i);
        ops.pendingJump = i;
        ops.pendingJumpUntil = Date.now() + 1500;
        if (opsViewport && opsViewport.scrollIntoView) opsViewport.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
      }
    }

    if (opsViewport) {
      opsNodes.forEach(function (node) {
        on(node, 'click', function () { opsJump(Number(node.getAttribute('data-fe-ops-node'))); });
      });
      opsDots.forEach(function (d) {
        on(d, 'click', function () { opsJump(Number(d.getAttribute('data-fe-ops-dot'))); });
      });
      if (opsPrev) on(opsPrev, 'click', function () { opsJump(Math.max(0, ops.stage - 1)); });
      if (opsNext) on(opsNext, 'click', function () { opsJump(Math.min(OPS_COUNT - 1, ops.stage + 1)); });
      on(window, 'wheel', opsOnWheel, { passive: false });
      on(window, 'keydown', opsOnKey, { passive: false });
      opsRender();
    }

    /* ================= 05 · CAPABILITIES ================= */
    var caps = qa('[data-fe-cap]');
    var activeCap = 1;
    function capPick(i) {
      if (i === activeCap) return;
      activeCap = i;
      caps.forEach(function (b, j) {
        b.classList.toggle('cap-item--active', j === i);
        b.setAttribute('aria-pressed', j === i ? 'true' : 'false');
      });
    }
    caps.forEach(function (b, i) {
      var pick = function () { capPick(i); };
      on(b, 'mouseenter', pick);
      on(b, 'focus', pick);
      on(b, 'click', pick);
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
    function onScroll() {
      if (!guardConnected()) return;
      if (header) header.onScroll();
      opsCheckEntry();
    }
    function onResize() {
      if (!guardConnected()) return;
      if (ops.locked && !opsIsDesktop()) { ops.locked = false; ops.wheelDelta = 0; }
      if (timers.resizeRaf) cancelAnimationFrame(timers.resizeRaf);
      timers.resizeRaf = requestAnimationFrame(function () {
        timers.resizeRaf = 0;
        if (header) header.measure();
        ops.lastTop = null;
      });
    }
    on(window, 'scroll', onScroll, { passive: true });
    on(window, 'resize', onResize, { passive: true });
    on(window, 'orientationchange', onResize, { passive: true });
    opsCheckEntry();

    instance = {
      root: root,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (header) header.destroy();
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        Object.keys(timers).forEach(function (k) { clearTimeout(timers[k]); if (k === 'resizeRaf') cancelAnimationFrame(timers[k]); });
        delete root.dataset.feInit;
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
      if (prev.root === root && root.dataset.feInit === 'true') return true;   // already running
      prev.destroy();                                                          // stale (re-rendered) instance
    }
    root.dataset.feInit = 'true';
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
