# Deployment

## Produção — Netlify

- **Site URL:** https://santoscsolutions.com
- **Netlify App:** https://app.netlify.com (Site ID: `1e749d93-cc3d-402d-8b89-ded0fa5931e7`)
- **Publish directory:** `dist/public`
- **Build command:** `echo 'Pre-built site, no build step needed'` (site é pré-buildado)
- **Node version:** 20
- **Auto-deploy:** Push para branch `main` → deploy automático

### Deploy Manual

```bash
# Push para auto-deploy
git add .
git commit -m "Your message"
git push origin main
```

### Build Local (se necessário)

```bash
# O Vite compila para dist/public/
npm run build
```

### Variáveis de Ambiente no Netlify Dashboard

As seguintes variáveis precisam estar configuradas no Netlify:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Dev Local

### Servir site estático
```bash
cd frontend-production
python3 -m http.server 8000
# Abrir http://localhost:8000
```

### Rodar FastAPI (API completa)
```bash
pip install -r requirements.txt
python server.py
# API rodando em http://localhost:8001
```

### Rodar Vite (dev com HMR)
```bash
npm install
npm run dev
# Dev server em http://localhost:5173
```

## netlify.toml — Configuração Completa

```toml
[build]
  publish = "dist/public"
  command = "echo 'Pre-built site, no build step needed'"

[build.environment]
  NODE_VERSION = "20"

[functions]
  directory = "netlify/functions"

# API proxy
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

# SPA fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Cache headers para assets estáticos (1 ano)
# .js, .css, .webp, .png, .jpg, .svg
```

## Git

- **Repo:** Williamjj2/SantosCleaningSolutions
- **Branch padrão:** `main`
- **`.gitignore`** inclui: `.env`, `node_modules/`, `.venv/`, `.tmp/`, `.DS_Store`
