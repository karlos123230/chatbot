import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'whatsapp.db');

let db = null;
let SQL = null;

// Inicializar banco de dados
async function initDatabase() {
  SQL = await initSqlJs();
  
  // Tentar carregar banco existente
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Criar tabelas
  db.run(`
    CREATE TABLE IF NOT EXISTS scheduled_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_number TEXT NOT NULL,
      to_name TEXT,
      message TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      scheduled_time TEXT NOT NULL,
      recurrence TEXT DEFAULT 'once',
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sent_at TEXT,
      error TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'group',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      contact_number TEXT NOT NULL,
      contact_name TEXT,
      added_at TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active',
      last_interaction TEXT,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS group_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
      total_sent INTEGER DEFAULT 0,
      total_delivered INTEGER DEFAULT 0,
      total_failed INTEGER DEFAULT 0,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS auto_reply_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      keywords TEXT NOT NULL,
      response TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      match_type TEXT DEFAULT 'contains',
      priority INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS auto_reply_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enabled INTEGER DEFAULT 0,
      only_outside_hours INTEGER DEFAULT 0,
      start_hour TEXT DEFAULT '09:00',
      end_hour TEXT DEFAULT '18:00',
      weekend_enabled INTEGER DEFAULT 1,
      welcome_message TEXT,
      away_message TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS auto_reply_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_number TEXT NOT NULL,
      from_name TEXT,
      message_received TEXT NOT NULL,
      rule_id INTEGER,
      response_sent TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rule_id) REFERENCES auto_reply_rules(id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS blacklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT NOT NULL UNIQUE,
      reason TEXT,
      added_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Inserir configuração padrão se não existir
  const checkSettings = db.exec('SELECT COUNT(*) as count FROM auto_reply_settings');
  if (checkSettings.length === 0 || checkSettings[0].values[0][0] === 0) {
    db.run(`
      INSERT INTO auto_reply_settings (enabled, welcome_message, away_message)
      VALUES (0, 'Olá! Obrigado por entrar em contato. Como posso ajudar?', 'No momento estamos fora do horário de atendimento. Retornaremos em breve!')
    `);
  }

  saveDatabase();
}

// Salvar banco de dados no disco
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Funções para agendamentos
export const scheduledMessages = {
  // Criar novo agendamento
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO scheduled_messages (to_number, to_name, message, scheduled_date, scheduled_time, recurrence)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run([
      data.to_number,
      data.to_name,
      data.message,
      data.scheduled_date,
      data.scheduled_time,
      data.recurrence || 'once'
    ]);
    stmt.free();
    
    saveDatabase();
    
    // Retornar o último ID inserido
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  },

  // Listar todos os agendamentos
  getAll: () => {
    const result = db.exec(`
      SELECT * FROM scheduled_messages 
      ORDER BY scheduled_date, scheduled_time
    `);
    
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  },

  // Listar agendamentos pendentes
  getPending: () => {
    const result = db.exec(`
      SELECT * FROM scheduled_messages 
      WHERE status = 'pending'
      ORDER BY scheduled_date, scheduled_time
    `);
    
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  },

  // Buscar por ID
  getById: (id) => {
    const result = db.exec('SELECT * FROM scheduled_messages WHERE id = ?', [id]);
    
    if (result.length === 0) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = values[i];
    });
    return obj;
  },

  // Atualizar agendamento
  update: (id, data) => {
    const stmt = db.prepare(`
      UPDATE scheduled_messages 
      SET to_number = ?, to_name = ?, message = ?, scheduled_date = ?, scheduled_time = ?, recurrence = ?
      WHERE id = ?
    `);
    stmt.run([
      data.to_number,
      data.to_name,
      data.message,
      data.scheduled_date,
      data.scheduled_time,
      data.recurrence,
      id
    ]);
    stmt.free();
    
    saveDatabase();
    return true;
  },

  // Marcar como enviado
  markAsSent: (id) => {
    const stmt = db.prepare(`
      UPDATE scheduled_messages 
      SET status = 'sent', sent_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run([id]);
    stmt.free();
    
    saveDatabase();
    return true;
  },

  // Marcar como falha
  markAsFailed: (id, error) => {
    const stmt = db.prepare(`
      UPDATE scheduled_messages 
      SET status = 'failed', error = ?
      WHERE id = ?
    `);
    stmt.run([error, id]);
    stmt.free();
    
    saveDatabase();
    return true;
  },

  // Deletar agendamento
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM scheduled_messages WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    
    saveDatabase();
    return true;
  },

  // Buscar mensagens para enviar agora
  getToSendNow: () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    const result = db.exec(`
      SELECT * FROM scheduled_messages 
      WHERE status = 'pending'
      AND scheduled_date <= ?
      AND scheduled_time <= ?
    `, [currentDate, currentTime]);
    
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }
};

