# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Santos Cleaning Solutions — professional house cleaning services website for the Atlanta Metro Area. Live at https://santoscsolutions.com.

## Architecture: 3-Layer Agent System

This repo uses a **Directive → Orchestration → Execution** pattern:

1. **Directives** (`directives/`): Markdown SOPs defining goals, inputs, tools, outputs, and edge cases
2. **Orchestration** (the AI agent): Reads directives, calls execution scripts in order, handles errors, updates directives with learnings
3. **Execution** (`execution/`): Deterministic Python scripts for API calls, data processing, file operations

**Key principle:** Don't do work manually that a script can handle. Check `execution/` for existing tools before writing new ones. Push complexity into deterministic code. Update directives when you discover new constraints or better approaches. Don't create or overwrite directives without asking.

## Tech Stack

- **Frontend:** Static HTML/CSS/JS served from `frontend-production/` (includes a React SPA build for the homepage)
- **Backend API:** Netlify Functions (Node.js) in `netlify/functions/api.js` — handles reviews, contact form via Supabase
- **Legacy API:** FastAPI server (`server.py`) with Python 3.9, used for local dev only
- **Hosting:** Netlify, auto-deploys on push to `main`
- **Database:** Supabase (reviews, contact data)
- **Automation:** n8n workflows in `n8n-workflows/` (blog publishing, pricing sync, LAURA MCP)
- **Build:** `python3 generate_sitemap.py` (runs at deploy via netlify.toml)

## Common Commands

```bash
# Local dev — serve static site
cd frontend-production && python3 -m http.server 8000

# Local dev — run FastAPI server
pip install -r requirements.txt
python server.py

# Deploy (auto on push to main)
git push origin main

# Execution scripts
python execution/generate_sitemap.py
python execution/minify_js.py
python execution/optimize_images.py
```

## Key Directories

- `frontend-production/` — All static assets deployed to Netlify
  - `blog/` — Blog articles (each in its own subdirectory with `index.html`)
  - `pt/` — Portuguese version of the site
  - `[city]-house-cleaning/` — 12+ local SEO landing pages
  - `guides/` — Cleaning guides (deep cleaning, moving, eco-friendly)
  - `legal/` — Terms, privacy policy, cancellation
- `netlify/functions/` — Serverless API endpoints
- `n8n-workflows/` — Automation workflow JSON exports (blog publishing, pricing sync, LAURA voice agent)
- `docs/` — SEO strategies, audit reports, deployment guides, blog content calendars
- `directives/` — Agent SOPs
- `execution/` — Deterministic Python scripts
- `.tmp/` — Intermediate/temp files (never commit, always regenerated)
- `skills/` — Claude Code custom skills

## Important Patterns

- **Blog posts** follow a template at `frontend-production/blog/_TEMPLATE_ARTICLE.html`. Each post lives in `blog/[slug]/index.html`.
- **Local SEO pages** are city-specific landing pages at `frontend-production/[city]-house-cleaning/index.html`.
- **Redirects** are extensively configured in `netlify.toml` — old `/areas/[city]` URLs redirect to new format. Check there before adding new redirects.
- **API routes** are proxied: `/api/*` → Netlify Function via redirect in `netlify.toml`.
- **Environment variables** (Supabase URL, keys) are in `.env` locally and Netlify dashboard in production.
- **Self-annealing:** When something breaks, fix the script, test it, then update the directive with what you learned.

## Bilingual Site

The site has English (default) and Portuguese (`/pt/`) versions targeting the Brazilian community in Atlanta.
