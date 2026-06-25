const pool = require('../config/db');

const getAllTasks = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des tâches' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Le titre est requis' });
    }

    const result = await pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur lors de la création de la tâche' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    if (title === undefined && completed === undefined) {
      return res.status(400).json({ error: 'Au moins un champ (title ou completed) est requis' });
    }

    if (title !== undefined && title.trim() === '') {
      return res.status(400).json({ error: 'Le titre ne peut pas être vide' });
    }

    const result = await pool.query(
      'UPDATE tasks SET title = COALESCE($1, title), completed = COALESCE($2, completed) WHERE id = $3 RETURNING *',
      [title || null, completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de la tâche' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de la tâche' });
  }
};

module.exports = { getAllTasks, createTask, updateTask, deleteTask };
