const pool = require('../config/db');

const VALID_PRIORITIES = ['low', 'medium', 'high'];

const isValidDate = (str) =>
  /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(new Date(str).getTime());

const getAllTasks = async () => {
  const result = await pool.query(
    "SELECT * FROM tasks ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END, created_at DESC"
  );
  return result.rows;
};

const createTask = async (title, priority = 'medium', dueDate = null) => {
  if (!title || title.trim() === '') {
    throw { status: 400, message: 'Le titre est requis' };
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    throw { status: 400, message: 'Priorité invalide' };
  }
  if (dueDate !== null && !isValidDate(dueDate)) {
    throw { status: 400, message: 'Date d\'échéance invalide' };
  }
  const result = await pool.query(
    'INSERT INTO tasks (title, priority, due_date) VALUES ($1, $2, $3) RETURNING *',
    [title, priority, dueDate]
  );
  return result.rows[0];
};

const updateTask = async (id, title, completed, priority, dueDate) => {
  if (!id || isNaN(id)) {
    throw { status: 400, message: 'ID invalide' };
  }
  if (title === undefined && completed === undefined && priority === undefined && dueDate === undefined) {
    throw { status: 400, message: 'Au moins un champ (title, completed, priority ou due_date) est requis' };
  }
  if (title !== undefined && title.trim() === '') {
    throw { status: 400, message: 'Le titre ne peut pas être vide' };
  }
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    throw { status: 400, message: 'Priorité invalide' };
  }
  if (dueDate !== undefined && dueDate !== null && !isValidDate(dueDate)) {
    throw { status: 400, message: 'Date d\'échéance invalide' };
  }
  const result = await pool.query(
    'UPDATE tasks SET title = COALESCE($1, title), completed = COALESCE($2, completed), priority = COALESCE($3, priority), due_date = COALESCE($4, due_date) WHERE id = $5 RETURNING *',
    [title || null, completed, priority || null, dueDate ?? null, id]
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
