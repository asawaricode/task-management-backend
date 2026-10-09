'use strict';

/**
 * src/routes/index.js
 *
 * Central route registry.
 *
 * Responsibility:
 *   - Mounts every feature router under its versioned API prefix.
 *   - Exposes the single root health-check endpoint.
 *   - Keeps src/app.js free of per-feature route declarations.
 */

const router = require('express').Router();

// ── Health-check ─────────────────────────────────────────────────────────────
// No database query — just confirms the process is alive.
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Task Management System API is running.',
    version: '1.0.0'
  });
});

// ── Feature routers ──────────────────────────────────────────────────────────
router.use('/api/auth', require('./auth.routes'));
router.use('/api/tasks', require('./task.routes'));

module.exports = router;
