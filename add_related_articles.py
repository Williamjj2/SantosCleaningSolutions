#!/usr/bin/env python3
"""Add Related Articles sections to all Santos Cleaning blog posts."""

import os
import re
from html import unescape

BLOG_DIR = "/Users/williamjesus/Site Oficial/SantosCleaningSolutions/dist/public/blog"

# Known city landing pages
CITY_SLUGS = {
    "acworth", "alpharetta", "atlanta", "austell", "avondale-estates",
    "brookhaven", "buckhead", "buford", "canton", "chamblee", "cumming",
    "decatur", "doraville", "druid-hills", "duluth", "dunwoody", "east-cobb",
    "flowery-branch", "gainesville", "grayson", "holly-springs", "johns-creek",
    "kennesaw", "lawrenceville", "lilburn", "loganville", "mableton",
    "marietta", "milton", "mountain-park", "norcross", "peachtree-corners",
    "powder-springs", "roswell", "sandy-springs", "smyrna", "snellville",
    "stone-mountain", "sugar-hill", "suwanee", "tucker", "vinings", "woodstock",
}

# Service page mappings (keyword -> service page slug)
SERVICE_KEYWORDS = {
    "deep cleaning": "deep-cleaning",
    "deep clean": "deep-cleaning",
    "move out": "move-in-out-cleaning",
    "move-out": "move-in-out-cleaning",
    "move in": "move-in-out-cleaning",
    "move-in": "move-in-out-cleaning",
    "office cleaning": "office-cleaning",
    "commercial": "office-cleaning",
    "regular cleaning": "regular-cleaning",
    "pet-friendly": "regular-cleaning",
    "seasonal": "regular-cleaning",
    "spring cleaning": "deep-cleaning",
    "post-construction": "deep-cleaning",
    "carpet cleaning": "deep-cleaning",
    "window cleaning": "regular-cleaning",
    "kitchen cleaning": "regular-cleaning",
}

# City name normalization (slug part -> display name)
CITY_DISPLAY = {
    "acworth": "Acworth",
    "alpharetta": "Alpharetta",
    "atlanta": "Atlanta",
    "austell": "Austell",
    "avondale-estates": "Avondale Estates",
    "brookhaven": "Brookhaven",
    "buckhead": "Buckhead",
    "buford": "Buford",
    "canton": "Canton",
    "chamblee": "Chamblee",
    "cumming": "Cumming",
    "decatur": "Decatur",
    "doraville": "Doraville",
    "druid-hills": "Druid Hills",
    "duluth": "Duluth",
    "dunwoody": "Dunwoody",
    "east-cobb": "East Cobb",
    "flowery-branch": "Flowery Branch",
    "gainesville": "Gainesville",
    "grayson": "Grayson",
    "holly-springs": "Holly Springs",
    "johns-creek": "Johns Creek",
    "kennesaw": "Kennesaw",
    "lawrenceville": "Lawrenceville",
    "lilburn": "Lilburn",
    "loganville": "Loganville",
    "mableton": "Mableton",
    "marietta": "Marietta",
    "milton": "Milton",
    "mountain-park": "Mountain Park",
    "norcross": "Norcross",
    "peachtree-corners": "Peachtree Corners",
    "powder-springs": "Powder Springs",
    "roswell": "Roswell",
    "sandy-springs": "Sandy Springs",
    "smyrna": "Smyrna",
    "snellville": "Snellville",
    "stone-mountain": "Stone Mountain",
    "sugar-hill": "Sugar Hill",
    "suwanee": "Suwanee",
    "tucker": "Tucker",
    "vinings": "Vinings",
    "woodstock": "Woodstock",
}


def find_blog_posts():
    """Find all blog post index.html files (skip blog/index.html and blog/commercial/index.html)."""
    posts = []
    for root, dirs, files in os.walk(BLOG_DIR):
        if "index.html" in files:
            rel = os.path.relpath(root, BLOG_DIR)
            # Skip the blog index itself and commercial index
            if rel == "." or rel == "commercial":
                continue
            posts.append(os.path.join(root, "index.html"))
    return sorted(posts)


