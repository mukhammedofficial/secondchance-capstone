const test = require('node:test');
const assert = require('node:assert/strict');
const { ObjectId } = require('mongodb');
const { createApp } = require('../src/app');
const { connectToDatabase, closeDatabase } = require('../src/db');
const enabled = Boolean(process.env.MONGODB_URI);

test('MongoDB-backed API CRUD, upload, search, and authentication', { skip: !enabled }, async t => {
  const db = await connectToDatabase();
  await Promise.all([db.collection('items').deleteMany({}), db.collection('users').deleteMany({})]);
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/secondchance`;
  const request = async (url, options) => fetch(`${base}${url}`, options);
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    await Promise.all([db.collection('items').deleteMany({}), db.collection('users').deleteMany({})]);
    await closeDatabase();
  });

  let response = await request('/items', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: 'Desk lamp', description: 'Working lamp', category: 'Electronics', location: 'Tashkent' }) });
  assert.equal(response.status, 201);
  let item = await response.json();
  assert.ok(item._id);
  response = await request(`/items/${item._id}`);
  assert.equal((await response.json()).title, 'Desk lamp');
  response = await request('/search?q=desk&category=Electronics');
  assert.equal((await response.json()).length, 1);
  response = await request(`/items/${item._id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ location: 'Samarkand' }) });
  assert.equal((await response.json()).location, 'Samarkand');
  const form = new FormData();
  form.set('title', 'Lamp with photo'); form.set('category', 'Electronics');
  form.set('file', new Blob([Buffer.from([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' }), 'lamp.jpg');
  response = await request('/items', { method: 'POST', body: form });
  assert.equal(response.status, 201);
  assert.match((await response.json()).image, /^\/uploads\//);

  response = await request('/auth/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'Password123!' }) });
  assert.equal(response.status, 201);
  const registered = await response.json();
  assert.equal(registered.user.passwordHash, undefined);
  response = await request('/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }) });
  assert.equal(response.status, 200);
  const login = await response.json();
  response = await request(`/auth/users/${registered.user._id}`, { method: 'PUT', headers: { authorization: `Bearer ${login.token}`, 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Updated User' }) });
  assert.equal((await response.json()).user.name, 'Updated User');

  response = await request(`/items/${item._id}`, { method: 'DELETE' });
  assert.equal(response.status, 200);
  assert.equal(await db.collection('items').countDocuments({ _id: new ObjectId(item._id) }), 0);
});
