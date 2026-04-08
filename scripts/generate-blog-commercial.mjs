// Generates 10 pillar B2B blog posts as static HTML under
// /blog/commercial/{slug}/ — each 2000+ words, schema Article + FAQPage,
// internal linking, idempotent. Standalone, no React.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { POSTS } from './blog-commercial-content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'dist', 'public');
const PHONE = '+18663509407';
const PHONE_DISPLAY = '(866) 350-9407';
const PUBLISH_DATE = '2026-04-08';
const AUTHOR = 'William Jesus';

// ─── Shared chunks (reuse commercial styles) ───────────────────────────
const HEAD = (title, desc, canonical, ogImage, keywords) => `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="${AUTHOR}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index,follow">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="article:published_time" content="${PUBLISH_DATE}T00:00:00Z">
  <meta property="article:author" content="${AUTHOR}">
  <meta property="article:section" content="Commercial Cleaning">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JVX5JNXLT3"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-JVX5JNXLT3');</script>`;

const STYLES = `<style>
  *,*::before,*::after{box-sizing:border-box}
  html,body{margin:0;padding:0;font-family:'Inter',-apple-system,system-ui,sans-serif;background:#0a0a0a;color:#fff;-webkit-font-smoothing:antialiased;line-height:1.7}
  a{color:#facc15;text-decoration:none}
  a:hover{text-decoration:underline}
  nav.top{position:sticky;top:0;background:rgba(10,10,10,.95);backdrop-filter:blur(8px);border-bottom:1px solid #1a1a1a;z-index:50;padding:14px 20px}
  nav.top .nav-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px}
  nav.top .brand{color:#fff;font-weight:800;font-size:18px}
  nav.top .links{display:flex;gap:24px;align-items:center;flex-wrap:wrap}
  nav.top .links a{color:#cfcfcf;font-size:14px;font-weight:500}
  nav.top .links a:hover{color:#facc15;text-decoration:none}
  nav.top .cta{background:#facc15;color:#0a0a0a !important;padding:10px 18px;border-radius:8px;font-weight:600;font-size:14px}
  @media(max-width:768px){nav.top .links{display:none}}
  article{max-width:760px;margin:0 auto;padding:48px 20px 80px}
  .crumbs{color:#666;font-size:13px;margin-bottom:16px}
  .crumbs a{color:#888}
  .category{display:inline-block;background:rgba(250,204,21,.1);color:#facc15;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px}
  article h1{font-size:40px;line-height:1.15;margin:0 0 16px;font-weight:800;letter-spacing:-0.02em}
  .meta{color:#888;font-size:14px;margin-bottom:32px;display:flex;gap:16px;flex-wrap:wrap;align-items:center}
  .meta::before{content:''}
  .meta span{display:inline-flex;align-items:center;gap:6px}
  article h2{font-size:28px;margin:48px 0 16px;font-weight:700;letter-spacing:-0.01em;scroll-margin-top:80px}
  article h3{font-size:22px;margin:32px 0 12px;font-weight:600}
  article p{font-size:17px;color:#d4d4d4;margin:0 0 20px}
  article ul,article ol{color:#d4d4d4;padding-left:24px;margin:0 0 24px}
  article li{margin-bottom:10px;line-height:1.7}
  article strong{color:#fff}
  article blockquote{border-left:3px solid #facc15;padding:8px 24px;margin:32px 0;background:rgba(250,204,21,.05);color:#e5e5e5;font-style:italic;border-radius:0 8px 8px 0}
  .toc{background:#121212;border:1px solid #1f1f1f;border-radius:12px;padding:24px 28px;margin:32px 0}
  .toc h3{margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.1em;color:#facc15}
  .toc ol{list-style:decimal;padding-left:24px;margin:0;color:#cfcfcf;font-size:15px}
  .toc ol li{margin-bottom:6px}
  .toc a{color:#cfcfcf}
  .callout{background:#0d0d0d;border:1px solid #2a2a2a;border-left:4px solid #facc15;padding:24px 28px;border-radius:8px;margin:32px 0}
  .callout strong{color:#facc15;display:block;margin-bottom:8px}
  .cta-inline{background:linear-gradient(135deg,#facc15 0%,#fde047 100%);color:#0a0a0a;padding:32px;border-radius:14px;text-align:center;margin:40px 0}
  .cta-inline h3{color:#0a0a0a;margin:0 0 8px;font-size:22px}
  .cta-inline p{color:#1a1a1a;margin:0 0 16px}
  .cta-inline a{background:#0a0a0a;color:#facc15 !important;padding:12px 24px;border-radius:8px;font-weight:600;display:inline-block}
  .faq{margin:24px 0}
  .faq details{background:#121212;border:1px solid #1f1f1f;border-radius:10px;padding:18px 22px;margin-bottom:10px;cursor:pointer}
  .faq summary{font-weight:600;color:#fff;list-style:none;outline:none}
  .faq summary::after{content:'+';float:right;color:#facc15;font-weight:700;font-size:20px}
  .faq details[open] summary::after{content:'−'}
  .faq p{margin:14px 0 0;color:#cfcfcf;font-size:16px}
  .related{border-top:1px solid #1f1f1f;margin-top:64px;padding-top:40px}
  .related h3{font-size:20px;margin:0 0 20px}
  .related ul{list-style:none;padding:0;margin:0;display:grid;gap:12px}
  .related li a{display:block;padding:16px;background:#121212;border:1px solid #1f1f1f;border-radius:10px;color:#fff;transition:border-color .15s}
  .related li a:hover{border-color:#facc15;text-decoration:none}
  .author{border-top:1px solid #1f1f1f;margin-top:48px;padding-top:32px;display:flex;gap:16px;align-items:center;color:#888;font-size:14px}
  footer{background:#070707;border-top:1px solid #1a1a1a;padding:48px 0 32px;margin-top:64px}
  footer .cols{max-width:1100px;margin:0 auto;padding:0 20px;display:grid;grid-template-columns:repeat(4,1fr);gap:32px}
  @media(max-width:768px){footer .cols{grid-template-columns:1fr 1fr}}
  footer h4{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#facc15;margin:0 0 14px}
  footer ul{list-style:none;padding:0;margin:0}
  footer li{padding:5px 0}
  footer a{color:#a0a0a0;font-size:14px}
  footer a:hover{color:#fff;text-decoration:none}
  footer .legal{max-width:1100px;margin:32px auto 0;padding:24px 20px 0;border-top:1px solid #1a1a1a;text-align:center;color:#666;font-size:13px}
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

const FOOTER = `<footer><div class="cols">
  <div>
    <h4>Santos Cleaning</h4>
    <p style="color:#a0a0a0;font-size:14px;margin:0">Atlanta Metro's trusted cleaning partner — residential and commercial.</p>
    <p style="margin-top:12px;font-size:14px"><a href="tel:${PHONE}">${PHONE_DISPLAY}</a></p>
  </div>
  <div>
    <h4>Commercial</h4>
    <ul>
      <li><a href="/commercial/medical-office-cleaning/">Medical Offices</a></li>
      <li><a href="/commercial/office-cleaning/">Corporate Offices</a></li>
      <li><a href="/commercial/daycare-cleaning/">Daycares</a></li>
      <li><a href="/commercial/gym-fitness-cleaning/">Gyms</a></li>
      <li><a href="/commercial/school-cleaning/">Schools</a></li>
      <li><a href="/commercial/church-cleaning/">Churches</a></li>
    </ul>
  </div>
  <div>
    <h4>Service Areas</h4>
    <ul>
      <li><a href="/marietta-house-cleaning/">Marietta</a></li>
      <li><a href="/atlanta-house-cleaning/">Atlanta</a></li>
      <li><a href="/alpharetta-house-cleaning/">Alpharetta</a></li>
      <li><a href="/roswell-house-cleaning/">Roswell</a></li>
    </ul>
  </div>
  <div>
    <h4>Company</h4>
    <ul>
      <li><a href="/blog/">Blog</a></li>
      <li><a href="/commercial/get-quote/">Commercial Quote</a></li>
      <li><a href="/get-quote/">Residential Quote</a></li>
      <li><a href="mailto:contact@santoscsolutions.com">contact@santoscsolutions.com</a></li>
    </ul>
  </div>
