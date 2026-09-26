"""Build the single-paste HighLevel Ecosystem Custom Code snippet."""

from base64 import b64encode
from gzip import compress
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).with_name("ecosystem-widget.html")
PAGE = ROOT / "Ecosystem.dc.html"
SCRIPT_TAG = '<script src="./support.js"></script>'
IMAGE_PATH = './assets/eco-hero-waves.webp'


def inline_script(path: Path) -> str:
    source = path.read_text(encoding="utf-8")
    # Keep the surrounding HTML parser from ending this inline script early.
    source = source.replace("</script", "<\\/script").replace("</SCRIPT", "<\\/SCRIPT")
    return f"<script>\n{source}\n</script>"


def make_document() -> str:
    page = PAGE.read_text(encoding="utf-8")
    assert page.count(SCRIPT_TAG) == 1
    assert page.count(IMAGE_PATH) == 1
    assert page.count('min-height:100vh;') == 1

    scripts = "\n".join(inline_script(ROOT / name) for name in (
        "vendor/react.js", "vendor/react-dom.js", "support.js"
    ))
    page = page.replace(SCRIPT_TAG, scripts, 1)
    image = b64encode((ROOT / "assets/eco-hero-waves.webp").read_bytes()).decode("ascii")
    page = page.replace(IMAGE_PATH, f"data:image/webp;base64,{image}", 1)
    page = page.replace('min-height:100vh;', 'min-height:0;', 1)
    page = page.replace("</head>", "<style>html,body,#dc-root,#dc-root>.sc-host{height:auto!important;min-height:0!important}html,body{overflow-x:hidden}</style>\n</head>", 1)
    return page


WIDGET = r'''<!-- BWCI Ecosystem: paste this entire block into one HighLevel Custom Code element. -->
<div id="bwci-ecosystem-widget" style="width:100%;max-width:none;margin:0;padding:0;overflow:visible"></div>
<script>
(() => {
  "use strict";
  // Change this one URL if the other BWCI pages move to your HighLevel site.
  const LINK_BASE = "https://pouriayazdanpanah.github.io/bwci-website-ui-preview/";
  const PAYLOAD = "__PAYLOAD__";
  const MOUNT_ID = "bwci-ecosystem-widget";
  let documentPromise;
  let cleanup = () => {};

  function embeddedDocument() {
    if (!documentPromise) {
      documentPromise = (async () => {
        if (!window.DecompressionStream) throw new Error("This browser does not support DecompressionStream.");
        const bytes = Uint8Array.from(atob(PAYLOAD), char => char.charCodeAt(0));
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
        return new Response(stream).text();
      })();
    }
    return documentPromise;
  }

  async function mountWidget() {
    const mount = document.getElementById(MOUNT_ID);
    if (!mount || mount.dataset.bwciMounted === "true") return;
    cleanup();
    mount.dataset.bwciMounted = "true";
    const frame = document.createElement("iframe");
    frame.title = "Better World Ecosystem";
    frame.setAttribute("scrolling", "no");
    frame.setAttribute("loading", "eager");
    frame.style.cssText = "display:block;width:100%;height:900px;border:0;overflow:hidden;background:#fff";
    let observer;
    let ticking = false;
    let nav;
    const stickyNav = () => {
      if (!frame.isConnected) return;
      // The source runtime can replace nodes during an interaction.
      nav = frame.contentDocument?.querySelector(".nav");
      if (!nav) return;
      const offset = Math.max(0, Math.min(-frame.getBoundingClientRect().top, frame.offsetHeight - nav.offsetHeight));
      nav.style.transform = `translateY(${Math.round(offset)}px)`;
    };
    const scheduleSticky = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; stickyNav(); });
    };
    const resize = () => {
      const doc = frame.contentDocument;
      const content = doc && (doc.querySelector("#dc-root>.sc-host") || doc.querySelector("#dc-root"));
      if (!content) return;
      const height = Math.ceil(content.getBoundingClientRect().height) + 2;
      if (height > 0 && Math.abs(frame.offsetHeight - height) > 2) frame.style.height = `${height}px`;
      scheduleSticky();
    };
    const onFrameLoad = () => {
      const doc = frame.contentDocument;
      if (!doc) return;
      nav = doc.querySelector(".nav");
      doc.addEventListener("click", event => {
        const anchor = event.target.closest("a[href]");
        if (!anchor) return;
        const href = anchor.getAttribute("href");
        if (!href) return;
        if (href.startsWith("#")) {
          const target = doc.getElementById(decodeURIComponent(href.slice(1)));
          if (!target) return;
          event.preventDefault();
          const y = window.scrollY + frame.getBoundingClientRect().top + target.getBoundingClientRect().top - (nav?.offsetHeight || 0);
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
          return;
        }
        if (!/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) anchor.href = new URL(href, LINK_BASE).href;
        anchor.target = "_top";
      }, true);
      observer = new ResizeObserver(resize);
      const start = () => {
        const content = doc.querySelector("#dc-root>.sc-host") || doc.querySelector("#dc-root");
        if (!content) { setTimeout(start, 50); return; }
        observer.observe(content);
        resize();
        doc.fonts?.ready.then(resize);
      };
      start();
    };
    frame.addEventListener("load", onFrameLoad, { once: true });
    window.addEventListener("scroll", scheduleSticky, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    cleanup = () => {
      observer?.disconnect();
      window.removeEventListener("scroll", scheduleSticky);
      window.removeEventListener("resize", resize);
    };
    try {
      frame.srcdoc = await embeddedDocument();
      mount.replaceChildren(frame);
    } catch (error) {
      mount.dataset.bwciMounted = "false";
      mount.textContent = `The Ecosystem widget could not load: ${error.message}`;
      cleanup();
    }
  }

  mountWidget();
  document.addEventListener("DOMContentLoaded", mountWidget, { once: true });
  // HighLevel can replace Custom Code markup during preview hydration.
  document.addEventListener("hydrationDone", mountWidget);
})();
</script>
'''


def main() -> None:
    source = make_document().encode("utf-8")
    payload = b64encode(compress(source, compresslevel=9, mtime=0)).decode("ascii")
    OUT.write_text(WIDGET.replace("__PAYLOAD__", payload), encoding="utf-8", newline="\n")
    print(f"Built {OUT.relative_to(ROOT)} ({OUT.stat().st_size:,} bytes; embedded document {len(source):,} bytes)")


if __name__ == "__main__":
    main()
