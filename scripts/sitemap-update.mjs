// Regenerates dist/public/sitemap.xml with REAL <lastmod> per URL,
// based on the most recent mtime of the corresponding local HTML file.
// Preserves the existing structure: URL list, changefreq, priority.
// Falls back to "today" if the local file does not exist (e.g. /contact/).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist', 'public');
const SITEMAP = path.join(DIST, 'sitemap.xml');
const ORIGIN = 'https://santoscsolutions.com';

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

const today = fmtDate(new Date());

const xml = fs.readFileSync(SITEMAP, 'utf8');

let updated = 0;
let fallback = 0;
let total = 0;

const out = xml.replace(
  /<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]*)<\/lastmod>(\s*<changefreq>[^<]*<\/changefreq>)?(\s*<priority>[^<]*<\/priority>)?\s*<\/url>/g,
  (match, loc, oldLastmod, freqPart = '', prioPart = '') => {
    total++;
    let pathFromOrigin = loc.replace(ORIGIN, '');
    let candidate = pathFromOrigin.endsWith('/')
      ? path.join(DIST, pathFromOrigin, 'index.html')
      : path.join(DIST, pathFromOrigin);

    let lastmod;
    try {
      const stat = fs.statSync(candidate);
      lastmod = fmtDate(stat.mtime);
      updated++;
    } catch {
      lastmod = today;
      fallback++;
    }

    return `<url><loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>${freqPart}${prioPart}</url>`;
  }
);

fs.writeFileSync(SITEMAP, out);
console.log(JSON.stringify({ total, updated, fallback }, null, 2));
