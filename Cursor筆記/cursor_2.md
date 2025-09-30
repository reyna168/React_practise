# 增加網頁上傳附件功能
_Exported on 9/30/2025 at 13:38:45 GMT+8 from Cursor (1.7.22)_

---

**User**

已產生的程式檔案在多加功能，上傳附件網頁頁

---

**Cursor**

我需要先了解目前的專案結構和功能，然後為您添加附件上傳功能。讓我先查看相關檔案來了解現有的架構。


現在我了解了您的專案結構。這是一個使用 React.js 和 Node.js 的任務管理系統，包含任務和用戶管理功能。我將為您添加附件上傳功能。讓我創建一個完整的附件上傳系統。


首先，我需要在後端添加文件上傳功能。讓我先安裝必要的依賴並更新後端代碼：


```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "Backend API server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "sqlite3": "^5.1.6",
    "uuid": "^9.0.1",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}


```

現在更新後端服務器代碼，添加文件上傳功能：


```javascript
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

```

```javascript
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

```

現在添加附件數據庫表：


```javascript
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

```

現在添加附件相關的 API 路由。我需要在現有路由之後添加：


```javascript
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

```

現在創建前端的附件上傳組件：


```javascript
import React, { useState } from 'react';

function AttachmentUpload({ taskId, onAttachmentUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setSelectedFile(file);
    } else if (file) {
      alert('檔案大小不能超過 10MB');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !taskId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const attachment = await response.json();
        onAttachmentUploaded(attachment);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
      } else {
        const error = await response.json();
        alert('上傳失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('上傳時發生錯誤');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">上傳附件</h3>
      
      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          <div className="text-sm text-gray-600">
            <label
              htmlFor="file-input"
              className="cursor-pointer font-medium text-primary-600 hover:text-primary-500"
            >
              點擊選擇檔案
            </label>
            {' '}或拖拽檔案到這裡
          </div>
          
          <p className="text-xs text-gray-500">
            支援 JPG, PNG, GIF, PDF, DOC, DOCX, TXT, ZIP, RAR 格式，最大 10MB
          </p>
        </div>
        
        <input
          id="file-input"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
        />
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? '上傳中...' : '上傳'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttachmentUpload;
```

現在創建附件列表組件：


```javascript
import React, { useState, useEffect } from 'react';

function AttachmentList({ taskId, onAttachmentDeleted }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAttachments = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/attachments`);
      if (response.ok) {
        const data = await response.json();
        setAttachments(data);
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('確定要刪除這個附件嗎？')) return;

    try {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAttachments(attachments.filter(att => att.id !== attachmentId));
        onAttachmentDeleted && onAttachmentDeleted(attachmentId);
      } else {
        const error = await response.json();
        alert('刪除失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('刪除時發生錯誤');
    }
  };

  const handleDownload = async (attachmentId, originalName) => {
    try {
      const response = await fetch(`/api/attachments/${attachmentId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert('下載失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error downloading attachment:', error);
      alert('下載時發生錯誤');
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return (
        <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (mimeType === 'application/pdf') {
      return (
        <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return (
        <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-TW');
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-sm text-gray-600">載入附件中...</p>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2 text-sm text-gray-500">尚無附件</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">附件列表</h3>
      {attachments.map((attachment) => (
        <div key={attachment.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {getFileIcon(attachment.mimeType)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.originalName}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(attachment.fileSize)} • {formatDate(attachment.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDownload(attachment.id, attachment.originalName)}
                className="text-primary-600 hover:text-primary-800 p-1 rounded"
                title="下載"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              <button
                onClick={() => handleDelete(attachment.id)}
                className="text-red-600 hover:text-red-800 p-1 rounded"
                title="刪除"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AttachmentList;
```

現在需要更新 TaskItem 組件來包含附件功能。讓我先查看現有的 TaskItem 組件：


現在我將更新 TaskItem 組件來包含附件功能：


```javascript
import React, { useState } from 'react';
import AttachmentUpload from './AttachmentUpload';
import AttachmentList from './AttachmentList';

function TaskItem({ task, onTaskUpdated, onTaskDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [loading, setLoading] = useState(false);

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed: !task.completed,
        }),
      });

      if (response.ok) {
        onTaskUpdated({ ...task, completed: !task.completed });
      } else {
        const error = await response.json();
        alert('更新任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('更新任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          completed: task.completed,
        }),
      });

      if (response.ok) {
        onTaskUpdated({
          ...task,
          title: editTitle.trim(),
          description: editDescription.trim(),
        });
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert('更新任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('更新任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('確定要刪除這個任務嗎？')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTaskDeleted(task.id);
      } else {
        const error = await response.json();
        alert('刪除任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('刪除任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsEditing(false);
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      task.completed 
        ? 'bg-gray-50 border-gray-200' 
        : 'bg-white border-gray-300 hover:border-primary-300'
    }`}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="任務標題"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="任務描述"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEdit}
              disabled={loading || !editTitle.trim()}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              儲存
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-3">
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-500'
            }`}
          >
            {task.completed && '✓'}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-sm mt-1 ${
                task.completed ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {task.description}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              建立時間: {new Date(task.createdAt).toLocaleString('zh-TW')}
            </p>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="編輯"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="刪除"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskItem;


```

