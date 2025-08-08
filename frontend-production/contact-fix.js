// Runtime fix to stack sections vertically on /contact without touching app code
(function () {
  const PATH = "/contact";

  function findHeadingNode(regex) {
    const nodes = document.querySelectorAll("h1,h2,h3,h4,h5,h6, [role='heading']");
    for (const el of nodes) {
      const t = (el.textContent || "").trim();
      if (regex.test(t)) return el;
    }
    return null;
  }

  function getAncestors(el) {
    const arr = [];
    let n = el;
    while (n) {
      arr.push(n);
      n = n.parentElement;
    }
    return arr;
  }

  function lowestCommonAncestor(a, b) {
    const aAnc = getAncestors(a);
    const bAnc = new Set(getAncestors(b));
    for (const el of aAnc) if (bAnc.has(el)) return el;
    return null;
  }

  function isLayoutContainer(el) {
    const cs = getComputedStyle(el);
    return cs.display === "grid" || cs.display === "flex";
  }

  function findLayoutWrapper(from, mustContainA, mustContainB) {
    // climb up from LCA to find the first layout wrapper that contains both sections as descendants
    let n = from;
    while (n && n !== document.documentElement) {
      if (isLayoutContainer(n) && n.contains(mustContainA) && n.contains(mustContainB)) {
        return n;
      }
      n = n.parentElement;
    }
    return from;
  }

  function ensureOrder(parent, aSection, bSection) {
    // Make sure estimate comes first, then contact
    try {
      aSection.style.order = "1";
      bSection.style.order = "2";
    } catch (_) {}
  }

  function wrapToSection(el) {
    // Return a meaningful section container
    let n = el;
    while (n && n.parentElement) {
      const tag = n.tagName.toLowerCase();
      if (tag === "section" || tag === "article") return n;
      // stop at large cards/containers
      const cs = getComputedStyle(n);
      if (cs.display === "block" && n.children && n.children.length > 0 && n.clientHeight > 100) return n;
      n = n.parentElement;
    }
    return el;
  }

  function injectCSSOnce() {
    if (document.getElementById("contact-stack-style")) return;
    const css = `
      [data-contact-stack="1"]{display:flex !important; flex-direction:column !important; gap:24px !important;}
      [data-contact-stack="1"] > *{width:100% !important; max-width:100% !important;}
    `;
    const s = document.createElement("style");
    s.id = "contact-stack-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function applyFix() {
    if (!location.pathname.startsWith(PATH)) return;

    // Locate both main sections by their headings (several variants)
    const estimateH =
      findHeadingNode(/get your free estimate/i) ||
      findHeadingNode(/request a free evaluation/i) ||
      findHeadingNode(/free estimate/i) ||
      findHeadingNode(/request a quote/i);

    const touchH =
      findHeadingNode(/get in touch/i) ||
      findHeadingNode(/contact information/i) ||
      findHeadingNode(/contact us/i);

    if (!estimateH || !touchH) return;

    const estimateSection = wrapToSection(estimateH);
    const touchSection = wrapToSection(touchH);

    const lca = lowestCommonAncestor(estimateSection, touchSection);
    if (!lca) return;

    // Find the actual two-column wrapper
    const wrapper = findLayoutWrapper(lca, estimateSection, touchSection);
    wrapper.setAttribute("data-contact-stack", "1");

    injectCSSOnce();
    ensureOrder(wrapper, estimateSection, touchSection);
  }

  function boot() {
    applyFix();
    const mo = new MutationObserver(() => applyFix());
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("popstate", applyFix);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();


