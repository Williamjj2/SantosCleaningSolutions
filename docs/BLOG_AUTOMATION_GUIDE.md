# 📝 Blog Automation Guide - Santos Cleaning Solutions

## Guia Completo para Geração Automática de Artigos

Este documento descreve como um agente de IA (N8N, Make, ou outro) deve criar e publicar artigos no blog.

---

## 📊 Visão Geral

| Item | Valor |
|------|-------|
| **Frequência** | 3x por semana (Seg, Qua, Sex) |
| **Horário** | 9:00 AM EST |
| **Formato** | HTML estático |
| **Destino** | GitHub → Netlify (auto-deploy) |
| **Diretório** | `frontend-production/blog/` |

---

## 🔧 MÉTODO 1: Via GitHub API (Recomendado)

### Endpoint
```
PUT https://api.github.com/repos/Williamjj2/SantosCleaningSolutions/contents/frontend-production/blog/{filename}.html
```

### Headers Necessários
```json
{
  "Authorization": "Bearer {GITHUB_TOKEN}",
  "Content-Type": "application/json",
  "Accept": "application/vnd.github.v3+json"
}
```

### Body da Request
```json
{
  "message": "Add new blog post: {TITULO_DO_ARTIGO}",
  "content": "{CONTEUDO_HTML_EM_BASE64}",
  "branch": "main"
}
```

### Exemplo em JavaScript (N8N Code Node)
```javascript
const filename = 'house-cleaning-cost-atlanta-2025.html';
const htmlContent = `<!DOCTYPE html>...`; // HTML completo do artigo

// Converter para Base64
const base64Content = Buffer.from(htmlContent).toString('base64');

return {
  json: {
    message: `Add blog post: ${filename}`,
    content: base64Content,
    branch: 'main'
  }
};
```

---

## 🔧 MÉTODO 2: Via Webhook (Alternativo)

Se preferir um webhook personalizado, pode criar uma Netlify Function:

### Endpoint (a criar)
```
POST https://santoscsolutions.com/api/blog/publish
```

### Body
```json
{
  "title": "How Much Does House Cleaning Cost in Atlanta?",
  "slug": "house-cleaning-cost-atlanta-2025",
  "content": "<article>...</article>",
  "category": "Pricing",
  "author": "Santos Cleaning Team",
  "publishDate": "2025-01-15"
}
```

---

## 📄 TEMPLATE HTML OBRIGATÓRIO

