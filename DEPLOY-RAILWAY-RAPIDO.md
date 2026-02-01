# ⚡ Deploy Railway - Guia Rápido

## 🎯 Frontend - Configuração Rápida

### 1. Criar Serviço
```
Railway > Projeto Existente > + New > GitHub Repo > chatbot
```

### 2. Configurações (Settings)
```yaml
Service Name: whatsapp-pro-frontend
Root Directory: client
Build Command: npm install && npm run build
Start Command: npx serve -s dist -l $PORT
```

### 3. Variável de Ambiente
```
VITE_API_URL = https://whatsapp-pro-backend-production.up.railway.app
```

### 4. Gerar Domínio
```
Settings > Networking > Generate Domain
```

### 5. Copiar URL
```
Exemplo: https://whatsapp-pro-frontend-production.up.railway.app
```

---

## 🔄 Backend - Adicionar Frontend URL

### 1. Ir para Backend
```
Railway > Backend Service > Variables
```

### 2. Nova Variável
```
FRONTEND_URL = https://whatsapp-pro-frontend-production.up.railway.app
```

---

## ✅ Testar

### Frontend
```
https://whatsapp-pro-frontend-production.up.railway.app
```
Deve mostrar o painel

### Backend
```
https://whatsapp-pro-backend-production.up.railway.app
```
Deve mostrar link do frontend Railway

### Console (F12)
```
✅ Conectado ao servidor
```

---

## 🐛 Problemas Comuns

### Página em branco
```
Verifique: Start Command = npx serve -s dist -l $PORT
```

### CORS Error
```
Verifique: VITE_API_URL está correto
```

### Failed to fetch
```
Verifique: Backend está online
```

---

## 📋 Checklist

- [ ] Criar serviço frontend
- [ ] Configurar Root: `client`
- [ ] Configurar Build Command
- [ ] Configurar Start Command
- [ ] Adicionar `VITE_API_URL`
- [ ] Gerar domínio
- [ ] Adicionar `FRONTEND_URL` no backend
- [ ] Testar tudo
- [ ] Escanear QR Code
- [ ] Pronto! 🎉

---

## ⏱️ Tempo Total: ~10 minutos

1. Deploy frontend: 5 min
2. Configurar backend: 2 min
3. Testar: 3 min

**Veja o guia completo em: `DEPLOY-RAILWAY-COMPLETO.md`**
