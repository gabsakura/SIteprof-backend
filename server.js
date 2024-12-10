// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const initNewDb = require('./db/initNewDb');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração do CORS mais específica
app.use(cors({
  origin: 'http://localhost:5173', // URL do seu frontend Vite
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const db = new sqlite3.Database('./db/new_dashboard.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados.');
    initNewDb();
  }
});

// Rotas de autenticação devem vir antes das rotas da API
const authRoutes = require('./routes/auth')(db);
app.use('/auth', authRoutes);

const apiRoutes = require('./routes/api')(db);
app.use('/api', apiRoutes);

// Adicione esta linha para servir arquivos estáticos
app.use('/uploads', express.static('uploads'));

// Crie a pasta de uploads se não existir
const fs = require('fs');
const uploadDir = './uploads/profile-images';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