def extract_slug(filepath):
    """Extract slug from file path."""
    rel = os.path.relpath(os.path.dirname(filepath), BLOG_DIR)
    return rel  # e.g., "deep-cleaning-sandy-springs-homeowners" or "commercial/office-cleaning-cost-atlanta-2026-pricing-guide"


def extract_info(filepath, content):
    """Extract title, category, and city from a blog post."""
    slug = extract_slug(filepath)

    # Title from <h1> or <title>
    title = ""
    h1_match = re.search(r'<h1[^>]*class="scs-title"[^>]*>(.*?)</h1>', content, re.DOTALL)
    if h1_match:
        title = re.sub(r'<[^>]+>', '', h1_match.group(1)).strip()
        title = unescape(title)
    else:
        title_match = re.search(r'<title>(.*?)</title>', content)
        if title_match:
            title = title_match.group(1).strip()
            title = re.sub(r'\s*\|.*$', '', title)
            title = unescape(title)

    # Category from breadcrumb or meta .cat span
    category = ""
    cat_match = re.search(r'<span class="cat">(.*?)</span>', content)
    if cat_match:
        category = cat_match.group(1).strip()

    # City from meta location span
    city = ""
    loc_match = re.search(r'📍\s*([^,<]+)', content)
    if loc_match:
        city = loc_match.group(1).strip()

    # Also try to detect city from slug
    city_slug = ""
    for cs in sorted(CITY_SLUGS, key=len, reverse=True):
        if cs in slug.lower():
            city_slug = cs
            if not city:
                city = CITY_DISPLAY.get(cs, cs.replace("-", " ").title())
            break

    # Detect service type from slug/title/category
    service_slug = ""
    check_text = (slug + " " + title + " " + category).lower()
    for keyword, svc in SERVICE_KEYWORDS.items():
        if keyword in check_text:
            service_slug = svc
            break

    return {
        "filepath": filepath,
        "slug": slug,
        "title": title,
        "category": category,
        "city": city,
        "city_slug": city_slug,
        "service_slug": service_slug,
    }


def find_related(post, all_posts, n=3):
    """Find n related posts for a given post."""
    candidates = [p for p in all_posts if p["slug"] != post["slug"]]

    def score(other):
        s = 0
        # Same category gets highest priority
        if post["category"] and other["category"] and post["category"].lower() == other["category"].lower():
            s += 10
        # Same city
        if post["city"] and other["city"] and post["city"].lower() == other["city"].lower():
            s += 5
        # Same service type
        if post["service_slug"] and other["service_slug"] and post["service_slug"] == other["service_slug"]:
            s += 3
        # Both commercial or both residential
        is_commercial_self = "commercial" in post["slug"]
        is_commercial_other = "commercial" in other["slug"]
        if is_commercial_self == is_commercial_other:
            s += 2
        return s

    candidates.sort(key=lambda x: score(x), reverse=True)
    return candidates[:n]


