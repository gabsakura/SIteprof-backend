// server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const initNewDb = require('./db/initNewDb');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

const db = new sqlite3.Database('./db/new_dashboard.db', (err) => {
  if (err) console.error('Erro ao conectar ao banco de dados:', err);
  else {
    console.log('Conectado ao banco de dados.');
    initNewDb();
  }
});

app.use(cors());
app.use(express.json());

const apiRoutes = require('./routes/api')(db);
const authRoutes = require('./routes/auth')(db);
app.use('/auth', authRoutes); // Adiciona rotas de autenticação
app.use('/api', authMiddleware, apiRoutes); // Protege as rotas da API com middleware

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
