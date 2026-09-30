const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');
const secondChanceItemsRoutes = require('./routes/secondChanceItemsRoutes');
function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || 'uploads')));
  app.use(express.static(path.resolve('public')));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/auth', authRoutes);
  app.use('/search', searchRoutes);
  app.use('/items', secondChanceItemsRoutes);
  // Capstone API paths are supported alongside the short local paths.
  app.use('/api/secondchance/auth', authRoutes);
  app.use('/api/secondchance/search', searchRoutes);
  app.use('/api/secondchance/items', secondChanceItemsRoutes);
  app.use((err, _req, res, _next) => {
    if (err.name === 'ValidationError' || err.name === 'CastError') return res.status(400).json({ error: err.message });
    if (err.code === 11000) return res.status(409).json({ error: 'A record with that unique value already exists' });
    if (err instanceof Error && err.message.startsWith('File too large')) return res.status(413).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  });
  return app;
}
module.exports = { createApp };
