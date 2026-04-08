/* Santos Cleaning — Netlify Image CDN auto-rewriter
 *
 * Scans for <img data-cdn> elements and rewrites their src + adds a srcset
 * pointing at /.netlify/images?url=...&w=...&q=82&fm=webp for responsive
 * delivery + automatic format negotiation (AVIF/WebP) by Netlify.
 *
 * Usage in HTML:
 *   <img data-cdn data-cdn-widths="400,800,1200" src="/images/foo.jpg" alt="…">
 *
 * Idempotent. No external deps. ~1KB.
 */
(function () {
  if (window.__SCS_IMG_CDN__) return;
  window.__SCS_IMG_CDN__ = true;

  function buildUrl(src, w, q) {
    var enc = encodeURIComponent(src);
    return '/.netlify/images?url=' + enc + '&w=' + w + '&q=' + (q || 82) + '&fm=webp';
  }

  function rewrite(img) {
    if (img.dataset.cdnDone) return;
    var src = img.getAttribute('src');
    if (!src || src.indexOf('/.netlify/images') !== -1) return;
    var widths = (img.dataset.cdnWidths || '480,800,1200,1600').split(',').map(function (x) {
      return parseInt(x.trim(), 10);
    }).filter(Boolean);
    if (!widths.length) return;
    var q = parseInt(img.dataset.cdnQuality || '82', 10);
    var srcset = widths.map(function (w) { return buildUrl(src, w, q) + ' ' + w + 'w'; }).join(', ');
    img.setAttribute('srcset', srcset);
    if (!img.getAttribute('sizes')) {
      img.setAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px');
    }
    // Set src to a sane mid value as graceful fallback when srcset is unsupported
    img.setAttribute('src', buildUrl(src, widths[Math.floor(widths.length / 2)] || 800, q));
    img.dataset.cdnDone = '1';
  }

  function run() {
    var imgs = document.querySelectorAll('img[data-cdn]');
    for (var i = 0; i < imgs.length; i++) rewrite(imgs[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }

  // Re-run on DOM mutations (covers SPA route changes)
  if (typeof MutationObserver !== 'undefined') {
    var obs = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var added = records[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n && n.nodeType === 1) {
            if (n.matches && n.matches('img[data-cdn]')) rewrite(n);
            else if (n.querySelectorAll) {
              var found = n.querySelectorAll('img[data-cdn]');
              for (var k = 0; k < found.length; k++) rewrite(found[k]);
            }
          }
        }
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
