// routes/api.js
const express = require('express');
const router = express.Router();

module.exports = (db) => {
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
    const { item, quantity = 1 } = req.body;
    if (!item || typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Dados inválidos para adicionar item' });
    }
    db.run("INSERT INTO inventory (item, quantity) VALUES (?, ?)", [item, quantity], function(err) {
      if (err) {
        console.error('Erro ao adicionar item ao inventário:', err.message);
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID });
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

  // Rota para atualizar quantidade do item
  router.put('/inventory/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    db.run("UPDATE inventory SET quantity = ? WHERE id = ?", [quantity, id], function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar quantidade de item' });
      res.json({ message: 'Quantidade atualizada com sucesso!' });
    });
  });

  return router;
};
