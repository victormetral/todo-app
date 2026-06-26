const API_URL = '__API_URL__/api/tasks';

async function loadTasks() {
  const res = await fetch(API_URL);
  const tasks = await res.json();
  renderTasks(tasks);
}

async function createTask(title) {
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  loadTasks();
}

async function toggleTask(id, completed, title) {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, completed: !completed })
  });
  loadTasks();
}

async function deleteTask(id) {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  loadTasks();
}

function renderTasks(tasks) {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');

    const span = document.createElement('span');
    span.textContent = task.title;
    span.addEventListener('click', () => toggleTask(task.id, task.completed, task.title));

    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.textContent = '✕';
    btn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(span);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('task-input');
  const title = input.value.trim();
  if (!title) return;
  input.value = '';
  await createTask(title);
});

loadTasks();
