const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(express.json());

const KEYS_FILE = path.join(__dirname, 'data', 'keys.json');

// Ensure data dir
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(KEYS_FILE)) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify([], null, 2));
}

function readKeys() {
  try { return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8')); } catch { return []; }
}
function writeKeys(keys) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}

// API
app.get('/api/keys', (req, res) => res.json(readKeys()));

app.post('/api/keys', (req, res) => {
  const keys = readKeys();
  const key = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: req.body.name || '',
    service: req.body.service || '',
    key: req.body.key || '',
    projects: req.body.projects || [],
    notes: req.body.notes || '',
    createdAt: new Date().toISOString(),
  };
  keys.push(key);
  writeKeys(keys);
  res.json(key);
});

app.put('/api/keys/:id', (req, res) => {
  const keys = readKeys();
  const idx = keys.findIndex(k => k.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  keys[idx] = { ...keys[idx], ...req.body, id: keys[idx].id, createdAt: keys[idx].createdAt };
  writeKeys(keys);
  res.json(keys[idx]);
});

app.delete('/api/keys/:id', (req, res) => {
  let keys = readKeys();
  keys = keys.filter(k => k.id !== req.params.id);
  writeKeys(keys);
  res.json({ ok: true });
});

app.listen(3461, () => console.log('Project Hub running on http://localhost:3461'));
