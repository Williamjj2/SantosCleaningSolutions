// Generates the entire /commercial/ section:
//   - /commercial/                          (hub)
//   - /commercial/[segment]/                (6 segment hubs)
//   - /commercial/[city]/[segment]/         (60 city × segment combos)
//   - /commercial/get-quote/                (B2B form)
//
// Standalone HTML — does not touch React SPA. Idempotent.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'dist', 'public');
const PHONE = '+18663509407';
const PHONE_DISPLAY = '(866) 350-9407';

// ─── Data ──────────────────────────────────────────────────────────────
const SEGMENTS = [
  {
    slug: 'medical-office-cleaning',
    name: 'Medical & Dental Offices',
    short: 'Medical Office',
    icon: '🩺',
    title: 'Medical & Dental Office Cleaning',
    h1: 'HIPAA-Aware Medical & Dental Office Cleaning',
    metaDesc: 'Trusted medical and dental office cleaning across Atlanta Metro. Insured, background-checked, infection-control trained. Daily, nightly, weekly schedules available.',
    keyword: 'medical office cleaning',
    tagline: 'Infection control. Patient safety. Zero disruption.',
    services: [
      'Exam rooms terminal cleaning',
      'Waiting area & reception sanitization',
      'Restroom deep clean & restocking',
      'Reception desk & touch-point disinfection',
      'Floor care (vinyl, carpet, tile)',
      'Trash & medical waste segregation handling',
      'Window & glass cleaning',
      'Inventory of supplies'
    ],
    compliance: 'Our team is trained on bloodborne pathogen safety, color-coded microfiber protocols, and HIPAA-aware procedures (we never touch patient files or computers). We follow CDC guidelines for healthcare facility cleaning.',
    faq: [
      ['Are you HIPAA compliant?', 'We are HIPAA-aware and trained to operate respectfully in a medical environment. We never access patient records, charts, or computer systems. All staff sign confidentiality agreements before stepping foot in a healthcare facility.'],
      ['Can you clean after hours?', 'Yes — most of our medical clients prefer evening or early-morning service so we never interrupt patient flow. We offer service from 6 PM to 6 AM, seven days a week.'],
      ['What about biohazard cleanup?', 'We handle routine medical waste segregation as part of standard service. For active biohazard remediation, we partner with certified specialists.'],
      ['Do you bring your own supplies?', 'Yes — hospital-grade EPA-registered disinfectants, color-coded microfiber, and HEPA-filter vacuums. You only need to provide trash liners if you have a specific brand preference.'],
      ['How quickly can you start?', 'For most practices we can start within 5 business days of contract signing. Trial cleanings can be scheduled within 48 hours.'],
      ['What insurance do you carry?', 'General Liability $1,000,000 per occurrence, Products/Completed Operations $2,000,000 aggregate, Personal & Advertising Injury $1,000,000. Certificate of Insurance available on request and we can name your practice as Additional Insured.']
    ]
  },
  {
    slug: 'office-cleaning',
    name: 'Corporate Offices',
    short: 'Office',
    icon: '🏢',
    title: 'Corporate Office Cleaning',
    h1: 'Corporate Office Cleaning Built for Productive Teams',
    metaDesc: 'Reliable corporate office cleaning across Atlanta Metro. Fully insured, background-checked staff, flexible nightly and weekly schedules. Get a quote in 60 seconds.',
    keyword: 'office cleaning services',
    tagline: 'Spotless desks. Healthier teams. Zero excuses.',
    services: [
      'Workstations & desk surface wiping',
      'Conference room reset & whiteboard cleaning',
      'Kitchen & break room sanitization',
      'Restroom deep clean & restocking',
      'Reception & lobby presentation',
      'Floor care (vacuum, mop, polish)',
      'Trash & recycling removal',
      'Glass partition & window cleaning'
    ],
    compliance: 'Our process follows ISSA (International Sanitary Supply Association) cleaning standards. Every team member is background-checked, uniformed, and supervised on every shift.',
    faq: [
      ['Do you clean during business hours or after?', 'Both options available. Most corporate clients prefer after-hours (6 PM–6 AM) so productivity stays uninterrupted. Day porter service available for high-traffic offices.'],
      ['Minimum office size?', 'No minimum. We service spaces from 1,000 sqft single-suite offices to 50,000+ sqft multi-floor headquarters.'],
      ['Do you sign service contracts?', 'Yes — typically 12-month service agreements with 30-day cancellation. No long-term lock-in.'],
      ['Can you handle multiple locations?', 'Absolutely. Multi-site discounts apply automatically when you contract 3+ locations.'],
      ['What if my regular cleaner is sick?', 'We always have backup staff available within 24 hours. You will never be left without service.'],
      ['What insurance do you carry?', 'General Liability $1,000,000 per occurrence, Products/Completed Operations $2,000,000 aggregate. We can add your company as Additional Insured at no cost.']
    ]
  },
  {
    slug: 'daycare-cleaning',
    name: 'Daycares & Preschools',
    short: 'Daycare',
    icon: '🧸',
    title: 'Daycare & Preschool Cleaning',
    h1: 'Daycare & Preschool Cleaning Parents Trust',
    metaDesc: 'Daily daycare and preschool cleaning across Atlanta Metro. Child-safe products, strict toy sanitization, allergy-aware. Background-checked staff, fully insured.',
    keyword: 'daycare cleaning services',
    tagline: 'Safe products. Spotless toys. Peace of mind for parents.',
    services: [
      'Toy & soft surface sanitization (daily)',
      'Cribs, mats & nap area cleaning',
      'Restroom & diaper changing station deep clean',
      'Kitchen & feeding area sanitization',
      'Floor mop & vacuum (allergen-controlled)',
      'High-touch surface disinfection',
      'Trash & diaper waste removal',
      'Play yard equipment wipe down'
    ],
    compliance: 'We exclusively use EPA-registered, child-safe disinfectants — no harsh chemicals, no strong fragrances. Our staff is trained on CDC childcare facility guidelines and undergoes annual background checks.',
    faq: [
      ['Are your products safe for children?', 'Yes. We use EPA-registered disinfectants that are safe for use around children, including hydrogen peroxide-based and quat-free formulas. No bleach or harsh fragrances near play areas.'],
      ['Do you clean while kids are present?', 'Most daycares prefer cleaning after closing (6 PM–6 AM). We can also do midday touch-ups in unoccupied rooms if needed.'],
      ['Are your staff background-checked?', 'Every team member passes a national background check before stepping foot in a childcare facility. No exceptions. We comply with Georgia Bright from the Start guidelines.'],
      ['How do you handle outbreaks (flu, hand-foot-mouth)?', 'We can deploy enhanced sanitization within 24 hours, including electrostatic spraying and full toy/surface decontamination.'],
      ['Do you provide proof of insurance?', 'Yes — Certificate of Insurance with $1M General Liability, $2M Products/Completed Operations. We can name your facility as Additional Insured at no cost.'],
      ['What does pricing look like?', 'Daycare pricing ranges from $0.08–$0.15 per square foot per visit depending on frequency and services. Most centers spend $800–$2,500/month.']
    ]
  },
  {
    slug: 'gym-fitness-cleaning',
    name: 'Gyms & Fitness Studios',
    short: 'Gym',
    icon: '💪',
    title: 'Gym & Fitness Studio Cleaning',
    h1: 'Gym & Fitness Studio Cleaning That Members Notice',
    metaDesc: 'Daily gym and fitness studio cleaning across Atlanta Metro. Equipment sanitization, locker room deep clean, sweat-free floors. Insured, reliable, fast.',
    keyword: 'gym cleaning services',
    tagline: 'Sparkling equipment. Fresh locker rooms. Members keep coming back.',
    services: [
      'Cardio & strength equipment sanitization',
      'Free weight area & rubber floor cleaning',
      'Locker room deep clean & shower disinfection',
      'Mirror & glass cleaning',
      'Studio floor mopping (between classes)',
      'Restroom & vanity cleaning',
      'Trash & towel removal',
      'High-touch sanitization (door handles, cardio screens)'
    ],
    compliance: 'We use gym-safe disinfectants that won\'t damage rubber floors, vinyl benches, or cardio equipment touchscreens. Our team follows ISSA cleaning standards and we are fully insured.',
    faq: [
      ['Can you clean while we are open?', 'We offer overnight cleaning (10 PM–5 AM) to avoid disrupting members. Day porter service available for boutique studios that need touch-ups between classes.'],
      ['Do you handle locker rooms and showers?', 'Yes — full deep cleaning including shower tile descaling, mold prevention, and locker disinfection. Mold-resistant treatment available.'],
      ['What about boutique studios with no shower?', 'We offer simplified packages starting at $400/month for studios under 2,000 sqft.'],
      ['How often should a gym be cleaned?', 'Most gyms benefit from nightly service. Boutique studios can do well with 3–5x per week depending on traffic.'],
      ['Are you insured?', 'Yes — $1M General Liability, $2M Products/Completed Operations. Certificate available on request.'],
      ['Can you handle multi-location gym chains?', 'Absolutely. We service multi-location franchises with consolidated billing and a dedicated account manager.']
    ]
  },
  {
    slug: 'school-cleaning',
    name: 'Schools',
    short: 'School',
    icon: '🎒',
    title: 'School Cleaning Services',
    h1: 'School Cleaning That Keeps Students Healthy',
    metaDesc: 'Reliable K-12 school cleaning across Atlanta Metro. EPA-registered disinfectants, allergen control, after-hours scheduling. Insured and background-checked.',
    keyword: 'school cleaning services',
    tagline: 'Healthier classrooms. Fewer sick days. Trusted by educators.',
    services: [
      'Classroom desk & surface sanitization',
      'Cafeteria deep clean & sanitization',
      'Restroom deep clean & restocking',
      'Hallway & locker area cleaning',
      'Gymnasium & multi-purpose room',
      'Library & computer lab',
      'Office & administrative areas',
      'Trash & recycling removal'
    ],
    compliance: 'We follow CDC and EPA guidelines for school facility cleaning. Color-coded microfiber prevents cross-contamination between classrooms and restrooms. All staff are background-checked and fingerprinted as required by Georgia school facility standards.',
    faq: [
      ['Do you clean after school hours?', 'Yes — typical schedule is 4 PM–11 PM during school days. Weekends and breaks available for deep cleaning projects.'],
      ['Are your staff background-checked?', 'Yes — including fingerprinting, national background check, and drug screening. We comply with Georgia school facility staff requirements.'],
      ['Do you handle cafeterias?', 'Yes — including kitchen prep area sanitization, cafeteria table & floor cleaning, and walk-in cooler exterior wipedown. We follow ServSafe sanitation guidelines.'],
      ['What products do you use?', 'EPA-registered disinfectants safe for use in education settings. No harsh fragrances or bleach in classrooms.'],
      ['Can you handle private schools, charter, and public?', 'Yes — all three. We work with elementary, middle, and high schools, both public and private.'],
      ['Do you offer summer deep cleaning?', 'Yes — full summer reset including stripping and waxing floors, carpet extraction, deep restroom restoration, and HVAC vent cleaning.']
    ]
  },
  {
    slug: 'church-cleaning',
    name: 'Churches & Worship Facilities',
    short: 'Church',
    icon: '⛪',
    title: 'Church & Worship Facility Cleaning',
    h1: 'Church & Worship Facility Cleaning Done Right',
    metaDesc: 'Affordable, respectful church and worship facility cleaning across Atlanta Metro. Sanctuary, fellowship hall, classrooms, restrooms. Weekly and event-based service.',
    keyword: 'church cleaning services',
    tagline: 'Respectful service. Spotless sanctuary. Budget-friendly schedules.',
    services: [
      'Sanctuary pew & aisle cleaning',
      'Fellowship hall floor & table reset',
      'Restroom deep clean & restocking',
      'Children\'s ministry classroom sanitization',
      'Kitchen & coffee station',
      'Lobby & welcome area',
      'Office cleaning',
      'Trash & recycling removal'
    ],
    compliance: 'We work respectfully and quietly in worship spaces. Our team is uniformed, background-checked, and trained to handle sacred items with care. Insurance and bonding included.',
    faq: [
      ['When do you clean?', 'Most churches prefer Monday morning (post-Sunday cleanup) and mid-week (Wednesday or Thursday) before evening services. We work around your schedule.'],
      ['Can you handle event cleanups (weddings, funerals)?', 'Yes — same-day event cleanup available. We can also provide set-up and tear-down assistance.'],
      ['Do you offer non-profit pricing?', 'Yes — churches and registered 501(c)(3) organizations receive discounted rates compared to commercial accounts.'],
      ['What about the children\'s ministry rooms?', 'Full sanitization with child-safe EPA-registered products. We follow daycare-grade protocols since these rooms are used by infants and young children.'],
      ['Do you handle large auditoriums/sanctuaries?', 'Yes — including multi-thousand seat sanctuaries with theatre-style seating. We have equipment for rapid pew & seat cleaning between services.'],
      ['Are you insured?', 'Yes — $1M General Liability, $2M Products/Completed Operations. Certificate of Insurance available on request.']
    ]
  }
];

