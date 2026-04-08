# Variáveis de Ambiente (.env)

## Supabase

| Variável | Valor |
|----------|-------|
| `SUPABASE_URL` | `https://rxqcapmvebsdaehspcjk.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4cWNhcG12ZWJzZGFlaHNwY2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODIwMjU3MSwiZXhwIjoyMDYzNzc4NTcxfQ.5ipgUTH47X4am4SzVoSnazAOMoE5MAwnSrqUI9YGvDM` |
| Supabase Project ID | `rxqcapmvebsdaehspcjk` |

## Netlify

| Variável | Valor |
|----------|-------|
| `NETLIFY_AUTH_TOKEN` | `nfp_Rs8YrJedyanUxQ5vewwWVF9XgghjMMNpdcc4` |
| `NETLIFY_SITE_ID` | `1e749d93-cc3d-402d-8b89-ded0fa5931e7` |

## Server

| Variável | Valor |
|----------|-------|
| `PORT` | `8001` |
| `HOST` | `0.0.0.0` |

## MongoDB (opcional — fallback)

| Variável | Valor |
|----------|-------|
| `MONGO_URL` | `mongodb://localhost:27017` |

## Infraestrutura Externa (de conversas anteriores)

| Recurso | Detalhes |
|---------|----------|
| **VPS** | `147.93.0.63` (user: `root`, pass: `LSF*vo7_Dt`) |
| **Chatwoot** | `chat.williamjj.com` (self-hosted no VPS) |
| **n8n** | Self-hosted (workflows exportados em `n8n-workflows/`) |

## Onde são usadas

- **Em produção (Netlify)**: `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são configuradas no Netlify Dashboard como variáveis de ambiente
- **Localmente**: Ficam no arquivo `.env` na raiz do projeto
- **Netlify Functions** (`api.js`): Lê `process.env.SUPABASE_URL` e `process.env.SUPABASE_SERVICE_ROLE_KEY`
- **FastAPI** (`server.py`): Lê via `python-dotenv` do `.env`
