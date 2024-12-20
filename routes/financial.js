const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const pool = require('../config/database');

module.exports = () => {
  // Rota para dados financeiros
  router.get('/financial_data', verificarToken, async (req, res) => {
    try {
      // Buscar dados financeiros do usuário
      const result = await pool.query(`
        SELECT type, value, date 
        FROM financial_data 
        WHERE user_id = $1 
        ORDER BY date DESC
      `, [req.usuario.id]);

      // Organizar dados por tipo
      const financialData = {
        totalCash: [],
        customers: [],
        profit: [],
        sales: [],
        expenses: [],
        newCustomers: []
      };

      // Agrupar dados por tipo
      result.rows.forEach(row => {
        if (financialData[row.type]) {
          financialData[row.type].push({
            date: row.date,
            value: parseFloat(row.value)
          });
        }
      });

      res.json(financialData);
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      res.status(500).json({ error: 'Erro ao buscar dados financeiros' });
    }
  });

  // Adicionar novo dado financeiro
  router.post('/financial_data', verificarToken, async (req, res) => {
    const { type, value, date } = req.body;
    try {
      const result = await pool.query(`
        INSERT INTO financial_data (type, value, date, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [type, value, date, req.usuario.id]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao adicionar dado financeiro:', error);
      res.status(500).json({ error: 'Erro ao adicionar dado financeiro' });
    }
  });

  // Atualizar dado financeiro
  router.put('/financial_data/:id', verificarToken, async (req, res) => {
    const { type, value, date } = req.body;
    try {
      const result = await pool.query(`
        UPDATE financial_data 
        SET type = $1, value = $2, date = $3
        WHERE id = $4 AND user_id = $5
        RETURNING *
      `, [type, value, date, req.params.id, req.usuario.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Dado não encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar dado financeiro:', error);
      res.status(500).json({ error: 'Erro ao atualizar dado financeiro' });
    }
  });

  // Deletar dado financeiro
  router.delete('/financial_data/:id', verificarToken, async (req, res) => {
    try {
      const result = await pool.query(`
        DELETE FROM financial_data
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `, [req.params.id, req.usuario.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Dado não encontrado' });
      }

      res.json({ message: 'Dado removido com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar dado financeiro:', error);
      res.status(500).json({ error: 'Erro ao remover dado financeiro' });
    }
  });

  return router;
}; 