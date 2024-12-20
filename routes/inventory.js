const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const pool = require('../config/database');

module.exports = () => {
  // Rota para inventário
  router.get('/inventory', verificarToken, async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, name, quantity, price 
        FROM inventory 
        WHERE user_id = $1 
        ORDER BY name
      `, [req.usuario.id]);

      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar inventário:', error);
      res.status(500).json({ error: 'Erro ao buscar inventário' });
    }
  });

  return router;
}; 