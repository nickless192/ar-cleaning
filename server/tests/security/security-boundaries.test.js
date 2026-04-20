const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const express = require('express');

function loadWithMocks(targetModulePath, mocks) {
  const resolvedTarget = require.resolve(targetModulePath);
  const priorEntries = new Map();

  for (const [modulePath, mockExports] of Object.entries(mocks)) {
    const resolvedMockTarget = require.resolve(modulePath);
    priorEntries.set(resolvedMockTarget, require.cache[resolvedMockTarget]);
    require.cache[resolvedMockTarget] = {
      id: resolvedMockTarget,
      filename: resolvedMockTarget,
      loaded: true,
      exports: mockExports,
    };
  }

  delete require.cache[resolvedTarget];
  const loadedModule = require(resolvedTarget);

  delete require.cache[resolvedTarget];
  for (const [resolvedMockTarget, priorEntry] of priorEntries.entries()) {
    if (priorEntry) {
      require.cache[resolvedMockTarget] = priorEntry;
    } else {
      delete require.cache[resolvedMockTarget];
    }
  }

  return loadedModule;
}

function parseUserHeader(req) {
  const encodedUser = req.headers['x-test-user'];
  if (!encodedUser) return null;

  try {
    return JSON.parse(encodedUser);
  } catch {
    return null;
  }
}

function buildAuthStub() {
  return {
    authMiddleware(req, _res, next) {
      const parsed = parseUserHeader(req);
      if (parsed) {
        req.user = parsed;
      }
      next();
    },
  };
}

function buildRateLimiterStub() {
  return {
    adminRouteLimiter(_req, _res, next) {
      next();
    },
    authRouteLimiter(_req, _res, next) {
      next();
    },
  };
}

function jsonHandler(payload = {}) {
  return (_req, res) => res.status(200).json(payload);
}

