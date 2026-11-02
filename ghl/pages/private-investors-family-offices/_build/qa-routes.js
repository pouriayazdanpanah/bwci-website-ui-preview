// Dev-only: the Claude Design runtime (design/support.js) fetches React 18.3.1 from unpkg.com at
// runtime. The QA browser has no route to unpkg, so those two files are served from the repo's
// identical local copies in design/vendor/. Only the SOURCE page needs this; the GHL port loads no React.
// SRC_PROPS="showFlags=true,showPamCard=false" also rewrites the source page's prop defaults (its data-props), so the
// source renders as with those props set; compare it with the matching preview (plain-flags.html / plain-nopam.html).
const fs = require('fs');
const path = require('path');
const VENDOR = path.resolve(__dirname, '../../../../design/vendor');
module.exports = async function routeReact(page) {
  if (process.env.SRC_PROPS) {
    const props = process.env.SRC_PROPS.split(',').map((kv) => kv.split('='));
    await page.route('**/Private%20Investors%20Family%20Offices.dc.html', async (r) => {
      let body = await (await r.fetch()).text();
      props.forEach(([k, v]) => {
        const re = new RegExp('(&quot;' + k + '&quot;:\\{[^}]*?&quot;default&quot;:)(true|false)');
        if (!re.test(body)) throw new Error('No prop ' + k);
        body = body.replace(re, '$1' + v);
      });
      r.fulfill({ contentType: 'text/html; charset=utf-8', body });
    });
  }
  await page.route('https://unpkg.com/react@18.3.1/umd/react.production.min.js', (r) =>
    r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(VENDOR, 'react.js')) }));
  await page.route('https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js', (r) =>
    r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(VENDOR, 'react-dom.js')) }));
};
