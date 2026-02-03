#!/bin/bash

echo "=========================================="
echo "🚀 ATUALIZANDO SISTEMA NO VPS"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Passo 1: Atualizar código
echo -e "${YELLOW}📥 Passo 1: Atualizando código do GitHub...${NC}"
cd /root/chatbot
git stash
git pull origin main
echo -e "${GREEN}✅ Código atualizado!${NC}"
echo ""

# Passo 2: Atualizar e buildar frontend
echo -e "${YELLOW}🎨 Passo 2: Buildando frontend...${NC}"
cd /root/chatbot/client
npm install
npm run build
echo -e "${GREEN}✅ Frontend buildado!${NC}"
echo ""

# Passo 3: Reiniciar backend
echo -e "${YELLOW}🔄 Passo 3: Reiniciando backend...${NC}"
cd /root/chatbot/server
pm2 restart whatsapp-backend
echo -e "${GREEN}✅ Backend reiniciado!${NC}"
echo ""

# Passo 4: Configurar Nginx na porta 8080
echo -e "${YELLOW}⚙️  Passo 4: Configurando Nginx na porta 8080...${NC}"
cat > /etc/nginx/conf.d/whatsapp.conf << 'EOF'
server {
    listen 8080;
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    access_log /var/log/nginx/whatsapp_access.log;
    error_log /var/log/nginx/whatsapp_error.log;
}
EOF
echo -e "${GREEN}✅ Nginx configurado!${NC}"
echo ""

# Passo 5: Testar e reiniciar Nginx
echo -e "${YELLOW}🔧 Passo 5: Testando e reiniciando Nginx...${NC}"
nginx -t
if [ $? -eq 0 ]; then
    systemctl restart nginx
    echo -e "${GREEN}✅ Nginx reiniciado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro na configuração do Nginx!${NC}"
    exit 1
fi
echo ""

# Passo 6: Abrir firewall
echo -e "${YELLOW}🔥 Passo 6: Configurando firewall...${NC}"
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-port=8080/tcp
    firewall-cmd --reload
    echo -e "${GREEN}✅ Firewall configurado (firewalld)!${NC}"
elif command -v ufw &> /dev/null; then
    ufw allow 8080/tcp
    echo -e "${GREEN}✅ Firewall configurado (ufw)!${NC}"
else
    echo -e "${YELLOW}⚠️  Nenhum firewall detectado, pulando...${NC}"
fi
echo ""

# Verificações finais
echo "=========================================="
echo "✅ VERIFICAÇÕES FINAIS"
echo "=========================================="
echo ""

echo -e "${YELLOW}📊 Status do PM2:${NC}"
pm2 status
echo ""

echo -e "${YELLOW}🌐 Status do Nginx:${NC}"
systemctl status nginx --no-pager | head -5
echo ""

echo -e "${YELLOW}🔌 Portas em uso:${NC}"
echo "Porta 3001 (Backend):"
netstat -tulpn | grep 3001
echo "Porta 8080 (Frontend):"
netstat -tulpn | grep 8080
echo ""

echo "=========================================="
echo -e "${GREEN}🎉 DEPLOY CONCLUÍDO!${NC}"
echo "=========================================="
echo ""
echo -e "🌐 Acesse o sistema em: ${GREEN}http://76.13.224.212:8080${NC}"
echo ""
echo "📝 Comandos úteis:"
echo "  - Ver logs backend: pm2 logs whatsapp-backend"
echo "  - Ver logs Nginx: tail -f /var/log/nginx/whatsapp_error.log"
echo "  - Reiniciar backend: pm2 restart whatsapp-backend"
echo "  - Reiniciar Nginx: systemctl restart nginx"
echo ""
