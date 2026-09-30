const { MongoClient } = require('mongodb');

let client;
let db;

async function connectToDatabase() {
  if (db) return db;
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB || 'secondchance';
  client = new MongoClient(uri);
  await client.connect();
  const connectedDb = client.db(dbName);
  await connectedDb.collection('users').createIndex({ email: 1 }, { unique: true });
  db = connectedDb;
  return db;
}

async function closeDatabase() {
  if (client) await client.close();
  client = undefined;
  db = undefined;
}

module.exports = { client: () => client, connectToDatabase, closeDatabase };
