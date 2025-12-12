# 🚀 Guia de Setup Rápido - Blog Automation N8N

## Passo 1: Criar Google Sheet (2 min)

1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie nova planilha: "Santos Blog Calendar"
3. Importe o CSV: `n8n-workflows/content-calendar-template.csv`
4. **Publique na web:**
   - File → Share → Publish to web
   - Configurar: Entire Document → CSV
   - Copie o link gerado

---

## Passo 2: Obter Credenciais (5 min)

### A. OpenRouter API Key
1. Acesse [openrouter.ai/keys](https://openrouter.ai/keys)
2. Crie conta ou faça login
3. Clique "Create Key"
4. Copie a chave (começa com `sk-or-...`)

### B. GitHub Token
1. Acesse [GitHub Tokens](https://github.com/settings/tokens?type=beta)
2. "Generate new token (Fine-grained)"
3. Nome: "N8N Blog Automation"
4. Repositório: `Williamjj2/SantosCleaningSolutions`
5. Permissions: Contents → Read and Write
6. Copie o token

### C. Telegram Bot (Opcional)
1. Abra Telegram, busque @BotFather
2. Envie: `/newbot`
3. Nome: "Santos Blog Bot"
4. Username: `santoscleaning_blog_bot`
5. Copie o token do bot
6. Inicie conversa com seu bot
7. Acesse: `https://api.telegram.org/bot<TOKEN>/getUpdates`
8. Envie mensagem e copie o `chat_id`

---

## Passo 3: Importar no N8N (3 min)

1. Abra seu N8N
2. Clique + → Import from file
3. Selecione: `n8n-workflows/complete-blog-automation.json`
4. Configure as credenciais:

### Credenciais a Criar no N8N:

| Nome | Tipo | Valor |
|------|------|-------|
| OpenRouter API | Header Auth | `Authorization: Bearer sk-or-...` |
| GitHub Token | Header Auth | `Authorization: token ghp_...` |

---

## Passo 4: Configurar Nodes (2 min)

### 4.1 Get Content Calendar
- Substitua URL com seu link do Google Sheet publicado

### 4.2 Generate Article (OpenRouter)
- Selecione credencial: "OpenRouter API"

### 4.3 Publish to GitHub
- Selecione credencial: "GitHub Token"

### 4.4 Notify Telegram
- Substitua `YOUR_BOT_TOKEN` pelo token
- Substitua `YOUR_CHAT_ID` pelo chat_id

---

## Passo 5: Testar! (1 min)

1. Clique "Test Workflow"
2. Verifique se artigo foi criado no GitHub
3. Confirme deploy no Netlify
4. Veja notificação no Telegram

---

## ✅ Pronto!

O workflow rodará automaticamente toda **Segunda, Quarta e Sexta às 9:00 AM**.

### Links Úteis:
- [Ver Blog](https://santoscsolutions.com/blog/)
- [GitHub Repo](https://github.com/Williamjj2/SantosCleaningSolutions)
- [Netlify Dashboard](https://app.netlify.com/projects/santoscleaningsolutions)
