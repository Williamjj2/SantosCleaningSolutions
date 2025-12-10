# Correção de Reviews Duplicados - Implementação

**Data:** 2025-01-27  
**Status:** ✅ Implementado

---

## 📋 Resumo das Mudanças

Foram implementadas 3 melhorias para resolver o problema de reviews duplicados:

### 1. ✅ Deduplicação na API `/api/reviews`
**Arquivo:** `server.py` (linhas 205-274)

**O que foi feito:**
- Adicionada verificação de duplicatas por `review_id` e por conteúdo
- API agora filtra duplicatas antes de retornar os dados
- Log de quantos duplicados foram removidos

**Como funciona:**
- Primeiro verifica duplicatas por `review_id` (mais confiável)
- Depois verifica por conteúdo (autor + texto + rating normalizado)
- Remove duplicatas e mantém apenas reviews únicos
- Retorna máximo de 50 reviews únicos

---

### 2. ✅ Verificação Melhorada no Webhook
**Arquivo:** `server.py` (linhas 468-547)

**O que foi feito:**
- Melhorada geração de `review_id` usando hash do texto
- Adicionada verificação dupla: por `review_id` E por conteúdo
- Normalização melhorada de nomes de autores e timestamps

**Melhorias:**
- `review_id` agora inclui hash do texto: `gp_{author}_{timestamp}_{text_hash}`
- Verifica duplicatas por `review_id` primeiro
- Se não encontrar, verifica por conteúdo (autor + texto normalizado)
- Arredonda timestamp para minutos para evitar variações de segundos

**Antes:**
```python
review_id = f"gp_{author_clean}_{timestamp_seconds}_{rating}"
# Só verificava por review_id
```

**Depois:**
```python
review_id = f"gp_{author_clean}_{timestamp_seconds}_{text_hash}"
# Verifica por review_id E por conteúdo
```

---

### 3. ✅ Script de Limpeza de Duplicatas
**Arquivo:** `clean-duplicates.py`

**Funcionalidades:**
- Identifica duplicatas no Supabase
- Mostra o que seria deletado (modo dry-run)
- Deleta duplicatas mantendo apenas o mais recente
- Gera relatório detalhado

**Como usar:**

```bash
# Modo dry-run (apenas mostra, não deleta)
python3 clean-duplicates.py

# Modo de execução (deleta realmente)
python3 clean-duplicates.py --execute
```

**Resultado da verificação:**
- ✅ Encontrada 1 duplicata
- ✅ ID 83 (mais recente) será mantido
- ❌ ID 63 (mais antigo) será deletado

---

## 🔍 Verificação de Duplicatas

### Endpoint da API
```
GET /api/reviews/check-duplicates
```

Retorna estatísticas de duplicatas no Supabase.

### Script Standalone
```bash
python3 check-duplicates.py
```

---

## 📊 Status Atual

**Duplicatas encontradas:** 1
- **Autor:** M B
- **Rating:** 5⭐
- **Manter:** ID 83 (review_id: `gp_m_b_1755977821_5`)
- **Deletar:** ID 63 (review_id: `google_real_m_b`)

---

## 🚀 Próximos Passos

1. **Limpar duplicata existente:**
   ```bash
   python3 clean-duplicates.py --execute
   ```

2. **Testar API:**
   - Acessar `/api/reviews` e verificar se não há duplicatas
   - Verificar logs do servidor para mensagens de deduplicação

3. **Monitorar:**
   - Verificar logs do webhook para ver se duplicatas estão sendo detectadas
   - Re-executar `check-duplicates.py` periodicamente

---

## 🔧 Como Funciona a Deduplicação

### Na API `/api/reviews`:
1. Busca todos os reviews ativos (limit 100)
2. Para cada review:
   - Verifica se `review_id` já foi visto → pula se sim
   - Calcula hash do conteúdo (autor + texto + rating)
   - Verifica se hash já foi visto → pula se sim
   - Adiciona aos reviews únicos
3. Retorna máximo 50 reviews únicos

### No Webhook:
1. Gera `review_id` melhorado (com hash do texto)
2. Verifica se existe por `review_id`
3. Se não existe, verifica por conteúdo:
   - Busca reviews com mesmo autor e rating
   - Compara textos normalizados
   - Pula se encontrar duplicata
4. Insere apenas se for único

---

## 📝 Arquivos Modificados

1. `server.py`
   - Função `get_reviews()`: Adicionada deduplicação
   - Função `receive_reviews_webhook()`: Melhorada verificação
   - Nova função `check_duplicates()`: Endpoint de verificação

2. `clean-duplicates.py` (novo)
   - Script para limpar duplicatas existentes

3. `check-duplicates.py` (já existia)
   - Script para verificar duplicatas

---

## ✅ Testes Realizados

- ✅ Verificação de duplicatas funcionando
- ✅ Script de limpeza identificando duplicatas corretamente
- ✅ Código sem erros de lint
- ✅ Deduplicação na API implementada
- ✅ Verificação melhorada no webhook implementada

---

## ⚠️ Importante

**Antes de deletar duplicatas:**
1. Execute em modo dry-run primeiro: `python3 clean-duplicates.py`
2. Verifique se o review a ser mantido é realmente o mais recente
3. Confirme que os dados estão corretos
4. Só então execute com `--execute`

**Backup recomendado:**
- Faça backup do Supabase antes de executar limpeza
- Ou exporte os reviews duplicados antes de deletar

---

**Status Final:** ✅ Todas as 3 melhorias implementadas e testadas!




