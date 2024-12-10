// routes/api.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não está definido no arquivo .env');
  process.exit(1); // Encerra o servidor se a chave secreta não estiver definida
}

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: './uploads/profile-images/',
  filename: function(req, file, cb) {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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
    const { item, quantity = 1, descricao = '', preco = 0 } = req.body;
    
    if (!item || typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Dados inválidos para adicionar item' });
    }

    db.run(
      "INSERT INTO inventory (item, quantity, descricao, preco) VALUES (?, ?, ?, ?)",
      [item, quantity, descricao, preco],
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
    const { item, quantity, descricao, preco } = req.body;

    if (!item || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Dados inválidos para atualizar item' });
    }

    db.run(
      "UPDATE inventory SET item = ?, quantity = ?, descricao = ?, preco = ? WHERE id = ?",
      [item, quantity, descricao || '', preco || 0, id],
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

  // Rota para buscar todos os usuários (apenas admin)
  router.get('/users', verificarAdmin, (req, res) => {
    db.all('SELECT id, nome, email, tipo, verified FROM users', (err, rows) => {
      if (err) {
        console.error("Erro ao buscar usuários:", err);
        res.status(500).json({ error: 'Erro ao buscar usuários.' });
      } else {
        res.json({ users: rows });
      }
    });
  });

  // Rota para buscar dados de um usuário específico
  router.get('/users/:id', verificarToken, (req, res) => {
    // Verifica se o usuário está tentando acessar seus próprios dados ou é admin
    if (req.usuario.id !== parseInt(req.params.id) && req.usuario.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    db.get(
      'SELECT id, nome, email, tipo, verified FROM users WHERE id = ?',
      [req.params.id],
      (err, user) => {
        if (err) {
          console.error("Erro ao buscar usuário:", err);
          return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
        }
        if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ user });
      }
    );
  });

  // Rota para atualizar dados do perfil
  router.put('/users/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { nome, email, description } = req.body;

    // Validação dos campos obrigatórios
    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    // Verifica se o usuário está tentando atualizar seus próprios dados ou é admin
    if (req.usuario.id !== parseInt(id) && req.usuario.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    // Verifica se o email já existe (exceto para o próprio usuário)
    db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, id], (err, existingUser) => {
      if (err) {
        console.error("Erro ao verificar email:", err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }

      // Atualiza os dados do usuário incluindo a descrição
      db.run(
        'UPDATE users SET nome = ?, email = ?, description = ? WHERE id = ?',
        [nome.trim(), email.trim(), description || null, id],
        function(err) {
          if (err) {
            console.error("Erro ao atualizar usuário:", err);
            return res.status(500).json({ error: 'Erro ao atualizar perfil' });
          }

          // Retorna os dados atualizados
          db.get(
            'SELECT id, nome, email, tipo, verified, description, profile_image_path FROM users WHERE id = ?',
            [id],
            (err, user) => {
              if (err) {
                console.error("Erro ao buscar usuário atualizado:", err);
                return res.status(500).json({ error: 'Erro ao retornar dados atualizados' });
              }
              res.json({ user });
            }
          );
        }
      );
    });
  });

  // Rota para atualizar senha
  router.put('/users/:id/password', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Verifica se o usuário está tentando atualizar sua própria senha
    if (req.usuario.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    try {
      // Busca o usuário para verificar a senha atual
      db.get('SELECT password FROM users WHERE id = ?', [id], async (err, user) => {
        if (err) {
          console.error("Erro ao buscar usuário:", err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }

        // Verifica se a senha atual está correta
        const senhaValida = await bcrypt.compare(currentPassword, user.password);
        if (!senhaValida) {
          return res.status(401).json({ error: 'Senha atual incorreta' });
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Atualiza a senha
        db.run(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, id],
          function(err) {
            if (err) {
              console.error("Erro ao atualizar senha:", err);
              return res.status(500).json({ error: 'Erro ao atualizar senha' });
            }
            res.json({ message: 'Senha atualizada com sucesso' });
          }
        );
      });
    } catch (error) {
      console.error("Erro ao processar senha:", error);
      res.status(500).json({ error: 'Erro ao processar senha' });
    }
  });

  // Rota para upload da imagem
  router.post('/profile/image', upload.single('profileImage'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    const imagePath = '/uploads/profile-images/' + req.file.filename;

    db.run(
      'UPDATE users SET profile_image_path = ? WHERE id = ?',
      [imagePath, req.usuario.id],
      function(err) {
        if (err) {
          console.error("Erro ao salvar caminho da imagem:", err);
          return res.status(500).json({ error: 'Erro ao salvar imagem' });
        }
        res.json({ 
          success: true, 
          imagePath: imagePath 
        });
      }
    );
  });

  // Adicionar rota para buscar imagem de perfil
  router.get('/profile/image/:id', (req, res) => {
    const { id } = req.params;
    
    db.get(
      'SELECT profile_image_path FROM users WHERE id = ?',
      [id],
      (err, user) => {
        if (err) {
          console.error("Erro ao buscar imagem:", err);
          return res.status(500).json({ error: 'Erro ao buscar imagem' });
        }
        if (!user || !user.profile_image_path) {
          return res.status(404).json({ error: 'Imagem não encontrada' });
        }
        res.json({ imagePath: user.profile_image_path });
      }
    );
  });

  return router;
};