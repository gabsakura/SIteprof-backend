// routes/api.js
const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Rota para buscar dados financeiros com filtro de datas
  router.get('/financial_data', (req, res) => {
    const { startDate, endDate } = req.query;
    let query = "SELECT * FROM financial_data WHERE 1=1";
    const params = [];

    if (startDate) {
      query += ` AND timestamp >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND timestamp <= ?`;
      params.push(endDate);
    }

    db.all(query, params, (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ data: rows });
    });
  });
  
  // Rota para buscar todos os itens no inventário
  router.get('/inventory', (req, res) => {
    db.all("SELECT * FROM inventory", (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ data: rows });
    });
  });

  // Rota para adicionar um item ao inventário
  router.post('/inventory', (req, res) => {
    const { item, quantity = 1 } = req.body;
    db.run("INSERT INTO inventory (item, quantity) VALUES (?, ?)", [item, quantity], function(err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ id: this.lastID });
    });
  });

  // Rota para atualizar a quantidade de um item específico no inventário
  router.put('/inventory/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Quantidade inválida' });
    }

    const query = `UPDATE inventory SET quantity = ? WHERE id = ?`;
    db.run(query, [quantity, id], function(err) {
      if (err) {
        console.error('Erro ao atualizar quantidade de item:', err.message);
        return res.status(500).json({ error: 'Erro ao atualizar quantidade de item' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Item não encontrado' });
      }

      res.status(200).json({ message: 'Quantidade atualizada com sucesso!' });
    });
  });
  
  return router;
};