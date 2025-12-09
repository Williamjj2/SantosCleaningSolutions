# 🏠 Santos Cleaning Solutions - Desenvolvimento Local

Guia para rodar o site localmente no seu Mac com reviews reais do Supabase.

## 🚀 Início Rápido

### Opção 1: Script Automático (Recomendado)

```bash
./start-local.sh
```

Isso irá:
- ✅ Ativar o ambiente virtual Python
- ✅ Iniciar o backend API (porta 8001)
- ✅ Iniciar o frontend com proxy (porta 8000)
- ✅ Conectar ao Supabase para buscar reviews reais

**Acesse:** http://localhost:8000

### Opção 2: Manual

#### 1. Iniciar Backend API

```bash
cd "/Users/williamjesus/Site Oficial/SantosCleaningSolutions"
source venv/bin/activate
python server.py
```

#### 2. Iniciar Frontend (em outro terminal)

```bash
cd "/Users/williamjesus/Site Oficial/SantosCleaningSolutions"
python3 serve-with-proxy.py
```

## 🛑 Parar os Servidores

```bash
./stop-local.sh
```

Ou pressione `Ctrl+C` no terminal onde os servidores estão rodando.

## 📊 Endpoints Disponíveis

| Endpoint | Descrição | URL |
|----------|-----------|-----|
| **Frontend** | Site completo | http://localhost:8000 |
| **API Health** | Status da API | http://localhost:8000/api/health |
| **Reviews** | Reviews do Supabase | http://localhost:8000/api/reviews |
| **Services** | Lista de serviços | http://localhost:8000/api/services |
| **Contact** | Formulário de contato | POST http://localhost:8000/api/contact |

## 🗂️ Estrutura do Projeto

```
SantosCleaningSolutions/
├── frontend-production/      # Frontend React (build de produção)
│   ├── index.html            # Página principal
│   ├── static/               # CSS e JS compilados
│   └── images/               # Imagens e logos
├── server.py                 # Backend FastAPI
├── serve-with-proxy.py       # Servidor com proxy para desenvolvimento
├── requirements.txt          # Dependências Python
├── .env                      # Configurações (Supabase, etc.)
├── start-local.sh           # Script para iniciar tudo
└── stop-local.sh            # Script para parar tudo
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```bash
# Supabase
SUPABASE_URL=https://rxqcapmvebsdaehspcjk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-aqui

# Servidor
PORT=8001
HOST=0.0.0.0
```

## ⚠️ Troubleshooting

### Porta já em uso

Se receber erro "address already in use":

```bash
./stop-local.sh
./start-local.sh
```

### Backend não conecta ao Supabase

Verifique se a `SUPABASE_SERVICE_ROLE_KEY` está correta no arquivo `.env`

### Reviews não aparecem

1. Verifique os logs:
   ```bash
   tail -f backend.log
   ```

2. Teste a API diretamente:
   ```bash
   curl http://localhost:8000/api/reviews
   ```

## 📝 Logs

Os logs são salvos em:
- `backend.log` - Logs do servidor API
- `frontend.log` - Logs do servidor frontend

Para ver em tempo real:
```bash
tail -f backend.log
tail -f frontend.log
```

## 🌍 Páginas Locais Disponíveis

| Página | URL Local |
|--------|-----------|
| Home | http://localhost:8000 |
| Marietta | http://localhost:8000/marietta-house-cleaning/ |
| Brookhaven | http://localhost:8000/brookhaven-house-cleaning/ |
| Buckhead | http://localhost:8000/buckhead-house-cleaning/ |
| Alpharetta | http://localhost:8000/alpharetta-house-cleaning/ |
| Roswell | http://localhost:8000/roswell-house-cleaning/ |
| Sandy Springs | http://localhost:8000/sandy-springs-house-cleaning/ |

## 🔐 Segurança

⚠️ **IMPORTANTE:** Nunca commite o arquivo `.env` com as chaves do Supabase!

O arquivo `.env` está no `.gitignore` para proteger suas credenciais.

## 📦 Instalação Inicial (se necessário)

Se precisar reinstalar as dependências:

```bash
# Criar ambiente virtual
python3 -m venv venv

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

## ✨ Features

- ✅ **Reviews Reais do Google** via Supabase
- ✅ **Formulário de Contato** com salvamento de leads
- ✅ **SEO Otimizado** para cada cidade
- ✅ **Design Responsivo** para mobile e desktop
- ✅ **Schema Markup** para melhor SEO
- ✅ **Service Worker** para cache

## 🎯 Próximos Passos

1. Testar todas as páginas localmente
2. Verificar se os reviews aparecem corretamente
3. Testar o formulário de contato
4. Validar o SEO com ferramentas de desenvolvimento

---

**Desenvolvido por:** Santos Cleaning Solutions  
**Data:** Outubro 2025  
**Versão:** 1.0.0









