# CodeCraftHub API

A personal learning goal tracker REST API built with Node.js and Express. Developers can manage courses they want to learn, track progress, and set target completion dates — all stored in a simple JSON file.

---

## Features

- Full CRUD operations for course management
- Auto-generated course IDs and timestamps
- Status tracking: `Not Started`, `In Progress`, `Completed`
- Input validation with descriptive error messages
- No database required — data stored in a local JSON file
- Lightweight and beginner-friendly codebase

---

## Project Structure

```
backend/
├── app.js              # Main Express server and all API routes
├── package.json        # Project metadata and dependencies
├── README.md           # This file
└── data/
    └── courses.json    # JSON file used as the data store (auto-created)
```

---

## Installation

**Prerequisites:** Node.js v14 or higher installed on your machine.
Check your version with: `node --version`

**1. Clone or download the project, then navigate to the backend folder:**
```bash
cd backend
```

**2. Install dependencies:**
```bash
npm install
```

---

## Running the Application

```bash
npm start
```

The server will start on **http://localhost:5000**

You should see:
```
CodeCraftHub API is running on http://localhost:5000
Available endpoints:
  POST   /api/courses        - Add a new course
  GET    /api/courses        - Get all courses
  GET    /api/courses/:id    - Get a specific course
  PUT    /api/courses/:id    - Update a course
  DELETE /api/courses/:id    - Delete a course
```

> The `data/courses.json` file is created automatically on first run if it does not exist.

---

## API Endpoints

### Course Object Structure

| Field        | Type   | Description                                      |
|--------------|--------|--------------------------------------------------|
| `id`         | number | Auto-generated unique identifier (starts at 1)   |
| `name`       | string | Course name (required)                           |
| `description`| string | Short description of the course (required)       |
| `target_date`| string | Target completion date in `YYYY-MM-DD` (required)|
| `status`     | string | `Not Started`, `In Progress`, or `Completed` (required) |
| `created_at` | string | Auto-generated ISO timestamp                     |

---

### POST /api/courses
Add a new course.

**Request Body:**
```json
{
  "name": "Node.js Basics",
  "description": "Learn how to build REST APIs with Express",
  "target_date": "2025-12-31",
  "status": "Not Started"
}
```

**Success Response — 201 Created:**
```json
{
  "message": "Course created successfully.",
  "course": {
    "id": 1,
    "name": "Node.js Basics",
    "description": "Learn how to build REST APIs with Express",
    "target_date": "2025-12-31",
    "status": "Not Started",
    "created_at": "2025-04-27T10:00:00.000Z"
  }
}
```

**curl example:**
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"name":"Node.js Basics","description":"Learn how to build REST APIs with Express","target_date":"2025-12-31","status":"Not Started"}'
```

---

### GET /api/courses
Retrieve all courses.

**Success Response — 200 OK:**
```json
{
  "total": 2,
  "courses": [
    {
      "id": 1,
      "name": "Node.js Basics",
      "description": "Learn how to build REST APIs with Express",
      "target_date": "2025-12-31",
      "status": "Not Started",
      "created_at": "2025-04-27T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "React for Beginners",
      "description": "Build interactive UIs with React",
      "target_date": "2025-11-15",
      "status": "In Progress",
      "created_at": "2025-04-27T11:00:00.000Z"
    }
  ]
}
```

**curl example:**
```bash
curl http://localhost:5000/api/courses
```

---

### GET /api/courses/:id
Retrieve a single course by its ID.

**Success Response — 200 OK:**
```json
{
  "course": {
    "id": 1,
    "name": "Node.js Basics",
    "description": "Learn how to build REST APIs with Express",
    "target_date": "2025-12-31",
    "status": "Not Started",
    "created_at": "2025-04-27T10:00:00.000Z"
  }
}
```

**curl example:**
```bash
curl http://localhost:5000/api/courses/1
```

---

### PUT /api/courses/:id
Update one or more fields of an existing course. Only the fields you include in the request body will be changed.

**Request Body (all fields optional):**
```json
{
  "status": "In Progress"
}
```

**Success Response — 200 OK:**
```json
{
  "message": "Course updated successfully.",
  "course": {
    "id": 1,
    "name": "Node.js Basics",
    "description": "Learn how to build REST APIs with Express",
    "target_date": "2025-12-31",
    "status": "In Progress",
    "created_at": "2025-04-27T10:00:00.000Z"
  }
}
```

**curl example:**
```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"In Progress"}'
```

---

### DELETE /api/courses/:id
Delete a course by its ID.

**Success Response — 200 OK:**
```json
{
  "message": "Course \"Node.js Basics\" deleted successfully.",
  "course": {
    "id": 1,
    "name": "Node.js Basics",
    "description": "Learn how to build REST APIs with Express",
    "target_date": "2025-12-31",
    "status": "In Progress",
    "created_at": "2025-04-27T10:00:00.000Z"
  }
}
```

**curl example:**
```bash
curl -X DELETE http://localhost:5000/api/courses/1
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Descriptive error message here."
}
```

| HTTP Status | Meaning                                              |
|-------------|------------------------------------------------------|
| `400`       | Bad Request — missing fields or invalid values       |
| `404`       | Not Found — course ID does not exist, or unknown route |
| `500`       | Server Error — file read/write failure               |

---

## Troubleshooting

**`Cannot find module 'express'`**
> You haven't installed dependencies yet. Run `npm install` in the `backend` folder.

**`EADDRINUSE: address already in use :::5000`**
> Port 5000 is already occupied by another process. Either stop the other process or change the `PORT` variable at the top of `app.js` to a different number (e.g., `3000`).

**`ENOENT: no such file or directory ... courses.json`**
> This should not happen normally — the app creates the file automatically. If it does occur, manually create the `data/` folder and add an empty `courses.json` file containing `[]`.

**Sending a request but getting no response**
> Make sure the server is running (`npm start`) and that you are sending requests to `http://localhost:5000`, not `https://`.

**`SyntaxError` in `courses.json`**
> The JSON file has been manually edited and is no longer valid JSON. Replace the entire file content with `[]` to reset it.
