// Enhanced Schema Markup for Santos Cleaning Solutions
(function() {
    // Não remover schemas existentes; consolidar através de @graph quando necessário
    // Create enhanced schema
    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "LocalBusiness",
                "@id": "https://santoscsolutions.com/#business",
                "name": "Santos Cleaning Solutions LLC",
                "alternateName": "Santos Cleaning",
                "description": "Professional house cleaning services in Marietta, Buckhead & Atlanta. Licensed, insured, family-owned cleaning company serving Metro Atlanta since 2015.",
                "url": "https://santoscsolutions.com",
                "telephone": "+1-866-350-9407",
                "email": "info@santoscsolutions.com",
                "image": [
                    "https://santoscsolutions.com/images/logo.png",
                    "https://santoscsolutions.com/images/og-image-home.jpg"
                ],
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://santoscsolutions.com/images/logo.png",
                    "width": 512,
                    "height": 512
                },
                            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Marietta",
                "addressLocality": "Marietta",
                "addressRegion": "GA",
                "postalCode": "30060",
                "addressCountry": "US"
            },
            "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": {
                    "@type": "GeoCoordinates",
                    "latitude": "33.9526",
                    "longitude": "-84.5499"
                },
                "geoRadius": "50000"
            },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": "33.9526",
                    "longitude": "-84.5499"
                },
                "openingHoursSpecification": [
                    {
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        "opens": "08:00",
                        "closes": "18:00"
                    }
                ],
                "priceRange": "$$",
                "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Check", "Zelle", "Venmo"],
                "currenciesAccepted": "USD",
                "areaServed": [
                    {"@type": "City", "name": "Marietta", "@id": "https://www.wikidata.org/wiki/Q486633"},
                    {"@type": "City", "name": "Atlanta", "@id": "https://www.wikidata.org/wiki/Q23556"},
                    {"@type": "City", "name": "Buckhead"},
                    {"@type": "City", "name": "Sandy Springs", "@id": "https://www.wikidata.org/wiki/Q1019516"},
                    {"@type": "City", "name": "Alpharetta"},
                    {"@type": "City", "name": "Roswell"},
                    {"@type": "City", "name": "Dunwoody"},
                    {"@type": "City", "name": "Johns Creek"}
                ],
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "reviewCount": "47",
                    "bestRating": "5",
                    "worstRating": "1"
                },
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Professional House Cleaning Services",
                    "itemListElement": [
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "Deep Cleaning Service",
                                "description": "Complete top-to-bottom cleaning for homes. Includes all rooms, appliances, windows, and detailed sanitization.",
                                "provider": {"@id": "https://santoscsolutions.com/#business"}
                            }
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "Regular House Cleaning",
                                "description": "Weekly, bi-weekly, or monthly maintenance cleaning to keep your home consistently clean.",
                                "provider": {"@id": "https://santoscsolutions.com/#business"}
                            }
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": "Move-In/Move-Out Cleaning",
                                "description": "Thorough cleaning service for moving transitions. Perfect for real estate transactions.",
                                "provider": {"@id": "https://santoscsolutions.com/#business"}
                            }
                        }
                    ]
                },
                "sameAs": [
                    "https://www.facebook.com/santoscleaning",
                    "https://www.instagram.com/santoscleaning",
                    "https://www.linkedin.com/company/santos-cleaning-solutions",
                    "https://www.google.com/maps/place/Santos+Cleaning+Solutions"
                ]
            },
            {
                "@type": "WebSite",
                "@id": "https://santoscsolutions.com/#website",
                "url": "https://santoscsolutions.com",
                "name": "Santos Cleaning Solutions",
                "description": "Professional house cleaning services in Metro Atlanta",
                "publisher": {"@id": "https://santoscsolutions.com/#business"},
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://santoscsolutions.com/?s={search_term_string}",
                    "query-input": "required name=search_term_string"
                },
                "inLanguage": ["en-US", "es", "pt"]
            },
            {
                "@type": "BreadcrumbList",
                "@id": "https://santoscsolutions.com/#breadcrumb",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://santoscsolutions.com"
                    }
                ]
            }
        ]
    };

    // Insert schema into head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
})(); 