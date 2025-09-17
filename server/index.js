import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import fs from 'fs/promises';
import { join } from 'path';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const dbDirectory = join(os.homedir(), 'Documents', 'tabooz');

const ensureDbDirectoryExists = async () => {
  try {
    await fs.access(dbDirectory);
  } catch {
    await fs.mkdir(dbDirectory, { recursive: true });
  }
};

ensureDbDirectoryExists();

app.get('/api/documents', async (req, res) => {
  try {
    const files = await fs.readdir(dbDirectory);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const documents = await Promise.all(jsonFiles.map(async file => {
      const filePath = join(dbDirectory, file);
      try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
      } catch (err) {
        console.error(`Error reading or parsing file ${file}:`, err);
        return null;
      }
    }));

    const validDocuments = documents.filter(doc => doc !== null);
    validDocuments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json(validDocuments);
  } catch (err) {
    console.error('Failed to read documents directory:', err);
    res.status(500).json({ error: 'Failed to read documents directory' });
  }
});

app.get('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const filePath = join(dbDirectory, `${id}.json`);

  try {
    const data = await fs.readFile(filePath, 'utf8');
    const doc = JSON.parse(data);
    res.json(doc);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'Document not found' });
    } else {
      console.error(`Error reading document ${id}:`, err);
      res.status(500).json({ error: 'Failed to read document' });
    }
  }
});

app.post('/api/documents', async (req, res) => {
  const { title } = req.body;
  const newDocument = {
    id: uuidv4(),
    title: title || 'Untitled',
    content: null,
    created_at: new Date().toISOString(),
  };

  const filePath = join(dbDirectory, `${newDocument.id}.json`);

  try {
    await fs.writeFile(filePath, JSON.stringify(newDocument, null, 2));
    res.status(201).json({ id: newDocument.id });
  } catch (err) {
    console.error('Error writing document file:', err);
    res.status(500).json({ error: 'Failed to create document file' });
  }
});

app.put('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const filePath = join(dbDirectory, `${id}.json`);

  try {
    const data = await fs.readFile(filePath, 'utf8');
    const doc = JSON.parse(data);

    if (title !== undefined) {
      doc.title = title;
    }
    if (content !== undefined) {
      doc.content = content;
    }

    await fs.writeFile(filePath, JSON.stringify(doc, null, 2));
    res.status(200).json({ message: 'Document updated' });
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'Document not found' });
    } else {
      console.error(`Error updating document ${id}:`, err);
      res.status(500).json({ error: 'Failed to update document' });
    }
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const filePath = join(dbDirectory, `${id}.json`);

  try {
    await fs.unlink(filePath);
    res.status(200).json({ message: 'Document deleted' });
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'Document not found' });
    } else {
      console.error(`Error deleting document ${id}:`, err);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});