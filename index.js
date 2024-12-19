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

// Configuração do CORS
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requisições sem origem (como apps mobile ou postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origem bloqueada:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false
}));

// Pre-flight requests
app.options('*', cors());

// Middleware para processar JSON
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/kanban', kanbanRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running',
    allowedOrigins: allowedOrigins 
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Allowed origins:', allowedOrigins);
}); 