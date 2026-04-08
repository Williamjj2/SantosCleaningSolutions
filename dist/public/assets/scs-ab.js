/* Santos Cleaning — Lightweight client-side A/B testing
 *
 * Why client-side: Netlify Split Testing requires branch deploys + DNS
 * routing. This helper achieves the same end-result (variant assignment,
 * sticky bucketing, analytics reporting) with zero infra cost and zero
 * deploy friction.
 *
 * Usage:
 *   // 1. Define experiments in window.SCS_EXPERIMENTS BEFORE this script.
 *   window.SCS_EXPERIMENTS = {
 *     quote_headline: ['control', 'urgency', 'benefit'],
 *     cta_color:      ['yellow', 'green']
 *   };
 *
 *   // 2. Mark elements with data-ab="experimentName:variantName".
 *   <h1 data-ab="quote_headline:control">Get Your Free Quote</h1>
 *   <h1 data-ab="quote_headline:urgency" hidden>Same-Day Booking — Free Quote in 60s</h1>
 *
 *   // 3. Read variant in code if needed:
 *   //    SCS_AB.get('quote_headline')  →  'urgency'
 *
 * Persists in localStorage (key prefix scs_ab_) so the user always sees
 * the same variant across visits. Reports to GA4 as 'experiment_view'
 * event with experiment_id + variant_id (compatible with GA4 standard).
 */
(function () {
  if (window.SCS_AB) return;

  var STORAGE_PREFIX = 'scs_ab_';
  var experiments = window.SCS_EXPERIMENTS || {};
  var assignments = {};

  // Deterministic 50/50/N split using a hash of (experimentName + userSeed).
  function getOrCreateSeed() {
    var k = 'scs_ab_seed';
    try {
      var s = localStorage.getItem(k);
      if (!s) {
        s = String(Math.random()).slice(2) + String(Date.now());
        localStorage.setItem(k, s);
      }
      return s;
    } catch (e) {
      return String(Math.random());
    }
  }

  function hash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function assign(name, variants) {
    var k = STORAGE_PREFIX + name;
    var stored;
    try { stored = localStorage.getItem(k); } catch (e) {}
    if (stored && variants.indexOf(stored) !== -1) return stored;
    var seed = getOrCreateSeed();
    var idx = hash(name + ':' + seed) % variants.length;
    var v = variants[idx];
    try { localStorage.setItem(k, v); } catch (e) {}
    return v;
  }

  // Build assignments
  for (var name in experiments) {
    if (Object.prototype.hasOwnProperty.call(experiments, name)) {
      var variants = experiments[name];
      if (Array.isArray(variants) && variants.length > 0) {
        assignments[name] = assign(name, variants);
      }
    }
  }

  // Apply DOM mutations: show only matching data-ab variants
  function apply() {
    var nodes = document.querySelectorAll('[data-ab]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var spec = n.getAttribute('data-ab') || '';
      var parts = spec.split(':');
      if (parts.length !== 2) continue;
      var exp = parts[0], variant = parts[1];
      if (!(exp in assignments)) continue;
      if (assignments[exp] === variant) {
        n.removeAttribute('hidden');
        n.style.display = '';
      } else {
        n.setAttribute('hidden', '');
        n.style.display = 'none';
      }
    }
  }

  // Report to GA4 (one-shot per experiment per page view)
  function report() {
    if (typeof window.gtag !== 'function') return;
    for (var name in assignments) {
      window.gtag('event', 'experiment_view', {
        experiment_id: name,
        variant_id: assignments[name]
      });
    }
  }

  // Public API
  window.SCS_AB = {
    get: function (name) { return assignments[name]; },
    all: function () { return Object.assign({}, assignments); },
    apply: apply,
    report: report
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { apply(); report(); }, { once: true });
  } else {
    apply();
    report();
  }
})();
