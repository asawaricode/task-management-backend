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

const UserModel = require('./user.model');
const TaskModel = require('./task.model');

module.exports = { UserModel, TaskModel };

