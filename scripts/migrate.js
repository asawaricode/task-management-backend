'use strict';

/**
 * migrate.js
 *
 * Versioned migration runner.
 *
 * How it works:
 *   1. Connects to the database using env vars loaded from .env
 *   2. Creates a `database_migrations` table if it doesn't exist yet –
 *      this table tracks which migration files have already been applied.
 *   3. Reads every file from database/migrations/ in alphabetical order.
 *   4. Skips any migration whose name is already recorded in the table.
 *   5. Runs the `up()` function of each pending migration inside a
 *      transaction so a failed migration is automatically rolled back.
 *   6. Records the migration name on success.
 *
 * Usage:
 *   npm run migrate
 */

require('dotenv').config();

const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'database', 'migrations');

async function getPool() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    multipleStatements: false // keep false; each migration runs one statement
  });
}

/**
 * Ensure the tracking table exists.
 */
async function ensureMigrationsTable(pool) {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS database_migrations (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name       VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_migration_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

/**
 * Return the set of migration names that have already been applied.
 */
async function getAppliedMigrations(pool) {
  const [rows] = await pool.execute(
    'SELECT name FROM database_migrations ORDER BY id ASC'
  );
  return new Set(rows.map((r) => r.name));
}

/**
 * Load migration files from the migrations directory, sorted alphabetically.
 */
function loadMigrationFiles() {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.js'))
    .sort(); // alphabetical = chronological given 001_, 002_, … prefixes

  return files.map((file) => ({
    filename: file,
    migration: require(path.join(MIGRATIONS_DIR, file))
  }));
}

async function runMigrations() {
  let pool;

  try {
    pool = await getPool();
    console.log('Connected to database.');

    await ensureMigrationsTable(pool);

    const applied = await getAppliedMigrations(pool);
    const migrations = loadMigrationFiles();
    const pending = migrations.filter((m) => !applied.has(m.migration.name));

    if (pending.length === 0) {
      console.log('All migrations are already applied. Nothing to do.');
      return;
    }

    console.log(`Running ${pending.length} pending migration(s)…`);

    for (const { filename, migration } of pending) {
      // Acquire a single connection so we can wrap the migration in a transaction
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        console.log(`  → Applying: ${filename}`);
        await migration.up(connection); // pass the connection, not the pool

        // Record the migration as applied
        await connection.execute(
          'INSERT INTO database_migrations (name) VALUES (?)',
          [migration.name]
        );

        await connection.commit();
        console.log(`  ✓ Applied:  ${filename}`);
      } catch (err) {
        await connection.rollback();
        console.error(`  ✗ Failed:   ${filename}`);
        console.error('    Error:', err.message);
        // Stop processing further migrations after a failure
        process.exit(1);
      } finally {
        connection.release();
      }
    }

    console.log('All pending migrations applied successfully.');
  } catch (err) {
    console.error('Migration runner error:', err.message);
    process.exit(1);
  } finally {
    if (pool) await pool.end();
  }
}

runMigrations();
