// models/Task.js
const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
// Task Schema Definition
// ─────────────────────────────────────────────────────────────────────────────
const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Export Task Model
// ─────────────────────────────────────────────────────────────────────────────
module.exports = mongoose.model('Task', TaskSchema);

