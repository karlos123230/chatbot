# 🔄 Como Reiniciar o Servidor

## ⚠️ IMPORTANTE: Erro 404 na rota /api/find-numbers

Se você está recebendo erro 404, significa que o servidor não foi reiniciado após adicionar a nova rota.

## 🚀 Passos para Reiniciar:

### 1. Parar o Servidor Atual
No terminal onde o servidor está rodando, pressione:
```
Ctrl + C
```

### 2. Reiniciar o Servidor
Execute novamente:
```bash
npm run dev
```

OU se estiver rodando separadamente:
```bash
cd server
npm run dev
```

### 3. Verificar se a Rota Foi Registrada
Quando o servidor iniciar, você deve ver no console:
```
Servidor rodando na porta 3001
Rotas disponíveis:
  GET  /api/status
  GET  /api/chats
  GET  /api/contacts
  GET  /api/chat/:chatId/messages
  POST /api/send
  POST /api/disconnect
  POST /api/reconnect
  POST /api/find-numbers ✨  <-- ESTA ROTA DEVE APARECER!
```

### 4. Testar a Rota
Você pode testar se a rota está funcionando executando:
```bash
node test-route.js
```

## 🔍 Troubleshooting

### Problema: Rota ainda não aparece
- Certifique-se de que salvou o arquivo `server/server.js`
- Verifique se não há erros de sintaxe no console
- Tente deletar a pasta `node_modules` e reinstalar: `npm install`

### Problema: Porta 3001 já está em uso
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Ou mude a porta no server.js
const PORT = 3002;
```

### Problema: WhatsApp não conectado
- Escaneie o QR Code novamente
- Verifique se o WhatsApp Web está funcionando no navegador
- Tente reconectar usando o botão no painel

## ✅ Checklist

- [ ] Parei o servidor (Ctrl+C)
- [ ] Salvei todas as alterações
- [ ] Reiniciei o servidor (npm run dev)
- [ ] Vi a mensagem "POST /api/find-numbers ✨" no console
- [ ] WhatsApp está conectado (QR Code escaneado)
- [ ] Testei a funcionalidade no painel

## 📝 Nota

A rota `/api/find-numbers` só funciona quando:
1. O servidor está rodando
2. O WhatsApp está conectado (QR Code escaneado)
3. A rota foi registrada corretamente (aparece no log)
