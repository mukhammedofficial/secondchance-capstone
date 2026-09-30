const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();
const secret = () => process.env.JWT_SECRET || 'development-only-secret-change-me';
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password || String(password).length < 8) return res.status(400).json({ error: 'name, email, and password (at least 8 characters) are required' });
    const normalizedEmail = String(email).toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({ name, email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (error) { next(error); }
});
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = email && await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !await bcrypt.compare(password || '', user.passwordHash)) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ token: jwt.sign({ sub: user.id }, secret(), { expiresIn: '1d' }), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});
async function updateProfile(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'Bearer token required' });
    const payload = jwt.verify(header.slice(7), secret());
    if (req.params.id && req.params.id !== payload.sub) return res.status(403).json({ error: 'You can only update your own account' });
    const changes = {};
    if (req.body.name) changes.name = req.body.name;
    if (req.body.email) changes.email = String(req.body.email).toLowerCase().trim();
    if (req.body.password) {
      if (String(req.body.password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
      changes.passwordHash = await bcrypt.hash(req.body.password, 12);
    }
    const user = await User.findByIdAndUpdate(payload.sub, changes, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (error) { if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return res.status(401).json({ error: 'Invalid or expired token' }); next(error); }
}
router.patch('/update', updateProfile);
router.put('/users/:id', updateProfile);
module.exports = router;
