// Injects a "Commercial cleaning in [city]" section into every
// residential city HTML (dist/public/[city]-house-cleaning/index.html).
//
// For the 20 cities with full city × segment commercial combos, links
// go to the city-specific commercial pages. For other residential cities,
// links fall back to the segment hubs.
//
// Idempotent: marker prevents double-injection.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'dist', 'public');

// Cities that have full commercial coverage (from generate-commercial.mjs)
const COMMERCIAL_CITIES = new Set([
  'atlanta','marietta','alpharetta','roswell','sandy-springs','buckhead',
  'brookhaven','dunwoody','johns-creek','kennesaw','smyrna','woodstock',
  'acworth','milton','duluth','decatur','suwanee','vinings','powder-springs',
  'peachtree-corners'
]);

const SEGMENTS = [
  { slug: 'medical-office-cleaning', name: 'Medical Office Cleaning',  icon: '🩺' },
  { slug: 'office-cleaning',         name: 'Corporate Office Cleaning', icon: '🏢' },
  { slug: 'daycare-cleaning',        name: 'Daycare Cleaning',          icon: '🧸' },
  { slug: 'gym-fitness-cleaning',    name: 'Gym & Fitness Cleaning',    icon: '💪' },
  { slug: 'school-cleaning',         name: 'School Cleaning',           icon: '🎒' },
  { slug: 'church-cleaning',         name: 'Church Cleaning',           icon: '⛪' }
];

const MARKER = '<!-- SCS_COMMERCIAL_BLOCK -->';

function buildBlock(cityName, citySlug) {
  const hasCombos = COMMERCIAL_CITIES.has(citySlug);
  const linksHtml = SEGMENTS.map(seg => {
    const href = hasCombos
      ? `/commercial/${citySlug}/${seg.slug}/`
      : `/commercial/${seg.slug}/`;
    return `<a href="${href}" style="display:block;background:#0d0d0d;border:1px solid #1f1f1f;border-radius:10px;padding:16px;color:#fff;text-decoration:none;transition:border-color .15s" onmouseover="this.style.borderColor='#facc15'" onmouseout="this.style.borderColor='#1f1f1f'"><strong style="display:block;font-size:15px;color:#fff">${seg.icon} ${seg.name}</strong><span style="color:#888;font-size:13px">${hasCombos ? `In ${cityName}` : 'Atlanta Metro'}</span></a>`;
  }).join('\n          ');

  return `${MARKER}
  <section style="background:#0a0a0a;padding:48px 20px;border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a">
    <div style="max-width:1100px;margin:0 auto;color:#fff;font-family:'Inter',-apple-system,system-ui,sans-serif">
      <p style="color:#facc15;font-size:13px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 8px;font-weight:600">Also For Your Business</p>
      <h2 style="font-size:28px;margin:0 0 8px;font-weight:700;color:#fff">Commercial Cleaning in ${cityName}</h2>
      <p style="color:#a0a0a0;font-size:15px;margin:0 0 24px;max-width:640px">Need cleaning for your medical practice, office, daycare, gym, school, or church in ${cityName}? Santos Cleaning Solutions services all types of commercial facilities with the same licensed, insured, background-checked team.</p>
      <div style="display:grid;gap:12px;grid-template-columns:repeat(3,minmax(0,1fr))">
          ${linksHtml}
      </div>
      <div style="margin-top:24px;text-align:center">
        <a href="/commercial/get-quote/" style="display:inline-block;background:#facc15;color:#0a0a0a;padding:14px 28px;border-radius:10px;font-weight:600;text-decoration:none">Get a Commercial Quote →</a>
      </div>
    </div>
  </section>`;
}

let processed = 0, modified = 0, skipped = 0;
for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const m = entry.name.match(/^(.+)-house-cleaning$/);
  if (!m) continue;
  const citySlug = m[1];
  const cityName = citySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const file = path.join(ROOT, entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  processed++;
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes(MARKER)) { skipped++; continue; }
  const block = buildBlock(cityName, citySlug);
  // Insert just before the residential footer
  const footerIdx = html.indexOf('<footer class="footer">');
  if (footerIdx === -1) { skipped++; continue; }
  html = html.slice(0, footerIdx) + block + '\n  ' + html.slice(footerIdx);
  fs.writeFileSync(file, html);
  modified++;
}

console.log(JSON.stringify({ processed, modified, skipped }));
