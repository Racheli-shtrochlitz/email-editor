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

if (fs.existsSync(DB_FILE)) {
  storage = JSON.parse(fs.readFileSync(DB_FILE));
}

function generateImageBuffer(text) {
  const width = 600, height = 200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#000000';
  ctx.font = '20px Arial';
  ctx.fillText(text || '', 30, 100);

  return canvas.toBuffer('image/png');
}

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

app.get('/content/:id.png', (req, res) => {
  const id = req.params.id;
  const record = storage[id];
  let text = '';
  if (record) {
    text = typeof record === 'string' ? record : (record.text || '');
  }

  res.set('Content-Type', 'image/png');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');

  const buffer = generateImageBuffer(text);
  res.send(buffer);
});

app.post('/api/message/:id', (req, res) => {
  const id = req.params.id;
  const { text } = req.body;

  const safeId = String(id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  const safeText = String(text || '').slice(0, 500);

  if (!safeId) {
    return res.status(400).json({ success: false, error: 'invalid id' });
  }

  storage[safeId] = {
    text: safeText,
    updatedAt: Date.now()
  };
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(storage));
  } catch (e) {
    return res.status(500).json({ success: false, error: 'failed to persist' });
  }

  // Optional: keep latest image on disk as well
  try {
    generateImage(safeText, safeId);
  } catch (e) {
    // ignore disk image failure; dynamic route will still render
  }

  const imageUrl = `/content/${safeId}.png?v=${storage[safeId].updatedAt}`;
  res.json({ success: true, imageUrl });
});

app.get('/api/message/:id', (req, res) => {
  const id = req.params.id;
  res.json({ text: storage[id] || '' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
