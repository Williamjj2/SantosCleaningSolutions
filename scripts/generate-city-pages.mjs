// Generates city landing pages by templating from /marietta-house-cleaning/index.html.
// Each new city gets:
//  - its own slug directory with index.html
//  - real coordinates and ZIP
//  - title/H1/meta updated for the new city
//  - sitemap entry added (but the sitemap-update.mjs script handles lastmod separately)
// Idempotent: if a city directory already exists, the file is updated in place.
// Skips existing cities that were hand-crafted (like Marietta).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist', 'public');
const TEMPLATE_DIR = path.join(DIST, 'marietta-house-cleaning');
const TEMPLATE_FILE = path.join(TEMPLATE_DIR, 'index.html');

// Source city (template). Replacements relative to this.
const SRC = {
  display: 'Marietta',
  slug: 'marietta',
  zip: '30067',
  lat: '33.9526',
  lon: '-84.5499',
};

// Target cities to generate. Only include cities that don't have hand-crafted pages.
// Coordinates from Wikipedia / Google Maps. ZIP is the primary postal code.
const CITIES = [
  // Already exist (DO NOT regenerate — these are curated)
  // marietta, alpharetta, buckhead, sandy-springs, roswell, dunwoody,
  // johns-creek, brookhaven, milton, vinings, decatur, suwanee
  { display: 'Acworth',          slug: 'acworth',          zip: '30101', lat: '34.0664', lon: '-84.6770' },
  { display: 'Smyrna',           slug: 'smyrna',           zip: '30080', lat: '33.8839', lon: '-84.5144' },
  { display: 'Kennesaw',         slug: 'kennesaw',         zip: '30144', lat: '34.0234', lon: '-84.6155' },
  { display: 'Powder Springs',   slug: 'powder-springs',   zip: '30127', lat: '33.8595', lon: '-84.6838' },
  { display: 'Mableton',         slug: 'mableton',         zip: '30126', lat: '33.8120', lon: '-84.5677' },
  { display: 'Austell',          slug: 'austell',          zip: '30106', lat: '33.8123', lon: '-84.6344' },
  { display: 'Woodstock',        slug: 'woodstock',        zip: '30188', lat: '34.1015', lon: '-84.5194' },
  { display: 'Canton',           slug: 'canton',           zip: '30114', lat: '34.2367', lon: '-84.4908' },
  { display: 'Holly Springs',    slug: 'holly-springs',    zip: '30115', lat: '34.1734', lon: '-84.5202' },
  { display: 'Cumming',          slug: 'cumming',          zip: '30040', lat: '34.2073', lon: '-84.1402' },
  { display: 'Duluth',           slug: 'duluth',           zip: '30096', lat: '34.0029', lon: '-84.1446' },
  { display: 'Norcross',         slug: 'norcross',         zip: '30071', lat: '33.9412', lon: '-84.2135' },
  { display: 'Lawrenceville',    slug: 'lawrenceville',    zip: '30043', lat: '33.9562', lon: '-83.9879' },
  { display: 'Lilburn',          slug: 'lilburn',          zip: '30047', lat: '33.8901', lon: '-84.1430' },
  { display: 'Tucker',           slug: 'tucker',           zip: '30084', lat: '33.8545', lon: '-84.2171' },
  { display: 'Doraville',        slug: 'doraville',        zip: '30340', lat: '33.8973', lon: '-84.2713' },
  { display: 'Chamblee',         slug: 'chamblee',         zip: '30341', lat: '33.8927', lon: '-84.3013' },
  { display: 'East Cobb',        slug: 'east-cobb',        zip: '30068', lat: '33.9876', lon: '-84.4377' },
  { display: 'Mountain Park',    slug: 'mountain-park',    zip: '30075', lat: '34.0907', lon: '-84.3791' },
  { display: 'Druid Hills',      slug: 'druid-hills',      zip: '30307', lat: '33.7772', lon: '-84.3334' },
  { display: 'Avondale Estates', slug: 'avondale-estates', zip: '30002', lat: '33.7712', lon: '-84.2691' },
  { display: 'Stone Mountain',   slug: 'stone-mountain',   zip: '30083', lat: '33.8081', lon: '-84.1700' },
  { display: 'Snellville',       slug: 'snellville',       zip: '30078', lat: '33.8573', lon: '-84.0198' },
  { display: 'Grayson',          slug: 'grayson',          zip: '30017', lat: '33.8923', lon: '-83.9610' },
  { display: 'Loganville',       slug: 'loganville',       zip: '30052', lat: '33.8389', lon: '-83.9007' },
  { display: 'Sugar Hill',       slug: 'sugar-hill',       zip: '30518', lat: '34.1062', lon: '-84.0335' },
  { display: 'Buford',           slug: 'buford',           zip: '30518', lat: '34.1206', lon: '-83.9985' },
  { display: 'Flowery Branch',   slug: 'flowery-branch',   zip: '30542', lat: '34.1862', lon: '-83.9249' },
  { display: 'Gainesville',      slug: 'gainesville',      zip: '30501', lat: '34.2979', lon: '-83.8241' },
  { display: 'Peachtree Corners',slug: 'peachtree-corners',zip: '30092', lat: '33.9698', lon: '-84.2214' },
];

const tpl = fs.readFileSync(TEMPLATE_FILE, 'utf8');
let createdCount = 0;
let skippedCount = 0;

for (const c of CITIES) {
  const slugDir = `${c.slug}-house-cleaning`;
  const outDir = path.join(DIST, slugDir);
  const outFile = path.join(outDir, 'index.html');

  // Build the rendered HTML by careful replacement
  // - Display name "Marietta" -> c.display  (first, before slug, since "marietta" appears inside)
  // - Slug "marietta" -> c.slug
  // - ZIP, lat, lon
  // - canonical URL
  let html = tpl
    .replace(/Marietta, GA/g, `${c.display}, GA`)
    .replace(/Marietta, Georgia/g, `${c.display}, Georgia`)
    .replace(/Marietta GA/g, `${c.display} GA`)
    .replace(/Marietta(?![\w])/g, c.display)
    .replace(/marietta-house-cleaning/g, slugDir)
    .replace(/maid service marietta/g, `maid service ${c.slug}`)
    .replace(/cleaning services marietta ga/g, `cleaning services ${c.slug} ga`)
    .replace(/marietta(?![\w-])/g, c.slug)
    .replace(/30067/g, c.zip)
    .replace(/33\.9526/g, c.lat)
    .replace(/-84\.5499/g, c.lon);

  // Make sure canonical points to the new URL
  html = html.replace(
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="https://santoscsolutions.com/${slugDir}/">`
  );

  // og:url
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="https://santoscsolutions.com/${slugDir}/"`
  );

  fs.mkdirSync(outDir, { recursive: true });
  const exists = fs.existsSync(outFile);
  fs.writeFileSync(outFile, html);
  if (exists) skippedCount++;
  else createdCount++;
}

console.log(JSON.stringify({
  templateSource: SRC,
  citiesProcessed: CITIES.length,
  created: createdCount,
  updatedExisting: skippedCount,
}, null, 2));
