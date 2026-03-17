exports.handler = async function (event, context) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const path = event.path.replace('/.netlify/functions/api', '').replace('/api', '');

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

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
                return { statusCode: 200, headers, body: JSON.stringify({ reviews: [] }) };
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

            return { statusCode: 200, headers, body: JSON.stringify({ reviews: [] }) };
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return { statusCode: 200, headers, body: JSON.stringify({ reviews: [] }) };
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
                        average_rating: 4.9,
                        total_reviews: 27,
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
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            average_rating: Math.round(average * 10) / 10,
                            total_reviews: reviews.length,
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
                    average_rating: 4.9,
                    total_reviews: 27,
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
                    average_rating: 4.9,
                    total_reviews: 27,
                    last_updated: new Date().toISOString(),
                    source: 'error_fallback'
                })
            };
        }
    }

    // Webhook to receive reviews from N8N
    if (path === '/webhook/reviews-update' && event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body || '{}');
            const reviews = body.reviews || [];

            if (!supabaseUrl || !supabaseKey) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'Reviews received (Supabase not configured)',
                        reviews_count: reviews.length
                    })
                };
            }

            let saved = 0;
            let skipped = 0;
            let errors = 0;

            for (const review of reviews) {
                try {
                    const authorClean = (review.author_name || 'anonymous').toLowerCase().replace(/[^a-z0-9]/g, '_');
                    const textStart = (review.text || '').substring(0, 50).replace(/[^a-z0-9]/gi, '').toLowerCase();
                    const reviewId = `gp_${authorClean}_${textStart.substring(0, 16)}`;

                    const checkResponse = await fetch(
                        `${supabaseUrl}/rest/v1/google_reviews?review_id=eq.${encodeURIComponent(reviewId)}&limit=1`,
                        {
                            headers: {
                                'apikey': supabaseKey,
                                'Authorization': `Bearer ${supabaseKey}`
                            }
                        }
                    );

                    if (checkResponse.ok) {
                        const existing = await checkResponse.json();
                        if (existing.length > 0) { skipped++; continue; }
                    }

                    const reviewData = {
                        review_id: reviewId,
                        author_name: review.author_name || 'Anonymous',
                        rating: Math.max(1, Math.min(5, review.rating || 5)),
                        text: review.text || '',
                        relative_time_description: review.relative_time_description || 'Recently',
                        profile_photo_url: review.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name || 'User')}&background=4285F4&color=fff`,
                        review_time: review.time ? new Date(review.time * 1000).toISOString() : new Date().toISOString(),
                        is_active: true,
                        is_featured: (review.rating || 5) >= 4
                    };

                    const insertResponse = await fetch(
                        `${supabaseUrl}/rest/v1/google_reviews`,
                        {
                            method: 'POST',
                            headers: {
                                'apikey': supabaseKey,
                                'Authorization': `Bearer ${supabaseKey}`,
                                'Content-Type': 'application/json',
                                'Prefer': 'return=minimal'
                            },
                            body: JSON.stringify(reviewData)
                        }
                    );

                    if (insertResponse.ok || insertResponse.status === 201) { saved++; }
                    else { errors++; }
                } catch (err) { errors++; }
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    total_received: reviews.length,
                    reviews_saved: saved,
                    reviews_skipped: skipped,
                    reviews_errors: errors,
                    timestamp: new Date().toISOString()
                })
            };
        } catch (error) {
            console.error('Webhook error:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Webhook processing failed' })
            };
        }
    }

    // Get blog posts
    if (path === '/blog') {
        try {
            if (!supabaseUrl || !supabaseKey) {
                return { statusCode: 200, headers, body: JSON.stringify({ posts: [] }) };
            }
            const response = await fetch(
                `${supabaseUrl}/rest/v1/blog_posts?select=slug,title,description,image_url,category,target_city,read_time,publish_date&is_published=eq.true&order=publish_date.desc&limit=50`,
                { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
            );
            if (response.ok) {
                const posts = await response.json();
                return { statusCode: 200, headers, body: JSON.stringify({ posts }) };
            }
            return { statusCode: 200, headers, body: JSON.stringify({ posts: [] }) };
        } catch (error) {
            return { statusCode: 200, headers, body: JSON.stringify({ posts: [] }) };
        }
    }

    // Publish blog post (called by N8N)
    if (path === '/blog/publish' && event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body || '{}');
            const { slug, title, description, content, image_url, category, target_city, primary_keyword, read_time } = body;

            if (!slug || !title) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'slug and title are required' }) };
            }

            if (!supabaseUrl || !supabaseKey) {
                return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Supabase not configured', slug }) };
            }

            const postData = {
                slug,
                title,
                description: description || '',
                content: content || '',
                image_url: image_url || '',
                category: category || 'Cleaning Tips',
                target_city: target_city || '',
                primary_keyword: primary_keyword || '',
                read_time: read_time || '5 min read',
                is_published: true,
                publish_date: new Date().toISOString()
            };

            const insertResponse = await fetch(
                `${supabaseUrl}/rest/v1/blog_posts`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal,resolution=merge-duplicates'
                    },
                    body: JSON.stringify(postData)
                }
            );

            if (insertResponse.ok || insertResponse.status === 201) {
                return { statusCode: 200, headers, body: JSON.stringify({ success: true, slug }) };
            }
            const errText = await insertResponse.text();
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to save post', detail: errText }) };
        } catch (error) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'Blog publish failed' }) };
        }
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found', path }) };
};
