const express = require('express');
const fs = require('fs');
const { createCanvas } = require('canvas');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use('/images', express.static('images'));

let storage = {};
const DB_FILE = './storage.json';

// טוען טקסטים אם יש
if (fs.existsSync(DB_FILE)) {
  storage = JSON.parse(fs.readFileSync(DB_FILE));
}

// יצירת תמונה חדשה
function generateImage(text, id) {
  const width = 600, height = 200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#000000';
  ctx.font = '20px Arial';
  ctx.fillText(text, 30, 100);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`./images/${id}.png`, buffer);
}

// יצירת/עדכון הודעה
app.post('/api/message/:id', (req, res) => {
  const id = req.params.id;
  const { text } = req.body;

  storage[id] = text;
  fs.writeFileSync(DB_FILE, JSON.stringify(storage));
  generateImage(text, id);

  res.json({ success: true, imageUrl: `/images/${id}.png` });
});

// שליפת הטקסט הנוכחי
app.get('/api/message/:id', (req, res) => {
  const id = req.params.id;
  res.json({ text: storage[id] || '' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
