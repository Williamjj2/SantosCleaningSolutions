/* Santos Cleaning Solutions — sticky mobile CTA + desktop exit-intent popup
 * Pure vanilla JS, no React dependency. Idempotent (re-injection is safe).
 * Adds:
 *   - Sticky bottom bar on mobile (<=768px) with Call + Quote buttons
 *   - Desktop exit-intent modal triggered when mouse leaves through the top
 *     (only fires once per browser session)
 */
(function () {
  if (window.__SCS_CTA_LOADED__) return;
  window.__SCS_CTA_LOADED__ = true;

  var PHONE = '+18663509407';
  var PHONE_DISPLAY = '(866) 350-9407';
  var QUOTE_URL = '/#quote';
  var SESSION_KEY = 'scs_exit_intent_shown';

  // ---- Inject styles -------------------------------------------------------
  var style = document.createElement('style');
  style.id = 'scs-cta-style';
  style.textContent = [
    '@media (max-width: 768px) {',
    '  body { padding-bottom: 64px !important; }',
    '  #scs-mobile-bar {',
    '    position: fixed; left: 0; right: 0; bottom: 0; z-index: 9998;',
    '    display: flex; height: 60px;',
    '    background: #0b1220; border-top: 1px solid rgba(255,255,255,0.08);',
    '    box-shadow: 0 -10px 30px rgba(0,0,0,0.45);',
    '    font-family: Inter, system-ui, -apple-system, sans-serif;',
    '  }',
    '  #scs-mobile-bar a {',
    '    flex: 1; display: flex; align-items: center; justify-content: center;',
    '    color: #fff; text-decoration: none; font-weight: 700; font-size: 15px;',
    '    letter-spacing: 0.2px;',
    '  }',
    '  #scs-mobile-bar a.scs-call { background: #1e6bb8; }',
    '  #scs-mobile-bar a.scs-quote { background: #22c55e; }',
    '  #scs-mobile-bar svg { margin-right: 8px; }',
    '}',
    '@media (min-width: 769px) { #scs-mobile-bar { display: none; } }',
    '#scs-exit-overlay {',
    '  position: fixed; inset: 0; z-index: 9999;',
    '  background: rgba(7,12,22,0.85); backdrop-filter: blur(6px);',
    '  display: none; align-items: center; justify-content: center;',
    '  font-family: Inter, system-ui, -apple-system, sans-serif;',
    '}',
    '#scs-exit-overlay.open { display: flex; }',
    '#scs-exit-card {',
    '  background: #0e1626; color: #fff;',
    '  border: 1px solid rgba(255,255,255,0.08);',
    '  border-radius: 16px; padding: 32px 28px; max-width: 440px; width: 92%;',
    '  text-align: center; box-shadow: 0 30px 80px rgba(0,0,0,0.55);',
    '  position: relative;',
    '}',
    '#scs-exit-card h3 { font-size: 22px; font-weight: 800; margin: 0 0 10px; }',
    '#scs-exit-card p { color: #9aa6bd; margin: 0 0 22px; font-size: 14px; line-height: 1.5; }',
    '#scs-exit-card .scs-actions { display: flex; gap: 10px; flex-direction: column; }',
    '#scs-exit-card a {',
    '  display: block; padding: 14px 18px; border-radius: 10px;',
    '  text-decoration: none; font-weight: 700; font-size: 15px;',
    '}',
    '#scs-exit-card a.primary { background: #22c55e; color: #062e16; }',
    '#scs-exit-card a.secondary { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.12); }',
    '#scs-exit-close {',
    '  position: absolute; top: 10px; right: 12px; background: transparent;',
    '  border: none; color: #6b7993; font-size: 24px; cursor: pointer; line-height: 1;',
    '}'
  ].join('');
  document.head.appendChild(style);

  // ---- Mobile bar ----------------------------------------------------------
  var bar = document.createElement('nav');
  bar.id = 'scs-mobile-bar';
  bar.setAttribute('aria-label', 'Quick contact');
  bar.innerHTML =
    '<a class="scs-call" href="tel:' + PHONE + '" aria-label="Call ' + PHONE_DISPLAY + '">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
      'Call Now' +
    '</a>' +
    '<a class="scs-quote" href="' + QUOTE_URL + '" aria-label="Get a free quote">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>' +
      'Free Quote' +
    '</a>';
  document.body.appendChild(bar);

  // ---- Exit-intent modal (desktop only) -----------------------------------
  var overlay = document.createElement('div');
  overlay.id = 'scs-exit-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'scs-exit-title');
  overlay.innerHTML =
    '<div id="scs-exit-card">' +
      '<button id="scs-exit-close" aria-label="Close">&times;</button>' +
      '<h3 id="scs-exit-title">Wait! Get $25 off your first cleaning</h3>' +
      '<p>Premium eco-friendly house cleaning in Atlanta Metro. 4.9★ rated, licensed &amp; insured. Same-day quote in 60 seconds.</p>' +
      '<div class="scs-actions">' +
        '<a class="primary" href="' + QUOTE_URL + '">Get my free quote</a>' +
        '<a class="secondary" href="tel:' + PHONE + '">Call ' + PHONE_DISPLAY + '</a>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  function openModal() {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    overlay.classList.add('open');
    sessionStorage.setItem(SESSION_KEY, '1');
    if (window.gtag) try { window.gtag('event', 'exit_intent_shown'); } catch (e) {}
  }
  function closeModal() { overlay.classList.remove('open'); }

  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.getElementById('scs-exit-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  // Only on desktop, only after the user has been on the page for >5s
  var armed = false;
  setTimeout(function () { armed = true; }, 5000);
  document.addEventListener('mouseout', function (e) {
    if (!armed) return;
    if (window.innerWidth <= 768) return;
    if (e.clientY <= 0 && !e.relatedTarget && !e.toElement) openModal();
  });
})();
