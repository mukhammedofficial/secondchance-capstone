const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true, index: true },
  condition: { type: String, enum: ['new', 'like-new', 'good', 'fair'], default: 'good' },
  price: { type: Number, min: 0, default: 0 },
  imageUrl: { type: String, default: '' },
  location: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });
module.exports = {
  Item: mongoose.models.Item || mongoose.model('Item', itemSchema),
  User: mongoose.models.User || mongoose.model('User', userSchema)
};
