# API Endpoints

## Produção — Netlify Functions (`netlify/functions/api.js`)

Base URL: `https://santoscsolutions.com/api`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check |
| GET | `/api/reviews` | Lista reviews do Google (via Supabase, max 50) |
| GET | `/api/reviews/stats` | Estatísticas: média, total, source |
| POST | `/api/webhook/reviews-update` | Webhook para n8n enviar reviews (dedup por review_id + conteúdo) |
| GET | `/api/blog` | Lista blog posts publicados (Supabase) |
| GET | `/api/blog/:slug` | Post individual por slug |
| POST | `/api/blog/publish` | Publica post (chamado pelo n8n) |
| GET | `/api/sitemap-blog.xml` | Sitemap dinâmico dos blogs (XML) |

## Legacy — FastAPI (`server.py`, port 8001)

Usado **apenas para dev local**. Mesmos endpoints + extras:

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check |
| POST | `/api/contact` | Submissão de formulário (Supabase + fallback MongoDB) |
| GET | `/api/reviews` | Reviews com deduplicação (hash MD5) |
| GET | `/api/reviews/stats` | Stats com distribuição de estrelas |
| POST | `/api/webhook/reviews-update` | Webhook reviews (dedup avançada) |
| GET | `/api/services` | Lista serviços (MongoDB) |
| POST | `/api/bookings` | Criar booking (MongoDB) |
| POST | `/api/reviews` | Submeter review (precisa aprovação) |
| GET | `/api/leads` | Listar leads (Supabase + fallback MongoDB) |
| PUT | `/api/leads/:id` | Atualizar lead |
| DELETE | `/api/leads/:id` | Deletar lead |

## Netlify Redirects (netlify.toml)

```toml
# API proxy
/api/* → /.netlify/functions/api/:splat (200)

# SPA fallback
/* → /index.html (200)
```

## Headers de Cache (netlify.toml)

Assets estáticos (`.js`, `.css`, `.webp`, `.png`, `.jpg`, `.svg`) → `Cache-Control: public, max-age=31536000, immutable`
