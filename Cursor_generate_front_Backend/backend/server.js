const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('不支援的檔案類型'));
    }
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  // Create tasks table
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create attachments table
  db.run(`CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    taskId TEXT,
    originalName TEXT NOT NULL,
    fileName TEXT NOT NULL,
    filePath TEXT NOT NULL,
    fileSize INTEGER NOT NULL,
    mimeType TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE CASCADE
  )`);
});

// Routes

// Get all tasks
app.get('/api/tasks', (req, res) => {
  const sql = 'SELECT * FROM tasks ORDER BY createdAt DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single task
app.get('/api/tasks/:id', (req, res) => {
  const sql = 'SELECT * FROM tasks WHERE id = ?';
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(row);
  });
});

// Create new task
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const id = uuidv4();
  const sql = 'INSERT INTO tasks (id, title, description) VALUES (?, ?, ?)';
  db.run(sql, [id, title, description], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id, title, description, completed: false });
  });
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const { title, description, completed } = req.body;
  const sql = 'UPDATE tasks SET title = ?, description = ?, completed = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?';
  
  db.run(sql, [title, description, completed, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ message: 'Task updated successfully' });
  });
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const sql = 'DELETE FROM tasks WHERE id = ?';
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  const sql = 'SELECT * FROM users ORDER BY createdAt DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create new user
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  const id = uuidv4();
  const sql = 'INSERT INTO users (id, name, email) VALUES (?, ?, ?)';
  db.run(sql, [id, name, email], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(409).json({ error: 'Email already exists' });
        return;
      }
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id, name, email });
  });
});

// Upload attachment for a task
app.post('/api/tasks/:taskId/attachments', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: '沒有選擇檔案' });
    return;
  }

  const taskId = req.params.taskId;
  const attachmentId = uuidv4();
  
  const sql = `INSERT INTO attachments (id, taskId, originalName, fileName, filePath, fileSize, mimeType) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [
    attachmentId,
    taskId,
    req.file.originalname,
    req.file.filename,
    req.file.path,
    req.file.size,
    req.file.mimetype
  ], function(err) {
    if (err) {
      // Delete the uploaded file if database insert fails
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.status(201).json({
      id: attachmentId,
      taskId: taskId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      downloadUrl: `/uploads/${req.file.filename}`
    });
  });
});

// Get attachments for a task
app.get('/api/tasks/:taskId/attachments', (req, res) => {
  const sql = 'SELECT * FROM attachments WHERE taskId = ? ORDER BY createdAt DESC';
  db.all(sql, [req.params.taskId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Add download URLs to each attachment
    const attachmentsWithUrls = rows.map(row => ({
      ...row,
      downloadUrl: `/uploads/${row.fileName}`
    }));
    
    res.json(attachmentsWithUrls);
  });
});

// Delete attachment
app.delete('/api/attachments/:id', (req, res) => {
  const sql = 'SELECT * FROM attachments WHERE id = ?';
  db.get(sql, [req.params.id], (err, attachment) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!attachment) {
      res.status(404).json({ error: 'Attachment not found' });
      return;
    }
    
    // Delete file from filesystem
    fs.unlink(attachment.filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Error deleting file:', unlinkErr);
      }
    });
    
    // Delete from database
    const deleteSql = 'DELETE FROM attachments WHERE id = ?';
    db.run(deleteSql, [req.params.id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({ message: 'Attachment deleted successfully' });
    });
  });
});

// Download attachment
app.get('/api/attachments/:id/download', (req, res) => {
  const sql = 'SELECT * FROM attachments WHERE id = ?';
  db.get(sql, [req.params.id], (err, attachment) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!attachment) {
      res.status(404).json({ error: 'Attachment not found' });
      return;
    }
    
    if (!fs.existsSync(attachment.filePath)) {
      res.status(404).json({ error: 'File not found on disk' });
      return;
    }
    
    res.download(attachment.filePath, attachment.originalName);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
