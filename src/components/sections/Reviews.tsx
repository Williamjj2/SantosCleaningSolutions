import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
  author_name: string;
  rating: number;
  text: string;
  profile_photo_url?: string | null;
  relative_time_description?: string;
}

const fallbackReviews: Review[] = [
  {
    author_name: "Corban Glover",
    rating: 5,
    text: "William and Karen came by on short notice to do our move in deep cleaning and we appreciate them so much for making sure we move into a clean, sanitized, thoroughly dust-free home.",
  },
  {
    author_name: "Sarah Jenkins",
    rating: 5,
    text: "Absolutely phenomenal service! The team is always punctual, professional, and they leave my house smelling amazing. The eco-friendly products they use are a huge plus for my two dogs.",
  },
  {
    author_name: "Michael T.",
    rating: 5,
    text: "I hired Santos for a deep clean before hosting family for the holidays. They got into corners I didn't even know existed. The kitchen literally looked brand new when they finished.",
  },
];

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);
  const [totalReviews, setTotalReviews] = useState(27);
  const [averageRating, setAverageRating] = useState(4.9);
  const [currentPage, setCurrentPage] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const reviewsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const visibleReviews = reviews.slice(
    currentPage * reviewsPerPage,
    currentPage * reviewsPerPage + reviewsPerPage
  );

  useEffect(() => {
    const applyData = (data: any) => {
      if (data.reviews?.length > 0) setReviews(data.reviews);
      if (data.total_reviews) setTotalReviews(data.total_reviews);
      if (data.average_rating) setAverageRating(data.average_rating);
    };

    // Try Supabase API first, fallback to static JSON
    fetch("/api/reviews")
      .then((res) => {
        if (!res.ok) throw new Error("API unavailable");
        return res.json();
      })
      .then((data) => {
        if (data.reviews?.length > 0) {
          applyData(data);
          // Also fetch stats for total count and average
          return fetch("/api/reviews/stats")
            .then((r) => r.ok ? r.json() : null)
            .then((stats) => { if (stats) applyData(stats); });
        }
        throw new Error("No reviews from API");
      })
      .catch(() => {
        // Fallback to static reviews.json
        fetch("/reviews.json")
          .then((res) => {
            if (!res.ok) throw new Error("Failed");
            return res.json();
          })
          .then(applyData)
          .catch(() => {});
      });
  }, []);

  useEffect(() => {
    if (totalPages <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentPage((p) => (p + 1) % totalPages);
    }, 8000);
    return () => clearInterval(intervalRef.current);
  }, [totalPages]);

  const goTo = (page: number) => {
    clearInterval(intervalRef.current);
    setCurrentPage(((page % totalPages) + totalPages) % totalPages);
  };

  const getAvatarUrl = (review: Review) => {
    if (review.profile_photo_url) return review.profile_photo_url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name)}&background=1E6BB8&color=fff&size=128`;
  };

  return (
    <section id="reviews" className="py-24 bg-black relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <h2 className="text-4xl font-display text-white mb-2">
            {averageRating.toFixed(1)} Average Rating
          </h2>
          <p className="text-white/50">
            Based on {totalReviews}+ reviews on Google
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {visibleReviews.map((review, i) => (
            <div key={`${currentPage}-${i}`} className="glass-panel p-8 rounded-3xl flex flex-col animate-in fade-in duration-500">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(review.rating || 5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-8 flex-1 italic">
                "{review.text}"
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <img
                  src={getAvatarUrl(review)}
                  alt={review.author_name}
                  className="w-10 h-10 rounded-full object-cover border border-blue-500/30"
                />
                <div>
                  <h4 className="text-white font-medium text-sm">
                    {review.author_name}
                  </h4>
                  {review.relative_time_description && (
                    <p className="text-white/40 text-xs">
                      {review.relative_time_description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => goTo(currentPage - 1)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white/60" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentPage ? "bg-blue-400 w-6" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => goTo(currentPage + 1)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white/60" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
