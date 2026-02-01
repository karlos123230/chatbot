# Use Node.js 18 Alpine (leve e rápido)
FROM node:18-alpine

# Instalar dependências do Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Definir variável de ambiente para Puppeteer usar Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

# Criar diretório da aplicação
WORKDIR /app

# Copiar package.json do servidor
COPY server/package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código do servidor
COPY server/ ./

# Expor porta
EXPOSE 3001

# Comando para iniciar (sem cd)
CMD ["node", "server.js"]
