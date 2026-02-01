# 📦 Instalação do WhatsApp Pro via GitHub

## ✅ Projeto Publicado com Sucesso!

**Repositório:** https://github.com/karlos123230/chatbot

---

## 🚀 Como Instalar em Outra Máquina

### Pré-requisitos
- Node.js >= 18.0.0
- Git instalado
- npm ou yarn

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/karlos123230/chatbot.git
cd chatbot
```

### Passo 2: Instalar Dependências do Servidor

```bash
cd server
npm install
```

### Passo 3: Instalar Dependências do Cliente

```bash
cd ../client
npm install
```

### Passo 4: Iniciar o Servidor

```bash
cd ../server
npm run dev
```

O servidor iniciará na porta 3001.

### Passo 5: Iniciar o Cliente (em outro terminal)

```bash
cd client
npm run dev
```

O cliente iniciará na porta 3000.

### Passo 6: Acessar o Painel

Abra o navegador em: **http://localhost:3000**

---

## 📋 Estrutura do Projeto

```
chatbot/
├── server/              # Backend Node.js
│   ├── server.js        # Servidor principal
│   ├── database.js      # Banco de dados SQLite
│   ├── package.json     # Dependências do servidor
│   └── whatsapp.db      # Banco de dados (criado automaticamente)
│
├── client/              # Frontend React
│   ├── src/
│   │   ├── App.jsx      # Componente principal
│   │   ├── App.css      # Estilos
│   │   └── main.jsx     # Entry point
│   ├── package.json     # Dependências do cliente
│   └── vite.config.js   # Configuração Vite
│
├── .gitignore           # Arquivos ignorados pelo Git
├── README.md            # Documentação principal
└── package.json         # Dependências raiz
```

---

## 🔧 Configuração

### Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` na pasta `server`:

```env
PORT=3001
NODE_ENV=development
```

### Banco de Dados

O banco de dados SQLite é criado automaticamente em:
```
server/whatsapp.db
```

**Importante:** Este arquivo NÃO está no Git (está no .gitignore) por segurança.

---

## 📦 Dependências Principais

### Backend
- express: ^4.18.2
- whatsapp-web.js: ^1.23.0
- socket.io: ^4.6.1
- sql.js: ^1.10.3
- node-cron: ^3.0.3
- qrcode: ^1.5.3
- cors: ^2.8.5

### Frontend
- react: ^18.2.0
- socket.io-client: ^4.6.1
- lucide-react: ^0.263.1
- vite: ^4.4.5

---

## 🎯 Funcionalidades Incluídas

✅ Dashboard com estatísticas
✅ Gestão de conversas e contatos
✅ Envio de mensagens
✅ Localizador de números
✅ **Agendamento de mensagens**
✅ **Grupos e listas de transmissão**
✅ **Auto-resposta e chatbot**

---

## 🐛 Solução de Problemas

### Erro ao instalar dependências

```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Porta já em uso

```bash
# Mudar porta no servidor
# Edite server/server.js
const PORT = 3002; // Mude para outra porta
```

### QR Code não aparece

```bash
# Reinicie o servidor
cd server
npm run dev
```

---

## 📚 Documentação Completa

Após clonar, consulte os arquivos de documentação:

- `README.md` - Documentação principal
- `AGENDAMENTO-PRONTO.md` - Sistema de agendamento
- `GRUPOS-IMPLEMENTADO.md` - Grupos e listas
- `AUTO-RESPOSTA-IMPLEMENTADO.md` - Auto-resposta
- `TROUBLESHOOTING.md` - Solução de problemas

---

## 🔄 Atualizações

Para atualizar o projeto com as últimas mudanças:

```bash
git pull origin main
cd server && npm install
cd ../client && npm install
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

## 📞 Suporte

- **Issues:** https://github.com/karlos123230/chatbot/issues
- **Documentação:** Veja os arquivos .md no repositório

---

## ⭐ Gostou do Projeto?

Dê uma estrela no GitHub! ⭐

https://github.com/karlos123230/chatbot

---

**Desenvolvido com ❤️ por Kiro AI**
