# Project Overview — Santos Cleaning Solutions

## O que é

Site profissional de serviços de limpeza residencial para a **Atlanta Metro Area** (Georgia, EUA).

- **Empresa:** Santos Cleaning Solutions LLC
- **Site Live:** https://santoscsolutions.com
- **Telefone:** (866) 350-9407
- **Email:** contact@santoscsolutions.com

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React (Vite + TypeScript + Tailwind) → build estático em `dist/public/` |
| **Routing** | Wouter (client-side SPA) |
| **Backend API (produção)** | Netlify Functions (Node.js) em `netlify/functions/api.js` |
| **Backend API (legacy/dev)** | FastAPI (Python 3.9) em `server.py` — só para dev local |
| **Database** | Supabase (PostgreSQL) — project ID: `rxqcapmvebsdaehspcjk` |
| **Hosting** | Netlify — auto-deploy ao push para `main` |
| **Automação** | n8n (workflows exportados em `n8n-workflows/`) |
| **Agente de Voz** | LAURA — ElevenLabs Conversational AI |
| **Mensagens (SMS)** | Twilio (via n8n / Supabase) |
| **Chat** | Chatwoot em `chat.williamjj.com` |

## Arquitetura 3 Camadas

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   DIRECTIVES    │     │  ORCHESTRATION  │     │   EXECUTION     │
│   (Markdown)    │────▶│  (AI Agent)     │────▶│  (Python/JS)    │
│   directives/   │     │  Decision Layer │     │  execution/     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. **Directives** (`directives/`): SOPs em Markdown — definem goals, inputs, tools, outputs
2. **Orchestration** (Agente AI): Lê directives, toma decisões, chama scripts
3. **Execution** (`execution/`): Scripts Python determinísticos para API calls, data processing

## Estrutura de Diretórios Principais

```
SantosCleaningSolutions/
├── frontend-production/     # Arquivos estáticos (NÃO USADO em prod — ver dist/)
├── dist/public/             # Build final servido pelo Netlify
├── src/                     # Código-fonte React (Vite)
│   ├── App.tsx              # Router principal
│   ├── components/          # Componentes React
│   ├── pages/               # Páginas (Home, Blog, Contact, etc.)
│   └── index.css            # Estilos globais
├── netlify/functions/       # Serverless API (produção)
│   └── api.js               # Endpoint principal
├── n8n-workflows/           # Workflows de automação
├── docs/                    # Documentação interna
├── skills/                  # Skills Claude Code
├── directives/              # SOPs para agentes
├── execution/               # Scripts Python
├── server.py                # FastAPI (legacy, dev only)
├── netlify.toml             # Config Netlify (redirects, headers, build)
├── .env                     # Variáveis de ambiente (não no git)
└── package.json             # Deps Node.js
```

## Site Bilíngue

- **Inglês** (padrão): `/`
- **Português** (BR community in Atlanta): `/pt/`

## Features Principais

- 12+ páginas de SEO local (Marietta, Alpharetta, Buckhead, etc.)
- Blog profissional com SEO optimization
- Integração Google Reviews via Supabase
- Publicação automática de conteúdo via n8n
- Sistema de leads (contact forms → Supabase)
- Agente de voz LAURA (ElevenLabs) para atendimento
- Sistema de pricing com addons e campaigns
- Bookings/agendamentos
- SMS messaging via Twilio
