import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import { scheduledMessages, groups, groupMembers, groupMessages, autoReplyRules, autoReplySettings, autoReplyLogs, blacklist } from './database.js';
import cron from 'node-cron';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

let client;
let isReady = false;
let qrCode = null;
const stats = {
  messagesReceived: 0,
  messagesSent: 0,
  contacts: 0,
  chats: 0
};

// Inicializar cliente WhatsApp
function initWhatsApp() {
  console.log('🚀 Iniciando WhatsApp Client...');
  
  // Configuração do Puppeteer para Railway/Render
  const puppeteerConfig = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--single-process'
    ],
    timeout: 60000 // 60 segundos de timeout
  };

  // Usar Chromium do sistema se disponível
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    console.log('📦 Usando Chromium do sistema:', process.env.PUPPETEER_EXECUTABLE_PATH);
    puppeteerConfig.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  } else {
    console.log('📦 Puppeteer vai baixar Chrome automaticamente...');
  }

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: puppeteerConfig
  });

  client.on('qr', async (qr) => {
    console.log('✅ QR Code recebido!');
    qrCode = await qrcode.toDataURL(qr);
    console.log('✅ QR Code convertido para base64');
    io.emit('qr', qrCode);
  });

  client.on('authenticated', () => {
    console.log('✅ Cliente autenticado!');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
    io.emit('auth_failure', msg);
  });

  client.on('ready', async () => {
    console.log('✅ Cliente WhatsApp pronto!');
    isReady = true;
    qrCode = null;
    io.emit('ready');
    await updateStats();
  });

  client.on('message', async (msg) => {
    stats.messagesReceived++;
    io.emit('message', {
      from: msg.from,
      body: msg.body,
      timestamp: msg.timestamp
    });

    // Processar auto-resposta
    await processAutoReply(msg);
  });

  client.on('disconnected', (reason) => {
    console.log('⚠️ Cliente desconectado:', reason);
    isReady = false;
    qrCode = null;
    io.emit('disconnected');
  });

  client.on('loading_screen', (percent, message) => {
    console.log('⏳ Carregando...', percent, '%', message);
    io.emit('loading', { percent, message });
  });

  console.log('⏳ Inicializando cliente WhatsApp...');
  console.log('⚠️ Isso pode levar 30-60 segundos na primeira vez...');
  
  client.initialize().catch(err => {
    console.error('❌ Erro ao inicializar:', err);
    io.emit('init_error', err.message);
  });
}

async function updateStats() {
  if (!isReady) return;
  const contacts = await client.getContacts();
  const chats = await client.getChats();
  stats.contacts = contacts.length;
  stats.chats = chats.length;
}

// Função para processar auto-resposta
async function processAutoReply(msg) {
  try {
    // Ignorar mensagens próprias
    if (msg.fromMe) return;

    // Verificar se está na blacklist
    if (blacklist.isBlocked(msg.from)) {
      console.log(`📛 Mensagem bloqueada de: ${msg.from}`);
      return;
    }

    // Obter configurações
    const settings = autoReplySettings.get();
    
    if (!settings || !settings.enabled) {
      return;
    }

    // Verificar horário se configurado
    if (settings.only_outside_hours) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const [startH, startM] = settings.start_hour.split(':').map(Number);
      const [endH, endM] = settings.end_hour.split(':').map(Number);
      const startTime = startH * 60 + startM;
      const endTime = endH * 60 + endM;

      const isWeekend = now.getDay() === 0 || now.getDay() === 6;

      // Se está dentro do horário comercial, não responder
      if (currentTime >= startTime && currentTime <= endTime && (!isWeekend || !settings.weekend_enabled)) {
        return;
      }
    }

    // Buscar regras ativas
    const rules = autoReplyRules.getActive();
    
    if (rules.length === 0) {
      // Enviar mensagem de boas-vindas padrão se não houver regras
      if (settings.welcome_message) {
        await client.sendMessage(msg.from, settings.welcome_message);
        
        autoReplyLogs.create({
          from_number: msg.from,
          from_name: msg._data.notifyName || '',
          message_received: msg.body,
          rule_id: null,
          response_sent: settings.welcome_message
        });
      }
      return;
    }

    // Processar regras por prioridade
    const messageText = msg.body.toLowerCase();
    
    for (const rule of rules) {
      const keywords = rule.keywords.toLowerCase().split(',').map(k => k.trim());
      let matched = false;

      if (rule.match_type === 'exact') {
        // Correspondência exata
        matched = keywords.some(keyword => messageText === keyword);
      } else if (rule.match_type === 'starts') {
        // Começa com
        matched = keywords.some(keyword => messageText.startsWith(keyword));
      } else {
        // Contém (padrão)
        matched = keywords.some(keyword => messageText.includes(keyword));
      }

      if (matched) {
        // Enviar resposta
        await client.sendMessage(msg.from, rule.response);
        
        // Registrar log
        autoReplyLogs.create({
          from_number: msg.from,
          from_name: msg._data.notifyName || '',
          message_received: msg.body,
          rule_id: rule.id,
          response_sent: rule.response
        });

        console.log(`🤖 Auto-resposta enviada para ${msg.from} usando regra: ${rule.name}`);
        
        // Notificar frontend
        io.emit('auto-reply-sent', {
          from: msg.from,
          rule: rule.name,
          response: rule.response
        });

        // Parar após primeira correspondência
        break;
      }
    }
  } catch (error) {
    console.error('Erro ao processar auto-resposta:', error);
  }
}

