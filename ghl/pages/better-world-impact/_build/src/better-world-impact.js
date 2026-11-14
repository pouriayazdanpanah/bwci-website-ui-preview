/* Better World & Impact: standalone native runtime; shared generators run only at build time. */
(function () {
  'use strict';
  var ROOT_ID = 'bwci-better-world-impact';
  var CONFIG_ID = 'bwci-better-world-impact-config';
  var INSTANCE_KEY = '__bwciBetterWorldImpact';

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
    catch (err) { /* Fresh markup retains the safe launch defaults. */ }
    siteResolveImages(root,cfg);
    function available(url) {
      return typeof url === 'string' && url.trim() && url !== '#' && url.indexOf('REPLACE-WITH') < 0 &&
        /^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#(?!$))/.test(url);
    }
    function imageAvailable(url) {
      return typeof url === 'string' && url.indexOf('REPLACE-WITH') < 0 &&
        /^(?:https?:\/\/|\/(?!\/)|data:image\/(?:png|jpeg|webp|gif|avif);base64,)/i.test(url);
    }
    function link(a,url) {
      var enabled = available(url);
      a.setAttribute('href', enabled ? url : '#');
      if (enabled) { a.removeAttribute('aria-disabled'); a.removeAttribute('title'); }
      else { a.setAttribute('aria-disabled','true'); a.setAttribute('title','Not yet available'); }
    }
    qa('[data-bwi-asset="impactHeroImage"]').forEach(function (img) {
      var valid = imageAvailable(cfg.impactHeroImage);
      img.hidden = !valid;
      if (valid) img.src = cfg.impactHeroImage;
      else img.removeAttribute('src');
    });
    /* Design props as config: "reviewFlags" (design default true) shows the review badges; "approachCopy" picks the
       design's "current site copy" (the markup) or its "placeholders"; "engineSupportingCopy", when set, replaces the
       design's bracketed Financial Engine placeholder with final copy. */
    var flags = cfg.reviewFlags === true;
    var placeholders = cfg.approachCopy === 'placeholders';
    var engineCopy = typeof cfg.engineSupportingCopy === 'string' ? cfg.engineSupportingCopy.trim() : '';
    qa('[data-bwi-moment]').forEach(function (p) {
      if (!p.hasAttribute('data-bwi-current')) p.setAttribute('data-bwi-current', p.textContent);
      var w = p.getAttribute('data-bwi-moment');
      p.textContent = placeholders ? '[Explanation to come: what we do when capital is ' + w + '. Final copy may run to two or three sentences.]' : p.getAttribute('data-bwi-current');
      p.classList.toggle('bwi-is-ph', placeholders);
    });
    qa('[data-bwi-flag]').forEach(function (el) {
      var kind = el.getAttribute('data-bwi-flag');
      el.hidden = !flags || (kind === 'approach' && !placeholders) || (kind === 'engine' && !!engineCopy);
    });
    qa('[data-bwi-engine-copy]').forEach(function (p) { p.textContent = engineCopy; p.hidden = !engineCopy; });
    qa('[data-bwi-engine-ph]').forEach(function (el) { el.hidden = !!engineCopy; });
    function complete(row, fields) {
      return row && typeof row === 'object' && fields.every(function (k) {
        return (typeof row[k] === 'string' && row[k].trim()) || (k === 'value' && typeof row[k] === 'number' && isFinite(row[k]));
      });
    }
    function populate(name, fields, templateName) {
      var section = root.querySelector('[data-bwi-'+name+']');
      var list = root.querySelector('[data-bwi-'+name+'-list]');
      var tpl = root.querySelector('[data-bwi-'+templateName+'-template]');
      if (!section || !list || !tpl) return;
      Array.prototype.slice.call(list.children).forEach(function (el) { if (el !== tpl) el.remove(); });
      var rows = Array.isArray(cfg[name]) ? cfg[name].filter(function (row) {
        return complete(row,fields) && (name !== 'cases' || imageAvailable(row.img));
      }) : [];
      rows.forEach(function (row) {
        var card = tpl.content.firstElementChild.cloneNode(true);
        Array.prototype.forEach.call(card.querySelectorAll('[data-bwi-field]'), function (el) {
          el.textContent = row[el.getAttribute('data-bwi-field')];
        });
        if (name === 'cases') {
          link(card,row.href);
          var image = card.querySelector('[data-bwi-case-image]');
          image.setAttribute('aria-label',row.alt);
          image.style.background = 'center / cover no-repeat url('+JSON.stringify(row.img)+')';
        }
        list.appendChild(card);
      });
      section.hidden = rows.length === 0;
    }
    populate('evidence',['value','label','date','source'],'evidence');
    populate('cases',['label','title','summary','href','img','alt'],'case');
    /* Source componentDidMount: [data-draw] elements starting below 90% of the viewport are armed (lines, arcs and
       rails hidden) and drawn in once they enter view. Skipped without IntersectionObserver or under reduced motion,
       so the figures are always complete without the script. */
    var draws = qa('[data-bwi-draw]');
    draws.forEach(function (el) { el.classList.remove('bwi-is-armed', 'bwi-is-in'); });
    var drawIo = null;
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      drawIo = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (!e.isIntersecting) return; drawIo.unobserve(e.target); e.target.classList.add('bwi-is-in'); });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
      draws.filter(function (el) { return el.getBoundingClientRect().top > window.innerHeight * 0.9; })
        .forEach(function (el) { el.classList.add('bwi-is-armed'); drawIo.observe(el); });
      cleanups.push(function () { drawIo.disconnect(); draws.forEach(function (el) { el.classList.remove('bwi-is-armed'); }); });
    }

    siteResolveLinks(cfg);
    var links = cfg.links || {};
    qa('a[data-bwi-link]').forEach(function (a) {
      var key = a.getAttribute('data-bwi-link');
      link(a,Object.prototype.hasOwnProperty.call(links,key) ? links[key] : a.getAttribute('href'));
    });
    qa('.bwi-status').forEach(function (el) { el.remove(); });
    var status = document.createElement('p');status.className = 'bwi-status';status.setAttribute('role','status');root.appendChild(status);
    on(root,'click',function (e) {
      var a = e.target.closest && e.target.closest('a');if (!a || !root.contains(a)) return;
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault();status.textContent='This destination is not yet available.';return; }
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var href = a.getAttribute('href');if (!href || href.charAt(0) !== '#') return;
      var target = document.getElementById(href.slice(1));if (!target || !root.contains(target)) return;
      e.preventDefault();target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
      if (document.activeElement && root.contains(document.activeElement)) document.activeElement.blur();
      try { history.pushState(null,'',href); } catch (err) { /* Host sandbox. */ }
    });
    qa('.bwi-sft__reg').forEach(function (el) { el.remove(); });
    var chrome = siteChrome(root,cfg,on,timers);
    var motion = siteMotion(root,{heroId:'bwi-top',heroSel:'.bwi-hero'},on);
    var destroyed = false;
    return { destroy:function () {
      if (destroyed) return;destroyed=true;
      if (motion) motion.destroy();if (chrome) chrome.destroy();
      cleanups.forEach(function (fn) { fn(); });status.remove();
    }};
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
