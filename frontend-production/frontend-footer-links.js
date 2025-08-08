// Inject compact footer links to legal pages across the SPA
(function () {
  const links = [
    { href: '/legal/privacy', label: 'Privacy Policy' },
    { href: '/legal/terms', label: 'Terms of Service' },
    { href: '/legal/disclaimer', label: 'Disclaimer' },
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();


