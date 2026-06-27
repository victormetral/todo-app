const API_URL = '__API_URL__/api/tasks';

let allTasks = [];
let currentFilter = 'all';
let searchQuery = '';
let editingId = null;

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

async function saveTaskEdit(id, title, priority, dueDate) {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, priority, due_date: dueDate || null })
  });
  editingId = null;
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

  const q = searchQuery.toLowerCase();
  const filtered = allTasks.filter(task => {
    if (currentFilter === 'active' && task.completed) return false;
    if (currentFilter === 'completed' && !task.completed) return false;
    if (q && !task.title.toLowerCase().includes(q)) return false;
    return true;
  });

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');

    if (task.id === editingId) {
      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.className = 'edit-input';
      titleInput.value = task.title;

      const prioritySelect = document.createElement('select');
      prioritySelect.className = 'edit-select';
      ['high', 'medium', 'low'].forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = PRIORITY_LABEL[p];
        if (p === task.priority) opt.selected = true;
        prioritySelect.appendChild(opt);
      });

      const dateInput = document.createElement('input');
      dateInput.type = 'date';
      dateInput.className = 'edit-date';
      dateInput.value = task.due_date ? task.due_date.slice(0, 10) : '';

      const editForm = document.createElement('div');
      editForm.className = 'edit-form';
      editForm.appendChild(titleInput);
      editForm.appendChild(prioritySelect);
      editForm.appendChild(dateInput);

      const saveBtn = document.createElement('button');
      saveBtn.className = 'save-btn';
      saveBtn.textContent = '✓';
      saveBtn.addEventListener('click', () => {
        const newTitle = titleInput.value.trim();
        if (!newTitle) return;
        saveTaskEdit(task.id, newTitle, prioritySelect.value, dateInput.value);
      });

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'cancel-edit-btn';
      cancelBtn.textContent = '✕';
      cancelBtn.addEventListener('click', () => {
        editingId = null;
        renderTasks();
      });

      li.appendChild(editForm);
      li.appendChild(saveBtn);
      li.appendChild(cancelBtn);
    } else {
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

      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.textContent = '✎';
      editBtn.addEventListener('click', () => {
        editingId = task.id;
        renderTasks();
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => deleteTask(task.id));

      li.appendChild(badge);
      li.appendChild(content);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
    }

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

document.getElementById('search-input').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderTasks();
});

loadTasks();
