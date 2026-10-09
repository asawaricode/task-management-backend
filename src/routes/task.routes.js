'use strict';

/**
 * src/routes/task.routes.js
 *
 * Responsibility:
 *   Define task endpoints and attach authentication / authorization middleware.
 *   No business logic, no SQL, no HTTP response building here.
 *
 * Endpoints:
 *   POST   /api/tasks          - Authenticated: Create a new task (bound to current user)
 *   GET    /api/tasks          - Authenticated: List tasks (own for user, all for admin)
 *   GET    /api/tasks/:id      - Authenticated: Get task by ID (own for user, any for admin)
 *   PUT    /api/tasks/:id      - Authenticated: Update task title/description
 *   PATCH  /api/tasks/:id/status - Authenticated + Admin only: Update task status
 */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const TaskController = require('../controllers/task.controller');

// All task routes require authentication
router.use(authenticate);

// POST /api/tasks
router.post('/', TaskController.createTask);

// GET /api/tasks
router.get('/', TaskController.getTasks);

// GET /api/tasks/:id
router.get('/:id', TaskController.getTaskById);

// PUT /api/tasks/:id
router.put('/:id', TaskController.updateTask);

// PATCH /api/tasks/:id/status (Admin authorization required)
router.patch('/:id/status', authorize('admin'), TaskController.updateTaskStatus);

module.exports = router;
