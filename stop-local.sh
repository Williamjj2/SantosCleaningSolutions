#!/bin/bash
# Script para parar os servidores locais
# Santos Cleaning Solutions

echo "🛑 Parando servidores locais..."

# Parar servidor na porta 8000 (Frontend)
if lsof -ti:8000 > /dev/null 2>&1; then
    lsof -ti:8000 | xargs kill -9
    echo "   ✅ Frontend parado (porta 8000)"
else
    echo "   ⚠️  Nenhum servidor na porta 8000"
fi

# Parar servidor na porta 8001 (Backend)
if lsof -ti:8001 > /dev/null 2>&1; then
    lsof -ti:8001 | xargs kill -9
    echo "   ✅ Backend parado (porta 8001)"
else
    echo "   ⚠️  Nenhum servidor na porta 8001"
fi

# Parar processos Python do projeto
pkill -f "serve-with-proxy.py" 2>/dev/null
pkill -f "server.py" 2>/dev/null

echo ""
echo "✅ Todos os servidores foram parados!"