def build_related_html(post, related_posts):
    """Build the Related Articles HTML section."""
    links_html = ""
    for rp in related_posts:
        slug_path = rp["slug"]
        # Build subtitle
        parts = []
        if rp["category"]:
            parts.append(rp["category"])
        if rp["city"]:
            parts.append(rp["city"])
        subtitle = " · ".join(parts) if parts else "Cleaning Guide"

        links_html += (
            f'<a href="/blog/{slug_path}/" style="display:block;padding:16px 20px;background:#111;'
            f'border:1px solid #1f1f1f;border-radius:10px;text-decoration:none;color:#e8e8e8;'
            f'transition:border-color .2s" onmouseover="this.style.borderColor=\'#ca9b12\'" '
            f'onmouseout="this.style.borderColor=\'#1f1f1f\'">\n'
            f'<span style="font-weight:600">{rp["title"]}</span>\n'
            f'<span style="display:block;font-size:13px;color:#9a9a9a;margin-top:4px">{subtitle}</span>\n'
            f'</a>\n'
        )

    # Build footer nav links
    nav_links = '<a href="/blog/" style="display:inline-block;padding:8px 16px;background:#111;border:1px solid #1f1f1f;border-radius:8px;text-decoration:none;color:#e8e8e8;font-size:14px;transition:border-color .2s" onmouseover="this.style.borderColor=\'#ca9b12\'" onmouseout="this.style.borderColor=\'#1f1f1f\'">All Articles</a>\n'

    if post["city_slug"]:
        city_name = CITY_DISPLAY.get(post["city_slug"], post["city_slug"].replace("-", " ").title())
        nav_links += f'<a href="/{post["city_slug"]}-house-cleaning/" style="display:inline-block;padding:8px 16px;background:#111;border:1px solid #1f1f1f;border-radius:8px;text-decoration:none;color:#e8e8e8;font-size:14px;transition:border-color .2s" onmouseover="this.style.borderColor=\'#ca9b12\'" onmouseout="this.style.borderColor=\'#1f1f1f\'">{city_name} Cleaning</a>\n'

    if post["service_slug"]:
        svc_name = post["service_slug"].replace("-", " ").title()
        nav_links += f'<a href="/{post["service_slug"]}/" style="display:inline-block;padding:8px 16px;background:#111;border:1px solid #1f1f1f;border-radius:8px;text-decoration:none;color:#e8e8e8;font-size:14px;transition:border-color .2s" onmouseover="this.style.borderColor=\'#ca9b12\'" onmouseout="this.style.borderColor=\'#1f1f1f\'">{svc_name}</a>\n'

    section = (
        f'<section style="max-width:760px;margin:40px auto;padding:0 24px">\n'
        f'<h2 style="font-family:\'Playfair Display\',Georgia,serif;font-size:24px;color:#fff;margin-bottom:20px">Related Articles</h2>\n'
        f'<div style="display:grid;gap:12px">\n'
        f'{links_html}'
        f'</div>\n'
        f'<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px">\n'
        f'{nav_links}'
        f'</div>\n'
        f'</section>\n'
    )
    return section


def inject_related(content, related_html):
    """Inject related articles HTML before the footer."""
    # Look for <footer class="scs-foot"> or <div class="scs-foot"> or just <footer
    # Try scs-foot first (most specific)
    patterns = [
        r'(<footer\s+class="scs-foot")',
        r'(<div\s+class="scs-foot")',
        r'(<footer\b)',
    ]
    for pattern in patterns:
        match = re.search(pattern, content)
        if match:
            pos = match.start()
            return content[:pos] + related_html + content[pos:]

    # Fallback: before </body>
    match = re.search(r'</body>', content, re.IGNORECASE)
    if match:
        pos = match.start()
        return content[:pos] + related_html + content[pos:]

    return None


def main():
    print("Scanning blog posts...")
    post_files = find_blog_posts()
    print(f"Found {len(post_files)} blog posts")

    # Phase 1: Extract info from all posts
    all_posts = []
    for fp in post_files:
        with open(fp, "r", encoding="utf-8") as f:
            content = f.read()
        info = extract_info(fp, content)
        all_posts.append(info)

    print(f"\nPost inventory:")
    for p in all_posts:
        print(f"  {p['slug']:55s} | {p['category']:20s} | {p['city']:20s} | svc={p['service_slug']}")

    # Phase 2: Inject related articles
    updated = 0
    skipped = 0
    errors = 0

    for post in all_posts:
        fp = post["filepath"]
        with open(fp, "r", encoding="utf-8") as f:
            content = f.read()

        # Skip if already has related articles
        if "Related Articles" in content:
            print(f"  SKIP (already has): {post['slug']}")
            skipped += 1
            continue

        related = find_related(post, all_posts)
        if not related:
            print(f"  SKIP (no related): {post['slug']}")
            skipped += 1
            continue

        related_html = build_related_html(post, related)
        new_content = inject_related(content, related_html)

        if new_content is None:
            print(f"  ERROR (no insertion point): {post['slug']}")
            errors += 1
            continue

        with open(fp, "w", encoding="utf-8") as f:
            f.write(new_content)

        related_titles = [r["title"][:40] for r in related]
        print(f"  UPDATED: {post['slug']} -> {related_titles}")
        updated += 1

    print(f"\n{'='*60}")
    print(f"DONE: {updated} updated, {skipped} skipped, {errors} errors")
    print(f"Total posts: {len(all_posts)}")


if __name__ == "__main__":
    main()
