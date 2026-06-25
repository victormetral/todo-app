const taskService = require('../services/taskService');

const getAllTasks = async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur' });
  }
};

const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.body.title);
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur' });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body.title, req.body.completed);
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur' });
  }
};

const deleteTask = async (req, res) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur' });
  }
};

module.exports = { getAllTasks, createTask, updateTask, deleteTask };
