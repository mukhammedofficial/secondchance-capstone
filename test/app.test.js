const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createApp } = require('../src/app');
const authRoutes = require('../src/routes/authRoutes');
const searchRoutes = require('../src/routes/searchRoutes');
const { items } = require('../scripts/seed');

function responseRecorder() {
  return {
    code: 200,
    body: undefined,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; }
  };
}
function handlerFor(router, method, routePath) {
  const layer = router.stack.find(entry => entry.route?.path === routePath && entry.route.methods[method]);
  assert.ok(layer, `missing ${method.toUpperCase()} ${routePath}`);
  return layer.route.stack.at(-1).handle;
}

test('health route handler returns service status', () => {
  const app = createApp();
  const layer = app._router.stack.find(entry => entry.route?.path === '/health');
  const res = responseRecorder();
  layer.route.stack[0].handle({}, res);
  assert.deepEqual(res.body, { status: 'ok' });
});

test('registration rejects missing data without database access', async () => {
  const res = responseRecorder();
  await handlerFor(authRoutes, 'post', '/register')({ body: { email: 'x@example.com', password: 'short' } }, res, error => { throw error; });
  assert.equal(res.code, 400);
  assert.match(res.body.error, /required/);
});

test('profile update requires a bearer token', async () => {
  const res = responseRecorder();
  const req = { get: () => '', params: {}, body: {} };
  await handlerFor(authRoutes, 'put', '/users/:id')(req, res, error => { throw error; });
  assert.equal(res.code, 401);
});

test('search rejects an empty query without database access', async () => {
  const res = responseRecorder();
  await searchRoutes.handle({ query: {} }, res, error => { throw error; });
  assert.equal(res.code, 400);
  assert.match(res.body.error, /search/);
});

test('seed defines exactly 16 usable sample items', () => {
  assert.equal(items.length, 16);
  for (const item of items) assert.ok(item.title && item.description && item.category);
});

test('landing page includes the project identity and Get Started call to action', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
  assert.match(html, /SecondChance/);
  assert.match(html, /Get Started/);
  assert.match(html, /Good things deserve a second chance/);
});
