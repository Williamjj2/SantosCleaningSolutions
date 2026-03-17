#!/usr/bin/env python3
"""
Generate static HTML pages for blog posts stored in Supabase.
Runs during Netlify build to ensure each blog post has its own index.html
with correct SEO meta tags (title, canonical, description, schema).

Uses _TEMPLATE_ARTICLE.html as the base template.
Only generates pages for posts that don't already have a static HTML file.
"""

import os
import json
import urllib.request
import urllib.error
import html
from datetime import datetime

BASE_URL = "https://santoscsolutions.com"
ROOT_DIR = "frontend-production"
BLOG_DIR = os.path.join(ROOT_DIR, "blog")
TEMPLATE_PATH = os.path.join(BLOG_DIR, "_TEMPLATE_ARTICLE.html")

# Supabase config from environment
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "") or os.environ.get("SUPABASE_KEY", "")


def fetch_posts():
    """Fetch published blog posts from Supabase."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("WARNING: Supabase credentials not set. Skipping dynamic post generation.")
        return []

    url = (
        f"{SUPABASE_URL}/rest/v1/blog_posts"
        f"?select=slug,title,meta_description,keywords,category,featured_image,publish_date,content,read_time"
        f"&is_published=eq.true&order=publish_date.desc"
    )

    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    })

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.URLError as e:
        print(f"WARNING: Failed to fetch posts from Supabase: {e}")
        return []


def format_date(date_str):
    """Convert ISO date to display format."""
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return dt.strftime("%B %d, %Y")
    except (ValueError, AttributeError):
        return date_str or "2025"


def escape(text):
    """HTML-escape text for safe embedding in attributes."""
    return html.escape(str(text or ""), quote=True)


def generate_related_html(posts, current_slug):
    """Generate HTML for up to 3 related posts."""
    related = [p for p in posts if p["slug"] != current_slug][:3]
    if not related:
        return ""

    cards = []
    for p in related:
        cards.append(f'''
            <a href="/blog/{escape(p["slug"])}/" style="background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.08); text-decoration:none; color:inherit; transition:transform 0.2s;">
                <img src="{escape(p.get("featured_image", ""))}" alt="{escape(p["title"])}" style="width:100%; height:200px; object-fit:cover;">
                <div style="padding:20px;">
                    <h4 style="font-size:1.1rem; margin-bottom:8px; color:#1a1a2e;">{escape(p["title"])}</h4>
                    <span style="color:#64748b; font-size:0.85rem;">{format_date(p.get("publish_date", ""))}</span>
                </div>
            </a>''')
    return "\n".join(cards)


def generate_page(post, template, all_posts):
    """Generate a static HTML page for a blog post."""
    slug = post["slug"]
    post_dir = os.path.join(BLOG_DIR, slug)

    # Skip if static page already exists
    if os.path.exists(os.path.join(post_dir, "index.html")):
        return False

    title = post.get("title", slug.replace("-", " ").title())
    description = post.get("meta_description", f"{title} - Professional cleaning tips from Santos Cleaning Solutions.")
    keywords = post.get("keywords", "")
    category = post.get("category", "Cleaning Tips")
    image = post.get("featured_image", "")
    date_raw = post.get("publish_date", "")
    date_display = format_date(date_raw)
    content = post.get("content", "")
    read_time = post.get("read_time", "5")
    related_html = generate_related_html(all_posts, slug)

    page_html = template
    replacements = {
        "{{ARTICLE_TITLE}}": escape(title),
        "{{META_DESCRIPTION}}": escape(description),
        "{{KEYWORDS}}": escape(keywords),
        "{{SLUG}}": escape(slug),
        "{{FEATURED_IMAGE_URL}}": escape(image),
        "{{CATEGORY}}": escape(category),
        "{{PUBLISH_DATE}}": escape(date_raw),
        "{{PUBLISH_DATE_DISPLAY}}": date_display,
        "{{MODIFIED_DATE}}": escape(date_raw),
        "{{READ_TIME}}": str(read_time),
        "{{ARTICLE_CONTENT}}": content,  # Content is already HTML
        "{{RELATED_POSTS}}": related_html,
    }

    for placeholder, value in replacements.items():
        page_html = page_html.replace(placeholder, value)

    os.makedirs(post_dir, exist_ok=True)
    with open(os.path.join(post_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(page_html)

    return True


def main():
    print("=== Generating static blog pages ===")

    if not os.path.exists(TEMPLATE_PATH):
        print(f"WARNING: Template not found at {TEMPLATE_PATH}. Skipping blog generation.")
        return

    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()

    posts = fetch_posts()
    print(f"Found {len(posts)} published posts in Supabase.")

    generated = 0
    for post in posts:
        if generate_page(post, template, posts):
            print(f"  Generated: /blog/{post['slug']}/")
            generated += 1

    # Count existing static pages
    existing = sum(
        1 for d in os.listdir(BLOG_DIR)
        if os.path.isdir(os.path.join(BLOG_DIR, d))
        and os.path.exists(os.path.join(BLOG_DIR, d, "index.html"))
        and not d.startswith("_")
    )

    print(f"Generated {generated} new pages. Total blog pages: {existing}")


if __name__ == "__main__":
    main()
