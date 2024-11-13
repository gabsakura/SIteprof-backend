const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

module.exports = (db) => {
  router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
  
    db.run(query, [username, email, hashedPassword], function (err) {
      if (err) {
        console.error('Erro ao registrar usuário:', err.message);
        return res.status(400).json({ message: 'Usuário já existe' });
      }
      const verificationCode = Math.floor(100000 + Math.random() * 900000);
      sendVerificationEmail(email, verificationCode)
        .then(() => {
          res.status(200).json({ message: 'Verifique seu email para confirmação.' });
        })
        .catch((err) => {
          console.error("Erro ao enviar email:", err);
          res.status(500).json({ message: 'Erro ao enviar email de verificação.' });
        });
    });
  });
  
  router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err || !user || !await bcrypt.compare(password, user.password)) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    });
  });

  return router;
};
