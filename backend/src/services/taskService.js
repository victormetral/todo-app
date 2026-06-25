const pool = require('../config/db');

const getAllTasks = async () => {
  const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
  return result.rows;
};

const createTask = async (title) => {
  if (!title || title.trim() === '') {
    throw { status: 400, message: 'Le titre est requis' };
  }
  const result = await pool.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title]
  );
  return result.rows[0];
};

const updateTask = async (id, title, completed) => {
  if (!id || isNaN(id)) {
    throw { status: 400, message: 'ID invalide' };
  }
  if (title === undefined && completed === undefined) {
    throw { status: 400, message: 'Au moins un champ (title ou completed) est requis' };
  }
  if (title !== undefined && title.trim() === '') {
    throw { status: 400, message: 'Le titre ne peut pas être vide' };
  }
  const result = await pool.query(
    'UPDATE tasks SET title = COALESCE($1, title), completed = COALESCE($2, completed) WHERE id = $3 RETURNING *',
    [title || null, completed, id]
  );
  if (result.rows.length === 0) {
    throw { status: 404, message: 'Tâche non trouvée' };
  }
  return result.rows[0];
};

const deleteTask = async (id) => {
  if (!id || isNaN(id)) {
    throw { status: 400, message: 'ID invalide' };
  }
  const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    throw { status: 404, message: 'Tâche non trouvée' };
  }
};

module.exports = { getAllTasks, createTask, updateTask, deleteTask };
