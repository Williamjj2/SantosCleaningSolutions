/**
 * Google Analytics 4 - Conversion Events Tracking
 * Santos Cleaning Solutions
 * 
 * Events tracked:
 * - phone_click: User clicks phone number
 * - sms_click: User clicks SMS/text button  
 * - form_submit: User submits contact form
 * - cta_click: User clicks any CTA button
 * - service_view: User views a service page
 */

(function () {
    'use strict';

    // Wait for gtag to be available
    function waitForGtag(callback) {
        if (typeof gtag !== 'undefined') {
            callback();
        } else {
            setTimeout(function () { waitForGtag(callback); }, 100);
        }
    }

    waitForGtag(function () {

        // Track phone clicks
        document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                gtag('event', 'phone_click', {
                    'event_category': 'conversion',
                    'event_label': this.href.replace('tel:', ''),
                    'value': 50  // Estimated value of a phone call lead
                });
                console.log('📞 Phone click tracked:', this.href);
            });
        });

        // Track SMS clicks
        document.querySelectorAll('a[href^="sms:"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                gtag('event', 'sms_click', {
                    'event_category': 'conversion',
                    'event_label': this.href.replace('sms:', ''),
                    'value': 40  // Estimated value of an SMS lead
                });
                console.log('💬 SMS click tracked:', this.href);
            });
        });

        // Track email clicks
        document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                gtag('event', 'email_click', {
                    'event_category': 'conversion',
                    'event_label': this.href.replace('mailto:', ''),
                    'value': 30
                });
                console.log('📧 Email click tracked:', this.href);
            });
        });

        // Track CTA button clicks
        document.querySelectorAll('.btn-cta, .btn-cta-primary, .btn-phone, .floating-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var buttonText = this.textContent.trim().substring(0, 50);
                gtag('event', 'cta_click', {
                    'event_category': 'engagement',
                    'event_label': buttonText,
                    'value': 10
                });
                console.log('🎯 CTA click tracked:', buttonText);
            });
        });

        // Track form submissions
        document.querySelectorAll('form').forEach(function (form) {
            form.addEventListener('submit', function (e) {
                var formId = this.id || this.className || 'unknown_form';
                gtag('event', 'form_submit', {
                    'event_category': 'conversion',
                    'event_label': formId,
                    'value': 100  // High value for form submissions
                });
                console.log('📝 Form submit tracked:', formId);
            });
        });

        // Track service page views (automatic on service pages)
        var servicePaths = ['/regular-cleaning/', '/deep-cleaning/', '/move-in-out-cleaning/', '/office-cleaning/'];
        var currentPath = window.location.pathname;

        servicePaths.forEach(function (servicePath) {
            if (currentPath.includes(servicePath)) {
                gtag('event', 'service_view', {
                    'event_category': 'engagement',
                    'event_label': servicePath,
                    'value': 5
                });
                console.log('🧹 Service page view tracked:', servicePath);
            }
        });

        // Track location page views
        if (currentPath.includes('-house-cleaning/')) {
            var location = currentPath.replace('/', '').replace('-house-cleaning/', '');
            gtag('event', 'location_view', {
                'event_category': 'engagement',
                'event_label': location,
                'value': 5
            });
            console.log('📍 Location page view tracked:', location);
        }

        // Track scroll depth (25%, 50%, 75%, 100%)
        var scrollMarks = [25, 50, 75, 100];
        var scrollTracked = {};

        window.addEventListener('scroll', function () {
            var scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);

            scrollMarks.forEach(function (mark) {
                if (scrollPercent >= mark && !scrollTracked[mark]) {
                    scrollTracked[mark] = true;
                    gtag('event', 'scroll_depth', {
                        'event_category': 'engagement',
                        'event_label': mark + '%',
                        'value': 1
                    });
                    console.log('📜 Scroll depth tracked:', mark + '%');
                }
            });
        });

        console.log('✅ Analytics events tracking initialized');
    });

})();
