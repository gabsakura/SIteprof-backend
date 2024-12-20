require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const kanbanRoutes = require('./routes/kanban');

const app = express();

// Configuração CORS simplificada
app.use(cors({
  origin: 'https://projeto-siteprofissional-anf3.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/kanban', kanbanRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running'
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 