# 🚀 Setup: Multi-Agent Blog Workflow (v2)

## Pré-requisitos
- ✅ OpenRouter API configurado no n8n
- ✅ GitHub Token configurado no n8n
- ✅ Google Sheets já configurado: [Content Calendar](https://docs.google.com/spreadsheets/d/16y9_TB3KLK5iidYYE2JwKg8iqfW6-alhc6PFbI2GSfw)
- Telegram Bot (opcional, para notificações)

---

## Passo 1: Importar Workflow

1. No n8n, clique **+** → **Import from file**
2. Selecione: `multi-agent-blog-v2.json`
3. Clique **Import**

---

## Passo 2: Configurar Google Sheets

✅ **A planilha já está configurada no workflow!**

**Colunas necessárias na aba "Content Calendar":**

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| `status` | pending ou published | pending |
| `title` | Título do artigo | How Much Does Cleaning Cost? |
| `slug` | URL-friendly | house-cleaning-cost-atlanta |
| `category` | Categoria | Pricing |
| `primary_keyword` | Keyword principal | house cleaning cost atlanta |
| `secondary_keywords` | Keywords extras | maid service prices; rates |
| `target_city` | Cidade alvo | Atlanta |
| `word_count` | Palavras mínimas | 1800 |
| `read_time` | Tempo leitura (min) | 7 |
| `published_date` | Preenchido auto | - |
| `quality_score` | Preenchido auto | - |

---

## Passo 3: Conectar Credenciais

Clique em cada nó e conecte suas credenciais existentes:

| Nó | Credencial |
|----|------------|
| `🔍 Agent 1: Research` | OpenRouter API |
| `📋 Agent 2: Strategist` | OpenRouter API |
| `✍️ Agent 3: Writer` | OpenRouter API |
| `🎯 Agent 4: SEO` | OpenRouter API |
| `✅ Agent 5: Quality Review` | OpenRouter API |
| `🐙 Publish to GitHub` | GitHub Token |
| `📊 Get Next Article` | Google Sheets (se usar) |
| `📊 Update Sheet` | Google Sheets (se usar) |

---

## Passo 4: Testar

### Opção A: Com Google Sheets
1. Crie uma planilha com as colunas do template CSV
2. Adicione 1 artigo com `status: pending`
3. Execute o workflow

### Opção B: Manual (Teste Rápido)
1. Desconecte o nó `📊 Get Next Article`
2. Adicione um nó `Set` após o Schedule com dados de teste:
```json
{
  "title": "How Much Does House Cleaning Cost in Atlanta?",
  "slug": "house-cleaning-cost-atlanta-2025",
  "category": "Pricing",
  "primary_keyword": "house cleaning cost atlanta",
  "secondary_keywords": "maid service prices; cleaning rates",
  "target_city": "Atlanta",
  "word_count": 1800
}
```
3. Execute manualmente

---

## Fluxo de Execução

```
⏰ Schedule (Seg/Qua/Sex 9AM)
    ↓
📊 Get Article from Sheet
    ↓
🔍 Research Agent → Pesquisa competidores, FAQs, dados locais
    ↓
📋 Strategist Agent → Cria outline único
    ↓
✍️ Writer Agent → Escreve artigo premium (1800+ palavras)
    ↓
🎯 SEO Agent → Otimiza meta tags, schema
    ↓
✅ Quality Agent → Avalia score (0-100)
    ↓
🚦 Quality Gate
    ├─ Score >= 85 → 🏗️ Build HTML → 🐙 GitHub → 📱 Telegram ✅
    └─ Score < 85 → 🔄 Retry (max 2x) ou ⚠️ Notify Failure
```

---

## Métricas do Quality Agent

| Critério | Peso | O que avalia |
|----------|------|--------------|
| Word Count | 15% | >= 1500 palavras |
| Originalidade | 25% | Evita frases genéricas de IA |
| Dados Locais | 20% | Menciona Atlanta, preços reais |
| Estrutura | 15% | H2, listas, CTAs, FAQ |
| SEO | 15% | Keywords, meta description |
| Engajamento | 10% | Hook forte, exemplos |

**Threshold: 85/100 para publicação**

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| "Rate limit exceeded" | Adicione nó `Wait` entre agentes |
| Artigo muito curto | Aumente `word_count` na planilha |
| Falha no Quality | Verifique logs do agente para issues |
| GitHub 404 | Verifique se pasta `blog/` existe |

---

## Custos Estimados

| Modelo | Custo/Artigo | Total/Mês (12 artigos) |
|--------|--------------|------------------------|
| Claude 3.5 Sonnet | ~$0.15 | ~$1.80 |
| GPT-4o | ~$0.10 | ~$1.20 |

**Total estimado: ~$2-3/mês** para 12 artigos premium