```javascript
import React, { useState } from 'react';
import AttachmentUpload from './AttachmentUpload';
import AttachmentList from './AttachmentList';

function TaskItem({ task, onTaskUpdated, onTaskDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [loading, setLoading] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed: !task.completed,
        }),
      });

      if (response.ok) {
        onTaskUpdated({ ...task, completed: !task.completed });
      } else {
        const error = await response.json();
        alert('更新任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('更新任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          completed: task.completed,
        }),
      });

      if (response.ok) {
        onTaskUpdated({
          ...task,
          title: editTitle.trim(),
          description: editDescription.trim(),
        });
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert('更新任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('更新任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('確定要刪除這個任務嗎？')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTaskDeleted(task.id);
      } else {
        const error = await response.json();
        alert('刪除任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('刪除任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsEditing(false);
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      task.completed 
        ? 'bg-gray-50 border-gray-200' 
        : 'bg-white border-gray-300 hover:border-primary-300'
    }`}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="任務標題"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="任務描述"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEdit}
              disabled={loading || !editTitle.trim()}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              儲存
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-3">
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-500'
            }`}
          >
            {task.completed && '✓'}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-sm mt-1 ${
                task.completed ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {task.description}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              建立時間: {new Date(task.createdAt).toLocaleString('zh-TW')}
            </p>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="編輯"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="刪除"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskItem;


```

現在添加附件相關的處理函數：


```javascript
import React, { useState } from 'react';
import AttachmentUpload from './AttachmentUpload';
import AttachmentList from './AttachmentList';

function TaskItem({ task, onTaskUpdated, onTaskDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [loading, setLoading] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed: !task.completed,
        }),
      });

      if (response.ok) {
        onTaskUpdated({ ...task, completed: !task.completed });
      } else {
        const error = await response.json();
        alert('更新任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('更新任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          completed: task.completed,
        }),
      });

      if (response.ok) {
        onTaskUpdated({
          ...task,
          title: editTitle.trim(),
          description: editDescription.trim(),
        });
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert('更新任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('更新任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('確定要刪除這個任務嗎？')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTaskDeleted(task.id);
      } else {
        const error = await response.json();
        alert('刪除任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('刪除任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsEditing(false);
  };

  const handleAttachmentUploaded = (attachment) => {
    // 可以在這裡添加通知或其他邏輯
    console.log('Attachment uploaded:', attachment);
  };

  const handleAttachmentDeleted = (attachmentId) => {
    // 可以在這裡添加通知或其他邏輯
    console.log('Attachment deleted:', attachmentId);
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      task.completed 
        ? 'bg-gray-50 border-gray-200' 
        : 'bg-white border-gray-300 hover:border-primary-300'
    }`}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="任務標題"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="任務描述"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEdit}
              disabled={loading || !editTitle.trim()}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              儲存
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-3">
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-500'
            }`}
          >
            {task.completed && '✓'}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-sm mt-1 ${
                task.completed ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {task.description}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              建立時間: {new Date(task.createdAt).toLocaleString('zh-TW')}
            </p>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="編輯"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="刪除"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskItem;


```

現在更新按鈕區域來包含附件按鈕：


