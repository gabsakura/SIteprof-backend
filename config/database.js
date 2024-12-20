const { Pool } = require('pg');

const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require'
  },
  connectionTimeoutMillis: 5000,
  query_timeout: 10000
};

console.log('Configuração do banco:', {
  ...config,
  connectionString: config.connectionString?.substring(0, 30) + '...' // Log parcial por segurança
});

const pool = new Pool(config);

pool.on('connect', () => {
  console.log('Nova conexão estabelecida com o PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Erro inesperado no PostgreSQL:', err);
});

module.exports = pool; 