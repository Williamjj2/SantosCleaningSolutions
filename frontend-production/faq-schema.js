// FAQ Schema Markup for Santos Cleaning Solutions
(function() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How much does house cleaning cost in Marietta, GA?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "House cleaning in Marietta typically costs between $100-$300 per visit, depending on home size and service type. Santos Cleaning Solutions offers: Regular cleaning from $100, Deep cleaning from $150, and Move-in/out cleaning from $200. We provide free estimates tailored to your specific needs."
                }
            },
            {
                "@type": "Question",
                "name": "What areas do you serve in Atlanta?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Santos Cleaning Solutions serves the entire Metro Atlanta area including: Marietta, Buckhead, Sandy Springs, Alpharetta, Roswell, Dunwoody, Johns Creek, and surrounding communities within a 30-mile radius of Atlanta. We offer same-day service in most areas."
                }
            },
            {
                "@type": "Question",
                "name": "Are you licensed and insured?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Santos Cleaning Solutions is fully licensed and insured in Georgia. We carry comprehensive general liability insurance and are bonded for your protection. All our cleaning professionals are background-checked and trained to our high standards."
                }
            },
            {
                "@type": "Question",
                "name": "What's included in a deep cleaning service?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our deep cleaning service includes: Complete kitchen cleaning (inside appliances, cabinets), bathroom sanitization (grout, tiles, fixtures), all rooms (baseboards, light fixtures, ceiling fans), window cleaning (interior), and detailed dusting of all surfaces. It's perfect for first-time customers or spring cleaning."
                }
            },
            {
                "@type": "Question",
                "name": "Do I need to be home during the cleaning?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No, you don't need to be home. Many clients provide us with a key or entry code. We're fully bonded and insured, and our team is thoroughly background-checked. We'll lock up when we're done and can provide updates via text or phone."
                }
            },
            {
                "@type": "Question",
                "name": "What cleaning products do you use?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We use eco-friendly, non-toxic cleaning products that are safe for children and pets. Our products are effective yet gentle, leaving your home clean and fresh without harsh chemical residues. We can also use your preferred products upon request."
                }
            },
            {
                "@type": "Question",
                "name": "How do I prepare for a house cleaning service?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "To prepare: Pick up personal items and clutter, secure valuables and important documents, provide any special instructions, ensure clear access to all areas, and let us know about any specific concerns or priority areas. The more organized your space, the more thorough our cleaning can be."
                }
            },
            {
                "@type": "Question",
                "name": "What's your cancellation policy?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We understand plans change. We request 24-hour notice for cancellations or rescheduling. Cancellations with less than 24 hours notice may incur a fee. For regular clients, we're flexible and work with your schedule changes whenever possible."
                }
            }
        ]
    };

    // Insert FAQ schema into head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);
})(); 