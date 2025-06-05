// Load environment variables from a .env file into process.env
require('dotenv').config();

const express = require('express');                 // Import Express framework
const mongoose = require('mongoose');               // Import Mongoose for MongoDB interaction
const path = require('path');                       // Import Node.js path module for file path utilities

const Task = require('./models/Task');              // Import the Task model defined in models/Task.js
const app = express();                              // Create an Express application

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────

// Serve static files (HTML, CSS, JS) from the "client" directory
app.use(express.static(path.join(__dirname, 'client')));

// Parse incoming JSON requests (e.g., from POST/PUT)
app.use(express.json());

// A wrapper to handle async errors in route handlers
const wrap = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

// Serve the index.html file when user accesses the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create a new task
app.post(
  '/api/tasks',
  wrap(async (req, res) => {
    const { title, description } = req.body;              // Extract title and description from request body

    // Ensure title is present and not just whitespace
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Create a new Task instance with trimmed title and description
    const newTask = new Task({
      title: title.trim(),
      description: (description || '').trim(),
    });

    // Save the task to the database
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);                      // Return the created task with 201 status
  })
);

// Retrieve all tasks (optionally filter by `completed` status)
app.get(
  '/api/tasks',
  wrap(async (req, res) => {
    const { completed } = req.query;       // Extract optional query parameter
    const filter = {};                     // Prepare a filter object

    // Apply filter based on query parameter
    if (completed === 'true') {
      filter.completed = true;
    } else if (completed === 'false') {
      filter.completed = false;
    }

    // Retrieve tasks from DB, sorted by creation time (newest first)
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);                       // Send tasks as JSON response
  })
);

// Retrieve a single task by its ID
app.get(
  '/api/tasks/:id',
  wrap(async (req, res) => {
    const { id } = req.params;                      // Extract task ID from URL
    const task = await Task.findById(id);           // Search DB by ID

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });  // Not found
    }

    res.json(task);                                 // Send found task
  })
);

// Update a task by its ID
app.put(
  '/api/tasks/:id',
  wrap(async (req, res) => {
    const { id } = req.params;                               // Extract task ID
    const { title, description, completed } = req.body;      // Extract fields to update
    const updates = {};                                      // Prepare update object

    // If title is provided, validate and add to updates
    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      updates.title = title.trim();
    }

    // If description is provided, trim and update
    if (description !== undefined) {
      updates.description = description.trim();
    }

    // If completed is provided, update
    if (completed !== undefined) {
      updates.completed = completed;
    }

    // Find task by ID and apply updates, returning the updated doc
    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true,  // Return the new document after update
    });

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);                            // Return updated task
  })
);

// Delete a task by its ID
app.delete(
  '/api/tasks/:id',
  wrap(async (req, res) => {
    const { id } = req.params;                      // Extract ID
    const deleted = await Task.findByIdAndDelete(id);  // Delete from DB

    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Deleted successfully' });   // Return success message
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// Error-handling Middleware
// ─────────────────────────────────────────────────────────────────────────────

// Catch and log errors from async routes, send generic error response
app.use((err, req, res, next) => {
  console.error(err);                               // Log full error stack
  res.status(500).json({ error: 'An unexpected error occurred' });
});

// ─────────────────────────────────────────────────────────────────────────────
// Database Connection & Server Startup
// ─────────────────────────────────────────────────────────────────────────────

mongoose
  .connect(process.env.MONGO_URI)                    // Connect to MongoDB Atlas using connection string from .env
  .then(() => {
    console.log('Connected to MongoDB Atlas');

    const PORT = process.env.PORT || 3000;           // Use .env port or default to 3000
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`); // Start server and log port
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);  // Log connection error
  });
