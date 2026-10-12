(function () {
  var body = document.body, fit = document.getElementById('pt-fit'), menu = document.getElementById('pt-menu');
  var mode = body.classList.contains('pt-mobile') ? 'mobile' : 'desktop';
  var core = +body.getAttribute('data-core') || (mode === 'mobile' ? 392 : 1282);
  var rules = (window.PT_RULES || []).map(function (r) { return [new RegExp(r[0]), r[1]]; });
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  // 1. wrap each board in a clip box (hides the annotation column unless Notes is on)
  [].forEach.call(fit.querySelectorAll('.pt-board'), function (b) {
    var w = +b.getAttribute('data-w') || core, clip = document.createElement('div');
    clip.className = 'pt-clip'; b.style.width = w + 'px'; clip.setAttribute('data-w', w);
    b.parentNode.insertBefore(clip, b); clip.appendChild(b);
  });

  // 2. turn wireframe text into links
  var leaves = fit.querySelectorAll('.pt-board *');
  [].forEach.call(leaves, function (el) {
    if (el.closest('.ph')) { if (el.tagName === 'A' || el.hasAttribute('data-href')) el.classList.add('pt-link'); return; }
    if (el.children.length) return;
    var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!t || t.length > 70) return;
    for (var i = 0; i < rules.length; i++) {
      if (rules[i][0].test(t)) { el.setAttribute('data-href', rules[i][1]); el.classList.add('pt-link'); el.setAttribute('role', 'link'); el.tabIndex = 0; break; }
    }
  });

  function go(target) {
    if (target === '#menu') { menu.hidden = false; return; }
    location.href = target.indexOf('.html') > -1 ? target : target + '.html';
  }
  fit.addEventListener('click', function (e) {
    var l = e.target.closest('[data-href]');
    if (l) { e.preventDefault(); go(l.getAttribute('data-href')); return; }
    var a = e.target.closest('a[href]');
    if (a && a.closest('.ph')) return; // real links on placeholder pages
    if (a) e.preventDefault();
    body.classList.add('pt-flash'); setTimeout(function () { body.classList.remove('pt-flash'); }, 650);
  });
  fit.addEventListener('keydown', function (e) {
    var l = e.target.closest && e.target.closest('[data-href]');
    if (l && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(l.getAttribute('data-href')); }
  });
  menu.addEventListener('click', function (e) { if (e.target === menu || e.target.closest('.pt-menu-x')) menu.hidden = true; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu.hidden = true; });

  // 3. toggles
  function toggle(id, cls, key) {
    var b = document.getElementById(id);
    function set(on) { body.classList.toggle(cls, on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); store(key, on ? '1' : '0'); layout(); }
    b.addEventListener('click', function () { set(!body.classList.contains(cls)); });
    if (store(key) === '1') { body.classList.add(cls); b.setAttribute('aria-pressed', 'true'); }
  }

  // 4. fit to screen width
  function layout() {
    var notes = body.classList.contains('pt-notes'), maxW = 0;
    [].forEach.call(fit.querySelectorAll('.pt-clip'), function (c) {
      var w = notes ? +c.getAttribute('data-w') : Math.min(core, +c.getAttribute('data-w'));
      c.style.width = w + 'px'; maxW = Math.max(maxW, w);
    });
    var pad = window.innerWidth <= 700 ? 0 : 32, avail = document.documentElement.clientWidth - pad;
    var z = Math.min(1, avail / maxW);
    fit.style.zoom = z < 0.999 ? z : '';
  }
  toggle('pt-links', 'pt-show-links', 'pt-links');
  toggle('pt-notes', 'pt-notes', 'pt-notes');
  layout(); window.addEventListener('resize', layout);

  // 5. hint when the desktop prototype is opened on a phone
  if (mode === 'desktop' && window.innerWidth < 700) {
    var h = document.createElement('div'); h.className = 'pt-hint';
    h.innerHTML = 'You are on a phone. <a href="' + location.pathname.replace('/desktop/', '/mobile/').split('/').pop() + '">Open the mobile prototype →</a>';
    h.querySelector('a').href = '../mobile/' + location.pathname.split('/').pop();
    document.querySelector('.pt-crumb').after(h);
  }
})();
