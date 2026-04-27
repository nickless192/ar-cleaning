const router = require('express').Router();
const { authMiddleware } = require('../../utils/auth');
const { authRouteLimiter } = require('../../middleware/rateLimiters');
const { getEmployeeAppointments } = require('../../controllers/timeEntryController');

router.get('/appointments/today', authRouteLimiter, authMiddleware, getEmployeeAppointments);
router.get('/appointments', authRouteLimiter, authMiddleware, getEmployeeAppointments);

module.exports = router;
