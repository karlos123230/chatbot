# 🔍 Troubleshooting - QR Code Não Carrega

## 🎯 Diagnóstico Rápido

### 1. Verificar Console do Navegador (F12)

Pressione **F12** e vá na aba **Console**. Procure por:

#### ✅ Mensagens Esperadas:
```
🔗 Conectando ao backend: https://whatsapp-pro-backend-production.up.railway.app
✅ Conectado ao servidor
✅ QR Code recebido do servidor
```

#### ❌ Erros Comuns:

**Erro 1: Failed to fetch**
```
Failed to fetch
```
**Causa**: Backend offline ou URL errada  
**Solução**: Verifique se backend está online no Railway

**Erro 2: CORS Error**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**Causa**: CORS não configurado  
**Solução**: Backend já tem CORS configurado, pode ser cache

**Erro 3: WebSocket connection failed**
```
WebSocket connection to 'wss://...' failed
```
**Causa**: Socket.IO não consegue conectar  
**Solução**: Verifique se backend está rodando

---

### 2. Verificar Logs do Backend (Railway)

1. Acesse: https://railway.app
2. Vá no projeto > **whatsapp-pro-backend**
3. Clique em **Deployments** > **View Logs**

#### ✅ Logs Esperados:
```
🚀 Iniciando WhatsApp Client...
📦 Puppeteer vai baixar Chrome automaticamente...
⏳ Inicializando cliente WhatsApp...
⚠️ Isso pode levar 30-60 segundos na primeira vez...
✅ QR Code recebido!
✅ QR Code convertido para base64
```

#### ❌ Erros Comuns:

**Erro 1: Chrome not found**
```
❌ Erro ao inicializar: Could not find Chrome
```
**Solução**: Puppeteer não conseguiu baixar Chrome
```bash
# Adicione no Railway (Variables):
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
```

**Erro 2: Timeout**
```
❌ Erro ao inicializar: Timeout exceeded
```
**Solução**: Aumentar memória ou aguardar mais tempo

**Erro 3: Memory limit**
```
Error: spawn ENOMEM
```
**Solução**: Railway free tier tem pouca memória, considere upgrade

---

### 3. Verificar Status do Backend

Acesse diretamente:
```
https://whatsapp-pro-backend-production.up.railway.app/api/status
```

#### ✅ Resposta Esperada:
```json
{
  "isReady": false,
  "qrCode": null,
  "stats": {
    "messagesReceived": 0,
    "messagesSent": 0,
    "contacts": 0,
    "chats": 0
  }
}
```

#### ❌ Erros:
- **Cannot GET /api/status**: Backend não está rodando
- **Timeout**: Backend está demorando muito
- **502 Bad Gateway**: Railway está com problemas

---

## 🔧 Soluções Rápidas

### Solução 1: Limpar Cache e Recarregar

1. Pressione **Ctrl + Shift + R** (Windows) ou **Cmd + Shift + R** (Mac)
2. Ou abra em aba anônima: **Ctrl + Shift + N**

### Solução 2: Reiniciar Backend no Railway

1. Railway > whatsapp-pro-backend
2. Settings > **Restart**
3. Aguarde 1-2 minutos
4. Recarregue o frontend

### Solução 3: Verificar Variáveis de Ambiente

#### Frontend (chatbot):
```
VITE_API_URL = https://whatsapp-pro-backend-production.up.railway.app
```

#### Backend (whatsapp-pro-backend):
```
FRONTEND_URL = https://chatbot-production.up.railway.app
NODE_ENV = production
```

### Solução 4: Forçar Redeploy

1. Faça uma pequena alteração no código
2. Commit e push:
   ```bash
   git add .
   git commit -m "trigger redeploy"
   git push origin main
   ```
3. Aguarde deploy (2-3 min)

---

## 🐛 Problemas Específicos

### Problema: "Aguardando QR Code..." infinito

**Causa**: Puppeteer não está inicializando

**Diagnóstico**:
1. Veja logs do backend
2. Procure por erros de inicialização
3. Verifique memória disponível

**Solução**:
```bash
# No Railway, adicione variável:
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage
```

### Problema: QR Code aparece mas não conecta

**Causa**: WhatsApp Web bloqueou ou sessão expirou

**Solução**:
1. Clique em "Gerar Novo QR Code"
2. Escaneie rapidamente (QR expira em 20 segundos)
3. Se persistir, limpe sessão:
   ```bash
   # No Railway, delete a pasta .wwebjs_auth
   # Ou reinicie o serviço
   ```

### Problema: Erro "Failed to launch browser"

**Causa**: Puppeteer não consegue iniciar Chrome

**Solução**:
```bash
# Adicione no Railway (Variables):
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

Ou:
```bash
# Instale Chrome no build:
# Adicione em package.json > scripts:
"postinstall": "npx puppeteer browsers install chrome"
```

---

## 📊 Checklist de Verificação

- [ ] Backend está online no Railway?
- [ ] Frontend está online no Railway?
- [ ] Variável `VITE_API_URL` está correta?
- [ ] Console do navegador mostra erros?
- [ ] Logs do backend mostram erros?
- [ ] `/api/status` responde?
- [ ] Tentou limpar cache?
- [ ] Tentou reiniciar backend?
- [ ] Aguardou 60 segundos?
- [ ] Tentou em outro navegador?

---

## 🔍 Debug Avançado

### 1. Testar Conexão Socket.IO

Abra console do navegador (F12) e digite:
```javascript
socket.connected
```

**Resultado esperado**: `true`

Se `false`:
```javascript
socket.connect()
```

### 2. Forçar Reconexão

No console:
```javascript
fetch('https://whatsapp-pro-backend-production.up.railway.app/api/reconnect', {
  method: 'POST'
})
```

### 3. Ver Estado Atual

No console:
```javascript
fetch('https://whatsapp-pro-backend-production.up.railway.app/api/status')
  .then(r => r.json())
  .then(console.log)
```

---

## 🚨 Problemas Críticos

### Railway Free Tier Limitações:

**Memória**: 512MB (pode não ser suficiente para Puppeteer)
**CPU**: Compartilhada
**Sleep**: Dorme após inatividade

**Sintomas**:
- QR Code demora muito
- Timeout frequente
- Erro de memória

**Solução**:
1. Upgrade para Hobby Plan ($5/mês)
2. Ou use alternativa mais leve (sem Puppeteer)

### Chrome Download Falha:

**Sintoma**: Logs mostram erro ao baixar Chrome

**Solução Temporária**:
```bash
# Use Chromium do sistema
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

**Solução Permanente**:
```bash
# Adicione em package.json:
"dependencies": {
  "puppeteer": "^21.0.0"
}

# E em scripts:
"postinstall": "npx puppeteer browsers install chrome"
```

---

## 📞 Ainda Não Funciona?

### Opção 1: Logs Detalhados

Me envie:
1. Screenshot do console (F12)
2. Screenshot dos logs do Railway
3. Resposta de `/api/status`

### Opção 2: Teste Local

Rode localmente para verificar:
```bash
cd server
npm install
node server.js
```

Se funcionar local mas não no Railway:
- Problema é com Railway/deploy
- Verifique configurações do Railway

### Opção 3: Alternativa

Se Puppeteer não funcionar no Railway:
- Considere usar Render (tem mais memória)
- Ou use API do WhatsApp Business (oficial)
- Ou use serviço de terceiros (Evolution API, etc)

---

## ✅ Solução Funcionou?

Se conseguiu resolver:
1. Anote o que funcionou
2. Compartilhe a solução
3. Atualize a documentação

---

**Última atualização**: 01/02/2026  
**Versão**: 1.0
