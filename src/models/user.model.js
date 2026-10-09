'use strict';

/**
 * src/models/user.model.js
 *
 * Responsibility:
 *   All parameterized SQL queries that touch the `users` table.
 *   No business logic, no HTTP responses, no password hashing.
 *   Accepts plain values, returns raw result rows from mysql2.
 */

const { pool } = require('../config/db');

/**
 * Find a user row by email address.
 *
 * @param {string} email
 * @returns {Promise<object|null>} The full user row, or null if not found.
 */
async function findByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Find a user row by primary key.
 *
 * @param {number} id
 * @returns {Promise<object|null>} The full user row, or null if not found.
 */
async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Insert a new user row.
 *
 * @param {object} data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.password  - Must already be a bcrypt hash.
 * @param {string} data.role      - 'admin' or 'user'
 * @returns {Promise<number>} The insertId of the new row.
 */
async function create({ name, email, password, role }) {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );
  return result.insertId;
}

module.exports = { findByEmail, findById, create };
