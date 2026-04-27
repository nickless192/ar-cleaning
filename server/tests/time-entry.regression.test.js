const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const employeeRoutes = require('../routes/api/employeeRoutes');
const adminTimeEntryRoutes = require('../routes/api/timeEntryRoutes');
const { __testables } = require('../controllers/timeEntryController');

const bookingRoutesSource = fs.readFileSync(path.join(__dirname, '..', 'routes', 'api', 'bookingRoutes.js'), 'utf8');

function getRoute(router, pathname) {
  const layer = router.stack.find((entry) => entry.route?.path === pathname);
  assert.ok(layer, `Expected route ${pathname} to exist`);
  return layer.route;
}

function getMethodStack(router, pathname, method) {
  const route = getRoute(router, pathname);
  const methodLayers = route.stack.filter((entry) => entry.method === method.toLowerCase());
  assert.ok(methodLayers.length > 0, `Expected ${method.toUpperCase()} ${pathname} to exist`);
  return methodLayers.map((entry) => entry.name);
}

test('employee appointment routes exist and enforce auth middleware', () => {
  assert.deepEqual(getMethodStack(employeeRoutes, '/appointments/today', 'get').slice(0, 2), ['<anonymous>', 'authMiddleware']);
  assert.deepEqual(getMethodStack(employeeRoutes, '/appointments', 'get').slice(0, 2), ['<anonymous>', 'authMiddleware']);
});

test('booking check-in/check-out endpoints are registered on booking routes', () => {
  assert.match(bookingRoutesSource, /router\.post\('\/:id\/check-in',\s*authRouteLimiter,\s*authMiddleware,\s*checkIn\)/);
  assert.match(bookingRoutesSource, /router\.post\('\/:id\/check-out',\s*authRouteLimiter,\s*authMiddleware,\s*checkOut\)/);
});

test('admin time entry routes enforce limiter + auth + admin middleware', () => {
  const expected = ['<anonymous>', 'authMiddleware', 'requireAdminFlag'];
  assert.deepEqual(getMethodStack(adminTimeEntryRoutes, '/time-entries', 'get').slice(0, 3), expected);
  assert.deepEqual(getMethodStack(adminTimeEntryRoutes, '/time-entries/:id', 'patch').slice(0, 3), expected);
  assert.deepEqual(getMethodStack(adminTimeEntryRoutes, '/time-entries/:id/approve', 'post').slice(0, 3), expected);
  assert.deepEqual(getMethodStack(adminTimeEntryRoutes, '/time-entries/export', 'get').slice(0, 3), expected);
});

test('duplicate check-in prevention helper statuses and duration flags behave as expected', () => {
  assert.equal(__testables.getEntryStatus(null), 'not_started');
  assert.equal(__testables.getEntryStatus({ checkInAt: new Date(), checkOutAt: null, status: 'checked_in', needsReview: false }), 'checked_in');
  assert.equal(__testables.getEntryStatus({ checkInAt: new Date(), checkOutAt: new Date(), status: 'checked_out', needsReview: false }), 'checked_out');
  assert.equal(__testables.getEntryStatus({ checkInAt: new Date(), checkOutAt: new Date(), status: 'adjusted', needsReview: false }), 'needs_review');

  assert.equal(__testables.calculateTotalMinutes('2026-04-01T10:00:00.000Z', '2026-04-01T11:30:00.000Z'), 90);
  assert.equal(__testables.shouldFlagForReview(5), true);
  assert.equal(__testables.shouldFlagForReview(60), false);
  assert.equal(__testables.shouldFlagForReview(800), true);
});

test('toronto formatter provides explicit ET output', () => {
  const formatted = __testables.formatToronto('2026-01-15T15:00:00.000Z');
  assert.match(formatted, /ET$/);
  assert.match(formatted, /^2026-01-15/);
});
