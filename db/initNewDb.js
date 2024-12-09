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
        tipo TEXT CHECK(tipo IN ('admin', 'user')) DEFAULT 'user',
        verified BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  });
};

module.exports = initNewDb;
