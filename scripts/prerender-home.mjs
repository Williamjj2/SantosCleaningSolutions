// Prerenders the SPA homepage into static HTML for SEO/social previews.
// 1) Serves dist/public on localhost
// 2) Loads / in headless Chromium
// 3) Waits for hydration + main heading visible
// 4) Captures rendered <body> and merges into the existing index.html (preserving the <head>)
// 5) Adds a <noscript> hint

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist', 'public');
const INDEX = path.join(DIST, 'index.html');
const PORT = 4567;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.mp4':  'video/mp4',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.txt':  'text/plain; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
};

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(DIST, urlPath);
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }
        if (!fs.existsSync(filePath)) {
          // SPA fallback
          filePath = INDEX;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } catch (err) {
        res.writeHead(500); res.end(String(err));
      }
    });
    server.listen(PORT, () => resolve(server));
    server.on('error', reject);
  });
}

async function main() {
  console.log('▶ starting local server on port', PORT);
  const server = await startServer();

  try {
    console.log('▶ launching headless chromium');
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 1800 } });
    page.on('console', m => { if (m.type() === 'error') console.error('  [page error]', m.text()); });

    const url = `http://127.0.0.1:${PORT}/`;
    console.log('▶ rendering', url);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for first H1 (or h2) to be visible — proxy for "hydrated"
    try {
      await page.waitForSelector('h1, [data-rendered="true"]', { state: 'attached', timeout: 30000 });
    } catch {
      console.warn('  ⚠ no <h1> found within 30s, snapshotting anyway');
    }

    // Allow another tick for any post-mount rendering
    await page.waitForTimeout(1500);

    const rendered = await page.evaluate(() => {
      // Strip script tags injected dynamically (gtag etc) so they don't double-load
      // Keep the rendered DOM though
      return {
        bodyHTML: document.body.innerHTML,
        title: document.title,
        h1: document.querySelector('h1')?.innerText || null,
        h2count: document.querySelectorAll('h2').length,
        bodyTextLen: (document.body.innerText || '').length,
      };
    });

    console.log('  title:', rendered.title);
    console.log('  H1:', rendered.h1 || '(none)');
    console.log('  H2 count:', rendered.h2count);
    console.log('  body text length:', rendered.bodyTextLen);

    if (!rendered.h1 || rendered.bodyTextLen < 500) {
      throw new Error(`Snapshot looks empty (H1=${!!rendered.h1}, bodyText=${rendered.bodyTextLen}). Aborting to avoid breaking site.`);
    }

    // Read existing index.html (we keep its <head> intact)
    const original = fs.readFileSync(INDEX, 'utf8');

    // Backup
    fs.writeFileSync(INDEX + '.bak', original);

    // Replace just the body. Use a non-greedy regex.
    const newBody = `<body>\n${rendered.bodyHTML}\n</body>`;
    const out = original.replace(/<body[\s\S]*?<\/body>/i, newBody);

    if (out === original) {
      throw new Error('Body replacement failed (regex did not match).');
    }

    fs.writeFileSync(INDEX, out);
    console.log('✓ wrote', INDEX, '(' + Buffer.byteLength(out) + ' bytes)');

    await browser.close();
  } finally {
    server.close();
  }
}

main().catch(err => {
  console.error('✗ prerender failed:', err.message);
  process.exit(1);
});
