'use strict';

/**
 * seed.js
 *
 * Seeder runner.
 *
 * How it works:
 *   1. Connects to the database using env vars loaded from .env
 *   2. Creates a `database_seeders` table if it doesn't exist yet –
 *      this table records which seeders have already been run.
 *   3. Reads every file from database/seeders/ in alphabetical order.
 *   4. Skips any seeder whose name is already recorded in the table.
 *   5. Calls the `run()` function of each pending seeder.
 *   6. Records the seeder name on success.
 *
 * Note: individual seeders also use INSERT IGNORE, so even if the
 * tracking table is reset, duplicate rows won't be inserted.
 *
 * Usage:
 *   npm run seed
 */

require('dotenv').config();

const mysql = require('mysql2/promise');
const path  = require('path');
const fs    = require('fs');

const SEEDERS_DIR = path.join(__dirname, '..', 'database', 'seeders');

async function getPool() {
  return mysql.createPool({
    host:             process.env.DB_HOST,
    port:             process.env.DB_PORT,
    user:             process.env.DB_USER,
    password:         process.env.DB_PASSWORD,
    database:         process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit:  5
  });
}

/**
 * Ensure the seeder tracking table exists.
 */
async function ensureSeedersTable(pool) {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS database_seeders (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name       VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_seeder_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

/**
 * Return the set of seeder names that have already been applied.
 */
async function getAppliedSeeders(pool) {
  const [rows] = await pool.execute(
    'SELECT name FROM database_seeders ORDER BY id ASC'
  );
  return new Set(rows.map((r) => r.name));
}

/**
 * Load seeder files from the seeders directory, sorted alphabetically.
 */
function loadSeederFiles() {
  const files = fs
    .readdirSync(SEEDERS_DIR)
    .filter((f) => f.endsWith('.js'))
    .sort();

  return files.map((file) => ({
    filename: file,
    seeder: require(path.join(SEEDERS_DIR, file))
  }));
}

async function runSeeders() {
  let pool;

  try {
    pool = await getPool();
    console.log('Connected to database.');

    await ensureSeedersTable(pool);

    const applied = await getAppliedSeeders(pool);
    const seeders = loadSeederFiles();
    const pending = seeders.filter((s) => !applied.has(s.seeder.name));

    if (pending.length === 0) {
      console.log('All seeders are already applied. Nothing to do.');
      return;
    }

    console.log(`Running ${pending.length} pending seeder(s)…`);

    for (const { filename, seeder } of pending) {
      try {
        console.log(`  → Running: ${filename}`);
        await seeder.run(pool);

        // Record that this seeder has been applied
        await pool.execute(
          'INSERT INTO database_seeders (name) VALUES (?)',
          [seeder.name]
        );

        console.log(`  ✓ Done:    ${filename}`);
      } catch (err) {
        console.error(`  ✗ Failed:  ${filename}`);
        console.error('    Error:', err.message);
        process.exit(1);
      }
    }

    console.log('All pending seeders applied successfully.');
  } catch (err) {
    console.error('Seeder runner error:', err.message);
    process.exit(1);
  } finally {
    if (pool) await pool.end();
  }
}

runSeeders();
