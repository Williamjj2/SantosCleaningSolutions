#!/bin/bash
# Santos Cleaning - Deploy Rápido
# Execute este script NO SERVIDOR AWS

echo "🚀 Santos Cleaning - Deploy Automático"
echo "======================================"
echo ""

# Verificar se está no servidor correto
if [ ! -d "/var/www/santos-cleaning-frontend" ]; then
    echo "❌ ERRO: Este script deve ser executado NO SERVIDOR AWS!"
    echo "   Diretório /var/www/santos-cleaning-frontend não encontrado."
    exit 1
fi

echo "📦 Passo 1: Backup..."
cd /var/www
sudo tar -czf santos-backup-$(date +%Y%m%d-%H%M%S).tar.gz santos-cleaning-frontend/
echo "✅ Backup criado"

echo ""
echo "📥 Passo 2: Baixando correções do GitHub..."
cd /var/www/santos-cleaning-frontend
sudo git pull origin v2-20250807-2207
echo "✅ Código atualizado"

echo ""
echo "🔧 Passo 3: Aplicando correções..."
# Desabilitar Service Worker
if [ -f "sw.js" ]; then
    sudo mv sw.js sw.js.disabled
fi
if [ -f "manifest.json" ]; then
    sudo mv manifest.json manifest.json.disabled
fi
echo "✅ PWA desabilitado"

echo ""
echo "⚙️ Passo 4: Atualizando Nginx..."
sudo cp /etc/nginx/sites-available/santoscsolutions.com /etc/nginx/sites-available/santoscsolutions.com.backup
# Aqui você precisa colocar a nova config manualmente ou ter ela no git
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx recarregado"

echo ""
echo "🐍 Passo 5: Reiniciando API Python..."
# Encontrar e matar processo antigo
sudo pkill -f "server.py"
sleep 2

# Iniciar novo processo
cd /home/ubuntu  # ou seu diretório home
nohup python3 server.py > santos-api.log 2>&1 &
echo "✅ API reiniciada"

echo ""
echo "✅ DEPLOY COMPLETO!"
echo ""
echo "📋 Verifique:"
echo "  1. Site: https://santoscsolutions.com"
echo "  2. API: https://santoscsolutions.com/api/health"
echo "  3. Reviews: https://santoscsolutions.com/api/reviews"
echo ""
echo "Se houver problemas, restaure o backup:"
echo "  cd /var/www && sudo tar -xzf santos-backup-*.tar.gz"
