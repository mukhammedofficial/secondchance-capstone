const mongoose = require('mongoose');

async function connectToDatabase(uri = process.env.MONGODB_URI) {
  if (!uri) throw new Error('MONGODB_URI is required');
  await mongoose.connect(uri);
  return mongoose.connection;
}

async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

module.exports = { connectToDatabase, disconnectFromDatabase };
