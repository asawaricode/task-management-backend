'use strict';

/**
 * src/controllers/task.controller.js
 *
 * Responsibility:
 *   HTTP request and response handling for task endpoints.
 *   Delegates business logic and queries to TaskService.
 *   Never contains SQL queries or business validation.
 */

const TaskService = require('../services/task.service');

/**
 * POST /api/tasks
 *
 * Accepts: { title, description }
 * Returns: 201 with created task data
 */
async function createTask(req, res, next) {
  try {
    const task = await TaskService.createTask(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: { task }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tasks
 *
 * Query params: ?page=1&limit=10
 * Returns: 200 with tasks list and pagination metadata
 */
async function getTasks(req, res, next) {
  try {
    const result = await TaskService.getTasks(req.user, req.query);
    return res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully.',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tasks/:id
 *
 * Returns: 200 with task data, or 404 if not found/inaccessible
 */
async function getTaskById(req, res, next) {
  try {
    const task = await TaskService.getTaskById(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: 'Task retrieved successfully.',
      data: { task }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/tasks/:id
 *
 * Accepts: { title, description }
 * Returns: 200 with updated task data
 */
async function updateTask(req, res, next) {
  try {
    const task = await TaskService.updateTask(req.params.id, req.body, req.user);
    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: { task }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/tasks/:id/status
 *
 * Accepts: { status }
 * Returns: 200 with updated task data
 */
async function updateTaskStatus(req, res, next) {
  try {
    const task = await TaskService.updateTaskStatus(req.params.id, req.body?.status);
    return res.status(200).json({
      success: true,
      message: 'Task status updated successfully.',
      data: { task }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus
};
