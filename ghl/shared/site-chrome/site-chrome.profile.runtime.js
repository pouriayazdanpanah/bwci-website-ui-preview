  /* Inlined GovProfile entry context and mouse-drag carousel. Touch scroll/snap is native. */
  function siteProfile(root, on) {
    var via = PROFILE_CONTEXT.defaultVia;
    try {
      var from = new URLSearchParams(window.location.search).get('from');
      if (from === 'board' || from === 'leadership') via = from;
    } catch (err) { /* default membership */ }
    var context = PROFILE_CONTEXT.contexts[via];
    // Replace before link configuration and siteGovNav initialization, including after root cloning.
    var bc = root.querySelector('.__P__-bc-host');
    var gn = root.querySelector('[data-__P__-govnav]');
    if (bc) bc.outerHTML = context.breadcrumb;
    if (gn) gn.outerHTML = context.govnav;
    var el = root.querySelector('.__P__-gv-also');
    if (!el) return null;
    var x0 = 0, s0 = 0, down = false, moved = false, pointer = null;
    function release() {
      down = false;
      el.classList.remove('__P__-is-drag');
      if (pointer !== null && el.hasPointerCapture(pointer)) el.releasePointerCapture(pointer);
      pointer = null;
    }
    on(el, 'pointerdown', function (e) {
      moved = false;
      if (e.pointerType !== 'mouse' || e.button !== 0 || el.scrollWidth <= el.clientWidth) return;
      down = true; x0 = e.clientX; s0 = el.scrollLeft; pointer = e.pointerId;
    });
    on(el, 'pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - x0;
      if (!moved && Math.abs(dx) > 6) {
        moved = true; el.setPointerCapture(e.pointerId); el.classList.add('__P__-is-drag');
      }
      if (moved) { e.preventDefault(); el.scrollLeft = s0 - dx; }
    });
    on(el, 'pointerup', release);
    on(el, 'pointercancel', release);
    on(el, 'lostpointercapture', function () { down = false; el.classList.remove('__P__-is-drag'); });
    on(el, 'pointerleave', function () { if (!moved) release(); });
    on(el, 'dragstart', function (e) { e.preventDefault(); });
    on(el, 'click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, {capture: true});
    return {destroy: release};
  }
