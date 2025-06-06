// public/app.js

import Http from './http.js';

const api = new Http(window.location.origin);

let currentFilter = 'all';
let tasks = [];
let taskBeingEdited = null;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Load & Render Tasks
// ─────────────────────────────────────────────────────────────────────────────
async function loadAndRenderTasks() {
  try {
    const allTasks = await api.get('/api/tasks');
    tasks = allTasks;

    let visibleTasks;
    if (currentFilter === 'active') {
      visibleTasks = tasks.filter((t) => !t.completed);
    } else if (currentFilter === 'completed') {
      visibleTasks = tasks.filter((t) => t.completed);
    } else {
      visibleTasks = tasks;
    }

    renderTaskList(visibleTasks);
  } catch (err) {
    alert('Error loading tasks. Try refreshing.');
    console.error(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Render List of Tasks
// ─────────────────────────────────────────────────────────────────────────────
function renderTaskList(taskArray) {
  const listEl = document.getElementById('task-list');
  listEl.innerHTML = '';

  taskArray.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) li.classList.add('completed');

    // Title
    const titleEl = document.createElement('p');
    titleEl.textContent = task.title;
    titleEl.className = 'task-title';

    // Description
    const descEl = document.createElement('p');
    descEl.textContent = task.description || '';
    descEl.className = 'task-desc';

    // Buttons container
    const btnContainer = document.createElement('div');
    btnContainer.className = 'task-buttons';

    // Done/Undo Button
    const doneBtn = document.createElement('button');
    doneBtn.textContent = task.completed ? 'Undo' : 'Done';
    doneBtn.className = 'btn-done';
    doneBtn.addEventListener('click', () => toggleComplete(task));

    // Edit Button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'btn-edit';
    editBtn.addEventListener('click', () => openEditModal(task));

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'btn-delete';
    deleteBtn.addEventListener('click', () => deleteTask(task));

    btnContainer.appendChild(doneBtn);
    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);

    li.appendChild(titleEl);
    if (task.description) li.appendChild(descEl);
    li.appendChild(btnContainer);

    listEl.appendChild(li);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Handle Create (Form Submit)
// ─────────────────────────────────────────────────────────────────────────────
async function handleFormSubmit(e) {
  e.preventDefault();
  const titleInput = document.getElementById('task-title');
  const descInput = document.getElementById('task-desc');

  const newTitle = titleInput.value.trim();
  const newDesc = descInput.value.trim();

  if (!newTitle) {
    alert('Title is required.');
    return;
  }

  try {
    await api.post('/api/tasks', { title: newTitle, description: newDesc });
    titleInput.value = '';
    descInput.value = '';
    await loadAndRenderTasks();
  } catch (err) {
    alert('Error creating task.');
    console.error(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Toggle Completed Status
// ─────────────────────────────────────────────────────────────────────────────
async function toggleComplete(task) {
  try {
    await api.put(`/api/tasks/${task._id}`, {
      completed: !task.completed,
    });
    await loadAndRenderTasks();
  } catch (err) {
    alert('Error updating task.');
    console.error(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Open & Close Edit Modal
// ─────────────────────────────────────────────────────────────────────────────
function openEditModal(task) {
  taskBeingEdited = task;
  document.getElementById('edit-task-title').value = task.title;
  document.getElementById('edit-task-desc').value = task.description || '';
  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  taskBeingEdited = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Handle Edit Form Submit
// ─────────────────────────────────────────────────────────────────────────────
async function handleEditFormSubmit(e) {
  e.preventDefault();
  if (!taskBeingEdited) {
    alert('No task selected for editing.');
    return;
  }

  const newTitle = document.getElementById('edit-task-title').value.trim();
  const newDesc = document.getElementById('edit-task-desc').value.trim();

  if (!newTitle) {
    alert('Title cannot be empty.');
    return;
  }

  try {
    await api.put(`/api/tasks/${taskBeingEdited._id}`, {
      title: newTitle,
      description: newDesc,
    });
    closeEditModal();
    await loadAndRenderTasks();
  } catch (err) {
    alert('Error updating task.');
    console.error(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Delete a Task
// ─────────────────────────────────────────────────────────────────────────────
async function deleteTask(task) {
  if (!confirm('Delete this task?')) return;

  try {
    await api.delete(`/api/tasks/${task._id}`);
    await loadAndRenderTasks();
  } catch (err) {
    alert('Error deleting task.');
    console.error(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Setup Filters
// ─────────────────────────────────────────────────────────────────────────────
function setupFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      loadAndRenderTasks();
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Initialize on DOMContentLoaded
// ─────────────────────────────────────────────────────────────────────────────
function init() {
  document
    .getElementById('new-task-form')
    .addEventListener('submit', handleFormSubmit);

  document
    .getElementById('edit-task-form')
    .addEventListener('submit', handleEditFormSubmit);

  document
    .getElementById('cancel-edit')
    .addEventListener('click', closeEditModal);

  setupFilters();
  loadAndRenderTasks();
}

document.addEventListener('DOMContentLoaded', init);

