# Santos Blog - OpenRouter + Blotato (Hybrid)

## 📋 Guia de Configuração

Este workflow usa uma abordagem híbrida para máxima compatibilidade:
- **Google Business**: Integração direta via Google API (mais confiável)
- **Facebook/Instagram/LinkedIn**: Via Blotato (mais simples)
- **Geração de Conteúdo**: OpenRouter (Claude 3.5 Sonnet)

---

## 🔧 Credenciais Necessárias

### 1. Google Business Profile (Direto)
Como o Blotato foca em vídeo/social, usamos a API oficial do Google para SEO local.

1. Acesse: https://console.cloud.google.com
2. Crie um projeto novo (ex: "Santos Automation")
3. Vá em **APIs & Services** > **Enable APIs**
4. Procure e ative: **"Google My Business API"**
5. Vá em **Credentials** > **Create Credentials** > **OAuth Client ID**
6. Tipo: Web Application
7. Redirect URI (para N8N Cloud): `https://your-n8n-instance.com/oauth2/callback`
8. No N8N:
   - Crie credencial **Google Business Profile OAuth2 API**
   - Cole o Client ID e Client Secret
   - Faça o login com a conta Google

### 2. Blotato (Outras Redes)
1. Acesse: https://blotato.com/settings/api
2. Gere sua API Key
3. No N8N: Crie credencial **Blotato API** (Header Auth)
   - `Authorization: Bearer YOUR_KEY`

### 3. OpenRouter (AI)
1. Acesse: https://openrouter.ai/keys
2. Gere API Key
3. No N8N: Crie credencial **OpenRouter API** (Header Auth)
   - `Authorization: Bearer sk-or-...`

---

## 🚀 Passo a Passo

### Passo 1: Google Business ID
Para postar no Google, você precisa do `Account ID` e `Location ID`.
1. Acesse: https://business.google.com/locations
2. Clique na sua empresa
3. A URL terá o formato: `.../locations/1234567890` (esse é o Location ID)
4. Para o Account ID, geralmente está disponível nas configurações avançadas ou via API.
   - *Dica: Se tiver dificuldade, posso criar um mini-workflow só para listar esses IDs.*

### Passo 2: Blotato IDs
1. No Blotato, conecte Facebook, Instagram e LinkedIn.
2. Copie os IDs das contas conectadas em Settings.

### Passo 3: IDs no Workflow
Substitua no JSON importado:

```json
"YOUR_GOOGLE_OAUTH_ID" -> ID da credencial N8N
"YOUR_BLOTATO_API_KEY_ID" -> ID da credencial N8N
"YOUR_GOOGLE_ACCOUNT_ID" -> ID numérico da conta Google
"YOUR_LOCATION_ID" -> ID numérico da localização (loja)
"YOUR_FACEBOOK_ACCOUNT_ID" -> ID do Facebook no Blotato
"YOUR_INSTAGRAM_ACCOUNT_ID" -> ID do Instagram no Blotato
```

---

## 📊 Estrutura

| Canal | Método | Por que? |
|-------|--------|----------|
| **Google** | API Direta | Melhor para SEO local, não depende de terceiros |
| **Facebook** | Blotato | Simplifica a conexão e formatos |
| **Instagram** | Blotato | Simplifica a conexão e formatos |
| **Blog** | GitHub | Hospedagem gratuita e rápida |

---
