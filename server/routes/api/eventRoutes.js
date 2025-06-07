const router = require('express').Router();
const { getEvents, logEvent } = require('../../controllers/eventControllers');

// POST /events
router.post('/', logEvent); // Log a new event
// GET /events
router.get('/', getEvents); // Get all events

module.exports = router;
