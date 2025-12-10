# Santos Cleaning Solutions Website

Professional house cleaning services for the Atlanta Metro Area.

🌐 **Live Site:** https://santoscsolutions.com

---

## 📁 Project Structure

```
├── frontend-production/     # Static website files (HTML, CSS, JS, images)
│   ├── index.html          # Homepage (React SPA)
│   ├── services.html       # Services page
│   ├── contact.html        # Contact page
│   ├── book.html           # Booking page
│   ├── blog/               # Blog articles
│   ├── guides/             # Cleaning guides
│   ├── legal/              # Terms, Privacy, Cancellation
│   ├── pt/                 # Portuguese version
│   └── [city]-house-cleaning/  # Local SEO pages (12 cities)
│
├── netlify/                # Netlify Functions (API)
│   └── functions/
│       └── api.js          # Main API (reviews, contact, etc.)
│
├── n8n-workflows/          # Automation workflows
│   └── blog-auto-publisher.json
│
├── docs/                   # Documentation
│   ├── BLOG_CONTENT_CALENDAR.md
│   ├── SITE_AUDIT_REPORT.md
│   └── ...
│
├── netlify.toml            # Netlify configuration
├── server.py               # FastAPI server (legacy, for local dev)
└── .env                    # Environment variables (not in git)
```

---

## 🚀 Deployment

Site is auto-deployed via **Netlify** when pushing to `main` branch.

```bash
git add .
git commit -m "Your message"
git push origin main
```

---

## 🔧 Local Development

### View static site:
```bash
cd frontend-production
python3 -m http.server 8000
# Open http://localhost:8000
```

### Run full API locally:
```bash
pip install -r requirements.txt
python server.py
```

---

## 📊 Key Features

- **12 Local SEO Pages** (Marietta, Alpharetta, Buckhead, etc.)
- **Professional Blog** with SEO optimization
- **Google Reviews Integration** via Supabase
- **Automated Content Publishing** via N8N
- **Portuguese Version** for Brazilian community

---

## 📞 Contact

- **Phone:** (866) 350-9407
- **Email:** info@santoscsolutions.com
- **Website:** https://santoscsolutions.com

---

© 2025 Santos Cleaning Solutions LLC
