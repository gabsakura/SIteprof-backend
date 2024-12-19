require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const kanbanRoutes = require('./routes/kanban');

const app = express();

// Lista de origens permitidas
const allowedOrigins = [
  'http://localhost:5173',                                    // desenvolvimento local
  'https://projeto-siteprofissional-anf3.onrender.com',      // seu frontend em produção
  process.env.FRONTEND_URL                                    // URL do frontend das variáveis de ambiente
].filter(Boolean); // Remove valores undefined/null

// Configuração CORS mais detalhada
app.use(cors({
  origin: function(origin, callback) {
    // Permite requisições sem origin (como apps mobile ou ferramentas API)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para processar JSON
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/kanban', kanbanRoutes);

// Rota básica para teste
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 