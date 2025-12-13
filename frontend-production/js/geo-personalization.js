/**
 * Geo-Personalization Script
 * Personalizes content based on visitor's detected city
 * Uses GeoJS (free, unlimited) for IP-based geolocation
 */

(function () {
    'use strict';

    // Mapping of detected cities to display names and landing pages
    const cityConfig = {
        // Direct matches (exact city names from GeoJS)
        'marietta': { name: 'Marietta', page: '/marietta-house-cleaning/' },
        'atlanta': { name: 'Atlanta', page: '/' },
        'roswell': { name: 'Roswell', page: '/roswell-house-cleaning/' },
        'alpharetta': { name: 'Alpharetta', page: '/alpharetta-house-cleaning/' },
        'sandy springs': { name: 'Sandy Springs', page: '/sandy-springs-house-cleaning/' },
        'dunwoody': { name: 'Dunwoody', page: '/dunwoody-house-cleaning/' },
        'johns creek': { name: 'Johns Creek', page: '/johns-creek-house-cleaning/' },
        'buckhead': { name: 'Buckhead', page: '/buckhead-house-cleaning/' },
        'milton': { name: 'Milton', page: '/milton-house-cleaning/' },
        'suwanee': { name: 'Suwanee', page: '/suwanee-house-cleaning/' },
        'decatur': { name: 'Decatur', page: '/decatur-house-cleaning/' },
        'brookhaven': { name: 'Brookhaven', page: '/brookhaven-house-cleaning/' },
        'vinings': { name: 'Vinings', page: '/vinings-house-cleaning/' },
        'kennesaw': { name: 'Kennesaw', page: '/marietta-house-cleaning/' },
        'smyrna': { name: 'Smyrna', page: '/marietta-house-cleaning/' },
        'acworth': { name: 'Acworth', page: '/marietta-house-cleaning/' },
        'woodstock': { name: 'Woodstock', page: '/marietta-house-cleaning/' }
    };

    // Default fallback
    const defaultCity = { name: 'Atlanta Metro', page: '/' };

    // Elements to personalize (using data attributes)
    const personalizeElements = function (cityData) {
        // Personalize hero badge
        const heroBadge = document.querySelector('.hero-badge');
        if (heroBadge) {
            heroBadge.innerHTML = `<i class="fas fa-bolt"></i> Fast Booking Response Available in ${cityData.name}`;
        }

        // Personalize hero title
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            heroTitle.textContent = `Your ${cityData.name} Home Sparkling Clean Tomorrow`;
        }

        // Personalize any element with data-geo-city attribute
        document.querySelectorAll('[data-geo-city]').forEach(el => {
            el.textContent = cityData.name;
        });

        // Store in localStorage for consistency across pages
        try {
            localStorage.setItem('detectedCity', JSON.stringify({
                name: cityData.name,
                page: cityData.page,
                timestamp: Date.now()
            }));
        } catch (e) {
            // localStorage not available
        }

        // Track personalization event
        if (typeof gtag === 'function') {
            gtag('event', 'geo_personalization', {
                'event_category': 'Personalization',
                'event_label': cityData.name,
                'detected_city': cityData.name
            });
        }
    };

    // Check for cached city (valid for 24 hours)
    const getCachedCity = function () {
        try {
            const cached = localStorage.getItem('detectedCity');
            if (cached) {
                const data = JSON.parse(cached);
                const age = Date.now() - data.timestamp;
                if (age < 24 * 60 * 60 * 1000) { // 24 hours
                    return data;
                }
            }
        } catch (e) {
            // localStorage not available or invalid data
        }
        return null;
    };

    // Detect city using GeoJS (free, unlimited)
    const detectCity = function () {
        // Check cache first
        const cached = getCachedCity();
        if (cached) {
            personalizeElements(cached);
            return;
        }

        // Fetch from GeoJS API
        fetch('https://get.geojs.io/v1/ip/geo.json')
            .then(response => response.json())
            .then(data => {
                const detectedCity = (data.city || '').toLowerCase().trim();
                const detectedRegion = (data.region || '').toLowerCase();

                // Only personalize for Georgia visitors
                if (detectedRegion !== 'georgia' && detectedRegion !== 'ga') {
                    // Use default for non-Georgia visitors
                    personalizeElements(defaultCity);
                    return;
                }

                // Find matching city config
                const cityData = cityConfig[detectedCity] || defaultCity;
                personalizeElements(cityData);
            })
            .catch(error => {
                console.log('Geo detection failed, using default:', error);
                personalizeElements(defaultCity);
            });
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectCity);
    } else {
        detectCity();
    }

    // Expose for manual override (testing)
    window.geoPersonalize = {
        setCity: function (cityName) {
            const city = cityConfig[cityName.toLowerCase()] || defaultCity;
            personalizeElements(city);
        },
        clearCache: function () {
            try {
                localStorage.removeItem('detectedCity');
            } catch (e) { }
        }
    };

})();
