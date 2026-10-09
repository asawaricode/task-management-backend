'use strict';

/**
 * src/services/index.js
 *
 * Central export point for all service modules.
 *
 * Responsibility:
 *   Services own all business logic and validation rules.
 *   They coordinate one or more model calls, apply domain rules,
 *   and return plain JavaScript values or throw descriptive errors.
 *   They never access req/res objects and never write SQL directly.
 *
 * Services added in later stages:
 *   - AuthService  (authentication stage)
 *   - TaskService  (task CRUD stage)
 */

const AuthService = require('./auth.service');
const TaskService = require('./task.service');

module.exports = { AuthService, TaskService };

