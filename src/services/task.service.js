'use strict';

/**
 * src/services/task.service.js
 *
 * Responsibility:
 *   Task management business logic, validation, ownership, and role checks.
 *   Coordinates calls to TaskModel.
 *   Throws structured errors using createError.
 *   Never accesses req/res and never writes SQL queries.
 */

const TaskModel = require('../models/task.model');
const { createError } = require('../middleware/errorHandler');

const ALLOWED_STATUSES = ['Pending', 'In Progress', 'Testing', 'Completed'];

/**
 * Validate and parse a numeric ID.
 *
 * @param {any} id
 * @returns {number}
 */
function parseTaskId(id) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || numericId <= 0) {
    throw createError(404, 'Task not found.');
  }
  return numericId;
}

/**
 * Create a new task.
 *
 * Requirements:
 *   - Regular users create tasks only for themselves.
 *   - Never trust user_id supplied in the request body.
 *   - Status is always set to 'Pending' by default.
 *   - Title is required and non-empty.
 *
 * @param {object} data
 * @param {string} data.title
 * @param {string} [data.description]
 * @param {object} user  Authenticated user { id, role }
 * @returns {Promise<object>} The newly created task.
 */
async function createTask(data, user) {
  if (!data || !data.title || typeof data.title !== 'string' || !data.title.trim()) {
    throw createError(400, 'title is required.');
  }

  const trimmedTitle = data.title.trim();
  if (trimmedTitle.length > 200) {
    throw createError(400, 'title cannot exceed 200 characters.');
  }

  const description =
    data.description !== undefined && data.description !== null
      ? String(data.description).trim()
      : null;

  // Always bind to authenticated user identity; ignore any body user_id or body status
  const insertId = await TaskModel.create({
    userId: user.id,
    title: trimmedTitle,
    description,
    status: 'Pending'
  });

  return await TaskModel.findById(insertId);
}

/**
 * Retrieve tasks with pagination.
 *
 * Requirements:
 *   - Regular users see only their own tasks.
 *   - Admins see all tasks.
 *
 * @param {object} user  Authenticated user { id, role }
 * @param {object} query  Query parameters { page, limit }
 * @returns {Promise<object>} Object with tasks array and pagination metadata.
 */
async function getTasks(user, query = {}) {
  let page = parseInt(query.page, 10);
  if (isNaN(page) || page < 1) page = 1;

  let limit = parseInt(query.limit, 10);
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const offset = (page - 1) * limit;

  let tasks;
  let total;

  if (user.role === 'admin') {
    total = await TaskModel.countAll();
    tasks = await TaskModel.findAll({ limit, offset });
  } else {
    total = await TaskModel.countByUserId(user.id);
    tasks = await TaskModel.findByUserId({ userId: user.id, limit, offset });
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

/**
 * Retrieve a single task by ID.
 *
 * Requirements:
 *   - Regular users can retrieve only their own tasks.
 *   - Admins can retrieve any task.
 *   - Return 404 when the task does not exist or is inaccessible to a regular user.
 *
 * @param {string|number} id
 * @param {object} user  Authenticated user { id, role }
 * @returns {Promise<object>}
 */
async function getTaskById(id, user) {
  const numericId = parseTaskId(id);
  const task = await TaskModel.findById(numericId);

  if (!task) {
    throw createError(404, 'Task not found.');
  }

  // Hide another user's task behind 404 to prevent resource enumeration
  if (user.role !== 'admin' && task.user_id !== user.id) {
    throw createError(404, 'Task not found.');
  }

  return task;
}

/**
 * Update a task's title and description.
 *
 * Requirements:
 *   - Regular users can edit only their own tasks.
 *   - Admins can edit tasks belonging to any user.
 *   - Return 404 if the task does not exist or is inaccessible.
 *   - Does NOT allow changing user_id or status.
 *
 * @param {string|number} id
 * @param {object} data
 * @param {string} data.title
 * @param {string} [data.description]
 * @param {object} user  Authenticated user { id, role }
 * @returns {Promise<object>} The updated task.
 */
async function updateTask(id, data, user) {
  const numericId = parseTaskId(id);
  const task = await TaskModel.findById(numericId);

  if (!task) {
    throw createError(404, 'Task not found.');
  }

  if (user.role !== 'admin' && task.user_id !== user.id) {
    throw createError(404, 'Task not found.');
  }

  if (!data || !data.title || typeof data.title !== 'string' || !data.title.trim()) {
    throw createError(400, 'title is required.');
  }

  const trimmedTitle = data.title.trim();
  if (trimmedTitle.length > 200) {
    throw createError(400, 'title cannot exceed 200 characters.');
  }

  const description =
    data.description !== undefined && data.description !== null
      ? String(data.description).trim()
      : null;

  await TaskModel.update(numericId, {
    title: trimmedTitle,
    description
  });

  return await TaskModel.findById(numericId);
}

/**
 * Update a task's status.
 *
 * Requirements:
 *   - Admin only (enforced via middleware at route level).
 *   - Accept only: Pending, In Progress, Testing, Completed.
 *   - Return 400 for invalid status, 404 if task not found.
 *
 * @param {string|number} id
 * @param {string} status
 * @returns {Promise<object>} The updated task.
 */
async function updateTaskStatus(id, status) {
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    throw createError(
      400,
      `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}.`
    );
  }

  const numericId = parseTaskId(id);
  const task = await TaskModel.findById(numericId);

  if (!task) {
    throw createError(404, 'Task not found.');
  }

  await TaskModel.updateStatus(numericId, status);

  return await TaskModel.findById(numericId);
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  ALLOWED_STATUSES
};
