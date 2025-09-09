'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const faqs = [
  {
    question: 'What is hamod cleaning and why is it better?',
    answer: 'Hamod cleaning is a traditional, thorough cleaning method that emphasizes attention to detail and comprehensive coverage. Our hamod cleaning approach ensures every corner, surface, and detail in your Marietta or Atlanta home receives proper attention, resulting in a deeper, longer-lasting clean compared to standard cleaning services.'
  },
  {
    question: 'Which areas in Georgia do you serve?',
    answer: 'We proudly serve Marietta, Atlanta, Buckhead, Sandy Springs, Alpharetta, Roswell, Smyrna, Vinings, and surrounding areas in the Atlanta metro region. Our team travels up to 50 miles from our Marietta base to provide professional hamod cleaning services.'
  },
  {
    question: 'How much does house cleaning cost in Marietta and Atlanta?',
    answer: 'Pricing varies based on home size, cleaning type, and frequency. Regular maintenance cleaning starts from $69, deep cleaning from $159, and move-in/out cleaning from $173. We provide free, no-obligation estimates for all our hamod cleaning services in the Atlanta metro area.'
  },
  {
    question: 'Are you licensed and insured for cleaning services in Georgia?',
    answer: 'Yes, Santos Cleaning Solutions is fully licensed and insured in Georgia. We carry comprehensive liability insurance and bonding to protect your property and give you peace of mind when we perform hamod cleaning services in your home.'
  },
  {
    question: 'Do you bring your own cleaning supplies and equipment?',
    answer: 'Absolutely! We bring all professional-grade cleaning supplies, equipment, and tools needed for our hamod cleaning services. We use eco-friendly, safe products that are effective yet gentle on your family and pets. If you prefer we use specific products, just let us know.'
  },
  {
    question: 'How often should I schedule house cleaning services?',
    answer: 'Most of our Marietta and Atlanta clients schedule cleaning every 2-4 weeks. Weekly cleaning is ideal for busy families, bi-weekly for most households, and monthly for maintenance. We can customize a hamod cleaning schedule that fits your lifestyle and budget.'
  },
  {
    question: 'What makes Santos Cleaning different from other cleaning companies?',
    answer: 'We\'re a family-owned business since 2015, specializing in hamod cleaning methods. Our team is trained, background-checked, and insured. We offer 100% satisfaction guarantee, consistent team members, flexible scheduling, and personalized service that larger companies can\'t match.'
  },
  {
    question: 'Do you offer same-day or emergency cleaning services?',
    answer: 'Yes, we offer same-day and emergency cleaning services in Marietta and Atlanta area, subject to availability. Whether you need last-minute deep cleaning for guests or emergency cleanup, our hamod cleaning team will do our best to accommodate your urgent needs.'
  }
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-display">
            Frequently Asked Questions About Our{' '}
            <span className="text-primary-600">Hamod Cleaning</span> Services
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about our professional house cleaning services in Marietta, Atlanta, and surrounding areas.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none focus:bg-gray-100 transition-colors duration-200"
              >
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <ChevronDownIcon
                  className={`w-6 h-6 text-primary-600 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-8 pb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })
          }}
        />
      </div>
    </section>
  )
}