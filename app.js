// ============================================================
// CodeCraftHub - Personal Learning Goal Tracker API
// app.js - Main entry point for the Express REST API
// ============================================================

const express = require('express');
const fs = require('fs');
const path = require('path');

// Create the Express application
const app = express();

// Define the port the server will listen on
const PORT = 5000;

// Path to the JSON file that acts as our database
const DATA_FILE = path.join(__dirname, 'data', 'courses.json');

// The only valid status values a course can have
const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed'];

// ============================================================
// Middleware
// Express needs this to parse incoming JSON request bodies
// Without it, req.body would be undefined on POST/PUT requests
// ============================================================
app.use(express.json());

// ============================================================
// Helper Functions
// These functions handle reading and writing to the JSON file
// ============================================================

/**
 * Reads all courses from the JSON file.
 * Returns an empty array if the file doesn't exist yet.
 */
function readCourses() {
  // If the data file doesn't exist, create it with an empty array
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }

  // Read the file content as a string, then parse it into a JS array
  const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(fileContent);
}

/**
 * Saves the courses array to the JSON file.
 * JSON.stringify with (null, 2) makes the file human-readable.
 */
function writeCourses(courses) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(courses, null, 2));
}

/**
 * Generates the next auto-increment ID.
 * Finds the highest existing ID and adds 1.
 * Returns 1 if there are no courses yet.
 */
function getNextId(courses) {
  if (courses.length === 0) return 1;
  const maxId = Math.max(...courses.map(c => c.id));
  return maxId + 1;
}

// ============================================================
// ROUTES
// ============================================================

// ------------------------------------------------------------
// POST /api/courses - Add a new course
// ------------------------------------------------------------
app.post('/api/courses', (req, res) => {
  try {
    // Destructure the expected fields from the request body
    const { name, description, target_date, status } = req.body;

    // --- Validation: Check all required fields are present ---
    if (!name || !description || !target_date || !status) {
      return res.status(400).json({
        error: 'Missing required fields: name, description, target_date, and status are all required.'
      });
    }

    // --- Validation: Status must be one of the allowed values ---
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: "${VALID_STATUSES.join('", "')}".`
      });
    }

    // --- Validation: target_date must match YYYY-MM-DD format ---
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(target_date)) {
      return res.status(400).json({
        error: 'Invalid target_date format. Use YYYY-MM-DD (e.g., 2025-12-31).'
      });
    }

    // Read existing courses from the file
    const courses = readCourses();

    // Build the new course object
    const newCourse = {
      id: getNextId(courses),       // Auto-generated ID
      name,
      description,
      target_date,
      status,
      created_at: new Date().toISOString()  // Auto-generated timestamp
    };

    // Add the new course to the array and save it
    courses.push(newCourse);
    writeCourses(courses);

    // Respond with 201 Created and the new course data
    res.status(201).json({
      message: 'Course created successfully.',
      course: newCourse
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error while creating course.', details: err.message });
  }
});

// ------------------------------------------------------------
// GET /api/courses - Get all courses
// ------------------------------------------------------------
app.get('/api/courses', (req, res) => {
  try {
    const courses = readCourses();

    res.status(200).json({
      total: courses.length,
      courses
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error while reading courses.', details: err.message });
  }
});

// ------------------------------------------------------------
// GET /api/courses/stats - Get course statistics
// NOTE: This route must be defined BEFORE /api/courses/:id
// Otherwise Express would treat "stats" as an :id value
// ------------------------------------------------------------
app.get('/api/courses/stats', (req, res) => {
  try {
    const courses = readCourses();

    // Count courses for each status using filter
    const stats = {
      total: courses.length,
      by_status: {
        'Not Started': courses.filter(c => c.status === 'Not Started').length,
        'In Progress': courses.filter(c => c.status === 'In Progress').length,
        'Completed':   courses.filter(c => c.status === 'Completed').length
      }
    };

    res.status(200).json({ stats });

  } catch (err) {
    res.status(500).json({ error: 'Server error while retrieving stats.', details: err.message });
  }
});

// ------------------------------------------------------------
// GET /api/courses/:id - Get a specific course by ID
// ------------------------------------------------------------
app.get('/api/courses/:id', (req, res) => {
  try {
    // Convert the :id URL parameter from string to a number
    const id = parseInt(req.params.id);

    const courses = readCourses();

    // Find the course with the matching ID
    const course = courses.find(c => c.id === id);

    // If no course was found, return a 404 error
    if (!course) {
      return res.status(404).json({ error: `Course with ID ${id} not found.` });
    }

    res.status(200).json({ course });

  } catch (err) {
    res.status(500).json({ error: 'Server error while retrieving course.', details: err.message });
  }
});

// ------------------------------------------------------------
// PUT /api/courses/:id - Update a course
// ------------------------------------------------------------
app.put('/api/courses/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, target_date, status } = req.body;

    const courses = readCourses();

    // Find the index of the course to update
    const courseIndex = courses.findIndex(c => c.id === id);

    // If not found, return 404
    if (courseIndex === -1) {
      return res.status(404).json({ error: `Course with ID ${id} not found.` });
    }

    // --- Validation: If status is provided, check it's valid ---
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: "${VALID_STATUSES.join('", "')}".`
      });
    }

    // --- Validation: If target_date is provided, check format ---
    if (target_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(target_date)) {
        return res.status(400).json({
          error: 'Invalid target_date format. Use YYYY-MM-DD (e.g., 2025-12-31).'
        });
      }
    }

    // Merge the existing course with the updated fields.
    // Only fields that are provided in the request body will be updated.
    const updatedCourse = {
      ...courses[courseIndex],  // Keep all existing fields
      ...(name && { name }),
      ...(description && { description }),
      ...(target_date && { target_date }),
      ...(status && { status })
    };

    // Replace the old course with the updated one
    courses[courseIndex] = updatedCourse;
    writeCourses(courses);

    res.status(200).json({
      message: 'Course updated successfully.',
      course: updatedCourse
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error while updating course.', details: err.message });
  }
});

// ------------------------------------------------------------
// DELETE /api/courses/:id - Delete a course
// ------------------------------------------------------------
app.delete('/api/courses/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const courses = readCourses();

    // Find the course to confirm it exists before deleting
    const courseIndex = courses.findIndex(c => c.id === id);

    if (courseIndex === -1) {
      return res.status(404).json({ error: `Course with ID ${id} not found.` });
    }

    // Remove the course from the array using splice
    const deletedCourse = courses.splice(courseIndex, 1)[0];
    writeCourses(courses);

    res.status(200).json({
      message: `Course "${deletedCourse.name}" deleted successfully.`,
      course: deletedCourse
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error while deleting course.', details: err.message });
  }
});

// ============================================================
// 404 Handler - Catches any route that doesn't match above
// ============================================================
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found.` });
});

// ============================================================
// Start the Server
// ============================================================
app.listen(PORT, () => {
  console.log(`CodeCraftHub API is running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST   /api/courses        - Add a new course');
  console.log('  GET    /api/courses        - Get all courses');
  console.log('  GET    /api/courses/stats  - Get course statistics');
  console.log('  GET    /api/courses/:id    - Get a specific course');
  console.log('  PUT    /api/courses/:id    - Update a course');
  console.log('  DELETE /api/courses/:id    - Delete a course');
});