const CITIES = [
  { slug: 'atlanta', name: 'Atlanta', zip: '30303', lat: '33.7490', lon: '-84.3880' },
  { slug: 'marietta', name: 'Marietta', zip: '30067', lat: '33.9526', lon: '-84.5499' },
  { slug: 'alpharetta', name: 'Alpharetta', zip: '30009', lat: '34.0754', lon: '-84.2941' },
  { slug: 'roswell', name: 'Roswell', zip: '30075', lat: '34.0232', lon: '-84.3616' },
  { slug: 'sandy-springs', name: 'Sandy Springs', zip: '30328', lat: '33.9304', lon: '-84.3733' },
  { slug: 'buckhead', name: 'Buckhead', zip: '30305', lat: '33.8484', lon: '-84.3781' },
  { slug: 'brookhaven', name: 'Brookhaven', zip: '30319', lat: '33.8651', lon: '-84.3366' },
  { slug: 'dunwoody', name: 'Dunwoody', zip: '30338', lat: '33.9462', lon: '-84.3346' },
  { slug: 'johns-creek', name: 'Johns Creek', zip: '30097', lat: '34.0289', lon: '-84.1986' },
  { slug: 'kennesaw', name: 'Kennesaw', zip: '30144', lat: '34.0234', lon: '-84.6155' }
];

