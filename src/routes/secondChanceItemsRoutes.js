const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../db');

const router = express.Router();
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype))
});

function validId(id) { return ObjectId.isValid(id); }
function itemFields(body, file) {
  const allowed = ['title', 'description', 'category', 'location', 'condition', 'price', 'ownerEmail'];
  const item = Object.fromEntries(allowed.filter(key => body[key] !== undefined).map(key => [key, body[key]]));
  if (file) item.image = `/uploads/${file.filename}`;
  return item;
}

// GET /api/secondchance/items — list all items, optionally filtered by category.
router.get('/', async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const filter = {};
    const { category } = req.query;
    if (category) filter.category = String(category);
    const items = await db.collection('items').find(filter).sort({ createdAt: -1 }).toArray();
    res.json(items);
  } catch (error) { next(error); }
});

// POST /api/secondchance/items — accepts JSON or multipart form data with an optional file.
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const item = itemFields(req.body, req.file);
    if (!item.title || !String(item.title).trim()) return res.status(400).json({ error: 'title is required' });
    item.title = String(item.title).trim();
    item.description = item.description || '';
    item.category = item.category || 'Other';
    item.location = item.location || '';
    item.condition = item.condition || 'Good';
    item.price = Number(item.price || 0);
    if (!Number.isFinite(item.price) || item.price < 0) return res.status(400).json({ error: 'price must be a non-negative number' });
    item.createdAt = new Date();
    item.updatedAt = item.createdAt;
    const db = await connectToDatabase();
    const result = await db.collection('items').insertOne(item);
    res.status(201).json({ ...item, _id: result.insertedId });
  } catch (error) { next(error); }
});

// GET /api/secondchance/items/:id — retrieve one item.
router.get('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid item id' });
    const db = await connectToDatabase();
    const item = await db.collection('items').findOne({ _id: new ObjectId(req.params.id) });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) { next(error); }
});

async function updateItem(req, res, next) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid item id' });
    const changes = itemFields(req.body, req.file);
    if (changes.price !== undefined) {
      changes.price = Number(changes.price);
      if (!Number.isFinite(changes.price) || changes.price < 0) return res.status(400).json({ error: 'price must be a non-negative number' });
    }
    changes.updatedAt = new Date();
    const db = await connectToDatabase();
    const result = await db.collection('items').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) }, { $set: changes }, { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Item not found' });
    res.json(result);
  } catch (error) { next(error); }
}
router.patch('/:id', upload.single('file'), updateItem);
router.put('/:id', upload.single('file'), updateItem);

// DELETE /api/secondchance/items/:id — remove one item.
router.delete('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid item id' });
    const db = await connectToDatabase();
    const result = await db.collection('items').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) { next(error); }
});

module.exports = router;
