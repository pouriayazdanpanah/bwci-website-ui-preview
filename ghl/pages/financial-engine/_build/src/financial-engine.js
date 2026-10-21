/* BWCI — The Financial Engine · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js + React) used by the Financial Engine design page and its
   SiteHeader / SiteFooter / Breadcrumb components and bwci-motion.js. Everything is scoped to #bwci-financial-engine. */
(function () {
  'use strict';

  /* Editable settings (hero and logo image URLs, page links, header/footer toggles, footer legal wording) live in the
     <script type="application/json" id="bwci-financial-engine-config"> block at the very
     top of the Custom Code paste, not here. */

  /* ======================= BEHAVIOUR (source values) ======================= */
  var OPTIONS = {
    engRevealMin: 1024,   // >= this width, picking a step scrolls the detail card fully into view
    engRevealGap: 16,     // px kept below the detail card
    engRevealTop: 80      // the card's top never scrolls above this line
  };

  var ROOT_ID = 'bwci-financial-engine';
  var CONFIG_ID = 'bwci-financial-engine-config';
  var INSTANCE_KEY = '__bwciFinancialEngine';

  var PR_CONTENT = [
    { label: '01 · The starting point', title: 'Begin with the real constraint.', body: 'A business, place, or sector has a need that existing financial products do not serve well. That need — not whatever product happens to be available — sets the direction.', proof: 'Starting from the need avoids forcing a deal into the wrong financial structure.' },
    { label: '02 · The response', title: 'Make the route fit the need.', body: 'he structure is designed around the business’s commercial reality: its risks, its timeline, its governance needs, and a practical route to delivery.', proof: 'The aim is a structure that fits, not an existing product with a new label' },
    { label: '03 · The delivery perimeter', title: 'Connect the capability that can act.', body: 'BWCI chooses the best delivery route: through a group company, a platform under construction, an independent partner, or financial infrastructure that enables delivery.', proof: 'The route is chosen because it fits the structure, the regulations, and the work involved' },
    { label: '04 · The enabling resource', title: 'Mobilise capital with purpose.', body: 'Capital is matched to the structure, with terms, governance, and risk sharing designed around the activity the capital is meant to fund. ', proof: 'Capital is the means, not the starting point' },
    { label: '05 · The outcome', title: 'Turn the connection into activity.', body: 'Success is measured by tangible outcomes: a viable business, infrastructure that gets built, or a solution that works in practice. ', proof: 'What we learn from each outcome shapes how we design the next structure.' }
  ];

  /* VIEW:start — the Financial Engine loop (source text/x-dc STEPS / SH). _build/build.js also runs this
     part to write the default (step 01) markup into the page, so the static HTML and the script agree. */
  var ENG_STEPS = [
    ['Economic Need', 'A real business or project need is identified and understood: its cash flows, contracts and constraints.', 'A regional food manufacturer wins a large export order. It needs working capital to buy inputs now, but the buyer pays in 120 days.'],
    ['Financial Architecture', 'A structure is designed around the need, with terms, timing and repayment matched to how the activity earns.', 'The facility is sized to the order and repaid from the buyer’s payment, rather than through a standard term loan.'],
    ['Appropriate Institution / Delivery Capability', 'The structure is matched to the platform, group company or authorised partner able to deliver it.', 'Delivery sits with the entity that holds the relevant capability and, where needed, the regulatory permission.'],
    ['Capital', 'Capital whose mandate fits the structure, risk and tenor is connected through the appropriate authorised vehicle.', 'Capital providers looking for short-tenor, trade-linked exposure are matched to the facility.'],
    ['Productive Economic Activity', 'Capital reaches the underlying activity and is put to productive use.', 'The manufacturer buys its inputs, fulfils the order and keeps its workforce and suppliers busy.'],
    ['Performance / Learning / Reinvestment', 'Performance is tracked, returns flow back, and what was learned informs the next structure.', 'The buyer pays, the facility is repaid, and the engagement informs how the next order is structured.']
  ];
  var ENG_SH = [['Need', 'Economic Need'], ['Architecture', 'Financial Architecture'], ['Institution', 'Appropriate Institution / Delivery Capability'], ['Capital', ''], ['Activity', 'Productive Economic Activity'], ['Reinvestment', 'Performance / Learning / Reinvestment']];
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'; });
  }
  // the source runtime wraps every interpolated value in span.sc-interp (reproduced as .fe-i)
  function ip(s) { return '<span class="fe-i">' + esc(s) + '</span>'; }
  var VIEW = {
    progress: function (cur) { return String(cur / (ENG_STEPS.length - 1)); },
    nodeCls: function (i, cur) { return 'lp-n' + (i === cur ? ' is-on' : i < cur ? ' is-past' : ''); },
    nodes: function (cur) {
      return ENG_STEPS.map(function (st, i) {
        var n = (i < 9 ? '0' : '') + (i + 1), on = i === cur;
        var ex = '<div class="lpd-ex"><span class="fe-badge fe-b-dev"><i></i>Illustrative example</span><span>' + ip(st[2]) + '</span></div>';
        return '\n            \n              <div class="lp-item' + (on ? ' is-on' : '') + '">\n' +
          '              <button class="' + VIEW.nodeCls(i, cur) + '" type="button" role="tab" aria-selected="' + on + '" aria-expanded="' + on + '" aria-label="' + esc(st[0]) + '" data-fe-eng-step="' + i + '">\n' +
          '                <span class="lp-in"><span class="lp-num">' + ip(n) + '</span><span class="lp-dot"></span><span class="lp-t"><span class="lp-tn">' + ip(n) + '</span>' + ip(ENG_SH[i][0]) + '</span><span class="lp-s">' + ip(ENG_SH[i][1]) + '</span><span class="lp-pm" aria-hidden="true"></span></span>\n' +
          '              </button>\n' +
          '              <div class="lp-acc"><div><p class="lpd-d">' + ip(st[1]) + '</p>' + ex + '</div></div>\n' +
          '              </div>\n            ';
      }).join('') + '\n          ';
    },
    panes: function (cur) {
      return ENG_STEPS.map(function (st, i) {
        var n = (i < 9 ? '0' : '') + (i + 1), on = i === cur;
        return '\n            \n              <div class="lpd-pane' + (on ? ' is-on' : '') + '" role="tabpanel" aria-hidden="' + !on + '">\n' +
          '                <div><span class="lpd-k">Step ' + ip(n) + ' of 06</span><div class="lpd-h">' + ip(ENG_SH[i][0]) + '</div></div>\n' +
          '                <div><span class="lpd-full">' + ip(st[0]) + '</span><p class="lpd-d">' + ip(st[1]) + '</p><div class="lpd-ex"><span class="fe-badge fe-b-dev"><i></i>Illustrative example</span><span>' + ip(st[2]) + '</span></div></div>\n' +
          '              </div>\n            ';
      }).join('') + '\n          ';
    }
  };
  /* VIEW:end */

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function scrollBehavior() { return prefersReducedMotion() ? 'auto' : 'smooth'; }

/*@site-chrome*/

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

    /* ---------- config: image, links, header/footer toggles ---------- */
    var cfg = {};
    try {
      var cfgEl = document.getElementById(CONFIG_ID);
      if (cfgEl) cfg = JSON.parse(cfgEl.textContent || '{}') || {};
    } catch (err) { cfg = {}; }
    var links = cfg.links || {};

    qa('[data-fe-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-fe-link')];
      if (typeof v === 'string' && v) a.setAttribute('href', v);
    });

    var heroImg = q('[data-fe-asset="financialEngineImage"]');
    var heroUrl = cfg.financialEngineImage;
    // the untouched placeholder is skipped so it never produces a 404 request
    if (heroImg && typeof heroUrl === 'string' && heroUrl && heroUrl.indexOf('REPLACE-WITH') === -1) heroImg.src = heroUrl;


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

    /* ================= SHARED SCROLL MOTION (design/bwci-motion.js) ================= */
    var motion = siteMotion(root, { heroId: 'fe-hero', heroSel: '.hero-fe' }, on);

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

    /* ================= 02 · THE FINANCIAL ENGINE (six-step loop) =================
       Source: one active step (state opsStage). Nodes and the phone accordion share the step; previous /
       next wrap around. Elements update in place (no re-mount), so the CSS transitions run as in React. */
    var eng = q('[data-fe-eng]');
    if (eng) {
      (function () {
        var cur = 0;
        var lp = q('[data-fe-eng-lp]');
        var items = qa('.lp-item');
        var nodes = qa('[data-fe-eng-step]');
        var panes = qa('.lpd-pane');
        var lpd = q('#fe-ops-model .lpd');
        function go(i) {
          var next = (i + ENG_STEPS.length) % ENG_STEPS.length;
          if (next === cur) return;
          cur = next;
          lp.style.setProperty('--p', VIEW.progress(cur));
          nodes.forEach(function (b, j) {
            b.className = VIEW.nodeCls(j, cur);
            b.setAttribute('aria-selected', String(j === cur));
            b.setAttribute('aria-expanded', String(j === cur));
          });
          items.forEach(function (el, j) { el.className = 'lp-item' + (j === cur ? ' is-on' : ''); });
          panes.forEach(function (el, j) {
            el.className = 'lpd-pane' + (j === cur ? ' is-on' : '');
            el.setAttribute('aria-hidden', String(j !== cur));
          });
        }
        // source lpdReveal: on desktop, bring the whole detail card on screen after picking a step
        function reveal() {
          if (window.innerWidth < OPTIONS.engRevealMin) return;
          cancelAnimationFrame(timers.engRaf);
          timers.engRaf = requestAnimationFrame(function () {
            if (!lpd) return;
            var r = lpd.getBoundingClientRect();
            var over = r.bottom - (window.innerHeight - OPTIONS.engRevealGap);
            if (over > 0) window.scrollBy({ top: Math.min(over, r.top - OPTIONS.engRevealTop), behavior: scrollBehavior() });
          });
        }
        nodes.forEach(function (b, i) { on(b, 'click', function () { go(i); reveal(); }); });
        on(q('[data-fe-eng-prev]'), 'click', function () { go(cur - 1); });
        on(q('[data-fe-eng-next]'), 'click', function () { go(cur + 1); });
      })();
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
        cancelAnimationFrame(timers.engRaf);
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
