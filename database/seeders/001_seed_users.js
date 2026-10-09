'use strict';

const bcrypt = require('bcryptjs');

/**
 * Seeder: 001_seed_users
 *
 * Inserts one admin user and one regular user with bcrypt-hashed passwords.
 * Safe to rerun: uses INSERT IGNORE so duplicate email rows are skipped.
 */
module.exports = {
  name: '001_seed_users',

  async run(pool) {
    // Hash cost factor – 10 is the recommended minimum for production
    const SALT_ROUNDS = 10;

    const adminPassword = await bcrypt.hash('Admin@1234', SALT_ROUNDS);
    const userPassword  = await bcrypt.hash('User@1234',  SALT_ROUNDS);

    const users = [
      {
        name:     'Admin User',
        email:    'admin@example.com',
        password: adminPassword,
        role:     'admin'
      },
      {
        name:     'Regular User',
        email:    'user@example.com',
        password: userPassword,
        role:     'user'
      }
    ];

    for (const user of users) {
      // INSERT IGNORE silently skips the row if the unique email already exists,
      // making this seeder safe to run multiple times.
      await pool.execute(
        `INSERT IGNORE INTO users (name, email, password, role)
         VALUES (?, ?, ?, ?)`,
        [user.name, user.email, user.password, user.role]
      );
    }
  }
};
