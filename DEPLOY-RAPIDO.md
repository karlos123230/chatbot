# 🚀 Deploy Rápido - 5 Minutos

## Passo 1: Criar Conta Render
1. Acesse: https://render.com
2. Login com GitHub
3. Autorize acesso aos repositórios

## Passo 2: Deploy Backend
1. **New +** → **Web Service**
2. Conecte: `karlos123230/chatbot`
3. Configure:
   - **Name:** `whatsapp-pro-backend`
   - **Root Directory:** `server`
   - **Build:** `npm install`
   - **Start:** `node server.js`
   - **Plan:** Free
4. **Advanced** → **Add Disk:**
   - **Name:** `whatsapp-data`
   - **Mount Path:** `/opt/render/project/src/server`
   - **Size:** 1 GB
5. **Environment Variables:**
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
6. **Create Web Service**
7. ⏳ Aguarde 5-10 min
8. 📝 Copie a URL: `https://whatsapp-pro-backend-XXXX.onrender.com`

## Passo 3: Deploy Frontend
1. **New +** → **Static Site**
2. Conecte: `karlos123230/chatbot`
3. Configure:
   - **Name:** `whatsapp-pro-frontend`
   - **Root Directory:** `client`
   - **Build:** `npm install && npm run build`
   - **Publish:** `dist`
   - **Plan:** Free
4. **Environment Variables:**
   - `VITE_API_URL` = `https://whatsapp-pro-backend-XXXX.onrender.com` (URL do passo 2)
5. **Create Static Site**
6. ⏳ Aguarde 3-5 min
7. 📝 Copie a URL: `https://whatsapp-pro-frontend-XXXX.onrender.com`

## Passo 4: Testar
1. Acesse a URL do frontend
2. Escaneie o QR Code no WhatsApp
3. Pronto! ✅

## ⚠️ Importante
- **Plano Gratuito:** Servidor dorme após 15 min sem uso
- **Cold Start:** Primeira requisição demora ~30s
- **Upgrade:** $7/mês para servidor sempre ativo

## 🎉 URLs Finais
- **Frontend:** `https://whatsapp-pro-frontend-XXXX.onrender.com`
- **Backend:** `https://whatsapp-pro-backend-XXXX.onrender.com`
- **Health:** `https://whatsapp-pro-backend-XXXX.onrender.com/health`

---

**Dúvidas?** Veja o guia completo em `DEPLOY-RENDER.md`
