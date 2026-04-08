// Generates long-tail "service modifier" pages:
//   /commercial/[modifier]-[segment]/
//
// Example outputs:
//   /commercial/nightly-office-cleaning/
//   /commercial/after-hours-medical-office-cleaning/
//   /commercial/daily-gym-cleaning/
//   /commercial/weekly-church-cleaning/
//
// These capture long-tail B2B keywords that the plain segment pages miss.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'dist', 'public');
const PHONE = '+18663509407';
const PHONE_DISPLAY = '(866) 350-9407';

// ─── Data ──────────────────────────────────────────────────────────────
const SEGMENT_MAP = {
  'medical-office-cleaning': { name: 'Medical Office', hubUrl: '/commercial/medical-office-cleaning/', icon: '🩺' },
  'office-cleaning':          { name: 'Office',          hubUrl: '/commercial/office-cleaning/',          icon: '🏢' },
  'daycare-cleaning':         { name: 'Daycare',         hubUrl: '/commercial/daycare-cleaning/',         icon: '🧸' },
  'gym-fitness-cleaning':     { name: 'Gym',             hubUrl: '/commercial/gym-fitness-cleaning/',     icon: '💪' },
  'school-cleaning':          { name: 'School',          hubUrl: '/commercial/school-cleaning/',          icon: '🎒' },
  'church-cleaning':          { name: 'Church',          hubUrl: '/commercial/church-cleaning/',          icon: '⛪' }
};

// Modifiers × segments: which combinations make sense
const MODIFIERS = [
  {
    slug: 'nightly',
    label: 'Nightly',
    hero: 'Nightly',
    targetSegments: ['office-cleaning', 'medical-office-cleaning', 'daycare-cleaning', 'gym-fitness-cleaning'],
    description: 'five-nights-a-week after-hours cleaning',
    benefits: [
      'Zero disruption to business hours',
      'Fresh environment every morning',
      'Consistent team assignment for security and quality',
      'Full access to every room without occupants present',
      'Standard 5 nights Monday through Friday'
    ],
    whoFor: 'Most businesses open five days per week with standard business hours. Nightly service is the default choice for corporate offices, medical practices, daycares, and mid-size gyms.',
    pricing: 'Nightly service typically runs $0.07–$0.14 per square foot per visit, depending on segment and complexity.'
  },
  {
    slug: 'after-hours',
    label: 'After-Hours',
    hero: 'After-Hours',
    targetSegments: ['office-cleaning', 'medical-office-cleaning', 'gym-fitness-cleaning'],
    description: 'evening and overnight cleaning without any daytime presence',
    benefits: [
      'Cleaning happens between 6 PM and 6 AM when you are closed',
      'No visibility to employees, patients, or members',
      'Complete access to conference rooms, exam rooms, locker rooms',
      'Security-focused: badge tracking, background-checked staff, uniformed team',
      'Proven model for HIPAA-aware medical environments'
    ],
    whoFor: 'Medical practices, corporate offices with sensitive information, gyms that want spotless equipment before morning members arrive, and any business where daytime cleaning presence would be disruptive.',
    pricing: 'After-hours pricing is typically 5–10% higher than nightly service to account for the tighter window and overnight labor premium.'
  },
  {
    slug: 'daily',
    label: 'Daily',
    hero: 'Daily',
    targetSegments: ['medical-office-cleaning', 'daycare-cleaning', 'gym-fitness-cleaning'],
    description: 'seven-days-a-week cleaning for high-traffic facilities',
    benefits: [
      'Seven cleanings per week including weekends',
      'Ideal for urgent care, 7-day fitness centers, and weekend-active daycares',
      'Weekend cleaning keeps the space ready for Monday without weekend buildup',
      'Daily reset of high-touch zones and restrooms',
      'Backup team coverage for team absences or illness'
    ],
    whoFor: 'Urgent care clinics, 7-day fitness centers, childcare facilities open weekends, and any business with weekend foot traffic that accumulates dirt faster than 5-night cleaning can absorb.',
    pricing: 'Daily service typically runs 30–40% more per month than standard nightly, reflecting the additional weekend visits.'
  },
  {
    slug: 'weekly',
    label: 'Weekly',
    hero: 'Weekly',
    targetSegments: ['office-cleaning', 'church-cleaning', 'school-cleaning'],
    description: 'once-per-week thorough cleaning',
    benefits: [
      'Ideal budget-friendly option for low-traffic facilities',
      'One comprehensive deep clean per week covers the full scope',
      'Churches, small offices, and classrooms benefit from weekly rhythm',
      'Flexible day assignment: Monday, Friday, or Saturday typical',
      'Easy to budget with predictable monthly costs'
    ],
    whoFor: 'Churches, small offices under 3,000 square feet, religious schools, non-profits, and any facility where daily or nightly service is not needed.',
    pricing: 'Weekly service is the most affordable option, typically 70–80% cheaper monthly than nightly cleaning.'
  }
];

