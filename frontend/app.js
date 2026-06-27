const API_URL = '__API_URL__/api/tasks';

let allTasks = [];
let currentFilter = 'all';

async function loadTasks() {
  const res = await fetch(API_URL);
  allTasks = await res.json();
  renderTasks();
}

async function createTask(title, priority, dueDate) {
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, priority, due_date: dueDate || null })
  });
  loadTasks();
}

async function toggleTask(id, completed, title, priority, dueDate) {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, completed: !completed, priority, due_date: dueDate })
  });
  loadTasks();
}

async function deleteTask(id) {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  loadTasks();
}

const PRIORITY_LABEL = { high: 'Haute', medium: 'Moyenne', low: 'Basse' };

function formatDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

function isOverdue(task) {
  if (!task.due_date || task.completed) return false;
  return task.due_date.slice(0, 10) < new Date().toISOString().slice(0, 10);
}

function renderTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  const filtered = allTasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');

    const badge = document.createElement('span');
    badge.className = `priority-badge priority-${task.priority}`;
    badge.textContent = PRIORITY_LABEL[task.priority];

    const content = document.createElement('div');
    content.className = 'task-content';

    const span = document.createElement('span');
    span.className = 'task-title';
    span.textContent = task.title;
    span.addEventListener('click', () => toggleTask(task.id, task.completed, task.title, task.priority, task.due_date));

    content.appendChild(span);

    if (task.due_date) {
      const dateEl = document.createElement('span');
      dateEl.className = 'due-date' + (isOverdue(task) ? ' overdue' : '');
      dateEl.textContent = 'Échéance : ' + formatDate(task.due_date);
      content.appendChild(dateEl);
    }

    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.textContent = '✕';
    btn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(badge);
    li.appendChild(content);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
  });
});

document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('task-input');
  const priority = document.getElementById('priority-select').value;
  const dueDate = document.getElementById('due-date-input').value;
  const title = input.value.trim();
  if (!title) return;
  input.value = '';
  document.getElementById('due-date-input').value = '';
  await createTask(title, priority, dueDate);
});

loadTasks();
