# 🛠️ Comandos Úteis

## 📦 Desenvolvimento Local

### Instalar Dependências
```bash
# Instalar tudo
npm install
cd server && npm install
cd ../client && npm install
```

### Rodar Localmente
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Build para Produção
```bash
# Backend (não precisa build)
cd server
npm install --production

# Frontend
cd client
npm run build
```

---

## 🚀 Deploy

### Preparar para Deploy
```bash
# Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

### Verificar Status
```bash
# Ver últimos commits
git log --oneline -5

# Ver status
git status

# Ver diferenças
git diff
```

---

## 🔍 Testes

### Testar Backend Local
```bash
# Health check
curl http://localhost:3001/health

# Status WhatsApp
curl http://localhost:3001/api/status

# Listar chats
curl http://localhost:3001/api/chats

# Listar contatos
curl http://localhost:3001/api/contacts
```

### Testar Backend Produção
```bash
# Substitua pela sua URL
export API_URL="https://whatsapp-pro-backend.onrender.com"

# Health check
curl $API_URL/health

# Status
curl $API_URL/api/status
```

---

## 📊 Monitoramento

### Ver Logs Render
```bash
# No dashboard do Render:
# Services > seu-servico > Logs

# Ou via CLI (instalar render-cli):
render logs -s whatsapp-pro-backend
```

### Verificar Uptime
```bash
# Health check contínuo
watch -n 5 curl -s https://seu-backend.onrender.com/health
```

---

## 🔧 Manutenção

### Limpar Cache
```bash
# Limpar node_modules
rm -rf node_modules server/node_modules client/node_modules

# Reinstalar
npm install
cd server && npm install
cd ../client && npm install
```

### Limpar Build
```bash
# Limpar dist do frontend
rm -rf client/dist

# Rebuild
cd client
npm run build
```

### Limpar Sessão WhatsApp
```bash
# CUIDADO: Vai desconectar o WhatsApp!
rm -rf server/.wwebjs_auth
rm -rf server/.wwebjs_cache
```

### Limpar Banco de Dados
```bash
# CUIDADO: Vai apagar todos os dados!
rm server/whatsapp.db
rm server/whatsapp.db-journal
```

---

## 🐛 Debug

### Ver Logs Detalhados
```bash
# Backend com logs
cd server
NODE_ENV=development node server.js

# Frontend com logs
cd client
npm run dev -- --debug
```

### Testar Conexão WhatsApp
```bash
# Ver se o QR Code está sendo gerado
curl http://localhost:3001/api/status | jq .qrCode
```

### Verificar Portas
```bash
# Windows
netstat -ano | findstr :3001
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3001
lsof -i :3000
```

---

## 📝 Git

### Desfazer Último Commit
```bash
# Manter alterações
git reset --soft HEAD~1

# Descartar alterações
git reset --hard HEAD~1
```

### Criar Branch
```bash
# Criar e mudar para branch
git checkout -b feature/nova-funcionalidade

# Push da branch
git push origin feature/nova-funcionalidade
```

### Voltar para Main
```bash
git checkout main
git pull origin main
```

### Ver Diferenças
```bash
# Ver o que mudou
git diff

# Ver arquivos modificados
git status

# Ver histórico
git log --oneline --graph
```

---

## 🔄 Atualização

### Atualizar Dependências
```bash
# Ver dependências desatualizadas
npm outdated

# Atualizar todas
npm update

# Atualizar específica
npm install whatsapp-web.js@latest
```

### Atualizar do GitHub
```bash
# Puxar últimas mudanças
git pull origin main

# Reinstalar dependências
npm install
cd server && npm install
cd ../client && npm install
```

---

## 🚨 Emergência

### Servidor Travou
```bash
# Matar processo na porta 3001
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Render Não Responde
```bash
# No dashboard do Render:
# 1. Services > seu-servico
# 2. Manual Deploy > Clear build cache & deploy
# 3. Ou: Settings > Suspend > Resume
```

### WhatsApp Desconectou
```bash
# 1. Acesse o frontend
# 2. Clique em "Reconectar"
# 3. Escaneie novo QR Code
# 4. Aguarde conectar
```

### Banco Corrompido
```bash
# Backup primeiro!
cp server/whatsapp.db server/whatsapp.db.backup

# Recriar banco
rm server/whatsapp.db
# Reinicie o servidor (vai recriar automaticamente)
```

---

## 📦 Backup

### Fazer Backup
```bash
# Criar pasta de backup
mkdir backup

# Backup do banco
cp server/whatsapp.db backup/whatsapp-$(date +%Y%m%d).db

# Backup da sessão WhatsApp
tar -czf backup/session-$(date +%Y%m%d).tar.gz server/.wwebjs_auth
```

### Restaurar Backup
```bash
# Restaurar banco
cp backup/whatsapp-20260201.db server/whatsapp.db

# Restaurar sessão
tar -xzf backup/session-20260201.tar.gz -C server/
```

---

## 🎯 Produtividade

### Aliases Úteis
```bash
# Adicione ao seu .bashrc ou .zshrc

# Rodar backend
alias wpp-server="cd ~/projeto/server && npm run dev"

# Rodar frontend
alias wpp-client="cd ~/projeto/client && npm run dev"

# Deploy rápido
alias wpp-deploy="git add . && git commit -m 'update' && git push"

# Ver logs
alias wpp-logs="cd ~/projeto && tail -f server/*.log"
```

### Scripts Package.json
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build": "cd client && npm run build",
    "start": "cd server && npm start"
  }
}
```

---

## 📚 Recursos

### Documentação
- [Node.js Docs](https://nodejs.org/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Express Docs](https://expressjs.com)
- [Socket.IO Docs](https://socket.io/docs)
- [WhatsApp Web.js](https://wwebjs.dev)

### Ferramentas
- [Postman](https://postman.com) - Testar APIs
- [Insomnia](https://insomnia.rest) - Testar APIs
- [DB Browser SQLite](https://sqlitebrowser.org) - Ver banco
- [Render CLI](https://render.com/docs/cli) - CLI do Render

---

## 💡 Dicas

### Performance
```bash
# Usar PM2 para produção local
npm install -g pm2
pm2 start server/server.js --name whatsapp-pro
pm2 logs whatsapp-pro
pm2 restart whatsapp-pro
```

### Segurança
```bash
# Nunca commitar .env
echo ".env" >> .gitignore

# Usar variáveis de ambiente
export API_KEY="sua-chave-secreta"
```

### Organização
```bash
# Manter código limpo
npm run lint
npm run format

# Commitar frequentemente
git commit -m "feat: pequena melhoria"
```

---

**Salve este arquivo para referência rápida!** 📌
