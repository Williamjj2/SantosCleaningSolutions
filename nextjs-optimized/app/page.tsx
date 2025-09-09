import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import HeroSection from './components/HeroSection'
import ServicesSection from './components/ServicesSection'
import ReviewsSectionSkeleton from './components/ReviewsSectionSkeleton'

// Dynamic imports for performance
const ReviewsSection = dynamic(() => import('./components/ReviewsSection'), {
  loading: () => <ReviewsSectionSkeleton />,
  ssr: false // Load client-side for better performance
})

const ContactSection = dynamic(() => import('./components/ContactSection'), {
  ssr: true
})

const FAQSection = dynamic(() => import('./components/FAQSection'), {
  ssr: true
})

export const metadata: Metadata = {
  title: 'Santos Cleaning Solutions: #1 House Cleaning Marietta GA | Hamod Cleaning Atlanta',
  description: 'Top-rated house cleaning services in Marietta, Atlanta, Buckhead & Sandy Springs. Professional hamod cleaning, deep cleaning, move-in/out cleaning. Licensed, insured, family-owned since 2015. Book today!',
  keywords: [
    'hamod cleaning marietta ga',
    'house cleaning marietta ga', 
    'cleaning services atlanta',
    'buckhead house cleaning',
    'sandy springs cleaning services',
    'alpharetta house cleaning',
    'roswell cleaning company',
    'deep cleaning marietta',
    'move in cleaning atlanta',
    'professional cleaning georgia'
  ],
  openGraph: {
    title: 'Santos Cleaning Solutions: #1 House Cleaning Marietta GA | Hamod Cleaning',
    description: 'Top-rated house cleaning services in Marietta, Atlanta & surrounding areas. Professional, licensed, insured. Get your free estimate today!',
    images: [
      {
        url: '/images/santos-cleaning-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Santos Cleaning Solutions - Professional House Cleaning Services in Marietta, GA'
      }
    ]
  }
}

// Generate structured data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Santos Cleaning Solutions LLC",
  "description": "Professional house cleaning services in Marietta, Georgia and Atlanta metro area. Family-owned business offering deep cleaning, regular maintenance, move-in/out cleaning.",
  "url": "https://santoscsolutions.com",
  "telephone": "+1-866-350-9407",
  "email": "info@santoscsolutions.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Marietta",
    "addressRegion": "GA", 
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "33.9526",
    "longitude": "-84.5499"
  },
  "openingHours": "Mo-Sa 08:00-18:00",
  "priceRange": "$$",
  "areaServed": [
    {
      "@type": "City",
      "name": "Marietta, GA"
    },
    {
      "@type": "City", 
      "name": "Atlanta, GA"
    },
    {
      "@type": "City",
      "name": "Buckhead, GA"
    },
    {
      "@type": "City",
      "name": "Sandy Springs, GA"
    },
    {
      "@type": "City",
      "name": "Alpharetta, GA"
    },
    {
      "@type": "City",
      "name": "Roswell, GA"
    }
  ],
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "33.9526",
      "longitude": "-84.5499"
    },
    "geoRadius": "50000"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "House Cleaning Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Regular House Cleaning",
          "description": "Weekly, bi-weekly, or monthly cleaning services for Marietta and Atlanta homes"
        }
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "Service",
          "name": "Deep Cleaning",
          "description": "Comprehensive top-to-bottom cleaning service for Marietta, Atlanta, and Buckhead"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service", 
          "name": "Move-in/Move-out Cleaning",
          "description": "Complete cleaning for moving transitions in Atlanta metro area"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service", 
          "name": "Hamod Cleaning",
          "description": "Traditional thorough cleaning method popular in Atlanta and Georgia region"
        }
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "285+",
    "bestRating": "5",
    "worstRating": "1"
  }
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main className="overflow-hidden">
        {/* Above-the-fold content - Critical for performance */}
        <HeroSection />
        
        {/* Services Section - Essential for SEO */}
        <ServicesSection />
        
        {/* Reviews Section - Dynamically loaded for performance */}
        <section id="reviews" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 font-display">
                What Our Clients Say About Our{&apos; &apos;}
                <span className="text-primary-600">Hamod Cleaning</span> Services
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover why we're the #1 choice for house cleaning in Marietta, Atlanta, Buckhead, and Sandy Springs
              </p>
            </div>
            
            <Suspense fallback={<ReviewsSectionSkeleton />}>
              <ReviewsSection />
            </Suspense>
          </div>
        </section>
        
        {/* FAQ Section - Important for SEO */}
        <FAQSection />
        
        {/* Contact Section */}
        <ContactSection />
      </main>
    </>
  )
}