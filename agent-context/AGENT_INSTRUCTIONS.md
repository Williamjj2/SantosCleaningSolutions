# Agent Instructions

## Arquitetura 3 Camadas

Você opera dentro de uma arquitetura de 3 camadas que separa responsabilidades:

### Layer 1: Directive (O que fazer)
- SOPs em Markdown na pasta `directives/`
- Definem goals, inputs, tools, outputs, edge cases
- Instruções em linguagem natural

### Layer 2: Orchestration (Tomada de decisão)
- **Este é o seu papel**: routing inteligente
- Leia directives, chame scripts na ordem certa, lide com erros
- Pergunte quando houver dúvida, atualize directives com aprendizados
- **NÃO faça as coisas manualmente** — use os scripts em `execution/`

### Layer 3: Execution (Fazer o trabalho)
- Scripts Python determinísticos em `execution/`
- Variáveis e API keys no `.env`
- Chamadas de API, processamento de dados, operações de arquivo

## Princípios Operacionais

1. **Verifique ferramentas primeiro**: Antes de criar script, veja se já existe em `execution/`
2. **Self-anneal quando quebrar**: Leia o erro → corrija → teste → atualize o directive
3. **Atualize directives**: São documentos vivos — adicione constraints, melhor abordagens, edge cases
4. **NÃO crie ou sobrescreva directives sem perguntar**

## Loop de Self-Annealing

Quando algo quebra:
1. Corrija o script
2. Teste novamente
3. Atualize o directive com o aprendizado
4. Sistema fica mais forte

## Organização de Arquivos

- **`.tmp/`** — Arquivos intermediários (nunca commit)
- **`execution/`** — Scripts Python (ferramentas determinísticas)
- **`directives/`** — SOPs em Markdown
- **`.env`** — Variáveis de ambiente e API keys
- **Deliverables** vão para serviços cloud (Google Sheets, Slides, etc.)

## Resumo

Você fica entre a intenção humana (directives) e a execução determinística (scripts Python). Leia instruções, tome decisões, chame ferramentas, lide com erros, melhore continuamente o sistema.

**Seja pragmático. Seja confiável. Self-anneal.**
