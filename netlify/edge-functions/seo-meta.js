function getCityPages() {
  return {
    "alpharetta-house-cleaning": { title: "House Cleaning in Alpharetta, GA", desc: "Professional house cleaning services in Alpharetta, GA. Eco-friendly, licensed & insured. 4.9★ rated. Same-day availability. Call (866) 350-9407." },
    "buckhead-house-cleaning": { title: "House Cleaning in Buckhead, Atlanta", desc: "Premium house cleaning services in Buckhead, Atlanta. Eco-friendly products, licensed & insured. 4.9★ Google rated. Call (866) 350-9407." },
    "sandy-springs-house-cleaning": { title: "House Cleaning in Sandy Springs, GA", desc: "Professional house cleaning in Sandy Springs, GA. Eco-friendly, licensed & insured, 4.9★ rated. Book today! Call (866) 350-9407." },
    "roswell-house-cleaning": { title: "House Cleaning in Roswell, GA", desc: "Professional house cleaning services in Roswell, GA. Eco-friendly products, licensed & insured. 4.9★ rated. Call (866) 350-9407." },
    "dunwoody-house-cleaning": { title: "House Cleaning in Dunwoody, GA", desc: "Professional house cleaning in Dunwoody, GA. Eco-friendly, licensed & insured, 4.9★ Google rated. Call (866) 350-9407." },
    "brookhaven-house-cleaning": { title: "House Cleaning in Brookhaven, GA", desc: "Professional house cleaning in Brookhaven, GA. Eco-friendly products, licensed & insured. 4.9★ rated. Call (866) 350-9407." },
    "marietta-house-cleaning": { title: "House Cleaning in Marietta, GA", desc: "Professional house cleaning services in Marietta, GA. Eco-friendly, licensed & insured. 4.9★ rated. Call (866) 350-9407." },
    "johns-creek-house-cleaning": { title: "House Cleaning in Johns Creek, GA", desc: "Professional house cleaning in Johns Creek, GA. Eco-friendly products, licensed & insured. 4.9★ rated. Call (866) 350-9407." },
    "milton-house-cleaning": { title: "House Cleaning in Milton, GA", desc: "Professional house cleaning services in Milton, GA. Eco-friendly, licensed & insured. 4.9★ rated. Call (866) 350-9407." },
    "decatur-house-cleaning": { title: "House Cleaning in Decatur, GA", desc: "Professional house cleaning in Decatur, GA. Eco-friendly products, licensed & insured. 4.9★ rated. Call (866) 350-9407." },
    "vinings-house-cleaning": { title: "House Cleaning in Vinings, GA", desc: "Professional house cleaning in Vinings, GA. Eco-friendly products, licensed & insured. 4.9★ rated. Call (866) 350-9407." },
    "suwanee-house-cleaning": { title: "House Cleaning in Suwanee, GA", desc: "Professional house cleaning in Suwanee, GA. Eco-friendly, licensed & insured. 4.9★ rated. Call (866) 350-9407." },
  };
}

function getServicePages() {
  return {
    "deep-cleaning": { title: "Deep Cleaning Services | Santos Cleaning Solutions", desc: "Professional deep cleaning services in Atlanta Metro. Every corner, every surface. Eco-friendly products. Licensed & insured. Call (866) 350-9407." },
    "regular-cleaning": { title: "Regular Cleaning Services | Santos Cleaning Solutions", desc: "Recurring house cleaning services in Atlanta Metro. Weekly, bi-weekly, or monthly. Eco-friendly. Licensed & insured. Call (866) 350-9407." },
    "move-in-out-cleaning": { title: "Move In/Out Cleaning | Santos Cleaning Solutions", desc: "Professional move-in and move-out cleaning in Atlanta Metro. Get your full deposit back. Licensed & insured. Call (866) 350-9407." },
    "office-cleaning": { title: "Office Cleaning Services | Santos Cleaning Solutions", desc: "Professional office and commercial cleaning in Atlanta Metro. Eco-friendly products. Licensed & insured. Call (866) 350-9407." },
  };
}

