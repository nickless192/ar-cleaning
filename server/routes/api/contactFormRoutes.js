const router = require('express').Router();
const { createNewFrom, getForms, updateFormStatus, archiveForm } = require('../../controllers/contactFormController');
const { authRouteLimiter, adminRouteLimiter } = require('../../middleware/rateLimiters');
const { authMiddleware } = require('../../utils/auth');
const requireAdminFlag = require('../../middleware/requireAdminFlag');

router.post('/', authRouteLimiter, createNewFrom);

router.get('/', adminRouteLimiter, authMiddleware, requireAdminFlag, getForms);


router.patch('/:id/status', adminRouteLimiter, authMiddleware, requireAdminFlag, updateFormStatus);

router.patch('/:id/archive', adminRouteLimiter, authMiddleware, requireAdminFlag, archiveForm);

module.exports = router;
