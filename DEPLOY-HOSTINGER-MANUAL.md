# 🚀 Deploy Manual no VPS Hostinger - IP: 76.13.224.212

## 📋 Opção 1: Deploy Automático (Recomendado)

### Passo 1: Conectar ao VPS
Abra o terminal (PowerShell ou CMD) e conecte:

```bash
ssh root@76.13.224.212
```

Digite a senha quando solicitado.

### Passo 2: Baixar e executar script automático

```bash
# Baixar script
curl -o deploy.sh https://raw.githubusercontent.com/karlos123230/chatbot/main/deploy-hostinger.sh

# Dar permissão de execução
chmod +x deploy.sh

# Executar
./deploy.sh
```

O script vai instalar tudo automaticamente! ⏱️ Tempo estimado: 10-15 minutos

---

## 📋 Opção 2: Deploy Manual (Passo a Passo)

Se preferir fazer manualmente, siga os passos abaixo:

### 1️⃣ Conectar ao VPS

```bash
ssh root@76.13.224.212
```

### 2️⃣ Atualizar Sistema

```bash
apt update && apt upgrade -y
```

### 3️⃣ Instalar Node.js 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 4️⃣ Instalar Git

```bash
apt install -y git
git --version
```

### 5️⃣ Instalar PM2

```bash
npm install -g pm2
pm2 --version
```

### 6️⃣ Instalar Chromium e Dependências

```bash
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
```

### 7️⃣ Clonar Projeto

```bash
cd /root
git clone https://github.com/karlos123230/chatbot.git
cd chatbot
```

### 8️⃣ Configurar Backend

```bash
cd /root/chatbot/server
npm install

# Criar arquivo .env
nano .env
```

Cole este conteúdo:
```env
PORT=3001
NODE_ENV=production
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

Salve com: `CTRL+O`, `ENTER`, `CTRL+X`

### 9️⃣ Configurar Frontend

```bash
cd /root/chatbot/client
npm install

# Criar arquivo .env
nano .env
```

Cole este conteúdo:
```env
VITE_API_URL=http://76.13.224.212:3001
```

Salve com: `CTRL+O`, `ENTER`, `CTRL+X`

### 🔟 Buildar Frontend

```bash
npm run build
```

### 1️⃣1️⃣ Iniciar Backend com PM2

```bash
cd /root/chatbot/server
pm2 start server.js --name whatsapp-backend
pm2 save
pm2 startup
```

Copie e execute o comando que aparecer (se houver).

### 1️⃣2️⃣ Instalar Nginx

```bash
apt install -y nginx
```

### 1️⃣3️⃣ Configurar Nginx

```bash
nano /etc/nginx/sites-available/whatsapp-frontend
```

Cole este conteúdo:
```nginx
server {
    listen 80;
    server_name 76.13.224.212;

    root /root/chatbot/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

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

Salve com: `CTRL+O`, `ENTER`, `CTRL+X`

### 1️⃣4️⃣ Ativar Site no Nginx

```bash
ln -s /etc/nginx/sites-available/whatsapp-frontend /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### 1️⃣5️⃣ Configurar Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3001/tcp
ufw enable
```

Digite `y` quando perguntado.

---

## ✅ Verificar se Está Funcionando

### Verificar Backend
```bash
pm2 status
pm2 logs whatsapp-backend
curl http://localhost:3001/api/status
```

### Verificar Nginx
```bash
systemctl status nginx
curl http://localhost
```

### Acessar no Navegador
Abra: **http://76.13.224.212**

---

## 🔧 Comandos Úteis

### PM2 (Backend)
```bash
pm2 logs whatsapp-backend     # Ver logs em tempo real
pm2 restart whatsapp-backend  # Reiniciar
pm2 stop whatsapp-backend     # Parar
pm2 status                    # Ver status
pm2 monit                     # Monitor de recursos
```

### Nginx (Frontend)
```bash
systemctl status nginx        # Ver status
systemctl restart nginx       # Reiniciar
nginx -t                      # Testar configuração
tail -f /var/log/nginx/error.log  # Ver erros
```

### Sistema
```bash
htop                          # Monitor de recursos
df -h                         # Espaço em disco
free -h                       # Memória RAM
```

---

## 🔄 Atualizar Sistema

Quando fizer mudanças no código:

```bash
cd /root/chatbot
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

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
pm2 logs whatsapp-backend
# Ver o erro e corrigir
```

### Porta 3001 em uso
```bash
netstat -tulpn | grep 3001
kill -9 $(lsof -t -i:3001)
pm2 restart whatsapp-backend
```

### Nginx não funciona
```bash
nginx -t
tail -f /var/log/nginx/error.log
systemctl restart nginx
```

### Chromium não encontrado
```bash
which chromium-browser
# Atualizar caminho no .env se necessário
```

### Sem espaço em disco
```bash
df -h
# Limpar cache do npm
npm cache clean --force
# Limpar logs antigos
pm2 flush
```

---

## 📊 Monitoramento

### Ver uso de recursos
```bash
htop
```

### Ver logs do sistema
```bash
journalctl -xe
```

### Ver conexões ativas
```bash
netstat -tulpn
```

---

## 🎯 Checklist Final

- [ ] Conectado ao VPS via SSH
- [ ] Node.js instalado (v18+)
- [ ] Git instalado
- [ ] PM2 instalado
- [ ] Chromium instalado
- [ ] Projeto clonado
- [ ] Backend configurado (.env)
- [ ] Frontend configurado (.env)
- [ ] Frontend buildado
- [ ] Backend rodando com PM2
- [ ] Nginx instalado e configurado
- [ ] Firewall configurado
- [ ] Sistema acessível em http://76.13.224.212
- [ ] QR Code gerando
- [ ] WhatsApp conectando

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs: `pm2 logs whatsapp-backend`
2. Verifique o Nginx: `nginx -t`
3. Verifique o firewall: `ufw status`
4. Teste a API: `curl http://localhost:3001/api/status`

---

**IP do VPS**: 76.13.224.212
**URL do Sistema**: http://76.13.224.212
**Backend**: http://76.13.224.212:3001
