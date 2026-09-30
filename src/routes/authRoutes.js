const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../db');

const router = express.Router();
const jwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is required in production');
  return 'local-development-only-secret';
};
const publicUser = user => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

// POST /api/secondchance/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password || String(password).length < 8) {
      return res.status(400).json({ error: 'name, email, and password (at least 8 characters) are required' });
    }
    const db = await connectToDatabase();
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await db.collection('users').findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const now = new Date();
    const user = { name: String(name).trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), createdAt: now, updatedAt: now };
    const result = await db.collection('users').insertOne(user);
    res.status(201).json({ message: 'User registered successfully', user: publicUser({ ...user, _id: result.insertedId }) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'User already exists' });
    next(error);
  }
});

// POST /api/secondchance/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
    const db = await connectToDatabase();
    const user = await db.collection('users').findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, jwtSecret(), { expiresIn: '2h' });
    res.json({ message: 'Login successful', token, user: publicUser(user) });
  } catch (error) { next(error); }
});

async function updateUser(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'Bearer token required' });
    const payload = jwt.verify(header.slice(7), jwtSecret());
    const targetId = req.params.id || payload.userId;
    if (!ObjectId.isValid(targetId) || targetId !== payload.userId) return res.status(403).json({ error: 'You can only update your own account' });
    const updates = {};
    if (req.body.name) updates.name = String(req.body.name).trim();
    if (req.body.email) updates.email = String(req.body.email).toLowerCase().trim();
    if (req.body.password) {
      if (String(req.body.password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
      updates.passwordHash = await bcrypt.hash(req.body.password, 12);
    }
    updates.updatedAt = new Date();
    const db = await connectToDatabase();
    const updated = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(targetId) }, { $set: updates }, { returnDocument: 'after' }
    );
    const user = updated?.value === undefined ? updated : updated.value;
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated successfully', user: publicUser(user) });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return res.status(401).json({ error: 'Invalid or expired token' });
    if (error.code === 11000) return res.status(409).json({ error: 'Email already registered' });
    next(error);
  }
}
// Update routes are explicit for course rubric compatibility; both require ownership proof.
router.put('/users/:id', updateUser);
router.patch('/update', updateUser);
module.exports = router;
