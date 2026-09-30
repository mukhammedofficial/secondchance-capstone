const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Item } = require('../models');
const router = express.Router();
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({ destination: uploadDir, filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`) }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^(image\/jpeg|image\/png|image\/webp|image\/gif)$/.test(file.mimetype))
});
const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
router.get('/', asyncRoute(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = new RegExp(`^${escapeRegex(req.query.category)}$`, 'i');
  const items = await Item.find(filter).sort({ createdAt: -1 });
  res.json(items);
}));
router.post('/', upload.single('file'), asyncRoute(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;
  const item = await Item.create(data);
  res.status(201).json(item);
}));
router.get('/:id', asyncRoute(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
}));
router.patch('/:id', upload.single('file'), asyncRoute(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;
  const item = await Item.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
}));
router.delete('/:id', asyncRoute(async (req, res) => {
  const item = await Item.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.status(204).end();
}));
function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
module.exports = router;
