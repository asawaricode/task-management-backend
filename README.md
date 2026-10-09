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
      task.controller.js     # HTTP request & response handling for tasks
    middleware/
      auth.middleware.js     # JWT Bearer token authentication & authorization
      errorHandler.js        # Centralized Express error handler
    models/
      index.js               # Central models registry
      user.model.js          # Parameterized SQL queries for users table
      task.model.js          # Parameterized SQL queries for tasks table
    routes/
      index.js               # Central route registry & health endpoint
      auth.routes.js         # Endpoints: /api/auth/register, /api/auth/login
      task.routes.js         # Endpoints: /api/tasks CRUD & status
    services/
      index.js               # Central services registry
      auth.service.js        # Authentication business logic & password hashing
      task.service.js        # Task business logic, validation & ownership checks
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
  postman/
    Task-Management-System.postman_collection.json # Importable Postman collection
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

### 5. Create Task

Creates a new task bound strictly to the authenticated user. Even if a `user_id` is supplied in the request body, it is ignored and replaced with the authenticated user's ID. Initial status defaults to `"Pending"`.

- **URL:** `POST /api/tasks`
- **Authorization:** `Bearer <token>` (Any authenticated user)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Complete assessment report",
    "description": "Finalize documentation and run tests."
  }
  ```
- **Validation Rules:**
  - `title`: Required, non-empty string, maximum 200 characters.
  - `description`: Optional text.
  - `user_id`: Ignored if provided in body; bound to `req.user.id`.
  - `status`: Ignored if provided in body; defaulted to `"Pending"`.
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Task created successfully.",
    "data": {
      "task": {
        "id": 1,
        "user_id": 2,
        "title": "Complete assessment report",
        "description": "Finalize documentation and run tests.",
        "status": "Pending",
        "created_at": "2026-10-09T08:57:29.000Z",
        "updated_at": "2026-10-09T08:57:29.000Z"
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` — Missing or blank title.
  - `401 Unauthorized` — Missing or invalid token.

- **cURL Example:**
  ```bash
  curl -X POST http://localhost:3000/api/tasks \
    -H "Authorization: Bearer <your_jwt_token>" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Write documentation\",\"description\":\"Detail all endpoints.\"}"
  ```

### 6. List Tasks (with Pagination)

Retrieves a paginated list of tasks.
- **Regular users** only see tasks they own (`user_id = req.user.id`).
- **Admins** see tasks across all users.

