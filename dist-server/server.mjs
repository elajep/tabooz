// server/index.js
import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var app = express();
var port = 3001;
app.use(cors());
app.use(express.json());
var dbPath = join(__dirname, "..", "database.db");
var db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    db.run(`CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT,
      user_id TEXT, -- Keeping for schema compatibility, will be null
      created_at TEXT
    )`);
  }
});
app.get("/api/documents", (req, res) => {
  db.all("SELECT id, title, created_at FROM documents ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});
app.get("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM documents WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row && row.content) {
      try {
        row.content = JSON.parse(row.content);
      } catch (parseError) {
        console.error("Error parsing content from DB:", parseError);
      }
    }
    res.json(row);
  });
});
app.post("/api/documents", (req, res) => {
  const { title } = req.body;
  const newDocument = {
    id: uuidv4(),
    title: title || "Untitled",
    content: null,
    user_id: null,
    // Auth is removed
    created_at: (/* @__PURE__ */ new Date()).toISOString()
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
app.put("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  let fields = [];
  let placeholders = [];
  if (title !== void 0) {
    fields.push("title = ?");
    placeholders.push(title);
  }
  if (content !== void 0) {
    fields.push("content = ?");
    placeholders.push(JSON.stringify(content));
  }
  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }
  placeholders.push(id);
  db.run(`UPDATE documents SET ${fields.join(", ")} WHERE id = ?`, placeholders, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(200).json({ message: "Document updated" });
  });
});
app.delete("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM documents WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(200).json({ message: "Document deleted" });
  });
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
