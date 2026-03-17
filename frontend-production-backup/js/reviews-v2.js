(function () {
    const DATA_URL = '/reviews.json';
    let reviews = [];
    let currentIndex = 0;

    const fallbackReviews = [
        {
            author_name: 'Letícia Guimarães',
            rating: 5,
            text: 'I highly recommend it, quality service very well and very good people too.',
            profile_photo_url: null
        },
        {
            author_name: 'Jessé Alves',
            rating: 5,
            text: 'Super recomendo essa empresa, procure a Karen...',
            profile_photo_url: null
        },
        {
            author_name: 'Samuel Medeiros',
            rating: 5,
            text: 'Fantastic! Great cleaning service, highly recommend.',
            profile_photo_url: null
        }
    ];

    async function fetchData() {
        try {
            const response = await fetch(DATA_URL);
            if (!response.ok) throw new Error('Failed to fetch reviews');
            const data = await response.json();
            updateStats(data);
            if (data.reviews && data.reviews.length > 0) {
                reviews = data.reviews;
            } else {
                reviews = fallbackReviews;
            }
            showReview(0);
        } catch (e) {
            console.error('Error loading reviews:', e);
            reviews = fallbackReviews;
            showReview(0);
        }
    }

    function updateStats(data) {
        document.querySelectorAll('[data-dynamic="total-reviews"]').forEach(el => {
            el.textContent = data.total_reviews || '29';
        });
        document.querySelectorAll('[data-dynamic="average-rating"]').forEach(el => {
            el.textContent = data.average_rating?.toFixed(1) || '4.9';
        });
    }

    function showReview(index) {
        if (reviews.length === 0) return;
        currentIndex = (index + reviews.length) % reviews.length;
        const review = reviews[currentIndex];
        const displays = document.querySelectorAll('.reviews-carousel-display');

        // Calculate avatar URL explicitly to avoid template literal issues in minification
        let avatarUrl = review.profile_photo_url;
        if (!avatarUrl) {
            avatarUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(review.author_name) + '&background=2088D3&color=fff&size=64';
        }

        const stars = '★'.repeat(review.rating || 5);
        const reviewText = review.text || 'Great service!';

        displays.forEach(display => {
            display.innerHTML = `
        <div class="single-review fade-in">
          <p class="review-quote">"${reviewText}"</p>
          <div class="reviewer">
            <img src="${avatarUrl}" 
                 alt="${review.author_name}" 
                 width="64" 
                 height="64" 
                 style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover;">
            <div class="reviewer-info">
              <span class="reviewer-name">${review.author_name}</span>
              <div class="stars" style="color:#fbbf24;font-size:0.8rem;">
                ${stars}
              </div>
            </div>
          </div>
        </div>
      `;
        });
    }

    function setupNav() {
        document.querySelectorAll('.prev-review-btn').forEach(btn => {
            btn.addEventListener('click', () => showReview(currentIndex - 1));
        });
        document.querySelectorAll('.next-review-btn').forEach(btn => {
            btn.addEventListener('click', () => showReview(currentIndex + 1));
        });
        // Auto-rotate every 6 seconds
        setInterval(() => showReview(currentIndex + 1), 6000);
    }

    document.addEventListener('DOMContentLoaded', () => {
        fetchData();
        setupNav();
    });
})();
