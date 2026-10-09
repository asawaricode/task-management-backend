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
      db.js            # MySQL connection pool
    controllers/       # Route handler logic (added in later stages)
    middleware/        # Auth & validation middleware (added in later stages)
    routes/            # Express routers (added in later stages)
    app.js             # Express app setup
    server.js          # Server entry point
  database/
    migrations/
      001_create_users_table.js
      002_create_tasks_table.js
    seeders/
      001_seed_users.js
  scripts/
    migrate.js         # Versioned migration runner
    seed.js            # Seeder runner
  postman/             # Postman collection (added in later stages)
  .env.example         # Environment variable template
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
- [ ] **Stage 2** – Authentication (register, login, JWT middleware)
- [ ] **Stage 3** – Task CRUD endpoints
- [ ] **Stage 4** – Role-based access control
- [ ] **Stage 5** – Postman collection & final documentation