</div>
<div class="legal">© 2026 Santos Cleaning Solutions LLC. All rights reserved.</div>
</footer>`;

// ─── Builder ───────────────────────────────────────────────────────────
function buildPost(post, allPosts) {
  const canonical = `https://santoscsolutions.com/blog/commercial/${post.slug}/`;
  const ogImage = post.image || 'https://santoscsolutions.com/images/santos-logo.png';
  const keywords = [post.keyword, ...(post.related || [])].join(', ');

  // Schema
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${canonical}#article`,
        headline: post.title,
        description: post.description,
        datePublished: `${PUBLISH_DATE}T00:00:00Z`,
        dateModified: `${PUBLISH_DATE}T00:00:00Z`,
        author: { '@type': 'Person', name: AUTHOR },
        publisher: {
          '@type': 'Organization',
          name: 'Santos Cleaning Solutions',
          logo: { '@type': 'ImageObject', url: 'https://santoscsolutions.com/images/santos-logo.png' }
        },
        image: ogImage,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        keywords
      },
      {
        '@type': 'FAQPage',
        mainEntity: post.faq.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a }
        }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://santoscsolutions.com/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://santoscsolutions.com/blog/' },
          { '@type': 'ListItem', position: 3, name: 'Commercial', item: 'https://santoscsolutions.com/blog/commercial/' },
          { '@type': 'ListItem', position: 4, name: post.title, item: canonical }
        ]
      }
    ]
  };

  // Related posts (pick 3, not self)
  const related = allPosts.filter(p => p.slug !== post.slug).slice(0, 3);

  // Build TOC from sections
  const toc = post.sections.map((s, i) =>
    `<li><a href="#section-${i + 1}">${s.heading}</a></li>`
  ).join('');

  // Build content from sections
  const content = post.sections.map((s, i) => {
    let html = `<h2 id="section-${i + 1}">${s.heading}</h2>`;
    for (const block of s.body) {
      if (typeof block === 'string') html += `<p>${block}</p>`;
      else if (block.ul) html += `<ul>${block.ul.map(li => `<li>${li}</li>`).join('')}</ul>`;
      else if (block.ol) html += `<ol>${block.ol.map(li => `<li>${li}</li>`).join('')}</ol>`;
      else if (block.callout) html += `<div class="callout"><strong>${block.callout.title}</strong>${block.callout.body}</div>`;
      else if (block.quote) html += `<blockquote>${block.quote}</blockquote>`;
      else if (block.cta) html += `<div class="cta-inline"><h3>${block.cta.title}</h3><p>${block.cta.body}</p><a href="${block.cta.href}">${block.cta.label}</a></div>`;
    }
    return html;
  }).join('');

  return `${HEAD(post.title, post.description, canonical, ogImage, keywords)}
  ${STYLES}
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  ${NAV}
  <article>
    <div class="crumbs"><a href="/">Home</a> / <a href="/blog/">Blog</a> / <a href="/blog/commercial/">Commercial</a> / ${post.category}</div>
    <div class="category">${post.category}</div>
    <h1>${post.title}</h1>
    <div class="meta">
      <span>By ${AUTHOR}</span>
      <span>•</span>
      <span>${post.readTime} read</span>
      <span>•</span>
      <span>Published ${new Date(PUBLISH_DATE).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
    </div>
    <p style="font-size:19px;color:#e5e5e5;line-height:1.6">${post.lede}</p>

    <div class="callout">
      <strong>Key takeaways</strong>
      <ul style="margin:8px 0 0;padding-left:20px;color:#cfcfcf">
        ${post.sections.slice(0, 6).map(s => `<li>${s.heading}</li>`).join('\n        ')}
      </ul>
    </div>

    <div class="toc">
      <h3>In this guide</h3>
      <ol>${toc}</ol>
    </div>

    ${content}

    <h2 id="common-mistakes">Common Mistakes Facility Managers Make</h2>
    <p>After a decade in commercial cleaning across Atlanta Metro, the same handful of mistakes repeat in almost every vendor selection process. None of them are complicated to avoid, but each one compounds into real cost if you miss it early.</p>
    <p><strong>Choosing the lowest quote.</strong> In commercial cleaning, the cheapest bid is almost never the best value. The math behind legitimate operations — paying fair wages, carrying real insurance, buying proper chemicals, and investing in training — does not support rock-bottom pricing. When a vendor quotes 20% below market, something is being cut. Usually insurance, sometimes chemicals, often labor quality. All three compound over time and end up costing you more than the savings.</p>
    <p><strong>Skipping the walkthrough.</strong> A vendor who quotes over the phone without visiting your facility is guessing. Their guess might be close enough to sign a contract, but it is still a guess. The walkthrough is your first and best opportunity to evaluate the vendor face to face — not just their price, but their attention to detail, their questions, their note-taking, their professionalism. Skip it and you are evaluating marketing language, not operations.</p>
    <p><strong>Accepting verbal agreements.</strong> "We will take care of that" is not a scope of work. Every task, every frequency, every room should be written down and signed before service starts. If the vendor resists putting something in writing, it is because they do not plan to do it consistently. A written scope also protects you if something goes wrong and you need to document what was promised.</p>
    <p><strong>Not calling references.</strong> Every reputable vendor has references. Few facility managers actually call them. The two questions to ask: how long have they been your vendor, and what do you wish they did better? The answers to those two questions predict your experience with the same vendor almost perfectly.</p>

    <h2 id="quick-checklist">Quick Selection Checklist</h2>
    <p>If you do nothing else, work through this checklist before signing any commercial cleaning contract in Atlanta Metro. Every item takes five minutes or less to verify, and every one protects you from a known failure mode.</p>
    <ul>
      <li>Certificate of Insurance received and verified — $1M General Liability minimum, $2M Products/Completed Operations minimum</li>
      <li>Your business named as Additional Insured at no cost</li>
      <li>Workers Compensation coverage confirmed per Georgia state law</li>
      <li>Written scope of work signed before first service day — room by room, task by task</li>
      <li>Background check policy for all staff, national database not state-only</li>
      <li>Documented training program for new hires, with a written curriculum you can review</li>
      <li>Dedicated lead cleaner assignment — same team on your property every visit</li>
      <li>At least three current client references in your segment — and you called them</li>
      <li>Monthly supervisor quality walkthrough included in the scope</li>
      <li>30-day cancellation clause, not a long-term lock-in</li>
      <li>Backup coverage plan documented for when the primary team is unavailable</li>
      <li>Chemical safety: EPA-registered products with Safety Data Sheets on file</li>
    </ul>
    <p>Every cleaning company in Atlanta Metro should be able to check every box on this list without hesitation. The ones who stumble on three or more items are not ready to service a commercial account — or at least not yours.</p>

    <h2 id="bottom-line">The Bottom Line</h2>
    <p>Choosing and managing a commercial cleaning partner in Atlanta Metro is not complicated, but it rewards discipline. The vendors worth hiring share the same traits regardless of segment: documented training, real insurance, stable staffing, written scope, and a track record of consistency. The vendors who disappoint share the opposite — verbal agreements, minimum insurance, high turnover, and excuses that arrive before the complaints do.</p>
    <p>If you take one thing from this guide, take the walkthrough seriously. A free on-site visit, followed by a written room-by-room scope, followed by a trial clean before any long-term contract — that is how professional vendors earn business. Anything less is a hurry, and in commercial cleaning hurry is expensive. The time you spend vetting a vendor properly saves months of aggravation later, and the difference between the best and worst vendors in this market is not price — it is reliability.</p>
    <p>Santos Cleaning Solutions services businesses across Atlanta Metro with the protocols described in this article. Medical offices, corporate spaces, daycares, gyms, schools, and churches — all with the same insurance coverage, the same background-checked teams, and the same written scopes. We do not pretend to be the cheapest option in the market, and we do not chase prospects who want the cheapest. What we offer is consistency: the same team in your building every visit, the same documented protocols every time, and the same written scope you signed the day you hired us. If that sounds like what you are looking for, the fastest path is a short walkthrough and an honest written quote.</p>

    <h2 id="faq">Frequently Asked Questions</h2>
    <div class="faq">
      ${post.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n      ')}
    </div>

    <div class="cta-inline">
      <h3>Need a Commercial Cleaning Quote?</h3>
      <p>Licensed, insured, background-checked team across Atlanta Metro.</p>
      <a href="/commercial/get-quote/">Get My Free Quote →</a>
    </div>

    <div class="author">
      <div><strong style="color:#fff">${AUTHOR}</strong><br>Founder, Santos Cleaning Solutions — Atlanta Metro commercial and residential cleaning since 2020.</div>
    </div>

    <div class="related">
      <h3>Keep reading</h3>
      <ul>
        ${related.map(r => `<li><a href="/blog/commercial/${r.slug}/"><strong>${r.title}</strong><br><span style="color:#888;font-size:14px">${r.description}</span></a></li>`).join('\n        ')}
      </ul>
    </div>
  </article>
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
for (const post of POSTS) {
  const html = buildPost(post, POSTS);
  writeFile(`blog/commercial/${post.slug}/index.html`, html);
  written++;
}

// Also build the /blog/commercial/ hub listing
const hubHtml = `${HEAD('Commercial Cleaning Blog | Santos Cleaning', 'Expert guides, pricing insights, and compliance tips for facility managers — medical offices, schools, gyms, corporate spaces, and more.', 'https://santoscsolutions.com/blog/commercial/', 'https://santoscsolutions.com/images/santos-logo.png', 'commercial cleaning blog, facility management atlanta, office cleaning guide')}
${STYLES}
</head>
<body>
${NAV}
<article>
  <div class="crumbs"><a href="/">Home</a> / <a href="/blog/">Blog</a> / Commercial</div>
  <div class="category">Commercial Cleaning</div>
  <h1>Commercial Cleaning Guides for Atlanta Businesses</h1>
  <p style="font-size:19px;color:#e5e5e5;line-height:1.6">Practical guides for facility managers, practice administrators, and office managers across Atlanta Metro. Pricing, compliance, checklists, and real-world advice from a cleaning company that actually shows up.</p>
  <div class="related" style="margin-top:32px;border-top:none;padding-top:0">
    <ul>
      ${POSTS.map(p => `<li><a href="/blog/commercial/${p.slug}/"><strong>${p.title}</strong><br><span style="color:#888;font-size:14px">${p.description}</span></a></li>`).join('\n      ')}
    </ul>
  </div>
</article>
${FOOTER}
<script src="/assets/scs-cta.js" defer></script>
</body>
</html>`;
writeFile('blog/commercial/index.html', hubHtml);
written++;

console.log(JSON.stringify({ written, posts: POSTS.length }));