// Inicializar banco ao carregar módulo
await initDatabase();

export default db;


// Funções para Grupos
export const groups = {
  // Criar novo grupo
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO groups (name, description, type)
      VALUES (?, ?, ?)
    `);
    stmt.run([
      data.name,
      data.description || '',
      data.type || 'group'
    ]);
    stmt.free();
    
    saveDatabase();
    
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  },

  // Listar todos os grupos
  getAll: () => {
    const result = db.exec(`
      SELECT g.*, 
        COUNT(gm.id) as member_count,
        SUM(CASE WHEN gm.status = 'active' THEN 1 ELSE 0 END) as active_count
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `);
    
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  },

  // Buscar por ID
  getById: (id) => {
    const result = db.exec('SELECT * FROM groups WHERE id = ?', [id]);
    
    if (result.length === 0) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = values[i];
    });
    return obj;
  },

  // Atualizar grupo
  update: (id, data) => {
    const stmt = db.prepare(`
      UPDATE groups 
      SET name = ?, description = ?, type = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run([
      data.name,
      data.description,
      data.type,
      id
    ]);
    stmt.free();
    
    saveDatabase();
    return true;
  },

  // Deletar grupo
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM groups WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    
    saveDatabase();
    return true;
  },

  // Obter estatísticas do grupo
  getStats: (id) => {
    const result = db.exec(`
      SELECT 
        COUNT(gm.id) as total_members,
        SUM(CASE WHEN gm.status = 'active' THEN 1 ELSE 0 END) as active_members,
        SUM(CASE WHEN gm.last_interaction IS NOT NULL THEN 1 ELSE 0 END) as responded_members,
        (SELECT COUNT(*) FROM group_messages WHERE group_id = ?) as total_messages
      FROM group_members gm
      WHERE gm.group_id = ?
    `, [id, id]);
    
    if (result.length === 0) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = values[i];
    });
    return obj;
  }
};

// Funções para Membros de Grupos
export const groupMembers = {
  // Adicionar membro ao grupo
  add: (groupId, data) => {
    const stmt = db.prepare(`
      INSERT INTO group_members (group_id, contact_number, contact_name)
      VALUES (?, ?, ?)
    `);
    stmt.run([
      groupId,
      data.contact_number,
      data.contact_name || ''
    ]);
    stmt.free();
    
    saveDatabase();
    
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  },

  // Adicionar múltiplos membros
  addBulk: (groupId, members) => {
    const stmt = db.prepare(`
      INSERT INTO group_members (group_id, contact_number, contact_name)
      VALUES (?, ?, ?)
    `);
    
    members.forEach(member => {
      stmt.run([
        groupId,
        member.contact_number,
        member.contact_name || ''
      ]);
    });
    
    stmt.free();
    saveDatabase();
    return true;
  },

  // Listar membros de um grupo
  getByGroup: (groupId) => {
    const result = db.exec(`
      SELECT * FROM group_members 
      WHERE group_id = ?
      ORDER BY added_at DESC
    `, [groupId]);
    
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  },

  // Remover membro
  remove: (id) => {
    const stmt = db.prepare('DELETE FROM group_members WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    
    saveDatabase();
    return true;
  },

  // Atualizar status do membro
  updateStatus: (id, status) => {
    const stmt = db.prepare(`
      UPDATE group_members 
      SET status = ?
      WHERE id = ?
    `);
    stmt.run([status, id]);
    stmt.free();
    
    saveDatabase();
    return true;
  },

  // Registrar interação
  recordInteraction: (id) => {
    const stmt = db.prepare(`
      UPDATE group_members 
      SET last_interaction = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run([id]);
    stmt.free();
    
    saveDatabase();
    return true;
  }
};

// Funções para Mensagens de Grupo
export const groupMessages = {
  // Registrar envio de mensagem
  create: (groupId, message, stats) => {
    const stmt = db.prepare(`
      INSERT INTO group_messages (group_id, message, total_sent, total_delivered, total_failed)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run([
      groupId,
      message,
      stats.sent || 0,
      stats.delivered || 0,
      stats.failed || 0
    ]);
    stmt.free();
    
    saveDatabase();
    
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  },

  // Listar mensagens de um grupo
  getByGroup: (groupId) => {
    const result = db.exec(`
      SELECT * FROM group_messages 
      WHERE group_id = ?
      ORDER BY sent_at DESC
      LIMIT 50
    `, [groupId]);
    
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }
};


// Funções para Auto-Resposta
export const autoReplyRules = {
  // Criar nova regra
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO auto_reply_rules (name, keywords, response, match_type, priority)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run([
      data.name,
      data.keywords,
      data.response,
      data.match_type || 'contains',
      data.priority || 0
    ]);
    stmt.free();
    
    saveDatabase();
    
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  },

  // Listar todas as regras
  getAll: () => {
    const result = db.exec(`
      SELECT * FROM auto_reply_rules 
      ORDER BY priority DESC, created_at DESC
    `);
    
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  },

  // Listar regras ativas
  getActive: () => {
    const result = db.exec(`
      SELECT * FROM auto_reply_rules 
      WHERE enabled = 1
      ORDER BY priority DESC
    `);
    
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  },

  // Buscar por ID
  getById: (id) => {
    const result = db.exec('SELECT * FROM auto_reply_rules WHERE id = ?', [id]);
    
    if (result.length === 0) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = values[i];
    });
    return obj;
  },

  // Atualizar regra
  update: (id, data) => {
    const stmt = db.prepare(`
      UPDATE auto_reply_rules 
      SET name = ?, keywords = ?, response = ?, match_type = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run([
      data.name,
      data.keywords,
      data.response,
      data.match_type,
      data.priority,
      id
    ]);
    stmt.free();
    
    saveDatabase();
    return true;
  },

  // Ativar/desativar regra
  toggleEnabled: (id, enabled) => {
    const stmt = db.prepare(`
      UPDATE auto_reply_rules 
      SET enabled = ?
      WHERE id = ?
    `);
    stmt.run([enabled ? 1 : 0, id]);
    stmt.free();
    
    saveDatabase();
    return true;
  },

  // Deletar regra
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM auto_reply_rules WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    
    saveDatabase();
    return true;
  }
};

// Funções para Configurações de Auto-Resposta
export const autoReplySettings = {
  // Obter configurações
  get: () => {
    const result = db.exec('SELECT * FROM auto_reply_settings LIMIT 1');
    
    if (result.length === 0) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = values[i];
    });
    return obj;
  },

  // Atualizar configurações
  update: (data) => {
    const stmt = db.prepare(`
      UPDATE auto_reply_settings 
      SET enabled = ?, 
          only_outside_hours = ?, 
          start_hour = ?, 
          end_hour = ?, 
          weekend_enabled = ?,
          welcome_message = ?,
          away_message = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);
    stmt.run([
      data.enabled ? 1 : 0,
      data.only_outside_hours ? 1 : 0,
      data.start_hour,
      data.end_hour,
      data.weekend_enabled ? 1 : 0,
      data.welcome_message,
      data.away_message
    ]);
    stmt.free();
    
    saveDatabase();
    return true;
  }
};

