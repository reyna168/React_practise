const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 1121;

const storage = multer.diskStorage({
  destination: (req, file, bt) => {
    
    bt(null, './test');
  },
  filename: (req, file, bt) => {
    bt(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
if (!fs.existsSync('./test')) {
  fs.mkdirSync('./test');
}

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  res.send(`File uploaded successfully: ${req.file.filename}`);
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Upload a File</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file" />
      <button type="submit">Upload</button>
    </form>
  `);
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});