  /* Resolve page-section links after GHL substitutes the top JSON. No requests or shared globals. */
  function siteResolveLinks(cfg) {
    var links = cfg.links;
    if (!links || typeof links !== 'object' || Array.isArray(links)) return;
    var sections = __SITE_LINK_SECTIONS__;
    function pageAvailable(value) {
      return typeof value === 'string' && siteLinkAvailable(value.trim()) && /^(?:https?:\/\/|\/(?!\/))/.test(value.trim());
    }
    Object.keys(sections).forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(links,key)) return;
      var section = sections[key], value = links[key], base = links[section[0]];
      // Main's original local anchors remain usable even when its page URL is unavailable.
      if (ROOT_ID === 'bwci-main-page' && (key === 'impact' || key === 'today') && value === section[1]) return;
      // Only compose the generated base+fragment form; preserve explicit page-specific overrides.
      if (typeof base === 'string' && (value === base + section[1] || value === base)) {
        links[key] = pageAvailable(base) ? base.trim().split('#')[0] + section[1] : '#';
      }
    });
    Object.keys(links).forEach(function (key) {
      var value = typeof links[key] === 'string' ? links[key].trim() : '';
      links[key] = siteLinkAvailable(value) ? value : '#';
    });
  }
