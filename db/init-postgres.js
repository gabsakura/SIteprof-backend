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
      DROP TABLE IF EXISTS financial_data CASCADE;
      DROP TABLE IF EXISTS inventory CASCADE;
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
    const userResult = await pool.query(`
      INSERT INTO users (nome, email, password, tipo, verified)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, ['Admin', 'admin@example.com', adminPassword, 'admin', true]);

    const userId = userResult.rows[0].id;
    console.log('Usuário admin criado com sucesso, ID:', userId);

    // Adicionar dados financeiros
    await pool.query(`
      INSERT INTO financial_data (user_id, type, value, date) VALUES
      ($1, 'totalCash', 10000, '2024-01-01'),
      ($1, 'totalCash', 15000, '2024-02-01'),
      ($1, 'totalCash', 20000, '2024-03-01'),
      ($1, 'customers', 50, '2024-01-01'),
      ($1, 'customers', 75, '2024-02-01'),
      ($1, 'customers', 100, '2024-03-01'),
      ($1, 'profit', 5000, '2024-01-01'),
      ($1, 'profit', 7500, '2024-02-01'),
      ($1, 'profit', 10000, '2024-03-01'),
      ($1, 'sales', 20000, '2024-01-01'),
      ($1, 'sales', 25000, '2024-02-01'),
      ($1, 'sales', 30000, '2024-03-01'),
      ($1, 'expenses', 15000, '2024-01-01'),
      ($1, 'expenses', 17500, '2024-02-01'),
      ($1, 'expenses', 20000, '2024-03-01'),
      ($1, 'newCustomers', 10, '2024-01-01'),
      ($1, 'newCustomers', 15, '2024-02-01'),
      ($1, 'newCustomers', 20, '2024-03-01')
    `, [userId]);

    console.log('Dados financeiros iniciais criados');

    // Após adicionar os dados financeiros, adicione dados de inventário
    await pool.query(`
      INSERT INTO inventory (name, quantity, price, user_id) VALUES
      ('Produto 1', 100, 50.00, $1),
      ('Produto 2', 150, 75.00, $1),
      ('Produto 3', 200, 100.00, $1)
    `, [userId]);

    console.log('Dados de inventário criados');

    // Adicionar alguns cards do kanban
    await pool.query(`
      INSERT INTO kanban_cards (title, description, status, user_id) VALUES
      ('Tarefa 1', 'Descrição da tarefa 1', 'todo', $1),
      ('Tarefa 2', 'Descrição da tarefa 2', 'doing', $1),
      ('Tarefa 3', 'Descrição da tarefa 3', 'done', $1)
    `, [userId]);

    console.log('Cards do kanban criados');

    console.log('Banco de dados PostgreSQL inicializado com sucesso!');

  } catch (error) {
    console.error('Erro detalhado:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

initPostgres()
  .then(() => {
    console.log('Processo finalizado com sucesso');
    process.exit(0);
  })
  .catch(error => {
    console.error('Falha na inicialização:', error);
    process.exit(1);
  });
