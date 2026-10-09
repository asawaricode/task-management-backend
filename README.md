# Task Management System

A RESTful Task Management API built with **Node.js**, **Express.js**, and **MySQL** as a Node.js Developer Intern assessment project.

---

## Tech Stack

| Layer          | Technology              |
|----------------|-------------------------|
| Runtime        | Node.js ≥ 18            |
| Framework      | Express.js              |
| Language       | JavaScript (CommonJS)   |
| Database       | MySQL 5.7 / 8.x         |
| DB Driver      | mysql2                  |
| Authentication | JSON Web Tokens (JWT)   |
| Password Hash  | bcryptjs                |
| Config         | dotenv                  |

---

## Project Structure

```
task-management-system/
  src/
    config/
      db.js                  # MySQL connection pool
    controllers/
      auth.controller.js     # HTTP request & response handling for authentication
    middleware/
      auth.middleware.js     # JWT Bearer token authentication & authorization
      errorHandler.js        # Centralized Express error handler
    models/
      index.js               # Central models registry
      user.model.js          # Parameterized SQL queries for users table
    routes/
      index.js               # Central route registry & health endpoint
      auth.routes.js         # Endpoints: /api/auth/register, /api/auth/login
    services/
      index.js               # Central services registry
      auth.service.js        # Authentication business logic & password hashing
    app.js                   # Express application setup
    server.js                # Server entry point & startup
  database/
    migrations/
      001_create_users_table.js
      002_create_tasks_table.js
    seeders/
      001_seed_users.js
  scripts/
    migrate.js               # Versioned migration runner
    seed.js                  # Seeder runner
  postman/                   # Postman collection (added in later stages)
  .env.example               # Environment variable template
  .gitignore
  package.json
  README.md
```

---

## Getting Started

### 1. Prerequisites

- Node.js ≥ 18 installed
- MySQL server running locally (or remotely)
- A MySQL database created for this project

### 2. Clone & Install

```bash
git clone <repository-url>
cd task-management-system
npm install
```

### 3. Configure Environment Variables

Copy the example file and fill in your real values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=task_management_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d
```

> **Never commit your `.env` file.** It is excluded by `.gitignore`.

### 4. Create the Database

Log in to MySQL and create the database:

```sql
CREATE DATABASE task_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Run Migrations

Creates the `users` and `tasks` tables (and the internal `database_migrations` tracking table):

```bash
npm run migrate
```

Expected output:
```
Connected to database.
Running 2 pending migration(s)…
  → Applying: 001_create_users_table.js
  ✓ Applied:  001_create_users_table.js
  → Applying: 002_create_tasks_table.js
  ✓ Applied:  002_create_tasks_table.js
All pending migrations applied successfully.
```

Migrations are **idempotent** — re-running `npm run migrate` skips already-applied migrations.

### 6. Run Seeders

Inserts one admin user and one regular user with hashed passwords:

```bash
npm run seed
```

Expected output:
```
Connected to database.
Running 1 pending seeder(s)…
  → Running: 001_seed_users.js
  ✓ Done:    001_seed_users.js
All pending seeders applied successfully.
```

Seeded credentials (for development only):

| Role  | Email               | Password    |
|-------|---------------------|-------------|
| admin | admin@example.com   | Admin@1234  |
| user  | user@example.com    | User@1234   |

> **Change these credentials** before deploying to any real environment.

### 7. Start the Server

```bash
npm start
```

Or, with file-watching for development (Node.js ≥ 18):

```bash
npm run dev
```

Visit `http://localhost:3000` — you should see:

```json
{
  "success": true,
  "message": "Task Management System API is running.",
  "version": "1.0.0"
}
```

---

## API Endpoints

Base URL: `http://localhost:3000`

### 1. Health Check

Confirm server is running. Does not require authentication or database connection.

