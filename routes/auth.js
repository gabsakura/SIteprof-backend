const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não está definido no arquivo .env');
  process.exit(1);
}

module.exports = (db) => {
  // Rota de login
  router.post('/login', async (req, res) => {
    console.log('Login attempt:', {
      body: req.body,
      headers: req.headers
    });
    
    const { email, password } = req.body;

    try {
      // 1. Verify if email exists
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // 2. Compare password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // 3. Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          tipo: user.tipo 
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // 4. Send response
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
    const { nome, email, password, tipo, verified } = req.body;

    try {
      // Verificar email único
      const existingUser = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Inserir usuário
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (nome, email, password, tipo, verified) VALUES (?, ?, ?, ?, ?)',
          [nome, email, hashedPassword, tipo || 'user', verified || true],
          function(err) {
            if (err) reject(err);
            resolve(this.lastID);
          }
        );
      });

      res.json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  });

  return router;
};
