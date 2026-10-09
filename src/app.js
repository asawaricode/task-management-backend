'use strict';

/**
 * src/app.js
 *
 * Responsibility:
 *   Express application configuration only.
 *   - Registers global middleware (body parsers).
 *   - Mounts the central route registry.
 *   - Registers the 404 and global error handlers.
 *
 *   It does NOT contain route logic, business logic, or SQL.
 */

const express = require('express');
require('dotenv').config();

const router = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Body-parsing middleware ───────────────────────────────────────────────────
// Parse incoming JSON request bodies.
app.use(express.json());

// Parse URL-encoded form data (e.g. from HTML forms).
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────────────────────
// All routes (including the health-check) are declared in src/routes/.
app.use('/', router);

// ── 404 handler ─────────────────────────────────────────────────────────────
// Catches any request that did not match a registered route.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`
  });
});

// ── Global error handler ─────────────────────────────────────────────────────
// Defined in src/middleware/errorHandler.js — must be registered last.
app.use(errorHandler);

module.exports = app;
