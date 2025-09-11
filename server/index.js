import express from 'express';

import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import fs from 'fs';
import { join } from 'path';

// __filename and __dirname are globally available in CommonJS
// and will be handled by esbuild's CommonJS output.

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


// API Routes

// Get all documents
app.get('/api/documents', (req, res) => {
  fs.readdir(dbDirectory, (err, files) => {
    if (err) {
      res.status(500).json({ error: 'Failed to read documents directory' });
      return;
    }

    const jsonFiles = files.filter(file => file.endsWith('.json'));
    const documents = [];

    if (jsonFiles.length === 0) {
      return res.json([]);
    }

    let processedFiles = 0;
    jsonFiles.forEach(file => {
      const filePath = join(dbDirectory, file);
      fs.readFile(filePath, 'utf8', (readErr, data) => {
        if (readErr) {
          console.error(`Error reading file ${file}:`, readErr);
        } else {
          try {
            const doc = JSON.parse(data);
            documents.push(doc);
          } catch (parseErr) {
            console.error(`Error parsing JSON from ${file}:`, parseErr);
          }
        }

        processedFiles++;
        if (processedFiles === jsonFiles.length) {
          // Sort documents by creation date, most recent first
          documents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          res.json(documents);
        }
      });
    });
  });
});

// Get a single document
app.get('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const filePath = join(dbDirectory, `${id}.json`);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.status(404).json({ error: 'Document not found' });
      } else {
        res.status(500).json({ error: 'Failed to read document' });
      }
      return;
    }

    try {
      const doc = JSON.parse(data);
      res.json(doc);
    } catch (parseErr) {
      res.status(500).json({ error: 'Failed to parse document content' });
    }
  });
});

// Create a new document
app.post('/api/documents', (req, res) => {
  const { title } = req.body;
  const newDocument = {
    id: uuidv4(),
    title: title || 'Untitled',
    content: null,
    created_at: new Date().toISOString(),
  };

  // Ensure the directory exists before writing the file
  if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
  }

  const filePath = join(dbDirectory, `${newDocument.id}.json`);
  fs.writeFile(filePath, JSON.stringify(newDocument, null, 2), (writeErr) => {
    if (writeErr) {
      console.error('Error writing document file:', writeErr);
      res.status(500).json({ error: 'Failed to create document file' });
      return;
    }
    res.status(201).json({ id: newDocument.id });
  });
});

// Update a document
app.put('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const filePath = join(dbDirectory, `${id}.json`);

  fs.readFile(filePath, 'utf8', (readErr, data) => {
    if (readErr) {
      if (readErr.code === 'ENOENT') {
        res.status(404).json({ error: 'Document not found' });
      } else {
        res.status(500).json({ error: 'Failed to read document for update' });
      }
      return;
    }

    try {
      const doc = JSON.parse(data);

      if (title !== undefined) {
        doc.title = title;
      }
      if (content !== undefined) {
        doc.content = content;
      }

      fs.writeFile(filePath, JSON.stringify(doc, null, 2), (writeErr) => {
        if (writeErr) {
          res.status(500).json({ error: 'Failed to write updated document' });
          return;
        }
        res.status(200).json({ message: 'Document updated' });
      });
    } catch (parseErr) {
      res.status(500).json({ error: 'Failed to parse existing document content' });
    }
  });
});

// Delete a document
app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const filePath = join(dbDirectory, `${id}.json`);

  fs.unlink(filePath, (unlinkErr) => {
    if (unlinkErr) {
      if (unlinkErr.code === 'ENOENT') {
        res.status(404).json({ error: 'Document not found' });
      } else {
        res.status(500).json({ error: 'Failed to delete document file' });
      }
      return;
    }
    res.status(200).json({ message: 'Document deleted' });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});