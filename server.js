// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const kanbanRoutes = require('./routes/kanban');

const app = express();

// Lista de origens permitidas
const allowedOrigins = [
  'https://projeto-siteprofissional-oorv.onrender.com',  // sua URL atual
  'https://projeto-siteprofissional-anf3.onrender.com',  // URL alternativa
  process.env.FRONTEND_URL
].filter(Boolean);

// Middleware para CORS
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sem origin (como Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Origem bloqueada:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes());
app.use('/api/kanban', kanbanRoutes());

// Rota de teste para verificar se a API está funcionando
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is running',
    allowedOrigins,
    routes: {
      login: '/api/auth/login',
      kanban: '/api/kanban'
    }
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Allowed origins:', allowedOrigins);
});
