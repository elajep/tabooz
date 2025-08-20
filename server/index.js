import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import os from 'os';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001; // Using a different port from the frontend

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbDirectory = join(os.homedir(), 'Documents', 'tabooz');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}
const dbPath = join(dbDirectory, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT,
      user_id TEXT, -- Keeping for schema compatibility, will be null
      created_at TEXT
    )`);
  }
});

// API Routes

// Get all documents
app.get('/api/documents', (req, res) => {
  db.all('SELECT id, title, created_at, content FROM documents ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get a single document
app.get('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM documents WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row && row.content) {
      try {
        row.content = JSON.parse(row.content); // Parse content before sending
      } catch (parseError) {
        console.error('Error parsing content from DB:', parseError);
        // Handle error, maybe send raw content or null
      }
    }
    res.json(row);
  });
});

// Create a new document
app.post('/api/documents', (req, res) => {
  const { title } = req.body;
  const newDocument = {
    id: uuidv4(),
    title: title || 'Untitled',
    content: null,
    user_id: null, // Auth is removed
    created_at: new Date().toISOString(),
  };

  db.run(
    `INSERT INTO documents (id, title, content, user_id, created_at) VALUES (?, ?, ?, ?, ?)`, 
    [newDocument.id, newDocument.title, newDocument.content, newDocument.user_id, newDocument.created_at],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: newDocument.id });
    }
  );
});

// Update a document
app.put('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  // Build query dynamically based on provided fields
  let fields = [];
  let placeholders = [];
  if (title !== undefined) {
    fields.push('title = ?');
    placeholders.push(title);
  }
  if (content !== undefined) {
    fields.push('content = ?');
    placeholders.push(JSON.stringify(content)); // Store JSON as text
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  placeholders.push(id);

  db.run(`UPDATE documents SET ${fields.join(', ')} WHERE id = ?`, placeholders, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(200).json({ message: 'Document updated' });
  });
});

// Delete a document
app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM documents WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(200).json({ message: 'Document deleted' });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});