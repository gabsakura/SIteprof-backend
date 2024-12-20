require('dotenv').config();
const pool = require('../config/database');
const bcrypt = require('bcrypt');

async function initPostgres() {
  try {
    console.log('Tentando conectar ao banco...');
    
    // Testar conexão
    await pool.query('SELECT NOW()');
    console.log('Conexão estabelecida com sucesso');

    // Dropar tabelas se existirem
    await pool.query(`
      DROP TABLE IF EXISTS kanban_cards CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    console.log('Tabelas antigas removidas');

    // Criar tabelas
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        tipo VARCHAR(50) DEFAULT 'user',
        verified BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE kanban_cards (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE financial_data (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tabelas criadas com sucesso');

    // Criar usuário admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (nome, email, password, tipo, verified)
      VALUES ($1, $2, $3, $4, $5)
    `, ['Admin', 'admin@example.com', adminPassword, 'admin', true]);

    console.log('Usuário admin criado com sucesso');
    console.log('Banco de dados PostgreSQL inicializado com sucesso!');

  } catch (error) {
    console.error('Erro detalhado:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executar inicialização
initPostgres()
  .then(() => {
    console.log('Processo finalizado com sucesso');
    process.exit(0);
  })
  .catch(error => {
    console.error('Falha na inicialização:', error);
    process.exit(1);
  }); 