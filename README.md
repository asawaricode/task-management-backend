# Task Management System API

A professional RESTful Task Management API built with **Node.js**, **Express.js**, and **MySQL**, featuring stateless **JSON Web Token (JWT)** authentication and strict **Role-Based Access Control (RBAC)**.

Designed following a clean, layered architectural pattern:
`Routes → Middleware → Controllers → Services → Models → MySQL`

---

## Table of Contents

1. [Key Features](#key-features)
2. [Technology Stack](#technology-stack)
3. [Project Architecture & Structure](#project-architecture--structure)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [MySQL Database Configuration](#mysql-database-configuration)
7. [Environment Variables](#environment-variables)
8. [Database Migrations & Seeders](#database-migrations--seeders)
9. [Running the Application](#running-the-application)
10. [API Endpoints Summary](#api-endpoints-summary)
11. [Authentication & Authorization](#authentication--authorization)
12. [Task Statuses & Workflow](#task-statuses--workflow)
13. [Detailed Endpoint Documentation](#detailed-endpoint-documentation)
14. [Seeded Development Credentials](#seeded-development-credentials)
15. [Postman Collection Guide](#postman-collection-guide)
16. [Security Notes & Design Decisions](#security-notes--design-decisions)
17. [npm Scripts](#npm-scripts)

---

## Key Features

- **Stateless Authentication**: User registration and login utilizing signed JSON Web Tokens (JWT) via standard HTTP `Bearer` tokens.
- **Strong Password Hashing**: Passwords hashed with `bcryptjs` (salt cost factor 10); plaintext passwords are never stored or exposed.
- **Role-Based Access Control (RBAC)**: Distinguishes between `user` and `admin` roles.
  - Public registration strictly provisions the `user` role (preventing privilege escalation).
  - Regular users can create, view, and edit only their own tasks.
  - Inaccessible tasks return `404 Not Found` to prevent task enumeration and information leakage.
  - Administrators can view and edit tasks belonging to any user.
  - Task status updates are restricted exclusively to administrators.
- **Clean Layered Architecture**: Strict separation of concerns (no SQL outside models, no HTTP logic outside controllers/middleware).
- **SQL Injection Prevention**: 100% parameterized queries (`?` placeholders) executed via `mysql2`.
- **Automated, Idempotent Migrations & Seeders**: Custom versioned runners tracking execution in `database_migrations` and `database_seeders` tables.
- **Importable Postman Collection**: Automated token capture, dynamic ID linkage, and assertions covering 20 test scenarios.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Runtime** | Node.js (≥ 18.x) | Server-side JavaScript runtime |
| **Framework** | Express.js 4.x | Fast, unopinionated HTTP routing and middleware |
| **Language** | JavaScript (CommonJS) | Standard Node.js module system (`require` / `module.exports`) |
| **Database** | MySQL (5.7 / 8.x) | Relational SQL database storage |
| **Database Driver** | `mysql2` | High-performance MySQL client with Promise API |
| **Authentication** | `jsonwebtoken` (JWT) | Stateless token creation and verification |
| **Password Security** | `bcryptjs` | One-way cryptographic password hashing |
| **Configuration** | `dotenv` | Environment variable management |

---

## Project Architecture & Structure

The codebase enforces a unidirectional layered architecture:
```
HTTP Request
     ↓
  Routes         (URL definitions and middleware binding)
     ↓
Middleware       (JWT authentication, role authorization, error handling)
     ↓
Controllers      (HTTP request parsing and response generation)
     ↓
 Services        (Business logic, validation rules, ownership checks)
     ↓
  Models         (Parameterized SQL queries via mysql2 connection pool)
     ↓
  MySQL          (Relational database)
```

```
task-management-system/
  src/
    config/
      db.js                  # MySQL connection pool and connectivity testing
    controllers/
      auth.controller.js     # HTTP request & response handlers for auth
      task.controller.js     # HTTP request & response handlers for tasks
    middleware/
      auth.middleware.js     # JWT Bearer authentication and role-checking middleware
      errorHandler.js        # Centralized Express error-handling middleware
    models/
      index.js               # Central models export registry
      user.model.js          # Parameterized SQL queries for `users` table
      task.model.js          # Parameterized SQL queries for `tasks` table
    routes/
      index.js               # Root API router (mounts /api/auth, /api/tasks, GET /)
      auth.routes.js         # Endpoints: /api/auth/register, /api/auth/login
      task.routes.js         # Endpoints: /api/tasks CRUD & status update
    services/
      index.js               # Central services export registry
      auth.service.js        # Auth business logic, validation, password hashing, JWT signing
      task.service.js        # Task business logic, validation, ownership checks
    app.js                   # Express application setup, global middleware & 404 handler
    server.js                # Server entry point: verifies DB then starts HTTP listener
  database/
    migrations/
      001_create_users_table.js   # Migration for `users` table
      002_create_tasks_table.js   # Migration for `tasks` table
    seeders/
      001_seed_users.js           # Seeder for initial admin and user accounts
  scripts/
    migrate.js               # Idempotent database migration runner
    seed.js                  # Idempotent database seeder runner
  postman/
    Task-Management-System.postman_collection.json # Complete importable Postman collection
  .env.example               # Template for required environment variables
  .gitignore                 # Git ignore file (excludes .env, node_modules/)
  package.json               # Project manifest, scripts, and dependencies
  package-lock.json          # Dependency lockfile
  README.md                  # Comprehensive project documentation
```

---

## Prerequisites

Before setting up the project, ensure you have the following installed:
- **Node.js** (version 18.0.0 or higher) — check with `node -v`
- **npm** (version 9.x or higher) — check with `npm -v`
- **MySQL Server** (version 5.7 or 8.x) running locally or accessible via network

---

## Installation & Setup

1. **Clone or navigate to the project directory**:
   ```bash
   cd task-management-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

---

## MySQL Database Configuration

1. Log into your MySQL console or management client:
   ```bash
   mysql -u root -p
   ```

2. Create the project database:
   ```sql
   CREATE DATABASE task_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. Confirm database creation:
   ```sql
   SHOW DATABASES LIKE 'task_management_db';
   EXIT;
   ```

---

## Environment Variables

Copy `.env.example` to create your local `.env` configuration file:

```bash
cp .env.example .env
```

Open `.env` and fill in your MySQL credentials and application settings:

| Variable | Description | Default / Example Value |
|---|---|---|
| `PORT` | HTTP port on which the Express server listens | `3000` |
| `DB_HOST` | MySQL database server hostname | `localhost` |
| `DB_PORT` | MySQL database server port | `3306` |
| `DB_USER` | MySQL database user | `root` |
| `DB_PASSWORD` | MySQL database password | *(your local password)* |
| `DB_NAME` | MySQL database name | `task_management_db` |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens | *(a secure random string)* |
| `JWT_EXPIRES_IN` | Token expiration period | `1d` |

> **Security Note:** The `.env` file is excluded from Git tracking via `.gitignore`. Never commit credentials to version control.

---

## Database Migrations & Seeders

### 1. Run Migrations
Applies pending SQL schema definitions and initializes `database_migrations` tracking:
```bash
npm run migrate
```
*Creates the `users` and `tasks` tables with proper primary keys, foreign key constraints, indexes, and timestamps.*

### 2. Run Seeders
Populates the database with initial development accounts and initializes `database_seeders` tracking:
```bash
npm run seed
```
*Creates one seeded `admin` account and one seeded `user` account with hashed passwords.*

Both commands are **idempotent** — subsequent executions automatically skip previously applied migrations and seeders.

---

## Running the Application

### Start Production Server
```bash
npm start
```

### Start Development Server (with Auto-Reload)
```bash
npm run dev
```

Upon successful startup, the console displays:
```
Database connection established successfully.
Server is running on http://localhost:3000
```

Verify the server is running by opening `http://localhost:3000` in your browser or executing:
```bash
curl http://localhost:3000/
```

Expected response:
```json
{
  "success": true,
  "message": "Task Management System API is running.",
  "version": "1.0.0"
}
```

---

## API Endpoints Summary

Base URL: `http://localhost:3000`

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET` | `/` | Public | Health-check endpoint confirming server status |
| `POST` | `/api/auth/register` | Public | Register a new user account (forces role: `user`) |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and receive a JWT |
| `POST` | `/api/tasks` | Authenticated | Create a new task (bound to authenticated user, default status: `Pending`) |
| `GET` | `/api/tasks` | Authenticated | List tasks with pagination (`user` sees own tasks, `admin` sees all tasks) |
| `GET` | `/api/tasks/:id` | Authenticated | Retrieve task by ID (`user` accesses own, `admin` accesses any; returns 404 if inaccessible) |
| `PUT` | `/api/tasks/:id` | Authenticated | Update task title and description (`user` updates own, `admin` updates any) |
| `PATCH` | `/api/tasks/:id/status` | **Admin Only** | Update task status (`Pending`, `In Progress`, `Testing`, `Completed`) |

---

## Authentication & Authorization

All endpoints under `/api/tasks` are protected by JWT Bearer token authentication.

### Supplying the Token
Include the JWT in the standard HTTP `Authorization` request header:
```http
Authorization: Bearer <your_jwt_token>
```

### Authentication Errors
- **Missing Token** (`401 Unauthorized`):
  ```json
  { "success": false, "message": "Access denied. No token provided." }
  ```
- **Invalid / Expired Token** (`401 Unauthorized`):
  ```json
  { "success": false, "message": "Invalid token." }
  ```
- **Insufficient Permissions** (`403 Forbidden`):
  ```json
  { "success": false, "message": "Access denied. Insufficient permissions." }
  ```

---

## Task Statuses & Workflow

The `tasks` table enforces an `ENUM` with four valid status states:

1. `Pending` — Default status automatically assigned when a task is created.
2. `In Progress` — Task is currently being worked on.
3. `Testing` — Task implementation is complete and undergoing review/testing.
4. `Completed` — Task is finished.

> **Status Transition Rule:** Only users with the `admin` role are permitted to change a task's status via `PATCH /api/tasks/:id/status`. Regular users cannot modify task status.

---

## Detailed Endpoint Documentation

### 1. Health Check
- **Endpoint:** `GET /`
- **Access:** Public
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Task Management System API is running.",
    "version": "1.0.0"
  }
  ```

---

### 2. Register User
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123"
  }
  ```
- **Validation Rules:**
  - `name`: Required, non-empty string.
  - `email`: Required, valid email format, unique across users.
  - `password`: Required, minimum 6 characters.
  - `role`: Automatically assigned to `'user'` (any role provided in the body is ignored).
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
- **Common Errors:**
  - `400 Bad Request`: Missing fields, invalid email format, or short password.
  - `409 Conflict`: Email already registered.

---

### 3. User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123"
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
- **Common Errors:**
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Invalid email or incorrect password (generic message prevents user enumeration).

---

### 4. Create Task
- **Endpoint:** `POST /api/tasks`
- **Access:** Authenticated (Any role)
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Set up production monitoring",
    "description": "Configure health checks and alert notifications."
  }
  ```
- **Validation Rules:**
  - `title`: Required, non-empty, max 200 characters.
  - `description`: Optional text.
  - `user_id`: Automatically set to `req.user.id` (any client-supplied `user_id` is ignored).
  - `status`: Automatically set to `'Pending'` (any client-supplied status is ignored).
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Task created successfully.",
    "data": {
      "task": {
        "id": 1,
        "user_id": 2,
        "title": "Set up production monitoring",
        "description": "Configure health checks and alert notifications.",
        "status": "Pending",
        "created_at": "2026-10-09T08:57:29.000Z",
        "updated_at": "2026-10-09T08:57:29.000Z"
      }
    }
  }
  ```

---

### 5. List Tasks (with Pagination)
- **Endpoint:** `GET /api/tasks?page=1&limit=10`
- **Access:** Authenticated (Any role)
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `page`: Page number (default: `1`, minimum: `1`).
  - `limit`: Number of tasks per page (default: `10`, maximum: `100`).
- **Access Scope:**
  - Regular users only see tasks they own (`WHERE user_id = req.user.id`).
  - Administrators see all tasks across all users.
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
          "title": "Set up production monitoring",
          "description": "Configure health checks and alert notifications.",
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

---

### 6. Get Task by ID
- **Endpoint:** `GET /api/tasks/:id`
- **Access:** Authenticated (Any role)
- **Headers:** `Authorization: Bearer <token>`
- **Access Scope:**
  - Regular users can access only their own tasks.
  - If a regular user attempts to access a task owned by someone else, the API returns `404 Not Found` (avoids resource disclosure).
  - Administrators can access any task by ID.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Task retrieved successfully.",
    "data": {
      "task": {
        "id": 1,
        "user_id": 2,
        "title": "Set up production monitoring",
        "description": "Configure health checks and alert notifications.",
        "status": "Pending",
        "created_at": "2026-10-09T08:57:29.000Z",
        "updated_at": "2026-10-09T08:57:29.000Z"
      }
    }
  }
  ```
- **Common Errors:**
  - `404 Not Found`: Task does not exist or belongs to another user.

---

### 7. Update Task
- **Endpoint:** `PUT /api/tasks/:id`
- **Access:** Authenticated (Any role)
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Set up production monitoring - Revised",
    "description": "Include Discord and email alerts."
  }
  ```
- **Rules:**
  - Updates only `title` and `description`.
  - Regular users can only update tasks they own (returns `404 Not Found` if task belongs to another user).
  - Administrators can update tasks belonging to any user.
  - Cannot alter `user_id` or `status` via this endpoint.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Task updated successfully.",
    "data": {
      "task": {
        "id": 1,
        "user_id": 2,
        "title": "Set up production monitoring - Revised",
        "description": "Include Discord and email alerts.",
        "status": "Pending",
        "created_at": "2026-10-09T08:57:29.000Z",
        "updated_at": "2026-10-09T09:12:45.000Z"
      }
    }
  }
  ```

---

### 8. Update Task Status
- **Endpoint:** `PATCH /api/tasks/:id/status`
- **Access:** **Administrator Only** (`role: admin`)
- **Headers:**
  - `Authorization: Bearer <admin_jwt_token>`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "status": "In Progress"
  }
  ```
- **Allowed Statuses:** `Pending`, `In Progress`, `Testing`, `Completed`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Task status updated successfully.",
    "data": {
      "task": {
        "id": 1,
        "user_id": 2,
        "title": "Set up production monitoring - Revised",
        "description": "Include Discord and email alerts.",
        "status": "In Progress",
        "created_at": "2026-10-09T08:57:29.000Z",
        "updated_at": "2026-10-09T09:15:30.000Z"
      }
    }
  }
  ```
- **Common Errors:**
  - `400 Bad Request`: Status value is missing or not one of the allowed four statuses.
  - `403 Forbidden`: Authenticated user is not an administrator.
  - `404 Not Found`: Task does not exist.

---

## Seeded Development Credentials

The seeder (`database/seeders/001_seed_users.js`) automatically provisions two development accounts. Passwords are saved as secure bcrypt hashes. Evaluators can use these accounts to verify role-based permissions immediately:

| Role | Email | Password | Allowed Capabilities |
|---|---|---|---|
| **admin** | `admin@example.com` | `Admin@1234` | Full access: View & edit any user's tasks, update task status |
| **user** | `user@example.com` | `User@1234` | Regular access: Create tasks, view & edit only own tasks |

> **Security Note:** In a production environment, seeded credentials should be changed or removed immediately after deployment.

---

## Postman Collection Guide

An importable, pre-configured Postman collection is included in the repository at:
[`postman/Task-Management-System.postman_collection.json`](file:///c:/Users/Admin/Desktop/TASK-MANAGEMENT-SYSTEM/postman/Task-Management-System.postman_collection.json)

### Importing the Collection
1. Launch **Postman**.
2. Click **Import** in the upper-left corner.
3. Select or drag-and-drop `postman/Task-Management-System.postman_collection.json`.
4. The collection **Task Management System API** will appear in your workspace.

### Collection Variables
The collection defines variables that dynamically manage state across requests:

| Variable | Default Value | Description |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | Target server URL |
| `adminToken` | *(Dynamic)* | Automatically populated upon Admin Login |
| `userToken` | *(Dynamic)* | Automatically populated upon User Login |
| `taskId` | `1` *(Dynamic)* | Automatically populated when regular user creates a task |
| `otherTaskId` | `2` *(Dynamic)* | Automatically populated for cross-user permission checks |

### Running the Collection
- **Automated Token Capture**: Running `04 - Login as the seeded admin` or `05 - Login as the seeded regular user` automatically extracts the JWT token from the response and saves it to `adminToken` and `userToken`.
- **Automated Task Linking**: Running `07 - Create a task as a regular user` stores the newly generated task ID in `taskId`.
- **Collection Runner**: You can execute the entire collection sequentially via Postman's **Run collection** feature. All 20 requests and health checks pass out-of-the-box.

### Covered Requests
1. `GET /` — Health Check
2. `POST /api/auth/register` — 01: Register regular user
3. `POST /api/auth/register` — 02: Register with missing fields (expects 400)
4. `POST /api/auth/register` — 03: Duplicate registration (expects 409)
5. `POST /api/auth/login` — 04: Login as seeded admin (saves `adminToken`)
6. `POST /api/auth/login` — 05: Login as seeded regular user (saves `userToken`)
7. `POST /api/auth/login` — 06: Login with invalid credentials (expects 401)
8. `POST /api/tasks` — 07: Create task as regular user (saves `taskId`)
9. `GET /api/tasks` — 08: List tasks as regular user (only own tasks)
10. `GET /api/tasks/:id` — 09: Retrieve task by ID
11. `PUT /api/tasks/:id` — 10: Update owned task
12. `POST /api/tasks` — Setup: Create task as admin (saves `otherTaskId`)
13. `GET /api/tasks/:id` — 11: Attempt retrieve another user's task (expects 404)
14. `PUT /api/tasks/:id` — 12: Attempt edit another user's task (expects 404)
15. `POST /api/tasks` — 13: Attempt create task with spoofed `user_id` (verifies spoof ignored)
16. `GET /api/tasks` — 14: List tasks as admin (sees all tasks across users)
17. `GET /api/tasks/:id` — 15: Retrieve another user's task as admin (allowed)
18. `PUT /api/tasks/:id` — 16: Edit another user's task as admin (allowed)
19. `PATCH /api/tasks/:id/status` — 17: Attempt status update as regular user (expects 403)
20. `PATCH /api/tasks/:id/status` — 18: Update status as admin (expects 200)
21. `PATCH /api/tasks/:id/status` — 19: Attempt invalid status (expects 400)
22. `GET /api/tasks` — 20: Attempt access protected route without token (expects 401)

---

## Security Notes & Design Decisions

1. **Stateless JWT Bearer Authentication**:
   - The API relies strictly on standard HTTP `Authorization: Bearer <token>` headers.
   - Cookies and server sessions were intentionally excluded to allow horizontal scaling without state persistence.

2. **Privacy-Preserving 404 Responses**:
   - When a user attempts to view or update a task owned by someone else, the API returns `404 Not Found` rather than `403 Forbidden`.
   - This prevents attackers from guessing sequential task IDs to discover whether private resources exist.

3. **Protection Against Privilege Escalation**:
   - `POST /api/auth/register` explicitly hardcodes `role: 'user'` when inserting rows. Public registrations cannot specify an `admin` role.
   - `POST /api/tasks` binds `user_id` strictly from `req.user.id` extracted from the verified JWT, ignoring any `user_id` submitted in the request body.

4. **Strict Separation of Task Updates**:
   - `PUT /api/tasks/:id` is scoped strictly to content editing (`title` and `description`). It cannot reassign task ownership or update status.
   - `PATCH /api/tasks/:id/status` is the sole endpoint permitted to change status and is restricted to administrators.

5. **SQL Injection Defense**:
   - Every database query uses prepared parameterized statements (`?` placeholders). User input is never concatenated directly into SQL queries.

6. **Centralized Error Handling**:
   - Database connection errors and uncaught exceptions are caught by [`src/middleware/errorHandler.js`](file:///c:/Users/Admin/Desktop/TASK-MANAGEMENT-SYSTEM/src/middleware/errorHandler.js).
   - Internal stack traces are logged server-side and never leaked to API clients.

---

## npm Scripts

| Script | Command | Description |
|---|---|---|
| `npm start` | `node src/server.js` | Starts the production server |
| `npm run dev` | `node --watch src/server.js` | Starts the server with Node.js built-in file watching (Node ≥ 18) |
| `npm run migrate` | `node scripts/migrate.js` | Applies pending database migrations |
| `npm run seed` | `node scripts/seed.js` | Runs database seeders to populate initial users |
