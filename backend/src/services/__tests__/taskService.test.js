jest.mock('../../config/db');
const pool = require('../../config/db');
const { getAllTasks, createTask, updateTask, deleteTask } = require('../taskService');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getAllTasks', () => {
  it('retourne toutes les tâches', async () => {
    const rows = [{ id: 1, title: 'Test', completed: false, priority: 'medium', due_date: null }];
    pool.query.mockResolvedValue({ rows });

    const result = await getAllTasks();

    expect(result).toEqual(rows);
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM tasks ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END, created_at DESC"
    );
  });
});

describe('createTask', () => {
  it('crée une tâche avec un titre valide et priorité par défaut', async () => {
    const row = { id: 1, title: 'Nouvelle tâche', completed: false, priority: 'medium', due_date: null };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await createTask('Nouvelle tâche');

    expect(result).toEqual(row);
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO tasks (title, priority, due_date) VALUES ($1, $2, $3) RETURNING *',
      ['Nouvelle tâche', 'medium', null]
    );
  });

  it('crée une tâche avec une priorité et une date d\'échéance', async () => {
    const row = { id: 2, title: 'Urgente', completed: false, priority: 'high', due_date: '2026-07-01' };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await createTask('Urgente', 'high', '2026-07-01');

    expect(result).toEqual(row);
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO tasks (title, priority, due_date) VALUES ($1, $2, $3) RETURNING *',
      ['Urgente', 'high', '2026-07-01']
    );
  });

  it('lance une erreur 400 si le titre est vide', async () => {
    await expect(createTask('')).rejects.toMatchObject({ status: 400, message: 'Le titre est requis' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('lance une erreur 400 si le titre est absent', async () => {
    await expect(createTask(undefined)).rejects.toMatchObject({ status: 400, message: 'Le titre est requis' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('lance une erreur 400 si la priorité est invalide', async () => {
    await expect(createTask('Titre', 'urgent')).rejects.toMatchObject({ status: 400, message: 'Priorité invalide' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('lance une erreur 400 si la date d\'échéance est invalide', async () => {
    await expect(createTask('Titre', 'medium', 'not-a-date')).rejects.toMatchObject({
      status: 400,
      message: 'Date d\'échéance invalide'
    });
    expect(pool.query).not.toHaveBeenCalled();
  });
});

describe('updateTask', () => {
  it('met à jour titre et completed', async () => {
    const row = { id: 1, title: 'Titre modifié', completed: true, priority: 'medium', due_date: null };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await updateTask(1, 'Titre modifié', true);

    expect(result).toEqual(row);
  });

  it('met à jour seulement completed', async () => {
    const row = { id: 1, title: 'Titre existant', completed: true, priority: 'medium', due_date: null };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await updateTask(1, undefined, true);

    expect(result).toEqual(row);
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE tasks SET title = COALESCE($1, title), completed = COALESCE($2, completed), priority = COALESCE($3, priority), due_date = COALESCE($4, due_date) WHERE id = $5 RETURNING *',
      [null, true, null, null, 1]
    );
  });

  it('met à jour seulement la priorité', async () => {
    const row = { id: 1, title: 'Titre existant', completed: false, priority: 'high', due_date: null };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await updateTask(1, undefined, undefined, 'high');

    expect(result).toEqual(row);
  });

  it('met à jour la date d\'échéance', async () => {
    const row = { id: 1, title: 'Titre', completed: false, priority: 'medium', due_date: '2026-07-01' };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await updateTask(1, undefined, undefined, undefined, '2026-07-01');

    expect(result).toEqual(row);
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE tasks SET title = COALESCE($1, title), completed = COALESCE($2, completed), priority = COALESCE($3, priority), due_date = COALESCE($4, due_date) WHERE id = $5 RETURNING *',
      [null, undefined, null, '2026-07-01', 1]
    );
  });

  it('lance une erreur 400 si l\'id est invalide', async () => {
    await expect(updateTask('abc', 'Titre', true)).rejects.toMatchObject({ status: 400, message: 'ID invalide' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('lance une erreur 400 si aucun champ fourni', async () => {
    await expect(updateTask(1, undefined, undefined, undefined, undefined)).rejects.toMatchObject({
      status: 400,
      message: 'Au moins un champ (title, completed, priority ou due_date) est requis'
    });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('lance une erreur 400 si le titre est vide', async () => {
    await expect(updateTask(1, '', undefined)).rejects.toMatchObject({ status: 400, message: 'Le titre ne peut pas être vide' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('lance une erreur 400 si la priorité est invalide', async () => {
    await expect(updateTask(1, undefined, undefined, 'urgent')).rejects.toMatchObject({ status: 400, message: 'Priorité invalide' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('lance une erreur 400 si la date d\'échéance est invalide', async () => {
    await expect(updateTask(1, undefined, undefined, undefined, 'not-a-date')).rejects.toMatchObject({
      status: 400,
      message: 'Date d\'échéance invalide'
    });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('lance une erreur 404 si la tâche est introuvable', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await expect(updateTask(999, 'Titre', true)).rejects.toMatchObject({ status: 404, message: 'Tâche non trouvée' });
  });
});

describe('deleteTask', () => {
  it('supprime une tâche existante', async () => {
    pool.query.mockResolvedValue({ rowCount: 1 });
    await expect(deleteTask(1)).resolves.toBeUndefined();
    expect(pool.query).toHaveBeenCalledWith('DELETE FROM tasks WHERE id = $1', [1]);
  });

  it('lance une erreur 400 si l\'id est invalide', async () => {
    await expect(deleteTask('abc')).rejects.toMatchObject({ status: 400, message: 'ID invalide' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('lance une erreur 404 si la tâche est introuvable', async () => {
    pool.query.mockResolvedValue({ rowCount: 0 });
    await expect(deleteTask(999)).rejects.toMatchObject({ status: 404, message: 'Tâche non trouvée' });
  });
});
