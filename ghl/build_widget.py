"""Generate one direct HTML/CSS/JS block for a HighLevel Custom Code element."""
from base64 import b64encode
from pathlib import Path
from urllib.parse import quote
import re

ROOT = Path(__file__).resolve().parents[1]
HERE = Path(__file__).resolve().parent
BASE = 'https://pouriayazdanpanah.github.io/bwci-website-ui-preview/'
source = (ROOT / 'Ecosystem.dc.html').read_text(encoding='utf-8')
css = re.search(r'<style>(.*?)</style>', source, re.S).group(1)
css = css.replace(':root{', ':host{', 1)
css = css.replace('html{ scroll-behavior:smooth; }', ':host{ display:block; width:100%; }', 1)
css = css.replace('body{ margin:0;', '.bwci-page{ margin:0;', 1)
css += '\n[hidden]{display:none!important}\n'
markup = (HERE / 'eco-markup.html').read_text(encoding='utf-8')
image = b64encode((ROOT / 'assets/eco-hero-waves.webp').read_bytes()).decode('ascii')
markup = markup.replace('__INLINE_HERO_IMAGE__', 'data:image/webp;base64,' + image)
# Cross-page navigation uses the approved, currently published GitHub Pages URLs.
markup = re.sub(r'href="(?!#|https?:)([^"]+)"',
                lambda m: 'href="' + BASE + quote(m.group(1), safe='/#%') + '"', markup)
js = (HERE / 'eco-widget.js').read_text(encoding='utf-8-sig')
parts = re.search(r'    const PARTS = \[.*?\n    \];', source, re.S).group(0)
loop = re.search(r'    const LPN = \[.*?\n    \];', source, re.S).group(0)
js = js.replace('/*__ORIGINAL_CONTENT_DATA__*/', parts + '\n' + loop)
js = js.replace('(() => {', 'function bootEcosystemWidget() {', 1)
assert js.rstrip().endswith('})();')
js = js.rstrip()[:-5] + '}\nbootEcosystemWidget();\ndocument.addEventListener("DOMContentLoaded", bootEcosystemWidget, {once:true});\ndocument.addEventListener("hydrationDone", bootEcosystemWidget);\n'
output = ('<!-- Paste this complete block into one HighLevel Custom Code element. -->\n'
          '<div id="bwci-ecosystem-widget">\n<template>\n<style>\n' + css + '\n</style>\n'
          + markup + '</template>\n</div>\n<script>\n' + js + '</script>\n')
assert '<iframe' not in output and 'srcdoc' not in output and 'support.js' not in output
assert 'fetch(' not in output and 'DecompressionStream' not in output
path = HERE / 'ecosystem-widget.html'
path.write_text(output, encoding='utf-8', newline='\n')
print(f'Built {path.relative_to(ROOT)}: {path.stat().st_size:,} bytes')
