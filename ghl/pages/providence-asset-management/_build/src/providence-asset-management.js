/* BWCI — Providence Asset Management · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js + React) used by design/Providence Asset Management.dc.html and its
   SiteHeader / Breadcrumb / SiteFooter components, pam-worldmap.js (its data is inlined below) and bwci-motion.js.
   Everything is scoped to #bwci-providence-asset-management. The page's own text/x-dc component draws the "Who PAM
   works with" reach map, lights the Financial Engine strip, lets a mouse drag the mobile people carousel and shows
   the review badges; all four are reproduced below. */
(function () {
  'use strict';

  /* Editable settings (logo and portrait image URLs, header/footer toggles, footer legal wording, page links)
     live in the <script type="application/json" id="bwci-providence-asset-management-config"> block at the very top of the Custom
     Code paste, not here. The hero image is "pamHeroImage", the portraits
     "peopleImages" and the review badges "showFlags". */

  var ROOT_ID = 'bwci-providence-asset-management';
  var CONFIG_ID = 'bwci-providence-asset-management-config';
  var INSTANCE_KEY = '__bwciProvidenceAssetManagement';

/*@site-chrome*/

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function scrollBehavior() { return prefersReducedMotion() ? 'auto' : 'smooth'; }

  /* ================= WHO PAM WORKS WITH — reach map (source initMap + pam-worldmap.js) =================
     A dot map drawn on a canvas from the source's bitmap (one bit per 2° cell, 180×71), with four region anchors
     (UK, EU, Switzerland, Middle East). Once 25 % of the map is visible it gets "in": the leader lines draw and
     the callouts rise. Over the map, the pointer magnifies the nearby dots, shifts the dot and callout layers in
     parallax (not under reduced motion) and activates the nearest anchor (or the hovered callout). While visible
     and not reduced, a frame loop runs (about 30 fps when idle) for the pulsing anchor rings; under reduced
     motion each change draws one static frame. Same geometry, colours and timing as the source. */
  /*@pam-world*/
  function pamMap(fig, on) {
    if (!fig || typeof PAM_WORLD !== 'object') return null;
    var W = PAM_WORLD, inner = fig.querySelector('.pam-cl-map-in'), cv = fig.querySelector('canvas');
    var ctx = cv && cv.getContext ? cv.getContext('2d') : null;
    if (!inner || !ctx) return null;
    var tips = Array.prototype.slice.call(fig.querySelectorAll('.pam-cl-tip'));
    var lines = Array.prototype.slice.call(fig.querySelectorAll('.pam-cl-lines polyline'));
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    // a copied live root starts as the source does on mount: not revealed, nothing active, no parallax
    fig.classList.remove('pam-in');
    tips.concat(lines).forEach(function (el) { el.classList.remove('pam-on'); });
    inner.style.removeProperty('--px'); inner.style.removeProperty('--py');
    var anchors = [[89, 15.5], [97, 16.5], [94, 18.5], [115, 29.5]];
    var zones = [[89, 15.5, 2.6, 0], [99, 17.5, 6, 1], [94, 18.5, 1.6, 2], [113, 30, 6.5, 3]];
    var pal = ['#12836B', '#B98F2D', '#7FC8B3'];
    var dots = [];
    W.rows.forEach(function (row, r) {
      for (var c = 0; c < W.w; c++) {
        var nib = parseInt(row[c >> 2], 16);
        if (!(nib & (8 >> (c & 3)))) continue;
        var z = -1;
        for (var q = 0; q < zones.length; q++) { if (Math.hypot(c + 0.5 - zones[q][0], r + 0.5 - zones[q][1]) < zones[q][2]) { z = zones[q][3]; break; } }
        var hsh = Math.abs(Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1;
        dots.push({ x: c + 0.5, y: r + 0.5, z: z, col: z < 0 ? null : (hsh < 0.2 ? null : pal[hsh < 0.5 ? 2 : hsh < 0.8 ? 0 : 1]) });
      }
    });
    var grid = {};
    dots.forEach(function (d) { grid[(d.y - 0.5) * W.w + (d.x - 0.5)] = d; });
    var zoneDots = [[], [], [], []];
    dots.forEach(function (d) { if (d.z >= 0) zoneDots[d.z].push(d); });
    var cell = 1, dpr = 1, cw = 0, chh = 0;
    var off = document.createElement('canvas'), octx = off.getContext('2d');
    // fill one square per dot, batched by colour and alpha (the source's paint)
    function paint(c, list, s, alphaFor, colFor) {
      var groups = {}, order = [];
      list.forEach(function (d) { var k = colFor(d) + '|' + alphaFor(d); if (!groups[k]) { groups[k] = []; order.push(k); } groups[k].push(d); });
      order.forEach(function (k) {
        var parts = k.split('|');
        c.globalAlpha = +parts[1]; c.fillStyle = parts[0]; c.beginPath();
        groups[k].forEach(function (d) {
          var q = d.s || s;
          var px = d.px != null ? d.px : d.x * cell, py = d.py != null ? d.py : d.y * cell;
          c.rect(px - q / 2, py - q / 2, q, q);
        });
        c.fill();
      });
      c.globalAlpha = 1;
    }
    function baseCol(d) { return d.col || (d.z >= 0 ? '#A3D9C9' : '#123039'); }
    function baseA(d) { return d.col ? 0.85 : d.z >= 0 ? 0.5 : 0.15; }
    function size() {
      var bb = inner.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1); cw = bb.width; chh = bb.height;
      cv.width = off.width = cw * dpr; cv.height = off.height = chh * dpr; cell = cw / W.w;
      octx.setTransform(dpr, 0, 0, dpr, 0, 0); octx.clearRect(0, 0, cw, chh); paint(octx, dots, cell * 0.56, baseA, baseCol);
    }
    size();
    var mx = -999, my = -999, tx = -999, ty = -999, inten = 0, tInten = 0, active = -1, raf = 0, vis = false, stopped = false;
    var t0 = performance.now(), last = 0;
    function setActive(i) {
      if (i === active) return;
      active = i;
      tips.forEach(function (t, k) { t.classList.toggle('pam-on', k === i); });
      lines.forEach(function (l, k) { l.classList.toggle('pam-on', k === i); });
    }
    function frame(now) {
      raf = 0;
      if (stopped) return;
      // the source throws (drawImage of a 0-size canvas) if a frame lands while the map has no size, e.g. during a
      // viewport change; that frame is skipped here and the resize observer draws again once the map has a size
      if (!cv.width || !cv.height) return;
      var idle = inten < 0.01 && tInten === 0;
      if (idle && now - last < 33) { if (vis && !reduce) raf = requestAnimationFrame(frame); return; }
      last = now;
      var tm = (now - t0) / 1000;
      mx += (tx - mx) * 0.16; my += (ty - my) * 0.16; inten += (tInten - inten) * 0.1;
      if (tInten === 0 && inten < 0.01) inten = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(off, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var base = cell * 0.56;
      if (inten > 0.01) {
        var R = Math.max(70, cell * 16), near = [];
        var c0 = Math.max(0, Math.floor((mx - R) / cell) - 1), c1 = Math.min(W.w - 1, Math.ceil((mx + R) / cell) + 1);
        var r0 = Math.max(0, Math.floor((my - R) / cell) - 1), r1 = Math.min(W.h - 1, Math.ceil((my + R) / cell) + 1);
        for (var r = r0; r <= r1; r++) for (var c = c0; c <= c1; c++) {
          var d = grid[r * W.w + c];
          if (!d) continue;
          var x = d.x * cell, y = d.y * cell, dx = x - mx, dy = y - my, dd = Math.hypot(dx, dy);
          if (dd >= R + cell) continue;
          var t = Math.max(0, 1 - dd / R); t = t * t * inten;
          near.push({ x: d.x, y: d.y, col: d.col, z: d.z, t: t, px: x + (dd > 0.1 ? dx / dd * t * cell * 0.9 : 0), py: y + (dd > 0.1 ? dy / dd * t * cell * 0.9 : 0), s: base * (1 + t * 0.7) });
        }
        ctx.save(); ctx.beginPath(); ctx.arc(mx, my, R + cell * 1.5, 0, Math.PI * 2); ctx.clip();
        ctx.clearRect(mx - R - cell * 2, my - R - cell * 2, (R + cell * 2) * 2, (R + cell * 2) * 2); ctx.restore();
        near.forEach(function (n) { n.q = Math.round(n.t * 6) / 6; });
        paint(ctx, near, base, function (n) { return n.col ? 0.85 : (0.15 + n.q * 0.25).toFixed(2); }, baseCol);
        paint(ctx, near.filter(function (n) { return !n.col && n.q > 0; }), base, function (n) { return Math.min(0.85, n.q * 1.2).toFixed(2); }, function () { return '#12836B'; });
      }
      if (active >= 0) {
        var pul = (0.75 + 0.25 * Math.sin(tm * 4)).toFixed(2);
        paint(ctx, zoneDots[active].filter(function (d) { return d.col; }), base * 1.15, function () { return pul; }, function (d) { return d.col; });
      }
      anchors.forEach(function (a, i) {
        var px = a[0] * cell, py = a[1] * cell, isOn = i === active;
        var ph = reduce ? 0 : ((tm * 0.55 + i * 0.27) % 1);
        ctx.globalAlpha = (1 - ph) * (isOn ? 0.9 : 0.55); ctx.strokeStyle = isOn ? '#12836B' : '#B98F2D'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(px, py, cell * (0.8 + ph * (isOn ? 4.5 : 3)), 0, Math.PI * 2); ctx.stroke();
        var sq = cell * (isOn ? 1.05 : 0.85);
        ctx.globalAlpha = 1; ctx.fillStyle = isOn ? '#12836B' : '#B98F2D'; ctx.fillRect(px - sq / 2, py - sq / 2, sq, sq);
      });
      ctx.globalAlpha = 1;
      if (vis && !reduce) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !stopped) raf = requestAnimationFrame(frame); }
    on(fig, 'pointermove', function (e) {
      var b = inner.getBoundingClientRect();
      tx = e.clientX - b.left; ty = e.clientY - b.top;
      if (mx < -900) { mx = tx; my = ty; }
      tInten = 1;
      if (!reduce) { inner.style.setProperty('--px', (tx / b.width - 0.5) * 2); inner.style.setProperty('--py', (ty / b.height - 0.5) * 2); }
      var best = -1, bd = Math.max(48, cell * 7);
      anchors.forEach(function (a, i) { var dd = Math.hypot(a[0] * cell - tx, a[1] * cell - ty); if (dd < bd) { bd = dd; best = i; } });
      var tipHit = e.target.closest && e.target.closest('.pam-cl-tip');
      setActive(tipHit ? +tipHit.getAttribute('data-i') : best);
      kick();
    });
    on(fig, 'pointerleave', function () {
      tInten = 0; inner.style.setProperty('--px', 0); inner.style.setProperty('--py', 0); setActive(-1); kick();
    });
    var ro = typeof ResizeObserver === 'function' ? new ResizeObserver(function () { size(); kick(); }) : null;
    if (ro) ro.observe(inner); else on(window, 'resize', function () { size(); kick(); }, { passive: true });
    var io = null;
    if (typeof IntersectionObserver === 'function') {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { vis = e.isIntersecting; if (vis) { fig.classList.add('pam-in'); kick(); } });
      }, { threshold: 0.25 });
      io.observe(fig);
    } else {
      vis = true; fig.classList.add('pam-in');
    }
    kick();
    return {
      destroy: function () {
        stopped = true;
        cancelAnimationFrame(raf);
        if (ro) ro.disconnect();
        if (io) io.disconnect();
        // a copied live root starts as the source does on mount
        fig.classList.remove('pam-in');
        setActive(-1);
        inner.style.removeProperty('--px'); inner.style.removeProperty('--py');
      }
    };
  }

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

    /* ---------- hero image (source: ./assets/pam-hero.png): the configured URL, else no image ---------- */
    qa('img[data-pam-asset="pamHeroImage"]').forEach(function (img) {
      var url = cfg.pamHeroImage;
      var valid = siteImageAvailable(url);
      img.hidden = !valid;
      if (valid) { if (img.getAttribute('src') !== url) img.src = url; }
      else img.removeAttribute('src');
    });

    /* ---------- key people: the portrait is the card's background (source: background-image on .pp-ph) ---------- */
    qa('[data-pam-person]').forEach(function (el) {
      var url = (cfg.peopleImages || {})[el.getAttribute('data-pam-person')];
      el.style.backgroundImage = siteImageAvailable(url) ? 'url("' + url.trim().replace(/["\\\n\r]/g, encodeURIComponent) + '")' : '';
    });

    /* ---------- review badges (source prop showFlags, default false) ----------
       As in the source (sc-if), a badge exists in the DOM only while shown: the shared card styles select
       .gv-role span:first-child / :last-child, so a hidden badge would still change the role text's style. Each
       badge's classes and text sit in data-pam-flag="classes|text" on its parent; it is appended last, as in the
       source. A copied live root drops the badges it carries and follows its own config. */
    var FLAG_CLASSES = ['pam-tc', 'pam-tc--inv'];
    qa('[data-pam-flag-on]').forEach(function (el) { el.remove(); });
    if (cfg.showFlags === true) qa('[data-pam-flag]').forEach(function (host) {
      var spec = host.getAttribute('data-pam-flag').split('|');
      var badge = document.createElement('span');
      badge.className = spec[0].split(' ').filter(function (c) { return FLAG_CLASSES.indexOf(c) >= 0; }).join(' ');
      badge.textContent = spec[1] || '';
      badge.setAttribute('data-pam-flag-on', '');
      host.appendChild(badge);
    });

    siteResolveLinks(cfg);
    var links = cfg.links || {};
    qa('a[data-pam-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-pam-link')];
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

    /* ---------- Role in the Financial Engine: the strip lights once it is 45 % visible (source componentDidMount) ----------
       A copied live root starts unlit again, as the source does on mount; without IntersectionObserver it is lit. */
    var engine = root.querySelector('[data-pam-engine]');
    var io = null;
    if (engine) {
      engine.classList.remove('pam-lit');
      if (typeof IntersectionObserver !== 'function') engine.classList.add('pam-lit');
      else {
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('pam-lit'); io.disconnect(); } });
        }, { threshold: 0.45 });
        io.observe(engine);
      }
    }

    /* ---------- Key people: drag the mobile carousel (source _drag) ----------
       Below 768 px the three cards are a scroll-snap row. A mouse or pen (not touch, which swipes natively) drags it once
       it overflows: the drag starts after 6 px, the release snaps smoothly to the nearest card (card width + the
       14 px gap), and the click that ends a drag does not follow the card link. */
    var drag = root.querySelector('[data-pam-drag]');
    if (drag) {
      drag.classList.remove('pam-is-drag');
      var down = false, moved = false, x0 = 0, s0 = 0;
      on(drag, 'pointerdown', function (e) {
        if (e.pointerType === 'touch' || drag.scrollWidth <= drag.clientWidth) return;
        down = true; moved = false; x0 = e.clientX; s0 = drag.scrollLeft;
      });
      on(drag, 'pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - x0;
        if (!moved && Math.abs(dx) > 6) { moved = true; drag.setPointerCapture(e.pointerId); drag.classList.add('pam-is-drag'); }
        if (moved) drag.scrollLeft = s0 - dx;
      });
      var up = function () {
        if (!down) return;
        down = false;
        drag.classList.remove('pam-is-drag');
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

    var map = pamMap(root.querySelector('[data-pam-map]'), on);

    /* ================= SITE HEADER + FOOTER (shared site chrome) ================= */
    var chrome = siteChrome(root, cfg, on, timers);

    /* ================= SHARED SCROLL MOTION (design/bwci-motion.js) =================
       bwci-motion skips the source hero (class "hero"), here #pam-top.pam-hero. */
    var motion = siteMotion(root, { heroId: 'pam-top', heroSel: '.pam-hero' }, on);

    /* ================= GoHighLevel re-render detection ================= */
    var instance;
    function guardConnected() { return root.isConnected; }

    instance = {
      root: root,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (chrome) chrome.destroy();
        if (map) map.destroy();
        if (motion) motion.destroy();
        if (io) io.disconnect();
        if (drag) drag.classList.remove('pam-is-drag');
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        delete root.dataset.pamInit;
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
    if (root) root.dataset.pamInit = 'true';
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
