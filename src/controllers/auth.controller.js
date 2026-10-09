'use strict';

/**
 * src/controllers/auth.controller.js
 *
 * Responsibility:
 *   HTTP request and response handling for authentication endpoints.
 *   Delegates ALL business logic to AuthService.
 *   Never contains SQL queries or password-hashing logic.
 */

const AuthService = require('../services/auth.service');

/**
 * POST /api/auth/register
 *
 * Accepts: { name, email, password }
 * Returns: 201 with safe user details on success.
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const user = await AuthService.register({ name, email, password });

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: { user }
    });
  } catch (err) {
    next(err); // passed to the global errorHandler middleware
  }
}

/**
 * POST /api/auth/login
 *
 * Accepts: { email, password }
 * Returns: 200 with JWT token and safe user details on success.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token, user } = await AuthService.login({ email, password });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { token, user }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
