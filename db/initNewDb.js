// db/initNewDb.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/new_dashboard.db');
const bcrypt = require('bcrypt');

const initNewDb = async () => {
  const adminPassword = await bcrypt.hash('admin123', 10); // Senha padrão: admin123

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS financial_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        total_money INTEGER,
        profit INTEGER,
        sales INTEGER,
        expenses INTEGER,
        new_customers INTEGER,
        inventory INTEGER
      )
    `, (err) => {
      if (err) console.error("Erro ao criar tabela financial_data:", err.message);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item TEXT,
        quantity INTEGER,
        descricao TEXT,
        preco DECIMAL(10,2),
        balance DECIMAL(10,3)
      )
    `, (err) => {
      if (err) console.error("Erro ao criar tabela inventory:", err.message);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        tipo TEXT DEFAULT 'user',
        verified BOOLEAN DEFAULT true,
        profile_image_path TEXT,
        description TEXT
      )
    `, (err) => {
      if (err) console.error("Erro ao criar tabela users:", err.message);
    });

    // Criar usuário admin
    db.run(`
      INSERT OR IGNORE INTO users (nome, email, password, tipo, verified)
      VALUES ('Admin', 'admin@example.com', ?, 'admin', true)
    `, [adminPassword], (err) => {
      if (err) console.error("Erro ao criar usuário admin:", err.message);
      else console.log("Usuário admin criado com sucesso!");
    });

    // Verificar tabelas existentes
    db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name IN ('kanban_boards', 'kanban_columns', 'kanban_cards')
    `, [], (err, tables) => {
      if (err) {
        console.error('Erro ao verificar tabelas:', err);
        return;
      }
      console.log('Tabelas existentes:', tables.map(t => t.name));
    });

    // Kanban Boards Table
    db.run(`
      CREATE TABLE IF NOT EXISTS kanban_boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error("Erro ao criar tabela kanban_boards:", err.message);
      else console.log("Tabela kanban_boards criada/verificada com sucesso!");
    });

    // Kanban Columns Table
    db.run(`
      CREATE TABLE IF NOT EXISTS kanban_columns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board_id INTEGER,
        title TEXT NOT NULL,
        order_index INTEGER,
        FOREIGN KEY (board_id) REFERENCES kanban_boards(id)
      )
    `, (err) => {
      if (err) console.error("Erro ao criar tabela kanban_columns:", err.message);
      else console.log("Tabela kanban_columns criada/verificada com sucesso!");
    });

    // Kanban Cards Table
    db.run(`
      CREATE TABLE IF NOT EXISTS kanban_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        column_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        start_date DATETIME,
        due_date DATETIME,
        assigned_to INTEGER,
        order_index INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (column_id) REFERENCES kanban_columns(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error("Erro ao criar tabela kanban_cards:", err.message);
      else console.log("Tabela kanban_cards criada/verificada com sucesso!");
    });

    // Card Labels Table
    db.run(`
      CREATE TABLE IF NOT EXISTS card_labels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        FOREIGN KEY (card_id) REFERENCES kanban_cards(id)
      )
    `, (err) => {
      if (err) console.error("Erro ao criar tabela card_labels:", err.message);
      else console.log("Tabela card_labels criada/verificada com sucesso!");
    });

    // Criar quadro inicial se não existir
    db.get('SELECT id FROM kanban_boards WHERE id = 1', [], (err, board) => {
      if (!board) {
        db.serialize(() => {
          // Cria o quadro
          db.run(
            'INSERT INTO kanban_boards (title, created_by) VALUES (?, ?)',
            ['Quadro Principal', 1],
            function(err) {
              if (err) {
                console.error('Erro ao criar quadro inicial:', err);
                return;
              }
              const boardId = this.lastID;

              // Cria as colunas iniciais
              const columns = [
                ['A Fazer', 0],
                ['Em Progresso', 1],
                ['Concluído', 2]
              ];

              columns.forEach(([title, order]) => {
                db.run(
                  'INSERT INTO kanban_columns (board_id, title, order_index) VALUES (?, ?, ?)',
                  [boardId, title, order],
                  (err) => {
                    if (err) console.error('Erro ao criar coluna:', err);
                    else console.log(`Coluna "${title}" criada com sucesso!`);
                  }
                );
              });
              console.log('Quadro inicial criado com sucesso!');
            }
          );
        });
      }
    });
  });
};

module.exports = initNewDb;