// Funções para Logs de Auto-Resposta
export const autoReplyLogs = {
  // Criar log
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO auto_reply_logs (from_number, from_name, message_received, rule_id, response_sent)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run([
      data.from_number,
      data.from_name || null,
      data.message_received,
      data.rule_id || null,
      data.response_sent
    ]);
    stmt.free();
    
    saveDatabase();
    
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  },

  // Listar logs recentes
  getRecent: (limit = 50) => {
    const result = db.exec(`
      SELECT l.*, r.name as rule_name
      FROM auto_reply_logs l
      LEFT JOIN auto_reply_rules r ON l.rule_id = r.id
      ORDER BY l.timestamp DESC
      LIMIT ?
    `, [limit]);
    
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  },

  // Estatísticas
  getStats: () => {
    const today = new Date().toISOString().split('T')[0];
    
    const result = db.exec(`
      SELECT 
        COUNT(*) as total_today,
        COUNT(DISTINCT from_number) as unique_contacts
      FROM auto_reply_logs
      WHERE DATE(timestamp) = ?
    `, [today]);
    
    if (result.length === 0) return { total_today: 0, unique_contacts: 0 };
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = values[i];
    });
    return obj;
  }
};

// Funções para Blacklist
export const blacklist = {
  // Adicionar à blacklist
  add: (number, reason) => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO blacklist (number, reason)
      VALUES (?, ?)
    `);
    stmt.run([number, reason || '']);
    stmt.free();
    
    saveDatabase();
    return true;
  },

  // Remover da blacklist
  remove: (number) => {
    const stmt = db.prepare('DELETE FROM blacklist WHERE number = ?');
    stmt.run([number]);
    stmt.free();
    
    saveDatabase();
    return true;
  },

  // Verificar se está na blacklist
  isBlocked: (number) => {
    const result = db.exec('SELECT COUNT(*) as count FROM blacklist WHERE number = ?', [number]);
    return result.length > 0 && result[0].values[0][0] > 0;
  },

  // Listar todos
  getAll: () => {
    const result = db.exec('SELECT * FROM blacklist ORDER BY added_at DESC');
    
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }
};
