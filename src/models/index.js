'use strict';

/**
 * src/models/index.js
 *
 * Central export point for all model modules.
 *
 * Responsibility:
 *   Models own every parameterised SQL query in the application.
 *   They accept plain data values, execute queries against the DB
 *   pool, and return raw result rows.  They never build HTTP
 *   responses and contain no business-logic decisions.
 *
 * Models added in later stages:
 *   - UserModel  (authentication stage)
 *   - TaskModel  (task CRUD stage)
 */

// No models to export yet — they will be added per feature stage.
// This file serves as the established entry point so that services
// can always import from '../models' regardless of stage.

module.exports = {};
