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

  function run() {
    // Collect candidates: header, header > nav, role=navigation
    const candidates = Array.from(document.querySelectorAll('header, header nav, [role="navigation"]'))
      .filter(isTopBar);

    if (candidates.length < 2) return;

    // Group by signature
    const bySig = new Map();
    for (const el of candidates) {
      const sig = signature(el);
      if (!sig) continue;
      if (!bySig.has(sig)) bySig.set(sig, []);
      bySig.get(sig).push(el);
    }

    // For each group with duplicates, keep the LAST (SPA one), hide earlier ones
    for (const [, group] of bySig) {
      if (group.length <= 1) continue;
      const last = group[group.length - 1];
      showEl(last);
      group.slice(0, -1).forEach(hideEl);
    }
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


