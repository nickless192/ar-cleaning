const router = require('express').Router();
const { authMiddleware } = require('../../utils/auth');
const requireAdminFlag = require('../../middleware/requireAdminFlag');
const { adminRouteLimiter } = require('../../middleware/rateLimiters');
const {
  getAdminTimeEntries,
  patchAdminTimeEntry,
  approveAdminTimeEntry,
  exportApprovedTimeEntries,
} = require('../../controllers/timeEntryController');

router.get('/time-entries', adminRouteLimiter, authMiddleware, requireAdminFlag, getAdminTimeEntries);
router.patch('/time-entries/:id', adminRouteLimiter, authMiddleware, requireAdminFlag, patchAdminTimeEntry);
router.post('/time-entries/:id/approve', adminRouteLimiter, authMiddleware, requireAdminFlag, approveAdminTimeEntry);
router.get('/time-entries/export', adminRouteLimiter, authMiddleware, requireAdminFlag, exportApprovedTimeEntries);

module.exports = router;
