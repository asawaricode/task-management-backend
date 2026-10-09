'use strict';

const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool so the app reuses connections
// instead of opening a new one for every request.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,  // queue requests when all connections are busy
  connectionLimit: 10,       // max simultaneous connections in the pool
  queueLimit: 0              // unlimited queued requests
});

// Wrap the pool in the promise API so we can use async/await
// throughout the application.
const promisePool = pool.promise();

/**
 * Test the database connection.
 * Called once on server start-up to give early feedback.
 */
async function testConnection() {
  try {
    const connection = await promisePool.getConnection();
    console.log('Database connection established successfully.');
    connection.release();
  } catch (err) {
    console.error('Unable to connect to the database:', err.message);
    process.exit(1); // exit early – nothing will work without a DB
  }
}

module.exports = { pool: promisePool, testConnection };
