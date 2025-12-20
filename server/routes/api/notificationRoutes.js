// routes/notificationRoutes.js
const router = require('express').Router();
const {
    getTemplates,
    createTemplate,
    updateTemplate,
    testSendTemplate,
    getMyNotificationSettings,
    updateMyNotificationSettings,
    getCompanyNotificationDefaults,
    updateCompanyNotificationDefaults,
} = require('../../controllers/notificationController');

// TODO: replace with your real auth middlewares
// const authMiddleware = require('../middleware/authMiddleware');
// const adminMiddleware = require('../middleware/adminMiddleware');

/* ============================
   TEMPLATES (ADMIN ONLY)
============================ */

// GET /api/notifications/templates
router.get(
    '/templates',
    // authMiddleware,
    // adminMiddleware,
    getTemplates
);

// POST /api/notifications/templates
router.post(
    '/templates',
    // authMiddleware,
    // adminMiddleware,
    createTemplate
);

// PUT /api/notifications/templates/:id
router.put(
    '/templates/:id',
    // authMiddleware,
    // adminMiddleware,
    updateTemplate
);

// POST /api/notifications/templates/:id/test-send
router.post(
    '/templates/:id/test-send',
    // authMiddleware,
    // adminMiddleware,
    testSendTemplate
);

/* ============================
   USER SETTINGS (AUTH USER)
============================ */

// GET /api/notifications/settings/me
router.get(
    '/settings/me',
    // authMiddleware,
    getMyNotificationSettings
);

// PUT /api/notifications/settings/me
router.put(
    '/settings/me',
    // authMiddleware,
    updateMyNotificationSettings
);

/* ============================
   COMPANY DEFAULTS (ADMIN)
============================ */

// GET /api/notifications/company-defaults
router.get(
    '/company-defaults',
    // authMiddleware,
    // adminMiddleware,
    getCompanyNotificationDefaults
);

// PUT /api/notifications/company-defaults
router.put(
    '/company-defaults',
    // authMiddleware,
    // adminMiddleware,
    updateCompanyNotificationDefaults
);


module.exports = router;
