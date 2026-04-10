// Renders dynamic blog posts from Supabase as HTML pages.
// Triggered by `/blog/*` redirect when no static file exists in dist/public.
// Static files take priority — this only runs for dynamic Supabase posts.

exports.handler = async function (event) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // event.path is like /blog/some-slug or /blog/some-slug/
    const slug = event.path
        .replace(/^\/blog\//, '')
        .replace(/\/$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '');

    const notFoundHtml = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><title>Article Not Found | Santos Cleaning Solutions</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}.box{max-width:480px;padding:40px}h1{font-size:32px;margin:0 0 12px}p{color:#aaa;margin:0 0 24px}a{display:inline-block;background:#facc15;color:#0a0a0a;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none}</style>
</head><body><div class="box"><h1>Article Not Found</h1><p>This article doesn't exist or was removed.</p><a href="/blog/">← Back to Blog</a></div></body></html>`;

    const baseHeaders = {
        'Content-Type': 'text/html; charset=UTF-8',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; upgrade-insecure-requests",
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
        'X-Robots-Tag': 'index, follow',
    };

    if (!slug || !supabaseUrl || !supabaseKey) {
        return { statusCode: 404, headers: baseHeaders, body: notFoundHtml };
    }

    try {
        const r = await fetch(
            `${supabaseUrl}/rest/v1/blog_posts?select=slug,title,description,content,image_url,category,target_city,read_time,publish_date&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&limit=1`,
            { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
        );
        if (!r.ok) return { statusCode: 404, headers: baseHeaders, body: notFoundHtml };
        const posts = await r.json();
        if (!posts.length) return { statusCode: 404, headers: baseHeaders, body: notFoundHtml };

        const post = posts[0];
        const html = post.content && post.content.trim().toLowerCase().startsWith('<!doctype')
            ? post.content
            : notFoundHtml;

        return {
            statusCode: 200,
            headers: {
                ...baseHeaders,
                'Cache-Control': 'public, max-age=0, must-revalidate',
                'Netlify-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
            body: html,
        };
    } catch (e) {
        return { statusCode: 404, headers: baseHeaders, body: notFoundHtml };
    }
};
