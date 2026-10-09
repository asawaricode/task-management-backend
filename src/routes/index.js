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
 *
 * All feature routers will be added here in later stages:
 *   router.use('/api/auth',  require('./auth.routes'));
 *   router.use('/api/tasks', require('./task.routes'));
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

// Feature routers will be mounted here in later stages.

module.exports = router;
