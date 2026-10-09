'use strict';

/**
 * Migration: 001_create_users_table
 *
 * Creates the `users` table with:
 *   id          – auto-increment primary key
 *   name        – the user's display name
 *   email       – unique login identifier
 *   password    – bcrypt hash (never plain text)
 *   role        – 'admin' or 'user'
 *   created_at  – record creation timestamp
 *   updated_at  – last update timestamp
 */
module.exports = {
  name: '001_create_users_table',

  async up(pool) {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
        name       VARCHAR(100)    NOT NULL,
        email      VARCHAR(150)    NOT NULL,
        password   VARCHAR(255)    NOT NULL,
        role       ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                             ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_users_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  async down(pool) {
    await pool.execute('DROP TABLE IF EXISTS users;');
  }
};
