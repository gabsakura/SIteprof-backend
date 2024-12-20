const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não está definido no arquivo .env');
  process.exit(1);
}

module.exports = () => {
  // Rota de login
  router.post('/login', async (req, res) => {
    console.log('Login attempt:', {
      body: req.body,
      headers: req.headers,
      url: req.url
    });
    
    const { email, password } = req.body;

    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      const user = result.rows[0];
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, tipo: user.tipo }, 
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rota para verificar admin
  router.get('/verify-admin', verificarToken, (req, res) => {
    res.json({ isAdmin: req.usuario.tipo === 'admin' });
  });

  // Rota para registro (protegida)
  router.post('/users/register', verificarToken, verificarAdmin, async (req, res) => {
    const { nome, email, password, tipo = 'user', verified = true } = req.body;

    try {
      // Verificar email único
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Inserir usuário
      await pool.query(
        'INSERT INTO users (nome, email, password, tipo, verified) VALUES ($1, $2, $3, $4, $5)',
        [nome, email, hashedPassword, tipo, verified]
      );

      res.json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  });

  return router;
};
