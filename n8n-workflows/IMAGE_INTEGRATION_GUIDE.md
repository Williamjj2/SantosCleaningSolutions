# Guia de Configuração: Imagens no Workflow de Blog

## Resumo das Alterações Necessárias

### 1. Adicionar coluna `hero_image` na planilha

Na sua planilha Google Sheets (`Content Calendar`), adicione uma nova coluna:

| Coluna | Descrição |
|--------|-----------|
| `hero_image` | URL da imagem gerada pelo Nanobanana |

---

### 2. Modificar nó "📋 Prepare Data" no n8n

Adicionar este assignment após `targetWordCount`:

```javascript
{
    "id": "heroImage",
    "name": "heroImage",
    "value": "={{ $json.hero_image || $json['Hero Image'] || $json.image || '' }}",
    "type": "string"
}
```

---

### 3. Modificar nó "🏗️ Build Final HTML" no n8n

Substituir o bloco de heroImage (linhas 25-32 do jsCode) de:

```javascript
// Hero image (using Unsplash cleaning images)
const unsplashImages = [
  'photo-1558618666-fcd25c85cd64',
  'photo-1527515637462-cff94eecc1ac', 
  'photo-1581578731548-c64695cc6952',
  'photo-1556909114-f6e7ad7d3136'
];
const heroImage = `https://images.unsplash.com/${unsplashImages[Math.floor(Math.random() * unsplashImages.length)]}?w=1600&h=800&fit=crop&q=80`;
```

Para:

```javascript
// Hero image - priority: 1) From spreadsheet (Nanobanana), 2) Fallback Unsplash
let heroImage;
if (data.heroImage && data.heroImage.trim() !== '') {
  // Use image from spreadsheet (Nanobanana or external URL)
  heroImage = data.heroImage;
} else {
  // Fallback to Unsplash
  const unsplashImages = [
    'photo-1558618666-fcd25c85cd64',
    'photo-1527515637462-cff94eecc1ac', 
    'photo-1581578731548-c64695cc6952',
    'photo-1556909114-f6e7ad7d3136'
  ];
  heroImage = `https://images.unsplash.com/${unsplashImages[Math.floor(Math.random() * unsplashImages.length)]}?w=1600&h=800&fit=crop&q=80`;
}
```

---

### 4. Integrar Nanobanana no Workflow

Adicionar nó **Nanobanana** ANTES do nó "📋 Prepare Data":

```
Fluxo: Google Sheets → Nanobanana → Prepare Data → [resto do workflow]
```

**Prompt do Nanobanana (sugestão):**
```
Professional cleaning service hero image for article titled "[TITLE]" 
in [TARGET_CITY], Georgia. 
Clean modern home interior, professional cleaners, bright and welcoming.
Style: photorealistic, 16:9 aspect ratio, high quality
```

**Após Nanobanana:**
- Salvar URL retornada em `hero_image`
- Workflow continua normalmente

---

## Estrutura de Imagens no Site

| Uso | URL | Tamanho |
|-----|-----|---------|
| Hero do artigo | `background-image: url('${heroImage}')` | 1600x800px |
| Card na listagem | `background-image: url('${heroImage}')` | 800x400px |
| Open Graph | `og:image: ${heroImage}` | 1200x630px |

---

## Próximos Passos para o Cursor

Se você quiser que o Cursor faça as edições automaticamente:

1. Abra o arquivo `n8n-workflows/multi-agent-blog-v2.json`
2. Peça ao Cursor: "Adicione o campo heroImage ao nó Prepare Data conforme o guia"
3. Peça ao Cursor: "Modifique a lógica de heroImage no nó Build HTML conforme o guia"

Ou aplique manualmente no n8n seguindo os passos acima.