- **URL:** `GET /api/tasks?page=1&limit=10`
- **Authorization:** `Bearer <token>` (Any authenticated user)
- **Query Parameters:**
  - `page` (optional, integer, default: 1)
  - `limit` (optional, integer, default: 10, max: 100)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Tasks retrieved successfully.",
    "data": {
      "tasks": [
        {
          "id": 1,
          "user_id": 2,
          "title": "Complete assessment report",
          "description": "Finalize documentation and run tests.",
          "status": "Pending",
          "created_at": "2026-10-09T08:57:29.000Z",
          "updated_at": "2026-10-09T08:57:29.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "totalPages": 1
      }
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized` — Missing or invalid token.

- **cURL Example:**
  ```bash
  curl -X GET "http://localhost:3000/api/tasks?page=1&limit=10" \
    -H "Authorization: Bearer <your_jwt_token>"
  ```

### 7. Get Task by ID

Retrieves details of a single task.
- **Regular users** can retrieve only their own tasks. Inaccessible tasks return `404` to prevent resource enumeration.
- **Admins** can retrieve any task.

- **URL:** `GET /api/tasks/:id`
- **Authorization:** `Bearer <token>` (Any authenticated user)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Task retrieved successfully.",
    "data": {
      "task": {
        "id": 1,
        "user_id": 2,
        "title": "Complete assessment report",
        "description": "Finalize documentation and run tests.",
        "status": "Pending",
        "created_at": "2026-10-09T08:57:29.000Z",
        "updated_at": "2026-10-09T08:57:29.000Z"
      }
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized` — Missing or invalid token.
  - `404 Not Found` — Task does not exist or belongs to another user.

- **cURL Example:**
  ```bash
  curl -X GET http://localhost:3000/api/tasks/1 \
    -H "Authorization: Bearer <your_jwt_token>"
  ```

### 8. Update Task

Updates `title` and `description` of a task.
- **Regular users** can edit only tasks they own.
- **Admins** can edit any task.
- Cannot change `user_id` or `status` via this endpoint.

- **URL:** `PUT /api/tasks/:id`
- **Authorization:** `Bearer <token>` (Any authenticated user)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Updated assessment title",
    "description": "Updated description text."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Task updated successfully.",
    "data": {
      "task": {
        "id": 1,
        "user_id": 2,
        "title": "Updated assessment title",
        "description": "Updated description text.",
        "status": "Pending",
        "created_at": "2026-10-09T08:57:29.000Z",
        "updated_at": "2026-10-09T08:58:12.000Z"
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` — Missing or blank title.
  - `401 Unauthorized` — Missing or invalid token.
  - `404 Not Found` — Task does not exist or belongs to another user.

- **cURL Example:**
  ```bash
  curl -X PUT http://localhost:3000/api/tasks/1 \
    -H "Authorization: Bearer <your_jwt_token>" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Updated title\",\"description\":\"New description.\"}"
  ```

### 9. Update Task Status (Admin Only)

Updates a task's status. Restricted strictly to users with the `admin` role.

- **URL:** `PATCH /api/tasks/:id/status`
- **Authorization:** `Bearer <admin_jwt_token>` (Admin role only)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "status": "In Progress"
  }
  ```
- **Allowed Statuses:** `Pending`, `In Progress`, `Testing`, `Completed`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Task status updated successfully.",
    "data": {
      "task": {
        "id": 1,
        "user_id": 2,
        "title": "Updated assessment title",
        "description": "Updated description text.",
        "status": "In Progress",
        "created_at": "2026-10-09T08:57:29.000Z",
        "updated_at": "2026-10-09T08:59:05.000Z"
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` — Status is missing or not one of the allowed values.
  - `401 Unauthorized` — Missing or invalid token.
  - `403 Forbidden` — Authenticated as regular user (`role: user`).
  - `404 Not Found` — Task does not exist.

- **cURL Example:**
  ```bash
  curl -X PATCH http://localhost:3000/api/tasks/1/status \
    -H "Authorization: Bearer <admin_jwt_token>" \
    -H "Content-Type: application/json" \
    -d "{\"status\":\"Completed\"}"
  ```

---

## Postman Collection

An importable Postman collection is provided at:
[`postman/Task-Management-System.postman_collection.json`](file:///c:/Users/Admin/Desktop/TASK-MANAGEMENT-SYSTEM/postman/Task-Management-System.postman_collection.json)

### Importing into Postman
1. Open Postman.
2. Click **Import** (top-left).
3. Select or drag-and-drop [`postman/Task-Management-System.postman_collection.json`](file:///c:/Users/Admin/Desktop/TASK-MANAGEMENT-SYSTEM/postman/Task-Management-System.postman_collection.json).
4. The **Task Management System API** collection will appear in your workspace.

### Collection Variables

| Variable | Default Value | Description |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | Target API host and port |
| `adminToken` | *(Dynamic)* | JWT token automatically captured on Admin Login |
| `userToken` | *(Dynamic)* | JWT token automatically captured on User Login |
| `taskId` | `1` *(Dynamic)* | ID of task owned by regular user (captured on create) |
| `otherTaskId` | `2` *(Dynamic)* | ID of task owned by admin / another user |

### Automated Scripts & Tests
- **Automatic Token Storage**: Logging in as admin or user automatically captures and stores tokens in collection and environment variables.
- **Dynamic Task Linking**: Creating a task as regular user stores `taskId` for subsequent retrieval and update tests.
- **Pre-configured Assertions**: Each request includes tests verifying status codes, payload structures, role access control, and error handling.

### Included Test Requests (20 Scenarios + Health Check)
1. **Health Check**: `GET /` — Confirms server is online.
2. **01 - Register a regular user**: `POST /api/auth/register` — Successful registration with role `user`.
3. **02 - Register with missing fields**: `POST /api/auth/register` — Returns 400 Bad Request.
4. **03 - Attempt duplicate registration**: `POST /api/auth/register` — Returns 409 Conflict.
5. **04 - Login as the seeded admin**: `POST /api/auth/login` — Returns 200 and captures `adminToken`.
6. **05 - Login as the seeded regular user**: `POST /api/auth/login` — Returns 200 and captures `userToken`.
7. **06 - Login with invalid credentials**: `POST /api/auth/login` — Returns 401 Unauthorized.
8. **07 - Create a task as a regular user**: `POST /api/tasks` — Returns 201, status defaults to `Pending`, captures `taskId`.
9. **08 - List tasks as a regular user**: `GET /api/tasks` — Returns only owned tasks with pagination.
10. **09 - Retrieve a task by ID**: `GET /api/tasks/:id` — Returns owned task details.
11. **10 - Update an owned task**: `PUT /api/tasks/:id` — Updates title and description.
12. **Setup - Create task as admin**: `POST /api/tasks` — Captures `otherTaskId` for cross-access tests.
13. **11 - Attempt to retrieve another user's task**: `GET /api/tasks/:id` — Returns 404 (prevents resource disclosure).
14. **12 - Attempt to edit another user's task**: `PUT /api/tasks/:id` — Returns 404 Not Found.
15. **13 - Attempt to create a task with a spoofed user_id**: `POST /api/tasks` — Body `user_id` and `status` ignored.
16. **14 - List tasks as admin**: `GET /api/tasks` — Returns all tasks across all users.
17. **15 - Retrieve another user's task as admin**: `GET /api/tasks/:id` — Admin successfully accesses task.
18. **16 - Edit another user's task as admin**: `PUT /api/tasks/:id` — Admin successfully edits task.
19. **17 - Attempt to update task status as a regular user**: `PATCH /api/tasks/:id/status` — Returns 403 Forbidden.
20. **18 - Update task status as admin**: `PATCH /api/tasks/:id/status` — Status updated to `In Progress`.
21. **19 - Attempt an invalid task status**: `PATCH /api/tasks/:id/status` — Returns 400 Bad Request.
22. **20 - Attempt to access a protected endpoint without a token**: `GET /api/tasks` — Returns 401 Unauthorized.

---

## Assumptions and Design Decisions

1. **Stateless JWT Bearer Authentication**:
   - Authentication relies strictly on standard `Authorization: Bearer <token>` headers.
   - Cookies and server-side sessions are excluded to maintain stateless horizontal scalability.

2. **Strict Layered Separation of Concerns**:
   - `Routes`: Declare URL paths and bind middleware.
   - `Controllers`: Parse HTTP requests, delegate to services, format JSON responses.
   - `Services`: Encapsulate domain business logic, data validation, and permission checks.
   - `Models`: Contain all SQL statements with parameterized queries using `mysql2`.
   - `Middleware`: Authentication (`authenticate`), role authorization (`authorize`), and centralized error handling.

3. **Privacy-Preserving 404 Errors**:
   - When a regular user attempts to retrieve or edit a task owned by another user, the API responds with `404 Not Found` rather than `403 Forbidden`.
   - This prevents malicious callers from enumerating task IDs and discovering whether specific tasks exist.

4. **Task Ownership and Default Status Integrity**:
   - Public task creation (`POST /api/tasks`) forces `user_id` to `req.user.id` and `status` to `'Pending'`.
   - Any client-provided `user_id` or `status` in the request body is intentionally ignored.

5. **Separation of Task Content Editing and Status Transitions**:
   - `PUT /api/tasks/:id` only allows modifying `title` and `description`. It cannot alter `user_id` or `status`.
   - Status changes are strictly managed through `PATCH /api/tasks/:id/status`, which is reserved exclusively for users with the `admin` role.

6. **Restricted Public Registration**:
   - `POST /api/auth/register` automatically assigns the `'user'` role.
   - Administrative accounts cannot be created through the public API; they are provisioned via database seeders.

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
- [x] **Stage 3** – Task CRUD endpoints
- [x] **Stage 4** – Postman collection & final verification
