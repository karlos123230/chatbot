# ✅ DEPLOY CONCLUÍDO - VPS HOSTINGER UBUNTU

## 📊 Informações do Servidor

- **IP**: 76.13.224.212
- **Sistema**: Ubuntu 24.04
- **URL Frontend**: http://76.13.224.212:8080
- **URL Backend**: http://76.13.224.212:3001
- **Data Deploy**: 03/02/2026

---

## 🚀 Serviços Rodando

### Backend (PM2)
- **Porta**: 3001
- **Processo**: whatsapp-backend
- **Status**: Online ✅

### Frontend (Nginx)
- **Porta**: 8080
- **Diretório**: /root/chatbot/client/dist
- **Status**: Online ✅

### WhatsApp Client
- **Status**: Conectado ✅
- **QR Code**: Gerando automaticamente

---

## 📦 Pacotes Instalados

### Sistema
- Node.js 22.x
- NPM 10.x
- PM2 6.x
- Nginx
- Git

### Dependências do Chrome
- libatk1.0-0
- libatk-bridge2.0-0
- libcups2
- libdrm2
- libxkbcommon0
- libxcomposite1
- libxdamage1
- libxfixes3
- libxrandr2
- libgbm1
- libpango-1.0-0
- libcairo2
- libasound2t64
- libatspi2.0-0
- libxshmfence1
- libnss3
- libnspr4
- libdbus-1-3

---

## 🔧 Comandos Úteis

### PM2 (Backend)
```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs whatsapp-backend

# Ver últimas 100 linhas
pm2 logs whatsapp-backend --lines 100

# Reiniciar
pm2 restart whatsapp-backend

# Parar
pm2 stop whatsapp-backend

# Iniciar
pm2 start whatsapp-backend

# Monitorar recursos
pm2 monit
```

### Nginx (Frontend)
```bash
# Ver status
systemctl status nginx

# Reiniciar
systemctl restart nginx

# Parar
systemctl stop nginx

# Iniciar
systemctl start nginx

# Testar configuração
nginx -t

# Ver logs de erro
tail -f /var/log/nginx/whatsapp_error.log

# Ver logs de acesso
tail -f /var/log/nginx/whatsapp_access.log
```

### Sistema
```bash
# Ver portas em uso
netstat -tulpn | grep 8080
netstat -tulpn | grep 3001

# Ver uso de recursos
htop

# Ver espaço em disco
df -h

# Ver memória
free -h
```

---

## 🔄 Atualizar Sistema

Quando fizer mudanças no código:

```bash
# 1. Ir para o diretório
cd /root/chatbot

# 2. Puxar atualizações do GitHub
git stash
git pull origin main

# 3. Atualizar backend
cd server
npm install
pm2 restart whatsapp-backend

# 4. Atualizar frontend
cd ../client
npm install
npm run build

# 5. Reiniciar Nginx (se necessário)
systemctl restart nginx
```

---

## 🔥 Firewall (UFW)

### Portas Abertas
- 22/tcp (SSH)
- 8080/tcp (Frontend)
- 3001/tcp (Backend API)

### Comandos
```bash
# Ver status
ufw status

# Adicionar porta
ufw allow 8080/tcp

# Remover porta
ufw delete allow 8080/tcp

# Habilitar
ufw enable

# Desabilitar
ufw disable
```

---

## 📁 Estrutura de Arquivos

```
/root/chatbot/
├── server/
│   ├── server.js          # Backend principal
│   ├── database.js        # Banco de dados SQLite
│   ├── .env              # Variáveis de ambiente
│   ├── package.json
│   └── node_modules/
├── client/
│   ├── src/
│   │   ├── App.jsx       # Frontend React
│   │   ├── App.css
│   │   └── index.css
│   ├── dist/             # Build do frontend (servido pelo Nginx)
│   ├── .env              # Variáveis de ambiente
│   ├── package.json
│   └── node_modules/
└── .git/
```

---

## ⚙️ Arquivos de Configuração

### Backend .env
```env
PORT=3001
NODE_ENV=production
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Frontend .env
```env
VITE_API_URL=http://76.13.224.212:3001
```

### Nginx Config
```
/etc/nginx/conf.d/whatsapp.conf
```

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Ver logs de erro
pm2 logs whatsapp-backend --err

# Verificar se a porta está em uso
netstat -tulpn | grep 3001

# Matar processo na porta 3001
kill -9 $(lsof -t -i:3001)

# Reiniciar
pm2 restart whatsapp-backend
```

### Frontend não carrega
```bash
# Verificar se o Nginx está rodando
systemctl status nginx

# Testar configuração
nginx -t

# Ver logs de erro
tail -f /var/log/nginx/whatsapp_error.log

# Verificar permissões
ls -la /root/chatbot/client/dist

# Reiniciar Nginx
systemctl restart nginx
```

### WhatsApp não conecta
```bash
# Ver logs do backend
pm2 logs whatsapp-backend

# Verificar se o Chrome está instalado
which chromium-browser

# Limpar cache do Puppeteer
rm -rf /root/.cache/puppeteer

# Reinstalar dependências
cd /root/chatbot/server
npm install

# Reiniciar
pm2 restart whatsapp-backend
```

### Erro de bibliotecas faltando
```bash
# Instalar dependências do Chrome
apt install -y libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2t64 libatspi2.0-0 libxshmfence1 libnss3 libnspr4 libdbus-1-3

# Atualizar cache de bibliotecas
ldconfig

# Reiniciar backend
pm2 restart whatsapp-backend
```

---

## 🔐 Segurança

### Recomendações
1. ✅ Firewall configurado (UFW)
2. ✅ Portas mínimas abertas
3. ⚠️ Considerar adicionar SSL/HTTPS (Let's Encrypt)
4. ⚠️ Considerar adicionar autenticação no frontend
5. ⚠️ Fazer backup regular do banco de dados

### Backup do Banco de Dados
```bash
# Criar backup
cp /root/chatbot/server/whatsapp.db /root/backup-$(date +%Y%m%d).db

# Restaurar backup
cp /root/backup-20260203.db /root/chatbot/server/whatsapp.db
pm2 restart whatsapp-backend
```

---

## 📊 Monitoramento

### Ver uso de recursos
```bash
# CPU e Memória
htop

# Processos do PM2
pm2 monit

# Logs em tempo real
pm2 logs whatsapp-backend

# Status dos serviços
systemctl status nginx
pm2 status
```

---

## 🎯 Checklist de Funcionamento

- [x] Backend rodando na porta 3001
- [x] Frontend rodando na porta 8080
- [x] Nginx configurado e ativo
- [x] PM2 gerenciando backend
- [x] Firewall configurado
- [x] WhatsApp conectando
- [x] QR Code gerando
- [x] Mensagens enviando
- [x] Interface responsiva
- [x] Todas as funcionalidades operacionais

---

## 📞 Acesso

**URL Principal**: http://76.13.224.212:8080

**Funcionalidades Disponíveis**:
- ✅ Dashboard
- ✅ Conversas
- ✅ Contatos
- ✅ Enviar Mensagens
- ✅ Localizar Números
- ✅ Agendamento
- ✅ Grupos
- ✅ Auto-Resposta

---

## 🎉 Status Final

**SISTEMA 100% OPERACIONAL** ✅

Deploy concluído com sucesso em 03/02/2026 às 20:15 UTC.

Todas as funcionalidades testadas e funcionando perfeitamente!
