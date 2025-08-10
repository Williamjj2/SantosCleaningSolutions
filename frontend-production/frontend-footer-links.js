// Inject compact footer links to legal pages across the SPA
(function () {
  const links = [
    { href: '/services/', label: 'Services' },
    { href: '/areas/marietta/', label: 'Marietta' },
    { href: '/areas/smyrna/', label: 'Smyrna' },
    { href: '/areas/vinings/', label: 'Vinings' },
    { href: '/areas/alpharetta/', label: 'Alpharetta' },
    { href: '/areas/dunwoody/', label: 'Dunwoody' },
    { href: '/areas/johns-creek/', label: 'Johns Creek' },
    { href: '/areas/brookhaven/', label: 'Brookhaven' },
    { href: '/legal/', label: 'Legal' },
    { href: '/legal/privacy/', label: 'Privacy Policy' },
    { href: '/legal/terms/', label: 'Terms of Service' },
    { href: '/legal/disclaimer/', label: 'Disclaimer' },
  ];

  function createBar() {
    const bar = document.createElement('div');
    bar.setAttribute('data-injected-legal-footer', '1');
    bar.style.padding = '20px 16px';
    bar.style.background = '#f8fafc';
    bar.style.borderTop = '1px solid #e5e7eb';
    bar.style.color = '#374151';
    bar.style.fontFamily = 'system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif';
    bar.style.textAlign = 'center';
    const wrap = document.createElement('div');
    wrap.style.maxWidth = '1200px';
    wrap.style.margin = '0 auto';
    const frag = document.createDocumentFragment();
    links.forEach((l, i) => {
      const a = document.createElement('a');
      a.href = l.href;
      a.textContent = l.label;
      a.style.color = '#2563eb';
      a.style.textDecoration = 'none';
      a.style.margin = '0 10px';
      a.addEventListener('mouseover', () => (a.style.textDecoration = 'underline'));
      a.addEventListener('mouseout', () => (a.style.textDecoration = 'none'));
      frag.appendChild(a);
      if (i < links.length - 1) {
        const sep = document.createElement('span');
        sep.textContent = '·';
        sep.style.margin = '0 6px';
        frag.appendChild(sep);
      }
    });
    wrap.appendChild(frag);
    bar.appendChild(wrap);
    return bar;
  }

  function inject() {
    if (document.querySelector('[data-injected-legal-footer]')) return;
    const bar = createBar();
    // try append into existing footer if any
    const existingFooter = document.querySelector('footer');
    if (existingFooter) {
      existingFooter.appendChild(bar);
    } else {
      document.body.appendChild(bar);
    }

    // Ensure canonical and og:url use trailing slash and non-www
    try {
      const origin = (location.protocol + '//' + location.hostname.replace(/^www\./, ''));
      const homeCanonical = origin + '/';
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      if (canonical.getAttribute('href') !== homeCanonical) {
        canonical.setAttribute('href', homeCanonical);
      }
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl && ogUrl.getAttribute('content') !== homeCanonical) {
        ogUrl.setAttribute('content', homeCanonical);
      }
    } catch (e) { /* noop */ }

    // Inject a short, keyword-rich intro block for internal linking (no layout change)
    if (!document.getElementById('seo-intro')) {
      const intro = document.createElement('div');
      intro.id = 'seo-intro';
      intro.style.maxWidth = '1100px';
      intro.style.margin = '24px auto';
      intro.style.padding = '0 16px';
      intro.style.fontFamily = 'system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif';
      intro.style.lineHeight = '1.6';
      intro.innerHTML = '<p>Looking for trusted <strong>house cleaning</strong> in <strong>Marietta</strong> and <strong>Atlanta</strong>? We provide deep, regular and move‑in/out cleaning. <a href="#services">See our services</a>, learn <a href="#about">about our company</a> or <a href="#contact">request a free estimate</a> today.</p>';

      const root = document.getElementById('root');
      if (root && root.parentNode) {
        root.parentNode.insertBefore(intro, root.nextSibling);
      } else {
        document.body.insertBefore(intro, document.body.firstChild);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();


