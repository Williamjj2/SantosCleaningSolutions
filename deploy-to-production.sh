#!/bin/bash
# Script para deploy do painel dinâmico de reviews para produção
# Santos Cleaning Solutions

set -e  # Parar em caso de erro

# Configurações do servidor
SERVER_IP="54.67.60.88"
SERVER_USER="ubuntu"  # ou ec2-user, dependendo da AMI
KEY_PATH="/Users/williamjesus/santos-cleaning-key.pem"
PROJECT_DIR="/Users/williamjesus/Site Oficial/SantosCleaningSolutions"

echo "🚀 Santos Cleaning Solutions - Deploy para Produção"
echo "=================================================="
echo ""

# Verificar se a chave SSH existe
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ Erro: Chave SSH não encontrada em $KEY_PATH"
    echo "📁 Verifique se o arquivo santos-cleaning-key.pem está no local correto"
    exit 1
fi

# Verificar permissões da chave SSH
chmod 600 "$KEY_PATH"
echo "✅ Permissões da chave SSH configuradas"

# Testar conexão com o servidor
echo "🔍 Testando conexão com o servidor..."
if ssh -i "$KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "echo 'Conexão OK'" 2>/dev/null; then
    echo "✅ Conexão com servidor estabelecida"
else
    echo "❌ Erro: Não foi possível conectar ao servidor"
    echo "🔧 Verifique:"
    echo "   - IP do servidor: $SERVER_IP"
    echo "   - Usuário: $SERVER_USER"
    echo "   - Chave SSH: $KEY_PATH"
    echo "   - Servidor está rodando"
    exit 1
fi

echo ""
echo "📦 Preparando arquivos para upload..."

# Criar diretório temporário para os arquivos
TEMP_DIR=$(mktemp -d)
echo "📁 Diretório temporário: $TEMP_DIR"

# Copiar arquivos necessários
echo "📋 Copiando arquivos..."

# Frontend files
cp -r "$PROJECT_DIR/frontend-production" "$TEMP_DIR/"
cp "$PROJECT_DIR/server.py" "$TEMP_DIR/"
cp "$PROJECT_DIR/requirements.txt" "$TEMP_DIR/"
cp "$PROJECT_DIR/.env" "$TEMP_DIR/" 2>/dev/null || echo "⚠️ Arquivo .env não encontrado localmente"

# Scripts específicos do painel dinâmico
cp "$PROJECT_DIR/frontend-production/update-react-reviews.js" "$TEMP_DIR/frontend-production/"
cp "$PROJECT_DIR/frontend-production/dynamic-reviews.js" "$TEMP_DIR/frontend-production/"
cp "$PROJECT_DIR/frontend-production/integrate-dynamic-panel.js" "$TEMP_DIR/frontend-production/"

# Página de exemplo (para acesso interno)
cp "$PROJECT_DIR/frontend-production/reviews-panel-example.html" "$TEMP_DIR/frontend-production/"
cp "$PROJECT_DIR/frontend-production/test-dynamic-reviews.html" "$TEMP_DIR/frontend-production/"

# Scripts de deploy
cp "$PROJECT_DIR/serve-with-proxy.py" "$TEMP_DIR/" 2>/dev/null || echo "⚠️ serve-with-proxy.py não encontrado"

echo "✅ Arquivos copiados para diretório temporário"

# Criar arquivo .htaccess para proteger páginas internas
cat > "$TEMP_DIR/frontend-production/.htaccess" << 'EOF'
# Proteger páginas internas de exemplo
<Files "reviews-panel-example.html">
    Require ip 127.0.0.1
    Require ip ::1
    # Adicione aqui outros IPs que devem ter acesso
    # Require ip SEU_IP_AQUI
</Files>

<Files "test-dynamic-reviews.html">
    Require ip 127.0.0.1
    Require ip ::1
    # Adicione aqui outros IPs que devem ter acesso
    # Require ip SEU_IP_AQUI
</Files>

# Permitir acesso geral aos outros arquivos
<Files "*">
    Require all granted
</Files>
EOF

echo "✅ Arquivo .htaccess criado para proteger páginas internas"

# Upload dos arquivos para o servidor
echo ""
echo "📤 Fazendo upload dos arquivos para o servidor..."

# Criar diretório no servidor se não existir
ssh -i "$KEY_PATH" "$SERVER_USER@$SERVER_IP" "mkdir -p /var/www/santos-cleaning"

# Upload dos arquivos
# Enviar arquivos forçando permissões legíveis pelo Nginx (D=755, F=644)
rsync -avz --delete --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r -e "ssh -i $KEY_PATH" "$TEMP_DIR/" "$SERVER_USER@$SERVER_IP:/var/www/santos-cleaning/" || \
rsync -avz --delete -e "ssh -i $KEY_PATH" "$TEMP_DIR/" "$SERVER_USER@$SERVER_IP:/var/www/santos-cleaning/"

echo "✅ Upload concluído"

# Configurar servidor de produção
echo ""
echo "🔧 Configurando servidor de produção..."

ssh -i "$KEY_PATH" "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    cd /var/www/santos-cleaning
    
    echo "📦 Instalando dependências Python..."
    
    # Verificar se Python3 está instalado
    if ! command -v python3 &> /dev/null; then
        echo "Instalando Python3..."
        sudo apt update
        sudo apt install -y python3 python3-pip python3-venv
    fi
    
    # Criar ambiente virtual se não existir
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    # Ativar ambiente virtual e instalar dependências
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    
    echo "✅ Dependências Python instaladas"
    
    # Garantir permissões consistentes após o upload
    find /var/www/santos-cleaning -type d -exec chmod 755 {} \; || true
    find /var/www/santos-cleaning -type f -exec chmod 644 {} \; || true
    
    # Configurar permissões
    chmod +x serve-with-proxy.py 2>/dev/null || echo "serve-with-proxy.py não encontrado"
    chmod 600 .env 2>/dev/null || echo "Arquivo .env não encontrado"
    
    echo "✅ Permissões configuradas"
    
    # Verificar se nginx está rodando
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx está rodando"
    else
        echo "⚠️ Nginx não está rodando - pode precisar ser iniciado"
    fi
    
    echo "🎉 Configuração do servidor concluída!"
ENDSSH

# Limpar diretório temporário
rm -rf "$TEMP_DIR"
echo "🧹 Diretório temporário removido"

echo ""
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "================================"
echo ""
echo "🌐 URLs de Produção:"
echo "   • Site Principal: http://$SERVER_IP"
echo "   • API Health: http://$SERVER_IP/api/health"
echo "   • API Reviews: http://$SERVER_IP/api/reviews"
echo "   • API Stats: http://$SERVER_IP/api/reviews/stats"
echo ""
echo "🔒 Páginas Internas (acesso restrito):"
echo "   • Painel Exemplo: http://$SERVER_IP/reviews-panel-example.html"
echo "   • Teste Dinâmico: http://$SERVER_IP/test-dynamic-reviews.html"
echo ""
echo "📋 Próximos Passos:"
echo "   1. ✅ Testar o site principal: http://$SERVER_IP"
echo "   2. ✅ Verificar API: http://$SERVER_IP/api/reviews/stats"
echo "   3. ✅ Testar painel dinâmico no console do navegador"
echo "   4. ✅ Configurar nginx se necessário"
echo ""
echo "🔧 Para conectar via SSH:"
echo "   ssh -i $KEY_PATH $SERVER_USER@$SERVER_IP"
echo ""
echo "📊 Logs do servidor:"
echo "   tail -f /var/www/santos-cleaning/backend.log"
echo "   tail -f /var/www/santos-cleaning/frontend.log"
echo ""


