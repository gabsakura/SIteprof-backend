require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const kanbanRoutes = require('./routes/kanban');

const app = express();

// Lista de origens permitidas
const allowedOrigins = [
  'https://projeto-siteprofissional-anf3.onrender.com',
  'http://localhost:5173',
  'http://localhost:10000'
];

// Configuração CORS atualizada
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requisições sem origin (como Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Headers adicionais de segurança
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

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