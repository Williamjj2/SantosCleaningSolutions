# Database Schema — Supabase

**Project ID:** `rxqcapmvebsdaehspcjk`
**URL:** `https://rxqcapmvebsdaehspcjk.supabase.co`

---

## Tabelas Principais do Negócio

### `leads_santos_cleaning` (214 rows)
Leads capturados pelo agente LAURA (ElevenLabs). Tabela principal de leads.

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid (PK) | auto-gen |
| name | text | |
| phone | varchar | **unique** |
| email | text | nullable |
| address | text | nullable |
| service_type | varchar | nullable |
| status | text | default `'new'` |
| conversation_stage | text | default `'greeting'` |
| follow_up_count | int | default 0 |
| transcription | text | Transcrição da chamada |
| pricing | text | Cotação gerada |
| analysis | text | Análise da chamada |
| preferences | jsonb | Pets, gate codes, allergias etc. |
| ids | jsonb | IDs externos |
| meta | jsonb | Metadados flexíveis |
| notes | text | |
| created_at / updated_at | timestamptz | |

### `leads` (7 rows, RLS enabled)
Leads do formulário de contato do website.

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid (PK) | auto-gen |
| name, phone, email | varchar | |
| message | text | |
| sms_consent | boolean | default false |
| language | varchar | default `'en'` |
| source | varchar | default `'website'` |
| status | enum | `new, contacted, qualified, proposal, won, lost, inactive` |
| utm_source/medium/campaign | varchar | |
| owner_id | uuid → auth.users | |
| org_id | uuid | |

### `contacts` (27 rows, RLS enabled)
Contatos/clientes (CRM).

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid (PK) | |
| name, phone, email | text | |
| address, city, state, zip_code | text | |
| latitude, longitude | numeric | |
| service_value | numeric | Valor cobrado por visita |
| status | enum | `novo, em_negociacao, agendado, concluido, recorrente, perdido` |
| cleaning_type | enum | `regular, deep, move-in, move-out` |
| recurrence_frequency | enum | `weekly, biweekly, monthly, one-time` |
| recurrence_days | text[] | `{monday, wednesday}` |
| tenant_id | uuid → tenants | |

### `bookings` (3 rows, RLS enabled)
Agendamentos de limpeza.

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid (PK) | |
| contact_id | uuid → contacts | |
| client_name, phone, address | text | |
| service_type | text | |
| beds | int | |
| baths | numeric | |
| has_pets | boolean | |
| scheduled_date | date | |
| time_slot | text | |
| quoted_price | numeric | |
| status | text | default `'pending'` |
| conversation_id | text | ID da conversa ElevenLabs |
| booked_by | text | |

### `google_reviews` (32 rows, RLS enabled)
Reviews do Google Business.

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | int (PK) | serial |
| review_id | varchar | **unique** |
| author_name | varchar | |
| rating | int | check 1-5 |
| text | text | |
| is_active | boolean | default true |
| is_featured | boolean | default false (4+ stars) |
| profile_photo_url | varchar | |
| review_time | timestamptz | |

### `blog_posts` (5 rows)
Posts do blog.

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid (PK) | |
| slug | text | **unique** |
| title, description, content | text | |
| image_url | text | |
| category | text | default `'Cleaning Tips'` |
| target_city, primary_keyword | text | SEO |
| read_time | text | default `'5 min read'` |
| is_published | boolean | default true |
| publish_date | timestamptz | |

### `messages` (1327 rows)
Mensagens SMS (Twilio).

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid (PK) | |
| message_sid | text | **unique** (Twilio SID) |
| from_number, to_number | text | |
| body | text | |
| direction | text | `'outbound'` default |
| status | text | `'sent'` default |
| is_read, is_starred | boolean | |

---

## Tabelas de Pricing

### `pricing_matrix` (201 rows, RLS, multi-tenant)
Matriz de preços principal (EN).

| Coluna | Tipo |
|--------|------|
| bedrooms | int |
| bathrooms | numeric |
| price_standard | numeric |
| price_deep | numeric |
| price_move | numeric |
| tenant_id | uuid → tenants |

### `pricing_matrix_residential` (100 rows, RLS)
Matriz de preços residencial (PT-BR labels).

| Coluna | Tipo |
|--------|------|
| quartos, banheiros | int |
| tamanho | text |
| regular, profunda, mudanca | numeric |

### `pricing_extended_residential` (100 rows, RLS)
Preços estendidos com banheiros extras.

### `pricing_addons` (7 rows, RLS)
Addons de serviço (ex: inside oven, inside fridge).

| Coluna | Tipo |
|--------|------|
| codigo | text (**unique**) |
| nome | text |
| preco | numeric |
| e_pacote | boolean |

### `addons` (18 rows, RLS, multi-tenant)
Addons em formato EN para o sistema multi-tenant.

### `pricing_rules_adjustments` (6 rows, RLS)
Regras de ajuste de preço (ex: pet surcharge, weekend markup).

### `pricing_campaigns` (0 rows, RLS)
Campanhas de desconto.

### `service_areas` (7 rows, RLS)
Áreas de serviço com markup silencioso.

---

## Tabelas de Chamadas (LAURA / ElevenLabs)

### `call_logs` (19 rows, multi-tenant)
Logs de chamadas do ElevenLabs.

| Coluna | Tipo |
|--------|------|
| conversation_id | text (**unique**) |
| agent_id | text |
| caller_name, caller_phone | text |
| duration_seconds | int |
| status | text (`processing, active, completed, successful, done, failed`) |
| transcript | jsonb |
| analysis | jsonb |
| tenant_id | uuid → tenants |

### `call_summaries` (0 rows)
Resumos de chamadas.

---

## Tabelas Multi-Tenant

### `tenants` (4 rows, RLS)
Empresas/clientes do sistema SaaS.

| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid (PK) | |
| slug | text | **unique** |
| name | text | default `'Laura'` |
| business_name, business_type | text | |
| owner_id | uuid → auth.users | |
| owner_email | text | |
| elevenlabs_agent_id | text | |
| status | text | `pending, provisioning, active, error, suspended` |
| google_calendar_id | text | |
| google_refresh_token | text | |
| timezone | text | default `'America/Sao_Paulo'` |

### `business_hours` (7 rows, RLS)
Horário de funcionamento por tenant.

### `company_settings` (0 rows, RLS)
Configurações da empresa (nome do agente, voz, idioma).

---

## Tabelas Auxiliares

| Tabela | Rows | Descrição |
|--------|------|-----------|
| `knowledge_base` | 8 | Base de conhecimento para o agente LAURA |
| `documents` | 10 | Documentos com embeddings (vector) |
| `site_content` | 1 | Conteúdo editável do site (JSON) |
| `static_pages` | 1 | Páginas estáticas (HTML content) |
| `lead_interactions` | 0 | Interações com leads (tipo CRM) |
| `user_settings` | 0 | Configurações Twilio por usuário |
| `user_devices` | 0 | Devices de usuários |
| `active_sessions` | 0 | Sessões ativas |
| `profiles` | 0 | Perfis de usuário |
| `bills` | 0 | Contas a pagar |
| `users` | 5 | Usuários do sistema (legacy) |
| `categories` | 6 | Categorias de menu (outro projeto) |
| `menu_items` | 16 | Items de menu (outro projeto) |
| `orders` | 3 | Pedidos (outro projeto) |
| `order_items` | 5 | Items de pedidos (outro projeto) |
| `bathroom_deltas` | 0 | Deltas de preço por banheiro extra |
| `payment_policies` | 0 | Políticas de pagamento |
| `services_included` | 0 | Serviços incluídos por tipo de limpeza |
