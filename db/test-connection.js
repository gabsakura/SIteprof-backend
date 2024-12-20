require('dotenv').config();
const pool = require('../config/database');

async function testConnection() {
  try {
    console.log('Testando conexão com o banco...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    // Teste 1: Conexão básica
    const timeResult = await pool.query('SELECT NOW()');
    console.log('Conexão OK, hora do servidor:', timeResult.rows[0].now);

    // Teste 2: Verificar usuários
    const usersResult = await pool.query('SELECT id, nome, email, tipo FROM users');
    console.log('\nUsuários encontrados:', usersResult.rows);

    // Teste 3: Verificar dados financeiros
    const financialResult = await pool.query('SELECT * FROM financial_data');
    console.log('\nDados financeiros encontrados:', financialResult.rows);

    // Teste 4: Verificar inventário
    const inventoryResult = await pool.query('SELECT * FROM inventory');
    console.log('\nDados do inventário encontrados:', inventoryResult.rows);

    // Teste 5: Verificar cards do kanban
    const kanbanResult = await pool.query('SELECT * FROM kanban_cards');
    console.log('\nCards do kanban encontrados:', kanbanResult.rows);

  } catch (error) {
    console.error('Erro na conexão:', error);
  } finally {
    await pool.end();
  }
}

testConnection().catch(console.error); 