# 🚀 Deploy no VPS Hostinger - Guia Completo

## 📋 Pré-requisitos

- VPS Hostinger contratado (mínimo KVM 1 - 4GB RAM)
- Acesso SSH ao servidor
- Domínio (opcional, mas recomendado)

## 🔧 Passo 1: Conectar ao VPS via SSH

```bash
ssh root@SEU_IP_VPS
# Digite a senha fornecida pela Hostinger
```

## 📦 Passo 2: Instalar Dependências

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar Git
apt install -y git

# Instalar PM2 (gerenciador de processos)
npm install -g pm2

# Instalar dependências do Chromium/Puppeteer
apt install -y \
  chromium-browser \
  chromium-codecs-ffmpeg \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libatspi2.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libwayland-client0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxkbcommon0 \
  libxrandr2 \
  xdg-utils \
  libu2f-udev \
  libvulkan1

# Verificar instalações
node --version
npm --version
git --version
pm2 --version
```

## 📂 Passo 3: Clonar o Projeto

```bash
# Ir para diretório home
cd /root

# Clonar repositório
git clone https://github.com/karlos123230/chatbot.git
cd chatbot

# Instalar dependências do backend
cd server
npm install

# Voltar para raiz
cd ..

# Instalar dependências do frontend
cd client
npm install
cd ..
```

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env no servidor
cd /root/chatbot/server
nano .env
```

Adicione:
```env
PORT=3001
NODE_ENV=production
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

Salve com `CTRL+O`, `ENTER`, `CTRL+X`

## 🏗️ Passo 5: Build do Frontend

```bash
cd /root/chatbot/client

# Criar arquivo .env
nano .env
```

Adicione (substitua SEU_IP_VPS pelo IP real):
```env
VITE_API_URL=http://SEU_IP_VPS:3001
```

Salve e faça o build:
```bash
npm run build
```

## 🚀 Passo 6: Iniciar Backend com PM2

```bash
cd /root/chatbot/server

# Iniciar com PM2
pm2 start server.js --name whatsapp-backend

# Configurar para iniciar automaticamente
pm2 startup
pm2 save

# Ver logs
pm2 logs whatsapp-backend

# Ver status
pm2 status
```

## 🌐 Passo 7: Servir Frontend com Nginx

```bash
# Instalar Nginx
apt install -y nginx

# Criar configuração
nano /etc/nginx/sites-available/whatsapp-frontend
```

Adicione:
```nginx
server {
    listen 80;
    server_name SEU_IP_VPS;  # ou seu domínio

    root /root/chatbot/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket para Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Salve e ative:
```bash
# Criar link simbólico
ln -s /etc/nginx/sites-available/whatsapp-frontend /etc/nginx/sites-enabled/

# Remover configuração padrão
rm /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx
```

## 🔥 Passo 8: Configurar Firewall

```bash
# Permitir portas necessárias
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS (futuro)
ufw allow 3001/tcp  # Backend (opcional, se quiser acesso direto)

# Ativar firewall
ufw enable

# Ver status
ufw status
```

## ✅ Passo 9: Testar o Sistema

Acesse no navegador:
```
http://SEU_IP_VPS
```

Você deve ver o sistema funcionando!

## 🔄 Comandos Úteis PM2

```bash
# Ver logs em tempo real
pm2 logs whatsapp-backend

# Reiniciar aplicação
pm2 restart whatsapp-backend

# Parar aplicação
pm2 stop whatsapp-backend

# Ver status
pm2 status

# Ver informações detalhadas
pm2 show whatsapp-backend

# Monitorar recursos
pm2 monit
```

## 🔄 Atualizar o Sistema

Quando fizer mudanças no código:

```bash
cd /root/chatbot

# Puxar atualizações
git pull

# Atualizar backend
cd server
npm install
pm2 restart whatsapp-backend

# Atualizar frontend
cd ../client
npm install
npm run build
```

## 🌐 Configurar Domínio (Opcional)

Se você tem um domínio:

1. **No painel do domínio**, crie um registro A:
   - Nome: `@` ou `whatsapp`
   - Tipo: `A`
   - Valor: `SEU_IP_VPS`

2. **Atualizar Nginx**:
```bash
nano /etc/nginx/sites-available/whatsapp-frontend
```

Mude `server_name` para seu domínio:
```nginx
server_name seudominio.com www.seudominio.com;
```

3. **Instalar SSL (HTTPS)**:
```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
certbot --nginx -d seudominio.com -d www.seudominio.com

# Renovação automática já está configurada
```

4. **Atualizar .env do frontend**:
```bash
cd /root/chatbot/client
nano .env
```

Mude para:
```env
VITE_API_URL=https://seudominio.com
```

Rebuild:
```bash
npm run build
```

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Ver logs
pm2 logs whatsapp-backend

# Verificar se porta está em uso
netstat -tulpn | grep 3001

# Matar processo na porta
kill -9 $(lsof -t -i:3001)
```

### Chromium não encontrado
```bash
# Verificar caminho
which chromium-browser

# Atualizar .env com caminho correto
nano /root/chatbot/server/.env
```

### Nginx não funciona
```bash
# Ver logs de erro
tail -f /var/log/nginx/error.log

# Testar configuração
nginx -t

# Reiniciar
systemctl restart nginx
```

### Permissões
```bash
# Dar permissões corretas
chmod -R 755 /root/chatbot
chown -R root:root /root/chatbot
```

## 📊 Monitoramento

```bash
# Ver uso de recursos
htop

# Ver uso de disco
df -h

# Ver uso de memória
free -h

# Ver processos Node.js
ps aux | grep node
```

## 🔒 Segurança Adicional

```bash
# Criar usuário não-root (recomendado)
adduser whatsapp
usermod -aG sudo whatsapp

# Desabilitar login root via SSH
nano /etc/ssh/sshd_config
# Mude: PermitRootLogin no
systemctl restart sshd

# Instalar fail2ban (proteção contra ataques)
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## 💰 Custos Hostinger VPS

- **KVM 1** (4GB RAM): ~R$ 25/mês - **Recomendado**
- **KVM 2** (8GB RAM): ~R$ 50/mês - Para alto volume
- **KVM 4** (16GB RAM): ~R$ 100/mês - Para múltiplas instâncias

## ✅ Vantagens VPS Hostinger

- ✅ Controle total do servidor
- ✅ 4GB RAM (suficiente para Puppeteer)
- ✅ IP dedicado
- ✅ Roda 24/7
- ✅ Suporte em português
- ✅ Painel de controle fácil
- ✅ Backups automáticos (opcional)

## 📝 Checklist Final

- [ ] VPS contratado e acessível via SSH
- [ ] Node.js, Git, PM2 instalados
- [ ] Chromium e dependências instaladas
- [ ] Projeto clonado e dependências instaladas
- [ ] Backend rodando com PM2
- [ ] Frontend buildado
- [ ] Nginx configurado e rodando
- [ ] Firewall configurado
- [ ] Sistema acessível pelo IP/domínio
- [ ] QR Code gerando corretamente
- [ ] WhatsApp conectando

---

**Status**: ✅ Pronto para deploy
**Plataforma**: Hostinger VPS
**Custo**: ~R$ 25/mês (KVM 1)
**Dificuldade**: Média (requer conhecimento de Linux)
