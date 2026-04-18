const router = require('express').Router();
const { getEvents, logEvent } = require('../../controllers/eventControllers');
const { adminRouteLimiter, authRouteLimiter } = require('../../middleware/rateLimiters');
const { authMiddleware } = require('../../utils/auth');
const requireAdminFlag = require('../../middleware/requireAdminFlag');

// POST /events
router.post('/', authRouteLimiter, logEvent); // Log a new event
// GET /events
router.get('/', adminRouteLimiter, authMiddleware, requireAdminFlag, getEvents); // Get all events

module.exports = router;
