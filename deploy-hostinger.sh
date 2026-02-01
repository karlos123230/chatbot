#!/bin/bash

# 🚀 Script de Deploy Automático - Hostinger VPS
# IP: 76.13.224.212

echo "🚀 Iniciando deploy no VPS Hostinger..."
echo "📍 IP: 76.13.224.212"
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para printar com cor
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Passo 1: Atualizar sistema
print_info "Passo 1/10: Atualizando sistema..."
apt update && apt upgrade -y
print_success "Sistema atualizado!"

# Passo 2: Instalar Node.js 18
print_info "Passo 2/10: Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
print_success "Node.js instalado: $(node --version)"

# Passo 3: Instalar Git
print_info "Passo 3/10: Instalando Git..."
apt install -y git
print_success "Git instalado: $(git --version)"

# Passo 4: Instalar PM2
print_info "Passo 4/10: Instalando PM2..."
npm install -g pm2
print_success "PM2 instalado: $(pm2 --version)"

# Passo 5: Instalar dependências do Chromium
print_info "Passo 5/10: Instalando Chromium e dependências..."
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
print_success "Chromium instalado!"

# Passo 6: Clonar projeto
print_info "Passo 6/10: Clonando projeto do GitHub..."
cd /root
if [ -d "chatbot" ]; then
    print_info "Diretório chatbot já existe, removendo..."
    rm -rf chatbot
fi
git clone https://github.com/karlos123230/chatbot.git
cd chatbot
print_success "Projeto clonado!"

# Passo 7: Instalar dependências do backend
print_info "Passo 7/10: Instalando dependências do backend..."
cd /root/chatbot/server
npm install
print_success "Dependências do backend instaladas!"

# Criar .env do backend
print_info "Criando arquivo .env do backend..."
cat > .env << EOF
PORT=3001
NODE_ENV=production
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
EOF
print_success "Arquivo .env do backend criado!"

# Passo 8: Instalar dependências e buildar frontend
print_info "Passo 8/10: Instalando dependências do frontend..."
cd /root/chatbot/client
npm install
print_success "Dependências do frontend instaladas!"

# Criar .env do frontend
print_info "Criando arquivo .env do frontend..."
cat > .env << EOF
VITE_API_URL=http://76.13.224.212:3001
EOF
print_success "Arquivo .env do frontend criado!"

print_info "Buildando frontend..."
npm run build
print_success "Frontend buildado!"

# Passo 9: Configurar e iniciar backend com PM2
print_info "Passo 9/10: Iniciando backend com PM2..."
cd /root/chatbot/server

# Parar processo anterior se existir
pm2 delete whatsapp-backend 2>/dev/null || true

# Iniciar novo processo
pm2 start server.js --name whatsapp-backend
pm2 save
pm2 startup
print_success "Backend iniciado com PM2!"

# Passo 10: Instalar e configurar Nginx
print_info "Passo 10/10: Configurando Nginx..."
apt install -y nginx

# Criar configuração do Nginx
cat > /etc/nginx/sites-available/whatsapp-frontend << 'EOF'
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
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/whatsapp-frontend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx
print_success "Nginx configurado e rodando!"

# Configurar firewall
print_info "Configurando firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3001/tcp
echo "y" | ufw enable
print_success "Firewall configurado!"

echo ""
echo "=========================================="
print_success "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "=========================================="
echo ""
print_info "📍 Acesse seu sistema em:"
echo "   http://76.13.224.212"
echo ""
print_info "🔧 Comandos úteis:"
echo "   pm2 logs whatsapp-backend  - Ver logs"
echo "   pm2 restart whatsapp-backend  - Reiniciar"
echo "   pm2 status  - Ver status"
echo ""
print_info "📊 Verificar se está rodando:"
echo "   curl http://localhost:3001/api/status"
echo ""
