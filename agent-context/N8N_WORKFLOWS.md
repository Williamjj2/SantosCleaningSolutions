# n8n Workflows

Workflows exportados em `n8n-workflows/`. São usados para automação do negócio.

## Workflows Disponíveis

| Arquivo | Descrição |
|---------|-----------|
| `blog-auto-publisher.json` | Publicação automática de posts no blog |
| `complete-blog-automation.json` | Automação completa de blog (research → write → publish) |
| `multi-agent-blog-v2.json` | Sistema multi-agente para produção de blog (56KB!) |
| `planner-agent-check.json` | Agente planejador para verificar conteúdo |
| `master-sheets-workflow.json` | Sync com Google Sheets |
| `Sync_Pricing_Sheets_to_Supabase.json` | Sincroniza pricing do Sheets para Supabase |
| `LAURA-MCP-Server.json` | LAURA agente de voz (MCP server) |
| `LAURA-MCP-Server-Fixed.json` | LAURA corrigida |
| `LAURA-Native-MCP.json` | LAURA nativa com MCP |

## Guias de Setup

| Arquivo | Descrição |
|---------|-----------|
| `SETUP-GUIDE.md` | Guia de setup dos workflows |
| `SETUP_GUIDE.md` | Guia alternativo |
| `SETUP_MULTI_AGENT.md` | Setup do sistema multi-agente |
| `IMAGE_INTEGRATION_GUIDE.md` | Integração de imagens |
| `BLOG_INDEX_FIX.md` | Fix para índice do blog |

## Content Calendar

| Arquivo | Descrição |
|---------|-----------|
| `content-calendar.csv` | Calendar de conteúdo |
| `content-calendar-template.csv` | Template |
| `content_master_plan_v4.csv` | Plano master de conteúdo (v4) |

## LAURA — Agente de Voz AI

LAURA é a assistente virtual que atende chamadas telefônicas:
- **Plataforma:** ElevenLabs Conversational AI
- **Função:** Atende chamadas, coleta informações do lead, gera cotações
- **Integração:** Salva leads em `leads_santos_cleaning` via Supabase
- **Pricing:** Usa `pricing_matrix`, `pricing_addons`, `service_areas`
- **Knowledge Base:** Usa tabela `knowledge_base` do Supabase
