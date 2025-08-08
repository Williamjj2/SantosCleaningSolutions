// Deduplicate top navigation/header bars when duplicates render
(function () {
  function signature(el) {
    // Build a simple signature based on visible link texts
    const links = el.querySelectorAll('a');
    const parts = [];
    links.forEach((a) => {
      const t = (a.textContent || '').replace(/\s+/g, ' ').trim();
      if (t) parts.push(t.toLowerCase());
    });
    return parts.join('|');
  }

  function isTopBar(el, idx) {
    const rect = el.getBoundingClientRect();
    // near the top OR among very first nodes in DOM, and wide enough
    return (rect.top < 240 || idx < 5) && (rect.width > 480 || rect.right - rect.left > 480);
  }

  function hideEl(el) {
    el.setAttribute('data-nav-duplicate', '1');
    el.setAttribute('aria-hidden', 'true');
    el.style.display = 'none';
  }
  function showEl(el) {
    el.removeAttribute('data-nav-duplicate');
    el.removeAttribute('aria-hidden');
    el.style.display = '';
  }

  function pickPreferred(cands) {
    // Prefer element containing brand logo/text
    const hasBrand = (el) =>
      el.querySelector('img[src*="logo" i], img[alt*="santos" i], a[href="/" i]') ||
      /santos\s*cleaning/i.test((el.textContent || '').replace(/\s+/g, ' '));
    const exact = cands.find(hasBrand);
    if (exact) return exact;
    // Fallback: the last one (geralmente SPA)
    return cands[cands.length - 1];
  }

  function run() {
    // Unhide anything we hid before to allow re-evaluation
    document.querySelectorAll('[data-nav-duplicate]')
      .forEach((el) => showEl(el));

    const nodeList = document.querySelectorAll([
      'header',
      'nav',
      '[role="banner"]',
      '[role="navigation"]',
      '.header',
      '.site-header',
      '.navbar',
      '.navigation',
      '.top-nav',
    ].join(','));

    const arr = Array.from(nodeList);
    const candidates = arr.filter((el, idx) => isTopBar(el, idx));

    if (candidates.length === 0) return; // nothing to do

    if (candidates.length === 1) {
      // Ensure the single one is visible
      showEl(candidates[0]);
      return;
    }

    const keep = pickPreferred(candidates);
    candidates.forEach((el) => (el === keep ? showEl(el) : hideEl(el)));

    // Safety: if after hiding there is no visible nav, unhide all
    const anyVisible = candidates.some((el) => el.offsetParent !== null);
    if (!anyVisible) candidates.forEach(showEl);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // Also watch for late inserts
  const mo = new MutationObserver(() => run());
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();


