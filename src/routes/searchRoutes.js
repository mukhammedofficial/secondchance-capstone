const express = require('express');
const natural = require('natural');
const { connectToDatabase } = require('../db');
const router = express.Router();
const tokenizer = new natural.WordTokenizer();
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function handle(req, res, next) {
  try {
    const { category, q, location } = req.query;
    if (!category && !q && !location) return res.status(400).json({ error: 'Provide q, category, or location to search' });
    const db = await connectToDatabase();
    const filter = {};
    // Required capstone category filter.
    if (category) {
      filter.category = String(category);
    }
    if (location) filter.location = { $regex: escapeRegex(String(location)), $options: 'i' };
    if (q) {
      const terms = tokenizer.tokenize(String(q).trim()).filter(Boolean).map(escapeRegex);
      if (terms.length) {
        filter.$and = terms.map(term => ({ $or: [
          { title: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } }
        ] }));
      }
    }
    const items = await db.collection('items').find(filter).sort({ createdAt: -1 }).toArray();
    res.json(items);
  } catch (error) { next(error); }
}

router.get('/', handle);
router.handle = handle;
module.exports = router;