// ─── Shared HTML chunks ────────────────────────────────────────────────
const HEAD_BASE = (title, desc, canonical, ogImage) => `<!DOCTYPE html>
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
  <meta property="og:image" content="${ogImage || 'https://santoscsolutions.com/images/santos-logo.png'}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JVX5JNXLT3"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-JVX5JNXLT3');
  </script>`;

const STYLES = `<style>
  *,*::before,*::after{box-sizing:border-box}
  html,body{margin:0;padding:0;font-family:'Inter',-apple-system,system-ui,sans-serif;background:#0a0a0a;color:#fff;-webkit-font-smoothing:antialiased;line-height:1.6}
  a{color:#facc15;text-decoration:none}
  a:hover{text-decoration:underline}
  .wrap{max-width:1100px;margin:0 auto;padding:0 20px}
  /* Nav */
  nav.top{position:sticky;top:0;background:rgba(10,10,10,.95);backdrop-filter:blur(8px);border-bottom:1px solid #1a1a1a;z-index:50;padding:14px 20px}
  nav.top .nav-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px}
  nav.top .brand{display:flex;align-items:center;gap:10px;color:#fff;font-weight:800;font-size:18px}
  nav.top .brand img{height:32px}
  nav.top .links{display:flex;gap:24px;align-items:center;flex-wrap:wrap}
  nav.top .links a{color:#cfcfcf;font-size:14px;font-weight:500}
  nav.top .links a:hover{color:#facc15;text-decoration:none}
  nav.top .cta{background:#facc15;color:#0a0a0a !important;padding:10px 18px;border-radius:8px;font-weight:600;font-size:14px}
  @media(max-width:768px){nav.top .links{display:none}nav.top .cta{display:inline-block}}
  /* Hero */
  .hero{padding:80px 0 60px;background:radial-gradient(ellipse at top,#1a1a1a 0%,#0a0a0a 60%)}
  .hero h1{font-size:46px;line-height:1.1;margin:0 0 16px;font-weight:800;letter-spacing:-0.02em}
  .hero .tagline{font-size:20px;color:#facc15;margin:0 0 24px;font-weight:500}
  .hero .sub{font-size:18px;color:#a0a0a0;max-width:680px;margin:0 0 32px}
  .hero .actions{display:flex;gap:16px;flex-wrap:wrap}
  .btn{display:inline-block;padding:16px 28px;border-radius:10px;font-weight:600;font-size:16px;text-align:center;transition:transform .1s,opacity .15s}
  .btn:hover{text-decoration:none;transform:translateY(-1px)}
  .btn-primary{background:#facc15;color:#0a0a0a !important}
  .btn-secondary{background:transparent;color:#fff !important;border:1px solid #2a2a2a}
  @media(max-width:768px){.hero{padding:48px 0 40px}.hero h1{font-size:32px}}
  /* Trust bar */
  .trust-bar{background:#0d0d0d;border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a;padding:24px 0}
  .trust-bar .items{display:flex;justify-content:center;gap:48px;flex-wrap:wrap;color:#a0a0a0;font-size:14px}
  .trust-bar .items span{display:flex;align-items:center;gap:6px}
  .trust-bar .items span::before{content:'✓';color:#22c55e;font-weight:700}
  /* Sections */
  section{padding:64px 0}
  section h2{font-size:34px;margin:0 0 16px;font-weight:700;letter-spacing:-0.01em}
  section h3{font-size:22px;margin:24px 0 12px;font-weight:600}
  section p{font-size:16px;color:#cfcfcf;max-width:760px}
  .card{background:#121212;border:1px solid #1f1f1f;border-radius:14px;padding:28px}
  .grid{display:grid;gap:20px}
  .grid-2{grid-template-columns:repeat(2,1fr)}
  .grid-3{grid-template-columns:repeat(3,1fr)}
  .grid-6{grid-template-columns:repeat(3,1fr);gap:18px}
  @media(max-width:768px){.grid-2,.grid-3,.grid-6{grid-template-columns:1fr}}
  .seg-card{background:#121212;border:1px solid #1f1f1f;border-radius:14px;padding:28px;transition:border-color .15s,transform .15s;display:block;color:#fff}
  .seg-card:hover{border-color:#facc15;transform:translateY(-2px);text-decoration:none}
  .seg-card .icon{font-size:36px;margin-bottom:12px}
  .seg-card h3{margin:0 0 8px;font-size:20px;color:#fff}
  .seg-card p{margin:0;color:#a0a0a0;font-size:14px}
  .checklist{list-style:none;padding:0;margin:16px 0}
  .checklist li{padding:10px 0 10px 28px;border-bottom:1px solid #1a1a1a;color:#cfcfcf;position:relative}
  .checklist li::before{content:'✓';position:absolute;left:0;color:#22c55e;font-weight:700}
  .checklist li:last-child{border-bottom:0}
  .faq{margin:16px 0}
  .faq details{background:#121212;border:1px solid #1f1f1f;border-radius:10px;padding:18px 22px;margin-bottom:10px;cursor:pointer}
  .faq details[open]{border-color:#2a2a2a}
  .faq summary{font-weight:600;color:#fff;list-style:none;outline:none}
  .faq summary::after{content:'+';float:right;color:#facc15;font-weight:700;font-size:20px}
  .faq details[open] summary::after{content:'−'}
  .faq p{margin:14px 0 0;color:#cfcfcf}
  /* CTA section */
  .cta-block{background:linear-gradient(135deg,#facc15 0%,#fde047 100%);color:#0a0a0a;padding:48px 32px;border-radius:16px;text-align:center;margin:48px 0}
  .cta-block h2{color:#0a0a0a;margin:0 0 12px;font-size:30px}
  .cta-block p{color:#1a1a1a;margin:0 0 24px;max-width:560px;margin-left:auto;margin-right:auto}
  .cta-block .btn-dark{background:#0a0a0a;color:#facc15 !important}
  /* Footer */
  footer{background:#070707;border-top:1px solid #1a1a1a;padding:48px 0 32px;margin-top:64px}
  footer .cols{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;margin-bottom:32px}
  @media(max-width:768px){footer .cols{grid-template-columns:1fr 1fr}}
  footer h4{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#facc15;margin:0 0 14px}
  footer ul{list-style:none;padding:0;margin:0}
  footer li{padding:5px 0}
  footer a{color:#a0a0a0;font-size:14px}
  footer a:hover{color:#fff;text-decoration:none}
  footer .legal{border-top:1px solid #1a1a1a;padding-top:24px;text-align:center;color:#666;font-size:13px}
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

const TRUST_BAR = `<div class="trust-bar"><div class="wrap"><div class="items">
  <span>$1M General Liability</span>
  <span>$2M Products / Completed Ops</span>
  <span>Background-checked staff</span>
  <span>Licensed & Bonded</span>
  <span>EPA-registered products</span>
