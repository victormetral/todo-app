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
  const { title } = req.body;
  const result = await pool.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title]
  );
  res.status(201).json(result.rows[0]);
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const result = await pool.query(
    'UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
    [title, completed, id]
  );
  res.json(result.rows[0]);
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  res.status(204).send();
};

module.exports = { getAllTasks, createTask, updateTask, deleteTask };
