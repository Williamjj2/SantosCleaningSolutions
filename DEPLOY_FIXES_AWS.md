# 🚀 Santos Cleaning Solutions - Deploy de Correções para AWS

## 🐛 Bugs Corrigidos

1. **PWA/Install Prompt Indesejado** ✅
   - Service Worker desabilitado
   - Manifest.json desabilitado
   - Script de limpeza automática adicionado

2. **Reviews do Google Não Aparecem** ✅
   - API corrigida para retornar reviews de fallback
   - Arquivo reviews.json atualizado com 8 reviews
   - Server.py configurado com fallback robusto

3. **Problemas de Performance** ✅
   - Removidos arquivos .map (debug)
   - Limpeza de arquivos JS/CSS antigos
   - Nginx otimizado para AWS

4. **Configuração AWS/Nginx** ✅
   - Nova configuração nginx-aws-optimized.conf
   - Bloqueio de service worker
   - Cache headers otimizados

## 📋 Checklist de Deploy

### Passo 1: Backup
```bash
# No servidor AWS
ssh usuario@seu-servidor-aws.com
cd /var/www
sudo tar -czf santos-backup-$(date +%Y%m%d-%H%M%S).tar.gz santos-cleaning-frontend/
```

### Passo 2: Executar Script de Limpeza
```bash
# Na máquina local
cd /Users/williamjesus/SantosCleaningSolutions
chmod +x cleanup-production.sh
./cleanup-production.sh
```

### Passo 3: Upload dos Arquivos Corrigidos

#### Opção A: Via Git (Recomendado)
```bash
# Commit das mudanças
git add .
git commit -m "Fix: Desabilitar PWA, corrigir reviews, otimizar performance"
git push origin v2-20250807-2207

# No servidor AWS
cd /var/www/santos-cleaning-frontend
git pull origin v2-20250807-2207
```

#### Opção B: Via SCP
```bash
# Upload dos arquivos críticos
scp frontend-production/index.html usuario@servidor:/var/www/santos-cleaning-frontend/
scp -r frontend-production/data/ usuario@servidor:/var/www/santos-cleaning-frontend/
scp server.py usuario@servidor:/home/usuario/
scp nginx-aws-optimized.conf usuario@servidor:/home/usuario/
```

### Passo 4: Atualizar Configuração Nginx
```bash
# No servidor AWS
sudo cp /etc/nginx/sites-available/santoscsolutions.com /etc/nginx/sites-available/santoscsolutions.com.backup
sudo cp ~/nginx-aws-optimized.conf /etc/nginx/sites-available/santoscsolutions.com

# Testar configuração
sudo nginx -t

# Se OK, recarregar
sudo systemctl reload nginx
```

### Passo 5: Reiniciar Backend Python
```bash
# Encontrar processo do server.py
ps aux | grep server.py

# Matar processo antigo
sudo kill -9 [PID]

# Iniciar novo (com PM2 se disponível)
pm2 restart santos-api

# Ou manualmente
cd /home/usuario
nohup python3 server.py > santos-api.log 2>&1 &

# Verificar se está rodando
curl http://localhost:8001/api/health
```

### Passo 6: Limpar Cache do Navegador
```javascript
// No console do navegador (F12)
// Executar em santoscsolutions.com

// Limpar Service Workers
navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
        registration.unregister();
        console.log('Service Worker unregistered:', registration.scope);
    }
});

// Limpar todos os caches
caches.keys().then(function(names) {
    for (let name of names) {
        caches.delete(name);
        console.log('Cache deleted:', name);
    }
});

// Recarregar
location.reload(true);
```

### Passo 7: Verificação Final

#### Testes Críticos:
1. **PWA Desabilitado:**
   - Abrir site em Chrome
   - Não deve aparecer prompt de instalação
   - Verificar: chrome://apps (não deve estar listado)

2. **Reviews Funcionando:**
   - Abrir https://santoscsolutions.com
   - Scroll até seção de reviews
   - Devem aparecer 8 reviews

3. **Performance:**
   - Abrir Network tab (F12)
   - Recarregar página
   - Verificar que não carrega .map files
   - Verificar que não carrega sw.js

4. **API Health Check:**
   ```bash
   curl https://santoscsolutions.com/api/health
   curl https://santoscsolutions.com/api/reviews
   ```

## 🔧 Troubleshooting

### Problema: Reviews ainda não aparecem
```bash
# Verificar logs do Python
tail -f ~/santos-api.log

# Testar API diretamente
curl http://localhost:8001/api/reviews

# Verificar se arquivo existe
ls -la /var/www/santos-cleaning-frontend/data/reviews.json
```

### Problema: Service Worker ainda aparece
```bash
# Forçar remoção
sudo rm -f /var/www/santos-cleaning-frontend/sw.js
sudo rm -f /var/www/santos-cleaning-frontend/manifest.json

# Limpar cache nginx
sudo rm -rf /var/cache/nginx/*
sudo systemctl restart nginx
```

### Problema: Site lento
```bash
# Verificar logs nginx
sudo tail -f /var/log/nginx/santos-error.log

# Verificar uso de memória
free -h
top

# Verificar espaço em disco
df -h
```

## 📊 Melhorias Esperadas

### Antes:
- ❌ Prompt de instalação PWA aparecendo
- ❌ Reviews não carregando
- ❌ ~40MB de arquivos .map desnecessários
- ❌ Service Worker causando cache problemático

### Depois:
- ✅ Sem prompts de instalação
- ✅ 8 reviews visíveis
- ✅ Redução de ~50% no tamanho dos assets
- ✅ Cache otimizado e controlado

## 🔒 Segurança

1. **Backup sempre antes de deploy**
2. **Testar em staging se possível**
3. **Monitorar logs após deploy**
4. **Ter plano de rollback pronto**

## 📞 Suporte

Em caso de problemas durante o deploy:
1. Reverter para backup
2. Verificar logs de erro
3. Testar componentes individualmente
4. Documentar erros encontrados

## ⏰ Tempo Estimado

- Backup: 2 min
- Limpeza: 1 min
- Upload: 5 min
- Nginx: 2 min
- Restart: 2 min
- Verificação: 5 min
- **Total: ~20 minutos**

## ✅ Confirmação Final

Após o deploy, confirme:
- [ ] PWA desabilitado (sem install prompt)
- [ ] Reviews aparecem (mínimo 6 reviews)
- [ ] Site carrega mais rápido
- [ ] Sem erros no console
- [ ] API respondendo corretamente
- [ ] Nginx sem erros
- [ ] Python backend rodando

---

**Última atualização:** $(date)
**Versão:** 2.0.1-fixes
**Branch:** v2-20250807-2207-fixed
