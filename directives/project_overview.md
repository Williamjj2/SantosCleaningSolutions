# Santos Cleaning Solutions - Project Overview

## Goal
Maintain and enhance the Santos Cleaning Solutions website and its integrations (AI agents, n8n workflows, booking system).

## Project Structure

### Frontend (`frontend-production/`)
- Static HTML/CSS/JS website hosted on Netlify
- Admin panel for content management
- Site content stored in `site-content.json`

### Backend
- **Server**: `server.py` - Python backend handling API requests
- **Supabase**: Database and Edge Functions for bookings, contacts
- **Netlify Functions**: Serverless functions in `netlify/functions/`

### AI Integrations
- **ElevenLabs Agent (Laura)**: Voice AI for booking calls
- **n8n Workflows**: Automation workflows in `n8n-workflows/`

## Key Endpoints

| Service | Purpose |
|---------|---------|
| Netlify Site | Live website hosting |
| Supabase | Database, Auth, Edge Functions |
| ElevenLabs | Voice AI agent |
| n8n | Workflow automation |

## Execution Scripts Available
- `generate_sitemap.py` - Generate XML sitemap
- `minify_js.py` - Minify JavaScript files
- `optimize_images.py` - Optimize image assets

## Learnings
- [Add learnings from operations here]
