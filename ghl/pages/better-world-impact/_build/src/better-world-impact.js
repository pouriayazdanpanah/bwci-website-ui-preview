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
    qa('[data-bwi-methodology]').forEach(function (el) { el.hidden = cfg.showMethodology === false; });
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
    /* Six-stage interaction required by the original brief. Content/styles come from the source's
       retained STEPS/detail definitions; its static figure is intentionally replaced. */
    var engine = root.querySelector('[data-bwi-engine-loop]');
    var nodes = qa('[data-bwi-engine-step]');
    var engineMedia = window.matchMedia('(max-width:1023px)');
    var currentStep = 0;
    function renderEngine() {
      var narrow = engineMedia.matches;
      engine.style.setProperty('--p', currentStep / (nodes.length - 1));
      var name = nodes[currentStep].querySelector('.bwi-lp-t').lastChild.textContent;
      var description = 'Step '+(currentStep+1)+' of '+nodes.length+': '+name;
      var progress = root.querySelector('[data-bwi-engine-progress]');
      progress.setAttribute('aria-valuenow', String(currentStep+1));
      progress.setAttribute('aria-valuetext', description);
      root.querySelector('[data-bwi-engine-count]').textContent = description;
      nodes.forEach(function (button, i) {
        var active = i === currentStep;
        button.classList.toggle('bwi-is-on', active);
        button.classList.toggle('bwi-is-past', i < currentStep);
        button.parentElement.classList.toggle('bwi-is-on', active);
        button.setAttribute('aria-expanded', String(active));
        button.setAttribute('aria-controls', 'bwi-engine-'+(narrow ? 'mobile-' : 'panel-')+(i+1));
        ['panel','mobile'].forEach(function (kind) {
          var panel = root.querySelector('#bwi-engine-'+kind+'-'+(i+1));
          var exposed = active && (kind === 'mobile' ? narrow : !narrow);
          panel.classList.toggle('bwi-is-on', active);
          panel.setAttribute('aria-hidden', String(!exposed));
          panel.inert = !exposed;
        });
      });
    }
    function pickStep(index, reveal) {
      currentStep = (index + nodes.length) % nodes.length;
      renderEngine();
      if (!reveal || engineMedia.matches) return;
      // Source lpdReveal: selecting a desktop node brings the detail card into view if needed.
      cancelAnimationFrame(timers.engineRaf);
      timers.engineRaf = requestAnimationFrame(function () {
        if (!root.isConnected) return;
        var rect = root.querySelector('[data-bwi-engine-details]').getBoundingClientRect();
        var over = rect.bottom - (window.innerHeight - 16);
        if (over > 0) window.scrollBy({top:Math.min(over,rect.top-80),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
      });
    }
    nodes.forEach(function (button, i) {
      on(button,'click',function () { pickStep(i,true); });
      on(button,'keydown',function (event) {
        var next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = i+1;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = i-1;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = nodes.length-1;
        else return;
        event.preventDefault();pickStep(next,true);nodes[currentStep].focus({preventScroll:true});
      });
    });
    on(root.querySelector('[data-bwi-engine-prev]'),'click',function () { pickStep(currentStep-1,false); });
    on(root.querySelector('[data-bwi-engine-next]'),'click',function () { pickStep(currentStep+1,false); });
    if (engineMedia.addEventListener) on(engineMedia,'change',renderEngine);
    else { engineMedia.addListener(renderEngine);cleanups.push(function () { engineMedia.removeListener(renderEngine); }); }
    renderEngine(); // Normalize a cloned live root back to the source's initial step.

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
      cancelAnimationFrame(timers.engineRaf);
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
