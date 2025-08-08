// Single-page navigation: scroll to sections instead of routing to separate pages
(function () {
  const map = {
    about: {
      hash: '#about',
      headings: [/about\b/i, /our story/i, /why choose/i],
    },
    services: {
      hash: '#services',
      headings: [/services\b/i, /what we (offer|do)/i],
    },
    contact: {
      hash: '#contact',
      headings: [/contact\b/i, /get in touch/i, /contact information/i],
    },
  };

  function findSectionByHash(hash) {
    try {
      if (hash && hash !== '#') {
        const el = document.querySelector(hash);
        if (el) return el;
      }
    } catch (_) {}
    return null;
  }

  function findSectionByHeadings(regexList) {
    const nodes = document.querySelectorAll('section, article, div');
    for (const node of nodes) {
      const text = (node.textContent || '').trim();
      if (!text) continue;
      for (const rx of regexList) {
        if (rx.test(text)) return node;
      }
    }
    return null;
  }

  function scrollToSection(key) {
    const conf = map[key];
    if (!conf) return;
    const byHash = findSectionByHash(conf.hash);
    const target = byHash || findSectionByHeadings(conf.headings);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleNavClick(e) {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const url = new URL(href, location.origin);
    const path = url.pathname.replace(/\/+$/, '');
    let key = null;
    if (path.endsWith('/about')) key = 'about';
    if (path.endsWith('/services')) key = 'services';
    if (path.endsWith('/contact')) key = 'contact';
    if (!key) return;
    // prevent any default navigation at capture phase
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    history.pushState({}, '', '/' + map[key].hash);
    scrollToSection(key);
  }

  function normalizeNavLinks() {
    document.querySelectorAll('a[href]')
      .forEach((a) => {
        try {
          const href = a.getAttribute('href');
          if (!href) return;
          const url = new URL(href, location.origin);
          const path = url.pathname.replace(/\/+$/, '');
          if (path === '/about') { a.setAttribute('href', map.about.hash); a.setAttribute('data-spa', 'about'); }
          if (path === '/services') { a.setAttribute('href', map.services.hash); a.setAttribute('data-spa', 'services'); }
          if (path === '/contact') { a.setAttribute('href', map.contact.hash); a.setAttribute('data-spa', 'contact'); }
        } catch (_) {}
      });
  }

  function autoRedirectIfSubpage() {
    const path = location.pathname.replace(/\/+$/, '');
    let key = null;
    if (path === '/about') key = 'about';
    if (path === '/services') key = 'services';
    if (path === '/contact') key = 'contact';
    if (!key) return;
    history.replaceState({}, '', '/' + map[key].hash);
    scrollToSection(key);
  }

  function boot() {
    autoRedirectIfSubpage();
    normalizeNavLinks();
    // capture phase to beat other handlers
    document.addEventListener('click', handleNavClick, true);
    window.addEventListener('popstate', () => {
      if (location.hash === map.about.hash) scrollToSection('about');
      if (location.hash === map.services.hash) scrollToSection('services');
      if (location.hash === map.contact.hash) scrollToSection('contact');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();


