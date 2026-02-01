# 🤖 WhatsApp Pro - Painel de Gestão Completo

Sistema completo de gerenciamento de WhatsApp com funcionalidades avançadas de automação, agendamento e respostas automáticas.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Deploy](#-deploy)
- [Instalação Local](#-instalação-local)
- [Como Usar](#-como-usar)
- [Documentação](#-documentação)
- [Screenshots](#-screenshots)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## ✨ Funcionalidades

### 📊 Dashboard
- Estatísticas em tempo real
- Monitoramento de mensagens
- Contagem de contatos e conversas

### 💬 Gestão de Conversas
- Visualização de conversas
- Histórico de mensagens
- Resposta rápida
- Busca avançada

### 👥 Gestão de Contatos
- Lista completa de contatos
- Filtros (salvos/não salvos)
- Detalhes do contato
- Envio rápido de mensagens

### 📤 Envio de Mensagens
- Envio individual
- Templates personalizáveis
- Preview de mensagens
- Histórico de envios

### 📱 Localizador de Números
- Busca por DDD/região
- Validação automática de WhatsApp
- Exportação de números (TXT/CSV)
- Envio em massa
- Integração com grupos

### 📅 Agendamento de Mensagens
- Agendar mensagens para data/hora específica
- Recorrência (diária, semanal, mensal)
- Edição e exclusão de agendamentos
- Envio automático via Cron Job
- Histórico completo

### 👥 Grupos e Listas de Transmissão
- Criar e gerenciar grupos
- Listas de transmissão
- Adicionar/remover membros
- Importação em massa (TXT/CSV/JSON)
- Exportação de membros
- Envio para grupo com delay configurável
- Estatísticas detalhadas

### 🤖 Respostas Automáticas e Chatbot
- Respostas automáticas 24/7
- Regras com palavras-chave
- 3 tipos de correspondência (contém, exato, começa com)
- Sistema de prioridades
- Configuração de horário comercial
- Blacklist de números
- Histórico de respostas
- Estatísticas em tempo real

## 🛠 Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **whatsapp-web.js** - Integração com WhatsApp
- **Socket.IO** - Comunicação em tempo real
- **SQLite (sql.js)** - Banco de dados
- **node-cron** - Agendamento de tarefas

### Frontend
- **React** - Biblioteca UI
- **Lucide Icons** - Ícones
- **CSS3** - Estilização (Glassmorphism)
- **Socket.IO Client** - WebSocket

## 🚀 Deploy

### Railway (Recomendado)

O sistema está deployado no Railway:

- **Backend**: https://whatsapp-pro-backend-production.up.railway.app
- **Frontend**: https://whatsapp-pro-frontend-production.up.railway.app

#### Fazer seu próprio deploy:

1. **Deploy Rápido** - Veja: [DEPLOY-RAILWAY-RAPIDO.md](DEPLOY-RAILWAY-RAPIDO.md)
2. **Guia Completo** - Veja: [DEPLOY-RAILWAY-COMPLETO.md](DEPLOY-RAILWAY-COMPLETO.md)

#### Configuração Railway:

**Backend:**
```yaml
Root Directory: server
Build Command: npm install
Start Command: node server.js
Variables:
  - FRONTEND_URL=https://seu-frontend.up.railway.app
```

**Frontend:**
```yaml
Root Directory: client
Build Command: npm install && npm run build
Start Command: npx serve -s dist -l $PORT
Variables:
  - VITE_API_URL=https://seu-backend.up.railway.app
```

## 📦 Instalação Local

### Pré-requisitos
- Node.js >= 18.0.0
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/karlos123230/chatbot.git
cd chatbot
```

2. **Instale as dependências do servidor**
```bash
cd server
npm install
```

3. **Instale as dependências do cliente**
```bash
cd ../client
npm install
```

4. **Inicie o servidor**
```bash
cd ../server
npm run dev
```

5. **Inicie o cliente** (em outro terminal)
```bash
cd client
npm run dev
```

6. **Acesse o painel**
```
http://localhost:3000
```

## 🚀 Como Usar

### 1. Conectar WhatsApp

1. Acesse http://localhost:3000
2. Escaneie o QR Code com seu WhatsApp
3. Aguarde a conexão ser estabelecida

### 2. Configurar Auto-Resposta

1. Clique na aba "🤖 Auto-Resposta"
2. Ative o sistema
3. Configure horário comercial (opcional)
4. Crie regras de resposta
5. Salve as configurações

### 3. Criar Grupos

1. Clique na aba "👥 Grupos"
2. Clique em "➕ Novo"
3. Preencha nome e descrição
4. Adicione membros
5. Envie mensagens para o grupo

### 4. Agendar Mensagens

1. Clique na aba "📅 Agendamento"
2. Clique em "➕ Nova Mensagem Agendada"
3. Preencha os dados
4. Escolha recorrência
5. Agende!

### 5. Localizar Números

1. Clique na aba "📱 Localizar"
2. Selecione DDD/região
3. Defina quantidade
4. Inicie a busca
5. Exporte ou adicione a grupos

## 📚 Documentação

### Deploy
- [Deploy Railway - Guia Rápido](DEPLOY-RAILWAY-RAPIDO.md)
- [Deploy Railway - Guia Completo](DEPLOY-RAILWAY-COMPLETO.md)
- [Deploy Frontend Railway](DEPLOY-FRONTEND-RAILWAY.md)

### Funcionalidades
- [Agendamento de Mensagens](AGENDAMENTO-PRONTO.md)
- [Grupos e Listas](GRUPOS-IMPLEMENTADO.md)
- [Auto-Resposta e Chatbot](AUTO-RESPOSTA-IMPLEMENTADO.md)

### Suporte
- [Sugestões de Melhorias](SUGESTOES-MELHORIAS.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [Como Reiniciar](COMO-REINICIAR.txt)

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Auto-Resposta
![Auto-Resposta](docs/screenshots/autoreply.png)

### Grupos
![Grupos](docs/screenshots/groups.png)

## 🔧 Configuração Avançada

### Variáveis de Ambiente

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

Para backup:
```bash
cp server/whatsapp.db server/whatsapp.backup.db
```

## 🐛 Solução de Problemas

### QR Code não aparece
```bash
# Reinicie o servidor
cd server
npm run dev
```

### Erro 404 nas rotas
```bash
# Reinicie completamente
taskkill /F /IM node.exe
cd server
npm run dev
```

### Auto-resposta não funciona
1. Verifique se está ativado
2. Verifique se há regras ativas
3. Veja logs do servidor

## 📝 Scripts Disponíveis

### Servidor
```bash
npm run dev          # Inicia servidor em modo desenvolvimento
```

### Cliente
```bash
npm run dev          # Inicia cliente em modo desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
```

### Utilitários
```bash
REINICIAR-AGORA.bat  # Reinicia servidor (Windows)
restart.ps1          # Reinicia servidor (PowerShell)
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Desenvolvido com ❤️ por Kiro AI**

## 🙏 Agradecimentos

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/)

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou consulte a documentação.

---

⭐ Se este projeto te ajudou, considere dar uma estrela!
