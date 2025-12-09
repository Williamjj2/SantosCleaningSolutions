#!/bin/bash
# Script para configurar Nginx no servidor de produção
# Santos Cleaning Solutions

set -e

# Configurações do servidor
SERVER_IP="54.67.60.88"
SERVER_USER="ubuntu"
KEY_PATH="/Users/williamjesus/santos-cleaning-key.pem"

echo "🔧 Configurando Nginx no Servidor de Produção"
echo "============================================="
echo ""

# Executar configuração no servidor
ssh -i "$KEY_PATH" "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
    echo "📦 Instalando Nginx..."
    
    # Atualizar sistema
    sudo apt update
    
    # Instalar nginx se não estiver instalado
    if ! command -v nginx &> /dev/null; then
        sudo apt install -y nginx
    fi
    
    echo "✅ Nginx instalado"
    
    # Criar configuração do site
    echo "📝 Criando configuração do site..."
    
    sudo tee /etc/nginx/sites-available/santos-cleaning > /dev/null << 'NGINX_CONFIG'
server {
    listen 80;
    server_name _;
    
    root /var/www/santos-cleaning/frontend-production;
    index index.html;
    
    access_log /var/log/nginx/santos-cleaning.access.log;
    error_log /var/log/nginx/santos-cleaning.error.log;
    
    server_tokens off;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 30s;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
    }
    
    location = /reviews-panel-example.html {
        allow 127.0.0.1;
        allow ::1;
        deny all;
        try_files $uri =404;
    }
    
    location = /test-dynamic-reviews.html {
        allow 127.0.0.1;
        allow ::1;
        deny all;
        try_files $uri =404;
    }
    
    location ~ \.(js)$ {
        try_files $uri =404;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    location = /robots.txt {
        try_files $uri =404;
    }
    
    location = /sitemap.xml {
        try_files $uri =404;
    }
    
    location = /favicon.ico {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location ~ /\. {
        deny all;
    }
    
    client_max_body_size 10M;
}
NGINX_CONFIG
    
    echo "✅ Configuração criada"
    
    # Habilitar o site
    echo "🔗 Habilitando site..."
    sudo ln -sf /etc/nginx/sites-available/santos-cleaning /etc/nginx/sites-enabled/
    
    # Remover site padrão se existir
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Testar configuração
    echo "🧪 Testando configuração do Nginx..."
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        echo "✅ Configuração do Nginx está válida"
        
        # Recarregar nginx
        echo "🔄 Recarregando Nginx..."
        sudo systemctl reload nginx
        
        echo "✅ Nginx recarregado com sucesso"
    else
        echo "❌ Erro na configuração do Nginx"
        exit 1
    fi
    
    # Verificar status do nginx
    echo "📊 Status do Nginx:"
    sudo systemctl status nginx --no-pager -l
    
    echo ""
    echo "🎉 Nginx configurado com sucesso!"
ENDSSH

echo ""
echo "✅ Configuração do Nginx concluída!"
echo ""
echo "🌐 O site deve estar acessível em: http://$SERVER_IP"
echo "🔒 Páginas internas protegidas por IP"
echo ""
echo "📋 Para verificar logs do Nginx:"
echo "   ssh -i $KEY_PATH $SERVER_USER@$SERVER_IP"
echo "   sudo tail -f /var/log/nginx/santos-cleaning.access.log"
echo "   sudo tail -f /var/log/nginx/santos-cleaning.error.log"








