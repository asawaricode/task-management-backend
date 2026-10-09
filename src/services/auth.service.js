'use strict';

/**
 * src/services/auth.service.js
 *
 * Responsibility:
 *   Authentication business logic and validation rules.
 *   Coordinates UserModel calls, applies domain rules, hashes
 *   passwords, signs JWTs, and throws structured errors.
 *   Never accesses req/res; never writes SQL.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserModel = require('../models/user.model');
const { createError } = require('../middleware/errorHandler');

const SALT_ROUNDS = 10;

// ── Validation helpers ────────────────────────────────────────────────────────

/**
 * Very simple email format check (RFC-sufficient for an intern project).
 * Returns true when the string looks like a valid email address.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Register a new user.
 *
 * Validation:
 *   - name, email, password are required.
 *   - email must match a basic email pattern.
 *   - password must be at least 6 characters.
 *   - email must not already exist (HTTP 409).
 *   - role is always forced to 'user' — callers cannot override this.
 *
 * @param {object} data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.password  - Plain-text password from the request.
 * @returns {Promise<object>} Safe user object (no password hash).
 */
async function register({ name, email, password }) {
  // ── Field presence ────────────────────────────────────────────────────────
  if (!name || !email || !password) {
    throw createError(400, 'name, email, and password are required.');
  }

  // Trim whitespace so accidental spaces don't cause odd failures
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedName) throw createError(400, 'name cannot be blank.');
  if (!trimmedEmail) throw createError(400, 'email cannot be blank.');
  if (!trimmedPassword) throw createError(400, 'password cannot be blank.');

  // ── Format validation ─────────────────────────────────────────────────────
  if (!isValidEmail(trimmedEmail)) {
    throw createError(400, 'email format is invalid.');
  }

  if (trimmedPassword.length < 6) {
    throw createError(400, 'password must be at least 6 characters.');
  }

  // ── Duplicate check ───────────────────────────────────────────────────────
  const existing = await UserModel.findByEmail(trimmedEmail);
  if (existing) {
    throw createError(409, 'An account with that email already exists.');
  }

  // ── Hash and persist ──────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(trimmedPassword, SALT_ROUNDS);

  const insertId = await UserModel.create({
    name: trimmedName,
    email: trimmedEmail,
    password: hashedPassword,
    role: 'user' // always forced — public registration cannot create admins
  });

  // Return safe user data (never the password hash)
  return {
    id: insertId,
    name: trimmedName,
    email: trimmedEmail,
    role: 'user'
  };
}

/**
 * Log in an existing user.
 *
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.password  - Plain-text password from the request.
 * @returns {Promise<{token: string, user: object}>}
 *   Signed JWT and safe user details.
 */
async function login({ email, password }) {
  // ── Field presence ────────────────────────────────────────────────────────
  if (!email || !password) {
    throw createError(400, 'email and password are required.');
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  // ── Look up user ──────────────────────────────────────────────────────────
  // Use a generic message for both "not found" and "wrong password" cases
  // to avoid user enumeration.
  const user = await UserModel.findByEmail(trimmedEmail);
  if (!user) {
    throw createError(401, 'Invalid email or password.');
  }

  // ── Verify password ───────────────────────────────────────────────────────
  const passwordMatch = await bcrypt.compare(trimmedPassword, user.password);
  if (!passwordMatch) {
    throw createError(401, 'Invalid email or password.');
  }

  // ── Sign JWT ──────────────────────────────────────────────────────────────
  const payload = { id: user.id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

  // Return token + safe user object (never the password hash)
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

module.exports = { register, login };
