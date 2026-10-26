/* Corporate / IR Overview: standalone native runtime. Shared generators run only at build time. */
(function () {
  'use strict';
  var ROOT_ID = 'bwci-corporate-ir';
  var CONFIG_ID = 'bwci-corporate-ir-config';
  var INSTANCE_KEY = '__bwciCorporateIR';

/*@site-chrome*/

  function init(root) {
    var cleanups = [], timers = {};
    function on(target, type, fn, options) {
      target.addEventListener(type, fn, options);
      cleanups.push(function () { target.removeEventListener(type, fn, options); });
    }
    function qa(selector) { return Array.prototype.slice.call(root.querySelectorAll(selector)); }
    var cfg = {};
    try { cfg = JSON.parse((document.getElementById(CONFIG_ID) || {}).textContent || '{}') || {}; }
    catch (err) { /* Malformed settings retain the safe defaults in the markup. */ }
    var links = cfg.links || {};
    function available(url) {
      return typeof url === 'string' && url.trim() && url !== '#' && url.indexOf('REPLACE-WITH') < 0 &&
        /^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#(?!$))/.test(url);
    }
    qa('a[data-cir-link]').forEach(function (a) {
      var key = a.getAttribute('data-cir-link');
      var url = Object.prototype.hasOwnProperty.call(links, key) ? links[key] : a.getAttribute('href');
      var enabled = available(url);
      a.setAttribute('href', enabled ? url : '#');
      if (!enabled) {
        a.setAttribute('aria-disabled', 'true');
        a.setAttribute('title', 'Not yet available');
      }
    });
    qa('[data-cir-flag]').forEach(function (el) { el.hidden = cfg.showFlags === false; });
    var launch = cfg.documents === 'Launch (none)';
    qa('[data-cir-documents]').forEach(function (el) { el.hidden = launch; });
    qa('[data-cir-no-documents]').forEach(function (el) { el.hidden = !launch; });

    qa('.cir-status').forEach(function (el) { el.remove(); });
    var status = document.createElement('p');
    status.className = 'cir-status';
    status.setAttribute('role', 'status');
    root.appendChild(status);
    function unavailable() { status.textContent = 'This destination is not yet available.'; }
    on(root, 'click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a || !root.contains(a)) return;
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); unavailable(); return; }
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var target = document.getElementById(href.slice(1));
      if (!target || !root.contains(target)) return;
      e.preventDefault();
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      if (document.activeElement && root.contains(document.activeElement)) document.activeElement.blur();
      try { history.pushState(null, '', href); } catch (err) { /* GHL sandbox. */ }
    });

    var select = root.querySelector('[data-cir-select]');
    if (select) {
      Array.prototype.forEach.call(select.options, function (option) {
        if (option.value === 'corporateIR') return;
        option.disabled = !available(links[option.value]);
        if (option.disabled) option.label = option.textContent + ' — not yet available';
      });
      select.value = 'corporateIR';
      on(select, 'change', function () {
        var key = select.value, url = links[key];
        select.value = 'corporateIR';
        if (key === 'corporateIR') return;
        if (available(url)) window.location.assign(url);
        else unavailable();
      });
    }

    var chrome = siteChrome(root, cfg, on, timers);
    // Shared chrome measures the header. With a host-provided header the section bar starts at zero.
    if (cfg.showHeader === false) {
      root.style.setProperty('--nav-h', '0px');
      root.style.setProperty('--util-h', '0px');
    }
    var motion = siteMotion(root, { heroId: null, heroSel: ':not(*)' }, on);
    var reveal = null;
    if ('IntersectionObserver' in window) {
      qa('.cir-sr').forEach(function (el) { el.classList.remove('cir-in'); });
      root.classList.add('cir-sr-on');
      reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('cir-in');
          reveal.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      qa('.cir-sr').forEach(function (el) { if (!el.hidden) reveal.observe(el); });
    }
    var destroyed = false;
    return {
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        if (reveal) reveal.disconnect();
        if (motion) motion.destroy();
        if (chrome) chrome.destroy();
        cleanups.forEach(function (fn) { fn(); });
        root.classList.remove('cir-sr-on');
        status.remove();
      }
    };
  }

  // One owner per block: repeated execution reuses it; replacements tear down immediately, including
  // when GHL removes an ancestor without a scroll/resize event. No polling or continuous frames.
  var previous = window[INSTANCE_KEY];
  if (previous && !previous.destroyed) { previous.boot(); return; }
  var app = { root: null, instance: null, observer: null, frame: null, destroyed: false };
  function boot() {
    if (app.destroyed) return;
    var root = document.getElementById(ROOT_ID);
    if (root === app.root && app.instance) return;
    if (app.instance) app.instance.destroy();
    app.root = root;
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
  window.addEventListener('pagehide', pagehide);
})();
