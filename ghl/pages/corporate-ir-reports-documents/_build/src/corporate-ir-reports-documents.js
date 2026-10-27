/* Corporate / IR Reports & Documents: standalone native runtime. Shared generators run only at build time. */
(function () {
  'use strict';
  var ROOT_ID = 'bwci-corporate-ir-reports-documents';
  var CONFIG_ID = 'bwci-corporate-ir-reports-documents-config';
  var INSTANCE_KEY = '__bwciCorporateIRReportsDocuments';

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
    siteResolveImages(root,cfg);
    siteResolveLinks(cfg);
    var links = cfg.links || {};
    function available(url) {
      return typeof url === 'string' && url.trim() && url !== '#' && url.indexOf('REPLACE-WITH') < 0 &&
        /^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#(?!$))/.test(url);
    }
    qa('a[data-cid-link]').forEach(function (a) {
      var key = a.getAttribute('data-cid-link');
      var url = Object.prototype.hasOwnProperty.call(links, key) ? links[key] : a.getAttribute('href');
      var enabled = available(url);
      a.setAttribute('href', enabled ? url : '#');
      if (!enabled) {
        a.setAttribute('aria-disabled', 'true');
        a.setAttribute('title', 'Not yet available');
      }
    });
    qa('[data-cid-flag]').forEach(function (el) { el.hidden = cfg.showFlags === false; });
    function setupDocuments() {
      var table = root.querySelector('[data-cid-table]');
      var template = root.querySelector('[data-cid-row-template]');
      if (!table || !template) return;
      var fields = ['title', 'type', 'year', 'published', 'file'];
      function text(value) { return typeof value === 'string' || typeof value === 'number' ? String(value) : ''; }
      function field(row, name) { return row.querySelector('[data-cid-field="' + name + '"]'); }
      // Safe fallback comes from the delivered static rows. Keep their original array order even if
      // GHL cloned a filtered/sorted running widget. Template content is never a runtime record.
      var oldRows = qa('[data-cid-document]').sort(function (a, b) { return Number(a.dataset.cidOrder) - Number(b.dataset.cidOrder); });
      var fallback = oldRows.map(function (row) {
        var d = {};
        fields.forEach(function (name) { d[name] = field(row, name).textContent; });
        d.url = row.querySelector('[data-cid-document-link]').getAttribute('href');
        d.unconfirmed = true;
        return d;
      });
      var documents = Array.isArray(cfg.reportDocuments) ? cfg.reportDocuments : fallback;
      oldRows.forEach(function (row) { row.remove(); });
      var records = [];
      documents.forEach(function (value, index) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return;
        var row = template.content.firstElementChild.cloneNode(true);
        var d = { row: row };
        row.setAttribute('data-cid-order', String(index));
        fields.forEach(function (name) { d[name] = text(value[name]); field(row, name).textContent = d[name]; });
        var link = row.querySelector('[data-cid-document-link]');
        var url = text(value.url);
        var ready = available(url) && /^(?:https?:\/\/|\/(?!\/))/.test(url);
        link.setAttribute('href', ready ? url : '#');
        link.setAttribute('aria-label', d.title + ', ' + d.file);
        if (ready) { link.removeAttribute('aria-disabled'); link.removeAttribute('title'); }
        else { link.setAttribute('aria-disabled', 'true'); link.setAttribute('title', 'Not yet available'); }
        row.querySelector('[data-cid-flag]').hidden = cfg.showFlags === false || value.unconfirmed === false;
        table.appendChild(row);
        records.push(d);
      });
      var type = root.querySelector('[data-cid-filter-type]');
      var year = root.querySelector('[data-cid-filter-year]');
      var query = root.querySelector('[data-cid-filter-query]');
      var clear = root.querySelector('[data-cid-clear]');
      var sort = root.querySelector('[data-cid-sort]');
      var sortHeader = root.querySelector('[data-cid-sort-header]');
      var count = root.querySelector('[data-cid-count]');
      var pager = root.querySelector('[data-cid-pager]');
      var noResults = root.querySelector('[data-cid-no-results]');
      var launchEmpty = root.querySelector('[data-cid-launch-empty]');
      var launch = cfg.documents === 'Launch (none)';
      var state = { type: '', year: '', query: '', ascending: false };
      function options(select, name, all) {
        select.textContent = '';
        var seen = [''];
        function add(value, label) {
          var option = document.createElement('option');
          option.value = value; option.textContent = label; select.appendChild(option);
        }
        add('', all);
        records.forEach(function (record) {
          var value = record[name];
          if (seen.indexOf(value) !== -1) return;
          seen.push(value); add(value, value);
        });
      }
      options(type, 'type', 'All types');
      options(year, 'year', 'All years');
      type.value = ''; year.value = ''; query.value = '';
      function render() {
        var q = state.query.trim().toLowerCase();
        var ordered = state.ascending ? records.slice().reverse() : records;
        var n = 0;
        ordered.forEach(function (record) {
          var matches = (!state.type || record.type === state.type) && (!state.year || record.year === state.year) &&
            (!q || record.title.toLowerCase().indexOf(q) !== -1 || record.type.toLowerCase().indexOf(q) !== -1);
          record.row.hidden = !matches;
          if (matches) n++;
          table.appendChild(record.row);
        });
        var label = n ? 'Showing 1–' + n + ' of ' + n + ' documents' : 'Showing 0 documents';
        (count.querySelector('.cid-i') || count).textContent = label;
        count.hidden = launch;
        table.hidden = launch || n === 0;
        pager.hidden = launch || n === 0;
        noResults.hidden = launch || n > 0;
        launchEmpty.hidden = !launch;
        type.disabled = launch; year.disabled = launch; query.disabled = launch;
        clear.disabled = launch || (!state.type && !state.year && !state.query);
        sort.classList.toggle('cid-sort--asc', state.ascending);
        sort.setAttribute('aria-label', state.ascending ? 'Published, oldest first. Sort newest first' : 'Published, newest first. Sort oldest first');
        sortHeader.setAttribute('aria-sort', state.ascending ? 'ascending' : 'descending');
      }
      on(type, 'change', function () { state.type = type.value; render(); });
      on(year, 'change', function () { state.year = year.value; render(); });
      on(query, 'input', function () { state.query = query.value; render(); });
      on(clear, 'click', function () {
        state.type = ''; state.year = ''; state.query = '';
        type.value = ''; year.value = ''; query.value = '';
        render(); // source Clear resets the filters, retaining the chosen sort direction
      });
      on(sort, 'click', function () { state.ascending = !state.ascending; render(); });
      render();
    }
    setupDocuments();

    qa('.cid-status').forEach(function (el) { el.remove(); });
    var status = document.createElement('p');
    status.className = 'cid-status';
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

    var select = root.querySelector('[data-cid-select]');
    if (select) {
      Array.prototype.forEach.call(select.options, function (option) {
        if (option.value === 'corporateIRReportsDocuments') return;
        option.disabled = !available(links[option.value]);
        if (option.disabled) option.label = option.textContent + ' — not yet available';
        else option.removeAttribute('label');
      });
      select.value = 'corporateIRReportsDocuments';
      on(select, 'change', function () {
        var key = select.value, url = links[key];
        select.value = 'corporateIRReportsDocuments';
        if (key === 'corporateIRReportsDocuments') return;
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
      qa('.cid-sr').forEach(function (el) { el.classList.remove('cid-in'); });
      root.classList.add('cid-sr-on');
      reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('cid-in');
          reveal.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      qa('.cid-sr').forEach(function (el) { if (!el.hidden) reveal.observe(el); });
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
        root.classList.remove('cid-sr-on');
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
