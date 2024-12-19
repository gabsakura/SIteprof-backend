require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const kanbanRoutes = require('./routes/kanban');

const app = express();

// Lista de origens permitidas
const allowedOrigins = [
  'http://localhost:5173',
  'https://projeto-siteprofissional-anf3.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

// Configuração CORS mais detalhada
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para processar JSON
app.use(express.json());

// Rotas com prefixo /api
app.use('/api/auth', authRoutes);
app.use('/api/kanban', kanbanRoutes);

// Rota básica para teste
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 