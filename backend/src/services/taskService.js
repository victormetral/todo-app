const pool = require('../config/db');

const VALID_PRIORITIES = ['low', 'medium', 'high'];

const getAllTasks = async () => {
  const result = await pool.query(
    "SELECT * FROM tasks ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END, created_at DESC"
  );
  return result.rows;
};

const createTask = async (title, priority = 'medium') => {
  if (!title || title.trim() === '') {
    throw { status: 400, message: 'Le titre est requis' };
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    throw { status: 400, message: 'Priorité invalide' };
  }
  const result = await pool.query(
    'INSERT INTO tasks (title, priority) VALUES ($1, $2) RETURNING *',
    [title, priority]
  );
  return result.rows[0];
};

const updateTask = async (id, title, completed, priority) => {
  if (!id || isNaN(id)) {
    throw { status: 400, message: 'ID invalide' };
  }
  if (title === undefined && completed === undefined && priority === undefined) {
    throw { status: 400, message: 'Au moins un champ (title, completed ou priority) est requis' };
  }
  if (title !== undefined && title.trim() === '') {
    throw { status: 400, message: 'Le titre ne peut pas être vide' };
  }
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    throw { status: 400, message: 'Priorité invalide' };
  }
  const result = await pool.query(
    'UPDATE tasks SET title = COALESCE($1, title), completed = COALESCE($2, completed), priority = COALESCE($3, priority) WHERE id = $4 RETURNING *',
    [title || null, completed, priority || null, id]
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