// Rota raiz - Página de boas-vindas
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WhatsApp Pro - API</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          padding: 20px;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          max-width: 600px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 { font-size: 2.5rem; margin-bottom: 1rem; text-align: center; }
        .status { 
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.4);
          padding: 15px;
          border-radius: 10px;
          margin: 20px 0;
          text-align: center;
          font-weight: 600;
        }
        .links {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 30px;
        }
        .link {
          background: rgba(255, 255, 255, 0.15);
          padding: 15px 20px;
          border-radius: 10px;
          text-decoration: none;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .link:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateX(5px);
        }
        .info {
          margin-top: 30px;
          padding: 20px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 10px;
          font-size: 0.9rem;
          line-height: 1.6;
        }
        .info strong { color: #60a5fa; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📱 WhatsApp Pro API</h1>
        <div class="status">✅ Servidor Online</div>
        
        <div class="links">
          <a href="/health" class="link">
            <span>🏥 Health Check</span>
            <span>→</span>
          </a>
          <a href="/api/status" class="link">
            <span>📊 Status WhatsApp</span>
            <span>→</span>
          </a>
        </div>

        <div class="info">
          <strong>🎯 Frontend:</strong><br>
          ${process.env.FRONTEND_URL ? `
            Acesse o painel em:<br>
            <a href="${process.env.FRONTEND_URL}" style="color: #60a5fa;">
              ${process.env.FRONTEND_URL.replace('https://', '')}
            </a>
          ` : `
            Deploy o frontend no Railway e configure a variável FRONTEND_URL
          `}
          <br><br>
          <strong>📚 Documentação:</strong><br>
          Veja o README.md no GitHub para mais informações.
        </div>
      </div>
    </body>
    </html>
  `);
});

// Rotas API
app.get('/api/status', (req, res) => {
  res.json({ isReady, qrCode, stats });
});

app.get('/api/chats', async (req, res) => {
  if (!isReady) return res.status(400).json({ error: 'WhatsApp não conectado' });
  const chats = await client.getChats();
  const chatList = chats.slice(0, 50).map(chat => ({
    id: chat.id._serialized,
    name: chat.name,
    isGroup: chat.isGroup,
    unreadCount: chat.unreadCount,
    lastMessage: chat.lastMessage?.body || ''
  }));
  res.json(chatList);
});

app.get('/api/contacts', async (req, res) => {
  if (!isReady) return res.status(400).json({ error: 'WhatsApp não conectado' });
  const contacts = await client.getContacts();
  const contactList = contacts.slice(0, 100).map(contact => ({
    id: contact.id._serialized,
    name: contact.name || contact.pushname,
    number: contact.number,
    isMyContact: contact.isMyContact
  }));
  res.json(contactList);
});

app.get('/api/chat/:chatId/messages', async (req, res) => {
  if (!isReady) return res.status(400).json({ error: 'WhatsApp não conectado' });
  try {
    const chatId = decodeURIComponent(req.params.chatId);
    const chat = await client.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit: 50 });
    
    const messageList = messages.map(msg => ({
      id: msg.id._serialized,
      body: msg.body,
      timestamp: msg.timestamp,
      fromMe: msg.fromMe,
      author: msg.author || msg.from
    }));
    
    res.json(messageList.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/send', async (req, res) => {
  if (!isReady) return res.status(400).json({ error: 'WhatsApp não conectado' });
  const { to, message } = req.body;
  try {
    await client.sendMessage(to, message);
    stats.messagesSent++;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/disconnect', async (req, res) => {
  if (client) {
    await client.destroy();
    isReady = false;
  }
  res.json({ success: true });
});

app.post('/api/reconnect', async (req, res) => {
  if (client) {
    await client.destroy();
  }
  isReady = false;
  qrCode = null;
  initWhatsApp();
  res.json({ success: true });
});

// Rota para localizar e validar números de WhatsApp
app.post('/api/find-numbers', async (req, res) => {
  console.log('🔍 Requisição recebida em /api/find-numbers');
  
  if (!isReady) {
    console.log('❌ WhatsApp não conectado');
    return res.status(400).json({ error: 'WhatsApp não conectado' });
  }
  
  const { ddd, quantity } = req.body;
  console.log(`📋 Parâmetros: DDD=${ddd}, Quantidade=${quantity}`);
  
  if (!ddd || !quantity) {
    console.log('❌ Parâmetros inválidos');
    return res.status(400).json({ error: 'DDD e quantidade são obrigatórios' });
  }

  // Configurar SSE (Server-Sent Events)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Desabilitar buffering do nginx

  console.log('✅ Headers SSE configurados');

  const sendEvent = (data) => {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    res.write(message);
  };

  try {
    console.log('🚀 Iniciando busca de números...');
    
    const foundNumbers = [];
    const checkedNumbers = new Set();
    let attempts = 0;
    const maxAttempts = quantity * 20;
    const batchSize = 5;

    // Função para verificar um número
    const checkNumber = async (numberId) => {
      try {
        const numberExists = await client.isRegisteredUser(numberId);
        
        if (numberExists) {
          let contactName = null;
          try {
            const contact = await client.getContactById(numberId);
            contactName = contact.name || contact.pushname || null;
          } catch (e) {
            // Ignorar erro ao buscar nome
          }

          return {
            number: numberId,
            name: contactName
          };
        }
      } catch (error) {
        // Ignorar erros silenciosamente
      }
      
      return null;
    };

    // Tentar obter números dos contatos existentes primeiro
    let baseNumbers = [];
    try {
      console.log('📱 Buscando contatos base...');
      const contacts = await client.getContacts();
      baseNumbers = contacts
        .filter(c => c.id._serialized.startsWith(`55${ddd}`) && c.id._serialized.includes('@c.us'))
        .map(c => c.id._serialized);
      
      console.log(`✅ Encontrados ${baseNumbers.length} contatos base do DDD ${ddd}`);
    } catch (e) {
      console.log('⚠️ Não foi possível obter contatos base');
    }

    // Processar em lotes
    console.log('🔄 Iniciando processamento em lotes...');
    
    while (foundNumbers.length < quantity && attempts < maxAttempts) {
      const batch = [];
      
      // Criar lote de números para verificar
      for (let j = 0; j < batchSize && foundNumbers.length + batch.length < quantity; j++) {
        let numberId;
        
        // 50% chance de usar número base + variação, 50% aleatório
        if (baseNumbers.length > 0 && Math.random() > 0.5) {
          const baseNumber = baseNumbers[Math.floor(Math.random() * baseNumbers.length)];
          numberId = generateVariation(baseNumber);
        } else {
          const randomNumber = generateRandomNumber(ddd);
          numberId = `55${randomNumber}@c.us`;
        }
        
        // Evitar duplicatas
        if (!checkedNumbers.has(numberId)) {
          checkedNumbers.add(numberId);
          batch.push(checkNumber(numberId));
        }
      }

      // Executar verificações em paralelo
      const results = await Promise.all(batch);
      
      // Processar resultados
      for (const result of results) {
        if (result && foundNumbers.length < quantity) {
          if (!foundNumbers.find(n => n.number === result.number)) {
            foundNumbers.push(result);
            
            console.log(`✅ Número encontrado: ${result.number} - ${result.name || 'Sem nome'}`);
            
            // Enviar número encontrado imediatamente
            sendEvent({
              type: 'number',
              number: result
            });
          }
        }
      }

      attempts += batch.length;
      const progress = Math.min(Math.round((foundNumbers.length / quantity) * 100), 99);
      
      // Enviar progresso
      sendEvent({
        type: 'progress',
        progress: progress
      });

      // Se já encontrou a quantidade desejada, parar
      if (foundNumbers.length >= quantity) {
        break;
      }

      // Delay mínimo entre lotes
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`🏁 Busca finalizada: ${foundNumbers.length} números encontrados em ${attempts} tentativas`);

    // Enviar conclusão
    sendEvent({
      type: 'progress',
      progress: 100
    });

    sendEvent({
      type: 'complete',
      total: foundNumbers.length
    });

    res.end();
  } catch (error) {
    console.error('❌ Erro na busca:', error);
    sendEvent({
      type: 'error',
      message: error.message
    });
    res.end();
  }
});

// Função para gerar número aleatório
function generateRandomNumber(ddd) {
  // Gerar número de celular (9 dígitos)
  // Primeiro dígito é sempre 9 para celular
  const firstDigit = 9;
  
  // Segundos dígitos mais comuns: 6, 7, 8, 9
  const secondDigits = ['6', '7', '8', '9'];
  const secondDigit = secondDigits[Math.floor(Math.random() * secondDigits.length)];
  
  // Restante dos dígitos
  const remainingDigits = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  
  return `${ddd}${firstDigit}${secondDigit}${remainingDigits}`;
}

// Função para gerar variação de um número existente
function generateVariation(baseNumber) {
  // Remove @c.us
  const number = baseNumber.replace('@c.us', '');
  
  // Pega os últimos 4 dígitos e faz pequena variação
  const prefix = number.slice(0, -4);
  const lastDigits = parseInt(number.slice(-4));
  
  // Variação de +/- 100
  const variation = Math.floor(Math.random() * 200) - 100;
  const newLastDigits = Math.abs((lastDigits + variation) % 10000).toString().padStart(4, '0');
  
  return `${prefix}${newLastDigits}@c.us`;
}

// Rotas de Agendamento
app.get('/api/scheduled', (req, res) => {
  try {
    const messages = scheduledMessages.getAll();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/scheduled', (req, res) => {
  try {
    const { to_number, to_name, message, scheduled_date, scheduled_time, recurrence } = req.body;
    
    if (!to_number || !message || !scheduled_date || !scheduled_time) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const id = scheduledMessages.create({
      to_number,
      to_name,
      message,
      scheduled_date,
      scheduled_time,
      recurrence: recurrence || 'once'
    });

    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/scheduled/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { to_number, to_name, message, scheduled_date, scheduled_time, recurrence } = req.body;

    scheduledMessages.update(id, {
      to_number,
      to_name,
      message,
      scheduled_date,
      scheduled_time,
      recurrence
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/scheduled/:id', (req, res) => {
  try {
    const { id } = req.params;
    scheduledMessages.delete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROTAS DE GRUPOS ====================

// Listar todos os grupos
app.get('/api/groups', (req, res) => {
  try {
    const allGroups = groups.getAll();
    res.json(allGroups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar novo grupo
app.post('/api/groups', (req, res) => {
  try {
    const { name, description, type } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nome do grupo é obrigatório' });
    }

    const id = groups.create({ name, description, type });
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar grupo por ID
app.get('/api/groups/:id', (req, res) => {
  try {
    const { id } = req.params;
    const group = groups.getById(id);
    
    if (!group) {
      return res.status(404).json({ error: 'Grupo não encontrado' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar grupo
app.put('/api/groups/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type } = req.body;

    groups.update(id, { name, description, type });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar grupo
app.delete('/api/groups/:id', (req, res) => {
  try {
    const { id } = req.params;
    groups.delete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter estatísticas do grupo
app.get('/api/groups/:id/stats', (req, res) => {
  try {
    const { id } = req.params;
    const stats = groups.getStats(id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar membros de um grupo
app.get('/api/groups/:id/members', (req, res) => {
  try {
    const { id } = req.params;
    const members = groupMembers.getByGroup(id);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Adicionar membro ao grupo
app.post('/api/groups/:id/members', (req, res) => {
  try {
    const { id } = req.params;
    const { contact_number, contact_name } = req.body;
    
    if (!contact_number) {
      return res.status(400).json({ error: 'Número do contato é obrigatório' });
    }

    const memberId = groupMembers.add(id, { contact_number, contact_name });
    res.json({ success: true, id: memberId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Adicionar múltiplos membros
app.post('/api/groups/:id/members/bulk', (req, res) => {
  try {
    const { id } = req.params;
    const { members } = req.body;
    
    if (!members || !Array.isArray(members)) {
      return res.status(400).json({ error: 'Lista de membros inválida' });
    }

    groupMembers.addBulk(id, members);
    res.json({ success: true, count: members.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remover membro do grupo
app.delete('/api/groups/:groupId/members/:memberId', (req, res) => {
  try {
    const { memberId } = req.params;
    groupMembers.remove(memberId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enviar mensagem para grupo
app.post('/api/groups/:id/send', async (req, res) => {
  if (!isReady) {
    return res.status(400).json({ error: 'WhatsApp não conectado' });
  }

  try {
    const { id } = req.params;
    const { message, delay } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    const members = groupMembers.getByGroup(id);
    
    if (members.length === 0) {
      return res.status(400).json({ error: 'Grupo não possui membros' });
    }

    // Configurar SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const sendEvent = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    let sent = 0;
    let failed = 0;
    const delayMs = (delay || 60) * 1000;

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      
      try {
        sendEvent({
          type: 'progress',
          current: i + 1,
          total: members.length,
          member: member.contact_name || member.contact_number
        });

        await client.sendMessage(member.contact_number, message);
        sent++;
        
        sendEvent({
          type: 'sent',
          member: member.contact_name || member.contact_number
        });

        // Registrar interação
        groupMembers.recordInteraction(member.id);

      } catch (error) {
        failed++;
        sendEvent({
          type: 'failed',
          member: member.contact_name || member.contact_number,
          error: error.message
        });
      }

      // Delay entre envios (exceto no último)
      if (i < members.length - 1) {
        sendEvent({
          type: 'waiting',
          seconds: delay || 60
        });

        for (let sec = delay || 60; sec > 0; sec--) {
          sendEvent({
            type: 'countdown',
            seconds: sec,
            sent: sent,
            failed: failed
          });
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Registrar mensagem no histórico
    groupMessages.create(id, message, { sent, delivered: sent, failed });

    sendEvent({
      type: 'complete',
      sent: sent,
      failed: failed,
      total: members.length
    });

    res.end();
  } catch (error) {
    console.error('Erro ao enviar para grupo:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    res.end();
  }
});

// Listar histórico de mensagens do grupo
app.get('/api/groups/:id/messages', (req, res) => {
  try {
    const { id } = req.params;
    const messages = groupMessages.getByGroup(id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Importar membros de arquivo
app.post('/api/groups/:id/import', (req, res) => {
  try {
    const { id } = req.params;
    const { data, format } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Dados não fornecidos' });
    }

    let members = [];

    if (format === 'csv' || format === 'txt') {
      // Processar linhas
      const lines = data.split('\n').filter(line => line.trim());
      
      members = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          contact_number: parts[0],
          contact_name: parts[1] || ''
        };
      });
    } else if (format === 'json') {
      members = JSON.parse(data);
    }

    if (members.length === 0) {
      return res.status(400).json({ error: 'Nenhum membro válido encontrado' });
    }

    groupMembers.addBulk(id, members);
    res.json({ success: true, count: members.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exportar membros do grupo
app.get('/api/groups/:id/export', (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.query;
    
    const members = groupMembers.getByGroup(id);
    
    if (format === 'json') {
      res.json(members);
    } else if (format === 'csv') {
      let csv = 'Número,Nome,Status,Adicionado em\n';
      members.forEach(m => {
        csv += `${m.contact_number},${m.contact_name || ''},${m.status},${m.added_at}\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.send(csv);
    } else {
      // TXT simples
      let txt = members.map(m => `${m.contact_number},${m.contact_name || ''}`).join('\n');
      res.setHeader('Content-Type', 'text/plain');
      res.send(txt);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROTAS DE AUTO-RESPOSTA ====================

// Obter configurações
app.get('/api/auto-reply/settings', (req, res) => {
  try {
    const settings = autoReplySettings.get();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar configurações
app.put('/api/auto-reply/settings', (req, res) => {
  try {
    autoReplySettings.update(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar todas as regras
app.get('/api/auto-reply/rules', (req, res) => {
  try {
    const rules = autoReplyRules.getAll();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar nova regra
app.post('/api/auto-reply/rules', (req, res) => {
  try {
    const { name, keywords, response, match_type, priority } = req.body;
    
    if (!name || !keywords || !response) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const id = autoReplyRules.create({ name, keywords, response, match_type, priority });
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar regra
app.put('/api/auto-reply/rules/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, keywords, response, match_type, priority } = req.body;

    autoReplyRules.update(id, { name, keywords, response, match_type, priority });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ativar/desativar regra
app.patch('/api/auto-reply/rules/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    autoReplyRules.toggleEnabled(id, enabled);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar regra
app.delete('/api/auto-reply/rules/:id', (req, res) => {
  try {
    const { id } = req.params;
    autoReplyRules.delete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar logs
app.get('/api/auto-reply/logs', (req, res) => {
  try {
    const { limit } = req.query;
    const logs = autoReplyLogs.getRecent(limit ? parseInt(limit) : 50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Estatísticas
app.get('/api/auto-reply/stats', (req, res) => {
  try {
    const stats = autoReplyLogs.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar blacklist
app.get('/api/auto-reply/blacklist', (req, res) => {
  try {
    const list = blacklist.getAll();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Adicionar à blacklist
app.post('/api/auto-reply/blacklist', (req, res) => {
  try {
    const { number, reason } = req.body;
    
    if (!number) {
      return res.status(400).json({ error: 'Número é obrigatório' });
    }

    blacklist.add(number, reason);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remover da blacklist
app.delete('/api/auto-reply/blacklist/:number', (req, res) => {
  try {
    const { number } = req.params;
    blacklist.remove(decodeURIComponent(number));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cron job para verificar e enviar mensagens agendadas (a cada minuto)
cron.schedule('* * * * *', async () => {
  if (!isReady) return;

  try {
    const messagesToSend = scheduledMessages.getToSendNow();
    
    for (const msg of messagesToSend) {
      try {
        console.log(`📅 Enviando mensagem agendada #${msg.id} para ${msg.to_number}`);
        
        await client.sendMessage(msg.to_number, msg.message);
        
        // Se for recorrente, criar novo agendamento
        if (msg.recurrence !== 'once') {
          const nextDate = calculateNextDate(msg.scheduled_date, msg.recurrence);
          scheduledMessages.create({
            to_number: msg.to_number,
            to_name: msg.to_name,
            message: msg.message,
            scheduled_date: nextDate,
            scheduled_time: msg.scheduled_time,
            recurrence: msg.recurrence
          });
        }
        
        scheduledMessages.markAsSent(msg.id);
        console.log(`✅ Mensagem agendada #${msg.id} enviada com sucesso`);
        
        // Notificar via socket
        io.emit('scheduled-sent', { id: msg.id, to: msg.to_number });
        
      } catch (error) {
        console.error(`❌ Erro ao enviar mensagem agendada #${msg.id}:`, error);
        scheduledMessages.markAsFailed(msg.id, error.message);
      }
    }
  } catch (error) {
    console.error('Erro no cron de mensagens agendadas:', error);
  }
});

// Função para calcular próxima data baseado na recorrência
function calculateNextDate(currentDate, recurrence) {
  const date = new Date(currentDate);
  
  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return currentDate;
  }
  
  return date.toISOString().split('T')[0];
}

initWhatsApp();

// Health Check para Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    whatsapp: isReady ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Rotas disponíveis:');
  console.log('  GET  /api/status');
  console.log('  GET  /api/chats');
  console.log('  GET  /api/contacts');
  console.log('  GET  /api/chat/:chatId/messages');
  console.log('  POST /api/send');
  console.log('  POST /api/disconnect');
  console.log('  POST /api/reconnect');
  console.log('  POST /api/find-numbers ✨');
});
