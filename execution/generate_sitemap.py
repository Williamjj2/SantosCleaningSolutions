import os
import datetime

# Configuration
BASE_URL = "https://santoscsolutions.com"
ROOT_DIR = "frontend-production"
OUTPUT_FILE = os.path.join(ROOT_DIR, "sitemap.xml")

# Priority and Frequency Settings
PRIORITIES = {
    "": 1.0,  # Homepage
    "services.html": 0.9,
    "book.html": 0.9,
    "contact.html": 0.8,
    "about.html": 0.8,
}

CHANGEFREQS = {
    "": "daily",
    "services.html": "weekly",
    "book.html": "weekly",
    "blog": "weekly",
    "default": "monthly"
}

# Exclusions
IGNORED_FILES = [
    "404.html",
    "google", 
    "dashboard",
    "_TEMPLATE",
    "article" # content template directory
]

IGNORED_DIRS = [
    "css", "js", "images", "assets", "fonts", "legal", "article"
]

def get_lastmod(filepath):
    """Get the last modification date of a file."""
    timestamp = os.path.getmtime(filepath)
    return datetime.date.fromtimestamp(timestamp).isoformat()

def generate_sitemap():
    print(f"Generating sitemap for {BASE_URL}...")
    
    urls = []
    
    # 1. Add Homepage explicitly
    urls.append({
        "loc": f"{BASE_URL}/",
        "lastmod": datetime.date.today().isoformat(), # Always fresh
        "changefreq": CHANGEFREQS[""],
        "priority": PRIORITIES[""]
    })

    # 2. Scanning Root HTML Files
    print("Scanning root directory...")
    for filename in sorted(os.listdir(ROOT_DIR)):
        if filename.endswith(".html") and filename not in IGNORED_FILES and not filename.startswith("google"):
            
            # Skip index.html as it's handled as root /
            if filename == "index.html":
                continue
                
            filepath = os.path.join(ROOT_DIR, filename)
            priority = PRIORITIES.get(filename, 0.8) # Default 0.8 for main pages
            changefreq = CHANGEFREQS.get(filename, CHANGEFREQS["default"])
            
            urls.append({
                "loc": f"{BASE_URL}/{filename}",
                "lastmod": get_lastmod(filepath),
                "changefreq": changefreq,
                "priority": priority
            })

    # 3. Scanning Blog Posts
    print("Scanning blog directory...")
    blog_dir = os.path.join(ROOT_DIR, "blog")
    if os.path.exists(blog_dir):
        for item in sorted(os.listdir(blog_dir)):
            item_path = os.path.join(blog_dir, item)
            
            # Check if it's a directory and has index.html (valid post)
            if os.path.isdir(item_path) and item not in IGNORED_DIRS and not item.startswith("."):
                index_path = os.path.join(item_path, "index.html")
                if os.path.exists(index_path):
                    urls.append({
                        "loc": f"{BASE_URL}/blog/{item}/",
                        "lastmod": get_lastmod(index_path),
                        "changefreq": "weekly",
                        "priority": 0.7
                    })

    # 4. Scanning Legal Pages (if any, standard structure)
    legal_dir = os.path.join(ROOT_DIR, "legal")
    if os.path.exists(legal_dir):
         for item in sorted(os.listdir(legal_dir)):
            item_path = os.path.join(legal_dir, item)
            if os.path.isdir(item_path):
                 index_path = os.path.join(item_path, "index.html")
                 if os.path.exists(index_path):
                     urls.append({
                        "loc": f"{BASE_URL}/legal/{item}", # clean URL style for legal?
                        "lastmod": get_lastmod(index_path),
                        "changefreq": "yearly",
                        "priority": 0.5
                    })

    # Generate XML
    xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    for url in urls:
        xml_content.append('  <url>')
        xml_content.append(f'    <loc>{url["loc"]}</loc>')
        xml_content.append(f'    <lastmod>{url["lastmod"]}</lastmod>')
        xml_content.append(f'    <changefreq>{url["changefreq"]}</changefreq>')
        xml_content.append(f'    <priority>{url["priority"]}</priority>')
        xml_content.append('  </url>')
    
    xml_content.append('</urlset>')
    
    with open(OUTPUT_FILE, "w") as f:
        f.write("\n".join(xml_content))
    
    print(f"Sitemap generated at {OUTPUT_FILE} with {len(urls)} URLs.")

if __name__ == "__main__":
    generate_sitemap()
