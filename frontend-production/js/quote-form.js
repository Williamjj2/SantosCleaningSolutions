/**
 * Quote Form Handler - Santos Cleaning Solutions
 * Handles form submission to N8N webhook with GA4 tracking
 */

(function () {
  'use strict';

  // Configuration
  const CONFIG = {
    webhookUrl: 'https://n8n.williamjj.com/webhook/SCSform',
    formId: 'quick-quote-form',
    successId: 'quote-success'
  };

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById(CONFIG.formId);
    if (!form) return;

    // Track form start (first field focus)
    let formStarted = false;
    form.querySelectorAll('input, select').forEach(function (field) {
      field.addEventListener('focus', function () {
        if (!formStarted) {
          formStarted = true;
          if (typeof gtag !== 'undefined') {
            gtag('event', 'form_start', {
              'event_category': 'conversion',
              'event_label': 'quick_quote_form',
              'value': 10
            });
          }
          console.log('📝 Form start tracked');
        }
      });
    });

    // Phone number formatting
    const phoneInput = form.querySelector('[name="phone"]');
    if (phoneInput) {
      phoneInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
          if (value.length <= 3) {
            value = '(' + value;
          } else if (value.length <= 6) {
            value = '(' + value.substring(0, 3) + ') ' + value.substring(3);
          } else {
            value = '(' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6, 10);
          }
        }
        e.target.value = value;
      });
    }

    // Handle form submission
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      // Collect form data
      const formData = {
        name: form.querySelector('[name="name"]').value.trim(),
        phone: form.querySelector('[name="phone"]').value.trim(),
        zipCode: form.querySelector('[name="zipCode"]').value.trim(),
        serviceType: form.querySelector('[name="serviceType"]').value,
        notes: form.querySelector('[name="notes"]') ? form.querySelector('[name="notes"]').value.trim() : '',
        bedrooms: form.querySelector('[name="bedrooms"]') ? form.querySelector('[name="bedrooms"]').value : null,
        bathrooms: form.querySelector('[name="bathrooms"]') ? form.querySelector('[name="bathrooms"]').value : null,
        source: 'homepage_form',
        fromCalculator: document.getElementById('prefilled-estimate')?.style.display === 'block',
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href,
        userAgent: navigator.userAgent
      };

      try {
        // Send to N8N webhook
        const response = await fetch(CONFIG.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          // Track successful submission
          if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
              'event_category': 'conversion',
              'event_label': 'quick_quote_form',
              'conversion_method': 'form',
              'service_type': formData.serviceType,
              'user_zip': formData.zipCode,
              'value': 100
            });

            gtag('event', 'generate_lead', {
              'value': 100,
              'currency': 'USD'
            });
          }

          console.log('✅ Form submitted successfully');

          // Show success message
          form.style.display = 'none';
          document.getElementById(CONFIG.successId).style.display = 'block';

          // Scroll to success message
          document.getElementById(CONFIG.successId).scrollIntoView({ behavior: 'smooth', block: 'center' });

        } else {
          throw new Error('Server error');
        }
      } catch (error) {
        console.error('❌ Form submission error:', error);

        // Track error
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_error', {
            'event_category': 'error',
            'event_label': error.message
          });
        }

        // Show error message but don't redirect - let user try again
        alert('There was an issue submitting your request. Please try again or call us at (866) 350-9407.');

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });

    console.log('✅ Quote form handler initialized');
  });
})();
