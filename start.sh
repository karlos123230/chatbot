#!/bin/bash

echo "🚀 Iniciando WhatsApp Pro..."

# Criar diretórios necessários
mkdir -p server/.wwebjs_auth
mkdir -p server/.wwebjs_cache

# Iniciar servidor
cd server
node server.js
