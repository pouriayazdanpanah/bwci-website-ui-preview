  /* ======================= SHARED SITE CHROME =======================
     Generated from ghl/shared/site-chrome/site-chrome.runtime.js. It is the vanilla replacement for the
     React logic of design/SiteHeader.dc.html and design/SiteFooter.dc.html, plus a root-scoped port of
     design/bwci-motion.js. Everything works inside the page root; the only document-level effects are
     the ones the source has: the mousedown/keydown listeners that close the menus, and the body
     overflow lock while the mobile drawer is open (restored to the host's own value on close/teardown). */
  var CHROME = {
    desktopMin: 1280,   // SiteHeader: burger/drawer at max-width 1279px
    ddLeaveDelay: 160,  // dropdown closes 160 ms after the pointer leaves
    focusable: 'a[href], button:not([disabled])'
  };

  function siteLinkAvailable(url) {
    return typeof url === 'string' && url.trim() && url !== '#' && url.indexOf('REPLACE-WITH') < 0 &&
      !/\{\{|\}\}/.test(url) &&
      /^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#(?!$))/.test(url);
  }
  function siteLink(a, url) {
    var enabled = siteLinkAvailable(url);
    a.setAttribute('href', enabled ? url : '#');
    if (enabled) { a.removeAttribute('aria-disabled'); a.removeAttribute('title'); }
    else { a.setAttribute('aria-disabled', 'true'); a.setAttribute('title', 'Not yet available'); }
    return enabled;
  }

  function siteChrome(root, cfg, on, timers) {
    function cq(sel) { return root.querySelector(sel); }
    function cqa(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

    // A cloned live block must use the new settings, including formerly unavailable destinations.
    var links = cfg.links || {};
    cqa('a[data-__P__-link]').forEach(function (a) {
      var key = a.getAttribute('data-__P__-link');
      siteLink(a, Object.prototype.hasOwnProperty.call(links, key) ? links[key] : a.getAttribute('href'));
    });
    cqa('.__P__-link-status').forEach(function (el) { el.remove(); });
    var status = cq('.__P__-status');
    var ownsStatus = !status;
    if (!status) {
      status = document.createElement('p');
      status.className = '__P__-link-status';
      status.setAttribute('role', 'status');
      status.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;margin:0;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap';
      root.appendChild(status);
    }
    function removeStatus() { if (ownsStatus) status.remove(); }
    function linkFromEvent(e) {
      var a = e.target.closest && e.target.closest('a[data-__P__-link]');
      return a && root.contains(a) ? a : null;
    }
    // Rendered card links can appear after init. Inspect their actual href, preserving ?from context.
    on(root, 'focusin', function (e) { var a = linkFromEvent(e); if (a) siteLink(a, a.getAttribute('href')); });
    on(root, 'click', function (e) {
      var a = linkFromEvent(e);
      if (a && !siteLink(a, a.getAttribute('href'))) {
        e.preventDefault();
        status.textContent = 'This destination is not yet available.';
      }
    }, { capture: true });

    /* ---------- logo image, header/footer toggles, footer legal wording ---------- */
    var logoUrl = cfg.logoImage;
    // the untouched placeholder is skipped so it never produces a 404 request
    if (typeof logoUrl === 'string' && logoUrl && logoUrl.indexOf('REPLACE-WITH') === -1) {
      cqa('[data-__P__-asset="logoImage"]').forEach(function (img) { img.src = logoUrl; });
    }
    var hostEl = cq('[data-__P__-hdr-host]');
    if (cfg.showHeader === false && hostEl) hostEl.parentNode.removeChild(hostEl);
    var footEl = cq('[data-__P__-footer]');
    if (cfg.showFooter === false && footEl) footEl.parentNode.removeChild(footEl);
    var ft = cfg.footer || {};
    var line = cq('[data-__P__-legal-line]');
    if (line) {
      // source: REGISTERED { jurisdiction, companyNo, office } — empty values are not shown
      var parts = ['Better World Capital Investments PLC'];
      if (ft.registeredJurisdiction) parts.push('Registered in ' + ft.registeredJurisdiction);
      if (ft.companyNumber) parts.push('Company no. ' + ft.companyNumber);
      if (ft.registeredOffice) parts.push('Registered office: ' + ft.registeredOffice);
      line.textContent = parts.join(' · ');
    }
    var legal = cq('[data-__P__-legal]');
    cqa('.__P__-sft__reg').forEach(function (el) { el.remove(); });
    if (legal && typeof ft.regulatoryLine === 'string' && ft.regulatoryLine) {
      // source: REGULATORY_LINE, rendered above the legal bar only when it is filled in
      var reg = document.createElement('p');
      reg.className = '__P__-sft__reg';
      var regText = document.createElement('span');
      regText.className = '__P__-i';
      regText.textContent = ft.regulatoryLine;
      reg.appendChild(regText);
      legal.insertBefore(reg, legal.firstChild);
    }

    /* ---------- header ---------- */
    var hdr = cq('[data-__P__-hdr]');
    if (!hdr) { root.style.setProperty('--util-h', '0px'); root.style.setProperty('--nav-h', '0px'); return { destroy: removeStatus }; }
    function hq(sel) { return hdr.querySelector(sel); }
    function hqa(sel) { return Array.prototype.slice.call(hdr.querySelectorAll(sel)); }
    var util = hq('[data-__P__-hdr-util]');
    var burger = hq('[data-__P__-menu-open]');
    var closeBtn = hq('[data-__P__-menu-x]');
    var drawer = hq('[data-__P__-drawer]');
    var menuParts = hqa('[data-__P__-menu-part]');
    var groups = {};
    hqa('[data-__P__-dd]').forEach(function (li) {
      groups[li.getAttribute('data-__P__-dd')] = { li: li, btn: li.querySelector('[data-__P__-dd-btn]'), panel: li.querySelector('[data-__P__-dd-panel]') };
    });
    var utilH = 0, stuck = false, dd = null, hov = false, menuOpen = false, prevOverflow = '';
    // start from the closed state even if the markup was copied from a running instance (GHL re-render)
    hdr.classList.remove('__P__-hdr--stuck');
    Object.keys(groups).forEach(function (k) { groups[k].btn.setAttribute('aria-expanded', 'false'); groups[k].panel.hidden = true; });
    burger.setAttribute('aria-expanded', 'false');
    menuParts.forEach(function (el) { el.hidden = true; });

    function hoverable() { return !!(window.matchMedia && window.matchMedia('(hover:hover)').matches); }
    // one dropdown open at a time; re-opening the open one changes nothing (its entrance does not replay)
    function setDd(k) {
      if (k === dd) return;
      if (dd && groups[dd]) { groups[dd].btn.setAttribute('aria-expanded', 'false'); groups[dd].panel.hidden = true; }
      dd = k;
      if (k && groups[k]) { groups[k].btn.setAttribute('aria-expanded', 'true'); groups[k].panel.hidden = false; }
    }
    function focusIn(k, which) {
      var links = groups[k] ? Array.prototype.slice.call(groups[k].panel.querySelectorAll('a')) : [];
      if (!links.length) return;
      var i = links.indexOf(document.activeElement);
      var n = which === 'first' ? 0 : which === 'last' ? links.length - 1 : which === 'next' ? (i + 1) % links.length : (i - 1 + links.length) % links.length;
      links[n].focus();
    }
    function lockScroll(open) {
      if (open) { prevOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
      else document.body.style.overflow = prevOverflow;
    }
    function setMenu(open) {
      if (open !== menuOpen) lockScroll(open);
      menuOpen = open;
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuParts.forEach(function (el) { el.hidden = !open; });
      var el = open ? closeBtn : burger;
      if (el) el.focus();
    }
    function onScroll() {
      // source: stuck once window.scrollY > utility-bar height + 2 (header at the page top). Measured from
      // the widget's own top so it stays right when GHL content sits above the block.
      var s = -root.getBoundingClientRect().top > utilH + 2;
      if (s !== stuck) { stuck = s; hdr.classList.toggle('__P__-hdr--stuck', s); }
    }
    function measure() {
      utilH = util ? util.offsetHeight : 0;
      // source sets these on <html>; here they stay on the widget root
      root.style.setProperty('--util-h', utilH + 'px');
      root.style.setProperty('--nav-h', hdr.offsetHeight + 'px');
      if (window.innerWidth >= CHROME.desktopMin && menuOpen) setMenu(false);
      onScroll();
    }

    Object.keys(groups).forEach(function (k) {
      var g = groups[k];
      on(g.li, 'mouseenter', function () {
        clearTimeout(timers.chromeDd);
        if (hoverable() && dd !== k) { hov = true; setDd(k); }
      });
      on(g.li, 'mouseleave', function () {
        clearTimeout(timers.chromeDd);
        if (dd === k) timers.chromeDd = setTimeout(function () { setDd(null); }, CHROME.ddLeaveDelay);
      });
      on(g.li, 'focusout', function (e) { if (!g.li.contains(e.relatedTarget) && dd === k) setDd(null); });
      on(g.btn, 'click', function () {
        // a click right after a hover-open keeps the panel open (source: _hov flag)
        var keep = hov && dd === k;
        hov = false;
        if (!keep) setDd(dd === k ? null : k);
      });
      on(g.btn, 'keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          setDd(k);
          focusIn(k, e.key === 'ArrowDown' ? 'first' : 'last');
        }
      });
      on(g.panel, 'keydown', function (e) {
        var m = { ArrowDown: 'next', ArrowUp: 'prev', Home: 'first', End: 'last' }[e.key];
        if (m) { e.preventDefault(); focusIn(k, m); }
      });
      Array.prototype.forEach.call(g.panel.querySelectorAll('a'), function (a) { on(a, 'click', function () { setDd(null); }); });
    });
    on(document, 'mousedown', function (e) {
      if (!dd) return;
      var g = groups[dd];
      if (g && !g.li.contains(e.target)) setDd(null);
    });
    on(document, 'keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (dd) { var b = groups[dd] && groups[dd].btn; setDd(null); if (b) b.focus(); }
      if (menuOpen) setMenu(false);
    });
    on(burger, 'click', function () { setMenu(true); });
    hqa('[data-__P__-menu-close]').forEach(function (el) { on(el, 'click', function () { setMenu(false); }); });
    if (drawer) {
      on(drawer, 'keydown', function (e) {
        if (e.key !== 'Tab') return;
        var f = Array.prototype.slice.call(drawer.querySelectorAll(CHROME.focusable));
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }
    // drawer accordions (the open state survives closing and reopening the drawer, as in the source)
    hqa('[data-__P__-acc]').forEach(function (btn) {
      var panel = hq('[data-__P__-acc-panel="' + btn.getAttribute('data-__P__-acc') + '"]');
      on(btn, 'click', function () {
        var open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (panel) panel.hidden = !open;
      });
    });
    on(window, 'scroll', onScroll, { passive: true });
    on(window, 'resize', measure);
    measure();
    timers.chromeRaf = requestAnimationFrame(measure);

    return {
      destroy: function () {
        removeStatus();
        clearTimeout(timers.chromeDd);
        cancelAnimationFrame(timers.chromeRaf);
        if (menuOpen) { lockScroll(false); menuOpen = false; }
      }
    };
  }

  /* Root-scoped port of design/bwci-motion.js. About 0.3, 1.2 and 2.6 s after the window load it tags
     section blocks (or the children of a card group) that start below the fold as data-bw-rv="wait"
     (opacity 0, 14px down). Each one fades up once it is 8% visible, with a 70 ms stagger capped at 5.
     Content already on screen is never hidden. As in the source, reduced motion keeps the fade (0.3 s)
     but drops the movement. */
  function siteMotion(root, opts, on) {
    if (!('IntersectionObserver' in window)) return null;
    var MOTION = '__P__-motion';
    var SKIP = '.rv, .rv-in, [aria-hidden="true"], script, style, template, svg';
    var tagged = [], waits = [], scanned = [], starts = [];
    // drop tags left on markup copied from a running instance, so nothing stays hidden
    Array.prototype.forEach.call(root.querySelectorAll('[data-bw-rv]'), function (el) { el.removeAttribute('data-bw-rv'); el.style.removeProperty('--bw-d'); });
    root.classList.add(MOTION);
    function closestIn(el, sel) { var c = el.closest(sel); return c && root.contains(c) ? c : null; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, d = parseFloat(el.style.getPropertyValue('--bw-d')) || 0;
        io.unobserve(el);
        el.setAttribute('data-bw-rv', 'in');
        waits.push(setTimeout(function () { el.removeAttribute('data-bw-rv'); el.style.removeProperty('--bw-d'); }, 900 + d * 70));
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    function ok(el) {
      if (!(el instanceof HTMLElement) || el.matches(SKIP)) return false;
      if (closestIn(el, '.rv, [data-bw-rv]') || el.querySelector('.rv, [data-bw-rv]')) return false;
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
      tagged.push(el);
      io.observe(el);
    }
    function kids(el) {
      return Array.prototype.filter.call(el.children, function (c) { return c.offsetHeight > 0 && !c.matches('[aria-hidden="true"]'); });
    }
    function group(el) {
      var k = kids(el).filter(function (c) { return c.offsetHeight > 40; });
      if (k.length < 2 || k.length > 8 || !/grid|flex/.test(getComputedStyle(el).display)) return null;
      return k;
    }
    function scan(sec) {
      if (scanned.indexOf(sec) >= 0 || !sec.offsetHeight) return;
      var box = Array.prototype.find.call(sec.children, function (c) {
        return c.children.length && !c.matches('[aria-hidden="true"]') && !/absolute|fixed/.test(getComputedStyle(c).position);
      });
      if (!box) return;
      scanned.push(sec);
      var items = kids(box);
      if (items.length === 1 && items[0].children.length > 1) items = kids(items[0]);
      items.forEach(function (it, n) {
        var g = group(it);
        if (g && !it.querySelector('.rv')) g.forEach(function (c, j) { tag(c, j); });
        else tag(it, n);
      });
    }
    function run() {
      Array.prototype.forEach.call(root.querySelectorAll('section'), function (s) {
        var outer = s.parentElement && s.parentElement.closest('section');
        if (s.id === opts.heroId || s.matches(opts.heroSel) || (outer && root.contains(outer))) return;
        scan(s);
      });
    }
    function start() { [300, 1200, 2600].forEach(function (t) { starts.push(setTimeout(run, t)); }); }
    if (document.readyState === 'complete') start(); else on(window, 'load', start);
    return {
      destroy: function () {
        io.disconnect();
        starts.concat(waits).forEach(clearTimeout);
        // leave nothing hidden behind for a re-initialisation of the same markup
        tagged.forEach(function (el) { el.removeAttribute('data-bw-rv'); el.style.removeProperty('--bw-d'); });
        root.classList.remove(MOTION);
      }
    };
  }
