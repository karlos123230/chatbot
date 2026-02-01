# 🚀 Guia Completo de Deploy no Render

## 📋 Pré-requisitos

- ✅ Conta no GitHub (já tem)
- ✅ Projeto no GitHub (já está)
- ✅ Conta no Render (criar grátis)

---

## 🎯 Passo 1: Criar Conta no Render

1. Acesse: https://render.com
2. Clique em **"Get Started"**
3. Faça login com GitHub
4. Autorize o Render a acessar seus repositórios

---

## 🚀 Passo 2: Deploy do Backend (Servidor)

### 2.1 - Criar Web Service

1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório: `karlos123230/chatbot`
4. Clique em **"Connect"**

### 2.2 - Configurar o Serviço

Preencha os campos:

**Name:** `whatsapp-pro-backend`

**Region:** `Oregon (US West)` (mais próximo do Brasil)

**Branch:** `main`

**Root Directory:** `server`

**Runtime:** `Node`

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
node server.js
```

**Instance Type:** `Free`

### 2.3 - Variáveis de Ambiente

Clique em **"Advanced"** e adicione:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |

### 2.4 - Disco Persistente (IMPORTANTE!)

⚠️ **Essencial para manter a sessão do WhatsApp!**

1. Role até **"Disk"**
2. Clique em **"Add Disk"**
3. Configure:
   - **Name:** `whatsapp-data`
   - **Mount Path:** `/opt/render/project/src/server`
   - **Size:** `1 GB` (suficiente)

### 2.5 - Finalizar

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (5-10 minutos)
3. Anote a URL gerada (ex: `https://whatsapp-pro-backend.onrender.com`)

---

## 🎨 Passo 3: Deploy do Frontend (Cliente)

### 3.1 - Criar Static Site

1. No dashboard, clique em **"New +"**
2. Selecione **"Static Site"**
3. Conecte o mesmo repositório: `karlos123230/chatbot`

### 3.2 - Configurar o Site

**Name:** `whatsapp-pro-frontend`

**Branch:** `main`

**Root Directory:** `client`

**Build Command:**
```bash
npm install && npm run build
```

**Publish Directory:**
```bash
dist
```

### 3.3 - Variáveis de Ambiente

Adicione em **"Environment"**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://whatsapp-pro-backend.onrender.com` |

⚠️ **Substitua pela URL real do seu backend!**

### 3.4 - Finalizar

1. Clique em **"Create Static Site"**
2. Aguarde o deploy (3-5 minutos)
3. Anote a URL gerada (ex: `https://whatsapp-pro-frontend.onrender.com`)

---

## 🔧 Passo 4: Configurar CORS no Backend

O backend precisa aceitar requisições do frontend.

### 4.1 - Atualizar server.js

No arquivo `server/server.js`, localize:

```javascript
app.use(cors());
```

E substitua por:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://whatsapp-pro-frontend.onrender.com', // Sua URL do frontend
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### 4.2 - Adicionar variável de ambiente

No backend do Render, adicione:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://whatsapp-pro-frontend.onrender.com` |

---

## 🔄 Passo 5: Atualizar Frontend para usar API

### 5.1 - Criar arquivo de configuração

Crie `client/src/config.js`:

```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const SOCKET_URL = API_URL;
```

### 5.2 - Atualizar App.jsx

No `client/src/App.jsx`, no início do arquivo:

```javascript
import { API_URL, SOCKET_URL } from './config';
```

E substitua todas as URLs hardcoded:

```javascript
// ANTES
const response = await fetch('http://localhost:3001/api/status');

// DEPOIS
const response = await fetch(`${API_URL}/api/status`);
```

Para Socket.IO:

```javascript
// ANTES
const socket = io('http://localhost:3001');

// DEPOIS
const socket = io(SOCKET_URL);
```

---

## ✅ Passo 6: Testar o Deploy

### 6.1 - Verificar Backend

1. Acesse: `https://whatsapp-pro-backend.onrender.com/health`
2. Deve retornar:
```json
{
  "status": "ok",
  "whatsapp": "disconnected",
  "uptime": 123.45,
  "timestamp": "2026-02-01T..."
}
```

### 6.2 - Verificar Frontend

1. Acesse: `https://whatsapp-pro-frontend.onrender.com`
2. Deve carregar o painel
3. Deve mostrar o QR Code do WhatsApp

### 6.3 - Conectar WhatsApp

1. Abra o WhatsApp no celular
2. Vá em **Dispositivos Conectados**
3. Escaneie o QR Code
4. Aguarde conectar

---

## 🎉 Passo 7: Configurações Finais

### 7.1 - Domínio Customizado (Opcional)

