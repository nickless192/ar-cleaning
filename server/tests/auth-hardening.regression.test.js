const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const quoteRoutes = require('../routes/api/quoteRoutes');

function getRoute(pathname) {
  const layer = quoteRoutes.stack.find((entry) => entry.route?.path === pathname);
  assert.ok(layer, `Expected route ${pathname} to exist`);
  return layer.route;
}

function getMethodStack(pathname, method) {
  const route = getRoute(pathname);
  const methodLayers = route.stack.filter((entry) => entry.method === method.toLowerCase());
  assert.ok(methodLayers.length > 0, `Expected ${method.toUpperCase()} ${pathname} to exist`);
  return methodLayers.map((entry) => entry.name);
}

test('quote public submission routes stay public', () => {
  const postQuotes = getMethodStack('/', 'post');
  const postQuickQuote = getMethodStack('/quickquote', 'post');

  assert.deepEqual(postQuotes, ['createQuote']);
  assert.deepEqual(postQuickQuote, ['createQuoteRequest']);
});

test('quote admin management routes enforce limiter + auth + admin middleware', () => {
  const expectedAdminChain = ['<anonymous>', 'authMiddleware', 'requireAdminFlag'];

  assert.deepEqual(getMethodStack('/', 'get').slice(0, 3), expectedAdminChain);
  assert.deepEqual(getMethodStack('/quickquote', 'get').slice(0, 3), expectedAdminChain);
  assert.deepEqual(getMethodStack('/quickquote/unacknowledged', 'get').slice(0, 3), expectedAdminChain);
  assert.deepEqual(getMethodStack('/quickquote/:id/acknowledge', 'patch').slice(0, 3), expectedAdminChain);
  assert.deepEqual(getMethodStack('/quickquote/:quoteId', 'delete').slice(0, 3), expectedAdminChain);
  assert.deepEqual(getMethodStack('/:quoteId', 'get').slice(0, 3), expectedAdminChain);
  assert.deepEqual(getMethodStack('/:quoteId', 'put').slice(0, 3), expectedAdminChain);
  assert.deepEqual(getMethodStack('/:quoteId', 'delete').slice(0, 3), expectedAdminChain);
});

function readClientFile(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', '..', 'client', 'src', ...relativePath), 'utf8');
}

function expectAdminModuleUsesAuthFetch(filePath, endpoints) {
  const source = readClientFile(filePath);

  assert.match(source, /import\s+\{\s*authFetch\s*\}\s+from\s+['"]\/src\/utils\/authFetch['"]/);
  assert.doesNotMatch(source, /\bfetch\(/);

  for (const endpoint of endpoints) {
    assert.match(source, new RegExp(`authFetch\\(['"\`]${endpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  }
}

test('ExpenseDashboard protected endpoints go through authFetch', () => {
  expectAdminModuleUsesAuthFetch(
    ['components', 'Pages', 'Dashboards', 'ExpenseDashboard.jsx'],
    [
      '/api/expenses/ocr-receipt',
      '/api/expenses',
    ]
  );
});

test('InvoiceList protected endpoints go through authFetch', () => {
  expectAdminModuleUsesAuthFetch(
    ['components', 'Pages', 'Booking', 'InvoiceList.jsx'],
    ['/api/invoices']
  );
});

test('ManageCategories protected endpoints go through authFetch', () => {
  expectAdminModuleUsesAuthFetch(
    ['components', 'Pages', 'Management', 'ManageCategories.jsx'],
    ['/api/categories']
  );
});

test('public login and visitor tracking routes are excluded from global CSRF gate', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  assert.match(serverSource, /\/api\/users\/login/);
  assert.match(serverSource, /req\.path\.startsWith\('\/api\/visitors\/'\)/);
});
