'use strict';

/**
 * src/routes/auth.routes.js
 *
 * Responsibility:
 *   Define authentication endpoints and attach middleware.
 *   No business logic, no SQL, no HTTP response building here.
 *
 * Endpoints:
 *   POST /api/auth/register  – create a new user account
 *   POST /api/auth/login     – authenticate and receive a JWT
 */

const router = require('express').Router();
const AuthController = require('../controllers/auth.controller');

// POST /api/auth/register
router.post('/register', AuthController.register);

// POST /api/auth/login
router.post('/login', AuthController.login);

module.exports = router;
