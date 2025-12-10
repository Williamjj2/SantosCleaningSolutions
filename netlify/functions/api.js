const https = require('https');

exports.handler = async function (event, context) {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Handle different API paths
    const path = event.path.replace('/.netlify/functions/api', '').replace('/api', '');

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Health check
    if (path === '/health' || path === '') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                message: 'Santos Cleaning Solutions API'
            })
        };
    }

    // Get reviews
    if (path === '/reviews') {
        try {
            if (!supabaseUrl || !supabaseKey) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ reviews: [] })
                };
            }

            const response = await fetch(
                `${supabaseUrl}/rest/v1/google_reviews?select=author_name,rating,text,relative_time_description,profile_photo_url&is_active=eq.true&order=review_time.desc&limit=50`,
                {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    }
                }
            );

            if (response.ok) {
                const reviews = await response.json();
                const formattedReviews = reviews.map(review => ({
                    author_name: review.author_name || 'Anonymous',
                    rating: review.rating || 5,
                    text: review.text || '',
                    relative_time_description: review.relative_time_description || 'Recently',
                    profile_photo_url: review.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name || 'User')}&background=4285F4&color=fff&size=128`
                }));

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ reviews: formattedReviews })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ reviews: [] })
            };
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ reviews: [] })
            };
        }
    }

    // Get reviews stats
    if (path === '/reviews/stats') {
        try {
            if (!supabaseUrl || !supabaseKey) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        average_rating: 4.8,
                        total_reviews: 47,
                        rating_distribution: { "5": 40, "4": 5, "3": 1, "2": 1, "1": 0 },
                        last_updated: new Date().toISOString(),
                        source: 'fallback'
                    })
                };
            }

            const response = await fetch(
                `${supabaseUrl}/rest/v1/google_reviews?select=rating&is_active=eq.true`,
                {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    }
                }
            );

            if (response.ok) {
                const reviews = await response.json();

                if (reviews.length > 0) {
                    const ratings = reviews.map(r => r.rating).filter(r => r);
                    const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;

                    const distribution = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
                    ratings.forEach(r => {
                        if (distribution[String(r)] !== undefined) {
                            distribution[String(r)]++;
                        }
                    });

                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            average_rating: Math.round(average * 10) / 10,
                            total_reviews: reviews.length,
                            rating_distribution: distribution,
                            last_updated: new Date().toISOString(),
                            source: 'supabase'
                        })
                    };
                }
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    average_rating: 4.8,
                    total_reviews: 47,
                    rating_distribution: { "5": 40, "4": 5, "3": 1, "2": 1, "1": 0 },
                    last_updated: new Date().toISOString(),
                    source: 'fallback'
                })
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    average_rating: 4.8,
                    total_reviews: 47,
                    rating_distribution: { "5": 40, "4": 5, "3": 1, "2": 1, "1": 0 },
                    last_updated: new Date().toISOString(),
                    source: 'error_fallback'
                })
            };
        }
    }

    // Default: 404
    return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Not found', path: path })
    };
};
