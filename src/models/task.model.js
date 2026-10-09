'use strict';

/**
 * src/models/task.model.js
 *
 * Responsibility:
 *   Parameterized SQL queries for the `tasks` table.
 *   No business logic, no HTTP responses, no authorization checks.
 *   Accepts plain values, returns raw query results from mysql2.
 */

const { pool } = require('../config/db');

/**
 * Insert a new task row.
 *
 * @param {object} params
 * @param {number} params.userId
 * @param {string} params.title
 * @param {string|null} params.description
 * @param {string} params.status
 * @returns {Promise<number>} The insertId of the new row.
 */
async function create({ userId, title, description, status }) {
  const [result] = await pool.execute(
    'INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)',
    [userId, title, description, status]
  );
  return result.insertId;
}

/**
 * Find a single task by primary key.
 *
 * @param {number} id
 * @returns {Promise<object|null>} The task row, or null if not found.
 */
async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, title, description, status, created_at, updated_at FROM tasks WHERE id = ? LIMIT 1',
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Find all tasks across all users with pagination (admin view).
 *
 * @param {object} params
 * @param {number} params.limit
 * @param {number} params.offset
 * @returns {Promise<Array<object>>}
 */
async function findAll({ limit, offset }) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, title, description, status, created_at, updated_at FROM tasks ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [Number(limit), Number(offset)]
  );
  return rows;
}

/**
 * Count total tasks across all users.
 *
 * @returns {Promise<number>}
 */
async function countAll() {
  const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM tasks');
  return rows[0].total;
}

/**
 * Find tasks belonging to a specific user with pagination.
 *
 * @param {object} params
 * @param {number} params.userId
 * @param {number} params.limit
 * @param {number} params.offset
 * @returns {Promise<Array<object>>}
 */
async function findByUserId({ userId, limit, offset }) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, title, description, status, created_at, updated_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, Number(limit), Number(offset)]
  );
  return rows;
}

/**
 * Count total tasks belonging to a specific user.
 *
 * @param {number} userId
 * @returns {Promise<number>}
 */
async function countByUserId(userId) {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) AS total FROM tasks WHERE user_id = ?',
    [userId]
  );
  return rows[0].total;
}

/**
 * Update a task's title and description.
 *
 * @param {number} id
 * @param {object} params
 * @param {string} params.title
 * @param {string|null} params.description
 * @returns {Promise<number>} Number of affected rows.
 */
async function update(id, { title, description }) {
  const [result] = await pool.execute(
    'UPDATE tasks SET title = ?, description = ? WHERE id = ?',
    [title, description, id]
  );
  return result.affectedRows;
}

/**
 * Update a task's status.
 *
 * @param {number} id
 * @param {string} status
 * @returns {Promise<number>} Number of affected rows.
 */
async function updateStatus(id, status) {
  const [result] = await pool.execute(
    'UPDATE tasks SET status = ? WHERE id = ?',
    [status, id]
  );
  return result.affectedRows;
}

module.exports = {
  create,
  findById,
  findAll,
  countAll,
  findByUserId,
  countByUserId,
  update,
  updateStatus
};