async function withServer(app, run) {
  const server = await new Promise((resolve) => {
    const started = app.listen(0, () => resolve(started));
  });

  try {
    await run(server);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

function buildUrl(server, pathname) {
  const address = server.address();
  return `http://127.0.0.1:${address.port}${pathname}`;
}

async function request(server, pathname, options = {}) {
  const response = await fetch(buildUrl(server, pathname), options);
  return response;
}

const root = path.resolve(__dirname, '../..');
const authPath = path.join(root, 'utils/auth.js');
const rateLimiterPath = path.join(root, 'middleware/rateLimiters.js');
const adminRoutesPath = path.join(root, 'routes/api/adminUserRoutes.js');
const adminControllerPath = path.join(root, 'controllers/adminUserController.js');
const userRoutesPath = path.join(root, 'routes/api/userRoutes.js');
const userControllerPath = path.join(root, 'controllers/userControllers.js');
const notificationRoutesPath = path.join(root, 'routes/api/notificationRoutes.js');
const notificationControllerPath = path.join(root, 'controllers/notificationController.js');
const expensesRoutesPath = path.join(root, 'routes/api/expensesRoutes.js');
const expensesControllerPath = path.join(root, 'controllers/expensesController.js');
const uploadPath = path.join(root, 'middleware/upload.js');
const mongoSafetyPath = path.join(root, 'utils/mongoSafety.js');
const userModelPath = path.join(root, 'models/User.js');

function createAppWithRoute(mountPath, router) {
  const app = express();
  app.use(express.json());
  app.use(mountPath, router);
  app.use((_req, res) => res.status(404).json({ message: 'Not Found' }));
  return app;
}

test('admin routes enforce unauthenticated/non-admin/admin boundaries', async () => {
  const router = loadWithMocks(adminRoutesPath, {
    [authPath]: buildAuthStub(),
    [rateLimiterPath]: buildRateLimiterStub(),
    [adminControllerPath]: {
      getUsers: jsonHandler({ ok: true }),
      getRoles: jsonHandler({ ok: true }),
      createUser: jsonHandler({ ok: true }),
      updateUser: jsonHandler({ ok: true }),
      deleteUser: jsonHandler({ ok: true }),
    },
  });

  const app = createAppWithRoute('/api/admin', router);

  await withServer(app, async (server) => {
    const unauth = await request(server, '/api/admin/users');
    assert.equal(unauth.status, 401);

    const nonAdmin = await request(server, '/api/admin/users', {
      headers: { 'x-test-user': JSON.stringify({ _id: 'u1', adminFlag: false }) },
    });
    assert.equal(nonAdmin.status, 403);

    const admin = await request(server, '/api/admin/users', {
      headers: { 'x-test-user': JSON.stringify({ _id: 'a1', adminFlag: true }) },
    });
    assert.equal(admin.status, 200);
  });
});

test('user route /:userId only permits self-or-admin reads', async () => {
  const router = loadWithMocks(userRoutesPath, {
    [authPath]: buildAuthStub(),
    [rateLimiterPath]: buildRateLimiterStub(),
    [userControllerPath]: {
      getUsers: jsonHandler({ ok: true }),
      createUser: jsonHandler({ ok: true }),
      getUserById: jsonHandler({ ok: true }),
      deleteUser: jsonHandler({ ok: true }),
      updateUser: jsonHandler({ ok: true }),
      login: jsonHandler({ ok: true }),
      migrateUsernamesToLowercase: jsonHandler({ ok: true }),
      resetPassword: jsonHandler({ ok: true }),
      getUserBookings: jsonHandler({ ok: true }),
      setUserConsent: jsonHandler({ ok: true }),
      logout: jsonHandler({ ok: true }),
      refreshToken: jsonHandler({ ok: true }),
    },
    [path.join(root, 'middleware/validateCsrfToken.js')]: (_req, _res, next) => next(),
  });

  const app = createAppWithRoute('/api/users', router);

  await withServer(app, async (server) => {
    const self = await request(server, '/api/users/u-1', {
      headers: { 'x-test-user': JSON.stringify({ _id: 'u-1', adminFlag: false }) },
    });
    assert.equal(self.status, 200);

    const otherUser = await request(server, '/api/users/u-2', {
      headers: { 'x-test-user': JSON.stringify({ _id: 'u-1', adminFlag: false }) },
    });
    assert.equal(otherUser.status, 403);

    const admin = await request(server, '/api/users/u-2', {
      headers: { 'x-test-user': JSON.stringify({ _id: 'admin-1', adminFlag: true }) },
    });
    assert.equal(admin.status, 200);
  });
});

test('non-admin updates are blocked from modifying adminFlag/roles/password', async () => {
  let findByIdCalled = false;

  const { updateUser } = loadWithMocks(userControllerPath, {
    [userModelPath]: {
      findById: async () => {
        findByIdCalled = true;
        return null;
      },
    },
    [mongoSafetyPath]: { isValidObjectId: () => true },
  });

  const req = {
    params: { userId: '507f1f77bcf86cd799439011' },
    body: { adminFlag: true, roles: ['admin'], password: 'new-password' },
    user: { _id: '507f1f77bcf86cd799439011', adminFlag: false },
  };

  const res = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };

  await updateUser(req, res);

  assert.equal(res.statusCode, 403);
  assert.match(res.payload.message, /Not authorized/i);
  assert.equal(findByIdCalled, false);
});

test('expense endpoints remain admin-only and unknown upload path is not routable', async () => {
  const router = loadWithMocks(expensesRoutesPath, {
    [authPath]: buildAuthStub(),
    [rateLimiterPath]: buildRateLimiterStub(),
    [expensesControllerPath]: {
      createExpense: jsonHandler({ ok: true }),
      getExpenses: jsonHandler({ ok: true }),
      deleteExpense: jsonHandler({ ok: true }),
      bulkInsert: jsonHandler({ ok: true }),
      ocrReceipt: jsonHandler({ ok: true }),
      parseBankStatementPDF: jsonHandler({ ok: true }),
      updateExpense: jsonHandler({ ok: true }),
      monthlySummary: jsonHandler({ ok: true }),
    },
    [uploadPath]: {
      single() {
        return (_req, _res, next) => next();
      },
    },
  });

  const app = createAppWithRoute('/api/expenses', router);

  await withServer(app, async (server) => {
    const unauth = await request(server, '/api/expenses');
    assert.equal(unauth.status, 401);

    const nonAdmin = await request(server, '/api/expenses', {
      headers: { 'x-test-user': JSON.stringify({ _id: 'u-1', adminFlag: false }) },
    });
    assert.equal(nonAdmin.status, 403);

    const admin = await request(server, '/api/expenses', {
      headers: { 'x-test-user': JSON.stringify({ _id: 'admin-1', adminFlag: true }) },
    });
    assert.equal(admin.status, 200);

    const invalidPath = await request(server, '/uploads/receipts/../../etc/passwd');
    assert.equal(invalidPath.status, 404);
  });
});

test('notification settings /settings/me requires authentication', async () => {
  const router = loadWithMocks(notificationRoutesPath, {
    [authPath]: buildAuthStub(),
    [rateLimiterPath]: buildRateLimiterStub(),
    [notificationControllerPath]: {
      getTemplates: jsonHandler({ ok: true }),
      createTemplate: jsonHandler({ ok: true }),
      updateTemplate: jsonHandler({ ok: true }),
      testSendTemplate: jsonHandler({ ok: true }),
      getMyNotificationSettings: jsonHandler({ ok: true }),
      updateMyNotificationSettings: jsonHandler({ ok: true }),
      getCompanyNotificationDefaults: jsonHandler({ ok: true }),
      updateCompanyNotificationDefaults: jsonHandler({ ok: true }),
    },
  });

  const app = createAppWithRoute('/api/notifications', router);

  await withServer(app, async (server) => {
    const unauth = await request(server, '/api/notifications/settings/me');
    assert.equal(unauth.status, 401);

    const authenticated = await request(server, '/api/notifications/settings/me', {
      headers: { 'x-test-user': JSON.stringify({ _id: 'u-1', adminFlag: false }) },
    });
    assert.equal(authenticated.status, 200);
  });
});
