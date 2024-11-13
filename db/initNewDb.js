// db/initNewDb.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/new_dashboard.db');

const initNewDb = () => {
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
        quantity INTEGER
      )
    `, (err) => {
      if (err) console.error("Erro ao criar tabela inventory:", err.message);
    });
  });
};

module.exports = initNewDb;
