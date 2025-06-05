// server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const Task = require('./models/Task');
const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming JSON bodies
app.use(express.json());

// A helper to wrap async route handlers and forward errors
const wrap = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create a new task
app.post(
  '/api/tasks',
  wrap(async (req, res) => {
    const { title, description } = req.body;

    // Basic validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Create and save the new task
    const newTask = new Task({
      title: title.trim(),
      description: (description || '').trim(),
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  })
);

// Get all tasks (optionally filtered by completion)
app.get(
  '/api/tasks',
  wrap(async (req, res) => {
    const { completed } = req.query;
    const filter = {};

    if (completed === 'true') {
      filter.completed = true;
    } else if (completed === 'false') {
      filter.completed = false;
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  })
);

// Get a single task by ID
app.get(
  '/api/tasks/:id',
  wrap(async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  })
);

// Update a task by ID
app.put(
  '/api/tasks/:id',
  wrap(async (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    const updates = {};

    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description.trim();
    }

    if (completed !== undefined) {
      updates.completed = completed;
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);
  })
);

// Delete a task by ID
app.delete(
  '/api/tasks/:id',
  wrap(async (req, res) => {
    const { id } = req.params;
    const deleted = await Task.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Deleted successfully' });
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// Error-handling Middleware
// ─────────────────────────────────────────────────────────────────────────────

// Catches errors thrown by wrapped async routes
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

// ─────────────────────────────────────────────────────────────────────────────
// Database Connection & Server Startup
// ─────────────────────────────────────────────────────────────────────────────

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