</div></div></div>`;

const FOOTER = `<footer><div class="wrap">
  <div class="cols">
    <div>
      <h4>Santos Cleaning</h4>
      <p style="color:#a0a0a0;font-size:14px;margin:0">Atlanta Metro's trusted cleaning partner — residential and commercial. Insured, background-checked, reliable.</p>
      <p style="margin-top:12px;font-size:14px"><a href="tel:${PHONE}">${PHONE_DISPLAY}</a></p>
    </div>
    <div>
      <h4>Commercial Services</h4>
      <ul>
        ${SEGMENTS.map(s => `<li><a href="/commercial/${s.slug}/">${s.name}</a></li>`).join('\n        ')}
      </ul>
    </div>
    <div>
      <h4>Service Areas</h4>
      <ul>
        ${CITIES.slice(0, 6).map(c => `<li><a href="/${c.slug}-house-cleaning/">${c.name}</a></li>`).join('\n        ')}
      </ul>
    </div>
    <div>
      <h4>Company</h4>
      <ul>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/commercial/get-quote/">Commercial Quote</a></li>
        <li><a href="/get-quote/">Residential Quote</a></li>
        <li><a href="/legal/privacy-policy/">Privacy Policy</a></li>
      </ul>
    </div>
  </div>
  <div class="legal">© 2026 Santos Cleaning Solutions LLC. All rights reserved. Licensed, bonded & insured.</div>
</div></footer>`;

const SCHEMA_LOCAL_BUSINESS = (segment, city) => {
  const id = city
    ? `https://santoscsolutions.com/commercial/${city.slug}/${segment.slug}/#business`
    : `https://santoscsolutions.com/commercial/${segment.slug}/#business`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': id,
        name: 'Santos Cleaning Solutions',
        image: 'https://santoscsolutions.com/images/santos-logo.png',
        url: city
          ? `https://santoscsolutions.com/commercial/${city.slug}/${segment.slug}/`
          : `https://santoscsolutions.com/commercial/${segment.slug}/`,
        telephone: PHONE,
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '595 Harcourt Pl SE',
          addressLocality: city ? city.name : 'Marietta',
          addressRegion: 'GA',
          postalCode: city ? city.zip : '30067',
          addressCountry: 'US'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: city ? city.lat : '33.9526',
          longitude: city ? city.lon : '-84.5499'
        },
        areaServed: city ? { '@type': 'City', name: city.name } : CITIES.map(c => ({ '@type': 'City', name: c.name })),
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59'
        }
      },
      {
        '@type': 'Service',
        serviceType: segment.title,
        provider: { '@id': id },
        areaServed: city ? { '@type': 'City', name: city.name } : { '@type': 'AdministrativeArea', name: 'Atlanta Metro' },
        description: segment.metaDesc
      },
      {
        '@type': 'FAQPage',
        mainEntity: segment.faq.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a }
        }))
      }
    ]
  };
};

