/**
 * Interactive Pricing Calculator - Santos Cleaning Solutions
 * Provides instant price estimates based on home size and service type
 * Based on KB pricing v2025-10 with +10% uplift already included
 */

(function () {
    'use strict';

    // PRICING TABLE - From KB Laura v2025-10
    // Format: "bedrooms-bathrooms": price
    const PRICING = {
        regular: {
            "1-1": 90, "2-1": 120, "2-2": 140,
            "3-2": 200, "3-3": 220,
            "4-2": 240, "4-3": 260,
            "5-3": 290, "5-4": 310,
            "6-4": 330,
            "7-4": 460, "8-5": 480, "9-5": 510, "10-6": 530
        },
        deep: {
            "1-1": 280, "2-1": 300, "2-2": 330,
            "3-2": 400, "3-3": 440,
            "4-2": 480, "4-3": 530,
            "5-3": 570, "5-4": 620,
            "6-4": 660,
            "7-4": 910, "8-5": 960, "9-5": 1010, "10-6": 1070
        },
        move: {
            "1-1": 290, "2-1": 340, "2-2": 370,
            "3-2": 480, "3-3": 530,
            "4-2": 580, "4-3": 630,
            "5-3": 690, "5-4": 740,
            "6-4": 790,
            "7-4": 1090, "8-5": 1160, "9-5": 1220, "10-6": 1270
        }
    };

    // Bathroom delta (per extra bathroom)
    const BATHROOM_DELTA = {
        regular: 20,
        deep: 40,
        move: 50
    };

    // Service area validation by ZIP prefix (Georgia)
    const SERVICE_AREAS = {
        included: ['300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312'],
        excluded: ['303'] // Downtown Atlanta area - simplified
    };

    // Service minimum
    const SERVICE_MINIMUM = 150;

    // Range percentage for estimates
    const RANGE_PERCENT = 0.08; // ±8%

    /**
     * Find the closest matching key in pricing table
     */
    function findClosestKey(bedrooms, bathrooms, serviceType) {
        const pricing = PRICING[serviceType];
        const key = `${bedrooms}-${bathrooms}`;

        if (pricing[key]) {
            return { key, extraBaths: 0 };
        }

        // Find closest match by bedrooms first
        let bestKey = null;
        let bestBaths = 0;

        for (let b = bathrooms; b >= 1; b--) {
            const testKey = `${bedrooms}-${b}`;
            if (pricing[testKey]) {
                bestKey = testKey;
                bestBaths = b;
                break;
            }
        }

        // If no exact bedroom match, find closest
        if (!bestKey) {
            const keys = Object.keys(pricing);
            for (const k of keys) {
                const [bed] = k.split('-').map(Number);
                if (bed <= bedrooms) {
                    const [, bath] = k.split('-').map(Number);
                    if (!bestKey || bed > parseInt(bestKey.split('-')[0])) {
                        bestKey = k;
                        bestBaths = bath;
                    }
                }
            }
        }

        // If still no match, use largest available
        if (!bestKey) {
            const keys = Object.keys(pricing);
            bestKey = keys[keys.length - 1];
            bestBaths = parseInt(bestKey.split('-')[1]);
        }

        const extraBaths = Math.max(0, bathrooms - bestBaths);
        return { key: bestKey, extraBaths };
    }

    /**
     * Calculate price based on inputs
     */
    function calculatePrice(bedrooms, bathrooms, serviceType) {
        const { key, extraBaths } = findClosestKey(bedrooms, bathrooms, serviceType);

        let basePrice = PRICING[serviceType][key];

        // Add bathroom delta for extra bathrooms
        basePrice += extraBaths * BATHROOM_DELTA[serviceType];

        // Apply service minimum
        basePrice = Math.max(basePrice, SERVICE_MINIMUM);

        // Round to nearest $10
        basePrice = Math.round(basePrice / 10) * 10;

        // Calculate range
        const lowPrice = Math.round((basePrice * (1 - RANGE_PERCENT)) / 10) * 10;
        const highPrice = Math.round((basePrice * (1 + RANGE_PERCENT)) / 10) * 10;

        // Estimate hours based on service type and size
        let hours;
        if (serviceType === 'regular') {
            hours = Math.max(2, Math.ceil(bedrooms * 0.75 + bathrooms * 0.5));
        } else if (serviceType === 'deep') {
            hours = Math.max(3, Math.ceil(bedrooms * 1.25 + bathrooms * 0.75));
        } else {
            hours = Math.max(4, Math.ceil(bedrooms * 1.5 + bathrooms));
        }

        return {
            low: lowPrice,
            high: highPrice,
            hours: hours,
            serviceType: serviceType
        };
    }

    /**
     * Validate ZIP code
     */
    function validateZip(zip) {
        if (!zip || zip.length < 5) return null;

        const prefix = zip.substring(0, 3);

        if (SERVICE_AREAS.excluded.includes(prefix)) {
            return 'excluded';
        }

        if (SERVICE_AREAS.included.includes(prefix)) {
            return 'included';
        }

        return 'unknown';
    }

    /**
     * Get service name
     */
    function getServiceName(type) {
        const names = {
            regular: 'Regular Cleaning',
            deep: 'Deep Cleaning',
            move: 'Move In/Out Cleaning'
        };
        return names[type] || type;
    }

    /**
     * Update the price display
     */
    function updatePrice() {
        const bedrooms = parseInt(document.getElementById('calc-bedrooms').value) || 3;
        const bathrooms = parseInt(document.getElementById('calc-bathrooms').value) || 2;
        const serviceType = document.querySelector('input[name="calc-service"]:checked')?.value || 'regular';
        const zip = document.getElementById('calc-zip').value;

        const estimate = calculatePrice(bedrooms, bathrooms, serviceType);

        // Update price display
        document.getElementById('calc-price').textContent = `$${estimate.low} – $${estimate.high}`;
        document.getElementById('calc-details').textContent =
            `${bedrooms} bed / ${bathrooms} bath ${getServiceName(estimate.serviceType)} (~${estimate.hours} hours)`;

        // Update ZIP status
        const zipStatus = document.getElementById('calc-zip-status');
        if (zip && zip.length >= 5) {
            const status = validateZip(zip);
            if (status === 'included') {
                zipStatus.innerHTML = '<i class="fas fa-check-circle"></i> We serve your area!';
                zipStatus.className = 'zip-status valid';
            } else if (status === 'excluded') {
                zipStatus.innerHTML = '<i class="fas fa-times-circle"></i> Outside service area';
                zipStatus.className = 'zip-status invalid';
            } else {
                zipStatus.innerHTML = '<i class="fas fa-question-circle"></i> Service to be confirmed';
                zipStatus.className = 'zip-status unknown';
            }
        } else {
            zipStatus.textContent = '';
            zipStatus.className = 'zip-status';
        }

        // Track calculator usage
        if (typeof gtag !== 'undefined') {
            gtag('event', 'calculator_used', {
                'event_category': 'engagement',
                'bedrooms': bedrooms,
                'bathrooms': bathrooms,
                'service_type': serviceType,
                'price_low': estimate.low,
                'price_high': estimate.high
            });
        }
    }

    /**
     * Get service name
     */
    function getServiceName(type) {
        const names = {
            regular: 'Regular Cleaning',
            deep: 'Deep Cleaning',
            move: 'Move In/Out Cleaning'
        };
        return names[type] || type;
    }

    /**
     * Pre-fill the quote form with calculator data
     */
    function prefillQuoteForm() {
        const bedrooms = parseInt(document.getElementById('calc-bedrooms').value) || 3;
        const bathrooms = parseInt(document.getElementById('calc-bathrooms').value) || 2;
        const serviceType = document.querySelector('input[name="calc-service"]:checked')?.value || 'regular';
        const zip = document.getElementById('calc-zip').value;

        const estimate = calculatePrice(bedrooms, bathrooms, serviceType);
        const serviceName = getServiceName(serviceType);

        // Pre-fill ZIP code
        const zipField = document.getElementById('quote-zip');
        if (zipField && zip) {
            zipField.value = zip;
        }

        // Pre-fill service type
        const serviceField = document.getElementById('quote-service');
        if (serviceField) {
            serviceField.value = serviceType;
        }

        // Pre-fill notes with calculator details
        const notesField = document.getElementById('quote-notes');
        if (notesField) {
            const noteText = `📋 Calculator Estimate:
• ${bedrooms} bedrooms, ${bathrooms} bathrooms
• Service: ${serviceName}
• Estimated: $${estimate.low} - $${estimate.high}
• Approx. ${estimate.hours} hours

Please confirm pricing and schedule my cleaning!`;
            notesField.value = noteText;
        }

        // Show pre-filled estimate banner
        const estimateBanner = document.getElementById('prefilled-estimate');
        const estimateDetails = document.getElementById('estimate-details');
        if (estimateBanner && estimateDetails) {
            estimateDetails.innerHTML = `
                <strong>${serviceName}</strong> • ${bedrooms} bed / ${bathrooms} bath<br>
                Estimated: <strong>$${estimate.low} - $${estimate.high}</strong> (~${estimate.hours} hours)
            `;
            estimateBanner.style.display = 'block';
        }

        // Track pre-fill event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'calculator_to_form', {
                'event_category': 'conversion',
                'service_type': serviceType,
                'price_estimate': `${estimate.low}-${estimate.high}`
            });
        }

        // Focus on name field
        setTimeout(() => {
            document.getElementById('quote-name')?.focus();
        }, 100);

        console.log('✅ Quote form pre-filled from calculator');
    }

    /**
     * Initialize calculator
     */
    function initCalculator() {
        const calculator = document.getElementById('pricing-calculator');
        if (!calculator) return;

        // Add event listeners
        document.getElementById('calc-bedrooms')?.addEventListener('change', updatePrice);
        document.getElementById('calc-bathrooms')?.addEventListener('change', updatePrice);
        document.getElementById('calc-zip')?.addEventListener('input', updatePrice);

        document.querySelectorAll('input[name="calc-service"]').forEach(radio => {
            radio.addEventListener('change', updatePrice);
        });

        // Add click handler for "Book This Service" button
        const bookButton = document.querySelector('.btn-book-now');
        if (bookButton) {
            bookButton.addEventListener('click', function (e) {
                e.preventDefault();
                prefillQuoteForm();
                // Scroll to form after pre-filling
                document.getElementById('quick-quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }

        // Initial calculation
        updatePrice();

        console.log('✅ Pricing calculator initialized');
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', initCalculator);

    // Export for external use
    window.calculateCleaningPrice = calculatePrice;
    window.prefillQuoteForm = prefillQuoteForm;
})();
