#!/bin/bash

# Função para limpeza ao sair
cleanup() {
    echo ""
    echo "🛑 Parando servidores..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    exit 0
}

# Captura Ctrl+C
trap cleanup SIGINT SIGTERM

echo "🔧 Preparando ambiente local..."

# Ativa ambiente virtual se existir
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "⚠️  Virtualenv não encontrado, tentando usar python do sistema..."
fi

# Instala dependência do adaptador Netlify (apenas para garantir)
echo "📦 Instalando dependências necessárias..."
pip install mangum > /dev/null 2>&1

# Mata processos antigos para evitar conflito de porta
bash stop-local.sh > /dev/null 2>&1

echo "🚀 Iniciando Backend (Simulando Netlify Functions)..."
# Inicia o servidor backend na porta 8001 em background
# Usamos nohup para ele não morrer se o shell fechar, mas mataremos ele no cleanup
uvicorn server:app --host 0.0.0.0 --port 8001 > backend.log 2>&1 &
BACKEND_PID=$!

# Aguarda o backend subir
echo "⏳ Aguardando backend inicializar..."
sleep 3

# Verifica se o backend subiu
ifps=$(ps -p $BACKEND_PID | grep -v PID)
if [ -z "$ifps" ]; then
    echo "❌ Erro: Backend falhou ao iniciar. Verifique backend.log"
    cat backend.log
    exit 1
fi

echo "✅ Backend online na porta 8001"
echo "🚀 Iniciando Frontend + Proxy (Simulando Netlify CDN)..."
echo ""
echo "✨ O site estará disponível em: http://localhost:8000"
echo "📝 Pressione Ctrl+C para parar a simulação."
echo ""

# Inicia o servidor de frontend (bloqueia o terminal até Ctrl+C)
python3 serve-with-proxy.py
