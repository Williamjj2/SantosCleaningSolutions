'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { StarIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/solid'

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-primary-900 via-primary-700 to-primary-500 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/30">
            <StarIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-semibold">4.9/5 Stars • 285+ Reviews</span>
            <StarIcon className="w-5 h-5 text-yellow-400" />
          </div>

          {/* Main Headline - Optimized for "hamod cleaning" and local SEO */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-display leading-tight">
            #1 <span className="text-yellow-400">Hamod Cleaning</span><br />
            Services in{' '}
            <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
              Marietta & Atlanta
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
            Professional house cleaning services in Marietta, Buckhead, Sandy Springs & Atlanta Metro. 
            Licensed, insured, family-owned since 2015. <strong>Book your free estimate today!</strong>
          </p>

          {/* Location Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {['Marietta GA', 'Atlanta', 'Buckhead', 'Sandy Springs', 'Alpharetta', 'Roswell'].map((location) => (
              <span key={location} className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white border border-white/20">
                <MapPinIcon className="w-4 h-4" />
                {location}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a 
              href="tel:+18663509407"
              className="group inline-flex items-center gap-3 bg-accent-500 hover:bg-accent-600 text-white font-bold py-5 px-8 rounded-2xl text-lg transition-all duration-300 shadow-2xl hover:shadow-accent-500/25 hover:scale-105 hover:-translate-y-1"
            >
              <PhoneIcon className="w-6 h-6 group-hover:animate-pulse" />
              Call Now: (866) 350-9407
            </a>
            
            <a 
              href="#contact"
              className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold py-5 px-8 rounded-2xl text-lg transition-all duration-300 border-2 border-white/30 hover:border-white/50 hover:scale-105 hover:-translate-y-1"
            >
              Get Free Estimate
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">Family Owned Since 2015</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">100% Satisfaction Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}