O agente DEVE gerar artigos seguindo exatamente este template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO PRIMARY -->
    <title>{{TITULO}} | Santos Cleaning Solutions</title>
    <meta name="description" content="{{META_DESCRIPTION_150_CHARS}}">
    <meta name="keywords" content="{{KEYWORD1}}, {{KEYWORD2}}, {{KEYWORD3}}, house cleaning atlanta">
    
    <!-- CANONICAL & HREFLANG -->
    <link rel="canonical" href="https://santoscsolutions.com/blog/{{SLUG}}.html">
    <link rel="alternate" hreflang="en-us" href="https://santoscsolutions.com/blog/{{SLUG}}.html">
    
    <!-- OPEN GRAPH -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="{{TITULO}}">
    <meta property="og:description" content="{{META_DESCRIPTION}}">
    <meta property="og:url" content="https://santoscsolutions.com/blog/{{SLUG}}.html">
    <meta property="og:image" content="https://santoscsolutions.com/images/blog/{{SLUG}}.jpg">
    <meta property="og:site_name" content="Santos Cleaning Solutions">
    <meta property="article:published_time" content="{{DATA_ISO}}">
    <meta property="article:author" content="Santos Cleaning Team">
    
    <!-- TWITTER -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{TITULO}}">
    <meta name="twitter:description" content="{{META_DESCRIPTION}}">
    
    <!-- FAVICON -->
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="/favicon.ico">
    
    <!-- FONTS -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- ARTICLE SCHEMA -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "{{TITULO}}",
        "description": "{{META_DESCRIPTION}}",
        "image": "https://santoscsolutions.com/images/blog/{{SLUG}}.jpg",
        "author": {
            "@type": "Organization",
            "name": "Santos Cleaning Solutions",
            "url": "https://santoscsolutions.com"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Santos Cleaning Solutions",
            "logo": {
                "@type": "ImageObject",
                "url": "https://santoscsolutions.com/images/logo.png"
            }
        },
        "datePublished": "{{DATA_ISO}}",
        "dateModified": "{{DATA_ISO}}",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://santoscsolutions.com/blog/{{SLUG}}.html"
        }
    }
    </script>
    
    <!-- FAQ SCHEMA (se tiver perguntas) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {{FAQ_ITEMS_JSON}}
        ]
    }
    </script>
    
    <style>
        /* Reset & Base */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        :root {
            --primary-blue: #0F265C;
            --accent-gold: #BFA05A;
            --text-dark: #1a1a2e;
            --text-light: #64748b;
            --bg-light: #f8fafc;
            --white: #ffffff;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.7;
            color: var(--text-dark);
            background: var(--bg-light);
        }
        
        /* Header */
        .blog-header {
            background: linear-gradient(135deg, var(--primary-blue) 0%, #1a3a7c 100%);
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo-area {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-decoration: none;
            color: white;
        }
        
        .logo-area img {
            height: 45px;
            width: auto;
        }
        
        .logo-text h1 {
            font-size: 1.25rem;
            font-weight: 700;
            margin: 0;
        }
        
        .logo-text p {
            font-size: 0.75rem;
            opacity: 0.8;
            margin: 0;
        }
        
        .header-nav {
            display: flex;
            gap: 1.5rem;
            align-items: center;
        }
        
        .header-nav a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.9rem;
            transition: opacity 0.2s;
        }
        
        .header-nav a:hover {
            opacity: 0.8;
        }
        
        .cta-button {
            background: var(--accent-gold);
            color: var(--primary-blue);
            padding: 0.6rem 1.25rem;
            border-radius: 6px;
            font-weight: 600;
            text-decoration: none;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(191, 160, 90, 0.4);
        }
        
        /* Hero Image */
        .article-hero {
            width: 100%;
            height: 400px;
            object-fit: cover;
            display: block;
        }
        
        /* Main Content */
        .article-container {
            max-width: 800px;
            margin: -60px auto 3rem;
            padding: 0 1.5rem;
            position: relative;
            z-index: 10;
        }
        
        .article-content {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            padding: 3rem;
        }
        
        /* Breadcrumb */
        .breadcrumb {
            display: flex;
            gap: 0.5rem;
            font-size: 0.85rem;
            margin-bottom: 1.5rem;
            color: var(--text-light);
        }
        
        .breadcrumb a {
            color: var(--primary-blue);
            text-decoration: none;
        }
        
        .breadcrumb a:hover {
            text-decoration: underline;
        }
        
        /* Article Meta */
        .article-meta {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
            color: var(--text-light);
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        
        .category-badge {
            background: var(--accent-gold);
            color: var(--primary-blue);
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        /* Typography */
        h1.article-title {
            font-family: 'Merriweather', serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--text-dark);
            line-height: 1.3;
            margin-bottom: 1.5rem;
        }
        
        h2 {
            font-family: 'Merriweather', serif;
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-dark);
            margin: 2.5rem 0 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 3px solid var(--accent-gold);
        }
        
        h3 {
            font-size: 1.35rem;
            font-weight: 600;
            color: var(--text-dark);
            margin: 2rem 0 0.75rem;
        }
        
        p {
            margin-bottom: 1.25rem;
            color: var(--text-dark);
        }
        
        ul, ol {
            margin: 1rem 0 1.5rem 1.5rem;
        }
        
        li {
            margin-bottom: 0.5rem;
        }
        
        /* CTA Box */
        .cta-box {
            background: linear-gradient(135deg, var(--primary-blue) 0%, #1a3a7c 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            margin: 2rem 0;
            text-align: center;
        }
        
        .cta-box h3 {
            color: white;
            margin-bottom: 0.75rem;
        }
        
        .cta-box p {
            color: rgba(255,255,255,0.9);
            margin-bottom: 1.25rem;
        }
        
        .cta-box .cta-button {
            display: inline-block;
            font-size: 1.1rem;
            padding: 0.75rem 2rem;
        }
        
        /* FAQ Section */
        .faq-section {
            background: var(--bg-light);
            padding: 2rem;
            border-radius: 12px;
            margin: 2rem 0;
        }
        
        .faq-item {
            background: white;
            border-radius: 8px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .faq-question {
            font-weight: 600;
            color: var(--primary-blue);
            margin-bottom: 0.5rem;
        }
        
        .faq-answer {
            color: var(--text-light);
            margin: 0;
        }
        
        /* Table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        th, td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        
        th {
            background: var(--primary-blue);
            color: white;
            font-weight: 600;
        }
        
        tr:hover {
            background: #f8fafc;
        }
        
        /* Footer */
        .blog-footer {
            background: #1a1a2e;
            color: white;
            padding: 3rem 0 1.5rem;
            margin-top: 3rem;
        }
        
        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
        }
        
        .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .footer-section h4 {
            color: var(--accent-gold);
            margin-bottom: 1rem;
            font-size: 1rem;
        }
        
        .footer-section a {
            color: #94a3b8;
            text-decoration: none;
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        
        .footer-section a:hover {
            color: white;
        }
        
        .footer-bottom {
            border-top: 1px solid #334155;
            padding-top: 1.5rem;
            text-align: center;
            color: #64748b;
            font-size: 0.85rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .header-nav { display: none; }
            h1.article-title { font-size: 1.75rem; }
            .article-content { padding: 1.5rem; }
            .article-hero { height: 250px; }
            .article-container { margin-top: -30px; }
        }
    </style>
</head>
<body>
    <!-- HEADER -->
    <header class="blog-header">
        <div class="header-content">
            <a href="/" class="logo-area">
                <img src="/images/logo.png" alt="Santos Cleaning Solutions">
                <div class="logo-text">
                    <h1>Santos Cleaning Solutions</h1>
                    <p>Professional Cleaning Services</p>
                </div>
            </a>
            <nav class="header-nav">
                <a href="/">Home</a>
                <a href="/services">Services</a>
                <a href="/blog/">Blog</a>
                <a href="/contact">Contact</a>
                <a href="tel:+18663509407" class="cta-button">
                    <i class="fas fa-phone"></i> (866) 350-9407
                </a>
            </nav>
        </div>
    </header>

    <!-- HERO IMAGE -->
    <img src="{{HERO_IMAGE_URL}}" alt="{{TITULO}}" class="article-hero">

    <!-- ARTICLE -->
    <main class="article-container">
        <article class="article-content">
            <!-- Breadcrumb -->
            <nav class="breadcrumb">
                <a href="/">Home</a> <span>›</span>
                <a href="/blog/">Blog</a> <span>›</span>
                <span>{{TITULO_CURTO}}</span>
            </nav>
            
            <!-- Meta -->
            <div class="article-meta">
                <span class="category-badge">{{CATEGORIA}}</span>
                <span class="meta-item"><i class="fas fa-calendar"></i> {{DATA_FORMATADA}}</span>
                <span class="meta-item"><i class="fas fa-clock"></i> {{TEMPO_LEITURA}} min read</span>
            </div>
            
            <!-- Title -->
            <h1 class="article-title">{{TITULO}}</h1>
            
            <!-- CONTEÚDO DO ARTIGO AQUI -->
            {{CONTEUDO_ARTIGO}}
            
            <!-- CTA Box -->
            <div class="cta-box">
                <h3>Ready for a Spotless Home?</h3>
                <p>Get a free quote from Atlanta's most trusted cleaning service.</p>
                <a href="tel:+18663509407" class="cta-button">
                    <i class="fas fa-phone"></i> Call (866) 350-9407
                </a>
            </div>
            
            <!-- FAQ Section (se aplicável) -->
            {{FAQ_SECTION_HTML}}
        </article>
    </main>

    <!-- FOOTER -->
    <footer class="blog-footer">
        <div class="footer-content">
            <div class="footer-grid">
                <div class="footer-section">
                    <h4>Services</h4>
                    <a href="/services">Deep Cleaning</a>
                    <a href="/services">Regular Maintenance</a>
                    <a href="/services">Move In/Out Cleaning</a>
                </div>
                <div class="footer-section">
                    <h4>Service Areas</h4>
                    <a href="/marietta-house-cleaning/">Marietta</a>
                    <a href="/alpharetta-house-cleaning/">Alpharetta</a>
                    <a href="/buckhead-house-cleaning/">Buckhead</a>
                    <a href="/sandy-springs-house-cleaning/">Sandy Springs</a>
                </div>
                <div class="footer-section">
                    <h4>Contact</h4>
                    <a href="tel:+18663509407">(866) 350-9407</a>
                    <a href="mailto:info@santoscsolutions.com">info@santoscsolutions.com</a>
                    <a href="/contact">Get Free Quote</a>
                </div>
                <div class="footer-section">
                    <h4>Legal</h4>
                    <a href="/legal/privacy-policy">Privacy Policy</a>
                    <a href="/legal/terms-of-service">Terms of Service</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© 2025 Santos Cleaning Solutions LLC. Licensed & Insured. Serving Atlanta Metro.</p>
            </div>
        </div>
    </footer>
</body>
</html>
```

---

## 📋 VARIÁVEIS DO TEMPLATE

O agente deve substituir estas variáveis:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `{{TITULO}}` | Título completo do artigo | "How Much Does House Cleaning Cost in Atlanta? (2025 Guide)" |
| `{{TITULO_CURTO}}` | Título resumido para breadcrumb | "Cleaning Cost Atlanta" |
| `{{SLUG}}` | URL-friendly (lowercase, hyphens) | "house-cleaning-cost-atlanta-2025" |
| `{{META_DESCRIPTION}}` | 150-160 caracteres para SEO | "Discover house cleaning prices in Atlanta for 2025. Deep cleaning $150-400. Regular maintenance $80-200. Free estimates available." |
| `{{DATA_ISO}}` | Data no formato ISO | "2025-01-15T09:00:00-05:00" |
| `{{DATA_FORMATADA}}` | Data legível | "January 15, 2025" |
| `{{CATEGORIA}}` | Categoria do post | "Pricing", "Tips", "Local Guide" |
| `{{TEMPO_LEITURA}}` | Minutos estimados | "7" |
| `{{HERO_IMAGE_URL}}` | URL da imagem principal | "https://images.unsplash.com/photo-xxx" |
| `{{CONTEUDO_ARTIGO}}` | HTML do corpo do artigo | `<h2>...</h2><p>...</p>` |
| `{{FAQ_SECTION_HTML}}` | Seção FAQ em HTML (opcional) | Ver abaixo |
| `{{FAQ_ITEMS_JSON}}` | FAQs para Schema.org | Ver abaixo |

---

## 📝 ESTRUTURA DO CONTEÚDO

O agente deve gerar artigos com esta estrutura:

```
1. INTRODUÇÃO (150-200 palavras)
   - Hook que prende atenção
   - Preview do que será abordado
   - Palavra-chave principal

2. SEÇÃO PRINCIPAL 1 (H2)
   - 200-300 palavras
   - Listas quando aplicável
   - Palavra-chave secundária

3. SEÇÃO PRINCIPAL 2 (H2)
   - 200-300 palavras
   - Tabela de preços/comparação (se relevante)

4. SEÇÃO PRINCIPAL 3 (H2)
   - 200-300 palavras
   - Checklist ou dicas práticas

5. CTA INTERMEDIÁRIO (cta-box)
   - Chamada para ação

6. FAQ SECTION (3-5 perguntas)
   - Perguntas reais dos clientes
   - Respostas concisas

7. CONCLUSÃO (100-150 palavras)
   - Resumo dos pontos principais
   - CTA final

TOTAL: 1200-1800 palavras
```

---

## 🎨 IMAGENS

### Fontes de Imagens Gratuitas
- **Unsplash**: `https://images.unsplash.com/photo-{ID}?w=1200&h=600&fit=crop`
- **Pexels**: Via API ou URL direta

### IDs de Imagens Sugeridos (Unsplash)
```
Limpeza geral: 1558618666-fcd25c85cd64
Cozinha: 1556909114-f6e7ad7d3136
Banheiro: 1552321554-5fefe8c9ef14
Sala: 1560448204-e02f11c3d0e2
Produtos eco: 1563453392-352cd9b4292c
Equipe: 1581578731-6eb168ab4571
```

---

## 📊 CALENDÁRIO DE CONTEÚDO

Referência: `docs/BLOG_CONTENT_CALENDAR.md`

O agente deve seguir o calendário ou gerar tópicos seguindo estas categorias:

| Categoria | % do Conteúdo | Exemplos |
|-----------|---------------|----------|
| **Local SEO** | 30% | "House Cleaning in [Cidade]" |
| **Pricing** | 20% | "How Much Does X Cost" |
| **Tips & Guides** | 25% | "Deep Cleaning Checklist" |
| **Seasonal** | 15% | "Spring Cleaning Guide" |
| **FAQ** | 10% | "What to Expect from..." |

---

## 🔄 FLUXO DE PUBLICAÇÃO

```
┌─────────────────┐
│  1. SCHEDULE    │ → Seg/Qua/Sex 9AM EST
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. GET TOPIC   │ → Do calendário ou gerar novo
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. GENERATE    │ → AI cria o conteúdo HTML
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  4. VALIDATE    │ → Verificar HTML válido
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  5. PUBLISH     │ → PUT no GitHub API
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  6. NOTIFY      │ → Telegram/Email (opcional)
└─────────────────┘
```

---

## ✅ CHECKLIST PRÉ-PUBLICAÇÃO

O agente deve verificar antes de publicar:

- [ ] Título tem palavra-chave principal
- [ ] Meta description tem 150-160 caracteres
- [ ] Slug é URL-friendly (lowercase, hyphens only)
- [ ] Imagem hero funciona
- [ ] Artigo tem 1200+ palavras
- [ ] Tem pelo menos 3 seções H2
- [ ] Tem CTA box
- [ ] FAQ tem 3+ perguntas
- [ ] Schema JSON é válido
- [ ] Links internos incluídos
- [ ] Telefone (866) 350-9407 aparece

---

## 🔗 LINKS INTERNOS OBRIGATÓRIOS

Cada artigo deve incluir pelo menos 2 destes links:

```html
<a href="/">Home</a>
<a href="/services">Our Services</a>
<a href="/contact">Get Free Quote</a>
<a href="/blog/">More Articles</a>
<a href="/marietta-house-cleaning/">Marietta Cleaning</a>
<a href="/alpharetta-house-cleaning/">Alpharetta Cleaning</a>
<a href="/buckhead-house-cleaning/">Buckhead Cleaning</a>
<a href="tel:+18663509407">(866) 350-9407</a>
```

---

## 📞 CONTATO & CTAs

Sempre usar estas informações:

| Campo | Valor |
|-------|-------|
| **Telefone** | (866) 350-9407 |
| **Email** | info@santoscsolutions.com |
| **Website** | https://santoscsolutions.com |
| **Áreas** | Atlanta Metro (Marietta, Alpharetta, Buckhead, etc.) |

---

## 🎯 PALAVRAS-CHAVE PRINCIPAIS

Priorizar estas keywords nos artigos:

```
house cleaning atlanta
house cleaning marietta ga
deep cleaning atlanta
maid service buckhead
cleaning service near me atlanta
house cleaning cost atlanta
move out cleaning marietta
apartment cleaning alpharetta
eco friendly cleaning atlanta
professional house cleaning georgia
```

---

## 📁 ARQUIVOS DE REFERÊNCIA

| Arquivo | Caminho |
|---------|---------|
| Template Completo | `frontend-production/blog/_TEMPLATE_ARTICLE.html` |
| Calendário | `docs/BLOG_CONTENT_CALENDAR.md` |
| Workflow N8N | `n8n-workflows/blog-auto-publisher.json` |
| Artigo Exemplo | `frontend-production/blog/house-cleaning-marietta-ga-guide.html` |

---

## 🔐 CREDENCIAIS NECESSÁRIAS

Para o N8N ou outro automation tool:

| Credencial | Onde Configurar |
|------------|-----------------|
| `GITHUB_TOKEN` | GitHub Settings → Developer Settings → Personal Access Tokens |
| `OPENAI_API_KEY` | platform.openai.com/api-keys |
| `TELEGRAM_BOT_TOKEN` | @BotFather no Telegram (opcional) |
| `TELEGRAM_CHAT_ID` | Via @userinfobot (opcional) |

---

## 📤 EXEMPLO COMPLETO DE REQUEST

```javascript
// N8N HTTP Request Node - Publicar no GitHub
const slug = 'deep-cleaning-tips-atlanta';
const htmlContent = `<!DOCTYPE html>...`; // Conteúdo completo

const request = {
  method: 'PUT',
  url: `https://api.github.com/repos/Williamjj2/SantosCleaningSolutions/contents/frontend-production/blog/${slug}.html`,
  headers: {
    'Authorization': `Bearer ${$credentials.github_token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3+json'
  },
  body: {
    message: `Add blog post: ${slug}`,
    content: Buffer.from(htmlContent).toString('base64'),
    branch: 'main'
  }
};
```

---

**Última atualização:** Dezembro 2025
