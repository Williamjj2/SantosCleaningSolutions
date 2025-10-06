// Google My Business Enhanced Schema
(function() {
    const gmbSchema = {
        "@context": "https://schema.org",
        "@type": "CleaningService",
        "@id": "https://santoscsolutions.com/#cleaningservice",
        "name": "Santos Cleaning Solutions LLC",
        "image": [
            "https://santoscsolutions.com/images/santos-logo.png",
            "https://santoscsolutions.com/images/cleaning-team.jpg",
            "https://santoscsolutions.com/images/before-after.jpg"
        ],
        "url": "https://santoscsolutions.com",
        "telephone": "+18663509407",
        "email": "info@santoscsolutions.com",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Marietta",
            "addressLocality": "Marietta",
            "addressRegion": "GA",
            "postalCode": "30060",
            "addressCountry": "US"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "33.9526",
            "longitude": "-84.5499"
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "08:00",
                "closes": "18:00"
            },
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": "Saturday",
                "opens": "08:00",
                "closes": "17:00"
            }
        ],
        "priceRange": "$$",
        "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Check", "Zelle", "Venmo"],
        "currenciesAccepted": "USD",
        "areaServed": [
            {
                "@type": "State",
                "name": "Georgia",
                "containsPlace": [
                    {"@type": "City", "name": "Marietta"},
                    {"@type": "City", "name": "Atlanta"},
                    {"@type": "City", "name": "Brookhaven"},
                    {"@type": "City", "name": "Alpharetta"},
                    {"@type": "City", "name": "Buckhead"},
                    {"@type": "City", "name": "Sandy Springs"},
                    {"@type": "City", "name": "Roswell"},
                    {"@type": "City", "name": "Dunwoody"},
                    {"@type": "City", "name": "Johns Creek"}
                ]
            }
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Cleaning Services",
            "itemListElement": [
                {
                    "@type": "OfferCatalog",
                    "name": "Residential Cleaning",
                    "itemListElement": [
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "Regular House Cleaning",
                                "description": "Recurring weekly, bi-weekly, or monthly cleaning service",
                                "offers": {
                                    "@type": "Offer",
                                    "priceSpecification": {
                                        "@type": "PriceSpecification",
                                        "minPrice": "100",
                                        "maxPrice": "300",
                                        "priceCurrency": "USD"
                                    }
                                }
                            }
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "Deep Cleaning",
                                "description": "Comprehensive one-time deep cleaning service",
                                "offers": {
                                    "@type": "Offer",
                                    "priceSpecification": {
                                        "@type": "PriceSpecification",
                                        "minPrice": "150",
                                        "maxPrice": "400",
                                        "priceCurrency": "USD"
                                    }
                                }
                            }
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "Move-In/Move-Out Cleaning",
                                "description": "Detailed cleaning for moving transitions",
                                "offers": {
                                    "@type": "Offer",
                                    "priceSpecification": {
                                        "@type": "PriceSpecification",
                                        "minPrice": "200",
                                        "maxPrice": "500",
                                        "priceCurrency": "USD"
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "47",
            "bestRating": "5",
            "worstRating": "1"
        },
        "review": [
            {
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": "Sarah Johnson"
                },
                "datePublished": "2024-12-15",
                "reviewBody": "Santos Cleaning has been cleaning our home in Marietta for over a year now. They're always on time, thorough, and trustworthy. Highly recommend!",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                }
            },
            {
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": "Michael Chen"
                },
                "datePublished": "2024-11-28",
                "reviewBody": "Professional service at a fair price. The team did an excellent job with our move-out cleaning in Buckhead.",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                }
            }
        ],
        "potentialAction": [
            {
                "@type": "ReserveAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://santoscsolutions.com/booking",
                    "inLanguage": "en-US",
                    "actionPlatform": [
                        "http://schema.org/DesktopWebPlatform",
                        "http://schema.org/MobileWebPlatform"
                    ]
                },
                "result": {
                    "@type": "Reservation",
                    "name": "Book Cleaning Service"
                }
            }
        ],
        "sameAs": [
            "https://www.google.com/maps/place/Santos+Cleaning+Solutions",
            "https://www.facebook.com/santoscleaning",
            "https://www.instagram.com/santoscleaning",
            "https://www.yelp.com/biz/santos-cleaning-solutions-marietta",
            "https://nextdoor.com/pages/santos-cleaning-solutions-marietta-ga"
        ]
    };

    // Insert GMB schema into head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(gmbSchema);
    document.head.appendChild(script);
})(); 