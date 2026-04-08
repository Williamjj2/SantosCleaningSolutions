// Edge cache helper. Returns headers that tell the Netlify Edge to serve a
// cached copy for `edgeSeconds`, while keeping the browser revalidating each
// time so a manual hard-refresh always sees fresh data. Use `swrSeconds` to
// allow stale-while-revalidate (Edge keeps serving the stale copy in the
// background while it refreshes from origin).
function edgeCache(edgeSeconds, swrSeconds) {
    const swr = typeof swrSeconds === 'number' ? swrSeconds : Math.max(60, Math.floor(edgeSeconds / 4));
    return {
        // Browser: don't cache (we want hard refreshes to always see fresh content)
        'Cache-Control': 'public, max-age=0, must-revalidate',
        // Netlify Edge CDN: cache for edgeSeconds, allow stale-while-revalidate
        'Netlify-CDN-Cache-Control': `public, s-maxage=${edgeSeconds}, stale-while-revalidate=${swr}`,
    };
}

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

    // Dynamic sitemap with blog posts from Supabase — Edge cached for 1h
    if (path === '/sitemap-blog.xml') {
        const cacheH = edgeCache(3600, 900);
        try {
            let blogUrls = '';
            if (supabaseUrl && supabaseKey) {
                const response = await fetch(
                    `${supabaseUrl}/rest/v1/blog_posts?select=slug,publish_date&is_published=eq.true&order=publish_date.desc`,
                    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
                );
                if (response.ok) {
                    const posts = await response.json();
                    blogUrls = posts.map(p => `  <url>
    <loc>https://santoscsolutions.com/blog/${p.slug}/</loc>
    <lastmod>${new Date(p.publish_date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');
                }
            }
            const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogUrls}
</urlset>`;
            return {
                statusCode: 200,
                headers: { ...headers, ...cacheH, 'Content-Type': 'application/xml' },
                body: xml
            };
        } catch (error) {
            return { statusCode: 500, headers, body: 'Error generating sitemap' };
        }
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

    // Get reviews — Edge cached for 24h with 1h stale-while-revalidate
    if (path === '/reviews') {
        const cacheH = edgeCache(86400, 3600);
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
                    headers: { ...headers, ...cacheH },
                    body: JSON.stringify({ reviews: formattedReviews })
                };
            }

            return { statusCode: 200, headers: { ...headers, ...cacheH }, body: JSON.stringify({ reviews: [] }) };
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return { statusCode: 200, headers, body: JSON.stringify({ reviews: [] }) };
        }
    }

    // Get reviews stats — Edge cached for 24h with 1h stale-while-revalidate
    if (path === '/reviews/stats') {
        const cacheH = edgeCache(86400, 3600);
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
                        headers: { ...headers, ...cacheH },
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
                headers: { ...headers, ...cacheH },
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

    // Get single blog post by slug — Edge cached for 1h with 15min stale-while-revalidate
    if (path.startsWith('/blog/') && path !== '/blog/publish') {
        const cacheH = edgeCache(3600, 900);
        try {
            const slug = path.replace('/blog/', '');
            if (!supabaseUrl || !supabaseKey || !slug) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
            }
            const response = await fetch(
                `${supabaseUrl}/rest/v1/blog_posts?select=slug,title,description,content,image_url,category,target_city,read_time,publish_date&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&limit=1`,
                { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
            );
            if (response.ok) {
                const posts = await response.json();
                if (posts.length > 0) {
                    return { statusCode: 200, headers: { ...headers, ...cacheH }, body: JSON.stringify({ post: posts[0] }) };
                }
            }
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Post not found' }) };
        } catch (error) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Post not found' }) };
        }
    }

    // Get blog posts list — Edge cached for 1h with 15min stale-while-revalidate
    if (path === '/blog') {
        const cacheH = edgeCache(3600, 900);
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
                return { statusCode: 200, headers: { ...headers, ...cacheH }, body: JSON.stringify({ posts }) };
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
            const { slug, title, description, content, image_url, category, target_city, primary_keyword, read_time, publish_date } = body;

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
                publish_date: publish_date || new Date().toISOString()
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

    // Lead submission — forwards to n8n webhook (LAURA pipeline)
    if (path === '/lead-submit' && event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body || '{}');
            const required = ['name', 'phone'];
            for (const k of required) {
                if (!body[k] || typeof body[k] !== 'string' || body[k].trim().length < 2) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: `Missing or invalid field: ${k}` }) };
                }
            }

            // Honeypot — silent drop
            if (body.website && body.website.trim() !== '') {
                return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
            }

            const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
            const payload = {
                source: 'website_quote_form',
                received_at: new Date().toISOString(),
                name: body.name.trim().slice(0, 100),
                phone: body.phone.trim().slice(0, 30),
                email: (body.email || '').trim().slice(0, 120),
                address: (body.address || '').trim().slice(0, 200),
                city: (body.city || '').trim().slice(0, 80),
                bedrooms: parseInt(body.bedrooms, 10) || 0,
                bathrooms: parseFloat(body.bathrooms) || 0,
                cleaning_type: (body.cleaning_type || 'regular').trim().slice(0, 40),
                frequency: (body.frequency || 'one_time').trim().slice(0, 40),
                notes: (body.notes || '').trim().slice(0, 500),
                user_agent: event.headers['user-agent'] || '',
                referrer: event.headers['referer'] || ''
            };

            // Forward to n8n if configured
            if (webhookUrl) {
                try {
                    const fwd = await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!fwd.ok) {
                        console.error('n8n webhook returned', fwd.status);
                    }
                } catch (fwdErr) {
                    console.error('n8n forward failed:', fwdErr.message);
                }
            }

            // Best-effort: also persist to Supabase leads table if configured
            if (supabaseUrl && supabaseKey) {
                try {
                    await fetch(`${supabaseUrl}/rest/v1/leads_santos_cleaning`, {
                        method: 'POST',
                        headers: {
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${supabaseKey}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal,resolution=merge-duplicates'
                        },
                        body: JSON.stringify({
                            full_name: payload.name,
                            phone: payload.phone,
                            email: payload.email,
                            address: payload.address,
                            city: payload.city,
                            bedrooms: payload.bedrooms,
                            bathrooms: payload.bathrooms,
                            cleaning_type: payload.cleaning_type,
                            frequency: payload.frequency,
                            notes: payload.notes,
                            source: 'website_form',
                            created_at: payload.received_at
                        })
                    });
                } catch (sbErr) {
                    console.error('Supabase insert failed:', sbErr.message);
                }
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ ok: true, message: 'Lead received. We will contact you shortly.' })
            };
        } catch (error) {
            console.error('Lead submit error:', error);
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'Lead submission failed' }) };
        }
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found', path }) };
};