- **URL:** `GET /`
- **Headers:** None
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Task Management System API is running.",
    "version": "1.0.0"
  }
  ```

### 2. User Registration

Registers a new user account. Passwords are automatically hashed using bcryptjs. The `role` is strictly assigned as `"user"` (public registration cannot create admins).

- **URL:** `POST /api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
- **Validation Rules:**
  - `name`: Required, non-empty string.
  - `email`: Required, valid email format, must be unique.
  - `password`: Required, minimum 6 characters.
  - `role`: Automatically forced to `"user"`.
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful.",
    "data": {
      "user": {
        "id": 1,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "user"
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` — Missing fields, blank values, invalid email format, or password < 6 characters.
    ```json
    { "success": false, "message": "name, email, and password are required." }
    ```
  - `409 Conflict` — Email already registered.
    ```json
    { "success": false, "message": "An account with that email already exists." }
    ```

- **cURL Example:**
  ```bash
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Jane Doe\",\"email\":\"jane@example.com\",\"password\":\"password123\"}"
  ```

### 3. User Login

Authenticates user credentials and issues a signed JSON Web Token (JWT). Never exposes password hashes.

- **URL:** `POST /api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "user"
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` — Missing email or password.
    ```json
    { "success": false, "message": "email and password are required." }
    ```
  - `401 Unauthorized` — Invalid email or incorrect password.
    ```json
    { "success": false, "message": "Invalid email or password." }
    ```

- **cURL Example:**
  ```bash
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"jane@example.com\",\"password\":\"password123\"}"
  ```

### 4. Authentication Middleware

Protected endpoints require a valid JWT passed in the `Authorization` HTTP header using the `Bearer` scheme.

```http
Authorization: Bearer <your_jwt_token>
```

- Missing token (`401 Unauthorized`):
  ```json
  { "success": false, "message": "Access denied. No token provided." }
  ```
- Invalid / Malformed token (`401 Unauthorized`):
  ```json
  { "success": false, "message": "Invalid token." }
  ```

---

## npm Scripts

| Script          | Command                   | Description                          |
|-----------------|---------------------------|--------------------------------------|
| `npm start`     | `node src/server.js`      | Start the production server          |
| `npm run dev`   | `node --watch src/server.js` | Start with auto-reload (Node ≥ 18) |
| `npm run migrate` | `node scripts/migrate.js` | Apply pending database migrations   |
| `npm run seed`  | `node scripts/seed.js`    | Run pending database seeders         |

---

## Database Schema

### `users`

| Column     | Type                    | Notes                      |
|------------|-------------------------|----------------------------|
| id         | INT UNSIGNED (PK, AI)   |                            |
| name       | VARCHAR(100)            | Required                   |
| email      | VARCHAR(150) UNIQUE     | Login identifier           |
| password   | VARCHAR(255)            | bcrypt hash                |
| role       | ENUM('admin', 'user')   | Default: `user`            |
| created_at | TIMESTAMP               | Auto-set on insert         |
| updated_at | TIMESTAMP               | Auto-updated on change     |

### `tasks`

| Column      | Type                                                        | Notes                      |
|-------------|-------------------------------------------------------------|----------------------------|
| id          | INT UNSIGNED (PK, AI)                                       |                            |
| user_id     | INT UNSIGNED (FK → users.id)                                | CASCADE delete/update      |
| title       | VARCHAR(200)                                                | Required                   |
| description | TEXT                                                        | Optional                   |
| status      | ENUM('Pending', 'In Progress', 'Testing', 'Completed')      | Default: `Pending`         |
| created_at  | TIMESTAMP                                                   | Auto-set on insert         |
| updated_at  | TIMESTAMP                                                   | Auto-updated on change     |

---

## Security Notes

- Passwords are hashed with **bcryptjs** (cost factor 10) — plain-text passwords are never stored.
- All SQL queries use **parameterized statements** (`?` placeholders) to prevent SQL injection.
- JWT secrets and database passwords are read from environment variables — never hardcoded.
- `.env` is excluded from version control via `.gitignore`.

---

## Development Stages

- [x] **Stage 1** – Project foundation, database, migrations, seeders
- [x] **Stage 2** – Authentication (register, login, JWT middleware)
- [ ] **Stage 3** – Task CRUD endpoints
- [ ] **Stage 4** – Role-based access control
- [ ] **Stage 5** – Postman collection & final documentation
