// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendVerificationEmail } = require('../utils/mailer');
const router = express.Router();

module.exports = (db) => {
  router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    
    db.run(query, [username, email, hashedPassword], function (err) {
      if (err) return res.status(400).json({ message: 'Usuário já existe' });
      
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      sendVerificationEmail(email, verificationCode); // Envia o código de verificação por email
      res.status(200).json({ message: 'Verifique seu email para confirmação.' });
    });
  });

  router.post('/verify', (req, res) => {
    const { email, code } = req.body;
    if (code === verificationCode) {
      db.run(`UPDATE users SET verified = 1 WHERE email = ?`, [email], function(err) {
        if (err) return res.status(500).json({ message: 'Erro ao verificar o usuário' });
        res.status(200).json({ message: 'Usuário verificado com sucesso' });
      });
    } else {
      res.status(400).json({ message: 'Código de verificação inválido' });
    }
  });

  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
      if (err || !user || !await bcrypt.compare(password, user.password)) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
      }
      if (!user.verified) return res.status(403).json({ message: 'Email não verificado' });

      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    });
  });

  return router;
};
