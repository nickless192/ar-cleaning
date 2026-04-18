const router = require('express').Router();
const { getEvents, logEvent } = require('../../controllers/eventControllers');
const { adminRouteLimiter, authRouteLimiter } = require('../../middleware/rateLimiters');

// POST /events
router.post('/', authRouteLimiter, logEvent); // Log a new event
// GET /events
router.get('/', adminRouteLimiter, getEvents); // Get all events

module.exports = router;
