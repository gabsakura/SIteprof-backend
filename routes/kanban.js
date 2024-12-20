const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const pool = require('../config/database');

module.exports = () => {
  // Obter todos os cards
  router.get('/', verificarToken, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM kanban_cards WHERE user_id = $1 ORDER BY created_at DESC',
        [req.usuario.id]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar cards:', error);
      res.status(500).json({ error: 'Erro ao buscar cards' });
    }
  });

  // Obter colunas do quadro
  router.get('/boards/:boardId/columns', verificarToken, async (req, res) => {
    try {
      // Retornar colunas padrão do kanban
      const columns = [
        {
          id: 'todo',
          title: 'A Fazer',
          cards: []
        },
        {
          id: 'doing',
          title: 'Em Andamento',
          cards: []
        },
        {
          id: 'done',
          title: 'Concluído',
          cards: []
        }
      ];

      // Buscar cards do usuário
      const result = await pool.query(
        'SELECT * FROM kanban_cards WHERE user_id = $1 ORDER BY created_at DESC',
        [req.usuario.id]
      );

      // Distribuir cards nas colunas
      result.rows.forEach(card => {
        const column = columns.find(col => col.id === card.status);
        if (column) {
          column.cards.push({
            id: card.id,
            title: card.title,
            description: card.description,
            status: card.status
          });
        }
      });

      res.json(columns);
    } catch (error) {
      console.error('Erro ao buscar colunas:', error);
      res.status(500).json({ error: 'Erro ao buscar colunas' });
    }
  });

  // Criar novo card
  router.post('/', verificarToken, async (req, res) => {
    const { title, description, status } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO kanban_cards (title, description, status, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, description, status, req.usuario.id]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar card:', error);
      res.status(500).json({ error: 'Erro ao criar card' });
    }
  });

  // Atualizar card
  router.put('/:id', verificarToken, async (req, res) => {
    const { title, description, status } = req.body;
    try {
      const result = await pool.query(
        'UPDATE kanban_cards SET title = $1, description = $2, status = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
        [title, description, status, req.params.id, req.usuario.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar card:', error);
      res.status(500).json({ error: 'Erro ao atualizar card' });
    }
  });

  // Deletar card
  router.delete('/:id', verificarToken, async (req, res) => {
    try {
      const result = await pool.query(
        'DELETE FROM kanban_cards WHERE id = $1 AND user_id = $2 RETURNING *',
        [req.params.id, req.usuario.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }
      res.json({ message: 'Card deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar card:', error);
      res.status(500).json({ error: 'Erro ao deletar card' });
    }
  });

  return router;
}; 