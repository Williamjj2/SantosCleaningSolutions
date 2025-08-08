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

  function isTopBar(el) {
    const rect = el.getBoundingClientRect();
    // treat as top bar if it's near the top and wide
    return rect.top < 200 && rect.width > 600;
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
    const candidates = Array.from(
      document.querySelectorAll('header, header nav, [role="navigation"]')
    ).filter(isTopBar);

    // Se não há duplicatas, não mexe
    if (candidates.length <= 1) return;

    const keep = pickPreferred(candidates);
    if (!keep) return;
    candidates.forEach((el) => (el === keep ? showEl(el) : hideEl(el)));
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


