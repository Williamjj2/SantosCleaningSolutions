# Deploy to Netlify

## Goal
Deploy the Santos Cleaning Solutions website to Netlify production.

## Inputs
- Updated files in `frontend-production/`
- Optional: Updated `site-content.json` from Admin Panel export

## Pre-Deployment Checklist
1. Verify all images are optimized
2. Minify JavaScript files
3. Generate/update sitemap
4. Test locally if possible

## Execution

### 1. Optimize Assets (if needed)
```bash
python execution/optimize_images.py
python execution/minify_js.py
```

### 2. Generate Sitemap
```bash
python execution/generate_sitemap.py
```

### 3. Deploy via Netlify CLI
```bash
netlify deploy --prod --dir=frontend-production
```

Or push to git (auto-deploy is configured):
```bash
git add .
git commit -m "Deploy: [description]"
git push
```

## Outputs
- Live site updated at: https://santoscleaningsolutions.com

## Edge Cases
- **Build fails**: Check Netlify build logs
- **Images not loading**: Verify paths are relative and correct
- **Admin changes not reflecting**: Ensure `site-content.json` was exported and updated

## Learnings
- Netlify auto-deploys on push to main branch
- Use `netlify deploy --prod` for manual deploys
