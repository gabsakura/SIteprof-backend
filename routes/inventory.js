const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const pool = require('../config/database');

module.exports = () => {
  // Obter todo o inventário
  router.get('/inventory', verificarToken, async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, name, quantity, price, created_at 
        FROM inventory 
        WHERE user_id = $1 
        ORDER BY name ASC
      `, [req.usuario.id]);

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar inventário:', error);
      res.status(500).json({ error: 'Erro ao buscar inventário' });
    }
  });

  // Adicionar item ao inventário
  router.post('/inventory', verificarToken, async (req, res) => {
    const { name, quantity, price } = req.body;
    try {
      const result = await pool.query(`
        INSERT INTO inventory (name, quantity, price, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [name, quantity, price, req.usuario.id]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      res.status(500).json({ error: 'Erro ao adicionar item ao inventário' });
    }
  });

  // Atualizar item do inventário
  router.put('/inventory/:id', verificarToken, async (req, res) => {
    const { name, quantity, price } = req.body;
    try {
      const result = await pool.query(`
        UPDATE inventory 
        SET name = $1, quantity = $2, price = $3
        WHERE id = $4 AND user_id = $5
        RETURNING *
      `, [name, quantity, price, req.params.id, req.usuario.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Item não encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      res.status(500).json({ error: 'Erro ao atualizar item do inventário' });
    }
  });

  // Deletar item do inventário
  router.delete('/inventory/:id', verificarToken, async (req, res) => {
    try {
      const result = await pool.query(`
        DELETE FROM inventory
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `, [req.params.id, req.usuario.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Item não encontrado' });
      }

      res.json({ message: 'Item removido com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      res.status(500).json({ error: 'Erro ao remover item do inventário' });
    }
  });

  // Buscar item específico
  router.get('/inventory/:id', verificarToken, async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, name, quantity, price, created_at
        FROM inventory
        WHERE id = $1 AND user_id = $2
      `, [req.params.id, req.usuario.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Item não encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar item:', error);
      res.status(500).json({ error: 'Erro ao buscar item do inventário' });
    }
  });

  return router;
}; 