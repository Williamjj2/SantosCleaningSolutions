# 🚀 Deploy para Produção - Santos Cleaning Solutions

## 📋 Pré-requisitos

✅ **Servidor AWS EC2 configurado:**
- IP: `54.67.60.88`
- Região: US West (N. California)
- Tipo: t3.micro
- Status: Running

✅ **Chave SSH disponível:**
- Arquivo: `santos-cleaning-key.pem`
- Localização: `/Users/williamjesus/santos-cleaning-key.pem`

✅ **Painel dinâmico funcionando localmente:**
- API: http://localhost:8001/api/reviews/stats
- Frontend: http://localhost:8000
- Scripts: `update-react-reviews.js`, `dynamic-reviews.js`

---

## 🎯 Deploy Completo (Recomendado)

### **1. Deploy Principal**
```bash
cd "/Users/williamjesus/Site Oficial/SantosCleaningSolutions"
./deploy-to-production.sh
```

Este script irá:
- ✅ Testar conexão com o servidor
- ✅ Fazer upload de todos os arquivos
- ✅ Instalar dependências Python
- ✅ Configurar permissões
- ✅ Verificar nginx

### **2. Configurar Nginx**
```bash
./setup-nginx-production.sh
```

Este script irá:
- ✅ Instalar nginx (se necessário)
- ✅ Criar configuração personalizada
- ✅ Configurar proxy para API backend
- ✅ Proteger páginas internas por IP
- ✅ Configurar cache e compressão

---

## 🔧 Deploy Manual (Passo a Passo)

### **1. Conectar ao Servidor**
```bash
ssh -i "/Users/williamjesus/santos-cleaning-key.pem" ubuntu@54.67.60.88
```

### **2. Preparar Diretório**
```bash
sudo mkdir -p /var/www/santos-cleaning
sudo chown ubuntu:ubuntu /var/www/santos-cleaning
```

### **3. Upload dos Arquivos**
```bash
# No seu Mac
rsync -avz --delete -e "ssh -i /Users/williamjesus/santos-cleaning-key.pem" \
  "/Users/williamjesus/Site Oficial/SantosCleaningSolutions/" \
  ubuntu@54.67.60.88:/var/www/santos-cleaning/
```

### **4. Configurar Backend**
```bash
# No servidor
cd /var/www/santos-cleaning
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### **5. Iniciar Serviços**
```bash
# Backend (em background)
nohup python server.py > backend.log 2>&1 &

# Frontend com proxy (em background)
nohup python3 serve-with-proxy.py > frontend.log 2>&1 &
```

---

## 🌐 URLs de Produção

### **Públicas:**
- 🏠 **Site Principal:** http://54.67.60.88
- 📡 **API Health:** http://54.67.60.88/api/health
- ⭐ **API Reviews:** http://54.67.60.88/api/reviews
- 📊 **API Stats:** http://54.67.60.88/api/reviews/stats

### **Internas (Protegidas por IP):**
- 🔒 **Painel Exemplo:** http://54.67.60.88/reviews-panel-example.html
- 🧪 **Teste Dinâmico:** http://54.67.60.88/test-dynamic-reviews.html

---

## 🔒 Configuração de Segurança

### **Proteção por IP**
As páginas internas são protegidas por IP no nginx:
```nginx
location = /reviews-panel-example.html {
    allow 127.0.0.1;  # localhost
    allow ::1;        # localhost IPv6
    # allow SEU_IP_AQUI;  # Adicione seu IP
    deny all;
}
```

### **Para adicionar seu IP:**
1. Descubra seu IP: https://whatismyipaddress.com/
2. Edite o nginx: `sudo nano /etc/nginx/sites-available/santos-cleaning`
3. Adicione: `allow SEU_IP;`
4. Recarregue: `sudo systemctl reload nginx`

---

## 📊 Monitoramento

### **Verificar Status dos Serviços**
```bash
# Conectar ao servidor
ssh -i "/Users/williamjesus/santos-cleaning-key.pem" ubuntu@54.67.60.88

# Status do nginx
sudo systemctl status nginx

# Processos Python
ps aux | grep python

# Portas em uso
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :8001
```

### **Logs**
```bash
# Logs do nginx
sudo tail -f /var/log/nginx/santos-cleaning.access.log
sudo tail -f /var/log/nginx/santos-cleaning.error.log

# Logs da aplicação
tail -f /var/www/santos-cleaning/backend.log
tail -f /var/www/santos-cleaning/frontend.log
```

---

## 🧪 Testes Pós-Deploy

### **1. Teste da API**
```bash
curl http://54.67.60.88/api/reviews/stats
```
**Esperado:** `{"average_rating":4.9,"total_reviews":21,...}`

### **2. Teste do Site**
- Abra: http://54.67.60.88
- Abra o console (F12)
- Procure por: "Santos Cleaning Solutions - Painel Dinâmico React carregando..."
- Verifique se os reviews estão sendo atualizados

### **3. Teste das Páginas Internas**
- Tente acessar: http://54.67.60.88/reviews-panel-example.html
- Deve ser bloqueado se não for seu IP
- Adicione seu IP na configuração do nginx para acessar

---

## 🔄 Atualizações Futuras

### **Para atualizar o código:**
```bash
# 1. Fazer mudanças localmente
# 2. Executar deploy
./deploy-to-production.sh

# 3. Reiniciar serviços se necessário
ssh -i "/Users/williamjesus/santos-cleaning-key.pem" ubuntu@54.67.60.88
sudo systemctl reload nginx
```

### **Para atualizar apenas o frontend:**
```bash
rsync -avz --delete -e "ssh -i /Users/williamjesus/santos-cleaning-key.pem" \
  "/Users/williamjesus/Site Oficial/SantosCleaningSolutions/frontend-production/" \
  ubuntu@54.67.60.88:/var/www/santos-cleaning/frontend-production/
```

---

## 🆘 Troubleshooting

### **Site não carrega:**
1. Verificar nginx: `sudo systemctl status nginx`
2. Verificar logs: `sudo tail -f /var/log/nginx/santos-cleaning.error.log`
3. Verificar arquivos: `ls -la /var/www/santos-cleaning/frontend-production/`

### **API não responde:**
1. Verificar backend: `ps aux | grep server.py`
2. Verificar porta: `sudo netstat -tlnp | grep :8001`
3. Iniciar backend: `cd /var/www/santos-cleaning && source venv/bin/activate && python server.py`

### **Painel não atualiza:**
1. Verificar console do navegador (F12)
2. Testar API: `curl http://54.67.60.88/api/reviews/stats`
3. Verificar logs do backend: `tail -f /var/www/santos-cleaning/backend.log`

---

## 📞 Suporte

Se precisar de ajuda:
1. Verificar logs do nginx e da aplicação
2. Testar conectividade: `ping 54.67.60.88`
3. Verificar status dos serviços no AWS Console

---

**🎉 Com o deploy concluído, seu painel dinâmico de reviews estará funcionando em produção com dados reais do Supabase!**








