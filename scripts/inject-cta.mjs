// Injects the SCS CTA loader (sticky mobile bar + exit-intent) into all
// dist/public/**/*.html files. Idempotent.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'dist', 'public');
const TAG = '<script src="/assets/scs-cta.js" defer></script>';
const MARKER = '/assets/scs-cta.js';

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile() && e.name.endsWith('.html')) yield full;
  }
}

let modified = 0, skipped = 0, total = 0;
for (const f of walk(ROOT)) {
  total++;
  const orig = fs.readFileSync(f, 'utf8');
  if (orig.includes(MARKER)) { skipped++; continue; }
  // Insert just before </body>
  const next = orig.replace(/<\/body>/i, TAG + '\n</body>');
  if (next === orig) { skipped++; continue; }
  fs.writeFileSync(f, next);
  modified++;
}
console.log(JSON.stringify({ total, modified, skipped }));