// ─── Page builders ─────────────────────────────────────────────────────
function buildHubPage() {
  const title = 'Commercial Cleaning Services Atlanta | Santos Cleaning Solutions';
  const desc = 'Atlanta Metro\'s trusted commercial cleaning partner — medical offices, corporate offices, daycares, gyms, schools, churches. Insured, background-checked, reliable.';
  const canonical = 'https://santoscsolutions.com/commercial/';

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': 'https://santoscsolutions.com/commercial/#business',
        name: 'Santos Cleaning Solutions — Commercial',
        image: 'https://santoscsolutions.com/images/santos-logo.png',
        url: canonical,
        telephone: PHONE,
        priceRange: '$$',
        address: { '@type': 'PostalAddress', streetAddress: '595 Harcourt Pl SE', addressLocality: 'Marietta', addressRegion: 'GA', postalCode: '30067', addressCountry: 'US' },
        geo: { '@type': 'GeoCoordinates', latitude: '33.9526', longitude: '-84.5499' },
        areaServed: CITIES.map(c => ({ '@type': 'City', name: c.name }))
      }
    ]
  };

  return `${HEAD_BASE(title, desc, canonical)}
  ${STYLES}
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  ${NAV}
  <section class="hero">
    <div class="wrap">
      <h1>Commercial Cleaning Services in Atlanta Metro</h1>
      <p class="tagline">Insured. Background-checked. Reliable.</p>
      <p class="sub">From medical offices to daycares, corporate suites to fitness studios — Santos Cleaning Solutions delivers professional janitorial service across the entire Atlanta Metro area. One trusted partner. Six segments. Zero excuses.</p>
      <div class="actions">
        <a href="/commercial/get-quote/" class="btn btn-primary">Get a Free Commercial Quote →</a>
        <a href="tel:${PHONE}" class="btn btn-secondary">Call ${PHONE_DISPLAY}</a>
      </div>
    </div>
  </section>
  ${TRUST_BAR}
  <section>
    <div class="wrap">
      <h2>Built for Every Type of Business</h2>
      <p>We service six commercial segments across Atlanta Metro — each with its own protocols, products, and trained team. Pick yours below to learn more.</p>
      <div class="grid grid-6" style="margin-top:32px">
        ${SEGMENTS.map(s => `
        <a href="/commercial/${s.slug}/" class="seg-card">
          <div class="icon">${s.icon}</div>
          <h3>${s.name}</h3>
          <p>${s.tagline}</p>
        </a>`).join('')}
      </div>
    </div>
  </section>
  <section style="background:#0d0d0d">
    <div class="wrap">
      <h2>Why Atlanta Businesses Choose Santos</h2>
      <div class="grid grid-3" style="margin-top:32px">
        <div class="card"><h3 style="color:#facc15;margin-top:0">Fully Insured</h3><p>$1M General Liability. $2M Products & Completed Operations. $1M Personal & Advertising Injury. We name your business as Additional Insured at no cost.</p></div>
        <div class="card"><h3 style="color:#facc15;margin-top:0">Background-Checked Team</h3><p>Every team member passes a national background check. Uniformed, supervised, and trained on commercial cleaning standards before stepping foot on your property.</p></div>
        <div class="card"><h3 style="color:#facc15;margin-top:0">Flexible Scheduling</h3><p>Daily, nightly, weekly, bi-weekly, monthly — or one-time deep cleans. We work around your business hours so productivity is never interrupted.</p></div>
        <div class="card"><h3 style="color:#facc15;margin-top:0">EPA-Registered Products</h3><p>Hospital-grade disinfectants, color-coded microfiber to prevent cross-contamination, HEPA-filter vacuums for allergen control.</p></div>
        <div class="card"><h3 style="color:#facc15;margin-top:0">Local & Responsive</h3><p>We are based in Marietta and serve all of Atlanta Metro. Same-day callbacks, fast quotes, and a dedicated account manager for multi-location accounts.</p></div>
        <div class="card"><h3 style="color:#facc15;margin-top:0">No Long-Term Lock-In</h3><p>Standard 12-month service agreements with 30-day cancellation. Fair, flexible, and built on trust — not contracts.</p></div>
      </div>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="cta-block">
        <h2>Get a Free Commercial Cleaning Quote</h2>
        <p>Tell us about your space and we will get back to you within one business hour with a custom quote. No obligation, no pressure.</p>
        <a href="/commercial/get-quote/" class="btn btn-dark">Start My Quote →</a>
      </div>
    </div>
  </section>
  ${FOOTER}
</body>
</html>`;
}

