// server/index.js
import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import os from "os";
import fs from "fs";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var app = express();
var port = 3001;
app.use(cors());
app.use(express.json());
var dbDirectory = join(os.homedir(), "Documents", "tabooz");
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}
app.get("/api/documents", (req, res) => {
  fs.readdir(dbDirectory, (err, files) => {
    if (err) {
      res.status(500).json({ error: "Failed to read documents directory" });
      return;
    }
    const jsonFiles = files.filter((file) => file.endsWith(".json"));
    const documents = [];
    if (jsonFiles.length === 0) {
      return res.json([]);
    }
    let processedFiles = 0;
    jsonFiles.forEach((file) => {
      const filePath = join(dbDirectory, file);
      fs.readFile(filePath, "utf8", (readErr, data) => {
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
          documents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          res.json(documents);
        }
      });
    });
  });
});
app.get("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  const filePath = join(dbDirectory, `${id}.json`);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.status(404).json({ error: "Document not found" });
      } else {
        res.status(500).json({ error: "Failed to read document" });
      }
      return;
    }
    try {
      const doc = JSON.parse(data);
      res.json(doc);
    } catch (parseErr) {
      res.status(500).json({ error: "Failed to parse document content" });
    }
  });
});
app.post("/api/documents", (req, res) => {
  const { title } = req.body;
  const newDocument = {
    id: uuidv4(),
    title: title || "Untitled",
    content: null,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
  }
  const filePath = join(dbDirectory, `${newDocument.id}.json`);
  fs.writeFile(filePath, JSON.stringify(newDocument, null, 2), (writeErr) => {
    if (writeErr) {
      console.error("Error writing document file:", writeErr);
      res.status(500).json({ error: "Failed to create document file" });
      return;
    }
    res.status(201).json({ id: newDocument.id });
  });
});
app.put("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const filePath = join(dbDirectory, `${id}.json`);
  fs.readFile(filePath, "utf8", (readErr, data) => {
    if (readErr) {
      if (readErr.code === "ENOENT") {
        res.status(404).json({ error: "Document not found" });
      } else {
        res.status(500).json({ error: "Failed to read document for update" });
      }
      return;
    }
    try {
      const doc = JSON.parse(data);
      if (title !== void 0) {
        doc.title = title;
      }
      if (content !== void 0) {
        doc.content = content;
      }
      fs.writeFile(filePath, JSON.stringify(doc, null, 2), (writeErr) => {
        if (writeErr) {
          res.status(500).json({ error: "Failed to write updated document" });
          return;
        }
        res.status(200).json({ message: "Document updated" });
      });
    } catch (parseErr) {
      res.status(500).json({ error: "Failed to parse existing document content" });
    }
  });
});
app.delete("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  const filePath = join(dbDirectory, `${id}.json`);
  fs.unlink(filePath, (unlinkErr) => {
    if (unlinkErr) {
      if (unlinkErr.code === "ENOENT") {
        res.status(404).json({ error: "Document not found" });
      } else {
        res.status(500).json({ error: "Failed to delete document file" });
      }
      return;
    }
    res.status(200).json({ message: "Document deleted" });
  });
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
