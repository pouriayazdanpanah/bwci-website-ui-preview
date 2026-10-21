  /* ================= PERSON CARDS (design/PersonCard.dc.html, bwci-people.js, image-slot.js) =================
     Portraits come from "peopleImages" in the config (one URL per person, keyed by slug); the untouched
     placeholder is never requested. Each portrait is placed as image-slot.js places a photo at its default
     framing: it covers the frame at scale 1, centred, sized in % of the frame (recomputed on load and resize).
     A card's profile link is its configured route plus ?from=<page>, as the source's BWCI_PEOPLE.href(). */
  function sitePeople(root, cfg, on) {
    var links = cfg.links || {};
    var images = cfg.peopleImages || {};
    function usable(u) { return typeof u === 'string' && u && u.indexOf('REPLACE-WITH') === -1; }

    Array.prototype.forEach.call(root.querySelectorAll('a[data-__P__-from]'), function (a) {
      var v = links[a.getAttribute('data-__P__-link')];
      if (typeof v !== 'string' || !v || v.charAt(0) === '#') return; // unresolved routes stay as they are
      var hash = '';
      var i = v.indexOf('#');
      if (i >= 0) { hash = v.slice(i); v = v.slice(0, i); }
      a.setAttribute('href', v + (v.indexOf('?') >= 0 ? '&' : '?') + 'from=' + a.getAttribute('data-__P__-from') + hash);
    });

    var imgs = Array.prototype.slice.call(root.querySelectorAll('img[data-__P__-person]'));
    function fit(img) {
      var slot = img.closest('.__P__-slot');
      var iw = img.naturalWidth, ih = img.naturalHeight, fw = slot.clientWidth, fh = slot.clientHeight;
      if (!iw || !ih || !fw || !fh) return;
      var base = Math.max(fw / iw, fh / ih);
      img.style.width = (iw * base / fw * 100) + '%';
      img.style.height = (ih * base / fh * 100) + '%';
    }
    imgs.forEach(function (img) {
      on(img, 'load', function () { fit(img); });
      var url = images[img.getAttribute('data-__P__-person')];
      if (usable(url) && img.getAttribute('src') !== url) img.src = url;
      if (img.complete) fit(img);
    });
    var ro = null;
    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(function () { imgs.forEach(fit); });
      imgs.forEach(function (img) { ro.observe(img.closest('.__P__-slot')); });
    } else {
      on(window, 'resize', function () { imgs.forEach(fit); }, { passive: true });
    }
    return { destroy: function () { if (ro) ro.disconnect(); } };
  }
