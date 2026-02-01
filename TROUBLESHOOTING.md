# 🔧 Troubleshooting - QR Code

## Problema: QR Code não aparece

### Solução 1: Verificar logs do servidor
Abra o terminal onde o servidor está rodando e verifique se há mensagens de erro.

### Solução 2: Limpar cache e reconectar
```bash
# Parar o servidor (Ctrl+C)
# Deletar a pasta de autenticação
rmdir /s /q .wwebjs_auth
rmdir /s /q .wwebjs_cache

# Reiniciar
npm run dev
```

### Solução 3: Instalar dependências do Chromium (Windows)
O whatsapp-web.js usa Puppeteer que precisa do Chromium. Certifique-se de que todas as dependências estão instaladas:

```bash
cd server
npm install
```

### Solução 4: Verificar porta 3001
Certifique-se de que a porta 3001 está livre:
```bash
netstat -ano | findstr :3001
```

## Como escanear o QR Code corretamente

1. **Abra o WhatsApp** no seu celular
2. **Android**: Toque nos três pontos (⋮) > Aparelhos conectados
3. **iPhone**: Vá em Configurações > Aparelhos conectados
4. Toque em **"Conectar um aparelho"**
5. **Aponte a câmera** do celular para o QR Code na tela
6. Aguarde a conexão (pode levar alguns segundos)

## Logs úteis

O servidor agora mostra logs detalhados:
- "QR Code recebido!" - QR foi gerado
- "Cliente autenticado!" - Escaneamento bem-sucedido
- "Cliente WhatsApp pronto!" - Conexão estabelecida

## Botão "Tentar Novamente"

Se o QR Code expirar (após ~60 segundos), clique no botão "Gerar Novo QR Code" para obter um novo código.
