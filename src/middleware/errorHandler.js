'use strict';

/**
 * src/middleware/errorHandler.js
 *
 * Responsibility:
 *   Centralised Express error-handling middleware.
 *
 *   Any route or middleware can pass an error to next(err) and this
 *   handler will format a consistent JSON error response.
 *
 *   Rules:
 *   - Uses err.status / err.statusCode when set (e.g. 400, 401, 403, 404).
 *   - Falls back to 500 for unexpected errors.
 *   - Never leaks stack traces to the client in production.
 *   - Logs full error details to the console for debugging.
 *
 * Usage (in app.js, registered last):
 *   const { errorHandler } = require('./middleware');
 *   app.use(errorHandler);
 */

/**
 * createError – helper to build a structured error object.
 *
 * @param {number} status   - HTTP status code
 * @param {string} message  - Human-readable error message
 * @returns {Error}
 */
function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * errorHandler – four-parameter Express error middleware.
 *
 * Must remain the LAST middleware registered in app.js.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;

  // Log the full error server-side (never send stack to client)
  if (status >= 500) {
    console.error(`[${new Date().toISOString()}] Unhandled error:`, err);
  }

  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error.'
  });
}

module.exports = { errorHandler, createError };
