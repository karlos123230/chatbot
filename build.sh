#!/bin/bash

echo "🚀 Iniciando build do WhatsApp Pro..."

# Instalar dependências do servidor
echo "📦 Instalando dependências do servidor..."
cd server
npm install --production
cd ..

# Instalar dependências do cliente
echo "📦 Instalando dependências do cliente..."
cd client
npm install
npm run build

# Copiar _redirects para dist
echo "📄 Copiando _redirects..."
cp _redirects dist/_redirects

cd ..

echo "✅ Build concluído com sucesso!"
echo "📁 Arquivos em: client/dist"