// ─── Shared HTML ───────────────────────────────────────────────────────
const HEAD = (title, desc, canonical) => `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index,follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://santoscsolutions.com/images/santos-logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JVX5JNXLT3"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-JVX5JNXLT3');</script>`;

const STYLES = `<style>
  *,*::before,*::after{box-sizing:border-box}
  html,body{margin:0;padding:0;font-family:'Inter',-apple-system,system-ui,sans-serif;background:#0a0a0a;color:#fff;-webkit-font-smoothing:antialiased;line-height:1.6}
  a{color:#facc15;text-decoration:none}a:hover{text-decoration:underline}
  .wrap{max-width:1100px;margin:0 auto;padding:0 20px}
  nav.top{position:sticky;top:0;background:rgba(10,10,10,.95);backdrop-filter:blur(8px);border-bottom:1px solid #1a1a1a;z-index:50;padding:14px 20px}
  nav.top .nav-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px}
  nav.top .brand{color:#fff;font-weight:800;font-size:18px}
  nav.top .links{display:flex;gap:24px}
  nav.top .links a{color:#cfcfcf;font-size:14px;font-weight:500}
  nav.top .cta{background:#facc15;color:#0a0a0a !important;padding:10px 18px;border-radius:8px;font-weight:600;font-size:14px}
  @media(max-width:768px){nav.top .links{display:none}}
  .hero{padding:72px 0 56px;background:radial-gradient(ellipse at top,#1a1a1a 0%,#0a0a0a 60%)}
  .hero h1{font-size:44px;line-height:1.1;margin:0 0 16px;font-weight:800;letter-spacing:-0.02em}
  .hero .tagline{font-size:20px;color:#facc15;margin:0 0 24px}
  .hero .sub{font-size:18px;color:#a0a0a0;max-width:720px;margin:0 0 32px}
  .hero .actions{display:flex;gap:16px;flex-wrap:wrap}
  .btn{display:inline-block;padding:16px 28px;border-radius:10px;font-weight:600;font-size:16px}
  .btn-primary{background:#facc15;color:#0a0a0a !important}
  .btn-secondary{background:transparent;color:#fff !important;border:1px solid #2a2a2a}
  @media(max-width:768px){.hero h1{font-size:32px}.hero{padding:48px 0 40px}}
  .crumbs{color:#666;font-size:13px;padding:20px 0 0}
  .crumbs a{color:#888}
  section{padding:56px 0}
  section h2{font-size:32px;margin:0 0 16px;font-weight:700;letter-spacing:-0.01em}
  section p{font-size:17px;color:#cfcfcf;max-width:760px;margin:0 0 16px}
  .checklist{list-style:none;padding:0;margin:16px 0;color:#cfcfcf;font-size:16px}
  .checklist li{padding:10px 0 10px 28px;border-bottom:1px solid #1a1a1a;position:relative}
  .checklist li::before{content:'✓';position:absolute;left:0;color:#22c55e;font-weight:700}
  .grid{display:grid;gap:20px}
  .grid-3{grid-template-columns:repeat(3,1fr)}
  .grid-2{grid-template-columns:repeat(2,1fr)}
  @media(max-width:768px){.grid-3,.grid-2{grid-template-columns:1fr}}
  .seg-card{background:#121212;border:1px solid #1f1f1f;border-radius:14px;padding:24px;transition:border-color .15s;display:block;color:#fff}
  .seg-card:hover{border-color:#facc15;text-decoration:none}
  .seg-card h3{margin:0 0 6px;color:#fff;font-size:18px}
  .seg-card p{margin:0;color:#a0a0a0;font-size:14px}
  .callout{background:#121212;border:1px solid #2a2a2a;border-left:4px solid #facc15;padding:24px 28px;border-radius:8px;margin:24px 0}
  .callout strong{color:#facc15;display:block;margin-bottom:8px}
  .cta-block{background:linear-gradient(135deg,#facc15 0%,#fde047 100%);color:#0a0a0a;padding:48px 32px;border-radius:16px;text-align:center;margin:48px 0}
  .cta-block h2{color:#0a0a0a;margin:0 0 12px;font-size:28px}
  .cta-block p{color:#1a1a1a;margin:0 0 24px;max-width:560px;margin-left:auto;margin-right:auto}
  .cta-block .btn-dark{background:#0a0a0a;color:#facc15 !important}
  footer{background:#070707;border-top:1px solid #1a1a1a;padding:40px 0;margin-top:56px;color:#666;font-size:13px;text-align:center}
  footer a{color:#a0a0a0}
</style>`;

