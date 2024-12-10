const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');

module.exports = (db) => {
  // Boards
  router.get('/boards', verificarToken, (req, res) => {
    db.all('SELECT * FROM kanban_boards WHERE created_by = ?', [req.usuario.id], (err, boards) => {
      if (err) {
        console.error('Erro ao buscar quadros:', err);
        return res.status(500).json({ error: 'Erro ao buscar quadros' });
      }
      res.json({ boards });
    });
  });

  router.post('/boards', verificarToken, (req, res) => {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    db.run(
      'INSERT INTO kanban_boards (title, description, created_by) VALUES (?, ?, ?)',
      [title, description, req.usuario.id],
      function(err) {
        if (err) {
          console.error('Erro ao criar quadro:', err);
          return res.status(500).json({ error: 'Erro ao criar quadro' });
        }
        res.json({ id: this.lastID, title, description });
      }
    );
  });

  // Columns
  router.get('/boards/:boardId/columns', verificarToken, (req, res) => {
    db.all(
      'SELECT * FROM kanban_columns WHERE board_id = ? ORDER BY order_index',
      [req.params.boardId],
      (err, columns) => {
        if (err) {
          console.error('Erro ao buscar colunas:', err);
          return res.status(500).json({ error: 'Erro ao buscar colunas' });
        }
        res.json({ columns });
      }
    );
  });

  router.post('/boards/:boardId/columns', verificarToken, (req, res) => {
    const { title } = req.body;
    const boardId = req.params.boardId;

    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    db.get(
      'SELECT MAX(order_index) as maxOrder FROM kanban_columns WHERE board_id = ?',
      [boardId],
      (err, result) => {
        const newOrder = (result.maxOrder || 0) + 1;

        db.run(
          'INSERT INTO kanban_columns (board_id, title, order_index) VALUES (?, ?, ?)',
          [boardId, title, newOrder],
          function(err) {
            if (err) {
              console.error('Erro ao criar coluna:', err);
              return res.status(500).json({ error: 'Erro ao criar coluna' });
            }
            res.json({ id: this.lastID, title, order_index: newOrder });
          }
        );
      }
    );
  });

  // Cards
  router.get('/columns/:columnId/cards', verificarToken, (req, res) => {
    db.all(
      `SELECT * FROM kanban_cards WHERE column_id = ? ORDER BY order_index`,
      [req.params.columnId],
      (err, cards) => {
        if (err) {
          console.error('Erro ao buscar cartões:', err);
          return res.status(500).json({ error: 'Erro ao buscar cartões' });
        }
        res.json({ cards });
      }
    );
  });

  router.post('/columns/:columnId/cards', verificarToken, (req, res) => {
    const { title, description, priority, start_date, due_date } = req.body;
    const columnId = req.params.columnId;

    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    db.get(
      'SELECT MAX(order_index) as maxOrder FROM kanban_cards WHERE column_id = ?',
      [columnId],
      (err, result) => {
        const newOrder = (result.maxOrder || 0) + 1;

        db.run(
          `INSERT INTO kanban_cards (
            column_id, title, description, priority, 
            start_date, due_date, order_index
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [columnId, title, description, priority, start_date, due_date, newOrder],
          function(err) {
            if (err) {
              console.error('Erro ao criar cartão:', err);
              return res.status(500).json({ error: 'Erro ao criar cartão' });
            }
            res.json({
              id: this.lastID,
              column_id: columnId,
              title,
              description,
              priority,
              start_date,
              due_date,
              order_index: newOrder
            });
          }
        );
      }
    );
  });

  // Mover cartão
  router.put('/cards/:id/move', verificarToken, (req, res) => {
    const { id } = req.params;
    const { columnId, position } = req.body;

    db.run(
      'UPDATE kanban_cards SET column_id = ?, order_index = ? WHERE id = ?',
      [columnId, position, id],
      (err) => {
        if (err) {
          console.error('Erro ao mover cartão:', err);
          return res.status(500).json({ error: 'Erro ao mover cartão' });
        }
        res.json({ success: true });
      }
    );
  });

  // Atualizar cartão
  router.put('/cards/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { title, description, priority, start_date, due_date } = req.body;

    db.run(
      `UPDATE kanban_cards SET 
        title = ?, description = ?, priority = ?, 
        start_date = ?, due_date = ?
      WHERE id = ?`,
      [title, description, priority, start_date, due_date, id],
      (err) => {
        if (err) {
          console.error('Erro ao atualizar cartão:', err);
          return res.status(500).json({ error: 'Erro ao atualizar cartão' });
        }
        res.json({
          id,
          title,
          description,
          priority,
          start_date,
          due_date
        });
      }
    );
  });

  // Delete card
  router.delete('/cards/:id', verificarToken, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM kanban_cards WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Erro ao excluir cartão:', err);
        return res.status(500).json({ error: 'Erro ao excluir cartão' });
      }
      res.json({ success: true });
    });
  });

  // Delete column and its cards
  router.delete('/columns/:id', verificarToken, (req, res) => {
    const { id } = req.params;

    db.serialize(() => {
      db.run('DELETE FROM kanban_cards WHERE column_id = ?', [id], (err) => {
        if (err) {
          console.error('Erro ao excluir cartões da coluna:', err);
          return res.status(500).json({ error: 'Erro ao excluir cartões da coluna' });
        }
      });

      db.run('DELETE FROM kanban_columns WHERE id = ?', [id], (err) => {
        if (err) {
          console.error('Erro ao excluir coluna:', err);
          return res.status(500).json({ error: 'Erro ao excluir coluna' });
        }
        res.json({ success: true });
      });
    });
  });

  return router;
}; 