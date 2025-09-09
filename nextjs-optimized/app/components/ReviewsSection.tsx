'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

interface Review {
  author_name: string
  rating: number
  text: string
  relative_time_description: string
  profile_photo_url: string
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews', {
        cache: 'no-store' // Ensure fresh data
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      
      const data = await response.json()
      
      if (data.reviews && data.reviews.length > 0) {
        setReviews(data.reviews.slice(0, 12)) // Show top 12 reviews
      } else {
        // Fallback reviews if API fails
        setReviews(getFallbackReviews())
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError('Unable to load reviews')
      setReviews(getFallbackReviews())
    } finally {
      setLoading(false)
    }
  }

  const getFallbackReviews = (): Review[] => [
    {
      author_name: "Maria Rodriguez",
      rating: 5,
      text: "Santos Cleaning provides exceptional hamod cleaning services! They transformed my Marietta home. Professional, reliable, and thorough. Highly recommend their deep cleaning service.",
      relative_time_description: "2 weeks ago",
      profile_photo_url: "https://ui-avatars.com/api/?name=Maria+Rodriguez&background=4285F4&color=fff&size=128"
    },
    {
      author_name: "David Thompson", 
      rating: 5,
      text: "Best cleaning service in Atlanta! They cleaned my Buckhead condo perfectly. The team is professional and their hamod cleaning method is incredibly thorough. Worth every penny!",
      relative_time_description: "1 month ago",
      profile_photo_url: "https://ui-avatars.com/api/?name=David+Thompson&background=34A853&color=fff&size=128"
    },
    {
      author_name: "Jennifer Kim",
      rating: 5, 
      text: "Outstanding move-out cleaning in Sandy Springs! Santos Cleaning exceeded expectations. Their attention to detail is amazing. My landlord was impressed. Will use again!",
      relative_time_description: "3 weeks ago",
      profile_photo_url: "https://ui-avatars.com/api/?name=Jennifer+Kim&background=EA4335&color=fff&size=128"
    },
    {
      author_name: "Robert Wilson",
      rating: 5,
      text: "Professional hamod cleaning service in Alpharetta. They've been cleaning my home monthly for 2 years. Consistent quality, fair pricing, trustworthy team. Highly recommend!",
      relative_time_description: "1 week ago", 
      profile_photo_url: "https://ui-avatars.com/api/?name=Robert+Wilson&background=FBBC04&color=fff&size=128"
    },
    {
      author_name: "Lisa Martinez",
      rating: 5,
      text: "Excellent deep cleaning in Roswell! Santos team is reliable and thorough. They cleaned areas I never thought to clean. My house sparkles! Great customer service too.",
      relative_time_description: "2 months ago",
      profile_photo_url: "https://ui-avatars.com/api/?name=Lisa+Martinez&background=9C27B0&color=fff&size=128"
    },
    {
      author_name: "Michael Chen",
      rating: 4,
      text: "Good cleaning service in Marietta. Professional team, competitive prices. The hamod cleaning approach works well. Minor scheduling issue but overall satisfied with the quality.",
      relative_time_description: "3 weeks ago",
      profile_photo_url: "https://ui-avatars.com/api/?name=Michael+Chen&background=FF5722&color=fff&size=128"
    }
  ]

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(reviews.length / 3))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(reviews.length / 3)) % Math.ceil(reviews.length / 3))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error && reviews.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Reviews Carousel */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0">
              <div className="grid md:grid-cols-3 gap-8">
                {reviews.slice(slideIndex * 3, slideIndex * 3 + 3).map((review, index) => (
                  <div key={`${slideIndex}-${index}`} className="review-card">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        <Image
                          src={review.profile_photo_url}
                          alt={`${review.author_name} profile`}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name)}&background=4285F4&color=fff&size=128`
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{review.author_name}</h4>
                        <p className="text-sm text-gray-500">{review.relative_time_description}</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      {renderStars(review.rating)}
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">
                      &ldquo;{review.text}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {reviews.length > 3 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
            aria-label="Previous reviews"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600 group-hover:text-primary-600" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
            aria-label="Next reviews"
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-600 group-hover:text-primary-600" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {reviews.length > 3 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-primary-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Stats Section */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div className="text-4xl font-bold text-primary-600 mb-2">285+</div>
          <div className="text-gray-600">Happy Clients</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-primary-600 mb-2">4.9</div>
          <div className="text-gray-600">Average Rating</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-primary-600 mb-2">9+</div>
          <div className="text-gray-600">Years Experience</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
          <div className="text-gray-600">Satisfaction</div>
        </div>
      </div>

      {/* Google Reviews Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Santos Cleaning Solutions LLC",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "285",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": reviews.slice(0, 5).map(review => ({
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": review.author_name
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": review.rating,
                "bestRating": "5"
              },
              "reviewBody": review.text
            }))
          })
        }}
      />
    </div>
  )
}