#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Iniciando build do WhatsApp Pro..."

# Instalar dependências do Node
cd server
echo "📦 Instalando dependências do Node..."
npm install

echo "✅ Build concluído com sucesso!"
