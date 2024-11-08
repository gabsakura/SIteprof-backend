// db/initNewDb.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/new_dashboard.db');

const initNewDb = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        verified INTEGER DEFAULT 0
      )
    `);

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
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item TEXT,
        quantity INTEGER
      )
    `);
  });
};

module.exports = initNewDb;
