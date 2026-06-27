const { test, expect } = require('@playwright/test');

async function createTask(page, title, priority = 'medium', dueDate = '') {
  await page.fill('#task-input', title);
  await page.selectOption('#priority-select', priority);
  if (dueDate) await page.fill('#due-date-input', dueDate);
  await page.click('button[type=submit]');
  await page.waitForTimeout(400);
}

async function clearAllTasks(page) {
  await page.waitForTimeout(500);
  while (true) {
    const btns = await page.locator('.delete-btn').all();
    if (btns.length === 0) break;
    await btns[0].click();
    await page.waitForTimeout(300);
  }
}

test.describe('Création de tâches', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAllTasks(page);
  });

  test('crée une tâche avec priorité par défaut', async ({ page }) => {
    await createTask(page, 'Tâche simple');
    await expect(page.locator('.task-title', { hasText: 'Tâche simple' })).toBeVisible();
    await expect(page.locator('.priority-medium').first()).toBeVisible();
  });

  test('crée une tâche avec priorité haute et date', async ({ page }) => {
    await createTask(page, 'Tâche urgente', 'high', '2026-12-31');
    await expect(page.locator('.task-title', { hasText: 'Tâche urgente' })).toBeVisible();
    await expect(page.locator('.priority-high')).toBeVisible();
    await expect(page.locator('.due-date', { hasText: '31/12/2026' })).toBeVisible();
  });

  test('affiche la date en rouge si échéance dépassée', async ({ page }) => {
    await createTask(page, 'En retard', 'high', '2020-01-01');
    await expect(page.locator('.due-date.overdue')).toBeVisible();
  });
});

test.describe('Édition de tâches', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAllTasks(page);
  });

  test('ouvre le formulaire d\'édition au clic sur ✎', async ({ page }) => {
    await createTask(page, 'À éditer');
    await page.locator('.task-item', { hasText: 'À éditer' }).locator('.edit-btn').click();
    await expect(page.locator('.edit-input')).toBeVisible();
    await expect(page.locator('.edit-select')).toBeVisible();
    await expect(page.locator('.edit-date')).toBeVisible();
    await expect(page.locator('.save-btn')).toBeVisible();
    await expect(page.locator('.cancel-edit-btn')).toBeVisible();
  });

  test('modifie le titre d\'une tâche', async ({ page }) => {
    await createTask(page, 'Ancien titre');
    await page.locator('.task-item', { hasText: 'Ancien titre' }).locator('.edit-btn').click();
    await page.fill('.edit-input', 'Nouveau titre');
    await page.click('.save-btn');
    await page.waitForTimeout(500);
    await expect(page.locator('.task-title', { hasText: 'Nouveau titre' })).toBeVisible();
    await expect(page.locator('.task-title', { hasText: 'Ancien titre' })).not.toBeVisible();
  });

  test('modifie la priorité d\'une tâche', async ({ page }) => {
    await createTask(page, 'Changer priorité', 'low');
    await page.locator('.task-item', { hasText: 'Changer priorité' }).locator('.edit-btn').click();
    await page.selectOption('.edit-select', 'high');
    await page.click('.save-btn');
    await page.waitForTimeout(500);
    const item = page.locator('.task-item', { hasText: 'Changer priorité' });
    await expect(item.locator('.priority-high')).toBeVisible();
  });

  test('modifie la date d\'échéance d\'une tâche', async ({ page }) => {
    await createTask(page, 'Changer date', 'medium', '2026-06-01');
    await page.locator('.task-item', { hasText: 'Changer date' }).locator('.edit-btn').click();
    await page.fill('.edit-date', '2026-09-15');
    await page.click('.save-btn');
    await page.waitForTimeout(500);
    await expect(page.locator('.due-date', { hasText: '15/09/2026' })).toBeVisible();
  });

  test('annule l\'édition sans modifier la tâche', async ({ page }) => {
    await createTask(page, 'Ne pas modifier');
    await page.locator('.task-item', { hasText: 'Ne pas modifier' }).locator('.edit-btn').click();
    await page.fill('.edit-input', 'Modification annulée');
    await page.click('.cancel-edit-btn');
    await page.waitForTimeout(300);
    await expect(page.locator('.task-title', { hasText: 'Ne pas modifier' })).toBeVisible();
    await expect(page.locator('.task-title', { hasText: 'Modification annulée' })).not.toBeVisible();
  });
});

test.describe('Filtres', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAllTasks(page);
  });

  test('filtre les tâches actives et complétées', async ({ page }) => {
    await createTask(page, 'Tâche active');
    await createTask(page, 'Tâche complète');
    await page.locator('.task-title', { hasText: 'Tâche complète' }).click();
    await page.waitForTimeout(500);

    await page.click('[data-filter=active]');
    await expect(page.locator('.task-title', { hasText: 'Tâche active' })).toBeVisible();
    await expect(page.locator('.task-title', { hasText: 'Tâche complète' })).not.toBeVisible();

    await page.click('[data-filter=completed]');
    await expect(page.locator('.task-title', { hasText: 'Tâche complète' })).toBeVisible();
    await expect(page.locator('.task-title', { hasText: 'Tâche active' })).not.toBeVisible();
  });
});

test.describe('Suppression de tâches', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAllTasks(page);
  });

  test('supprime une tâche', async ({ page }) => {
    await createTask(page, 'À supprimer');
    await page.locator('.task-item', { hasText: 'À supprimer' }).locator('.delete-btn').click();
    await page.waitForTimeout(400);
    await expect(page.locator('.task-title', { hasText: 'À supprimer' })).not.toBeVisible();
  });
});