function buildSegmentPage(segment, city = null) {
  const cityName = city ? city.name : 'Atlanta';
  const cityPart = city ? ` in ${city.name}` : ' in Atlanta';
  // Build title with length budget — prefer full segment title, fall back to short
  let title;
  if (city) {
    const full = `${segment.title} in ${city.name}, GA | Santos Cleaning`;
    title = full.length <= 72 ? full : `${segment.short} Cleaning in ${city.name}, GA | Santos Cleaning`;
  } else {
    title = `${segment.title} Atlanta | Santos Cleaning`;
  }
  const desc = city
    ? segment.metaDesc.replace('Atlanta Metro', city.name).slice(0, 158)
    : segment.metaDesc;
  const canonical = city
    ? `https://santoscsolutions.com/commercial/${city.slug}/${segment.slug}/`
    : `https://santoscsolutions.com/commercial/${segment.slug}/`;

  // City-specific H1: clean, no duplications. Format: "{Title} in {City}, GA"
  const h1 = city
    ? `${segment.title} in ${city.name}, GA`
    : segment.h1;

  const schema = SCHEMA_LOCAL_BUSINESS(segment, city);

  // Nearby cities for internal linking
  const nearbyCities = city
    ? CITIES.filter(c => c.slug !== city.slug).slice(0, 5)
    : CITIES.slice(0, 5);
  const otherSegments = SEGMENTS.filter(s => s.slug !== segment.slug).slice(0, 5);

  return `${HEAD_BASE(title, desc, canonical)}
  ${STYLES}
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  ${NAV}
  <section class="hero">
    <div class="wrap">
      <p style="color:#facc15;font-size:14px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 12px">${city ? `${city.name} • ` : ''}Commercial Cleaning</p>
      <h1>${h1}</h1>
      <p class="tagline">${segment.tagline}</p>
      <p class="sub">Santos Cleaning Solutions delivers professional ${segment.short.toLowerCase()} cleaning${cityPart}, GA. Fully insured, background-checked teams, EPA-registered products, and flexible scheduling that fits your business.</p>
      <div class="actions">
        <a href="/commercial/get-quote/" class="btn btn-primary">Get a Free Quote →</a>
        <a href="tel:${PHONE}" class="btn btn-secondary">Call ${PHONE_DISPLAY}</a>
      </div>
    </div>
  </section>
  ${TRUST_BAR}
  <section>
    <div class="wrap">
      <div class="grid grid-2">
        <div>
          <h2>What's Included in Our ${segment.short} Cleaning Service</h2>
          <p>Every ${segment.short.toLowerCase()} cleaning visit follows a written checklist tailored to your facility. No corners cut, no surprises.</p>
          <ul class="checklist">
            ${segment.services.map(s => `<li>${s}</li>`).join('\n            ')}
          </ul>
        </div>
        <div class="card">
          <h3 style="margin-top:0;color:#facc15">Compliance & Training</h3>
          <p style="color:#cfcfcf">${segment.compliance}</p>
          <h3 style="color:#facc15">Insurance Coverage</h3>
          <ul style="color:#cfcfcf;padding-left:20px;margin:8px 0">
            <li>General Liability — $1,000,000 per occurrence</li>
            <li>Products & Completed Operations — $2,000,000</li>
            <li>Personal & Advertising Injury — $1,000,000</li>
            <li>Premises Rented to You — $100,000</li>
            <li>Medical Expenses — $5,000</li>
          </ul>
          <p style="color:#a0a0a0;font-size:14px;margin-top:12px">Certificate of Insurance available on request. We can name your facility as Additional Insured at no cost.</p>
        </div>
      </div>
    </div>
  </section>
  <section style="background:#0d0d0d">
    <div class="wrap">
      <h2>How It Works</h2>
      <div class="grid grid-3" style="margin-top:32px">
        <div class="card"><h3 style="color:#facc15;margin-top:0">1. Free Walkthrough</h3><p>We visit your facility, measure square footage, identify your priority areas, and listen to your specific needs.</p></div>
        <div class="card"><h3 style="color:#facc15;margin-top:0">2. Custom Quote</h3><p>You receive a detailed written quote within 24 hours — no hidden fees, no surprises. Includes scope, frequency, and pricing.</p></div>
        <div class="card"><h3 style="color:#facc15;margin-top:0">3. Trial Clean (Optional)</h3><p>Want to see us in action first? We offer a one-time trial clean before any contract is signed. Zero risk.</p></div>
      </div>
    </div>
  </section>
  <section>
    <div class="wrap">
      <h2>Frequently Asked Questions</h2>
      <div class="faq">
        ${segment.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n        ')}
      </div>
    </div>
  </section>
  ${city ? `
  <section style="background:#0d0d0d">
    <div class="wrap">
      <h2>${segment.short} Cleaning Across Atlanta Metro</h2>
      <p>We also serve these nearby cities with the same ${segment.short.toLowerCase()} cleaning service.</p>
      <div class="grid grid-3" style="margin-top:24px">
        ${nearbyCities.map(c => `<a href="/commercial/${c.slug}/${segment.slug}/" class="seg-card"><h3>${segment.short} Cleaning in ${c.name}</h3><p>Servicing ${c.name}, GA ${c.zip}</p></a>`).join('\n        ')}
      </div>
    </div>
  </section>` : `
  <section style="background:#0d0d0d">
    <div class="wrap">
      <h2>${segment.short} Cleaning by City</h2>
      <p>We service ${segment.short.toLowerCase()} cleaning across the entire Atlanta Metro area.</p>
      <div class="grid grid-3" style="margin-top:24px">
        ${CITIES.slice(0, 6).map(c => `<a href="/commercial/${c.slug}/${segment.slug}/" class="seg-card"><h3>${segment.short} Cleaning in ${c.name}</h3><p>${c.name}, GA ${c.zip}</p></a>`).join('\n        ')}
      </div>
    </div>
  </section>`}
  <section>
    <div class="wrap">
      <h2>Other Commercial Services${city ? ` in ${city.name}` : ''}</h2>
      <div class="grid grid-3" style="margin-top:24px">
        ${otherSegments.map(s => `<a href="/commercial/${city ? `${city.slug}/` : ''}${s.slug}/" class="seg-card"><div class="icon">${s.icon}</div><h3>${s.name}</h3><p>${s.tagline}</p></a>`).join('\n        ')}
      </div>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="cta-block">
        <h2>Ready for a Free ${segment.short} Cleaning Quote?</h2>
        <p>Tell us about your${city ? ` ${city.name}` : ''} ${segment.short.toLowerCase()} space and we will get back to you within one business hour. No obligation, no pressure.</p>
        <a href="/commercial/get-quote/" class="btn btn-dark">Start My Quote →</a>
      </div>
    </div>
  </section>
  ${FOOTER}
  <script src="/assets/scs-cta.js" defer></script>
</body>
</html>`;
}

