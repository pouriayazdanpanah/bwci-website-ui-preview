  /* ================= GOVERNANCE SECTION BAR (design/GovNav.dc.html) =================
     The source renders the link list, or below 768 px (matchMedia, not CSS) a native select that navigates
     on change. Both are in the markup; this switches them. Option values follow the configured routes. */
  function siteGovNav(root, cfg, on) {
    var host = root.querySelector('[data-__P__-govnav]');
    if (!host) return null;
    var wide = host.querySelector('[data-__P__-gn-wide]');
    var narrow = host.querySelector('[data-__P__-gn-narrow]');
    var select = host.querySelector('[data-__P__-gn-select]');
    var links = cfg.links || {};
    Array.prototype.forEach.call(host.querySelectorAll('option[data-__P__-link]'), function (o) {
      var v = links[o.getAttribute('data-__P__-link')];
      if (typeof v === 'string' && v) o.value = v;
    });
    var mq = window.matchMedia ? window.matchMedia('(max-width:767px)') : null;
    function apply() {
      var isNarrow = !!(mq && mq.matches);
      wide.hidden = isNarrow;
      narrow.hidden = !isNarrow;
    }
    apply();
    if (mq) { if (mq.addEventListener) mq.addEventListener('change', apply); else if (mq.addListener) mq.addListener(apply); }
    // the source select is controlled (its value is always the current page), so after navigating it shows
    // the current page again, e.g. after a jump to the framework section on the hub
    var current = select.selectedIndex;
    on(select, 'change', function () {
      var v = select.value;
      if (v) window.location.href = v;
      select.selectedIndex = current;
    });
    return {
      destroy: function () {
        if (mq) { if (mq.removeEventListener) mq.removeEventListener('change', apply); else if (mq.removeListener) mq.removeListener(apply); }
      }
    };
  }
