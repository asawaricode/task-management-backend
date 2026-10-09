'use strict';

require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 3000;

/**
 * Bootstrap function – test the database connection first,
 * then start listening for HTTP traffic.
 */
async function startServer() {
  // Verify DB connectivity before accepting requests
  await testConnection();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
