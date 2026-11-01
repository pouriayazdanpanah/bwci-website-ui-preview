// Dev-only: the Claude Design runtime (design/support.js) fetches React 18.3.1 from unpkg.com at
// runtime. The QA browser has no route to unpkg, so those two files are served from the repo's
// identical local copies in design/vendor/. Only the SOURCE page needs this; the GHL port loads no React.
const fs = require('fs');
const path = require('path');
const VENDOR = path.resolve(__dirname, '../../../../design/vendor');
module.exports = async function routeReact(page) {
  await page.route('https://unpkg.com/react@18.3.1/umd/react.production.min.js', (r) =>
    r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(VENDOR, 'react.js')) }));
  await page.route('https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js', (r) =>
    r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(VENDOR, 'react-dom.js')) }));
};
