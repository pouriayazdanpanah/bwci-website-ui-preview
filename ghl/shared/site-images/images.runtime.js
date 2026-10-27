  /* Image Custom Values take priority. Inline blocks retain the original bytes as optional fallbacks. */
  function siteImageAvailable(value) {
    return typeof value === 'string' && value.trim() !== '' && value.trim() !== '#' &&
      !/\{\{|\}\}|REPLACE-WITH/.test(value) &&
      /^(?:https?:\/\/|\/(?!\/)|data:image\/(?:png|jpeg|jpg|webp|gif|avif|svg\+xml);base64,)/i.test(value.trim());
  }
  function siteResolveImages(root, cfg) {
    var paths = __SITE_IMAGE_PATHS__;
    function read(object, parts) {
      for (var i = 0; i < parts.length; i++) {
        if (!object || typeof object !== 'object') return undefined;
        object = object[parts[i]];
      }
      return object;
    }
    paths.forEach(function (parts) {
      var value = read(cfg,parts);
      if (value === undefined) return;
      var fallback = read(cfg.imageFallbacks,parts);
      var resolved = siteImageAvailable(value) ? value.trim() : siteImageAvailable(fallback) ? fallback.trim() : '';
      var target = parts.length === 1 ? cfg : cfg[parts[0]];
      target[parts[parts.length-1]] = resolved;
    });
    // Clear copied live URLs when the replacement hosted config has no usable image value.
    // Existing page loaders still assign valid URLs and perform their original crop/load handling.
    Array.prototype.forEach.call(root.querySelectorAll('img[data-__P__-asset],img[data-__P__-person]'),function (img) {
      var person = img.getAttribute('data-__P__-person'), key = img.getAttribute('data-__P__-asset');
      var value = person ? (cfg.peopleImages || {})[person] : Object.prototype.hasOwnProperty.call(cfg,key) ? cfg[key] : (cfg.images || {})[key];
      if (!siteImageAvailable(value)) img.removeAttribute('src');
    });
  }
