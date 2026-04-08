# Frontend Structure

## Build System

- **Vite** + React + TypeScript + Tailwind CSS
- **Build output:** `dist/public/` (servido pelo Netlify)
- **Router:** Wouter (client-side)
- **State management:** React Query (`@tanstack/react-query`)
- **UI:** Custom components + Shadcn/UI (`components/ui/`)

## Rotas (src/App.tsx)

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | `Home` | Homepage principal |
| `/blog` | `Blog` | Lista de posts |
| `/blog/:slug` | `BlogPost` | Post individual |
| `/contact` | `Contact` | Formulário de contato |
| `/deep-cleaning` | `ServicePage` | Página de serviço |
| `/regular-cleaning` | `ServicePage` | Página de serviço |
| `/move-in-out-cleaning` | `ServicePage` | Página de serviço |
| `/office-cleaning` | `ServicePage` | Página de serviço |
| `/guides/:slug` | `Guide` | Guias de limpeza |
| `/legal/:page` | `Legal` | Termos, privacy, cancelamento |
| `/:slug` | `CityPage` | Páginas SEO local (fallback) |
| `*` | `NotFound` | 404 |

## Componentes Principais

```
src/components/
├── AnimatedSection.tsx     # Wrapper de animação (scroll)
├── ExitIntentPopup.tsx     # Popup de exit intent (captura leads)
├── GoogleReviewsBadge.tsx  # Badge flutuante de reviews
├── SchemaMarkup.tsx        # Structured data (JSON-LD)
├── layout/                 # Header, Footer, etc.
├── sections/               # Seções da home (Hero, Services, etc.)
└── ui/                     # Shadcn/UI components (button, toaster, etc.)
```

## Páginas

```
src/pages/
├── Home.tsx          # 3.1KB — Homepage com seções lazy-loaded
├── Blog.tsx          # 6.2KB — Lista de posts do Supabase
├── BlogPost.tsx      # 21KB  — Post individual com SEO
├── CityPage.tsx      # 15KB  — SEO local (12+ cidades)
├── Contact.tsx       # 15KB  — Formulário de contato
├── Guide.tsx         # 18KB  — Guias de limpeza
├── Legal.tsx         # 12KB  — Termos e políticas
├── ServicePage.tsx   # 11KB  — Detalhes de serviço
└── not-found.tsx     # 693B  — Página 404
```

## Cidades SEO Local

O componente `CityPage` atende essas cidades via rota `/:slug`:
- Marietta, Alpharetta, Buckhead, Roswell, Sandy Springs
- Kennesaw, Decatur, Smyrna, Johns Creek, Dunwoody
- East Cobb, Peachtree City

## Assets Estáticos

```
frontend-production/
├── assets/        # CSS/JS compilados
├── images/        # Imagens do site
└── blog-posts.json # Manifest de posts
```
