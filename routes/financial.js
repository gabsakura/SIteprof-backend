const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const pool = require('../config/database');

module.exports = () => {
  // Rota para dados financeiros
  router.get('/financial_data', verificarToken, async (req, res) => {
    try {
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

  return router;
}; 