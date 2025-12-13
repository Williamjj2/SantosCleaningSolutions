# Correção do Workflow: Blog Index Cards

## Problema Identificado

Os cards do blog index estão sendo criados com:
- `heroImage: null` ou `heroImage: undefined`
- Falta de metadados (cidade e tempo de leitura)

## Correção Necessária no n8n

### 1. No nó "Build Final HTML" ou similar

O template do card precisa ser atualizado para incluir todos os campos:

```javascript
// Antes de criar o card, garantir que heroImage tem valor
const heroImage = $json.Main_Image_URL || $json.hero_image || $json.heroImage || '/images/blog-default.jpg';

// Template do card CORRETO:
const cardHTML = `
<article class="blog-card">
    <div class="blog-card-image" style="background-image: url('${heroImage}');">
        <span class="blog-category">${$json.Category || 'Tips'}</span>
    </div>
    <div class="blog-card-content">
        <div class="blog-meta">
            <span><i class="fas fa-map-marker-alt"></i> ${$json.Target_City}, GA</span>
            <span><i class="fas fa-clock"></i> ${$json.Read_Time || 8} min read</span>
        </div>
        <time datetime="${$json.Publish_Date}">${formattedDate}</time>
        <h3><a href="/blog/${$json.Slug}/">${$json.Title}</a></h3>
        <p>${$json.description || $json.Title}...</p>
        <a href="/blog/${$json.Slug}/" class="read-more">Read More →</a>
    </div>
</article>
`;
```

### 2. Verificar a Planilha do Google

A planilha precisa ter a coluna `Main_Image_URL` preenchida com a URL da imagem do Google Drive no formato:
```
https://lh3.googleusercontent.com/d/FILE_ID
```

**NÃO use:**
```
https://drive.google.com/uc?export=view&id=FILE_ID  ❌
```

### 3. Ajustar o nó "Update Blog Index"

O nó que atualiza o arquivo `blog/index.html` precisa:

1. **Ler o heroImage corretamente:**
```javascript
const heroImage = items[0].json.heroImage || 
                  items[0].json.Main_Image_URL || 
                  items[0].json.hero_image ||
                  '/images/blog-default.jpg';

// Garantir que não seja null/undefined
if (!heroImage || heroImage === 'null' || heroImage === 'undefined') {
    heroImage = '/images/blog-default.jpg';
}
```

2. **Incluir Target_City e Read_Time no card:**
```javascript
const targetCity = items[0].json.Target_City || 'Atlanta';
const readTime = items[0].json.Read_Time || 8;
```

### 4. Campos Obrigatórios na Planilha

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `Main_Image_URL` | URL da imagem lh3 | `https://lh3.googleusercontent.com/d/ABC123` |
| `Target_City` | Cidade do artigo | `Roswell` |
| `Read_Time` | Minutos de leitura | `8` |
| `Category` | Categoria do artigo | `Cleaning` |
| `Publish_Date` | Data de publicação | `2025-12-13` |

### 5. Checklist Antes de Publicar

- [ ] `Main_Image_URL` está preenchido?
- [ ] URL da imagem usa formato `lh3.googleusercontent.com`?
- [ ] `Target_City` está preenchido?
- [ ] `Read_Time` está preenchido?
- [ ] `Category` está preenchido?

---

## Resumo das Mudanças

1. **Planilha**: Adicionar/preencher coluna `Main_Image_URL`
2. **Workflow**: Usar o campo `Main_Image_URL` no template do card
3. **Workflow**: Adicionar fallback para imagem padrão
4. **Workflow**: Incluir `blog-meta` div com cidade e tempo de leitura
