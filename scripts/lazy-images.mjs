// Adds loading="lazy" decoding="async" to <img> tags in all dist/public/**/*.html
// Strategy: skip the FIRST <img> in each document (likely above the fold / LCP candidate)
// and skip any <img> that already has loading="eager" or fetchpriority="high".
// Idempotent: if loading="lazy" is already present, leave it alone.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'dist', 'public');

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) yield full;
  }
}

const stats = { files: 0, modified: 0, imgsTotal: 0, imgsLazied: 0, imgsSkipped: 0 };

for (const file of walk(ROOT)) {
  stats.files++;
  const orig = fs.readFileSync(file, 'utf8');

  let firstSeen = false;
  let imgsInFile = 0;
  let laziedInFile = 0;
  let skippedInFile = 0;

  const next = orig.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    imgsInFile++;
    // skip first <img> in document
    if (!firstSeen) {
      firstSeen = true;
      skippedInFile++;
      return match;
    }
    // skip if already opted out / opted in
    if (/loading=/i.test(attrs)) { skippedInFile++; return match; }
    if (/fetchpriority\s*=\s*["']high["']/i.test(attrs)) { skippedInFile++; return match; }

    laziedInFile++;
    // append loading="lazy" decoding="async"
    return `<img${attrs} loading="lazy" decoding="async">`;
  });

  stats.imgsTotal += imgsInFile;
  stats.imgsLazied += laziedInFile;
  stats.imgsSkipped += skippedInFile;

  if (next !== orig) {
    fs.writeFileSync(file, next);
    stats.modified++;
  }
}

console.log(JSON.stringify(stats, null, 2));