async function fetchBlogPost(slug) {
  const supabaseUrl = Netlify.env.get("SUPABASE_URL");
  const supabaseKey = Netlify.env.get("SUPABASE_ANON_KEY") || Netlify.env.get("SUPABASE_KEY");
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const resp = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?select=slug,title,description,image_url,category,publish_date&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&limit=1`,
      { headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` } }
    );
    if (resp.ok) {
      const posts = await resp.json();
      return posts[0] || null;
    }
  } catch (e) {
    console.error("Edge function: Supabase fetch error:", e);
  }
  return null;
}

function escapeHtml(str) {
  return (str || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function injectMeta(html, { title, description, canonical, ogTitle, ogDescription, ogImage, ogUrl, ogType }) {
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeHtml(ogTitle || title)}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeHtml(ogDescription || description)}" />`);
  html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${escapeHtml(ogUrl || canonical)}" />`);
  if (ogType) {
    html = html.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${escapeHtml(ogType)}" />`);
  }
  if (ogImage) {
    html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${escapeHtml(ogImage)}" />`);
  }
  html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${escapeHtml(ogTitle || title)}" />`);
  html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${escapeHtml(ogDescription || description)}" />`);
  if (ogImage) {
    html = html.replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`);
  }
  return html;
}

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const BASE_URL = "https://santoscsolutions.com";

  // Skip assets, API, homepage
  if (path.startsWith("/api") || path.startsWith("/assets") || path.startsWith("/images") ||
      path.includes(".") || path === "/") {
    return context.next();
  }

  let meta = null;

  // Blog post: /blog/{slug}
  const blogMatch = path.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    const post = await fetchBlogPost(slug);
    if (post) {
      meta = {
        title: `${post.title} | Santos Cleaning Blog`,
        description: post.description || `${post.title} - Professional cleaning tips from Santos Cleaning Solutions.`,
        canonical: `${BASE_URL}/blog/${slug}/`,
        ogTitle: post.title,
        ogDescription: post.description,
        ogImage: post.image_url || `${BASE_URL}/opengraph.jpg`,
        ogUrl: `${BASE_URL}/blog/${slug}/`,
        ogType: "article",
      };
    }
  }

  // Blog index: /blog
  if (path === "/blog") {
    meta = {
      title: "Cleaning Tips & Insights Blog | Santos Cleaning Solutions",
      description: "Expert cleaning tips, home maintenance guides, and local insights for Atlanta homeowners. Professional advice from Santos Cleaning Solutions.",
      canonical: `${BASE_URL}/blog/`,
      ogUrl: `${BASE_URL}/blog/`,
      ogType: "website",
    };
  }

  // City pages
  const CITY_PAGES = getCityPages();
  const cityMatch = path.match(/^\/([a-z-]+-house-cleaning)$/);
  if (cityMatch && CITY_PAGES[cityMatch[1]]) {
    const data = CITY_PAGES[cityMatch[1]];
    meta = {
      title: `${data.title} | Santos Cleaning Solutions`,
      description: data.desc,
      canonical: `${BASE_URL}/${cityMatch[1]}/`,
      ogUrl: `${BASE_URL}/${cityMatch[1]}/`,
      ogType: "website",
    };
  }

  // Service pages
  const SERVICE_PAGES = getServicePages();
  const serviceMatch = path.match(/^\/(deep-cleaning|regular-cleaning|move-in-out-cleaning|office-cleaning)$/);
  if (serviceMatch && SERVICE_PAGES[serviceMatch[1]]) {
    const data = SERVICE_PAGES[serviceMatch[1]];
    meta = {
      title: data.title,
      description: data.desc,
      canonical: `${BASE_URL}/${serviceMatch[1]}/`,
      ogUrl: `${BASE_URL}/${serviceMatch[1]}/`,
      ogType: "website",
    };
  }

  if (!meta) {
    return context.next();
  }

  const response = await context.next();
  const html = await response.text();
  const modifiedHtml = injectMeta(html, meta);

  return new Response(modifiedHtml, {
    status: response.status,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      "content-type": "text/html; charset=UTF-8",
    },
  });
};

export const config = {
  path: "/*",
  excludedPath: ["/api/*", "/assets/*", "/images/*", "/*.js", "/*.css", "/*.svg", "/*.png", "/*.jpg", "/*.webp", "/*.ico", "/*.woff2", "/*.mp4"],
};
