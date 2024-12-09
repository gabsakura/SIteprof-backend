// routes/api.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não está definido no arquivo .env');
  process.exit(1); // Encerra o servidor se a chave secreta não estiver definida
}

module.exports = (db) => {
  // Rota de login (não precisa de autenticação)
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      // Busca o usuário pelo email
      db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
          console.error('Erro ao buscar usuário:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Verifica a senha
        const senhaValida = await bcrypt.compare(password, user.password);
        if (!senhaValida) {
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Gera o token JWT
        const token = jwt.sign(
          { 
            id: user.id,
            email: user.email,
            tipo: user.tipo
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Retorna o token e os dados do usuário
        res.json({
          token,
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            tipo: user.tipo
          }
        });
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rota para verificar se é admin
  router.get('/verify-admin', verificarToken, (req, res) => {
    res.json({ isAdmin: req.usuario.tipo === 'admin' });
  });

  // Todas as rotas abaixo deste middleware requerem autenticação
  router.use(verificarToken);

  // Rota para buscar dados financeiros
  router.get('/financial_data', (req, res) => {
    db.all('SELECT * FROM financial_data', (err, rows) => {
      if (err) {
        console.error("Erro ao buscar dados financeiros:", err);
        res.status(500).json({ error: 'Erro ao buscar dados financeiros.' });
      } else {
        res.json({ data: rows });
      }
    });
  });

  // Rota para buscar todos os itens no inventário
  router.get('/inventory', (req, res) => {
    db.all('SELECT * FROM inventory', (err, rows) => {
      if (err) {
        console.error("Erro ao buscar dados de inventário:", err);
        res.status(500).json({ error: 'Erro ao buscar dados de inventário.' });
      } else {
        res.json({ data: rows });
      }
    });
  });

  // Rota para adicionar um item ao inventário
  router.post('/inventory', (req, res) => {
    const { item, quantity = 1, descricao = '', preco = 0, balance = 0 } = req.body;
    
    if (!item || typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Dados inválidos para adicionar item' });
    }

    db.run(
      "INSERT INTO inventory (item, quantity, descricao, preco, balance) VALUES (?, ?, ?, ?, ?)",
      [item, quantity, descricao, preco, balance],
      function(err) {
        if (err) {
          console.error('Erro ao adicionar item ao inventário:', err.message);
          res.status(500).json({ error: err.message });
        } else {
          res.json({ id: this.lastID });
        }
      }
    );
  });

  // Rota para atualizar item do inventário
  router.put('/inventory/:id', (req, res) => {
    const { id } = req.params;
    const { item, quantity, descricao, preco, balance } = req.body;

    if (!item || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Dados inválidos para atualizar item' });
    }

    db.run(
      "UPDATE inventory SET item = ?, quantity = ?, descricao = ?, preco = ?, balance = ? WHERE id = ?",
      [item, quantity, descricao || '', preco || 0, balance || 0, id],
      function(err) {
        if (err) {
          console.error('Erro ao atualizar item:', err.message);
          return res.status(500).json({ error: 'Erro ao atualizar item' });
        }
        res.json({ message: 'Item atualizado com sucesso!' });
      }
    );
  });

  // Rota protegida para registro de usuários (apenas admin)
  router.post('/users/register', verificarAdmin, async (req, res) => {
    const { nome, email, password, tipo, verified } = req.body;

    // Verificar se o email já existe
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao verificar email' });
      }
      if (user) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      try {
        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserir novo usuário
        db.run(
          'INSERT INTO users (nome, email, password, tipo, verified) VALUES (?, ?, ?, ?, ?)',
          [nome, email, hashedPassword, tipo || 'user', verified || true],
          function(err) {
            if (err) {
              console.error('Erro ao criar usuário:', err);
              return res.status(500).json({ error: 'Erro ao criar usuário' });
            }
            res.json({ message: 'Usuário criado com sucesso', id: this.lastID });
          }
        );
      } catch (error) {
        console.error('Erro ao criar hash da senha:', error);
        res.status(500).json({ error: 'Erro ao processar senha' });
      }
    });
  });

  // Rota para deletar item do inventário
  router.delete('/inventory/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM inventory WHERE id = ?", [id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Item deletado com sucesso!' });
    });
  });

  return router;
};