const NAV = `<nav class="top"><div class="nav-inner">
  <a href="/" class="brand">Santos Cleaning</a>
  <div class="links">
    <a href="/">Residential</a>
    <a href="/commercial/">Commercial</a>
    <a href="/blog/">Blog</a>
    <a href="tel:${PHONE}">${PHONE_DISPLAY}</a>
  </div>
  <a href="/commercial/get-quote/" class="cta">Get a Quote</a>
</div></nav>`;

const FOOTER = `<footer><div class="wrap">
  <p>© 2026 Santos Cleaning Solutions LLC — Licensed, bonded & insured. <a href="mailto:contact@santoscsolutions.com">contact@santoscsolutions.com</a> · <a href="tel:${PHONE}">${PHONE_DISPLAY}</a></p>
</div></footer>`;

// ─── Builder ───────────────────────────────────────────────────────────
function buildPage(modifier, segmentSlug) {
  const seg = SEGMENT_MAP[segmentSlug];
  const slug = `${modifier.slug}-${segmentSlug}`;
  const canonical = `https://santoscsolutions.com/commercial/${slug}/`;
  const titleBase = `${modifier.hero} ${seg.name} Cleaning Atlanta | Santos Cleaning`;
  const title = titleBase.length > 72 ? `${modifier.hero} ${seg.name} Cleaning | Santos Cleaning` : titleBase;
  const desc = `${modifier.hero} ${seg.name.toLowerCase()} cleaning across Atlanta Metro — ${modifier.description}. Insured, background-checked, written scope. Free quote.`.slice(0, 160);

  // Schema
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${canonical}#service`,
        name: `${modifier.hero} ${seg.name} Cleaning`,
        description: desc,
        provider: {
          '@type': 'LocalBusiness',
          name: 'Santos Cleaning Solutions',
          telephone: PHONE,
          areaServed: { '@type': 'AdministrativeArea', name: 'Atlanta Metro' }
        },
        areaServed: { '@type': 'AdministrativeArea', name: 'Atlanta Metro, GA' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://santoscsolutions.com/' },
          { '@type': 'ListItem', position: 2, name: 'Commercial', item: 'https://santoscsolutions.com/commercial/' },
          { '@type': 'ListItem', position: 3, name: `${seg.name} Cleaning`, item: `https://santoscsolutions.com${seg.hubUrl}` },
          { '@type': 'ListItem', position: 4, name: `${modifier.hero} ${seg.name}`, item: canonical }
        ]
      }
    ]
  };

  const otherModifiersForSegment = MODIFIERS
    .filter(m => m.slug !== modifier.slug && m.targetSegments.includes(segmentSlug))
    .slice(0, 3);

  return `${HEAD(title, desc, canonical)}
  ${STYLES}
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  ${NAV}
  <div class="wrap">
    <div class="crumbs"><a href="/">Home</a> / <a href="/commercial/">Commercial</a> / <a href="${seg.hubUrl}">${seg.name} Cleaning</a> / ${modifier.hero}</div>
  </div>
  <section class="hero">
    <div class="wrap">
      <p style="color:#facc15;font-size:14px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 12px">${seg.icon} Commercial Cleaning Service</p>
      <h1>${modifier.hero} ${seg.name} Cleaning in Atlanta Metro</h1>
      <p class="tagline">${modifier.description.charAt(0).toUpperCase() + modifier.description.slice(1)}.</p>
      <p class="sub">Santos Cleaning Solutions provides ${modifier.label.toLowerCase()} ${seg.name.toLowerCase()} cleaning service across Atlanta Metro. Insured, background-checked teams. EPA-registered products. Written scope signed before work begins.</p>
      <div class="actions">
        <a href="/commercial/get-quote/" class="btn btn-primary">Get a Free Quote →</a>
        <a href="tel:${PHONE}" class="btn btn-secondary">Call ${PHONE_DISPLAY}</a>
      </div>
    </div>
  </section>
  <section>
    <div class="wrap">
      <h2>Why ${modifier.hero} ${seg.name} Cleaning Works</h2>
      <p>${modifier.whoFor}</p>
      <ul class="checklist">
        ${modifier.benefits.map(b => `<li>${b}</li>`).join('\n        ')}
      </ul>
      <div class="callout">
        <strong>Pricing</strong>${modifier.pricing}
      </div>
    </div>
  </section>
  <section style="background:#0d0d0d">
    <div class="wrap">
      <h2>Insurance & Compliance</h2>
      <p>All Santos Cleaning Solutions staff are background-checked, uniformed, and supervised. We carry General Liability $1,000,000 per occurrence, Products and Completed Operations $2,000,000 aggregate, and Personal and Advertising Injury $1,000,000. Certificate of Insurance available on request. We name clients as Additional Insured at no cost.</p>
      <p><a href="${seg.hubUrl}">Learn more about our full ${seg.name.toLowerCase()} cleaning program →</a></p>
    </div>
  </section>
  ${otherModifiersForSegment.length > 0 ? `
  <section>
    <div class="wrap">
      <h2>Other ${seg.name} Cleaning Schedules</h2>
      <div class="grid grid-3">
        ${otherModifiersForSegment.map(m => `<a href="/commercial/${m.slug}-${segmentSlug}/" class="seg-card"><h3>${m.hero} ${seg.name} Cleaning</h3><p>${m.description}</p></a>`).join('\n        ')}
      </div>
    </div>
  </section>` : ''}
  <section>
    <div class="wrap">
      <div class="cta-block">
        <h2>Get a Free ${modifier.hero} ${seg.name} Cleaning Quote</h2>
        <p>Free walkthrough, written scope, transparent pricing. No long-term lock-in.</p>
        <a href="/commercial/get-quote/" class="btn btn-dark">Start My Quote →</a>
      </div>
    </div>
  </section>
  ${FOOTER}
  <script src="/assets/scs-cta.js" defer></script>
</body>
</html>`;
}

// ─── Write ─────────────────────────────────────────────────────────────
function writeFile(relPath, content) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

let written = 0;
const combos = [];
for (const modifier of MODIFIERS) {
  for (const segSlug of modifier.targetSegments) {
    writeFile(`commercial/${modifier.slug}-${segSlug}/index.html`, buildPage(modifier, segSlug));
    combos.push(`${modifier.slug}-${segSlug}`);
    written++;
  }
}
console.log(JSON.stringify({ written, combos }));
