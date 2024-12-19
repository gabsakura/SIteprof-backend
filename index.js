require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const kanbanRoutes = require('./routes/kanban');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

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