// ─── Form page ─────────────────────────────────────────────────────────
function buildFormPage() {
  const title = 'Get a Free Commercial Cleaning Quote | Santos Cleaning Solutions';
  const desc = 'Get a free commercial cleaning quote in 60 seconds. Atlanta Metro\'s trusted commercial cleaning partner. Insured, background-checked, reliable.';
  const canonical = 'https://santoscsolutions.com/commercial/get-quote/';
  return `${HEAD_BASE(title, desc, canonical)}
  ${STYLES}
  <style>
    .form-wrap{max-width:640px;margin:0 auto;padding:40px 20px 80px}
    .form-wrap h1{font-size:32px;margin:0 0 8px}
    .form-wrap .sub{color:#a0a0a0;margin:0 0 24px}
    .progress{display:flex;gap:6px;margin-bottom:24px}
    .progress div{flex:1;height:4px;background:#222;border-radius:2px;transition:background .3s}
    .progress div.active{background:#facc15}
    .step{display:none}
    .step.active{display:block;animation:fade .25s ease-out}
    @keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .step h2{font-size:22px;margin:0 0 16px;font-weight:600}
    label{display:block;font-size:13px;color:#cfcfcf;margin:14px 0 6px;font-weight:500}
    input,select,textarea{width:100%;padding:14px 16px;background:#171717;border:1px solid #2a2a2a;border-radius:10px;color:#fff;font-size:16px;font-family:inherit;transition:border-color .15s}
    input:focus,select:focus,textarea:focus{outline:none;border-color:#facc15}
    textarea{resize:vertical;min-height:90px}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .pill-group{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
    .pill{padding:10px 16px;background:#171717;border:1px solid #2a2a2a;border-radius:999px;cursor:pointer;font-size:14px;transition:all .15s;user-select:none}
    .pill.selected{background:#facc15;color:#0a0a0a;border-color:#facc15;font-weight:600}
    .actions{display:flex;gap:12px;margin-top:24px}
    button{flex:1;padding:14px 20px;border-radius:10px;border:none;cursor:pointer;font-size:15px;font-weight:600;font-family:inherit}
    button:active{transform:scale(.98)}
    .btn-primary{background:#facc15;color:#0a0a0a}
    .btn-secondary{background:transparent;color:#cfcfcf;border:1px solid #2a2a2a}
    button:disabled{opacity:.5;cursor:not-allowed}
    .honeypot{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
    .success{text-align:center;padding:32px 20px}
    .success svg{width:72px;height:72px;color:#22c55e;margin-bottom:16px}
    .success h2{font-size:26px;margin:0 0 8px}
    .success p{color:#a0a0a0;margin:0 0 16px}
    .error-msg{color:#ef4444;font-size:14px;margin-top:12px;display:none}
  </style>
</head>
<body>
  ${NAV}
  <div class="form-wrap">
    <h1>Free Commercial Cleaning Quote</h1>
    <p class="sub">5 quick questions. Custom quote within one business hour.</p>
    <div class="progress" id="progress"><div class="active"></div><div></div><div></div><div></div><div></div></div>
    <form id="quoteForm" novalidate>
      <input type="text" name="website" class="honeypot" tabindex="-1" autocomplete="off">

      <div class="step active" data-step="1">
        <h2>What type of facility?</h2>
        <div class="pill-group" data-field="segment">
          ${SEGMENTS.map((s, i) => `<div class="pill${i === 0 ? ' selected' : ''}" data-value="${s.slug.replace('-cleaning', '').replace('-fitness', '')}">${s.icon} ${s.short}</div>`).join('\n          ')}
        </div>
        <label>Company name *</label>
        <input type="text" name="company_name" required placeholder="Acme Medical Group">
        <div class="actions">
          <button type="button" class="btn-primary" data-next>Next →</button>
        </div>
      </div>

      <div class="step" data-step="2">
        <h2>Tell us about your space</h2>
        <label>Approximate square footage *</label>
        <select name="square_footage" required>
          <option value="">Select range</option>
          <option value="1000">Under 1,500 sqft</option>
          <option value="2500">1,500 – 3,500 sqft</option>
          <option value="5000">3,500 – 7,500 sqft</option>
          <option value="10000">7,500 – 15,000 sqft</option>
          <option value="20000">15,000 – 30,000 sqft</option>
          <option value="40000">30,000+ sqft</option>
        </select>
        <label>City</label>
        <input type="text" name="city" placeholder="Atlanta, Marietta, Roswell…">
        <div class="actions">
          <button type="button" class="btn-secondary" data-prev>← Back</button>
          <button type="button" class="btn-primary" data-next>Next →</button>
        </div>
      </div>

      <div class="step" data-step="3">
        <h2>How often do you need cleaning?</h2>
        <div class="pill-group" data-field="cleaning_frequency">
          <div class="pill selected" data-value="daily">Daily</div>
          <div class="pill" data-value="3x_week">3× per week</div>
          <div class="pill" data-value="weekly">Weekly</div>
          <div class="pill" data-value="biweekly">Bi-weekly</div>
          <div class="pill" data-value="monthly">Monthly</div>
        </div>
        <label>Preferred hours</label>
        <div class="pill-group" data-field="preferred_hours">
          <div class="pill selected" data-value="after_hours">After hours</div>
          <div class="pill" data-value="business_hours">Business hours</div>
          <div class="pill" data-value="early_morning">Early morning</div>
          <div class="pill" data-value="weekends">Weekends</div>
        </div>
        <div class="actions">
          <button type="button" class="btn-secondary" data-prev>← Back</button>
          <button type="button" class="btn-primary" data-next>Next →</button>
        </div>
      </div>

      <div class="step" data-step="4">
        <h2>Current situation</h2>
        <label>Do you currently have a cleaning company?</label>
        <input type="text" name="current_provider" placeholder="Company name (or leave blank)">
        <label>What's most important to you?</label>
        <textarea name="notes" placeholder="Reliability, pricing, eco-friendly products, after-hours flexibility..."></textarea>
        <div class="actions">
          <button type="button" class="btn-secondary" data-prev>← Back</button>
          <button type="button" class="btn-primary" data-next>Next →</button>
        </div>
      </div>

      <div class="step" data-step="5">
        <h2>How can we reach you?</h2>
        <label>Your name *</label>
        <input type="text" name="name" required autocomplete="name" placeholder="Jane Doe">
        <label>Office phone *</label>
        <input type="tel" name="phone" required autocomplete="tel" placeholder="(404) 555-1234">
        <label>Work email *</label>
        <input type="email" name="email" required autocomplete="email" placeholder="jane@company.com">
        <div class="actions">
          <button type="button" class="btn-secondary" data-prev>← Back</button>
          <button type="submit" class="btn-primary" id="submitBtn">Get My Quote</button>
        </div>
        <div class="error-msg" id="errMsg"></div>
      </div>

      <div class="step" data-step="6">
        <div class="success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          <h2>Thank you!</h2>
          <p>We received your request. A team member will contact you within the next business hour to confirm your free quote and schedule a walkthrough if needed.</p>
          <p style="font-size:14px;color:#facc15">Need it sooner? Call <a href="tel:${PHONE}" style="color:#facc15">${PHONE_DISPLAY}</a></p>
          <a href="/commercial/" class="btn-secondary" style="display:inline-block;padding:14px 24px;text-decoration:none;border-radius:10px;margin-top:16px">← Back to Commercial</a>
        </div>
      </div>
    </form>
  </div>
  ${FOOTER}
  <script>
  (function(){
    var form = document.getElementById('quoteForm');
    var steps = form.querySelectorAll('.step');
    var progress = document.getElementById('progress').children;
    var current = 1;
    var data = { segment: 'medical-office', cleaning_frequency: 'daily', preferred_hours: 'after_hours' };

    form.querySelectorAll('.pill-group').forEach(function(group){
      var field = group.dataset.field;
      var pills = group.querySelectorAll('.pill');
      var initial = group.querySelector('.pill.selected');
      if (initial) data[field] = initial.dataset.value;
      pills.forEach(function(p){
        p.addEventListener('click', function(){
          pills.forEach(function(x){x.classList.remove('selected')});
          p.classList.add('selected');
          data[field] = p.dataset.value;
        });
      });
    });

    function showStep(n){
      steps.forEach(function(s){
        s.classList.toggle('active', parseInt(s.dataset.step,10) === n);
      });
      for (var i = 0; i < progress.length; i++){
        progress[i].classList.toggle('active', i < n);
      }
      current = n;
      window.scrollTo({top:0, behavior:'smooth'});
    }

    function validateStep(n){
      if (n === 1 && (!form.company_name.value.trim() || form.company_name.value.trim().length < 2)){
        alert('Please enter your company name'); return false;
      }
      if (n === 2 && !form.square_footage.value){
        alert('Please select your square footage'); return false;
      }
      if (n === 5){
        if (!form.name.value.trim() || form.name.value.trim().length < 2){ alert('Please enter your name'); return false; }
        if (!form.phone.value.trim() || form.phone.value.trim().length < 7){ alert('Please enter a valid phone number'); return false; }
        if (!form.email.value.trim() || form.email.value.indexOf('@') === -1){ alert('Please enter a valid email'); return false; }
      }
      return true;
    }

    form.querySelectorAll('[data-next]').forEach(function(b){
      b.addEventListener('click', function(){
        if (!validateStep(current)) return;
        if (current < 5) showStep(current + 1);
      });
    });
    form.querySelectorAll('[data-prev]').forEach(function(b){
      b.addEventListener('click', function(){ if (current > 1) showStep(current - 1); });
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!validateStep(5)) return;
      var btn = document.getElementById('submitBtn');
      var err = document.getElementById('errMsg');
      err.style.display = 'none';
      btn.disabled = true;
      btn.textContent = 'Sending...';

      var payload = {
        lead_type: 'commercial',
        segment: data.segment,
        company_name: form.company_name.value,
        square_footage: form.square_footage.value,
        city: form.city.value,
        cleaning_frequency: data.cleaning_frequency,
        preferred_hours: data.preferred_hours,
        current_provider: form.current_provider.value,
        notes: form.notes.value,
        name: form.name.value,
        phone: form.phone.value,
        email: form.email.value,
        website: form.website.value
      };

      fetch('/api/lead-submit', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      })
      .then(function(r){ return r.json().then(function(j){ return {ok:r.ok, body:j}; }); })
      .then(function(res){
        if (res.ok){
          if (window.gtag) gtag('event','generate_lead',{form:'commercial_quote',segment:data.segment});
          showStep(6);
        } else {
          throw new Error((res.body && res.body.error) || 'Submission failed');
        }
      })
      .catch(function(e){
        err.textContent = 'Something went wrong. Please call ' + ${JSON.stringify(PHONE_DISPLAY)} + ' or try again.';
        err.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Get My Quote';
      });
    });
  })();
  </script>
</body>
</html>`;
}

// ─── Write all files ───────────────────────────────────────────────────
function writeFile(relPath, content) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

let written = 0;

// Hub
writeFile('commercial/index.html', buildHubPage());
written++;

// Segment hubs
for (const seg of SEGMENTS) {
  writeFile(`commercial/${seg.slug}/index.html`, buildSegmentPage(seg));
  written++;
}

// City × segment combos
for (const city of CITIES) {
  for (const seg of SEGMENTS) {
    writeFile(`commercial/${city.slug}/${seg.slug}/index.html`, buildSegmentPage(seg, city));
    written++;
  }
}

// Form page
writeFile('commercial/get-quote/index.html', buildFormPage());
written++;

console.log(JSON.stringify({
  written,
  segments: SEGMENTS.length,
  cities: CITIES.length,
  combos: CITIES.length * SEGMENTS.length,
  expected: 1 + SEGMENTS.length + CITIES.length * SEGMENTS.length + 1
}));