```javascript
import React, { useState } from 'react';
import AttachmentUpload from './AttachmentUpload';
import AttachmentList from './AttachmentList';

function TaskItem({ task, onTaskUpdated, onTaskDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [loading, setLoading] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed: !task.completed,
        }),
      });

      if (response.ok) {
        onTaskUpdated({ ...task, completed: !task.completed });
      } else {
        const error = await response.json();
        alert('更新任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('更新任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          completed: task.completed,
        }),
      });

      if (response.ok) {
        onTaskUpdated({
          ...task,
          title: editTitle.trim(),
          description: editDescription.trim(),
        });
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert('更新任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('更新任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('確定要刪除這個任務嗎？')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTaskDeleted(task.id);
      } else {
        const error = await response.json();
        alert('刪除任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('刪除任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsEditing(false);
  };

  const handleAttachmentUploaded = (attachment) => {
    // 可以在這裡添加通知或其他邏輯
    console.log('Attachment uploaded:', attachment);
  };

  const handleAttachmentDeleted = (attachmentId) => {
    // 可以在這裡添加通知或其他邏輯
    console.log('Attachment deleted:', attachmentId);
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      task.completed 
        ? 'bg-gray-50 border-gray-200' 
        : 'bg-white border-gray-300 hover:border-primary-300'
    }`}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="任務標題"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="任務描述"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEdit}
              disabled={loading || !editTitle.trim()}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              儲存
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-3">
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-500'
            }`}
          >
            {task.completed && '✓'}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-sm mt-1 ${
                task.completed ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {task.description}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              建立時間: {new Date(task.createdAt).toLocaleString('zh-TW')}
            </p>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setShowAttachments(!showAttachments)}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
              title="附件"
            >
              📎
            </button>
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="編輯"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="刪除"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskItem;


```

現在添加附件區域的顯示：


```javascript
import React, { useState } from 'react';
import AttachmentUpload from './AttachmentUpload';
import AttachmentList from './AttachmentList';

function TaskItem({ task, onTaskUpdated, onTaskDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [loading, setLoading] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed: !task.completed,
        }),
      });

      if (response.ok) {
        onTaskUpdated({ ...task, completed: !task.completed });
      } else {
        const error = await response.json();
        alert('更新任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('更新任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          completed: task.completed,
        }),
      });

      if (response.ok) {
        onTaskUpdated({
          ...task,
          title: editTitle.trim(),
          description: editDescription.trim(),
        });
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert('更新任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('更新任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('確定要刪除這個任務嗎？')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTaskDeleted(task.id);
      } else {
        const error = await response.json();
        alert('刪除任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('刪除任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsEditing(false);
  };

  const handleAttachmentUploaded = (attachment) => {
    // 可以在這裡添加通知或其他邏輯
    console.log('Attachment uploaded:', attachment);
  };

  const handleAttachmentDeleted = (attachmentId) => {
    // 可以在這裡添加通知或其他邏輯
    console.log('Attachment deleted:', attachmentId);
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      task.completed 
        ? 'bg-gray-50 border-gray-200' 
        : 'bg-white border-gray-300 hover:border-primary-300'
    }`}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="任務標題"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="任務描述"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEdit}
              disabled={loading || !editTitle.trim()}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              儲存
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-3">
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-500'
            }`}
          >
            {task.completed && '✓'}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-sm mt-1 ${
                task.completed ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {task.description}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              建立時間: {new Date(task.createdAt).toLocaleString('zh-TW')}
            </p>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setShowAttachments(!showAttachments)}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
              title="附件"
            >
              📎
            </button>
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="編輯"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="刪除"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
      
      {/* Attachments Section */}
      {showAttachments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-4">
            <AttachmentUpload 
              taskId={task.id} 
              onAttachmentUploaded={handleAttachmentUploaded}
            />
            <AttachmentList 
              taskId={task.id} 
              onAttachmentDeleted={handleAttachmentDeleted}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskItem;


```

現在我需要安裝後端的依賴並創建上傳目錄。讓我運行安裝命令：


讓我分別執行這些命令：


現在讓我創建上傳目錄並測試系統：


目錄已經存在了。現在讓我檢查是否有任何語法錯誤：


太好了！現在讓我啟動服務器來測試功能：


現在啟動前端服務器：


