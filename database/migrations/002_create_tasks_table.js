'use strict';

/**
 * Migration: 002_create_tasks_table
 *
 * Creates the `tasks` table with:
 *   id          – auto-increment primary key
 *   user_id     – foreign key → users.id (task owner)
 *   title       – short task title
 *   description – optional longer description
 *   status      – one of: Pending | In Progress | Testing | Completed
 *   created_at  – record creation timestamp
 *   updated_at  – last update timestamp
 *
 * Indexes:
 *   idx_tasks_user_id  – speeds up "tasks belonging to a user" queries
 *   idx_tasks_status   – speeds up "tasks filtered by status" queries
 */
module.exports = {
  name: '002_create_tasks_table',

  async up(pool) {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
        user_id     INT UNSIGNED    NOT NULL,
        title       VARCHAR(200)    NOT NULL,
        description TEXT,
        status      ENUM('Pending', 'In Progress', 'Testing', 'Completed')
                                    NOT NULL DEFAULT 'Pending',
        created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                             ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_tasks_user_id (user_id),
        INDEX idx_tasks_status  (status),
        CONSTRAINT fk_tasks_user_id
          FOREIGN KEY (user_id) REFERENCES users (id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  async down(pool) {
    await pool.execute('DROP TABLE IF EXISTS tasks;');
  }
};
