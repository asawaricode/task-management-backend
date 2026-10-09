'use strict';

/**
 * src/middleware/auth.middleware.js
 *
 * Responsibility:
 *   JWT authentication and role-based authorization middleware.
 *
 *   authenticate – verifies the Bearer token and attaches the
 *                  decoded user identity to req.user.
 *   authorize    – factory that returns a middleware which checks
 *                  that req.user.role is in the allowed list.
 *
 * Usage in route files:
 *   const { authenticate, authorize } = require('../middleware/auth.middleware');
 *
 *   router.get('/protected', authenticate, handler);
 *   router.get('/admin-only', authenticate, authorize('admin'), handler);
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');
const { createError } = require('./errorHandler');

/**
 * authenticate
 *
 * Reads the JWT from the Authorization header (Bearer scheme),
 * verifies it using JWT_SECRET, and attaches the payload to req.user.
 *
 * Rejects with HTTP 401 when:
 *   - The Authorization header is missing or not Bearer format.
 *   - The token is expired, malformed, or signed with the wrong secret.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError(401, 'Access denied. No token provided.'));
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach only the fields we embedded: id and role
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    // Provide a specific message for expired tokens, generic for everything else
    if (err.name === 'TokenExpiredError') {
      return next(createError(401, 'Token has expired. Please log in again.'));
    }
    return next(createError(401, 'Invalid token.'));
  }
}

/**
 * authorize(...roles)
 *
 * Middleware factory. Returns a middleware that allows the request
 * through only if req.user.role is included in the given roles array.
 *
 * Must be used AFTER authenticate so req.user is already set.
 *
 * @param {...string} roles  Allowed roles, e.g. authorize('admin') or authorize('admin', 'user')
 * @returns {Function} Express middleware
 */
function authorize(...roles) {
  return function (req, res, next) {
    if (!req.user) {
      return next(createError(401, 'Access denied. Not authenticated.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(createError(403, 'Access denied. Insufficient permissions.'));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
