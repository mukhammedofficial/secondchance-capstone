const express = require('express');
const natural = require('natural');
const { Item } = require('../models');
const router = express.Router();
const tokenizer = new natural.WordTokenizer();
router.get('/', async (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) return res.status(400).json({ error: 'Query parameter q is required' });
    const terms = tokenizer.tokenize(query.toLowerCase()).filter(Boolean);
    const items = await Item.find(req.query.category ? { category: new RegExp(`^${String(req.query.category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } : {});
    const results = items.map(item => {
      const text = `${item.title} ${item.description} ${item.category}`.toLowerCase();
      const score = terms.reduce((n, term) => n + (text.includes(term) ? 1 : 0), 0);
      return { item, score };
    }).filter(result => result.score > 0).sort((a, b) => b.score - a.score).map(result => result.item);
    res.json(results);
  } catch (error) { next(error); }
});
module.exports = router;