No Render, você pode adicionar seu próprio domínio:

1. Vá em **Settings** do serviço
2. Clique em **"Custom Domain"**
3. Adicione seu domínio (ex: `whatsapp.seusite.com`)
4. Configure o DNS conforme instruções

### 7.2 - Monitoramento

O Render oferece:
- ✅ Logs em tempo real
- ✅ Métricas de uso
- ✅ Alertas de erro
- ✅ Health checks automáticos

### 7.3 - Auto-Deploy

Configurado automaticamente! Quando você fizer push no GitHub:
1. Render detecta a mudança
2. Faz rebuild automático
3. Deploy da nova versão

---

## 🔒 Segurança

### Variáveis Sensíveis

Se adicionar API keys ou senhas, use variáveis de ambiente:

```javascript
// No código
const API_KEY = process.env.API_KEY;

// No Render
// Settings > Environment > Add Environment Variable
```

### HTTPS

✅ Render fornece HTTPS automático e gratuito!

---

## 💰 Custos

### Plano Gratuito

**Backend (Web Service):**
- ✅ 750 horas/mês grátis
- ✅ 512 MB RAM
- ✅ 0.1 CPU
- ⚠️ Dorme após 15 min de inatividade
- ⚠️ Cold start de ~30s

**Frontend (Static Site):**
- ✅ 100% grátis
- ✅ 100 GB bandwidth/mês
- ✅ CDN global
- ✅ Sempre ativo

### Plano Pago (Recomendado para Produção)

**Starter ($7/mês):**
- ✅ Sempre ativo (sem cold start)
- ✅ 512 MB RAM
- ✅ 0.5 CPU
- ✅ Melhor performance

**Standard ($25/mês):**
- ✅ 2 GB RAM
- ✅ 1 CPU
- ✅ Performance profissional

---

## 🐛 Troubleshooting

### Backend não inicia

**Erro:** `Application failed to respond`

**Solução:**
1. Verifique os logs no Render
2. Confirme que `PORT` está usando `process.env.PORT`
3. Verifique se todas as dependências estão no `package.json`

### WhatsApp desconecta

**Erro:** Sessão perdida após restart

**Solução:**
1. Confirme que o disco persistente está configurado
2. Verifique o mount path: `/opt/render/project/src/server`
3. A pasta `.wwebjs_auth` deve estar no disco

### Frontend não conecta ao backend

**Erro:** `CORS error` ou `Network error`

**Solução:**
1. Verifique a variável `VITE_API_URL`
2. Confirme CORS no backend
3. Teste a URL do backend diretamente

### Cold Start (Plano Gratuito)

**Problema:** Servidor demora 30s para responder

**Solução:**
1. Upgrade para plano pago ($7/mês)
2. Ou use um serviço de ping (ex: UptimeRobot)
3. Ou aceite o delay inicial

---

## 📊 Monitoramento

### Logs em Tempo Real

```bash
# No Render Dashboard
Services > whatsapp-pro-backend > Logs
```

### Métricas

- CPU usage
- Memory usage
- Request count
- Response time

### Alertas

Configure em **Settings > Notifications**:
- Email quando serviço cai
- Slack/Discord webhooks
- PagerDuty integration

---

## 🔄 Atualizações

### Deploy Manual

1. Vá no serviço no Render
2. Clique em **"Manual Deploy"**
3. Selecione **"Clear build cache & deploy"**

### Deploy Automático

Já configurado! Apenas faça:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

Render detecta e faz deploy automático! 🚀

---

## 📞 Suporte

### Render Support

- Documentação: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### Projeto

- GitHub: https://github.com/karlos123230/chatbot
- Issues: https://github.com/karlos123230/chatbot/issues

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Backend rodando e respondendo em `/health`
- [ ] Frontend carregando corretamente
- [ ] QR Code aparecendo
- [ ] WhatsApp conectando
- [ ] Mensagens sendo enviadas
- [ ] Sessão persistindo após restart
- [ ] CORS configurado
- [ ] Variáveis de ambiente definidas
- [ ] Disco persistente configurado
- [ ] Auto-deploy funcionando

---

## 🎉 Pronto!

Seu WhatsApp Pro está no ar! 🚀

**URLs de Exemplo:**
- Frontend: `https://whatsapp-pro-frontend.onrender.com`
- Backend: `https://whatsapp-pro-backend.onrender.com`
- API: `https://whatsapp-pro-backend.onrender.com/api/status`

**Próximos Passos:**
1. Compartilhe com sua equipe
2. Configure domínio customizado
3. Monitore os logs
4. Considere upgrade para plano pago

---

**Dúvidas?** Consulte a documentação ou abra uma issue no GitHub!
