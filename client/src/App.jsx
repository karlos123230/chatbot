import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { MessageCircle, Users, Send, BarChart3, QrCode, CheckCircle, XCircle, ArrowLeft, Search, Smartphone, Calendar, UserPlus, Upload, Download, Trash2, Bot, Clock, Shield, LogOut } from 'lucide-react';
import './App.css';

// Configuração da API - usa variável de ambiente ou localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(API_URL);

console.log('🔗 Conectando ao backend:', API_URL);

function App() {
  const [status, setStatus] = useState({ isReady: false, qrCode: null, stats: {} });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [sendTo, setSendTo] = useState('');
  const [message, setMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickMessage, setQuickMessage] = useState('');
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactMessage, setContactMessage] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, myContacts, notSaved
  const [messageHistory, setMessageHistory] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [finderState, setFinderState] = useState('');
  const [finderQuantity, setFinderQuantity] = useState(10);
  const [foundNumbers, setFoundNumbers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [showMassMessage, setShowMassMessage] = useState(false);
  const [massMessage, setMassMessage] = useState('');
  const [massQuantity, setMassQuantity] = useState(0);
  const [isSendingMass, setIsSendingMass] = useState(false);
  const [massSendProgress, setMassSendProgress] = useState(0);
  const [massSendStatus, setMassSendStatus] = useState('');
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    to_number: '',
    to_name: '',
    message: '',
    scheduled_date: '',
    scheduled_time: '',
    recurrence: 'once'
  });
  const [editingSchedule, setEditingSchedule] = useState(null);
  
  // Estados para Grupos
  const [groupsList, setGroupsList] = useState([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    type: 'group'
  });
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({
    contact_number: '',
    contact_name: ''
  });
  const [showImportMembers, setShowImportMembers] = useState(false);
  const [importData, setImportData] = useState('');
  const [importFormat, setImportFormat] = useState('txt');
  const [showGroupSend, setShowGroupSend] = useState(false);
  const [groupMessage, setGroupMessage] = useState('');
  const [groupSendDelay, setGroupSendDelay] = useState(60);
  const [isSendingGroup, setIsSendingGroup] = useState(false);
  const [groupSendProgress, setGroupSendProgress] = useState({ current: 0, total: 0 });
  const [groupSendStatus, setGroupSendStatus] = useState('');
  const [groupStats, setGroupStats] = useState(null);
  const [groupMessageHistory, setGroupMessageHistory] = useState([]);
  
  // Estados para Auto-Resposta
  const [autoReplySettings, setAutoReplySettings] = useState(null);
  const [autoReplyRules, setAutoReplyRules] = useState([]);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    keywords: '',
    response: '',
    match_type: 'contains',
    priority: 0
  });
  const [editingRule, setEditingRule] = useState(null);
  const [autoReplyLogs, setAutoReplyLogs] = useState([]);
  const [autoReplyStats, setAutoReplyStats] = useState({ total_today: 0, unique_contacts: 0 });
  const [blacklistNumbers, setBlacklistNumbers] = useState([]);
  const [showAddBlacklist, setShowAddBlacklist] = useState(false);
  const [blacklistForm, setBlacklistForm] = useState({ number: '', reason: '' });
  const [loadingMessage, setLoadingMessage] = useState('Aguardando inicialização...');
  const [loadingPercent, setLoadingPercent] = useState(0);

  const messageTemplates = [
    { id: 1, name: 'Saudação', text: 'Olá! Como posso ajudar você hoje? 😊' },
    { id: 2, name: 'Agradecimento', text: 'Muito obrigado pelo contato! Estamos à disposição. 🙏' },
    { id: 3, name: 'Confirmação', text: 'Confirmado! Sua solicitação foi recebida com sucesso. ✅' },
    { id: 4, name: 'Aguarde', text: 'Por favor, aguarde um momento enquanto verifico isso para você. ⏳' },
    { id: 5, name: 'Horário', text: 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h. 🕐' },
    { id: 6, name: 'Despedida', text: 'Tenha um ótimo dia! Qualquer dúvida, estou à disposição. 👋' }
  ];

  const brazilianStates = [
    // São Paulo
    { code: '11', name: 'São Paulo - SP (Capital e Região Metropolitana)', ddd: '11' },
    { code: '12', name: 'São Paulo - SP (Vale do Paraíba e Litoral Norte)', ddd: '12' },
    { code: '13', name: 'São Paulo - SP (Baixada Santista)', ddd: '13' },
    { code: '14', name: 'São Paulo - SP (Bauru e Região)', ddd: '14' },
    { code: '15', name: 'São Paulo - SP (Sorocaba e Região)', ddd: '15' },
    { code: '16', name: 'São Paulo - SP (Ribeirão Preto e Região)', ddd: '16' },
    { code: '17', name: 'São Paulo - SP (São José do Rio Preto e Região)', ddd: '17' },
    { code: '18', name: 'São Paulo - SP (Presidente Prudente e Região)', ddd: '18' },
    { code: '19', name: 'São Paulo - SP (Campinas e Região)', ddd: '19' },
    
    // Rio de Janeiro
    { code: '21', name: 'Rio de Janeiro - RJ (Capital e Região Metropolitana)', ddd: '21' },
    { code: '22', name: 'Rio de Janeiro - RJ (Campos dos Goytacazes e Região)', ddd: '22' },
    { code: '24', name: 'Rio de Janeiro - RJ (Volta Redonda, Petrópolis e Região)', ddd: '24' },
    
    // Espírito Santo
    { code: '27', name: 'Espírito Santo - ES (Vitória e Região Metropolitana)', ddd: '27' },
    { code: '28', name: 'Espírito Santo - ES (Cachoeiro de Itapemirim e Sul)', ddd: '28' },
    
    // Minas Gerais
    { code: '31', name: 'Minas Gerais - MG (Belo Horizonte e Região Metropolitana)', ddd: '31' },
    { code: '32', name: 'Minas Gerais - MG (Juiz de Fora e Zona da Mata)', ddd: '32' },
    { code: '33', name: 'Minas Gerais - MG (Governador Valadares e Vale do Rio Doce)', ddd: '33' },
    { code: '34', name: 'Minas Gerais - MG (Uberlândia e Triângulo Mineiro)', ddd: '34' },
    { code: '35', name: 'Minas Gerais - MG (Poços de Caldas e Sul de Minas)', ddd: '35' },
    { code: '37', name: 'Minas Gerais - MG (Divinópolis e Centro-Oeste)', ddd: '37' },
    { code: '38', name: 'Minas Gerais - MG (Montes Claros e Norte)', ddd: '38' },
    
    // Paraná
    { code: '41', name: 'Paraná - PR (Curitiba e Região Metropolitana)', ddd: '41' },
    { code: '42', name: 'Paraná - PR (Ponta Grossa e Região)', ddd: '42' },
    { code: '43', name: 'Paraná - PR (Londrina e Norte)', ddd: '43' },
    { code: '44', name: 'Paraná - PR (Maringá e Noroeste)', ddd: '44' },
    { code: '45', name: 'Paraná - PR (Foz do Iguaçu e Oeste)', ddd: '45' },
    { code: '46', name: 'Paraná - PR (Francisco Beltrão e Sudoeste)', ddd: '46' },
    
    // Santa Catarina
    { code: '47', name: 'Santa Catarina - SC (Joinville, Blumenau e Norte)', ddd: '47' },
    { code: '48', name: 'Santa Catarina - SC (Florianópolis e Grande Florianópolis)', ddd: '48' },
    { code: '49', name: 'Santa Catarina - SC (Chapecó e Oeste)', ddd: '49' },
    
    // Rio Grande do Sul
    { code: '51', name: 'Rio Grande do Sul - RS (Porto Alegre e Região Metropolitana)', ddd: '51' },
    { code: '53', name: 'Rio Grande do Sul - RS (Pelotas e Sul)', ddd: '53' },
    { code: '54', name: 'Rio Grande do Sul - RS (Caxias do Sul e Serra)', ddd: '54' },
    { code: '55', name: 'Rio Grande do Sul - RS (Santa Maria e Região Central)', ddd: '55' },
    
    // Distrito Federal e Goiás
    { code: '61', name: 'Distrito Federal - DF (Brasília e Entorno)', ddd: '61' },
    { code: '62', name: 'Goiás - GO (Goiânia e Região Metropolitana)', ddd: '62' },
    { code: '64', name: 'Goiás - GO (Rio Verde e Sudoeste)', ddd: '64' },
    
    // Tocantins
    { code: '63', name: 'Tocantins - TO (Todo o Estado)', ddd: '63' },
    
    // Mato Grosso
    { code: '65', name: 'Mato Grosso - MT (Cuiabá e Região)', ddd: '65' },
    { code: '66', name: 'Mato Grosso - MT (Rondonópolis e Sul)', ddd: '66' },
    
    // Mato Grosso do Sul
    { code: '67', name: 'Mato Grosso do Sul - MS (Todo o Estado)', ddd: '67' },
    
    // Acre
    { code: '68', name: 'Acre - AC (Todo o Estado)', ddd: '68' },
    
    // Rondônia
    { code: '69', name: 'Rondônia - RO (Todo o Estado)', ddd: '69' },
    
    // Bahia
    { code: '71', name: 'Bahia - BA (Salvador e Região Metropolitana)', ddd: '71' },
    { code: '73', name: 'Bahia - BA (Ilhéus e Sul)', ddd: '73' },
    { code: '74', name: 'Bahia - BA (Juazeiro e Norte)', ddd: '74' },
    { code: '75', name: 'Bahia - BA (Feira de Santana e Região)', ddd: '75' },
    { code: '77', name: 'Bahia - BA (Vitória da Conquista e Sudoeste)', ddd: '77' },
    
    // Sergipe
    { code: '79', name: 'Sergipe - SE (Todo o Estado)', ddd: '79' },
    
    // Pernambuco
    { code: '81', name: 'Pernambuco - PE (Recife e Região Metropolitana)', ddd: '81' },
    { code: '87', name: 'Pernambuco - PE (Petrolina e Sertão)', ddd: '87' },
    
    // Alagoas
    { code: '82', name: 'Alagoas - AL (Todo o Estado)', ddd: '82' },
    
    // Paraíba
    { code: '83', name: 'Paraíba - PB (Todo o Estado)', ddd: '83' },
    
    // Rio Grande do Norte
    { code: '84', name: 'Rio Grande do Norte - RN (Todo o Estado)', ddd: '84' },
    
    // Ceará
    { code: '85', name: 'Ceará - CE (Fortaleza e Região Metropolitana)', ddd: '85' },
    { code: '88', name: 'Ceará - CE (Juazeiro do Norte e Sul)', ddd: '88' },
    
    // Piauí
    { code: '86', name: 'Piauí - PI (Teresina e Região)', ddd: '86' },
    { code: '89', name: 'Piauí - PI (Picos e Sul)', ddd: '89' },
    
    // Pará
    { code: '91', name: 'Pará - PA (Belém e Região Metropolitana)', ddd: '91' },
    { code: '93', name: 'Pará - PA (Santarém e Oeste)', ddd: '93' },
    { code: '94', name: 'Pará - PA (Marabá e Sul)', ddd: '94' },
    
    // Amazonas
    { code: '92', name: 'Amazonas - AM (Manaus e Região Metropolitana)', ddd: '92' },
    { code: '97', name: 'Amazonas - AM (Interior)', ddd: '97' },
    
    // Roraima
    { code: '95', name: 'Roraima - RR (Todo o Estado)', ddd: '95' },
    
    // Amapá
    { code: '96', name: 'Amapá - AP (Todo o Estado)', ddd: '96' },
    
    // Maranhão
    { code: '98', name: 'Maranhão - MA (São Luís e Região Metropolitana)', ddd: '98' },
    { code: '99', name: 'Maranhão - MA (Imperatriz e Sul)', ddd: '99' }
  ];

  useEffect(() => {
    fetchStatus();
    
    socket.on('qr', (qr) => {
      console.log('✅ QR Code recebido do servidor');
      setStatus(prev => ({ ...prev, qrCode: qr }));
      setLoadingMessage('QR Code gerado! Escaneie com seu WhatsApp');
    });

    socket.on('ready', () => {
      console.log('✅ WhatsApp conectado!');
      setLoadingMessage('Conectado!');
      fetchStatus();
    });

    socket.on('message', () => {
      fetchStatus();
    });

    socket.on('loading', (data) => {
      console.log('⏳ Carregando:', data.percent, '%', data.message);
      setLoadingPercent(data.percent);
      setLoadingMessage(data.message || 'Carregando WhatsApp...');
    });

    socket.on('init_error', (error) => {
      console.error('❌ Erro na inicialização:', error);
      setLoadingMessage(`Erro: ${error}. Tente novamente.`);
    });

    socket.on('auth_failure', (msg) => {
      console.error('❌ Falha na autenticação:', msg);
      setLoadingMessage('Falha na autenticação. Tente reconectar.');
    });

    socket.on('disconnected', () => {
      console.log('⚠️ WhatsApp desconectado');
      setLoadingMessage('Desconectado. Clique em "Tentar Novamente"');
      setStatus({ isReady: false, qrCode: null, stats: {} });
    });

    socket.on('connect', () => {
      console.log('✅ Conectado ao servidor');
      setLoadingMessage('Conectado ao servidor. Aguardando WhatsApp...');
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Desconectado do servidor');
      setLoadingMessage('Desconectado do servidor. Reconectando...');
    });

    return () => {
      socket.off('qr');
      socket.off('ready');
      socket.off('message');
      socket.off('loading');
      socket.off('init_error');
      socket.off('auth_failure');
      socket.off('disconnected');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const fetchStatus = async () => {
    const res = await fetch(`${API_URL}/api/status`);
    const data = await res.json();
    setStatus(data);
  };

  const fetchChats = async () => {
    const res = await fetch(`${API_URL}/api/chats`);
    const data = await res.json();
    setChats(data);
  };

  const fetchContacts = async () => {
    const res = await fetch(`${API_URL}/api/contacts`);
    const data = await res.json();
    setContacts(data);
  };

  const sendMessage = async () => {
    if (!sendTo.trim() || !message.trim()) {
      alert('⚠️ Preencha o número e a mensagem!');
      return;
    }

    try {
      await fetch(`${API_URL}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: sendTo, message })
      });
      
      // Adicionar ao histórico
      const newHistory = {
        id: Date.now(),
        to: sendTo,
        message: message,
        timestamp: new Date().toLocaleString('pt-BR')
      };
      setMessageHistory([newHistory, ...messageHistory].slice(0, 10));
      
      setMessage('');
      alert('✅ Mensagem enviada com sucesso!');
    } catch (error) {
      alert('❌ Erro ao enviar mensagem');
    }
  };

  const applyTemplate = (template) => {
    setMessage(template.text);
    setShowTemplates(false);
  };

  const formatPhoneNumber = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Formata para o padrão do WhatsApp
    if (numbers.length <= 12) {
      return numbers;
    }
    return numbers.slice(0, 12);
  };

  const handlePhoneInput = (value) => {
    const formatted = formatPhoneNumber(value);
    // Adiciona @c.us se não tiver
    if (formatted && !formatted.includes('@')) {
      setSendTo(formatted + '@c.us');
    } else {
      setSendTo(formatted);
    }
  };

  const clearForm = () => {
    setSendTo('');
    setMessage('');
  };

  const reuseMessage = (historyItem) => {
    setSendTo(historyItem.to);
    setMessage(historyItem.message);
  };

  const startNumberFinder = async () => {
    if (!finderState || finderQuantity < 1) {
      alert('⚠️ Selecione um estado e quantidade válida!');
      return;
    }

    setIsSearching(true);
    setFoundNumbers([]);
    setSearchProgress(0);

    console.log(`🔍 Iniciando busca: DDD ${finderState}, Quantidade: ${finderQuantity}`);

    try {
      const response = await fetch(`${API_URL}/api/find-numbers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ddd: finderState, 
          quantity: finderQuantity 
        })
      });

      console.log('📡 Resposta recebida:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Stream não disponível');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      console.log('📖 Iniciando leitura do stream...');

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Stream finalizado');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;
              
              const data = JSON.parse(jsonStr);
              
              console.log('📨 Evento recebido:', data.type, data);
              
              if (data.type === 'progress') {
                setSearchProgress(data.progress);
              } else if (data.type === 'number') {
                console.log('✅ Número encontrado:', data.number);
                setFoundNumbers(prev => [...prev, data.number]);
              } else if (data.type === 'complete') {
                console.log(`🎉 Busca concluída! Total: ${data.total} números`);
                setIsSearching(false);
                if (data.total === 0) {
                  alert('⚠️ Nenhum número encontrado. Tente outro DDD ou aumente a quantidade.');
                }
              } else if (data.type === 'error') {
                console.error('❌ Erro do servidor:', data.message);
                alert(`❌ Erro: ${data.message}`);
                setIsSearching(false);
              }
            } catch (e) {
              console.error('❌ Erro ao parsear JSON:', e, 'Linha:', line);
            }
          }
        }
      }

      // Se chegou aqui e ainda está buscando, finalizar
      if (isSearching) {
        setIsSearching(false);
        console.log('🏁 Busca finalizada');
      }

    } catch (error) {
      console.error('❌ Erro ao buscar números:', error);
      alert(`❌ Erro ao buscar números: ${error.message}\n\nVerifique:\n1. WhatsApp está conectado?\n2. Servidor está rodando?\n3. Console do navegador (F12) para mais detalhes`);
      setIsSearching(false);
    }
  };

  const exportNumbers = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('pt-BR').replace(/:/g, '-');
    
    // Encontrar o nome da localidade
    const localidade = brazilianStates.find(state => state.ddd === finderState);
    const localidadeNome = localidade ? localidade.name : `DDD ${finderState}`;
    
    // Criar cabeçalho
    let content = '';
    content += `NUMEROS DE WHATSAPP - ${localidadeNome}\n`;
    content += `Total: ${foundNumbers.length} numeros\n`;
    content += `Data: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}\n`;
    content += `\n`;
    
    // Adicionar números limpos
    content += foundNumbers
      .map(num => num.number.replace('@c.us', ''))
      .join('\n');
    
    // Criar e baixar arquivo
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WhatsApp-${foundNumbers.length}-Numeros-${localidadeNome.split(' ')[0]}-${dateStr}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`✅ Arquivo baixado com sucesso!\n\n📄 ${foundNumbers.length} números de ${localidadeNome}`);
  };

  const startMassSend = async () => {
    if (!massMessage.trim()) {
      alert('⚠️ Digite uma mensagem!');
      return;
    }

    const quantity = massQuantity || foundNumbers.length;
    const numbersToSend = foundNumbers.slice(0, quantity);

    if (!confirm(`📤 Enviar mensagem para ${numbersToSend.length} números?\n\n⏱️ Tempo estimado: ${Math.ceil(numbersToSend.length * 60 / 60)} minutos\n\n⚠️ Delay de 60 segundos entre cada envio`)) {
      return;
    }

    setIsSendingMass(true);
    setMassSendProgress(0);
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < numbersToSend.length; i++) {
      const num = numbersToSend[i];
      
      try {
        setMassSendStatus(`Enviando para ${num.name || num.number} (${i + 1}/${numbersToSend.length})...`);
        
        const response = await fetch(`${API_URL}/api/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            to: num.number, 
            message: massMessage 
          })
        });

        if (response.ok) {
          sent++;
          console.log(`✅ Enviado para ${num.number}`);
        } else {
          failed++;
          console.error(`❌ Falha ao enviar para ${num.number}`);
        }
      } catch (error) {
        failed++;
        console.error(`❌ Erro ao enviar para ${num.number}:`, error);
      }

      // Atualizar progresso
      const progress = Math.round(((i + 1) / numbersToSend.length) * 100);
      setMassSendProgress(progress);

      // Delay de 60 segundos entre envios (exceto no último)
      if (i < numbersToSend.length - 1) {
        setMassSendStatus(`Aguardando 60 segundos... (${i + 1}/${numbersToSend.length} enviados)`);
        
        // Countdown de 60 segundos
        for (let sec = 60; sec > 0; sec--) {
          setMassSendStatus(`⏳ Próximo envio em ${sec}s... (${sent} enviados, ${failed} falhas)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    setIsSendingMass(false);
    setMassSendStatus('');
    setShowMassMessage(false);
    setMassMessage('');
    
    alert(`✅ Envio em massa concluído!\n\n📤 Enviados: ${sent}\n❌ Falhas: ${failed}\n📊 Total: ${numbersToSend.length}`);
  };

  // Funções de Agendamento
  const fetchScheduledMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/scheduled`);
      const data = await res.json();
      setScheduledMessages(data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  };

  const saveScheduledMessage = async () => {
    if (!scheduleForm.to_number || !scheduleForm.message || !scheduleForm.scheduled_date || !scheduleForm.scheduled_time) {
      alert('⚠️ Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const url = editingSchedule 
        ? `${API_URL}/api/scheduled/${editingSchedule}`
        : `${API_URL}/api/scheduled`;
      
      const method = editingSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleForm)
      });

      if (response.ok) {
        alert(editingSchedule ? '✅ Agendamento atualizado!' : '✅ Mensagem agendada com sucesso!');
        setShowScheduleForm(false);
        setEditingSchedule(null);
        setScheduleForm({
          to_number: '',
          to_name: '',
          message: '',
          scheduled_date: '',
          scheduled_time: '',
          recurrence: 'once'
        });
        fetchScheduledMessages();
      }
    } catch (error) {
      alert('❌ Erro ao salvar agendamento');
      console.error(error);
    }
  };

  const deleteScheduledMessage = async (id) => {
    if (!confirm('🗑️ Deseja realmente excluir este agendamento?')) return;

    try {
      const response = await fetch(`${API_URL}/api/scheduled/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('✅ Agendamento excluído!');
        fetchScheduledMessages();
      }
    } catch (error) {
      alert('❌ Erro ao excluir agendamento');
      console.error(error);
    }
  };

  const editScheduledMessage = (msg) => {
    setEditingSchedule(msg.id);
    setScheduleForm({
      to_number: msg.to_number,
      to_name: msg.to_name || '',
      message: msg.message,
      scheduled_date: msg.scheduled_date,
      scheduled_time: msg.scheduled_time,
      recurrence: msg.recurrence
    });
    setShowScheduleForm(true);
  };

  useEffect(() => {
    if (activeTab === 'schedule' && status.isReady) {
      fetchScheduledMessages();
    }
  }, [activeTab, status.isReady]);

  useEffect(() => {
    socket.on('scheduled-sent', (data) => {
      console.log('Mensagem agendada enviada:', data);
      fetchScheduledMessages();
    });

    return () => socket.off('scheduled-sent');
  }, []);

  // ==================== FUNÇÕES DE GRUPOS ====================

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/api/groups`);
      const data = await res.json();
      setGroupsList(data);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    }
  };

  const saveGroup = async () => {
    if (!groupForm.name.trim()) {
      alert('⚠️ Digite um nome para o grupo!');
      return;
    }

    try {
      const url = editingGroup 
        ? `${API_URL}/api/groups/${editingGroup}`
        : `${API_URL}/api/groups`;
      
      const method = editingGroup ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupForm)
      });

      if (response.ok) {
        alert(editingGroup ? '✅ Grupo atualizado!' : '✅ Grupo criado com sucesso!');
        setShowGroupForm(false);
        setEditingGroup(null);
        setGroupForm({ name: '', description: '', type: 'group' });
        fetchGroups();
      }
    } catch (error) {
      alert('❌ Erro ao salvar grupo');
      console.error(error);
    }
  };

  const deleteGroup = async (id) => {
    if (!confirm('🗑️ Deseja realmente excluir este grupo e todos os seus membros?')) return;

    try {
      const response = await fetch(`${API_URL}/api/groups/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('✅ Grupo excluído!');
        fetchGroups();
        if (selectedGroup?.id === id) {
          setSelectedGroup(null);
        }
      }
    } catch (error) {
      alert('❌ Erro ao excluir grupo');
      console.error(error);
    }
  };

  const editGroup = (group) => {
    setEditingGroup(group.id);
    setGroupForm({
      name: group.name,
      description: group.description || '',
      type: group.type
    });
    setShowGroupForm(true);
  };

  const selectGroup = async (group) => {
    setSelectedGroup(group);
    await fetchGroupMembers(group.id);
    await fetchGroupStats(group.id);
    await fetchGroupMessages(group.id);
  };

  const fetchGroupMembers = async (groupId) => {
    try {
      const res = await fetch(`${API_URL}/api/groups/${groupId}/members`);
      const data = await res.json();
      setGroupMembers(data);
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
    }
  };

  const fetchGroupStats = async (groupId) => {
    try {
      const res = await fetch(`${API_URL}/api/groups/${groupId}/stats`);
      const data = await res.json();
      setGroupStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchGroupMessages = async (groupId) => {
    try {
      const res = await fetch(`${API_URL}/api/groups/${groupId}/messages`);
      const data = await res.json();
      setGroupMessageHistory(data);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    }
  };

  const addMemberToGroup = async () => {
    if (!memberForm.contact_number.trim()) {
      alert('⚠️ Digite o número do contato!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/groups/${selectedGroup.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberForm)
      });

      if (response.ok) {
        alert('✅ Membro adicionado!');
        setShowAddMember(false);
        setMemberForm({ contact_number: '', contact_name: '' });
        fetchGroupMembers(selectedGroup.id);
        fetchGroupStats(selectedGroup.id);
      }
    } catch (error) {
      alert('❌ Erro ao adicionar membro');
      console.error(error);
    }
  };

  const removeMemberFromGroup = async (memberId) => {
    if (!confirm('🗑️ Remover este membro do grupo?')) return;

    try {
      const response = await fetch(`${API_URL}/api/groups/${selectedGroup.id}/members/${memberId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('✅ Membro removido!');
        fetchGroupMembers(selectedGroup.id);
        fetchGroupStats(selectedGroup.id);
      }
    } catch (error) {
      alert('❌ Erro ao remover membro');
      console.error(error);
    }
  };

  const importMembers = async () => {
    if (!importData.trim()) {
      alert('⚠️ Cole os dados para importar!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/groups/${selectedGroup.id}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: importData, format: importFormat })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ ${result.count} membros importados com sucesso!`);
        setShowImportMembers(false);
        setImportData('');
        fetchGroupMembers(selectedGroup.id);
        fetchGroupStats(selectedGroup.id);
      } else {
        alert(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Erro ao importar membros');
      console.error(error);
    }
  };

  const exportMembers = async (format) => {
    try {
      const response = await fetch(`${API_URL}/api/groups/${selectedGroup.id}/export?format=${format}`);
      
      if (format === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedGroup.name}-membros.json`;
        a.click();
      } else {
        const text = await response.text();
        const blob = new Blob([text], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedGroup.name}-membros.${format}`;
        a.click();
      }

      alert('✅ Membros exportados com sucesso!');
    } catch (error) {
      alert('❌ Erro ao exportar membros');
      console.error(error);
    }
  };

  const sendToGroup = async () => {
    if (!groupMessage.trim()) {
      alert('⚠️ Digite uma mensagem!');
      return;
    }

    if (!confirm(`📤 Enviar mensagem para ${groupMembers.length} membros?\n\n⏱️ Tempo estimado: ${Math.ceil(groupMembers.length * groupSendDelay / 60)} minutos\n\n⚠️ Delay de ${groupSendDelay} segundos entre cada envio`)) {
      return;
    }

    setIsSendingGroup(true);
    setGroupSendProgress({ current: 0, total: groupMembers.length });

    try {
      const response = await fetch(`${API_URL}/api/groups/${selectedGroup.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: groupMessage, delay: groupSendDelay })
      });

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                setGroupSendProgress({ current: data.current, total: data.total });
                setGroupSendStatus(`Enviando para ${data.member}...`);
              } else if (data.type === 'countdown') {
                setGroupSendStatus(`⏳ Próximo envio em ${data.seconds}s... (${data.sent} enviados, ${data.failed} falhas)`);
              } else if (data.type === 'complete') {
                setGroupSendStatus('');
                alert(`✅ Envio concluído!\n\n📤 Enviados: ${data.sent}\n❌ Falhas: ${data.failed}\n📊 Total: ${data.total}`);
                fetchGroupStats(selectedGroup.id);
                fetchGroupMessages(selectedGroup.id);
              }
            } catch (e) {
              console.error('Erro ao parsear evento:', e);
            }
          }
        }
      }
    } catch (error) {
      alert('❌ Erro ao enviar mensagens');
      console.error(error);
    } finally {
      setIsSendingGroup(false);
      setShowGroupSend(false);
      setGroupMessage('');
    }
  };

  const addFoundNumbersToGroup = async () => {
    if (!selectedGroup) {
      alert('⚠️ Selecione um grupo primeiro!');
      return;
    }

    if (foundNumbers.length === 0) {
      alert('⚠️ Nenhum número encontrado para adicionar!');
      return;
    }

    try {
      const members = foundNumbers.map(num => ({
        contact_number: num.number,
        contact_name: num.name || ''
      }));

      const response = await fetch(`${API_URL}/api/groups/${selectedGroup.id}/members/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ ${result.count} números adicionados ao grupo "${selectedGroup.name}"!`);
        fetchGroupMembers(selectedGroup.id);
        fetchGroupStats(selectedGroup.id);
      }
    } catch (error) {
      alert('❌ Erro ao adicionar números ao grupo');
      console.error(error);
    }
  };

  useEffect(() => {
    if (activeTab === 'groups' && status.isReady) {
      fetchGroups();
    }
  }, [activeTab, status.isReady]);

  // ==================== FUNÇÕES DE AUTO-RESPOSTA ====================

  const fetchAutoReplySettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auto-reply/settings`);
      const data = await res.json();
      setAutoReplySettings(data);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
  };

  const saveAutoReplySettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auto-reply/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(autoReplySettings)
      });

      if (response.ok) {
        alert('✅ Configurações salvas!');
      }
    } catch (error) {
      alert('❌ Erro ao salvar configurações');
      console.error(error);
    }
  };

  const fetchAutoReplyRules = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auto-reply/rules`);
      const data = await res.json();
      setAutoReplyRules(data);
    } catch (error) {
      console.error('Erro ao buscar regras:', error);
    }
  };

  const saveAutoReplyRule = async () => {
    if (!ruleForm.name.trim() || !ruleForm.keywords.trim() || !ruleForm.response.trim()) {
      alert('⚠️ Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const url = editingRule 
        ? `${API_URL}/api/auto-reply/rules/${editingRule}`
        : `${API_URL}/api/auto-reply/rules`;
      
      const method = editingRule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleForm)
      });

      if (response.ok) {
        alert(editingRule ? '✅ Regra atualizada!' : '✅ Regra criada com sucesso!');
        setShowRuleForm(false);
        setEditingRule(null);
        setRuleForm({ name: '', keywords: '', response: '', match_type: 'contains', priority: 0 });
        fetchAutoReplyRules();
      }
    } catch (error) {
      alert('❌ Erro ao salvar regra');
      console.error(error);
    }
  };

  const toggleAutoReplyRule = async (id, enabled) => {
    try {
      const response = await fetch(`${API_URL}/api/auto-reply/rules/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        fetchAutoReplyRules();
      }
    } catch (error) {
      console.error('Erro ao alternar regra:', error);
    }
  };

  const deleteAutoReplyRule = async (id) => {
    if (!confirm('🗑️ Deseja realmente excluir esta regra?')) return;

    try {
      const response = await fetch(`${API_URL}/api/auto-reply/rules/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('✅ Regra excluída!');
        fetchAutoReplyRules();
      }
    } catch (error) {
      alert('❌ Erro ao excluir regra');
      console.error(error);
    }
  };

  const editAutoReplyRule = (rule) => {
    setEditingRule(rule.id);
    setRuleForm({
      name: rule.name,
      keywords: rule.keywords,
      response: rule.response,
      match_type: rule.match_type,
      priority: rule.priority
    });
    setShowRuleForm(true);
  };

  const fetchAutoReplyLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auto-reply/logs?limit=50`);
      const data = await res.json();
      setAutoReplyLogs(data);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    }
  };

  const fetchAutoReplyStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auto-reply/stats`);
      const data = await res.json();
      setAutoReplyStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchBlacklist = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auto-reply/blacklist`);
      const data = await res.json();
      setBlacklistNumbers(data);
    } catch (error) {
      console.error('Erro ao buscar blacklist:', error);
    }
  };

  const addToBlacklist = async () => {
    if (!blacklistForm.number.trim()) {
      alert('⚠️ Digite o número!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auto-reply/blacklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blacklistForm)
      });

      if (response.ok) {
        alert('✅ Número adicionado à blacklist!');
        setShowAddBlacklist(false);
        setBlacklistForm({ number: '', reason: '' });
        fetchBlacklist();
      }
    } catch (error) {
      alert('❌ Erro ao adicionar à blacklist');
      console.error(error);
    }
  };

  const removeFromBlacklist = async (number) => {
    if (!confirm('🗑️ Remover este número da blacklist?')) return;

    try {
      const response = await fetch(`${API_URL}/api/auto-reply/blacklist/${encodeURIComponent(number)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('✅ Número removido da blacklist!');
        fetchBlacklist();
      }
    } catch (error) {
      alert('❌ Erro ao remover da blacklist');
      console.error(error);
    }
  };

  useEffect(() => {
    if (activeTab === 'autoreply' && status.isReady) {
      fetchAutoReplySettings();
      fetchAutoReplyRules();
      fetchAutoReplyLogs();
      fetchAutoReplyStats();
      fetchBlacklist();
    }
  }, [activeTab, status.isReady]);

  useEffect(() => {
    socket.on('auto-reply-sent', (data) => {
      console.log('Auto-resposta enviada:', data);
      fetchAutoReplyLogs();
      fetchAutoReplyStats();
    });

    return () => socket.off('auto-reply-sent');
  }, []);

  const reconnect = async () => {
    await fetch(`${API_URL}/api/reconnect`, { method: 'POST' });
    setStatus({ isReady: false, qrCode: null, stats: {} });
  };

  const disconnect = async () => {
    if (!window.confirm('Tem certeza que deseja desconectar do WhatsApp?')) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/disconnect`, {
        method: 'POST'
      });
      const data = await response.json();
      console.log('Disconnect response:', data);
      // Atualizar status
      setStatus({
        isReady: false,
        qrCode: null,
        stats: { messagesReceived: 0, messagesSent: 0, contacts: 0, chats: 0 }
      });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      alert('Erro ao desconectar. Tente novamente.');
    }
  };

  const loadChatMessages = async (chatId) => {
    try {
      const res = await fetch(`${API_URL}/api/chat/${encodeURIComponent(chatId)}/messages`);
      const data = await res.json();
      setChatMessages(data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const sendQuickMessage = async () => {
    if (!selectedChat || !quickMessage.trim()) return;
    
    try {
      await fetch(`${API_URL}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: selectedChat.id, message: quickMessage })
      });
      setQuickMessage('');
      // Recarregar mensagens
      setTimeout(() => loadChatMessages(selectedChat.id), 500);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      contact.number?.includes(contactSearchTerm);
    
    if (filterType === 'myContacts') {
      return matchesSearch && contact.isMyContact;
    } else if (filterType === 'notSaved') {
      return matchesSearch && !contact.isMyContact;
    }
    return matchesSearch;
  });

  const sendContactMessage = async () => {
    if (!selectedContact || !contactMessage.trim()) return;
    
    try {
      await fetch(`${API_URL}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: selectedContact.id, message: contactMessage })
      });
      setContactMessage('');
      alert('✅ Mensagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('❌ Erro ao enviar mensagem');
    }
  };

  const copyContactNumber = (number) => {
    navigator.clipboard.writeText(number);
    alert('📋 Número copiado!');
  };

  useEffect(() => {
    if (activeTab === 'chats' && status.isReady) fetchChats();
    if (activeTab === 'contacts' && status.isReady) fetchContacts();
  }, [activeTab, status.isReady]);

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">
          <MessageCircle size={40} strokeWidth={2.5} />
          <h1>WhatsApp Pro</h1>
        </div>
        
        <nav>
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <BarChart3 size={22} />
            Dashboard
          </button>
          <button className={activeTab === 'chats' ? 'active' : ''} onClick={() => setActiveTab('chats')}>
            <MessageCircle size={22} />
            Conversas
          </button>
          <button className={activeTab === 'contacts' ? 'active' : ''} onClick={() => setActiveTab('contacts')}>
            <Users size={22} />
            Contatos
          </button>
          <button className={activeTab === 'send' ? 'active' : ''} onClick={() => setActiveTab('send')}>
            <Send size={22} />
            Enviar
          </button>
          <button className={activeTab === 'finder' ? 'active' : ''} onClick={() => setActiveTab('finder')}>
            <Smartphone size={22} />
            Localizar
          </button>
          <button className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}>
            <Calendar size={22} />
            Agendamento
          </button>
          <button className={activeTab === 'groups' ? 'active' : ''} onClick={() => setActiveTab('groups')}>
            <UserPlus size={22} />
            Grupos
          </button>
          <button className={activeTab === 'autoreply' ? 'active' : ''} onClick={() => setActiveTab('autoreply')}>
            <Bot size={22} />
            Auto-Resposta
          </button>
        </nav>
      </div>

      <div className="main-content">
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {activeTab !== 'dashboard' && (
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className="back-button"
                title="Voltar ao Dashboard"
              >
                <ArrowLeft size={24} strokeWidth={2.5} />
              </button>
            )}
            <h2>{
              activeTab === 'dashboard' ? '📊 Dashboard' : 
              activeTab === 'chats' ? '💬 Conversas' : 
              activeTab === 'contacts' ? '👥 Contatos' : 
              activeTab === 'finder' ? '📱 Localizar Números' : 
              activeTab === 'schedule' ? '📅 Agendamento' :
              activeTab === 'groups' ? '👥 Grupos e Listas' :
              activeTab === 'autoreply' ? '🤖 Respostas Automáticas' :
              '📤 Enviar Mensagem'
            }</h2>
          </div>
          <div className="status">
            {status.isReady ? (
              <><CheckCircle size={22} strokeWidth={2.5} /> Conectado</>
            ) : (
              <><XCircle size={22} strokeWidth={2.5} /> Desconectado</>
            )}
          </div>
        </header>

        <div className="content">
          {!status.isReady && !status.qrCode && (
            <div className="qr-section">
              <QrCode size={64} strokeWidth={2} />
              <h3>Aguardando QR Code...</h3>
              <p>{loadingMessage}</p>
              {loadingPercent > 0 && (
                <div className="loading-bar">
                  <div className="loading-progress" style={{ width: `${loadingPercent}%` }}></div>
                  <span>{loadingPercent}%</span>
                </div>
              )}
              <p className="loading-info">⏳ Isso pode levar 30-60 segundos na primeira vez</p>
              <p className="loading-info">🔄 O Puppeteer está baixando o Chrome...</p>
              <button onClick={reconnect}>
                🔄 Tentar Novamente
              </button>
            </div>
          )}

          {!status.isReady && status.qrCode && (
            <div className="qr-section">
              <QrCode size={64} strokeWidth={2} />
              <h3>✨ Escaneie o QR Code</h3>
              <p>📱 1. Abra o WhatsApp no seu celular</p>
              <p>⚙️ 2. Toque em Menu (⋮) ou Configurações</p>
              <p>🔗 3. Toque em "Aparelhos conectados"</p>
              <p>➕ 4. Toque em "Conectar um aparelho"</p>
              <p>📸 5. Aponte seu celular para esta tela</p>
              <img src={status.qrCode} alt="QR Code" />
              <button onClick={reconnect}>
                🔄 Gerar Novo QR Code
              </button>
            </div>
          )}

          {activeTab === 'dashboard' && status.isReady && (
            <div className="dashboard">
              <div className="stats-grid">
                <div className="stat-card">
                  <MessageCircle size={48} strokeWidth={2} />
                  <div>
                    <h3>{status.stats.messagesReceived || 0}</h3>
                    <p>Mensagens Recebidas</p>
                  </div>
                </div>
                <div className="stat-card">
                  <Send size={48} strokeWidth={2} />
                  <div>
                    <h3>{status.stats.messagesSent || 0}</h3>
                    <p>Mensagens Enviadas</p>
                  </div>
                </div>
                <div className="stat-card">
                  <Users size={48} strokeWidth={2} />
                  <div>
                    <h3>{status.stats.contacts || 0}</h3>
                    <p>Contatos</p>
                  </div>
                </div>
                <div className="stat-card">
                  <MessageCircle size={48} strokeWidth={2} />
                  <div>
                    <h3>{status.stats.chats || 0}</h3>
                    <p>Conversas Ativas</p>
                  </div>
                </div>
              </div>
              
              <div className="disconnect-section">
                <button className="disconnect-btn" onClick={disconnect}>
                  <LogOut size={20} strokeWidth={2} />
                  Desconectar do WhatsApp
                </button>
              </div>
            </div>
          )}

          {activeTab === 'chats' && status.isReady && (
            <div className="chat-container">
              <div className="chat-list-panel">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="🔍 Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="list">
                  {filteredChats.length === 0 && <p style={{color: 'white', textAlign: 'center', padding: '2rem'}}>Nenhuma conversa encontrada</p>}
                  {filteredChats.map((chat, index) => (
                    <div 
                      key={chat.id} 
                      className={`list-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
                      style={{animationDelay: `${index * 0.05}s`}}
                      onClick={() => {
                        setSelectedChat(chat);
                        loadChatMessages(chat.id);
                      }}
                    >
                      <div className="avatar">{chat.name?.[0]?.toUpperCase() || '?'}</div>
                      <div className="info">
                        <h4>{chat.name || 'Sem nome'}</h4>
                        <p>{chat.lastMessage || 'Sem mensagens'}</p>
                      </div>
                      {chat.unreadCount > 0 && <span className="badge">{chat.unreadCount}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {selectedChat ? (
                <div className="chat-messages-panel">
                  <div className="chat-header">
                    <div className="avatar">{selectedChat.name?.[0]?.toUpperCase() || '?'}</div>
                    <div>
                      <h3>{selectedChat.name || 'Sem nome'}</h3>
                      <p>{selectedChat.isGroup ? '👥 Grupo' : '👤 Contato'}</p>
                    </div>
                  </div>

                  <div className="messages-container">
                    {chatMessages.length === 0 && (
                      <div style={{textAlign: 'center', color: 'rgba(255,255,255,0.6)', padding: '2rem'}}>
                        <MessageCircle size={48} style={{marginBottom: '1rem', opacity: 0.5}} />
                        <p>Carregue as últimas mensagens desta conversa</p>
                      </div>
                    )}
                    {chatMessages.map((msg, index) => (
                      <div key={index} className={`message ${msg.fromMe ? 'sent' : 'received'}`}>
                        {!msg.fromMe && selectedChat.isGroup && (
                          <span className="message-author">{msg.author || 'Desconhecido'}</span>
                        )}
                        <div className="message-bubble">
                          <p>{msg.body}</p>
                          <span className="message-time">
                            {new Date(msg.timestamp * 1000).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="quick-reply">
                    <input
                      type="text"
                      placeholder="✍️ Digite sua mensagem..."
                      value={quickMessage}
                      onChange={(e) => setQuickMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendQuickMessage()}
                    />
                    <button onClick={sendQuickMessage}>
                      <Send size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="chat-empty-state">
                  <MessageCircle size={80} strokeWidth={1.5} />
                  <h3>Selecione uma conversa</h3>
                  <p>Escolha uma conversa da lista para visualizar as mensagens</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contacts' && status.isReady && (
            <div className="contacts-container">
              <div className="contacts-list-panel">
                <div className="contacts-filters">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="🔍 Buscar contatos..."
                      value={contactSearchTerm}
                      onChange={(e) => setContactSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="filter-buttons">
                    <button 
                      className={filterType === 'all' ? 'active' : ''}
                      onClick={() => setFilterType('all')}
                    >
                      Todos ({contacts.length})
                    </button>
                    <button 
                      className={filterType === 'myContacts' ? 'active' : ''}
                      onClick={() => setFilterType('myContacts')}
                    >
                      Salvos ({contacts.filter(c => c.isMyContact).length})
                    </button>
                    <button 
                      className={filterType === 'notSaved' ? 'active' : ''}
                      onClick={() => setFilterType('notSaved')}
                    >
                      Não Salvos ({contacts.filter(c => !c.isMyContact).length})
                    </button>
                  </div>
                </div>

                <div className="list">
                  {filteredContacts.length === 0 && (
                    <p style={{color: '#9ca3af', textAlign: 'center', padding: '2rem'}}>
                      Nenhum contato encontrado
                    </p>
                  )}
                  {filteredContacts.map((contact, index) => (
                    <div 
                      key={contact.id} 
                      className={`list-item ${selectedContact?.id === contact.id ? 'selected' : ''}`}
                      style={{animationDelay: `${index * 0.05}s`}}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="avatar">{contact.name?.[0]?.toUpperCase() || '?'}</div>
                      <div className="info">
                        <h4>
                          {contact.name || 'Sem nome'}
                          {contact.isMyContact && <span className="contact-badge">📱</span>}
                        </h4>
                        <p>{contact.number || 'Sem número'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedContact ? (
                <div className="contact-details-panel">
                  <div className="contact-profile">
                    <div className="avatar-large">
                      {selectedContact.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <h2>{selectedContact.name || 'Sem nome'}</h2>
                    <p className="contact-number">{selectedContact.number || 'Sem número'}</p>
                    {selectedContact.isMyContact && (
                      <span className="status-badge">✓ Contato Salvo</span>
                    )}
                  </div>

                  <div className="contact-actions">
                    <button 
                      className="action-btn primary"
                      onClick={() => copyContactNumber(selectedContact.number)}
                    >
                      📋 Copiar Número
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={() => {
                        setActiveTab('send');
                        setSendTo(selectedContact.id);
                      }}
                    >
                      💬 Abrir Chat
                    </button>
                  </div>

                  <div className="quick-message-section">
                    <h3>📤 Enviar Mensagem Rápida</h3>
                    <div className="quick-message-form">
                      <textarea
                        placeholder="✍️ Digite sua mensagem..."
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        rows={4}
                      />
                      <button 
                        className="send-btn"
                        onClick={sendContactMessage}
                        disabled={!contactMessage.trim()}
                      >
                        <Send size={20} strokeWidth={2.5} />
                        Enviar Agora
                      </button>
                    </div>
                  </div>

                  <div className="contact-info-section">
                    <h3>ℹ️ Informações</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">ID:</span>
                        <span className="info-value">{selectedContact.id}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Número:</span>
                        <span className="info-value">{selectedContact.number}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Status:</span>
                        <span className="info-value">
                          {selectedContact.isMyContact ? '✅ Salvo' : '❌ Não Salvo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="contact-empty-state">
                  <Users size={80} strokeWidth={1.5} />
                  <h3>Selecione um contato</h3>
                  <p>Escolha um contato da lista para ver detalhes e enviar mensagens</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'send' && status.isReady && (
            <div className="send-container">
              <div className="send-main-panel">
                <div className="send-form-card">
                  <h3>📤 Nova Mensagem</h3>
                  
                  <div className="form-group">
                    <label>📱 Número do Destinatário</label>
                    <input
                      type="text"
                      placeholder="Ex: 5511999999999@c.us"
                      value={sendTo}
                      onChange={(e) => setSendTo(e.target.value)}
                    />
                    <small>Formato: código do país + DDD + número + @c.us</small>
                  </div>

                  <div className="form-group">
                    <div className="label-with-action">
                      <label>✍️ Mensagem</label>
                      <button 
                        className="template-toggle"
                        onClick={() => setShowTemplates(!showTemplates)}
                      >
                        📋 {showTemplates ? 'Ocultar' : 'Ver'} Templates
                      </button>
                    </div>
                    
                    {showTemplates && (
                      <div className="templates-grid">
                        {messageTemplates.map(template => (
                          <button
                            key={template.id}
                            className="template-card"
                            onClick={() => applyTemplate(template)}
                          >
                            <strong>{template.name}</strong>
                            <p>{template.text}</p>
                          </button>
                        ))}
                      </div>
                    )}

                    <textarea
                      placeholder="Digite sua mensagem aqui..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={8}
                    />
                    <div className="char-counter">
                      {message.length} caracteres
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      className="btn-secondary"
                      onClick={clearForm}
                    >
                      🗑️ Limpar
                    </button>
                    <button 
                      className="btn-primary"
                      onClick={sendMessage}
                      disabled={!sendTo.trim() || !message.trim()}
                    >
                      <Send size={20} strokeWidth={2.5} />
                      Enviar Mensagem
                    </button>
                  </div>
                </div>

                {/* Preview */}
                {message && (
                  <div className="message-preview-card">
                    <h3>👁️ Preview da Mensagem</h3>
                    <div className="preview-bubble">
                      <p>{message}</p>
                      <span className="preview-time">
                        {new Date().toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Histórico */}
              <div className="send-history-panel">
                <h3>📜 Histórico de Envios</h3>
                {messageHistory.length === 0 ? (
                  <div className="empty-history">
                    <p>Nenhuma mensagem enviada ainda</p>
                  </div>
                ) : (
                  <div className="history-list">
                    {messageHistory.map(item => (
                      <div key={item.id} className="history-item">
                        <div className="history-header">
                          <span className="history-to">📱 {item.to}</span>
                          <span className="history-time">🕐 {item.timestamp}</span>
                        </div>
                        <div className="history-message">{item.message}</div>
                        <button 
                          className="reuse-btn"
                          onClick={() => reuseMessage(item)}
                        >
                          🔄 Reutilizar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'finder' && status.isReady && (
            <div className="finder-container">
              <div className="finder-config-panel">
                <div className="finder-card">
                  <h3>🔍 Configuração da Busca</h3>
                  
                  <div className="form-group">
                    <label>📍 Estado / Região (DDD)</label>
                    <select 
                      value={finderState} 
                      onChange={(e) => setFinderState(e.target.value)}
                      disabled={isSearching}
                    >
                      <option value="">Selecione um estado...</option>
                      {brazilianStates.map(state => (
                        <option key={state.code} value={state.ddd}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>🔢 Quantidade de Números</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100"
                      value={finderQuantity}
                      onChange={(e) => setFinderQuantity(parseInt(e.target.value) || 1)}
                      disabled={isSearching}
                    />
                    <small>Máximo: 100 números por busca</small>
                  </div>

                  <div className="finder-info">
                    <p>ℹ️ <strong>Como funciona:</strong></p>
                    <ul>
                      <li>✓ Usa contatos existentes como base</li>
                      <li>✓ Gera variações de números reais</li>
                      <li>✓ Verifica automaticamente se tem WhatsApp</li>
                      <li>✓ Retorna apenas números ativos</li>
                      <li>✓ Mostra nome do contato quando disponível</li>
                    </ul>
                    <small style={{color: '#9ca3af', marginTop: '0.5rem', display: 'block'}}>
                      💡 Dica: Quanto mais contatos você tiver do DDD selecionado, melhores serão os resultados
                    </small>
                  </div>

                  <button 
                    className="btn-primary"
                    onClick={startNumberFinder}
                    disabled={isSearching || !finderState}
                  >
                    {isSearching ? '🔄 Buscando...' : '🚀 Iniciar Buscas'}
                  </button>

                  {isSearching && (
                    <div className="progress-section">
                      <div className="progress-stats">
                        <span>✅ Encontrados: {foundNumbers.length}/{finderQuantity}</span>
                        <span>⏱️ Progresso: {searchProgress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${searchProgress}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="finder-results-panel">
                <div className="results-header">
                  <h3>📋 Números Encontrados ({foundNumbers.length})</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {foundNumbers.length > 0 && (
                      <>
                        <button className="export-btn" onClick={exportNumbers}>
                          💾 Exportar
                        </button>
                        <button 
                          className="mass-send-btn" 
                          onClick={() => {
                            setShowMassMessage(true);
                            setMassQuantity(foundNumbers.length);
                          }}
                        >
                          📤 Envio em Massa
                        </button>
                        {groupsList.length > 0 && (
                          <select 
                            className="group-select-btn"
                            onChange={(e) => {
                              if (e.target.value) {
                                const group = groupsList.find(g => g.id === parseInt(e.target.value));
                                setSelectedGroup(group);
                                addFoundNumbersToGroup();
                                e.target.value = '';
                              }
                            }}
                          >
                            <option value="">➕ Adicionar ao Grupo</option>
                            {groupsList.map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {showMassMessage && (
                  <div className="mass-message-panel">
                    <div className="mass-message-header">
                      <h4>📤 Envio em Massa</h4>
                      <button 
                        className="close-btn"
                        onClick={() => setShowMassMessage(false)}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="form-group">
                      <label>📊 Quantidade de Números</label>
                      <input 
                        type="number" 
                        min="1" 
                        max={foundNumbers.length}
                        value={massQuantity}
                        onChange={(e) => setMassQuantity(Math.min(parseInt(e.target.value) || 1, foundNumbers.length))}
                        disabled={isSendingMass}
                      />
                      <small>Máximo: {foundNumbers.length} números encontrados</small>
                    </div>

                    <div className="form-group">
                      <label>✍️ Mensagem</label>
                      <textarea
                        placeholder="Digite a mensagem que será enviada para todos..."
                        value={massMessage}
                        onChange={(e) => setMassMessage(e.target.value)}
                        rows={6}
                        disabled={isSendingMass}
                      />
                      <small>⏱️ Delay de 60 segundos entre cada envio</small>
                    </div>

                    {isSendingMass && (
                      <div className="progress-section">
                        <div className="progress-stats">
                          <span>{massSendStatus}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${massSendProgress}%` }}></div>
                        </div>
                      </div>
                    )}

                    <div className="mass-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => setShowMassMessage(false)}
                        disabled={isSendingMass}
                      >
                        ❌ Cancelar
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={startMassSend}
                        disabled={isSendingMass || !massMessage.trim()}
                      >
                        {isSendingMass ? '⏳ Enviando...' : '🚀 Iniciar Envio'}
                      </button>
                    </div>
                  </div>
                )}

                {foundNumbers.length === 0 && !isSearching && (
                  <div className="empty-results">
                    <Smartphone size={64} strokeWidth={1.5} />
                    <p>Nenhum número encontrado ainda</p>
                    <small>Configure os filtros e inicie a busca</small>
                  </div>
                )}

                {foundNumbers.length === 0 && isSearching && (
                  <div className="empty-results">
                    <div className="spinner"></div>
                    <p>Buscando números...</p>
                    <small>Aguarde enquanto verificamos os números</small>
                  </div>
                )}

                {foundNumbers.length > 0 && (
                  <div className="results-list">
                    {foundNumbers.map((num, index) => (
                      <div key={index} className="result-item">
                        <div className="result-avatar">
                          {num.name?.[0]?.toUpperCase() || '📱'}
                        </div>
                        <div className="result-info">
                          <h4>{num.name || 'Sem nome'}</h4>
                          <p>{num.number}</p>
                        </div>
                        <div className="result-actions">
                          <button 
                            className="result-action-btn"
                            onClick={() => {
                              setSendTo(num.number);
                              setActiveTab('send');
                            }}
                            title="Enviar mensagem"
                          >
                            💬
                          </button>
                          <button 
                            className="result-action-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(num.number);
                              alert('📋 Número copiado!');
                            }}
                            title="Copiar número"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && status.isReady && (
            <div className="schedule-container">
              <div className="schedule-header-actions">
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowScheduleForm(true);
                    setEditingSchedule(null);
                    setScheduleForm({
                      to_number: '',
                      to_name: '',
                      message: '',
                      scheduled_date: '',
                      scheduled_time: '',
                      recurrence: 'once'
                    });
                  }}
                >
                  ➕ Nova Mensagem Agendada
                </button>
              </div>

              {showScheduleForm && (
                <div className="schedule-form-card">
                  <div className="schedule-form-header">
                    <h3>{editingSchedule ? '✏️ Editar Agendamento' : '📅 Nova Mensagem Agendada'}</h3>
                    <button className="close-btn" onClick={() => setShowScheduleForm(false)}>✕</button>
                  </div>

                  <div className="form-group">
                    <label>📱 Número do Destinatário</label>
                    <input
                      type="text"
                      placeholder="Ex: 5511999999999@c.us"
                      value={scheduleForm.to_number}
                      onChange={(e) => setScheduleForm({...scheduleForm, to_number: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>👤 Nome (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Nome do contato"
                      value={scheduleForm.to_name}
                      onChange={(e) => setScheduleForm({...scheduleForm, to_name: e.target.value})}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>📅 Data</label>
                      <input
                        type="date"
                        value={scheduleForm.scheduled_date}
                        onChange={(e) => setScheduleForm({...scheduleForm, scheduled_date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="form-group">
                      <label>⏰ Hora</label>
                      <input
                        type="time"
                        value={scheduleForm.scheduled_time}
                        onChange={(e) => setScheduleForm({...scheduleForm, scheduled_time: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>🔄 Recorrência</label>
                    <select
                      value={scheduleForm.recurrence}
                      onChange={(e) => setScheduleForm({...scheduleForm, recurrence: e.target.value})}
                    >
                      <option value="once">Uma vez</option>
                      <option value="daily">Diariamente</option>
                      <option value="weekly">Semanalmente</option>
                      <option value="monthly">Mensalmente</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>✍️ Mensagem</label>
                    <textarea
                      placeholder="Digite a mensagem..."
                      value={scheduleForm.message}
                      onChange={(e) => setScheduleForm({...scheduleForm, message: e.target.value})}
                      rows={6}
                    />
                  </div>

                  <div className="form-actions">
                    <button className="btn-secondary" onClick={() => setShowScheduleForm(false)}>
                      ❌ Cancelar
                    </button>
                    <button className="btn-primary" onClick={saveScheduledMessage}>
                      {editingSchedule ? '💾 Salvar' : '📅 Agendar'}
                    </button>
                  </div>
                </div>
              )}

              <div className="scheduled-list">
                <h3>📋 Mensagens Agendadas ({scheduledMessages.length})</h3>
                
                {scheduledMessages.length === 0 && (
                  <div className="empty-state">
                    <Calendar size={64} strokeWidth={1.5} />
                    <p>Nenhuma mensagem agendada</p>
                    <small>Clique em "Nova Mensagem Agendada" para começar</small>
                  </div>
                )}

                {scheduledMessages.map(msg => (
                  <div key={msg.id} className={`scheduled-item status-${msg.status}`}>
                    <div className="scheduled-info">
                      <div className="scheduled-header">
                        <h4>{msg.to_name || msg.to_number}</h4>
                        <span className={`status-badge ${msg.status}`}>
                          {msg.status === 'pending' && '⏳ Pendente'}
                          {msg.status === 'sent' && '✅ Enviado'}
                          {msg.status === 'failed' && '❌ Falhou'}
                        </span>
                      </div>
                      <p className="scheduled-message">{msg.message}</p>
                      <div className="scheduled-meta">
                        <span>📅 {new Date(msg.scheduled_date).toLocaleDateString('pt-BR')}</span>
                        <span>⏰ {msg.scheduled_time}</span>
                        <span>🔄 {
                          msg.recurrence === 'once' ? 'Uma vez' :
                          msg.recurrence === 'daily' ? 'Diário' :
                          msg.recurrence === 'weekly' ? 'Semanal' :
                          'Mensal'
                        }</span>
                      </div>
                    </div>
                    {msg.status === 'pending' && (
                      <div className="scheduled-actions">
                        <button className="action-btn edit" onClick={() => editScheduledMessage(msg)}>
                          ✏️
                        </button>
                        <button className="action-btn delete" onClick={() => deleteScheduledMessage(msg.id)}>
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'groups' && status.isReady && (
            <div className="groups-container">
              <div className="groups-sidebar">
                <div className="groups-header">
                  <h3>👥 Meus Grupos ({groupsList.length})</h3>
                  <button 
                    className="btn-primary-small"
                    onClick={() => {
                      setShowGroupForm(true);
                      setEditingGroup(null);
                      setGroupForm({ name: '', description: '', type: 'group' });
                    }}
                  >
                    ➕ Novo
                  </button>
                </div>

                {showGroupForm && (
                  <div className="group-form-card">
                    <div className="form-header">
                      <h4>{editingGroup ? '✏️ Editar Grupo' : '➕ Novo Grupo'}</h4>
                      <button className="close-btn" onClick={() => setShowGroupForm(false)}>✕</button>
                    </div>

                    <div className="form-group">
                      <label>📝 Nome do Grupo</label>
                      <input
                        type="text"
                        placeholder="Ex: Clientes VIP"
                        value={groupForm.name}
                        onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label>📄 Descrição (Opcional)</label>
                      <textarea
                        placeholder="Descrição do grupo..."
                        value={groupForm.description}
                        onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                        rows={3}
                      />
                    </div>

                    <div className="form-group">
                      <label>🏷️ Tipo</label>
                      <select
                        value={groupForm.type}
                        onChange={(e) => setGroupForm({...groupForm, type: e.target.value})}
                      >
                        <option value="group">👥 Grupo</option>
                        <option value="broadcast">📢 Lista de Transmissão</option>
                      </select>
                    </div>

                    <div className="form-actions">
                      <button className="btn-secondary" onClick={() => setShowGroupForm(false)}>
                        ❌ Cancelar
                      </button>
                      <button className="btn-primary" onClick={saveGroup}>
                        {editingGroup ? '💾 Salvar' : '➕ Criar'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="groups-list">
                  {groupsList.length === 0 && (
                    <div className="empty-state-small">
                      <UserPlus size={48} strokeWidth={1.5} />
                      <p>Nenhum grupo criado</p>
                      <small>Clique em "Novo" para começar</small>
                    </div>
                  )}

                  {groupsList.map(group => (
                    <div 
                      key={group.id} 
                      className={`group-item ${selectedGroup?.id === group.id ? 'selected' : ''}`}
                      onClick={() => selectGroup(group)}
                    >
                      <div className="group-icon">
                        {group.type === 'broadcast' ? '📢' : '👥'}
                      </div>
                      <div className="group-info">
                        <h4>{group.name}</h4>
                        <p>📊 {group.member_count || 0} membros</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedGroup ? (
                <div className="group-details">
                  <div className="group-details-header">
                    <div>
                      <h2>{selectedGroup.type === 'broadcast' ? '📢' : '👥'} {selectedGroup.name}</h2>
                      <p>{selectedGroup.description || 'Sem descrição'}</p>
                    </div>
                    <div className="group-actions-header">
                      <button className="action-btn-header edit" onClick={() => editGroup(selectedGroup)}>
                        ✏️ Editar
                      </button>
                      <button className="action-btn-header delete" onClick={() => deleteGroup(selectedGroup.id)}>
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>

                  {groupStats && (
                    <div className="group-stats-grid">
                      <div className="stat-card-small">
                        <span className="stat-icon">👥</span>
                        <div>
                          <h4>{groupStats.total_members || 0}</h4>
                          <p>Total de Membros</p>
                        </div>
                      </div>
                      <div className="stat-card-small">
                        <span className="stat-icon">✅</span>
                        <div>
                          <h4>{groupStats.active_members || 0}</h4>
                          <p>Ativos</p>
                        </div>
                      </div>
                      <div className="stat-card-small">
                        <span className="stat-icon">💬</span>
                        <div>
                          <h4>{groupStats.responded_members || 0}</h4>
                          <p>Responderam</p>
                        </div>
                      </div>
                      <div className="stat-card-small">
                        <span className="stat-icon">📤</span>
                        <div>
                          <h4>{groupStats.total_messages || 0}</h4>
                          <p>Mensagens Enviadas</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="group-tabs">
                    <div className="group-tab-buttons">
                      <button className="tab-btn active">👥 Membros ({groupMembers.length})</button>
                    </div>

                    <div className="group-tab-content">
                      <div className="members-actions">
                        <button className="btn-action" onClick={() => setShowAddMember(true)}>
                          ➕ Adicionar Membro
                        </button>
                        <button className="btn-action" onClick={() => setShowImportMembers(true)}>
                          📥 Importar
                        </button>
                        <button className="btn-action" onClick={() => exportMembers('txt')}>
                          💾 Exportar TXT
                        </button>
                        <button className="btn-action" onClick={() => exportMembers('csv')}>
                          💾 Exportar CSV
                        </button>
                        <button className="btn-action primary" onClick={() => setShowGroupSend(true)}>
                          📤 Enviar Mensagem
                        </button>
                      </div>

                      {showAddMember && (
                        <div className="inline-form">
                          <div className="form-header">
                            <h4>➕ Adicionar Membro</h4>
                            <button className="close-btn" onClick={() => setShowAddMember(false)}>✕</button>
                          </div>
                          <div className="form-row">
                            <input
                              type="text"
                              placeholder="Número (Ex: 5511999999999@c.us)"
                              value={memberForm.contact_number}
                              onChange={(e) => setMemberForm({...memberForm, contact_number: e.target.value})}
                            />
                            <input
                              type="text"
                              placeholder="Nome (Opcional)"
                              value={memberForm.contact_name}
                              onChange={(e) => setMemberForm({...memberForm, contact_name: e.target.value})}
                            />
                            <button className="btn-primary" onClick={addMemberToGroup}>
                              ➕ Adicionar
                            </button>
                          </div>
                        </div>
                      )}

                      {showImportMembers && (
                        <div className="inline-form">
                          <div className="form-header">
                            <h4>📥 Importar Membros</h4>
                            <button className="close-btn" onClick={() => setShowImportMembers(false)}>✕</button>
                          </div>
                          <div className="form-group">
                            <label>Formato</label>
                            <select value={importFormat} onChange={(e) => setImportFormat(e.target.value)}>
                              <option value="txt">TXT (um por linha: número,nome)</option>
                              <option value="csv">CSV (número,nome)</option>
                              <option value="json">JSON</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Dados</label>
                            <textarea
                              placeholder={importFormat === 'txt' ? '5511999999999@c.us,João\n5511888888888@c.us,Maria' : 'Cole os dados aqui...'}
                              value={importData}
                              onChange={(e) => setImportData(e.target.value)}
                              rows={6}
                            />
                          </div>
                          <button className="btn-primary" onClick={importMembers}>
                            📥 Importar
                          </button>
                        </div>
                      )}

                      {showGroupSend && (
                        <div className="inline-form">
                          <div className="form-header">
                            <h4>📤 Enviar para Grupo</h4>
                            <button className="close-btn" onClick={() => setShowGroupSend(false)}>✕</button>
                          </div>
                          <div className="form-group">
                            <label>✍️ Mensagem</label>
                            <textarea
                              placeholder="Digite a mensagem..."
                              value={groupMessage}
                              onChange={(e) => setGroupMessage(e.target.value)}
                              rows={6}
                              disabled={isSendingGroup}
                            />
                          </div>
                          <div className="form-group">
                            <label>⏱️ Delay entre envios (segundos)</label>
                            <input
                              type="number"
                              min="1"
                              max="300"
                              value={groupSendDelay}
                              onChange={(e) => setGroupSendDelay(parseInt(e.target.value) || 60)}
                              disabled={isSendingGroup}
                            />
                          </div>
                          {isSendingGroup && (
                            <div className="progress-section">
                              <div className="progress-stats">
                                <span>{groupSendStatus}</span>
                                <span>{groupSendProgress.current}/{groupSendProgress.total}</span>
                              </div>
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill" 
                                  style={{ width: `${(groupSendProgress.current / groupSendProgress.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          <button 
                            className="btn-primary" 
                            onClick={sendToGroup}
                            disabled={isSendingGroup || !groupMessage.trim()}
                          >
                            {isSendingGroup ? '⏳ Enviando...' : '🚀 Enviar Agora'}
                          </button>
                        </div>
                      )}

                      <div className="members-list">
                        {groupMembers.length === 0 && (
                          <div className="empty-state-small">
                            <Users size={48} strokeWidth={1.5} />
                            <p>Nenhum membro no grupo</p>
                            <small>Adicione membros para começar</small>
                          </div>
                        )}

                        {groupMembers.map(member => (
                          <div key={member.id} className="member-item">
                            <div className="member-avatar">
                              {member.contact_name?.[0]?.toUpperCase() || '👤'}
                            </div>
                            <div className="member-info">
                              <h4>{member.contact_name || 'Sem nome'}</h4>
                              <p>{member.contact_number}</p>
                              <small>
                                Adicionado: {new Date(member.added_at).toLocaleDateString('pt-BR')}
                                {member.last_interaction && ` • Última interação: ${new Date(member.last_interaction).toLocaleDateString('pt-BR')}`}
                              </small>
                            </div>
                            <button 
                              className="member-remove-btn"
                              onClick={() => removeMemberFromGroup(member.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="group-empty-state">
                  <UserPlus size={80} strokeWidth={1.5} />
                  <h3>Selecione um grupo</h3>
                  <p>Escolha um grupo da lista para gerenciar membros e enviar mensagens</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'autoreply' && status.isReady && (
            <div className="autoreply-container">
              {!autoReplySettings ? (
                <div className="loading-state">
                  <Bot size={64} strokeWidth={1.5} />
                  <p>Carregando configurações...</p>
                </div>
              ) : (
                <>
              <div className="autoreply-settings-card">
                <h3>⚙️ Configurações Gerais</h3>
                
                <div className="settings-grid">
                  <div className="setting-item">
                    <label className="switch-label">
                      <input
                        type="checkbox"
                        checked={autoReplySettings.enabled}
                        onChange={(e) => setAutoReplySettings({...autoReplySettings, enabled: e.target.checked})}
                      />
                      <span className="switch-slider"></span>
                      <span className="switch-text">✅ Ativar Respostas Automáticas</span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <label className="switch-label">
                      <input
                        type="checkbox"
                        checked={autoReplySettings.only_outside_hours}
                        onChange={(e) => setAutoReplySettings({...autoReplySettings, only_outside_hours: e.target.checked})}
                      />
                      <span className="switch-slider"></span>
                      <span className="switch-text">⏰ Apenas Fora do Horário Comercial</span>
                    </label>
                  </div>

                  {autoReplySettings.only_outside_hours && (
                    <div className="time-range">
                      <div className="form-group">
                        <label>Início</label>
                        <input
                          type="time"
                          value={autoReplySettings.start_hour}
                          onChange={(e) => setAutoReplySettings({...autoReplySettings, start_hour: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Fim</label>
                        <input
                          type="time"
                          value={autoReplySettings.end_hour}
                          onChange={(e) => setAutoReplySettings({...autoReplySettings, end_hour: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <div className="setting-item">
                    <label className="switch-label">
                      <input
                        type="checkbox"
                        checked={autoReplySettings.weekend_enabled}
                        onChange={(e) => setAutoReplySettings({...autoReplySettings, weekend_enabled: e.target.checked})}
                      />
                      <span className="switch-slider"></span>
                      <span className="switch-text">📅 Responder nos Finais de Semana</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>💬 Mensagem de Boas-Vindas</label>
                  <textarea
                    placeholder="Mensagem enviada quando não há regra correspondente..."
                    value={autoReplySettings.welcome_message || ''}
                    onChange={(e) => setAutoReplySettings({...autoReplySettings, welcome_message: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>🌙 Mensagem Fora do Horário</label>
                  <textarea
                    placeholder="Mensagem enviada fora do horário comercial..."
                    value={autoReplySettings.away_message || ''}
                    onChange={(e) => setAutoReplySettings({...autoReplySettings, away_message: e.target.value})}
                    rows={3}
                  />
                </div>

                <button className="btn-primary" onClick={saveAutoReplySettings}>
                  💾 Salvar Configurações
                </button>
              </div>

              <div className="autoreply-stats-grid">
                <div className="stat-card-small">
                  <span className="stat-icon">📤</span>
                  <div>
                    <h4>{autoReplyStats.total_today || 0}</h4>
                    <p>Respostas Hoje</p>
                  </div>
                </div>
                <div className="stat-card-small">
                  <span className="stat-icon">👥</span>
                  <div>
                    <h4>{autoReplyStats.unique_contacts || 0}</h4>
                    <p>Contatos Únicos</p>
                  </div>
                </div>
                <div className="stat-card-small">
                  <span className="stat-icon">📝</span>
                  <div>
                    <h4>{autoReplyRules.filter(r => r.enabled).length}</h4>
                    <p>Regras Ativas</p>
                  </div>
                </div>
                <div className="stat-card-small">
                  <span className="stat-icon">🚫</span>
                  <div>
                    <h4>{blacklistNumbers.length}</h4>
                    <p>Bloqueados</p>
                  </div>
                </div>
              </div>

              <div className="autoreply-tabs">
                <div className="autoreply-tab-content">
                  <div className="tab-header">
                    <h3>📝 Regras de Resposta ({autoReplyRules.length})</h3>
                    <button 
                      className="btn-primary-small"
                      onClick={() => {
                        setShowRuleForm(true);
                        setEditingRule(null);
                        setRuleForm({ name: '', keywords: '', response: '', match_type: 'contains', priority: 0 });
                      }}
                    >
                      ➕ Nova Regra
                    </button>
                  </div>

                  {showRuleForm && (
                    <div className="rule-form-card">
                      <div className="form-header">
                        <h4>{editingRule ? '✏️ Editar Regra' : '➕ Nova Regra'}</h4>
                        <button className="close-btn" onClick={() => setShowRuleForm(false)}>✕</button>
                      </div>

                      <div className="form-group">
                        <label>📝 Nome da Regra</label>
                        <input
                          type="text"
                          placeholder="Ex: Resposta sobre Preços"
                          value={ruleForm.name}
                          onChange={(e) => setRuleForm({...ruleForm, name: e.target.value})}
                        />
                      </div>

                      <div className="form-group">
                        <label>🔑 Palavras-Chave (separadas por vírgula)</label>
                        <input
                          type="text"
                          placeholder="Ex: preço, valor, quanto custa"
                          value={ruleForm.keywords}
                          onChange={(e) => setRuleForm({...ruleForm, keywords: e.target.value})}
                        />
                        <small>Digite as palavras que ativarão esta resposta</small>
                      </div>

                      <div className="form-group">
                        <label>🎯 Tipo de Correspondência</label>
                        <select
                          value={ruleForm.match_type}
                          onChange={(e) => setRuleForm({...ruleForm, match_type: e.target.value})}
                        >
                          <option value="contains">Contém (padrão)</option>
                          <option value="exact">Exato</option>
                          <option value="starts">Começa com</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>⭐ Prioridade (0-10)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={ruleForm.priority}
                          onChange={(e) => setRuleForm({...ruleForm, priority: parseInt(e.target.value) || 0})}
                        />
                        <small>Regras com maior prioridade são processadas primeiro</small>
                      </div>

                      <div className="form-group">
                        <label>💬 Resposta Automática</label>
                        <textarea
                          placeholder="Digite a mensagem que será enviada..."
                          value={ruleForm.response}
                          onChange={(e) => setRuleForm({...ruleForm, response: e.target.value})}
                          rows={6}
                        />
                      </div>

                      <div className="form-actions">
                        <button className="btn-secondary" onClick={() => setShowRuleForm(false)}>
                          ❌ Cancelar
                        </button>
                        <button className="btn-primary" onClick={saveAutoReplyRule}>
                          {editingRule ? '💾 Salvar' : '➕ Criar'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="rules-list">
                    {autoReplyRules.length === 0 && (
                      <div className="empty-state-small">
                        <Bot size={48} strokeWidth={1.5} />
                        <p>Nenhuma regra criada</p>
                        <small>Clique em "Nova Regra" para começar</small>
                      </div>
                    )}

                    {autoReplyRules.map(rule => (
                      <div key={rule.id} className={`rule-item ${!rule.enabled ? 'disabled' : ''}`}>
                        <div className="rule-header">
                          <div className="rule-title">
                            <h4>{rule.name}</h4>
                            <span className={`priority-badge priority-${rule.priority}`}>
                              ⭐ {rule.priority}
                            </span>
                          </div>
                          <label className="switch-label-small">
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={(e) => toggleAutoReplyRule(rule.id, e.target.checked)}
                            />
                            <span className="switch-slider-small"></span>
                          </label>
                        </div>
                        <div className="rule-keywords">
                          🔑 {rule.keywords}
                        </div>
                        <div className="rule-response">
                          💬 {rule.response}
                        </div>
                        <div className="rule-meta">
                          <span>🎯 {rule.match_type === 'contains' ? 'Contém' : rule.match_type === 'exact' ? 'Exato' : 'Começa com'}</span>
                        </div>
                        <div className="rule-actions">
                          <button className="action-btn edit" onClick={() => editAutoReplyRule(rule)}>
                            ✏️
                          </button>
                          <button className="action-btn delete" onClick={() => deleteAutoReplyRule(rule.id)}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="tab-header" style={{marginTop: '2rem'}}>
                    <h3>🚫 Blacklist ({blacklistNumbers.length})</h3>
                    <button 
                      className="btn-primary-small"
                      onClick={() => setShowAddBlacklist(true)}
                    >
                      ➕ Adicionar
                    </button>
                  </div>

                  {showAddBlacklist && (
                    <div className="inline-form">
                      <div className="form-header">
                        <h4>🚫 Adicionar à Blacklist</h4>
                        <button className="close-btn" onClick={() => setShowAddBlacklist(false)}>✕</button>
                      </div>
                      <div className="form-row">
                        <input
                          type="text"
                          placeholder="Número (Ex: 5511999999999@c.us)"
                          value={blacklistForm.number}
                          onChange={(e) => setBlacklistForm({...blacklistForm, number: e.target.value})}
                        />
                        <input
                          type="text"
                          placeholder="Motivo (Opcional)"
                          value={blacklistForm.reason}
                          onChange={(e) => setBlacklistForm({...blacklistForm, reason: e.target.value})}
                        />
                        <button className="btn-primary" onClick={addToBlacklist}>
                          ➕ Adicionar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="blacklist-list">
                    {blacklistNumbers.length === 0 && (
                      <div className="empty-state-small">
                        <Shield size={48} strokeWidth={1.5} />
                        <p>Nenhum número bloqueado</p>
                      </div>
                    )}

                    {blacklistNumbers.map(item => (
                      <div key={item.id} className="blacklist-item">
                        <div className="blacklist-info">
                          <h4>📱 {item.number}</h4>
                          {item.reason && <p>Motivo: {item.reason}</p>}
                          <small>Bloqueado em: {new Date(item.added_at).toLocaleString('pt-BR')}</small>
                        </div>
                        <button 
                          className="member-remove-btn"
                          onClick={() => removeFromBlacklist(item.number)}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="tab-header" style={{marginTop: '2rem'}}>
                    <h3>📊 Histórico de Respostas</h3>
                  </div>

                  <div className="logs-list">
                    {autoReplyLogs.length === 0 && (
                      <div className="empty-state-small">
                        <Clock size={48} strokeWidth={1.5} />
                        <p>Nenhuma resposta enviada ainda</p>
                      </div>
                    )}

                    {autoReplyLogs.map(log => (
                      <div key={log.id} className="log-item">
                        <div className="log-header">
                          <h4>📱 {log.from_name || log.from_number}</h4>
                          <span className="log-time">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="log-message received">
                          📩 Recebido: {log.message_received}
                        </div>
                        <div className="log-message sent">
                          📤 Enviado: {log.response_sent}
                        </div>
                        {log.rule_name && (
                          <div className="log-rule">
                            🤖 Regra: {log.rule_name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
