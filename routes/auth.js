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
    try {
      console.log('Tentativa de login:', {
        email: req.body.email,
        headers: req.headers
      });

      const { email, password } = req.body;

      // Verificar se o email foi fornecido
      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      // Buscar usuário
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      console.log('Resultado da busca:', result.rows);

      const user = result.rows[0];
      if (!user) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      // Gerar token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          tipo: user.tipo 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Resposta de sucesso
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
      console.error('Erro detalhado no login:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Rota para verificar admin
  router.get('/verify-admin', verificarToken, (req, res) => {
    res.json({ isAdmin: req.usuario.tipo === 'admin' });
  });

  // Rota para registro (protegida)
  router.post('/users/register', verificarToken, verificarAdmin, async (req, res) => {
    try {
      const { nome, email, password, tipo = 'user', verified = true } = req.body;

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
      const result = await pool.query(
        'INSERT INTO users (nome, email, password, tipo, verified) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, tipo',
        [nome, email, hashedPassword, tipo, verified]
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  });

  // Rota para buscar usuário por ID
  router.get('/users/:id', verificarToken, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, nome, email, tipo FROM users WHERE id = $1',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  });

  return router;
};
