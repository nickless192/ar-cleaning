// routes/notificationRoutes.js
const router = require('express').Router();
const { authMiddleware } = require('../../utils/auth');
const requireAdminFlag = require('../../middleware/requireAdminFlag');
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
const { adminRouteLimiter } = require('../../middleware/rateLimiters');

router.use(adminRouteLimiter);

router.use(authMiddleware);

/* ============================
   TEMPLATES (ADMIN ONLY)
============================ */

// GET /api/notifications/templates
router.get(
    '/templates',
    requireAdminFlag,
    getTemplates
);

// POST /api/notifications/templates
router.post(
    '/templates',
    requireAdminFlag,
    createTemplate
);

// PUT /api/notifications/templates/:id
router.put(
    '/templates/:id',
    requireAdminFlag,
    updateTemplate
);

// POST /api/notifications/templates/:id/test-send
router.post(
    '/templates/:id/test-send',
    requireAdminFlag,
    testSendTemplate
);

/* ============================
   USER SETTINGS (AUTH USER)
============================ */

// GET /api/notifications/settings/me
router.get(
    '/settings/me',
    getMyNotificationSettings
);

// PUT /api/notifications/settings/me
router.put(
    '/settings/me',
    updateMyNotificationSettings
);

/* ============================
   COMPANY DEFAULTS (ADMIN)
============================ */

// GET /api/notifications/company-defaults
router.get(
    '/company-defaults',
    requireAdminFlag,
    getCompanyNotificationDefaults
);

// PUT /api/notifications/company-defaults
router.put(
    '/company-defaults',
    requireAdminFlag,
    updateCompanyNotificationDefaults
);


module.exports = router;
